import { notFound, redirect } from "next/navigation";
import {
  readUser,
  requireEventOrgMember,
  requirePermission,
} from "@/server/auth/permissions";
import EditEventForm from "./edit-event-form";
import { db } from "@/server/db";
import { Permission } from "generated/prisma";
import { unwrap } from "@/utils/actions";

type Params = Promise<{ slug: string; eventId: string }>;
export default async function EditEventPage({ params }: { params: Params }) {
  const user = unwrap(await readUser({ redirectTo: "/unauthorized" }));

  const { eventId } = await params;

  const membership = await requireEventOrgMember(user.id, eventId);
  if (!membership.success) return redirect("/unauthorized");

  const event = await db.event.findUnique({
    where: { id: eventId },
  });
  if (!event) notFound();

  if (user.id !== event.createdById) {
    const permissions = await requirePermission({
      userId: user.id,
      orgId: event.orgId,
      permission: Permission.EVENT_UPDATE,
    });
    if (!permissions.success) return redirect("/unauthorized");
  }

  return (
    <div className="mx-auto mt-8 max-w-md">
      <h1 className="mb-4 text-2xl font-bold">Editing Event {event.name}</h1>
      <EditEventForm event={event} />
    </div>
  );
}
