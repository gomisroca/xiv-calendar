"use client";

import { EventStatus } from "generated/prisma";
import { useRSVP } from "@/hooks/useRSVP";

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
  const { status, updateRSVP, loading, error, canRSVP } = useRSVP({
    eventId,
    initialStatus,
    isClosed,
  });

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
            disabled={!canRSVP}
            onClick={updateRSVP}
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
