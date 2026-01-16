import { unwrap } from "@/utils/actions";
import RSVPButtons from "../orgs/[slug]/[eventId]/rsvp-buttons";
import { getUserEvents } from "@/server/actions/events";
import { auth } from "@/server/auth";

export default async function Dashboard() {
  const session = await auth();
  if (!session?.user) {
    return <p>You must be signed in to view this page</p>;
  }
  const events = unwrap(await getUserEvents());

  return (
    <div>
      {/* Hero */}
      <h1 className="text-2xl font-semibold">
        Welcome back, {session.user.name}
      </h1>
      <p className="mt-1 text-slate-500">
        Events from your Discord servers, synced in real time.
      </p>

      {/* Event list */}
      {events ? (
        events.map((event) => (
          <div
            key={event.id}
            className="rounded-lg border bg-white p-4 shadow-sm"
          >
            <div className="flex justify-between">
              <div>
                <h3 className="font-medium">🎮 Friday Game Night</h3>
                <p className="text-sm text-slate-500">Jan 19 · 8:00 PM</p>
              </div>

              <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-700">
                Attending
              </span>
            </div>

            <div className="mt-4">
              <RSVPButtons
                eventId={event.id}
                initialStatus={event.myStatus ?? undefined}
              />
            </div>
          </div>
        ))
      ) : (
        <p className="text-slate-500">No upcoming events yet.</p>
      )}
    </div>
  );
}
