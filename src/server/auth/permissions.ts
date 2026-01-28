import { db } from "@/server/db";
import { type Permission, type User } from "generated/prisma";
import { type ActionResult } from "@/utils/actions";
import { auth } from ".";
import { readOrgIdFromEvent } from "@/utils/events";
import { redirect } from "next/navigation";

interface RequirePermissionArgs {
  userId: string;
  orgId: string;
  permission: Permission;
}

export async function readUser(): Promise<ActionResult<User>> {
  const session = await auth();
  if (!session?.user) {
    return {
      success: false,
      error: "You must be signed in",
      code: "UNAUTHORIZED",
    };
  }

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!user) {
    return {
      success: false,
      error: "You are not a registered user",
      code: "NOT_FOUND",
    };
  }

  return { success: true, data: user };
}

export async function requireUser(redirectTo = "/unauthorized"): Promise<User> {
  const result = await readUser();

  if (!result.success) {
    redirect(redirectTo);
  }

  return result.data;
}

export function can(permissions: Set<Permission>, permission: Permission) {
  return permissions.has(permission);
}

export async function getUserPermissions({
  userId,
  orgId,
}: {
  userId: string;
  orgId: string;
}): Promise<Set<Permission>> {
  const membership = await db.membership.findUnique({
    where: {
      orgId_userId: { orgId, userId },
    },
    select: {
      role: {
        select: {
          permissions: true,
        },
      },
    },
  });

  if (!membership?.role) return new Set();

  return new Set(membership.role.permissions);
}

export async function hasPermission({
  userId,
  orgId,
  permission,
}: RequirePermissionArgs): Promise<boolean> {
  const membership = await db.membership.findUnique({
    where: { orgId_userId: { orgId, userId } },
    include: { role: true },
  });

  return !!membership?.role.permissions.includes(permission);
}

export async function requirePermission(
  args: RequirePermissionArgs,
): Promise<ActionResult<void>> {
  const { userId, orgId, permission } = args;

  if (!(await hasPermission({ userId, orgId, permission }))) {
    return {
      success: false,
      error: "You do not have permission",
      code: "FORBIDDEN",
    };
  }
  return { success: true, data: undefined };
}

export async function isOrgMember(
  userId: string,
  orgId: string,
): Promise<boolean> {
  const membership = await db.membership.findUnique({
    where: {
      orgId_userId: { orgId, userId },
    },
    select: { userId: true },
  });

  return !!membership;
}

export async function requireOrgMember(
  userId: string,
  orgId: string,
): Promise<ActionResult<void>> {
  const isMember = await isOrgMember(userId, orgId);

  if (!isMember) {
    return {
      success: false,
      error: "You do not belong to this organization",
      code: "FORBIDDEN",
    };
  }

  return { success: true, data: undefined };
}

export async function requireEventOrgMember(
  userId: string,
  eventId: string,
): Promise<ActionResult<void>> {
  const orgId = await readOrgIdFromEvent(eventId);

  if (!orgId) {
    return {
      success: false,
      error: "Event not found",
      code: "NOT_FOUND",
    };
  }

  return requireOrgMember(userId, orgId);
}
