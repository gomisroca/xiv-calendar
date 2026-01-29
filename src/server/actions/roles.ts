"use server";

import { db } from "@/server/db";
import { type Permission } from "generated/prisma";
import { readUser, requireOrgMember } from "@/server/auth/permissions";
import { redirect } from "next/navigation";

export async function createRole({
  orgId,
  name,
  permissions,
}: {
  orgId: string;
  name: string;
  permissions: Permission[];
}) {
  const userResult = await readUser();
  if (!userResult.success) return userResult;
  const user = userResult.data;

  const membership = await requireOrgMember(user.id, orgId);
  if (!membership.success) {
    return redirect("/unauthorized");
  }

  if (!name.trim()) {
    return {
      success: false,
      error: "Role name is required",
      code: "BAD_REQUEST",
    };
  }

  const role = await db.role.create({
    data: {
      orgId,
      name: name.trim(),
      permissions,
    },
  });

  return { success: true, data: role };
}

export async function updateRole({
  roleId,
  orgId,
  name,
  permissions,
}: {
  roleId: string;
  orgId: string;
  name: string;
  permissions: Permission[];
}) {
  const userResult = await readUser();
  if (!userResult.success) return userResult;
  const user = userResult.data;

  const membership = await requireOrgMember(user.id, orgId);
  if (!membership.success) {
    return redirect("/unauthorized");
  }

  const role = await db.role.findUnique({
    where: { id: roleId },
    select: { orgId: true, name: true, isSystem: true },
  });

  if (role?.orgId !== orgId) {
    throw new Error("Role not found");
  }

  if (role.isSystem) {
    throw new Error("System roles cannot be modified");
  }

  await db.role.update({
    where: { id: roleId },
    data: {
      name: name.trim(),
      permissions,
    },
  });

  return { success: true };
}

export async function deleteRole({
  roleId,
  orgId,
}: {
  roleId: string;
  orgId: string;
}) {
  const userResult = await readUser();
  if (!userResult.success) return userResult;
  const user = userResult.data;

  const membership = await requireOrgMember(user.id, orgId);
  if (!membership.success) {
    return redirect("/unauthorized");
  }

  const role = await db.role.findUnique({
    where: { id: roleId },
    select: { orgId: true, name: true, isSystem: true },
  });

  if (role?.orgId !== orgId) {
    throw new Error("Role not found");
  }

  if (role.isSystem) {
    throw new Error("System roles cannot be deleted");
  }

  await db.role.update({
    where: { id: roleId },
    data: { isArchived: true },
  });

  return { success: true };
}
