"use server";

import { z } from "zod";
import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { EventStatus, Permission } from "generated/prisma";
import type { ActionResult } from "@/utils/actions";
import { requirePermission } from "../auth/permissions";

const CreateEventSchema = z.object({
  orgId: z.string().cuid(),
  name: z.string().min(1, "Event name is required"),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date().optional(),
});

export async function createEvent(
  input: unknown,
): Promise<ActionResult<string>> {
  const session = await auth();
  if (!session?.user) {
    return {
      success: false,
      error: "You must be signed in",
      code: "UNAUTHORIZED",
    };
  }

  const parsed = CreateEventSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid event data",
      code: "VALIDATION",
    };
  }

  const { orgId, name, startsAt, endsAt } = parsed.data;

  const permissions = await requirePermission({
    userId: session.user.id,
    orgId: orgId,
    permission: Permission.CREATE_EVENT,
  });
  if (!permissions.success) {
    return permissions;
  }

  if (endsAt && endsAt < startsAt) {
    return {
      success: false,
      error: "End date must be after start date",
      code: "VALIDATION",
    };
  }

  try {
    await db.$transaction(async (trx) => {
      const event = await trx.event.create({
        data: {
          name,
          startsAt,
          endsAt,
          orgId,
          createdById: session.user.id,
        },
      });

      await trx.eventAttendance.create({
        data: {
          eventId: event.id,
          userId: session.user.id,
          status: EventStatus.ATTENDING,
        },
      });
    });

    return {
      success: true,
      data: "Event created successfully",
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      error: "Failed to create event",
      code: "UNKNOWN",
    };
  }
}

export type EventWithAttendance = {
  id: string;
  name: string;
  startsAt: Date;
  endsAt: Date | null;
  description: string | null;
  location: string | null;
  attendance: {
    userId: string;
    userName: string;
    status: EventStatus;
  }[];
  createdBy: {
    id: string;
    name: string;
  };
};

export async function getOrganizationEvents({
  orgId,
}: {
  orgId: string;
}): Promise<ActionResult<EventWithAttendance[]>> {
  const session = await auth();

  if (!session?.user) {
    return {
      success: false,
      error: "You must be signed in",
      code: "UNAUTHORIZED",
    };
  }

  try {
    const organization = await db.organization.findUnique({
      where: {
        id: orgId,
        memberships: {
          some: { userId: session.user.id },
        },
      },
      include: {
        events: {
          orderBy: { startsAt: "asc" },
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
              },
            },
            eventAttendances: {
              select: {
                userId: true,
                user: {
                  select: {
                    name: true,
                  },
                },
                status: true,
              },
            },
          },
        },
      },
    });
    if (!organization) {
      return {
        success: false,
        error: "Organization not found or you do not belong to it",
        code: "NOT_FOUND",
      };
    }
    if (!organization.events.length) {
      return {
        success: true,
        data: [],
      };
    }

    const mapped: EventWithAttendance[] = organization?.events.map((event) => {
      return {
        id: event.id,
        name: event.name,
        startsAt: event.startsAt,
        endsAt: event.endsAt,
        description: event.description,
        location: event.location,
        attendance: event.eventAttendances.map((attendance) => {
          return {
            userId: attendance.userId,
            userName: attendance.user.name,
            status: attendance.status,
          };
        }),
        createdBy: {
          id: event.createdBy.id,
          name: event.createdBy.name,
        },
      };
    });

    return {
      success: true,
      data: mapped,
    };
  } catch (err: unknown) {
    console.error(err);
    return {
      success: false,
      error: "Failed to get events",
      code: "UNKNOWN",
    };
  }
}
