import { db } from "@/server/db";
import { EventStatus } from "generated/prisma";

export const RATE_LIMIT_MS = 2000; // 2 seconds

export const attendanceMask: Record<AttendanceKey, string> = {
  attending: "✅ Attending",
  notAttending: "❌ Not Attending",
  maybe: "❓ Maybe",
  pending: "⏳ Pending",
};

export function maskAttendance(status: AttendanceKey | EventStatus) {
  const key =
    typeof status === "string" && status in attendanceMask
      ? (status as AttendanceKey)
      : STATUS_TO_KEY[status as EventStatus];

  return attendanceMask[key];
}

export type AttendanceKey = "attending" | "notAttending" | "maybe" | "pending";

export const STATUS_TO_KEY: Record<EventStatus, AttendanceKey> = {
  ATTENDING: "attending",
  NOT_ATTENDING: "notAttending",
  MAYBE: "maybe",
  PENDING: "pending",
};

type AttendanceCounts = {
  attending: number;
  maybe: number;
  notAttending: number;
  pending: number;
};

export async function getEventAttendanceCounts(
  eventId: string,
  orgId: string,
): Promise<AttendanceCounts> {
  const [counts, totalMembers] = await Promise.all([
    db.eventAttendance.groupBy({
      by: ["status"],
      where: { eventId },
      _count: true,
    }),
    db.membership.count({ where: { orgId } }),
  ]);

  const summary = {
    attending: 0,
    maybe: 0,
    notAttending: 0,
    pending: totalMembers,
  };

  for (const c of counts) {
    if (c.status === EventStatus.PENDING) continue;

    const key = STATUS_TO_KEY[c.status];
    summary[key] = c._count;
    summary.pending -= c._count;
  }

  return summary;
}

type AttendanceUsers = {
  attending: { id: string; name: string | null }[];
  maybe: { id: string; name: string | null }[];
  notAttending: { id: string; name: string | null }[];
  pending: { id: string; name: string | null }[];
};

export async function getEventAttendanceUsers(
  eventId: string,
): Promise<AttendanceUsers> {
  const event = await db.event.findUnique({
    where: { id: eventId },
    select: {
      orgId: true,
    },
  });
  if (!event)
    return { attending: [], maybe: [], notAttending: [], pending: [] };

  const [memberships, attendances] = await Promise.all([
    db.membership.findMany({
      where: { orgId: event.orgId },
      select: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),

    db.eventAttendance.findMany({
      where: { eventId },
      select: {
        userId: true,
        status: true,
      },
    }),
  ]);

  const attendanceByUserId = new Map(
    attendances.map((a) => [a.userId, a.status]),
  );

  const result = {
    attending: [] as { id: string; name: string | null }[],
    maybe: [] as { id: string; name: string | null }[],
    notAttending: [] as { id: string; name: string | null }[],
    pending: [] as { id: string; name: string | null }[],
  };

  for (const m of memberships) {
    const user = m.user;
    const status = attendanceByUserId.get(user.id) ?? EventStatus.PENDING;

    switch (status) {
      case EventStatus.ATTENDING:
        result.attending.push(user);
        break;
      case EventStatus.MAYBE:
        result.maybe.push(user);
        break;
      case EventStatus.NOT_ATTENDING:
        result.notAttending.push(user);
        break;
      case EventStatus.PENDING:
        result.pending.push(user);
        break;
    }
  }

  return result;
}

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
