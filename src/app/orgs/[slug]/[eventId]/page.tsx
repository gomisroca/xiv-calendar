import { getSingleEvent } from "@/server/actions/events";
import { unwrap } from "@/utils/actions";
import { notFound } from "next/navigation";
import RSVPButtons from "./rsvp-buttons";
import { auth } from "@/server/auth";

type Params = Promise<{ eventId: string }>;
export default async function EventId({ params }: { params: Params }) {
  const session = await auth();
  const { eventId } = await params;

  const event = unwrap(await getSingleEvent({ eventId }));

  if (!event) notFound();

  const initialStatus = event.attendance.find(
    (attendance) => attendance.userId === session?.user?.id,
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
            {attendance.status}
          </li>
        ))}
      </ul>
      <RSVPButtons eventId={eventId} initialStatus={initialStatus} />
    </>
  );
}
