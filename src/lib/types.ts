export type Status = "New" | "Review" | "Locations" | "Favorite" | "Out";

export type AvailabilityStatus = "available" | "unavailable" | "unknown";

export type ReservationCostStatus = "free" | "paid" | "unknown";

export type VoteValue = "yes" | "maybe" | "no";

export type GroupDecision =
  | "Set voters"
  | "🔥 Group favorite"
  | "❌ Probably out"
  | "🤔 Discuss"
  | "🔍 Open";

export type Accommodation = {
  id: string;
  name: string;
  location: string;
  countryRegion: string;
  airbnbUrl: string;
  mapsUrl: string;
  imageUrl: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  totalPrice: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  beds: number | null;
  maxGuests: number | null;
  pool: boolean;
  seaAccess: boolean;
  directlyBySea: boolean;
  gardenTerrace: boolean;
  parking: boolean;
  airConditioning: boolean;
  kitchen: boolean;
  washingMachine: boolean;
  nearestAirport: string;
  airportDistanceKm: number | null;
  airportDriveTime: string;
  flightOrigin: string;
  flightDestinationAirport: string;
  flightDuration: string;
  flightPrice: number | null;
  cheapestNearbyOrigin: string;
  flightNotes: string;
  availabilityStatus: AvailabilityStatus;
  lastAvailabilityCheckAt: string | null;
  reservationCostStatus: ReservationCostStatus;
  airbnbRating: number | null;
  reviewCount: number | null;
  pros: string;
  cons: string;
  overallScore: number | null;
  status: Status;
  shortVerdict: string;
  notes: string;
};

export type Voter = {
  id: string;
  name: string;
  active: boolean;
};

export type Vote = {
  id: string;
  accommodationId: string;
  voterId: string;
  vote: VoteValue;
  comment: string;
  updatedAt: string;
};

export type TripDetails = {
  guests: number;
  checkIn: string;
  checkOut: string;
  destination: string;
  origins: string;
  coverImageUrl: string;
};

export type TripState = {
  accommodations: Accommodation[];
  voters: Voter[];
  votes: Vote[];
  updatedAt: string;
  tripDetails?: TripDetails;
};

export type VoteStats = {
  activeVoters: number;
  yes: number;
  maybe: number;
  no: number;
  approvalRate: number;
  decision: GroupDecision;
};

export type SortOption =
  | "priceAsc"
  | "approvalDesc"
  | "scoreDesc"
  | "airportAsc"
  | "totalPriceAsc"
  | "flightPriceAsc";

export type AccommodationFilters = {
  pool: boolean;
  seaAccess: boolean;
  directlyBySea: boolean;
  gardenTerrace: boolean;
  parking: boolean;
  airConditioning: boolean;
  maxPricePerPersonNight: string;
  maxAirportDistanceKm: string;
  countryRegion: string;
  status: "All" | Status;
  groupDecision: "All" | GroupDecision;
};
