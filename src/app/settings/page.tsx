"use client";

import type { ChangeEvent } from "react";
import { Database, ImagePlus, RotateCcw, Settings } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useTripStore } from "@/lib/store";

export default function SettingsPage() {
  const { state, updateTripDetails, resetLocalData } = useTripStore();

  function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") {
        updateTripDetails({ coverImageUrl: result });
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-lg bg-teal-700 text-white">
          <Settings className="h-6 w-6" />
        </span>
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-700">
            Trip setup
          </p>
          <h1 className="text-3xl font-black tracking-tight text-slate-950">
            Settings
          </h1>
        </div>
      </div>

      <section className="rounded-lg border border-white bg-white p-4 shadow-sm sm:p-5">
        <h2 className="text-xl font-black tracking-tight text-slate-950">
          Trip details & cover image
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <label className="space-y-1.5 text-sm font-bold text-slate-600">
            Check-in date
            <input
              type="date"
              value={state.tripDetails?.checkIn ?? ""}
              onChange={(e) => updateTripDetails({ checkIn: e.target.value })}
              className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-base font-semibold text-slate-950 outline-none focus:border-teal-400"
            />
          </label>
          <label className="space-y-1.5 text-sm font-bold text-slate-600">
            Check-out date
            <input
              type="date"
              value={state.tripDetails?.checkOut ?? ""}
              onChange={(e) => updateTripDetails({ checkOut: e.target.value })}
              className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-base font-semibold text-slate-950 outline-none focus:border-teal-400"
            />
          </label>
          <label className="space-y-1.5 text-sm font-bold text-slate-600">
            Guests
            <input
              type="number"
              value={state.tripDetails?.guests ?? ""}
              onChange={(e) =>
                updateTripDetails({ guests: Number(e.target.value) })
              }
              className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-base font-semibold text-slate-950 outline-none focus:border-teal-400"
            />
          </label>
          <label className="space-y-1.5 text-sm font-bold text-slate-600">
            Destination
            <input
              type="text"
              value={state.tripDetails?.destination ?? ""}
              onChange={(e) =>
                updateTripDetails({ destination: e.target.value })
              }
              placeholder="e.g. quiet beach locations"
              className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-base font-semibold text-slate-950 outline-none focus:border-teal-400"
            />
          </label>
          <label className="space-y-1.5 text-sm font-bold text-slate-600">
            Origins / airports
            <input
              type="text"
              value={state.tripDetails?.origins ?? ""}
              onChange={(e) => updateTripDetails({ origins: e.target.value })}
              placeholder="e.g. Düsseldorf, Köln or nearby"
              className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-base font-semibold text-slate-950 outline-none focus:border-teal-400"
            />
          </label>
          <div className="space-y-1.5 text-sm font-bold text-slate-600 md:col-span-2">
            Cover image
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={state.tripDetails?.coverImageUrl ?? ""}
                onChange={(e) =>
                  updateTripDetails({ coverImageUrl: e.target.value })
                }
                placeholder="Paste image URL"
                className="min-h-11 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-base font-semibold text-slate-950 outline-none focus:border-teal-400"
              />
              <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-slate-950 px-4 text-xs font-black text-white transition hover:bg-teal-800">
                <ImagePlus className="h-4 w-4" />
                Upload
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {state.tripDetails?.coverImageUrl ? (
          <div className="mt-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
              Cover preview
            </p>
            <div className="relative aspect-[16/5] max-h-52 overflow-hidden rounded-lg border border-slate-200 shadow-[0_24px_70px_rgba(20,83,77,0.18)]">
              <img
                src={state.tripDetails.coverImageUrl}
                alt="Trip cover preview"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        ) : null}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-white bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-950 text-white">
              <Database className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-xl font-black tracking-tight">
                Storage mode
              </h2>
              <p className="text-sm font-semibold text-slate-500">
                {isSupabaseConfigured()
                  ? "Supabase sync is enabled."
                  : "Local browser mode is active."}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm font-semibold leading-6 text-slate-600">
            Local mode is perfect for testing. For a shared Vercel link where
            votes stay the same for everyone, add the Supabase environment
            variables described in the deployment guide.
          </p>
        </div>

        <div className="rounded-lg border border-white bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-xl font-black tracking-tight">Demo data</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
            Reset local data only when you want to return to the seeded Airbnb
            shortlist on this browser.
          </p>
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Reset all local TripVote data?")) {
                resetLocalData();
              }
            }}
            className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full border border-rose-200 px-4 text-sm font-black text-rose-700 hover:bg-rose-50"
          >
            <RotateCcw className="h-4 w-4" />
            Reset local demo data
          </button>
        </div>
      </section>
    </div>
  );
}
