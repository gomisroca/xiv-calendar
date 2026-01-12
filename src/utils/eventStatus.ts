import { EventStatus } from "generated/prisma";

export const attendanceMask: Record<EventStatus, string> = {
  [EventStatus.ATTENDING]: "✅ Attending",
  [EventStatus.NOT_ATTENDING]: "❌ Not Attending",
  [EventStatus.PENDING]: "⏳ Pending",
};

export function maskAttendance(status: EventStatus) {
  return attendanceMask[status] ?? status;
}
