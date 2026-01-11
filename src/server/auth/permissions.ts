import { db } from "@/server/db";
import { type Permission } from "generated/prisma";
import { type ActionResult } from "@/utils/actions";

interface RequirePermissionArgs {
  userId: string;
  orgId: string;
  permission: Permission;
}

export async function requirePermission(
  args: RequirePermissionArgs,
): Promise<ActionResult<void>> {
  const { userId, orgId, permission } = args;

  const membership = await db.membership.findUnique({
    where: {
      orgId_userId: {
        orgId,
        userId,
      },
    },
    include: {
      role: true,
    },
  });

  if (!membership) {
    return {
      success: false,
      error: "You are not a member of this organization",
      code: "FORBIDDEN",
    };
  }

  if (!membership.role.permissions.includes(permission)) {
    return {
      success: false,
      error: "You do not have permission to perform this action",
      code: "FORBIDDEN",
    };
  }

  return { success: true, data: undefined };
}
