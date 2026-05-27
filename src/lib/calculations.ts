import type {
  Accommodation,
  AccommodationFilters,
  GroupDecision,
  SortOption,
  TripState,
  Vote,
  VoteStats,
} from "@/lib/types";

export function pricePerPerson(accommodation: Accommodation) {
  if (!accommodation.totalPrice || !accommodation.guests) return null;
  return accommodation.totalPrice / accommodation.guests;
}

export function pricePerPersonPerNight(accommodation: Accommodation) {
  if (!accommodation.totalPrice || !accommodation.guests || !accommodation.nights) {
    return null;
  }

  return accommodation.totalPrice / accommodation.guests / accommodation.nights;
}

export function getVoteFor(
  votes: Vote[],
  accommodationId: string,
  voterId: string,
) {
  return votes.find(
    (vote) =>
      vote.accommodationId === accommodationId && vote.voterId === voterId,
  );
}

export function getVoteStats(
  accommodationId: string,
  state: Pick<TripState, "voters" | "votes">,
): VoteStats {
  const activeVoterIds = new Set(
    state.voters.filter((voter) => voter.active).map((voter) => voter.id),
  );
  const activeVoters = activeVoterIds.size;
  const votes = state.votes.filter(
    (vote) =>
      vote.accommodationId === accommodationId &&
      activeVoterIds.has(vote.voterId),
  );

  const yes = votes.filter((vote) => vote.vote === "yes").length;
  const maybe = votes.filter((vote) => vote.vote === "maybe").length;
  const no = votes.filter((vote) => vote.vote === "no").length;
  const approvalRate = activeVoters === 0 ? 0 : yes / activeVoters;

  return {
    activeVoters,
    yes,
    maybe,
    no,
    approvalRate,
    decision: getGroupDecision({ activeVoters, yes, maybe, no }),
  };
}

export function getGroupDecision({
  activeVoters,
  yes,
  maybe,
  no,
}: {
  activeVoters: number;
  yes: number;
  maybe: number;
  no: number;
}): GroupDecision {
  if (activeVoters === 0) return "Set voters";
  if (yes / activeVoters >= 0.7) return "🔥 Group favorite";
  if (no / activeVoters >= 0.4) return "❌ Probably out";
  if (maybe / activeVoters >= 0.4) return "🤔 Discuss";
  return "🔍 Open";
}

export function getRankingScore(accommodation: Accommodation, stats: VoteStats) {
  const priceNight = pricePerPersonPerNight(accommodation);
  const score = accommodation.overallScore ?? 0;
  const airportDistance = accommodation.airportDistanceKm;

  const decisionWeight: Record<GroupDecision, number> = {
    "🔥 Group favorite": 80,
    "🤔 Discuss": 35,
    "🔍 Open": 20,
    "Set voters": 0,
    "❌ Probably out": -60,
  };

  const statusWeight: Record<Accommodation["status"], number> = {
    Favorite: 35,
    Locations: 25,
    Review: 10,
    New: 0,
    Out: -80,
  };

  // Simple, transparent ranking: group sentiment matters most, then quality,
  // then value, airport convenience, and flight cost. Missing travel data does
  // not punish as harshly as a negative group decision because early listings
  // are often incomplete while people are still collecting options.
  const priceValue = priceNight ? Math.max(0, 45 - priceNight / 3) : 8;
  const airportValue =
    airportDistance !== null ? Math.max(0, 30 - airportDistance / 4) : 8;
  const flightValue =
    accommodation.flightPrice !== null
      ? Math.max(0, 28 - accommodation.flightPrice / 20)
      : 8;

  return (
    decisionWeight[stats.decision] +
    statusWeight[accommodation.status] +
    stats.approvalRate * 100 +
    score * 6 +
    priceValue +
    airportValue +
    flightValue
  );
}

export function filterAccommodations(
  accommodations: Accommodation[],
  state: Pick<TripState, "voters" | "votes">,
  filters: AccommodationFilters,
) {
  return accommodations.filter((accommodation) => {
    const priceNight = pricePerPersonPerNight(accommodation);
    const stats = getVoteStats(accommodation.id, state);
    const maxPrice = Number(filters.maxPricePerPersonNight);
    const maxAirportDistance = Number(filters.maxAirportDistanceKm);

    if (filters.pool && !accommodation.pool) return false;
    if (filters.seaAccess && !accommodation.seaAccess) return false;
    if (filters.directlyBySea && !accommodation.directlyBySea) return false;
    if (filters.gardenTerrace && !accommodation.gardenTerrace) return false;
    if (filters.parking && !accommodation.parking) return false;
    if (filters.airConditioning && !accommodation.airConditioning) return false;
    if (
      filters.maxPricePerPersonNight &&
      priceNight !== null &&
      priceNight > maxPrice
    ) {
      return false;
    }
    if (
      filters.maxAirportDistanceKm &&
      accommodation.airportDistanceKm !== null &&
      accommodation.airportDistanceKm > maxAirportDistance
    ) {
      return false;
    }
    if (
      filters.countryRegion &&
      !accommodation.countryRegion
        .toLowerCase()
        .includes(filters.countryRegion.toLowerCase())
    ) {
      return false;
    }
    if (filters.status !== "All" && accommodation.status !== filters.status) {
      return false;
    }
    if (
      filters.groupDecision !== "All" &&
      stats.decision !== filters.groupDecision
    ) {
      return false;
    }

    return true;
  });
}

export function sortAccommodations(
  accommodations: Accommodation[],
  state: Pick<TripState, "voters" | "votes">,
  sort: SortOption,
) {
  const next = [...accommodations];

  next.sort((a, b) => {
    if (sort === "priceAsc") {
      return nullableAsc(pricePerPersonPerNight(a), pricePerPersonPerNight(b));
    }
    if (sort === "approvalDesc") {
      return (
        getVoteStats(b.id, state).approvalRate -
        getVoteStats(a.id, state).approvalRate
      );
    }
    if (sort === "scoreDesc") {
      return nullableDesc(a.overallScore, b.overallScore);
    }
    if (sort === "airportAsc") {
      return nullableAsc(a.airportDistanceKm, b.airportDistanceKm);
    }
    if (sort === "flightPriceAsc") {
      return nullableAsc(a.flightPrice, b.flightPrice);
    }
    return nullableAsc(a.totalPrice, b.totalPrice);
  });

  return next;
}

export function rankedAccommodations(state: TripState) {
  return [...state.accommodations].sort((a, b) => {
    const aStats = getVoteStats(a.id, state);
    const bStats = getVoteStats(b.id, state);
    return getRankingScore(b, bStats) - getRankingScore(a, aStats);
  });
}

function nullableAsc(a: number | null, b: number | null) {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return a - b;
}

function nullableDesc(a: number | null, b: number | null) {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return b - a;
}
