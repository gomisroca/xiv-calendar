import { readOrganizationEvents } from "@/server/actions/events";
import { db } from "@/server/db";
import { unwrap } from "@/utils/actions";
import { notFound, redirect } from "next/navigation";
import Calendar from "./calendar";
import { requireOrgMember, requireUser } from "@/server/auth/permissions";
import { AdminControls } from "./admin-controls";

type Params = Promise<{ slug: string }>;
export default async function OrgView({ params }: { params: Params }) {
  const { slug } = await params;

  const user = await requireUser();

  const org = await db.organization.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      createdBy: { select: { id: true, name: true } },
    },
  });

  if (!org) notFound();

  const membership = await requireOrgMember(user.id, org.id);
  if (!membership.success) return redirect("/unauthorized");

  const events = unwrap(await readOrganizationEvents({ orgId: org.id }));

  return (
    <>
      {/* Admin controls */}
      <AdminControls
        userId={user.id}
        orgId={org.id}
        orgSlug={org.slug}
        orgCreatedById={org.createdBy.id}
      />
      <ul>
        {events.map((event) => (
          <li key={event.id}>
            <h2>{event.name}</h2>
            <p>
              {event.startsAt.toLocaleString()}
              {event.endsAt ? ` - ${event.endsAt.toLocaleString()}` : ""}
            </p>
            <p>{event.description}</p>
            <p>{event.location}</p>
            <ul>
              {event.attendance.map((attendance) => (
                <li key={attendance.userId}>
                  {attendance.userName}
                  {attendance.status}
                </li>
              ))}
            </ul>
            <p>Created by {event.createdBy.name}</p>
          </li>
        ))}
      </ul>
      <Calendar slug={slug} events={events} />
    </>
  );
}
