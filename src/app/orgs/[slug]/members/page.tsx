import { db } from "@/server/db";
import { notFound, redirect } from "next/navigation";
import {
  can,
  getUserPermissions,
  requireUser,
} from "@/server/auth/permissions";
import MembersManagementPage from "./members-management";

type Params = Promise<{ slug: string }>;
export default async function ManageMembersPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;

  const user = await requireUser();

  const org = await db.organization.findUnique({
    where: { slug },
  });

  if (!org) notFound();

  const permissions = await getUserPermissions({
    userId: user.id,
    orgId: org.id,
  });
  const canManageMembers = can(permissions, "MANAGE_MEMBERS");
  if (!canManageMembers) {
    return redirect("/unauthorized");
  }

  const roles = await db.role.findMany({
    where: { orgId: org.id },
    select: { id: true, name: true, isSystem: true },
  });

  const members = await db.membership.findMany({
    where: { orgId: org.id },
    include: { user: true, role: true },
  });

  return (
    <div className="mx-auto mt-8 max-w-md">
      <h1 className="mb-4 text-2xl font-bold">Editing Roles for {org.name}</h1>
      <MembersManagementPage
        orgId={org.id}
        userId={user.id}
        members={members}
        roles={roles}
      />
    </div>
  );
}
