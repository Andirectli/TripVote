"use client";

import { FormEvent, useState } from "react";
import { Plus, Trash2, UsersRound } from "lucide-react";
import { MAX_VOTERS } from "@/lib/constants";
import { getVoteStats } from "@/lib/calculations";
import { useTripStore } from "@/lib/store";

export default function VotersPage() {
  const { state, addVoter, updateVoter, removeVoter } = useTripStore();
  const [name, setName] = useState("");
  const activeCount = state.voters.filter((voter) => voter.active).length;

  function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (addVoter(name)) setName("");
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-lg bg-teal-700 text-white">
          <UsersRound className="h-6 w-6" />
        </span>
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-700">
            Group
          </p>
          <h1 className="text-3xl font-black tracking-tight text-slate-950">
            Voters
          </h1>
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-lg border border-white bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-xl font-black tracking-tight">Voter setup</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Counter label="Active voters" value={activeCount} />
            <Counter label="Total voters" value={state.voters.length} />
          </div>

          <form onSubmit={handleAdd} className="mt-5 flex gap-2">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Name"
              disabled={state.voters.length >= MAX_VOTERS}
              className="min-h-11 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 text-base font-semibold text-slate-950 outline-none focus:border-teal-400 disabled:bg-slate-50"
            />
            <button
              type="submit"
              disabled={state.voters.length >= MAX_VOTERS}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-slate-950 px-4 text-sm font-black text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </form>
        </div>

        <div className="rounded-lg border border-white bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-xl font-black tracking-tight">People</h2>
          <div className="mt-4 space-y-3">
            {state.voters.map((voter) => (
              <div
                key={voter.id}
                className="grid gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 sm:grid-cols-[1fr_auto_auto]"
              >
                <input
                  value={voter.name}
                  onChange={(event) =>
                    updateVoter(voter.id, { name: event.target.value })
                  }
                  className="min-h-11 rounded-lg border border-white bg-white px-3 font-bold text-slate-950 outline-none focus:border-teal-300"
                />
                <label className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white bg-white px-4 text-sm font-black text-slate-700">
                  <input
                    type="checkbox"
                    checked={voter.active}
                    onChange={(event) =>
                      updateVoter(voter.id, { active: event.target.checked })
                    }
                    className="h-5 w-5 accent-teal-700"
                  />
                  Active
                </label>
                <button
                  type="button"
                  onClick={() => removeVoter(voter.id)}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-rose-100 bg-white px-4 text-sm font-black text-rose-700 hover:bg-rose-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-white bg-white p-4 shadow-sm sm:p-5">
        <h2 className="text-xl font-black tracking-tight">Vote summary</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {state.accommodations.map((accommodation) => {
            const stats = getVoteStats(accommodation.id, state);
            return (
              <div key={accommodation.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <p className="truncate font-black text-slate-950">
                  {accommodation.name}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {stats.yes} yes · {stats.maybe} maybe · {stats.no} no · {stats.decision}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Counter({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-3xl font-black text-slate-950">{value}</p>
    </div>
  );
}
