"use client";

import { useState, useTransition } from "react";
import { rsvpToEvent } from "@/server/actions/events";
import { EventStatus } from "generated/prisma";
import { useRouter } from "next/navigation";

interface RSVPButtonsProps {
  eventId: string;
  initialStatus?: EventStatus;
  isClosed?: boolean;
}
interface RsvpButtonProps {
  value: EventStatus;
  current?: EventStatus;
  label: string;
  icon: string;
  disabled?: boolean;
  onClick: (status: EventStatus) => void;
}

const RSVP_OPTIONS: {
  value: EventStatus;
  icon: string;
  label: string;
}[] = [
  { value: EventStatus.ATTENDING, icon: "✅", label: "Attending" },
  { value: EventStatus.MAYBE, icon: "❓", label: "Maybe" },
  { value: EventStatus.NOT_ATTENDING, icon: "❌", label: "Not attending" },
];

const base =
  "rounded px-3 py-1 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-black font-semibold tracking-wider";

const styles: Record<EventStatus, { active: string; inactive: string }> = {
  ATTENDING: {
    active: "bg-green-200",
    inactive: "bg-green-500 hover:bg-green-600",
  },
  NOT_ATTENDING: {
    active: "bg-red-200",
    inactive: "bg-red-500 hover:bg-red-600",
  },
  MAYBE: {
    active: "bg-yellow-200",
    inactive: "bg-yellow-500 hover:bg-yellow-600",
  },
  PENDING: {
    active: "bg-gray-200",
    inactive: "bg-gray-500 hover:bg-gray-600",
  },
};

function RSVPButton({
  value,
  current,
  label,
  icon,
  disabled,
  onClick,
}: RsvpButtonProps) {
  const isActive = current === value;

  return (
    <button
      type="button"
      className={`${base} ${isActive ? styles[value].active : styles[value].inactive}`}
      disabled={disabled ?? isActive}
      onClick={() => onClick(value)}
    >
      {icon} {label}
    </button>
  );
}

export default function RSVPButtons({
  eventId,
  initialStatus,
  isClosed,
}: RSVPButtonsProps) {
  const [status, setStatus] = useState<EventStatus | undefined>(initialStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [error, setError] = useState<string | null>(null);

  const handleRSVP = async (newStatus: EventStatus) => {
    if (loading || isPending) return;
    if (status === newStatus) return;

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");

      startTransition(() => {
        router.refresh();
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className="flex items-center space-x-2">
        {RSVP_OPTIONS.map((option) => (
          <RSVPButton
            key={option.value}
            value={option.value}
            current={status}
            label={option.label}
            icon={option.icon}
            disabled={loading || isPending || isClosed}
            onClick={handleRSVP}
          />
        ))}
      </div>
      {loading && (
        <span className="ml-2 text-sm text-gray-500">Updating RSVP…</span>
      )}

      {isClosed && (
        <span className="ml-2 text-sm text-gray-500">RSVPs are closed</span>
      )}

      {error && <span className="ml-2 text-red-500">{error}</span>}
    </div>
  );
}
