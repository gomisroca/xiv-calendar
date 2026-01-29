import { getUserPermissions, can } from "@/server/auth/permissions";
import Link from "next/link";
import { Pencil, Ticket, User } from "lucide-react";
import BotButton from "@/app/_components/ui/bot-button";

export async function AdminControls({
  userId,
  orgId,
  orgSlug,
}: {
  userId: string;
  orgId: string;
  orgSlug: string;
}) {
  const permissions = await getUserPermissions({ userId, orgId });

  const canManageOrg = can(permissions, "MANAGE_ORG");
  const canManageRoles = can(permissions, "MANAGE_ROLES");
  const canManageMembers = can(permissions, "MANAGE_MEMBERS");

  if (!canManageOrg && !canManageRoles && !canManageMembers) {
    return null;
  }
  return (
    <div className="flex gap-2">
      {canManageOrg && (
        <>
          <BotButton />
          <Link
            href={`/orgs/${orgSlug}/edit`}
            className="flex w-fit items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Pencil />
            Organization
          </Link>
        </>
      )}
      {canManageRoles && (
        <Link
          href={`/orgs/${orgSlug}/roles/`}
          className="flex w-fit items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Ticket />
          Roles
        </Link>
      )}
      {canManageMembers && (
        <Link
          href={`/orgs/${orgSlug}/members`}
          className="flex w-fit items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <User />
          Members
        </Link>
      )}
    </div>
  );
}
