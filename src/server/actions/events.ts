"use server";

import { z } from "zod";
import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { EventStatus, Permission } from "generated/prisma";
import type { ActionResult } from "@/utils/actions";
import { requirePermission } from "../auth/permissions";
import { env } from "@/env";
import {
  computeAttendanceSummary,
  RATE_LIMIT_MS,
  renderEventEmbed,
} from "@/utils/events";

const CreateEventSchema = z.object({
  orgId: z.string(),
  discordChannelId: z.string(),
  name: z.string().min(1, "Event name is required"),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
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

  const {
    orgId,
    discordChannelId,
    name,
    startsAt,
    endsAt,
    description,
    location,
  } = parsed.data;

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
    const event = await db.$transaction(async (trx) => {
      const event = await trx.event.create({
        data: {
          name,
          startsAt,
          endsAt,
          orgId,
          createdById: session.user.id,
          description,
          location,
        },
      });

      await trx.eventAttendance.create({
        data: {
          eventId: event.id,
          userId: session.user.id,
          status: EventStatus.ATTENDING,
        },
      });

      return event;
    });

    const fullEvent = await db.event.findUnique({
      where: { id: event.id },
      include: {
        createdBy: { select: { id: true, name: true } },
        eventAttendances: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
    });
    if (!fullEvent) return { success: false, error: "Failed to create event" };

    const rawAttendances = fullEvent.eventAttendances.map((a) => ({
      status: a.status,
      user: {
        name: a.user.name,
      },
    }));
    const attendanceSummary = computeAttendanceSummary(rawAttendances);

    const eventForDiscord = {
      id: fullEvent.id,
      name: fullEvent.name,
      description: fullEvent.description,
      location: fullEvent.location,
      startsAt: fullEvent.startsAt,
      endsAt: fullEvent.endsAt,
      createdByName: fullEvent.createdBy.name,
      attendance: attendanceSummary,
    };

    const embed = renderEventEmbed(eventForDiscord);

    type PostEventResponse = {
      channelId: string;
      messageId: string;
    };

    const botRes = await fetch(`${env.BOT_URL}/update-event`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-bot-secret": env.BOT_SECRET,
      },
      body: JSON.stringify({
        channelId: discordChannelId,
        eventId: event.id,
        eventStartTime: event.startsAt,
        embed,
      }),
    });

    console.log(botRes);

    if (!botRes.ok) {
      throw new Error("Failed to post event to Discord");
    }

    const { channelId, messageId } = (await botRes.json()) as PostEventResponse;

    console.log(channelId, messageId);

    await db.event.update({
      where: { id: event.id },
      data: {
        discordChannelId: channelId,
        discordMessageId: messageId,
      },
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

export async function getSingleEvent({
  eventId,
}: {
  eventId: string;
}): Promise<ActionResult<EventWithAttendance>> {
  const session = await auth();

  if (!session?.user) {
    return {
      success: false,
      error: "You must be signed in",
      code: "UNAUTHORIZED",
    };
  }

  try {
    const event = await db.event.findUnique({
      where: {
        id: eventId,
      },
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
    });
    if (!event) {
      return {
        success: false,
        error: "Event not found",
        code: "NOT_FOUND",
      };
    }

    const mapped: EventWithAttendance = {
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

    return {
      success: true,
      data: mapped,
    };
  } catch (err: unknown) {
    console.error(err);
    return {
      success: false,
      error: "Failed to get event",
      code: "UNKNOWN",
    };
  }
}

const RSVPEventSchema = z.object({
  eventId: z.string().cuid(),
  status: z.enum([
    EventStatus.ATTENDING,
    EventStatus.NOT_ATTENDING,
    EventStatus.MAYBE,
  ]),
});

export async function rsvpToEvent(
  input: unknown,
): Promise<ActionResult<{ status: EventStatus }>> {
  const session = await auth();
  if (!session?.user) {
    return {
      success: false,
      error: "You must be signed in",
      code: "UNAUTHORIZED",
    };
  }

  const parsed = RSVPEventSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
      code: "VALIDATION",
    };
  }

  const { eventId, status } = parsed.data;

  try {
    const existing = await db.eventAttendance.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: session.user.id,
        },
      },
    });

    if (existing) {
      if (existing.status === status) {
        return { success: true, data: { status } };
      }

      if (Date.now() - existing.updatedAt.getTime() < RATE_LIMIT_MS) {
        return {
          success: true,
          data: { status: existing.status },
        };
      }
    }

    await db.eventAttendance.upsert({
      where: {
        eventId_userId: {
          eventId,
          userId: session.user.id,
        },
      },
      update: { status },
      create: {
        eventId,
        userId: session.user.id,
        status,
      },
    });

    const event = await db.event.findUnique({
      where: { id: eventId },
      include: {
        createdBy: { select: { name: true } },
        eventAttendances: {
          include: { user: { select: { name: true } } },
        },
        org: { include: { memberships: true } },
      },
    });
    if (!event) {
      return { success: false, error: "Event not found", code: "NOT_FOUND" };
    }

    const attendanceSummary = computeAttendanceSummary(
      event.eventAttendances.map((a) => ({
        status: a.status,
        user: { name: a.user.name },
      })),
    );

    const eventForDiscord = {
      id: event.id,
      name: event.name,
      description: event.description,
      location: event.location,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      createdByName: event.createdBy.name,
      attendance: attendanceSummary,
    };

    const embed = renderEventEmbed(eventForDiscord);

    if (event.discordMessageId && event.discordChannelId) {
      await fetch(`${env.BOT_URL}/update-event`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-bot-secret": env.BOT_SECRET,
        },
        body: JSON.stringify({
          channelId: event.discordChannelId,
          messageId: event.discordMessageId,
          eventId: event.id,
          eventStartTime: event.startsAt,
          embed,
        }),
      });
    }

    return { success: true, data: { status } };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      error: "Failed to RSVP",
      code: "UNKNOWN",
    };
  }
}
