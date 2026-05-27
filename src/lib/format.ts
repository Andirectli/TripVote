export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "Add price";
  }

  return new Intl.NumberFormat("en-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCurrencyShort(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }

  return new Intl.NumberFormat("en-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: value < 100 ? 1 : 0,
  }).format(value);
}

export function formatPercent(value: number) {
  return new Intl.NumberFormat("en-DE", {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number | null | undefined, suffix = "") {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${value}${suffix}`;
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function numberOrNull(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function stringValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}
