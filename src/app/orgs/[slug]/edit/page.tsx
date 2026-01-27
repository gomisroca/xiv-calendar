import { db } from "@/server/db";
import { notFound, redirect } from "next/navigation";
import {
  requireOrgMember,
  requirePermission,
  requireUser,
} from "@/server/auth/permissions";
import EditOrganizationForm from "./edit-org-form";
import { Permission } from "generated/prisma";

type Params = Promise<{ slug: string }>;
export default async function EditOrganizationPage({
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

  const membership = await requireOrgMember(user.id, org.id);
  if (!membership.success) return redirect("/unauthorized");

  const permissions = await requirePermission({
    userId: user.id,
    orgId: org.id,
    permission: Permission.ORG_UPDATE,
  });
  if (!permissions.success) return redirect("/unauthorized");

  return (
    <div className="mx-auto mt-8 max-w-md">
      <h1 className="mb-4 text-2xl font-bold">
        Editing Organization {org.name}
      </h1>
      <EditOrganizationForm org={org} />
    </div>
  );
}
