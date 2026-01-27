import { getSingleEvent } from "@/server/actions/events";
import { unwrap } from "@/utils/actions";
import { notFound, redirect } from "next/navigation";
import RSVPButtons from "@/app/_components/ui/rsvp-buttons";
import { maskAttendance } from "@/utils/events";
import { readUser, requireEventOrgMember } from "@/server/auth/permissions";

type Params = Promise<{ eventId: string }>;
export default async function EventId({ params }: { params: Params }) {
  const user = unwrap(await readUser({ redirectTo: "/unauthorized" }));

  const { eventId } = await params;

  const membership = await requireEventOrgMember(user.id, eventId);
  if (!membership.success) return redirect("/unauthorized");

  const event = unwrap(await getSingleEvent({ eventId }));

  if (!event) notFound();

  const initialStatus = event.attendance.find(
    (attendance) => attendance.userId === user.id,
  )?.status;

  return (
    <>
      <h1>{event.name}</h1>
      <p>Created by {event.createdBy.name}</p>
      <p>Attendance:</p>
      <ul>
        {event.attendance.map((attendance) => (
          <li key={attendance.userId}>
            {attendance.userName}
            {maskAttendance(attendance.status)}
          </li>
        ))}
      </ul>
      <RSVPButtons eventId={eventId} initialStatus={initialStatus} />
    </>
  );
}
