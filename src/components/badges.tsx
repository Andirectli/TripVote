import {
  AirVent,
  Check,
  CheckCircle2,
  CircleSlash,
  Clock3,
  CreditCard,
  Flower2,
  PiggyBank,
  MapPin,
  ParkingCircle,
  Sparkles,
  Waves,
  WavesLadder,
  XCircle,
} from "lucide-react";
import { cx } from "@/lib/format";
import type {
  AvailabilityStatus,
  GroupDecision,
  ReservationCostStatus,
  Status,
} from "@/lib/types";

const statusClasses: Record<Status, string> = {
  New: "border-slate-200 bg-slate-50 text-slate-700",
  Review: "border-sky-200 bg-sky-50 text-sky-700",
  Locations: "border-amber-200 bg-amber-50 text-amber-800",
  Favorite: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Out: "border-rose-200 bg-rose-50 text-rose-700",
};

const decisionClasses: Record<GroupDecision, string> = {
  "Set voters": "border-slate-200 bg-white text-slate-600",
  "🔥 Group favorite": "border-emerald-200 bg-emerald-50 text-emerald-700",
  "❌ Probably out": "border-rose-200 bg-rose-50 text-rose-700",
  "🤔 Discuss": "border-amber-200 bg-amber-50 text-amber-800",
  "🔍 Open": "border-sky-200 bg-sky-50 text-sky-700",
};

const availabilityConfig: Record<
  AvailabilityStatus,
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  available: {
    label: "Verfügbar",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: CheckCircle2,
  },
  unavailable: {
    label: "Nicht verfügbar",
    className: "border-rose-200 bg-rose-50 text-rose-700",
    icon: XCircle,
  },
  unknown: {
    label: "Nicht geprüft",
    className: "border-slate-200 bg-slate-50 text-slate-600",
    icon: Clock3,
  },
};

const reservationConfig: Record<
  ReservationCostStatus,
  { label: string; className: string; icon: typeof PiggyBank }
> = {
  free: {
    label: "Kostenlos reservieren",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: PiggyBank,
  },
  paid: {
    label: "Reservierung kostet Geld",
    className: "border-amber-200 bg-amber-50 text-amber-800",
    icon: CreditCard,
  },
  unknown: {
    label: "Reservierung ungeprüft",
    className: "border-slate-200 bg-slate-50 text-slate-600",
    icon: Clock3,
  },
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        statusClasses[status],
      )}
    >
      {status}
    </span>
  );
}

export function AvailabilityBadge({
  status,
}: {
  status: AvailabilityStatus;
}) {
  const config = availabilityConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        config.className,
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}

export function ReservationBadge({
  status,
}: {
  status: ReservationCostStatus;
}) {
  const config = reservationConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        config.className,
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}

export function DecisionBadge({ decision }: { decision: GroupDecision }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        decisionClasses[decision],
      )}
    >
      {decision}
    </span>
  );
}

export function AmenityBadge({
  label,
  active,
  type,
}: {
  label: string;
  active: boolean;
  type: "pool" | "sea" | "direct" | "garden" | "parking" | "air";
}) {
  const Icon =
    type === "pool"
      ? WavesLadder
      : type === "sea"
        ? Waves
        : type === "direct"
          ? MapPin
          : type === "garden"
            ? Flower2
            : type === "parking"
              ? ParkingCircle
              : AirVent;

  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        active
          ? "border-teal-200 bg-teal-50 text-teal-800"
          : "border-slate-200 bg-white/80 text-slate-400",
      )}
    >
      {active ? <Check className="h-3.5 w-3.5" /> : <CircleSlash className="h-3.5 w-3.5" />}
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

export function ScorePill({ score }: { score: number | null }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-800">
      <Sparkles className="h-3.5 w-3.5" />
      Score {score ?? "—"}
    </span>
  );
}
