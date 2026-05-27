"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { MAX_VOTERS } from "@/lib/constants";
import { seedState } from "@/lib/seed-data";
import {
  deleteSupabaseAccommodation,
  deleteSupabaseVote,
  deleteSupabaseVoter,
  isSupabaseConfigured,
  loadSupabaseState,
  seedSupabaseState,
  upsertSupabaseAccommodation,
  upsertSupabaseTripDetails,
  upsertSupabaseVote,
  upsertSupabaseVoter,
} from "@/lib/supabase";
import type { Accommodation, TripDetails, TripState, VoteValue, Voter } from "@/lib/types";

const STORAGE_KEY = "tripvote-airbnb-shortlist-state-v1";

type TripContextValue = {
  state: TripState;
  ready: boolean;
  upsertAccommodation: (accommodation: Accommodation) => void;
  deleteAccommodation: (id: string) => void;
  addVoter: (name: string) => boolean;
  updateVoter: (id: string, patch: Partial<Pick<Voter, "name" | "active">>) => void;
  removeVoter: (id: string) => void;
  setVote: (
    accommodationId: string,
    voterId: string,
    vote: VoteValue | null,
  ) => void;
  updateVoteComment: (
    accommodationId: string,
    voterId: string,
    comment: string,
  ) => void;
  updateTripDetails: (patch: Partial<TripDetails>) => void;
  resetLocalData: () => void;
};

const TripContext = createContext<TripContextValue | null>(null);

export function TripProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TripState>(seedState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        if (isSupabaseConfigured()) {
          const remoteState = await loadSupabaseState();

          if (cancelled) return;
          if (remoteState) {
            setState(normalizeState(remoteState));
          } else {
            const normalizedSeed = normalizeState(seedState);
            setState(normalizedSeed);
            syncRemote(() => seedSupabaseState(normalizedSeed));
          }
          return;
        }

        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
          // Local-first hydration happens after the initial server/client match so
          // saved browser data does not cause a hydration mismatch.
          setState(normalizeState(JSON.parse(saved) as TripState));
        }
      } catch (error) {
        console.warn("Could not read TripVote data.", error);
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready || isSupabaseConfigured()) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [ready, state]);

  const touch = useCallback((next: Omit<TripState, "updatedAt">): TripState => {
    return { ...next, updatedAt: new Date().toISOString() };
  }, []);

  const upsertAccommodation = useCallback(
    (accommodation: Accommodation) => {
      setState((current) => {
        const exists = current.accommodations.some(
          (item) => item.id === accommodation.id,
        );

        return touch({
          ...current,
          accommodations: exists
            ? current.accommodations.map((item) =>
                item.id === accommodation.id ? accommodation : item,
              )
            : [accommodation, ...current.accommodations],
        });
      });

      syncRemote(() => upsertSupabaseAccommodation(accommodation));
    },
    [touch],
  );

  const deleteAccommodation = useCallback(
    (id: string) => {
      setState((current) =>
        touch({
          ...current,
          accommodations: current.accommodations.filter((item) => item.id !== id),
          votes: current.votes.filter((vote) => vote.accommodationId !== id),
        }),
      );
      syncRemote(() => deleteSupabaseAccommodation(id));
    },
    [touch],
  );

  const addVoter = useCallback(
    (name: string) => {
      if (!name.trim()) return false;
      if (state.voters.length >= MAX_VOTERS) return false;

      const voter = {
        id: crypto.randomUUID(),
        name: name.trim(),
        active: true,
      };

      setState((current) => {
        return touch({
          ...current,
          voters: [...current.voters, voter],
        });
      });
      syncRemote(() => upsertSupabaseVoter(voter));
      return true;
    },
    [state.voters.length, touch],
  );

  const updateVoter = useCallback(
    (id: string, patch: Partial<Pick<Voter, "name" | "active">>) => {
      setState((current) =>
        touch({
          ...current,
          voters: current.voters.map((voter) => {
            if (voter.id !== id) return voter;
            const updated = { ...voter, ...patch };
            syncRemote(() => upsertSupabaseVoter(updated));
            return updated;
          }),
        }),
      );
    },
    [touch],
  );

  const removeVoter = useCallback(
    (id: string) => {
      setState((current) =>
        touch({
          ...current,
          voters: current.voters.filter((voter) => voter.id !== id),
          votes: current.votes.filter((vote) => vote.voterId !== id),
        }),
      );
      syncRemote(() => deleteSupabaseVoter(id));
    },
    [touch],
  );

  const setVote = useCallback(
    (accommodationId: string, voterId: string, vote: VoteValue | null) => {
      setState((current) => {
        const existing = current.votes.find(
          (item) =>
            item.accommodationId === accommodationId && item.voterId === voterId,
        );

        const withoutExisting = current.votes.filter(
          (item) =>
            !(
              item.accommodationId === accommodationId &&
              item.voterId === voterId
            ),
        );

        if (!vote) {
          syncRemote(() => deleteSupabaseVote(accommodationId, voterId));
          return touch({ ...current, votes: withoutExisting });
        }

        const updatedVote = {
          id: existing?.id ?? `vote-${accommodationId}-${voterId}`,
          accommodationId,
          voterId,
          vote,
          comment: existing?.comment ?? "",
          updatedAt: new Date().toISOString(),
        };
        syncRemote(() => upsertSupabaseVote(updatedVote));

        return touch({
          ...current,
          votes: [...withoutExisting, updatedVote],
        });
      });
    },
    [touch],
  );

  const updateVoteComment = useCallback(
    (accommodationId: string, voterId: string, comment: string) => {
      setState((current) => {
        const existing = current.votes.find(
          (item) =>
            item.accommodationId === accommodationId && item.voterId === voterId,
        );

        if (!existing) return current;

        return touch({
          ...current,
          votes: current.votes.map((vote) => {
            if (vote.id !== existing.id) return vote;
            const updated = {
              ...vote,
              comment,
              updatedAt: new Date().toISOString(),
            };
            syncRemote(() => upsertSupabaseVote(updated));
            return updated;
          }),
        });
      });
    },
    [touch],
  );

  const defaultTripDetails = useMemo(() => ({
    guests: 6,
    checkIn: "2026-08-24",
    checkOut: "2026-08-30",
    destination: "quiet beach locations",
    origins: "Düsseldorf, Köln or nearby",
    coverImageUrl: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=2000&q=80",
  }), []);

  const updateTripDetails = useCallback(
    (patch: Partial<TripDetails>) => {
      setState((current) =>
        {
          const tripDetails = {
            ...(current.tripDetails ?? defaultTripDetails),
            ...patch,
          };
          syncRemote(() => upsertSupabaseTripDetails(tripDetails));
          return touch({
            ...current,
            tripDetails,
          });
        },
      );
    },
    [touch, defaultTripDetails],
  );

  const resetLocalData = useCallback(() => {
    setState({ ...seedState, updatedAt: new Date().toISOString() });
  }, []);

  const value = useMemo(
    () => ({
      state,
      ready,
      upsertAccommodation,
      deleteAccommodation,
      addVoter,
      updateVoter,
      removeVoter,
      setVote,
      updateVoteComment,
      updateTripDetails,
      resetLocalData,
    }),
    [
      state,
      ready,
      upsertAccommodation,
      deleteAccommodation,
      addVoter,
      updateVoter,
      removeVoter,
      setVote,
      updateVoteComment,
      updateTripDetails,
      resetLocalData,
    ],
  );

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

function normalizeState(state: TripState): TripState {
  const defaultTripDetails = {
    guests: 6,
    checkIn: "2026-08-24",
    checkOut: "2026-08-30",
    destination: "quiet beach locations",
    origins: "Düsseldorf, Köln or nearby",
    coverImageUrl: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=2000&q=80",
  };

  return {
    ...state,
    tripDetails: state.tripDetails ?? defaultTripDetails,
    accommodations: state.accommodations.map((accommodation) => ({
      ...accommodation,
      flightOrigin: accommodation.flightOrigin ?? "Düsseldorf / Köln",
      flightDestinationAirport: accommodation.flightDestinationAirport ?? "",
      flightDuration: accommodation.flightDuration ?? "",
      flightPrice: accommodation.flightPrice ?? null,
      cheapestNearbyOrigin: accommodation.cheapestNearbyOrigin ?? "",
      flightNotes: accommodation.flightNotes ?? "",
      availabilityStatus: accommodation.availabilityStatus ?? "unknown",
      lastAvailabilityCheckAt: accommodation.lastAvailabilityCheckAt ?? null,
      reservationCostStatus: accommodation.reservationCostStatus ?? "unknown",
    })),
  };
}

function syncRemote(action: () => Promise<unknown>) {
  if (!isSupabaseConfigured()) return;
  void action().catch((error) => {
    console.warn("Could not sync TripVote data to Supabase.", error);
  });
}

export function useTripStore() {
  const value = useContext(TripContext);
  if (!value) {
    throw new Error("useTripStore must be used inside TripProvider.");
  }
  return value;
}
