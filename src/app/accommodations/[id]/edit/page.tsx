"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AccommodationForm } from "@/components/accommodation-form";
import { useTripStore } from "@/lib/store";

export default function EditAccommodationPage() {
  const params = useParams<{ id: string }>();
  const { state } = useTripStore();
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

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-700">
          Edit option
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">
          {accommodation.name}
        </h1>
      </div>
      <AccommodationForm accommodation={accommodation} />
    </div>
  );
}
