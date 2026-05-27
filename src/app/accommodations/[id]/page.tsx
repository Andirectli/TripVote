"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Bath,
  BedDouble,
  CarFront,
  ExternalLink,
  Home,
  Map,
  Pencil,
  Plane,
  Trash2,
  UsersRound,
} from "lucide-react";
import {
  AmenityBadge,
  AvailabilityBadge,
  DecisionBadge,
  ReservationBadge,
  ScorePill,
  StatusBadge,
} from "@/components/badges";
import { VotePanel } from "@/components/vote-panel";
import {
  getVoteStats,
  pricePerPerson,
  pricePerPersonPerNight,
} from "@/lib/calculations";
import {
  formatCurrency,
  formatCurrencyShort,
  formatDateTime,
  formatNumber,
  formatPercent,
} from "@/lib/format";
import { useTripStore } from "@/lib/store";

export default function AccommodationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { state, deleteAccommodation } = useTripStore();
  const accommodation = state.accommodations.find((item) => item.id === params.id);

  if (!accommodation) {
    return (
      <div className="rounded-lg border border-white bg-white p-8 text-center shadow-sm">
        <p className="text-lg font-black text-slate-950">Accommodation not found.</p>
        <Link href="/" className="mt-4 inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white">
          Back to locations
        </Link>
      </div>
    );
  }

  const stats = getVoteStats(accommodation.id, state);

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-lg border border-white bg-white shadow-sm">
        <div className="relative min-h-[22rem]">
          <img
            src={accommodation.imageUrl}
            alt={accommodation.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-8">
            <div className="mb-3 flex flex-wrap gap-2">
              <AvailabilityBadge status={accommodation.availabilityStatus} />
              <ReservationBadge status={accommodation.reservationCostStatus} />
              <StatusBadge status={accommodation.status} />
              <DecisionBadge decision={stats.decision} />
              <ScorePill score={accommodation.overallScore} />
            </div>
            <h1 className="max-w-4xl text-3xl font-black tracking-tight sm:text-5xl">
              {accommodation.name}
            </h1>
            <p className="mt-2 text-base font-bold text-white/85">
              {accommodation.location || "Add location"}
              {accommodation.countryRegion
                ? `, ${accommodation.countryRegion}`
                : ""}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 p-4 sm:p-5">
          <div className="flex min-h-10 flex-wrap items-center gap-2 rounded-full border border-slate-200 px-4 text-sm font-black text-slate-700">
            <AvailabilityBadge status={accommodation.availabilityStatus} />
            <ReservationBadge status={accommodation.reservationCostStatus} />
            <span className="text-slate-500">
              Zuletzt geprüft:{" "}
              {formatDateTime(accommodation.lastAvailabilityCheckAt)}
            </span>
          </div>
          <ActionLink href={accommodation.airbnbUrl} label="Airbnb" icon={<ExternalLink className="h-4 w-4" />} />
          <ActionLink href={accommodation.mapsUrl} label="Maps" icon={<Map className="h-4 w-4" />} />
          <Link
            href={`/accommodations/${accommodation.id}/edit`}
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-200 px-4 text-sm font-black text-slate-700 hover:border-teal-200 hover:text-teal-800"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Delete this accommodation?")) {
                deleteAccommodation(accommodation.id);
                router.push("/");
              }
            }}
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-rose-200 px-4 text-sm font-black text-rose-700 hover:bg-rose-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <DetailSection title="Price">
            <Metric label="Total price" value={formatCurrency(accommodation.totalPrice)} />
            <Metric label="Per person" value={formatCurrencyShort(pricePerPerson(accommodation))} />
            <Metric label="Per person / night" value={formatCurrencyShort(pricePerPersonPerNight(accommodation))} />
            <Metric label="Guests" value={String(accommodation.guests)} />
            <Metric label="Nights" value={String(accommodation.nights)} />
          </DetailSection>

          <DetailSection title="Airport">
            <Metric label="Nearest airport" value={accommodation.nearestAirport || "—"} icon={<CarFront className="h-4 w-4" />} />
            <Metric label="Distance" value={formatNumber(accommodation.airportDistanceKm, " km")} />
            <Metric label="Driving time" value={accommodation.airportDriveTime || "—"} />
          </DetailSection>

          <DetailSection title="Flights">
            <Metric label="Start airport" value={accommodation.flightOrigin || "Düsseldorf / Köln"} icon={<Plane className="h-4 w-4" />} />
            <Metric label="Destination airport" value={accommodation.flightDestinationAirport || "—"} />
            <Metric label="Flight time" value={accommodation.flightDuration || "—"} />
            <Metric label="Flight price from" value={formatCurrency(accommodation.flightPrice)} />
            <Metric label="Cheapest nearby origin" value={accommodation.cheapestNearbyOrigin || "—"} />
            <LongText label="Flight notes" value={accommodation.flightNotes || ""} />
          </DetailSection>

          <DetailSection title="Accommodation">
            <Metric label="Bedrooms" value={formatNumber(accommodation.bedrooms)} icon={<BedDouble className="h-4 w-4" />} />
            <Metric label="Bathrooms" value={formatNumber(accommodation.bathrooms)} icon={<Bath className="h-4 w-4" />} />
            <Metric label="Beds" value={formatNumber(accommodation.beds)} />
            <Metric label="Max guests" value={formatNumber(accommodation.maxGuests)} icon={<UsersRound className="h-4 w-4" />} />
            <Metric label="Rating" value={formatNumber(accommodation.airbnbRating)} />
            <Metric label="Reviews" value={formatNumber(accommodation.reviewCount)} />
          </DetailSection>

          <DetailSection title="Amenities">
            <div className="col-span-full flex flex-wrap gap-2">
              <AmenityBadge label="Pool" type="pool" active={accommodation.pool} />
              <AmenityBadge label="Sea access" type="sea" active={accommodation.seaAccess} />
              <AmenityBadge label="Directly by sea" type="direct" active={accommodation.directlyBySea} />
              <AmenityBadge label="Garden / terrace" type="garden" active={accommodation.gardenTerrace} />
              <AmenityBadge label="Parking" type="parking" active={accommodation.parking} />
              <AmenityBadge label="Air conditioning" type="air" active={accommodation.airConditioning} />
              <AmenityBadge label="Kitchen" type="garden" active={accommodation.kitchen} />
              <AmenityBadge label="Washing machine" type="direct" active={accommodation.washingMachine} />
            </div>
          </DetailSection>

          <DetailSection title="Notes">
            <LongText label="Pros" value={accommodation.pros} />
            <LongText label="Cons" value={accommodation.cons} />
            <LongText label="Short verdict" value={accommodation.shortVerdict} />
            <LongText label="Comments / notes" value={accommodation.notes} />
          </DetailSection>
        </div>

        <aside className="space-y-5">
          <section className="rounded-lg border border-white bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-xl font-black tracking-tight">Decision</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Metric label="Approval" value={formatPercent(stats.approvalRate)} />
              <Metric label="Active voters" value={String(stats.activeVoters)} />
              <Metric label="Yes" value={String(stats.yes)} />
              <Metric label="Maybe" value={String(stats.maybe)} />
              <Metric label="No" value={String(stats.no)} />
              <Metric label="Status" value={accommodation.status} />
            </div>
          </section>
          <VotePanel accommodationId={accommodation.id} stats={stats} />
        </aside>
      </div>
    </div>
  );
}

function ActionLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: ReactNode;
}) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex min-h-10 items-center gap-2 rounded-full bg-slate-950 px-4 text-sm font-black text-white hover:bg-teal-800"
    >
      {icon}
      {label}
    </a>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-white bg-white p-4 shadow-sm sm:p-5">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-black tracking-tight">
        <Home className="h-5 w-5 text-teal-700" />
        {title}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{children}</div>
    </section>
  );
}

function Metric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
        {icon}
        {label}
      </p>
      <p className="mt-1 break-words text-base font-black text-slate-950">
        {value}
      </p>
    </div>
  );
}

function LongText({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 sm:col-span-2 xl:col-span-3">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 whitespace-pre-wrap text-sm font-semibold leading-6 text-slate-700">
        {value || "—"}
      </p>
    </div>
  );
}
