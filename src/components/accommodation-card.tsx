"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  CarFront,
  Euro,
  MessageCircle,
  Plane,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import {
  AmenityBadge,
  AvailabilityBadge,
  DecisionBadge,
  ReservationBadge,
  StatusBadge,
} from "@/components/badges";
import {
  formatCurrency,
  formatCurrencyShort,
  formatPercent,
} from "@/lib/format";
import { pricePerPersonPerNight } from "@/lib/calculations";
import type { Accommodation, VoteStats } from "@/lib/types";

export function AccommodationCard({
  accommodation,
  stats,
  onRemove,
}: {
  accommodation: Accommodation;
  stats: VoteStats;
  onRemove?: (id: string) => void;
}) {
  const priceNight = pricePerPersonPerNight(accommodation);
  const activeAmenities = [
    { label: "Pool", type: "pool" as const, active: accommodation.pool },
    { label: "Sea", type: "sea" as const, active: accommodation.seaAccess },
    { label: "By sea", type: "direct" as const, active: accommodation.directlyBySea },
    { label: "Terrace", type: "garden" as const, active: accommodation.gardenTerrace },
    { label: "A/C", type: "air" as const, active: accommodation.airConditioning },
  ].filter((amenity) => amenity.active);

  return (
    <article className="group overflow-hidden rounded-lg border border-white bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl">
      <Link href={`/accommodations/${accommodation.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <img
            src={accommodation.imageUrl}
            alt={accommodation.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-linear-to-t from-slate-950/80 to-transparent p-4">
            <div className="flex flex-wrap gap-2">
              <AvailabilityBadge status={accommodation.availabilityStatus} />
              <StatusBadge status={accommodation.status} />
            </div>
          </div>
        </div>
      </Link>

      <div className="space-y-3 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={`/accommodations/${accommodation.id}`}
              className="line-clamp-2 text-xl font-black tracking-tight text-slate-950 hover:text-teal-800"
            >
              {accommodation.name}
            </Link>
            <p className="mt-1 truncate text-sm font-semibold text-slate-500">
              {accommodation.location || "Add location"}
              {accommodation.countryRegion
                ? `, ${accommodation.countryRegion}`
                : ""}
            </p>
          </div>
          <div className="flex shrink-0 items-start gap-2">
            <div className="text-right">
              <p className="text-lg font-black text-slate-950">
                {formatCurrencyShort(priceNight)}
              </p>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                pp/night
              </p>
            </div>
            {onRemove ? (
              <button
                type="button"
                aria-label={`Remove ${accommodation.name}`}
                title="Remove from overview"
                onClick={() => {
                  if (window.confirm("Remove this Airbnb from the shortlist?")) {
                    onRemove(accommodation.id);
                  }
                }}
                className="grid h-9 w-9 place-items-center rounded-full border border-rose-100 bg-white text-rose-600 transition hover:bg-rose-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <ReservationBadge status={accommodation.reservationCostStatus} />
          {activeAmenities.slice(0, 4).map((amenity) => (
            <AmenityBadge
              key={amenity.label}
              label={amenity.label}
              type={amenity.type}
              active={amenity.active}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 text-sm">
          <CardMetric
            icon={<Euro className="h-4 w-4" />}
            label="Total"
            value={formatCurrency(accommodation.totalPrice)}
          />
          <CardMetric
            icon={<Plane className="h-4 w-4" />}
            label="Flight"
            value={flightSummary(accommodation)}
          />
          <CardMetric
            icon={<CarFront className="h-4 w-4" />}
            label="Airport"
            value={accommodation.airportDriveTime || "Add"}
          />
        </div>

        <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <DecisionBadge decision={stats.decision} />
            <span className="text-sm font-black text-slate-950">
              {formatPercent(stats.approvalRate)}
            </span>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-center text-sm">
            <VoteCount icon={<ThumbsUp className="h-4 w-4" />} label="Yes" value={stats.yes} />
            <VoteCount icon={<MessageCircle className="h-4 w-4" />} label="Maybe" value={stats.maybe} />
            <VoteCount label="No" value={stats.no} />
          </div>
        </div>
      </div>
    </article>
  );
}

function flightSummary(accommodation: Accommodation) {
  const price = formatCurrencyShort(accommodation.flightPrice);
  const duration = accommodation.flightDuration;
  if (accommodation.flightPrice != null && duration) return `${price} · ${duration}`;
  if (accommodation.flightPrice != null) return price;
  if (duration) return duration;
  return "Add flight";
}

function CardMetric({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-100 bg-white px-2.5 py-2">
      <span className="shrink-0 text-teal-700">{icon}</span>
      <span className="min-w-0">
        <span className="block text-xs font-bold uppercase tracking-wide text-slate-400">
          {label}
        </span>
        <span className="block truncate font-bold text-slate-800">{value}</span>
      </span>
    </div>
  );
}

function VoteCount({
  icon,
  label,
  value,
}: {
  icon?: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg bg-white px-2 py-1.5">
      <span className="flex items-center justify-center gap-1 text-xs font-bold uppercase tracking-wide text-slate-400">
        {icon}
        {label}
      </span>
      <span className="text-base font-black text-slate-950">{value}</span>
    </div>
  );
}
