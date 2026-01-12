"use client";

import { useState, useTransition } from "react";
import { rsvpToEvent } from "@/server/actions/events";
import { EventStatus } from "generated/prisma";
import { useRouter } from "next/navigation";

interface RSVPButtonsProps {
  eventId: string;
  initialStatus?: EventStatus;
}

export default function RSVPButtons({
  eventId,
  initialStatus,
}: RSVPButtonsProps) {
  const [status, setStatus] = useState<EventStatus | undefined>(initialStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [error, setError] = useState<string | null>(null);

  const handleRSVP = async (newStatus: EventStatus) => {
    if (loading) return;
    setLoading(true);
    setStatus(newStatus);

    try {
      const result = await rsvpToEvent({ eventId, status: newStatus });
      if (!result.success) {
        throw new Error(result.error || "RSVP failed");
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (err: unknown) {
      setStatus(initialStatus); // revert
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        className={`rounded px-3 py-1 ${
          status === EventStatus.ATTENDING
            ? "bg-green-500 text-white"
            : "bg-gray-200"
        }`}
        disabled={loading || isPending}
        onClick={() => handleRSVP(EventStatus.ATTENDING)}
      >
        ✅ Attend
      </button>

      <button
        className={`rounded px-3 py-1 ${
          status === EventStatus.NOT_ATTENDING
            ? "bg-red-500 text-white"
            : "bg-gray-200"
        }`}
        disabled={loading || isPending}
        onClick={() => handleRSVP(EventStatus.NOT_ATTENDING)}
      >
        ❌ Not Attend
      </button>

      {error && <span className="ml-2 text-red-500">{error}</span>}
    </div>
  );
}
