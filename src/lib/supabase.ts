import type {
  Accommodation,
  TripDetails,
  TripState,
  Vote,
  Voter,
} from "@/lib/types";

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
};

type AccommodationRow = {
  id: string;
  name: string;
  location: string;
  country_region: string;
  airbnb_url: string;
  maps_url: string;
  image_url: string;
  check_in: string;
  check_out: string;
  nights: number;
  guests: number;
  total_price: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  beds: number | null;
  max_guests: number | null;
  pool: boolean;
  sea_access: boolean;
  directly_by_sea: boolean;
  garden_terrace: boolean;
  parking: boolean;
  air_conditioning: boolean;
  kitchen: boolean;
  washing_machine: boolean;
  nearest_airport: string;
  airport_distance_km: number | null;
  airport_drive_time: string;
  flight_origin: string;
  flight_destination_airport: string;
  flight_duration: string;
  flight_price: number | null;
  cheapest_nearby_origin: string;
  flight_notes: string;
  availability_status: Accommodation["availabilityStatus"];
  last_availability_check_at: string | null;
  reservation_cost_status: Accommodation["reservationCostStatus"];
  airbnb_rating: number | null;
  review_count: number | null;
  pros: string;
  cons: string;
  overall_score: number | null;
  status: Accommodation["status"];
  short_verdict: string;
  notes: string;
};

type VoterRow = {
  id: string;
  name: string;
  active: boolean;
};

type VoteRow = {
  id: string;
  accommodation_id: string;
  voter_id: string;
  vote: Vote["vote"];
  comment: string;
  updated_at: string;
};

type TripSettingsRow = {
  id: "main";
  guests: number;
  check_in: string;
  check_out: string;
  destination: string;
  origins: string;
  cover_image_url: string;
};

export async function loadSupabaseState(): Promise<TripState | null> {
  if (!isSupabaseConfigured()) return null;

  const [accommodations, voters, votes, tripSettings] = await Promise.all([
    supabaseRequest<AccommodationRow[]>("/accommodations?select=*"),
    supabaseRequest<VoterRow[]>("/voters?select=*"),
    supabaseRequest<VoteRow[]>("/votes?select=*"),
    supabaseRequest<TripSettingsRow[]>("/trip_settings?select=*&id=eq.main"),
  ]);

  const isEmpty =
    accommodations.length === 0 &&
    voters.length === 0 &&
    votes.length === 0 &&
    tripSettings.length === 0;

  if (isEmpty) return null;

  return {
    accommodations: accommodations.map(fromAccommodationRow),
    voters: voters.map(fromVoterRow),
    votes: votes.map(fromVoteRow),
    tripDetails: tripSettings[0]
      ? fromTripSettingsRow(tripSettings[0])
      : undefined,
    updatedAt: new Date().toISOString(),
  };
}

export async function seedSupabaseState(state: TripState) {
  if (!isSupabaseConfigured()) return;
  await Promise.all([
    upsertRows("accommodations", state.accommodations.map(toAccommodationRow)),
    upsertRows("voters", state.voters.map(toVoterRow)),
    upsertRows("votes", state.votes.map(toVoteRow)),
    state.tripDetails
      ? upsertRows("trip_settings", [toTripSettingsRow(state.tripDetails)])
      : Promise.resolve(),
  ]);
}

export async function upsertSupabaseAccommodation(accommodation: Accommodation) {
  await upsertRows("accommodations", [toAccommodationRow(accommodation)]);
}

export async function deleteSupabaseAccommodation(id: string) {
  await supabaseRequest(`/accommodations?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function upsertSupabaseVoter(voter: Voter) {
  await upsertRows("voters", [toVoterRow(voter)]);
}

export async function deleteSupabaseVoter(id: string) {
  await supabaseRequest(`/voters?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function upsertSupabaseVote(vote: Vote) {
  await upsertRows("votes", [toVoteRow(vote)]);
}

export async function deleteSupabaseVote(accommodationId: string, voterId: string) {
  await supabaseRequest(
    `/votes?accommodation_id=eq.${encodeURIComponent(
      accommodationId,
    )}&voter_id=eq.${encodeURIComponent(voterId)}`,
    { method: "DELETE" },
  );
}

export async function upsertSupabaseTripDetails(tripDetails: TripDetails) {
  await upsertRows("trip_settings", [toTripSettingsRow(tripDetails)]);
}

async function upsertRows(table: string, rows: object[]) {
  if (!rows.length) return;
  await supabaseRequest(`/${table}`, {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(rows),
  });
}

async function supabaseRequest<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const response = await fetch(`${supabaseConfig.url}/rest/v1${path}`, {
    ...init,
    headers: {
      apikey: supabaseConfig.anonKey,
      Authorization: `Bearer ${supabaseConfig.anonKey}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Supabase request failed: ${message || response.status}`);
  }

  if (response.status === 204) return null as T;
  const text = await response.text();
  return text ? (JSON.parse(text) as T) : (null as T);
}

function toAccommodationRow(accommodation: Accommodation): AccommodationRow {
  return {
    id: accommodation.id,
    name: accommodation.name,
    location: accommodation.location,
    country_region: accommodation.countryRegion,
    airbnb_url: accommodation.airbnbUrl,
    maps_url: accommodation.mapsUrl,
    image_url: accommodation.imageUrl,
    check_in: accommodation.checkIn,
    check_out: accommodation.checkOut,
    nights: accommodation.nights,
    guests: accommodation.guests,
    total_price: accommodation.totalPrice,
    bedrooms: accommodation.bedrooms,
    bathrooms: accommodation.bathrooms,
    beds: accommodation.beds,
    max_guests: accommodation.maxGuests,
    pool: accommodation.pool,
    sea_access: accommodation.seaAccess,
    directly_by_sea: accommodation.directlyBySea,
    garden_terrace: accommodation.gardenTerrace,
    parking: accommodation.parking,
    air_conditioning: accommodation.airConditioning,
    kitchen: accommodation.kitchen,
    washing_machine: accommodation.washingMachine,
    nearest_airport: accommodation.nearestAirport,
    airport_distance_km: accommodation.airportDistanceKm,
    airport_drive_time: accommodation.airportDriveTime,
    flight_origin: accommodation.flightOrigin,
    flight_destination_airport: accommodation.flightDestinationAirport,
    flight_duration: accommodation.flightDuration,
    flight_price: accommodation.flightPrice,
    cheapest_nearby_origin: accommodation.cheapestNearbyOrigin,
    flight_notes: accommodation.flightNotes,
    availability_status: accommodation.availabilityStatus,
    last_availability_check_at: accommodation.lastAvailabilityCheckAt,
    reservation_cost_status: accommodation.reservationCostStatus,
    airbnb_rating: accommodation.airbnbRating,
    review_count: accommodation.reviewCount,
    pros: accommodation.pros,
    cons: accommodation.cons,
    overall_score: accommodation.overallScore,
    status: accommodation.status,
    short_verdict: accommodation.shortVerdict,
    notes: accommodation.notes,
  };
}

function fromAccommodationRow(row: AccommodationRow): Accommodation {
  return {
    id: row.id,
    name: row.name,
    location: row.location ?? "",
    countryRegion: row.country_region ?? "",
    airbnbUrl: row.airbnb_url ?? "",
    mapsUrl: row.maps_url ?? "",
    imageUrl: row.image_url ?? "",
    checkIn: row.check_in,
    checkOut: row.check_out,
    nights: numberValue(row.nights, 6),
    guests: numberValue(row.guests, 6),
    totalPrice: nullableNumber(row.total_price),
    bedrooms: nullableNumber(row.bedrooms),
    bathrooms: nullableNumber(row.bathrooms),
    beds: nullableNumber(row.beds),
    maxGuests: nullableNumber(row.max_guests),
    pool: Boolean(row.pool),
    seaAccess: Boolean(row.sea_access),
    directlyBySea: Boolean(row.directly_by_sea),
    gardenTerrace: Boolean(row.garden_terrace),
    parking: Boolean(row.parking),
    airConditioning: Boolean(row.air_conditioning),
    kitchen: Boolean(row.kitchen),
    washingMachine: Boolean(row.washing_machine),
    nearestAirport: row.nearest_airport ?? "",
    airportDistanceKm: nullableNumber(row.airport_distance_km),
    airportDriveTime: row.airport_drive_time ?? "",
    flightOrigin: row.flight_origin ?? "",
    flightDestinationAirport: row.flight_destination_airport ?? "",
    flightDuration: row.flight_duration ?? "",
    flightPrice: nullableNumber(row.flight_price),
    cheapestNearbyOrigin: row.cheapest_nearby_origin ?? "",
    flightNotes: row.flight_notes ?? "",
    availabilityStatus: row.availability_status ?? "unknown",
    lastAvailabilityCheckAt: row.last_availability_check_at ?? null,
    reservationCostStatus: row.reservation_cost_status ?? "unknown",
    airbnbRating: nullableNumber(row.airbnb_rating),
    reviewCount: nullableNumber(row.review_count),
    pros: row.pros ?? "",
    cons: row.cons ?? "",
    overallScore: nullableNumber(row.overall_score),
    status: row.status ?? "New",
    shortVerdict: row.short_verdict ?? "",
    notes: row.notes ?? "",
  };
}

function toVoterRow(voter: Voter): VoterRow {
  return {
    id: voter.id,
    name: voter.name,
    active: voter.active,
  };
}

function fromVoterRow(row: VoterRow): Voter {
  return {
    id: row.id,
    name: row.name,
    active: row.active,
  };
}

function toVoteRow(vote: Vote): VoteRow {
  return {
    id: vote.id,
    accommodation_id: vote.accommodationId,
    voter_id: vote.voterId,
    vote: vote.vote,
    comment: vote.comment,
    updated_at: vote.updatedAt,
  };
}

function fromVoteRow(row: VoteRow): Vote {
  return {
    id: row.id,
    accommodationId: row.accommodation_id,
    voterId: row.voter_id,
    vote: row.vote,
    comment: row.comment ?? "",
    updatedAt: row.updated_at,
  };
}

function toTripSettingsRow(tripDetails: TripDetails): TripSettingsRow {
  return {
    id: "main",
    guests: tripDetails.guests,
    check_in: tripDetails.checkIn,
    check_out: tripDetails.checkOut,
    destination: tripDetails.destination,
    origins: tripDetails.origins,
    cover_image_url: tripDetails.coverImageUrl,
  };
}

function fromTripSettingsRow(row: TripSettingsRow): TripDetails {
  return {
    guests: row.guests,
    checkIn: row.check_in,
    checkOut: row.check_out,
    destination: row.destination,
    origins: row.origins,
    coverImageUrl: row.cover_image_url,
  };
}

function nullableNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function numberValue(value: number | string | null | undefined, fallback: number) {
  return nullableNumber(value) ?? fallback;
}
