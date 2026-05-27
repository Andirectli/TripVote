"use client";

import { CalendarDays } from "lucide-react";
import { useTripStore } from "@/lib/store";

export function PageHero() {
  const { state } = useTripStore();
  
  const tripDetails = state.tripDetails ?? {
    guests: 6,
    checkIn: "2026-08-24",
    checkOut: "2026-08-30",
    destination: "quiet beach locations",
    origins: "Düsseldorf, Köln or nearby",
    coverImageUrl: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=2000&q=80",
  };
  const dateLabel = formatTripDateRange(tripDetails.checkIn, tripDetails.checkOut);

  return (
    <section className="animate-fade-in overflow-hidden rounded-lg border border-slate-200/70 bg-white shadow-sm">
      <div className="relative px-3 pt-3">
        <div className="absolute inset-x-10 bottom-1 h-20 rounded-full bg-teal-950/20 blur-3xl" />
        <div className="relative aspect-[16/8] min-h-[18rem] overflow-hidden rounded-lg bg-slate-100 shadow-[0_26px_90px_rgba(20,83,77,0.22)] sm:aspect-[16/7]">
          <img
            src={tripDetails.coverImageUrl}
            alt="Trip Cover"
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/10 via-transparent to-black/10" />
        </div>
      </div>

      <div className="grid gap-8 px-5 py-7 sm:px-9 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div>
          <h1 className="max-w-2xl text-4xl font-black leading-[0.95] tracking-tight text-slate-950 sm:text-6xl">
            Compare once, decide together{" "}
            <span className="font-serif italic font-normal">calmly</span>
          </h1>
          <p className="mt-5 max-w-xl text-base font-semibold leading-7 text-slate-600">
            Stimmt gemeinsam über eure Favoriten ab. Namen auswählen, Airbnb
            bewerten und gemeinsam entscheiden.
          </p>
        </div>

        <div className="flex lg:justify-end">
          <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-800">
            <CalendarDays className="h-4 w-4 text-teal-700" />
            <span>{dateLabel}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function formatTripDateRange(checkIn: string, checkOut: string) {
  const start = new Date(`${checkIn}T00:00:00`);
  const end = new Date(`${checkOut}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return `${checkIn} to ${checkOut}`;
  }

  const month = new Intl.DateTimeFormat("de-DE", { month: "short" }).format(start);
  const year = start.getFullYear();
  const sameMonth =
    start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();

  if (sameMonth) {
    return `${start.getDate()}-${end.getDate()} ${month} ${year}`;
  }

  return new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).formatRange(start, end);
}
