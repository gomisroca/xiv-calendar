"use client";

import { useState } from "react";
import { rsvpToEvent } from "@/server/actions/events";
import { EventStatus } from "generated/prisma";

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
  const [error, setError] = useState<string | null>(null);

  const handleRSVP = async (newStatus: EventStatus) => {
    if (loading) return;
    setLoading(true);
    setError(null);

    // Optimistic update
    const prevStatus = status;
    setStatus(newStatus);

    try {
      const result = await rsvpToEvent({ eventId, status: newStatus });
      if (!result.success) {
        throw new Error(result.error || "RSVP failed");
      }
    } catch (err: unknown) {
      setStatus(prevStatus); // revert
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
        disabled={loading}
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
        disabled={loading}
        onClick={() => handleRSVP(EventStatus.NOT_ATTENDING)}
      >
        ❌ Not Attend
      </button>

      {error && <span className="ml-2 text-red-500">{error}</span>}
    </div>
  );
}
