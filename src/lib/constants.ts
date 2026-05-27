import type {
  AvailabilityStatus,
  GroupDecision,
  ReservationCostStatus,
  SortOption,
  Status,
  VoteValue,
} from "@/lib/types";

export const STATUSES: Status[] = [
  "New",
  "Review",
  "Locations",
  "Favorite",
  "Out",
];

export const VOTE_LABELS: Record<VoteValue, string> = {
  yes: "❤️ Yes",
  maybe: "🤔 Maybe",
  no: "❌ No",
};

export const VOTE_VALUES: VoteValue[] = ["yes", "maybe", "no"];

export const AVAILABILITY_OPTIONS: {
  value: AvailabilityStatus;
  label: string;
}[] = [
  { value: "unknown", label: "Nicht geprüft" },
  { value: "available", label: "Verfügbar" },
  { value: "unavailable", label: "Nicht verfügbar" },
];

export const RESERVATION_OPTIONS: {
  value: ReservationCostStatus;
  label: string;
}[] = [
  { value: "unknown", label: "Nicht geprüft" },
  { value: "free", label: "Kostenlos reservieren" },
  { value: "paid", label: "Reservierung kostet Geld" },
];

export const GROUP_DECISIONS: GroupDecision[] = [
  "Set voters",
  "🔥 Group favorite",
  "❌ Probably out",
  "🤔 Discuss",
  "🔍 Open",
];

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "priceAsc", label: "Price per night" },
  { value: "approvalDesc", label: "Approval" },
  { value: "scoreDesc", label: "Score" },
  { value: "airportAsc", label: "Airport distance" },
  { value: "totalPriceAsc", label: "Total price" },
  { value: "flightPriceAsc", label: "Flight price" },
];

export const MAX_VOTERS = 10;

export const TRIP_DETAILS = {
  guests: 6,
  checkIn: "2026-08-24",
  checkOut: "2026-08-30",
  nights: 6,
  destination: "quiet beach locations",
  origins: "Düsseldorf, Köln or nearby",
};
