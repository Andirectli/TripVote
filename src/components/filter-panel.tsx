"use client";

import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import {
  GROUP_DECISIONS,
  SORT_OPTIONS,
  STATUSES,
} from "@/lib/constants";
import type {
  AccommodationFilters,
  GroupDecision,
  SortOption,
  Status,
} from "@/lib/types";

export const defaultFilters: AccommodationFilters = {
  pool: false,
  seaAccess: false,
  directlyBySea: false,
  gardenTerrace: false,
  parking: false,
  airConditioning: false,
  maxPricePerPersonNight: "",
  maxAirportDistanceKm: "",
  countryRegion: "",
  status: "All",
  groupDecision: "All",
};

export function FilterPanel({
  filters,
  setFilters,
  sort,
  setSort,
}: {
  filters: AccommodationFilters;
  setFilters: (filters: AccommodationFilters) => void;
  sort: SortOption;
  setSort: (sort: SortOption) => void;
}) {
  const toggle = (key: keyof Pick<
    AccommodationFilters,
    | "pool"
    | "seaAccess"
    | "directlyBySea"
    | "gardenTerrace"
    | "parking"
    | "airConditioning"
  >) => {
    setFilters({ ...filters, [key]: !filters[key] });
  };
  const activeFilterCount = [
    filters.pool,
    filters.seaAccess,
    filters.directlyBySea,
    filters.gardenTerrace,
    filters.parking,
    filters.airConditioning,
    filters.maxPricePerPersonNight,
    filters.maxAirportDistanceKm,
    filters.countryRegion,
    filters.status !== "All",
    filters.groupDecision !== "All",
  ].filter(Boolean).length;

  return (
    <details className="group rounded-lg border border-white bg-white/80 shadow-sm transition open:bg-white">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
        <span className="flex items-center gap-2 text-base font-black text-slate-950">
          <SlidersHorizontal className="h-4 w-4 text-teal-700" />
          Filters
          {activeFilterCount ? (
            <span className="rounded-full bg-teal-700 px-2 py-0.5 text-xs font-black text-white">
              {activeFilterCount}
            </span>
          ) : null}
        </span>
        <span className="flex items-center gap-3 text-sm font-bold text-slate-500">
          <span className="hidden sm:inline">
            Sort: {SORT_OPTIONS.find((option) => option.value === sort)?.label}
          </span>
          <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
        </span>
      </summary>

      <div className="flex flex-col gap-4 border-t border-slate-100 px-4 pb-4 pt-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-slate-500">
              Show only the places you want to compare right now.
            </p>
            <button
              type="button"
              onClick={() => setFilters(defaultFilters)}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-rose-200 hover:text-rose-700"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterToggle label="Pool" active={filters.pool} onClick={() => toggle("pool")} />
            <FilterToggle label="Sea access" active={filters.seaAccess} onClick={() => toggle("seaAccess")} />
            <FilterToggle label="Direct sea" active={filters.directlyBySea} onClick={() => toggle("directlyBySea")} />
            <FilterToggle label="Garden / terrace" active={filters.gardenTerrace} onClick={() => toggle("gardenTerrace")} />
            <FilterToggle label="Parking" active={filters.parking} onClick={() => toggle("parking")} />
            <FilterToggle label="A/C" active={filters.airConditioning} onClick={() => toggle("airConditioning")} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:w-[34rem]">
          <label className="space-y-1 text-sm font-bold text-slate-600">
            Max pp/night
            <input
              inputMode="decimal"
              value={filters.maxPricePerPersonNight}
              onChange={(event) =>
                setFilters({
                  ...filters,
                  maxPricePerPersonNight: event.target.value,
                })
              }
              placeholder="€"
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-slate-950 outline-none focus:border-teal-400"
            />
          </label>
          <label className="space-y-1 text-sm font-bold text-slate-600">
            Max airport km
            <input
              inputMode="decimal"
              value={filters.maxAirportDistanceKm}
              onChange={(event) =>
                setFilters({
                  ...filters,
                  maxAirportDistanceKm: event.target.value,
                })
              }
              placeholder="km"
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-slate-950 outline-none focus:border-teal-400"
            />
          </label>
          <label className="space-y-1 text-sm font-bold text-slate-600">
            Country / region
            <input
              value={filters.countryRegion}
              onChange={(event) =>
                setFilters({ ...filters, countryRegion: event.target.value })
              }
              placeholder="Mallorca, Algarve..."
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-slate-950 outline-none focus:border-teal-400"
            />
          </label>
          <label className="space-y-1 text-sm font-bold text-slate-600">
            Sort
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortOption)}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-slate-950 outline-none focus:border-teal-400"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm font-bold text-slate-600">
            Status
            <select
              value={filters.status}
              onChange={(event) =>
                setFilters({
                  ...filters,
                  status: event.target.value as "All" | Status,
                })
              }
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-slate-950 outline-none focus:border-teal-400"
            >
              <option value="All">All</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm font-bold text-slate-600">
            Group decision
            <select
              value={filters.groupDecision}
              onChange={(event) =>
                setFilters({
                  ...filters,
                  groupDecision: event.target.value as "All" | GroupDecision,
                })
              }
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-slate-950 outline-none focus:border-teal-400"
            >
              <option value="All">All</option>
              {GROUP_DECISIONS.map((decision) => (
                <option key={decision} value={decision}>
                  {decision}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </details>
  );
}

function FilterToggle({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-full border border-teal-700 bg-teal-700 px-3 py-2 text-sm font-bold text-white"
          : "rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 hover:border-teal-200 hover:text-teal-800"
      }
    >
      {label}
    </button>
  );
}
