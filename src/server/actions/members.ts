"use server";

import { db } from "@/server/db";
import { type ActionResult } from "@/utils/actions";
import { readUser, requirePermission } from "@/server/auth/permissions";
import { Permission } from "generated/prisma";

interface AssignRoleToMemberArgs {
  orgId: string;
  roleId: string;
  userId: string;
}

export async function assignRoleToMember(
  args: AssignRoleToMemberArgs,
): Promise<ActionResult<void>> {
  const userResult = await readUser();
  if (!userResult.success) return userResult;
  const user = userResult.data;

  const { orgId, roleId, userId } = args;

  if (user.id === userId) {
    return {
      success: false,
      error: "Cannot assign role to self",
      code: "FORBIDDEN",
    };
  }

  const permissions = await requirePermission({
    userId: user.id,
    orgId,
    permission: Permission.MANAGE_MEMBERS,
  });
  if (!permissions.success) {
    return permissions;
  }

  try {
    // Ensure membership exists
    const membership = await db.membership.findUnique({
      where: {
        orgId_userId: { orgId, userId },
      },
    });

    if (!membership) {
      return {
        success: false,
        error: "User is not a member of this organization",
        code: "NOT_FOUND",
      };
    }

    // Ensure role belongs to the org
    const role = await db.role.findUnique({
      where: { id: roleId },
      select: { orgId: true, name: true, isSystem: true },
    });

    if (role?.orgId !== orgId) {
      return {
        success: false,
        error: "Invalid role",
        code: "VALIDATION",
      };
    }
    if (role.name === "Owner" && role.isSystem) {
      return {
        success: false,
        error: `"${role.name}" role cannot be assigned manually`,
        code: "FORBIDDEN",
      };
    }

    await db.membership.update({
      where: {
        orgId_userId: { orgId, userId },
      },
      data: { roleId },
    });

    return { success: true, data: undefined };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      error: "Failed to assign role",
      code: "UNKNOWN",
    };
  }
}

interface RemoveMemberArgs {
  orgId: string;
  userId: string;
}

export async function removeMember(
  args: RemoveMemberArgs,
): Promise<ActionResult<void>> {
  const userResult = await readUser();
  if (!userResult.success) return userResult;
  const user = userResult.data;

  const { orgId, userId } = args;

  if (user.id === userId) {
    return {
      success: false,
      error: "Cannot remove self",
      code: "FORBIDDEN",
    };
  }

  const permissions = await requirePermission({
    userId: user.id,
    orgId,
    permission: Permission.MANAGE_MEMBERS,
  });
  if (!permissions.success) {
    return permissions;
  }

  try {
    const membership = await db.membership.findUnique({
      where: {
        orgId_userId: { orgId, userId },
      },
      include: {
        role: {
          select: {
            name: true,
            isSystem: true,
          },
        },
      },
    });

    if (!membership) {
      return {
        success: false,
        error: "User is not a member of this organization",
        code: "NOT_FOUND",
      };
    }

    if (membership.role.name === "Owner" && membership.role.isSystem) {
      return {
        success: false,
        error: `Cannot remove ${membership.role.name}`,
        code: "FORBIDDEN",
      };
    }

    await db.membership.delete({
      where: {
        orgId_userId: { orgId, userId },
      },
    });

    return { success: true, data: undefined };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      error: "Failed to remove member",
      code: "UNKNOWN",
    };
  }
}
