import { db } from "@/server/db";
import type { AttendanceCounts } from "./attendance";

export const RATE_LIMIT_MS = 2000; // 2 seconds

// Renders an event embed for Discord
export function renderEventEmbed(event: {
  name: string;
  description?: string | null;
  startsAt: Date;
  endsAt?: Date | null;
  location?: string | null;
  createdByName: string;
  attendance: AttendanceCounts;
}) {
  const { attendance } = event;

  return {
    title: event.name,
    description: event.description ?? "No description provided",
    color: 0x5865f2,
    fields: [
      {
        name: "🕒 Time",
        value:
          `Start: ${event.startsAt.toLocaleString()}\n` +
          `End: ${event.endsAt?.toLocaleString() ?? "N/A"}`,
      },
      {
        name: "📍 Location",
        value: event.location ?? "N/A",
        inline: true,
      },
      {
        name: "👤 Created by",
        value: event.createdByName,
        inline: true,
      },
      {
        name: "📊 Attendance",
        value: [
          `✅ Attending: **${attendance.attending}**`,
          `❓ Maybe: **${attendance.maybe}**`,
          `❌ Not attending: **${attendance.notAttending}**`,
          `⏳ No response: **${attendance.pending}**`,
        ].join("\n"),
      },
    ],
    timestamp: new Date().toISOString(),
  };
}

// Gets the organization ID from an event
export async function readOrgIdFromEvent(
  eventId: string,
): Promise<string | null> {
  const event = await db.event.findUnique({
    where: { id: eventId },
    select: { orgId: true },
  });

  return event?.orgId ?? null;
}
