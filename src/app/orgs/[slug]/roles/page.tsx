import { db } from "@/server/db";
import { notFound, redirect } from "next/navigation";
import { requirePermission, requireUser } from "@/server/auth/permissions";
import RolesManagementPage from "./roles-management";

type Params = Promise<{ slug: string }>;
export default async function ManageRolesPage({ params }: { params: Params }) {
  const { slug } = await params;

  const user = await requireUser();

  const org = await db.organization.findUnique({
    where: { slug },
  });

  if (!org) notFound();

  const permissions = await requirePermission({
    userId: user.id,
    orgId: org.id,
    permission: "MANAGE_ROLES",
  });
  if (!permissions.success) return redirect("/unauthorized");

  const roles = await db.role.findMany({
    where: { orgId: org.id, isSystem: false },
  });

  return (
    <div className="mx-auto mt-8 max-w-md">
      <h1 className="mb-4 text-2xl font-bold">Editing Roles for {org.name}</h1>
      <RolesManagementPage orgId={org.id} roles={roles} />
    </div>
  );
}
