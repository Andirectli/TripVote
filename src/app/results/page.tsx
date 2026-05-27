"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Award, CarFront, Crown, Euro, Plane, Trophy } from "lucide-react";
import {
  AvailabilityBadge,
  DecisionBadge,
  ReservationBadge,
  ScorePill,
  StatusBadge,
} from "@/components/badges";
import {
  getRankingScore,
  getVoteStats,
  pricePerPersonPerNight,
  rankedAccommodations,
} from "@/lib/calculations";
import { formatCurrency, formatCurrencyShort, formatPercent } from "@/lib/format";
import { useTripStore } from "@/lib/store";

export default function ResultsPage() {
  const { state } = useTripStore();
  const ranked = rankedAccommodations(state);
  const topThree = ranked.slice(0, 3);
  const rest = ranked.slice(3);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-lg bg-teal-700 text-white">
          <Trophy className="h-6 w-6" />
        </span>
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-700">
            Ranked locations
          </p>
          <h1 className="text-3xl font-black tracking-tight text-slate-950">
            Results
          </h1>
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        {topThree.map((accommodation, index) => {
          const stats = getVoteStats(accommodation.id, state);
          return (
            <Link
              key={accommodation.id}
              href={`/accommodations/${accommodation.id}`}
              className="overflow-hidden rounded-lg border border-white bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              <div className="relative aspect-[4/3]">
                <img
                  src={accommodation.imageUrl}
                  alt={accommodation.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-black text-slate-950 shadow-sm">
                  {index === 0 ? <Crown className="h-4 w-4 text-amber-500" /> : <Award className="h-4 w-4 text-teal-700" />}
                  #{index + 1}
                </div>
              </div>
              <div className="space-y-3 p-4">
                <h2 className="line-clamp-2 text-xl font-black tracking-tight">
                  {accommodation.name}
                </h2>
                <div className="flex flex-wrap gap-2">
                  <AvailabilityBadge status={accommodation.availabilityStatus} />
                  <ReservationBadge status={accommodation.reservationCostStatus} />
                  <DecisionBadge decision={stats.decision} />
                  <StatusBadge status={accommodation.status} />
                </div>
                <ResultStats accommodationId={accommodation.id} />
              </div>
            </Link>
          );
        })}
      </section>

      <section className="rounded-lg border border-white bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-4 text-xl font-black tracking-tight">All options</h2>
        <div className="space-y-3">
          {rest.map((accommodation, index) => (
            <Link
              key={accommodation.id}
              href={`/accommodations/${accommodation.id}`}
              className="grid gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 transition hover:border-teal-200 sm:grid-cols-[auto_1fr_auto]"
            >
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-white text-lg font-black text-slate-950">
                #{index + 4}
              </div>
              <div className="min-w-0">
                <h3 className="truncate font-black text-slate-950">
                  {accommodation.name}
                </h3>
                <p className="truncate text-sm font-semibold text-slate-500">
                  {accommodation.location || "Add location"}
                  {accommodation.countryRegion
                    ? `, ${accommodation.countryRegion}`
                    : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <AvailabilityBadge status={accommodation.availabilityStatus} />
                <ReservationBadge status={accommodation.reservationCostStatus} />
                <ScorePill score={accommodation.overallScore} />
                <ResultStats accommodationId={accommodation.id} compact />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function ResultStats({
  accommodationId,
  compact,
}: {
  accommodationId: string;
  compact?: boolean;
}) {
  const { state } = useTripStore();
  const accommodation = state.accommodations.find((item) => item.id === accommodationId);
  if (!accommodation) return null;

  const stats = getVoteStats(accommodation.id, state);
  const ranking = Math.round(getRankingScore(accommodation, stats));

  if (compact) {
    return (
      <>
        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-black text-slate-700">
          {formatPercent(stats.approvalRate)}
        </span>
        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-black text-slate-700">
          {ranking} pts
        </span>
      </>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 text-sm">
      <MiniMetric label="Approval" value={formatPercent(stats.approvalRate)} />
      <MiniMetric label="Votes" value={`${stats.yes}/${stats.maybe}/${stats.no}`} />
      <MiniMetric
        label="PP/night"
        value={formatCurrencyShort(pricePerPersonPerNight(accommodation))}
        icon={<Euro className="h-4 w-4" />}
      />
      <MiniMetric label="Total" value={formatCurrency(accommodation.totalPrice)} />
      <MiniMetric
        label="Flight"
        value={flightResultSummary(accommodation)}
        icon={<Plane className="h-4 w-4" />}
      />
      <MiniMetric
        label="Airport"
        value={accommodation.airportDriveTime || "—"}
        icon={<CarFront className="h-4 w-4" />}
      />
      <MiniMetric label="Rank" value={`${ranking} pts`} />
    </div>
  );
}

function flightResultSummary(accommodation: {
  flightPrice: number | null;
  flightDuration: string;
}) {
  if (accommodation.flightPrice != null && accommodation.flightDuration) {
    return `${formatCurrencyShort(accommodation.flightPrice)} · ${accommodation.flightDuration}`;
  }
  if (accommodation.flightPrice != null) {
    return formatCurrencyShort(accommodation.flightPrice);
  }
  return accommodation.flightDuration || "—";
}

function MiniMetric({
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
      <p className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-slate-400">
        {icon}
        {label}
      </p>
      <p className="mt-1 truncate font-black text-slate-950">{value}</p>
    </div>
  );
}
