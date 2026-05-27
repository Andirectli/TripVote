import {
  CheckCircle2,
  Heart,
  Link2,
  MapPinned,
  Search,
  UsersRound,
} from "lucide-react";
import type { ReactNode } from "react";

const steps = [
  {
    title: "Add Airbnb links",
    text: "Paste a listing URL, let TripVote fill what it can, then add the final price, travel notes, and amenities manually.",
    icon: Link2,
  },
  {
    title: "Choose the voters",
    text: "Add up to ten people, keep only the active voters switched on, and let each person vote once per stay.",
    icon: UsersRound,
  },
  {
    title: "Vote on each stay",
    text: "Every voter can choose Yes, Maybe, or No. Votes can be changed anytime while the group is still deciding.",
    icon: Heart,
  },
  {
    title: "Check practical details",
    text: "Mark availability, reservation cost, airport access, flight notes, and the beach or pool features before choosing.",
    icon: Search,
  },
  {
    title: "Decide together",
    text: "The results page ranks the shortlist by group sentiment, approval rate, price, quality score, and travel convenience.",
    icon: CheckCircle2,
  },
];

export default function TripVotePage() {
  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-lg border border-white bg-white shadow-sm">
        <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[1fr_0.85fr] lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-teal-700">
              How TripVote works
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-black leading-[0.95] tracking-tight text-slate-950 sm:text-6xl">
              One shortlist, one vote, one calm decision.
            </h1>
            <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-slate-600">
              TripVote is a small group decision tool for Airbnb shortlists.
              It keeps the discussion focused: compare the important travel
              details, let everyone vote, then pick the stay the group can
              actually agree on.
            </p>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg shadow-[0_24px_70px_rgba(20,83,77,0.2)]">
              <img
                src="https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=80"
                alt="Quiet beach stay"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-950/45 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-white/90 p-4 backdrop-blur">
                <p className="text-sm font-black text-slate-950">
                  Designed for simple group voting, not spreadsheet chaos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <article
              key={step.title}
              className="rounded-lg border border-white bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-slate-950 text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-black text-teal-700">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <h2 className="mt-4 text-lg font-black tracking-tight text-slate-950">
                {step.title}
              </h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                {step.text}
              </p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-lg border border-white bg-white p-5 shadow-sm">
          <MapPinned className="h-7 w-7 text-teal-700" />
          <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950">
            What matters in the comparison
          </h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
            TripVote focuses on the details that normally decide a group
            vacation: price per person, airport drive time, beach access, pool,
            terrace, air conditioning, availability, reservation cost, and the
            group vote.
          </p>
        </div>
        <div className="rounded-lg border border-white bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-black tracking-tight text-slate-950">
            Local first, shared later
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Info title="Local demo">
              Runs with browser storage immediately after npm install. Perfect
              for testing and editing your shortlist alone.
            </Info>
            <Info title="Shared voting">
              Add Supabase environment variables on Vercel and everyone uses
              the same accommodation, voter, and vote data.
            </Info>
            <Info title="No scraping promise">
              Airbnb URLs can be analyzed for public metadata, but final prices
              and booking terms should still be checked manually.
            </Info>
            <Info title="Small group scope">
              The app is designed for private trips with up to ten voters, not
              for public marketplace traffic.
            </Info>
          </div>
        </div>
      </section>
    </div>
  );
}

function Info({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
      <h3 className="font-black text-slate-950">{title}</h3>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
        {children}
      </p>
    </div>
  );
}
