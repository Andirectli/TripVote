"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ListPlus } from "lucide-react";
import { AccommodationCard } from "@/components/accommodation-card";
import { defaultFilters, FilterPanel } from "@/components/filter-panel";
import { PageHero } from "@/components/page-hero";
import {
  filterAccommodations,
  getVoteStats,
  sortAccommodations,
} from "@/lib/calculations";
import { useTripStore } from "@/lib/store";
import type { AccommodationFilters, SortOption } from "@/lib/types";

export default function Home() {
  const { state, ready, deleteAccommodation } = useTripStore();
  const [filters, setFilters] = useState<AccommodationFilters>(defaultFilters);
  const [sort, setSort] = useState<SortOption>("approvalDesc");

  const visibleAccommodations = useMemo(() => {
    const filtered = filterAccommodations(
      state.accommodations,
      state,
      filters,
    );
    return sortAccommodations(filtered, state, sort);
  }, [filters, sort, state]);

  if (!ready) {
    return <LoadingSurface />;
  }

  return (
    <div className="space-y-5">
      <PageHero />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-950">
            Locations
          </h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            {visibleAccommodations.length} of {state.accommodations.length} stays
          </p>
        </div>
        <Link
          href="/add"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-slate-950 px-4 text-sm font-black text-white shadow-sm transition hover:bg-teal-800"
        >
          <ListPlus className="h-4 w-4" />
          Add Airbnb
        </Link>
      </div>

      <FilterPanel
        filters={filters}
        setFilters={setFilters}
        sort={sort}
        setSort={setSort}
      />

      {visibleAccommodations.length ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleAccommodations.map((accommodation) => (
            <AccommodationCard
              key={accommodation.id}
              accommodation={accommodation}
              stats={getVoteStats(accommodation.id, state)}
              onRemove={deleteAccommodation}
            />
          ))}
        </section>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white/75 p-8 text-center">
          <p className="text-lg font-black text-slate-950">No stays match.</p>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Clear filters or add another option.
          </p>
        </div>
      )}
    </div>
  );
}

function LoadingSurface() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="rounded-full border border-white bg-white px-5 py-3 text-sm font-black text-slate-500 shadow-sm">
        Loading TripVote...
      </div>
    </div>
  );
}
