import { AccommodationForm } from "@/components/accommodation-form";

export default function AddAccommodationPage() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-700">
          New option
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">
          Add Airbnb
        </h1>
      </div>
      <AccommodationForm />
    </div>
  );
}
