"use client";

import { MessageSquareText, UserRoundCheck } from "lucide-react";
import { VOTE_LABELS, VOTE_VALUES } from "@/lib/constants";
import { getVoteFor } from "@/lib/calculations";
import { cx, formatPercent } from "@/lib/format";
import { useTripStore } from "@/lib/store";
import type { VoteStats, VoteValue } from "@/lib/types";

export function VotePanel({
  accommodationId,
  stats,
}: {
  accommodationId: string;
  stats: VoteStats;
}) {
  const { state, setVote, updateVoteComment } = useTripStore();
  const activeVoters = state.voters.filter((voter) => voter.active);

  return (
    <section className="rounded-lg border border-white bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-black tracking-tight">
            <UserRoundCheck className="h-5 w-5 text-teal-700" />
            Voting
          </h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            {stats.yes} yes · {stats.maybe} maybe · {stats.no} no ·{" "}
            {stats.activeVoters} active voters
          </p>
        </div>
        <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-right">
          <p className="text-2xl font-black text-slate-950">
            {formatPercent(stats.approvalRate)}
          </p>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            approval
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {activeVoters.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-5 text-sm font-semibold text-slate-500">
            Add active voters in Voters.
          </div>
        ) : (
          activeVoters.map((voter) => {
            const currentVote = getVoteFor(
              state.votes,
              accommodationId,
              voter.id,
            );

            return (
              <div
                key={voter.id}
                className="rounded-lg border border-slate-100 bg-slate-50 p-3"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <p className="truncate font-black text-slate-950">
                      {voter.name}
                    </p>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {currentVote ? VOTE_LABELS[currentVote.vote] : "Not voted"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {VOTE_VALUES.map((value) => (
                      <VoteButton
                        key={value}
                        value={value}
                        active={currentVote?.vote === value}
                        onClick={() =>
                          setVote(
                            accommodationId,
                            voter.id,
                            currentVote?.vote === value ? null : value,
                          )
                        }
                      />
                    ))}
                  </div>
                </div>
                {currentVote ? (
                  <label className="mt-3 flex items-center gap-2 rounded-lg border border-white bg-white px-3 py-2 text-sm font-semibold text-slate-500">
                    <MessageSquareText className="h-4 w-4 shrink-0 text-teal-700" />
                    <input
                      value={currentVote.comment}
                      onChange={(event) =>
                        updateVoteComment(
                          accommodationId,
                          voter.id,
                          event.target.value,
                        )
                      }
                      placeholder="Optional vote comment"
                      className="min-w-0 flex-1 bg-transparent text-slate-900 outline-none"
                    />
                  </label>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

function VoteButton({
  value,
  active,
  onClick,
}: {
  value: VoteValue;
  active: boolean;
  onClick: () => void;
}) {
  const activeClass =
    value === "yes"
      ? "border-emerald-500 bg-emerald-500 text-white"
      : value === "maybe"
        ? "border-amber-500 bg-amber-500 text-white"
        : "border-rose-500 bg-rose-500 text-white";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "min-h-10 rounded-full border px-3 text-sm font-black transition",
        active
          ? activeClass
          : "border-slate-200 bg-white text-slate-600 hover:border-teal-200 hover:text-teal-800",
      )}
    >
      {VOTE_LABELS[value]}
    </button>
  );
}
