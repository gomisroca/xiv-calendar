import { getUserPermissions, can } from "@/server/auth/permissions";
import Link from "next/link";
import { Pencil } from "lucide-react";
import DeleteEventButton from "./edit/delete-event-button";

export async function EventControls({
  userId,
  orgId,
  orgSlug,
  eventId,
}: {
  userId: string;
  orgId: string;
  orgSlug: string;
  eventId: string;
}) {
  const permissions = await getUserPermissions({ userId, orgId });

  const canManageEvents = can(permissions, "MANAGE_EVENTS");

  if (!canManageEvents) {
    return null;
  }
  return (
    <div className="flex gap-2">
      <Link
        href={`/orgs/${orgSlug}/${eventId}/edit`}
        className="flex w-fit items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Pencil />
        Edit
      </Link>
      <DeleteEventButton eventId={eventId} />
    </div>
  );
}
