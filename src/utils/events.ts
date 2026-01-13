import { EventStatus } from "generated/prisma";

export const attendanceMask: Record<EventStatus, string> = {
  [EventStatus.ATTENDING]: "✅ Attending",
  [EventStatus.NOT_ATTENDING]: "❌ Not Attending",
  [EventStatus.MAYBE]: "❓ Maybe",
  [EventStatus.PENDING]: "⏳ Pending",
};

export function maskAttendance(status: EventStatus) {
  return attendanceMask[status] ?? status;
}

export function computeAttendanceSummary(
  attendances: {
    status: EventStatus;
    user: { name: string | null };
  }[],
) {
  const summary = {
    attending: 0,
    notAttending: 0,
    maybe: 0,
    pending: 0,

    attendingUsers: [] as string[],
    notAttendingUsers: [] as string[],
    maybeUsers: [] as string[],
    pendingUsers: [] as string[],
  };

  for (const a of attendances) {
    const name = a.user.name ?? "Unknown";

    switch (a.status) {
      case EventStatus.ATTENDING:
        summary.attending++;
        summary.attendingUsers.push(name);
        break;
      case EventStatus.NOT_ATTENDING:
        summary.notAttending++;
        summary.notAttendingUsers.push(name);
        break;

      case EventStatus.MAYBE:
        summary.maybe++;
        summary.maybeUsers.push(name);
        break;

      case EventStatus.PENDING:
        summary.pending++;
        summary.pendingUsers.push(name);
        break;
    }
  }

  return summary;
}

export function renderEventEmbed(event: {
  name: string;
  description?: string | null;
  startsAt: Date;
  endsAt?: Date | null;
  location?: string | null;
  createdByName: string;
  attendance: ReturnType<typeof computeAttendanceSummary>;
}) {
  const a = event.attendance;

  return {
    title: event.name,
    description: event.description ?? "No description provided",
    color: 0x5865f2, // Discord blurple
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
        value:
          `✅ Attending: **${a.attending}**\n` +
          `❌ Not attending: **${a.notAttending}**\n` +
          `❓ Maybe: **${a.maybe}**\n` +
          `⏳ No response: **${a.pending}**`,
      },
      ...(a.attendingUsers.length
        ? [{ name: "✅ Attending", value: a.attendingUsers.join(", ") }]
        : []),
      ...(a.maybeUsers.length
        ? [{ name: "❓ Maybe", value: a.maybeUsers.join(", ") }]
        : []),
    ],
    timestamp: new Date().toISOString(),
  };
}
