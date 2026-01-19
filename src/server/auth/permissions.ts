import { db } from "@/server/db";
import { type Membership, type Permission, type User } from "generated/prisma";
import { type ActionResult } from "@/utils/actions";
import { auth } from ".";

interface RequirePermissionArgs {
  userId: string;
  orgId: string;
  permission: Permission;
}

export async function checkUser(): Promise<ActionResult<User>> {
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

export async function isMember({
  userId,
  orgId,
  eventId,
}: {
  userId: string;
  orgId?: string;
  eventId?: string;
}): Promise<ActionResult<void>> {
  if (!orgId && !eventId) {
    return {
      success: false,
      error: "You must specify either an organization or an event ID",
      code: "VALIDATION",
    };
  }

  let membership: Membership | null = null;
  if (orgId) {
    membership = await db.membership.findUnique({
      where: {
        orgId_userId: {
          orgId,
          userId,
        },
      },
    });
  } else if (eventId) {
    const event = await db.event.findUnique({
      where: {
        id: eventId,
      },
      include: {
        org: true,
      },
    });

    if (!event)
      return {
        success: false,
        error: "Event not found",
        code: "NOT_FOUND",
      };

    membership = await db.membership.findUnique({
      where: {
        orgId_userId: {
          orgId: event.orgId,
          userId,
        },
      },
    });
  }

  if (!membership)
    return {
      success: false,
      error: "You do not belong to this organization",
      code: "FORBIDDEN",
    };

  return { success: true, data: undefined };
}
