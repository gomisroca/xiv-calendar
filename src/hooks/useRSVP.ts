"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { type EventStatus } from "generated/prisma";
import { rsvpToEvent } from "@/server/actions/events";

interface UseRSVPArgs {
  eventId: string;
  initialStatus?: EventStatus;
  isClosed?: boolean;
}

export function useRSVP({
  eventId,
  initialStatus,
  isClosed = false,
}: UseRSVPArgs) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [status, setStatus] = useState<EventStatus | undefined>(initialStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canRSVP = !loading && !isPending && !isClosed;

  const updateRSVP = async (nextStatus: EventStatus) => {
    if (!canRSVP) return;
    if (nextStatus === status) return;

    setLoading(true);
    setError(null);

    const previous = status;
    setStatus(nextStatus);

    try {
      const result = await rsvpToEvent({
        eventId,
        status: nextStatus,
      });

      if (!result.success) {
        throw new Error(result.error || "RSVP failed");
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      setStatus(previous);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return {
    status,
    updateRSVP,
    loading,
    error,
    canRSVP,
  };
}
