"use client";

import type { FormEvent, ReactNode } from "react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Link2, Loader2, Save, WandSparkles } from "lucide-react";
import {
  AVAILABILITY_OPTIONS,
  RESERVATION_OPTIONS,
  STATUSES,
} from "@/lib/constants";
import { formatDateTime, numberOrNull, stringValue } from "@/lib/format";
import { useTripStore } from "@/lib/store";
import type { Accommodation } from "@/lib/types";

const fallbackImage =
  "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=80";

export function AccommodationForm({
  accommodation,
}: {
  accommodation?: Accommodation;
}) {
  const router = useRouter();
  const { upsertAccommodation } = useTripStore();
  const formRef = useRef<HTMLFormElement>(null);
  const [importState, setImportState] = useState<{
    loading: boolean;
    message: string;
    warnings: string[];
  }>({ loading: false, message: "", warnings: [] });

  async function handleAnalyzeUrl() {
    const form = formRef.current;
    if (!form) return;

    const airbnbUrl = (form.elements.namedItem("airbnbUrl") as HTMLInputElement | null)?.value;
    if (!airbnbUrl) {
      setImportState({
        loading: false,
        message: "Paste an Airbnb URL first.",
        warnings: [],
      });
      return;
    }

    setImportState({ loading: true, message: "Reading URL...", warnings: [] });

    try {
      const response = await fetch("/api/airbnb-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: airbnbUrl }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Could not import this Airbnb URL.");
      }

      fillFormFields(form, result.fields ?? {});
      setImportState({
        loading: false,
        message: "URL details imported. Please check price and amenities manually.",
        warnings: result.warnings ?? [],
      });
    } catch (error) {
      setImportState({
        loading: false,
        message: error instanceof Error ? error.message : "Import failed.",
        warnings: [],
      });
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const availabilityStatus = (
      stringValue(formData.get("availabilityStatus")) || "unknown"
    ) as Accommodation["availabilityStatus"];
    const previousAvailabilityStatus =
      accommodation?.availabilityStatus ?? "unknown";
    const lastAvailabilityCheckAt =
      availabilityStatus === "unknown"
        ? null
        : availabilityStatus !== previousAvailabilityStatus
          ? new Date().toISOString()
          : accommodation?.lastAvailabilityCheckAt ?? new Date().toISOString();

    const saved: Accommodation = {
      id: accommodation?.id ?? crypto.randomUUID(),
      name: stringValue(formData.get("name")) || "Untitled Airbnb",
      location: stringValue(formData.get("location")),
      countryRegion: stringValue(formData.get("countryRegion")),
      airbnbUrl: stringValue(formData.get("airbnbUrl")),
      mapsUrl: stringValue(formData.get("mapsUrl")),
      imageUrl: stringValue(formData.get("imageUrl")) || fallbackImage,
      checkIn: stringValue(formData.get("checkIn")) || "2026-08-24",
      checkOut: stringValue(formData.get("checkOut")) || "2026-08-30",
      nights: numberOrNull(formData.get("nights")) ?? 6,
      guests: numberOrNull(formData.get("guests")) ?? 6,
      totalPrice: numberOrNull(formData.get("totalPrice")),
      bedrooms: numberOrNull(formData.get("bedrooms")),
      bathrooms: numberOrNull(formData.get("bathrooms")),
      beds: numberOrNull(formData.get("beds")),
      maxGuests: numberOrNull(formData.get("maxGuests")),
      pool: formData.has("pool"),
      seaAccess: formData.has("seaAccess"),
      directlyBySea: formData.has("directlyBySea"),
      gardenTerrace: formData.has("gardenTerrace"),
      parking: formData.has("parking"),
      airConditioning: formData.has("airConditioning"),
      kitchen: formData.has("kitchen"),
      washingMachine: formData.has("washingMachine"),
      nearestAirport: stringValue(formData.get("nearestAirport")),
      airportDistanceKm: numberOrNull(formData.get("airportDistanceKm")),
      airportDriveTime: stringValue(formData.get("airportDriveTime")),
      flightOrigin: stringValue(formData.get("flightOrigin")),
      flightDestinationAirport: stringValue(formData.get("flightDestinationAirport")),
      flightDuration: stringValue(formData.get("flightDuration")),
      flightPrice: numberOrNull(formData.get("flightPrice")),
      cheapestNearbyOrigin: stringValue(formData.get("cheapestNearbyOrigin")),
      flightNotes: stringValue(formData.get("flightNotes")),
      availabilityStatus,
      lastAvailabilityCheckAt,
      reservationCostStatus: (
        stringValue(formData.get("reservationCostStatus")) || "unknown"
      ) as Accommodation["reservationCostStatus"],
      airbnbRating: numberOrNull(formData.get("airbnbRating")),
      reviewCount: numberOrNull(formData.get("reviewCount")),
      pros: stringValue(formData.get("pros")),
      cons: stringValue(formData.get("cons")),
      overallScore: numberOrNull(formData.get("overallScore")),
      status: (stringValue(formData.get("status")) || "New") as Accommodation["status"],
      shortVerdict: stringValue(formData.get("shortVerdict")),
      notes: stringValue(formData.get("notes")),
    };

    upsertAccommodation(saved);
    router.push(`/accommodations/${saved.id}`);
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      <FormSection title="Paste Airbnb URL">
        <label className="space-y-1.5 text-sm font-bold text-slate-600 md:col-span-2">
          Airbnb URL
          <div className="flex flex-col gap-2 sm:flex-row">
            <span className="relative min-w-0 flex-1">
              <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                name="airbnbUrl"
                defaultValue={accommodation?.airbnbUrl ?? ""}
                placeholder="https://www.airbnb.de/rooms/..."
                className="min-h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-base font-semibold text-slate-950 outline-none focus:border-teal-400"
              />
            </span>
            <button
              type="button"
              onClick={handleAnalyzeUrl}
              disabled={importState.loading}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-slate-950 px-4 text-sm font-black text-white transition hover:bg-teal-800 disabled:cursor-wait disabled:bg-slate-400"
            >
              {importState.loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <WandSparkles className="h-4 w-4" />
              )}
              Analyze URL
            </button>
          </div>
        </label>
        <div className="rounded-lg border border-amber-100 bg-amber-50 p-3 text-sm font-semibold leading-6 text-amber-900">
          {importState.message || "This imports URL parameters and public metadata. Prices, final fees, flights, and amenities stay editable below."}
          {importState.warnings.length ? (
            <ul className="mt-2 list-disc pl-5">
              {importState.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </FormSection>

      <FormSection title="Listing">
        <TextField name="name" label="Name" defaultValue={accommodation?.name} required />
        <TextField name="location" label="Location" defaultValue={accommodation?.location} />
        <TextField name="countryRegion" label="Country / region" defaultValue={accommodation?.countryRegion} />
        <TextField name="mapsUrl" label="Google Maps URL" defaultValue={accommodation?.mapsUrl} />
        <TextField name="imageUrl" label="Image URL" defaultValue={accommodation?.imageUrl} />
        <SelectField
          name="status"
          label="Status"
          defaultValue={accommodation?.status ?? "New"}
          options={STATUSES.map((status) => ({ value: status, label: status }))}
        />
        <SelectField
          name="availabilityStatus"
          label="Verfügbarkeit"
          defaultValue={accommodation?.availabilityStatus ?? "unknown"}
          options={AVAILABILITY_OPTIONS}
        />
        <InfoField
          label="Zuletzt geprüft"
          value={formatDateTime(accommodation?.lastAvailabilityCheckAt)}
        />
        <SelectField
          name="reservationCostStatus"
          label="Reservierung"
          defaultValue={accommodation?.reservationCostStatus ?? "unknown"}
          options={RESERVATION_OPTIONS}
        />
      </FormSection>

      <FormSection title="Trip and price">
        <TextField type="date" name="checkIn" label="Check-in" defaultValue={accommodation?.checkIn ?? "2026-08-24"} />
        <TextField type="date" name="checkOut" label="Check-out" defaultValue={accommodation?.checkOut ?? "2026-08-30"} />
        <TextField type="number" name="nights" label="Nights" defaultValue={String(accommodation?.nights ?? 6)} />
        <TextField type="number" name="guests" label="Guests" defaultValue={String(accommodation?.guests ?? 6)} />
        <TextField type="number" name="totalPrice" label="Total price €" defaultValue={value(accommodation?.totalPrice)} />
      </FormSection>

      <FormSection title="Accommodation">
        <TextField type="number" name="bedrooms" label="Bedrooms" defaultValue={value(accommodation?.bedrooms)} />
        <TextField type="number" name="bathrooms" label="Bathrooms" defaultValue={value(accommodation?.bathrooms)} />
        <TextField type="number" name="beds" label="Beds" defaultValue={value(accommodation?.beds)} />
        <TextField type="number" name="maxGuests" label="Max guests" defaultValue={value(accommodation?.maxGuests)} />
        <CheckboxField name="pool" label="Pool" defaultChecked={accommodation?.pool} />
        <CheckboxField name="seaAccess" label="Sea access" defaultChecked={accommodation?.seaAccess} />
        <CheckboxField name="directlyBySea" label="Directly by the sea" defaultChecked={accommodation?.directlyBySea} />
        <CheckboxField name="gardenTerrace" label="Garden / terrace" defaultChecked={accommodation?.gardenTerrace} />
        <CheckboxField name="parking" label="Parking" defaultChecked={accommodation?.parking} />
        <CheckboxField name="airConditioning" label="Air conditioning" defaultChecked={accommodation?.airConditioning} />
        <CheckboxField name="kitchen" label="Kitchen" defaultChecked={accommodation?.kitchen} />
        <CheckboxField name="washingMachine" label="Washing machine" defaultChecked={accommodation?.washingMachine} />
      </FormSection>

      <FormSection title="Airport, flights and quality">
        <TextField name="nearestAirport" label="Nearest airport" defaultValue={accommodation?.nearestAirport} />
        <TextField type="number" name="airportDistanceKm" label="Airport distance in km" defaultValue={value(accommodation?.airportDistanceKm)} />
        <TextField name="airportDriveTime" label="Driving time from airport" defaultValue={accommodation?.airportDriveTime} />
        <TextField name="flightOrigin" label="Flight origin" defaultValue={accommodation?.flightOrigin ?? "Düsseldorf / Köln"} />
        <TextField name="flightDestinationAirport" label="Flight destination airport" defaultValue={accommodation?.flightDestinationAirport} />
        <TextField name="flightDuration" label="Flight time" defaultValue={accommodation?.flightDuration} />
        <TextField type="number" name="flightPrice" label="Flight price from €" defaultValue={value(accommodation?.flightPrice)} />
        <TextField name="cheapestNearbyOrigin" label="Cheapest nearby origin" defaultValue={accommodation?.cheapestNearbyOrigin} />
        <TextField type="number" name="airbnbRating" label="Airbnb rating" defaultValue={value(accommodation?.airbnbRating)} step="0.1" />
        <TextField type="number" name="reviewCount" label="Number of reviews" defaultValue={value(accommodation?.reviewCount)} />
        <TextField type="number" name="overallScore" label="Overall score" defaultValue={value(accommodation?.overallScore)} step="0.1" />
        <TextArea name="flightNotes" label="Flight search notes" defaultValue={accommodation?.flightNotes} />
      </FormSection>

      <FormSection title="Notes">
        <TextArea name="pros" label="Pros" defaultValue={accommodation?.pros} />
        <TextArea name="cons" label="Cons" defaultValue={accommodation?.cons} />
        <TextArea name="shortVerdict" label="Short verdict" defaultValue={accommodation?.shortVerdict} />
        <TextArea name="notes" label="Comments / notes" defaultValue={accommodation?.notes} />
      </FormSection>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <button
          type="submit"
          className="inline-flex min-h-12 items-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-black text-white shadow-lg shadow-slate-950/20 transition hover:bg-teal-800"
        >
          <Save className="h-4 w-4" />
          Save accommodation
        </button>
      </div>
    </form>
  );
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-white bg-white p-4 shadow-sm sm:p-5">
      <h2 className="mb-4 text-lg font-black tracking-tight text-slate-950">
        {title}
      </h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>
    </section>
  );
}

function TextField({
  label,
  name,
  defaultValue,
  type = "text",
  required,
  step,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
  step?: string;
}) {
  return (
    <label className="space-y-1.5 text-sm font-bold text-slate-600">
      {label}
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        required={required}
        step={step}
        className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-base font-semibold text-slate-950 outline-none focus:border-teal-400"
      />
    </label>
  );
}

function TextArea({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue?: string;
}) {
  return (
    <label className="space-y-1.5 text-sm font-bold text-slate-600 md:col-span-2 xl:col-span-3">
      {label}
      <textarea
        name={name}
        defaultValue={defaultValue ?? ""}
        rows={3}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-base font-semibold text-slate-950 outline-none focus:border-teal-400"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="space-y-1.5 text-sm font-bold text-slate-600">
      {label}
      <select
        name={name}
        defaultValue={defaultValue}
        className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-base font-semibold text-slate-950 outline-none focus:border-teal-400"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5 text-sm font-bold text-slate-600">
      {label}
      <div className="flex min-h-11 items-center rounded-lg border border-slate-100 bg-slate-50 px-3 text-base font-semibold text-slate-500">
        {value}
      </div>
    </div>
  );
}

function CheckboxField({
  label,
  name,
  defaultChecked,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex min-h-11 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-700">
      <input
        name={name}
        type="checkbox"
        defaultChecked={Boolean(defaultChecked)}
        className="h-5 w-5 accent-teal-700"
      />
      {label}
    </label>
  );
}

function fillFormFields(form: HTMLFormElement, fields: Partial<Accommodation>) {
  for (const [key, fieldValue] of Object.entries(fields)) {
    if (fieldValue === undefined || fieldValue === null || fieldValue === "") {
      continue;
    }

    const element = form.elements.namedItem(key);
    if (!element) continue;

    if (element instanceof HTMLInputElement && element.type === "checkbox") {
      element.checked = Boolean(fieldValue);
      continue;
    }

    if (
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement ||
      element instanceof HTMLSelectElement
    ) {
      element.value = String(fieldValue);
    }
  }
}

function value(input: number | null | undefined) {
  return input === null || input === undefined ? "" : String(input);
}
