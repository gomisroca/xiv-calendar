"use server";

import { z } from "zod";
import { db } from "@/server/db";
import { EventStatus, Permission } from "generated/prisma";
import type { ActionResult } from "@/utils/actions";
import {
  checkUser,
  requireEventOrgMember,
  requireOrgMember,
  requirePermission,
} from "../auth/permissions";
import { env } from "@/env";
import {
  getEventAttendanceCounts,
  RATE_LIMIT_MS,
  renderEventEmbed,
} from "@/utils/events";
import { redirect } from "next/navigation";

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
  const userCheck = await checkUser();
  if (!userCheck.success) return userCheck;

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
    userId: userCheck.data.id,
    orgId: orgId,
    permission: Permission.EVENT_CREATE,
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
          createdById: userCheck.data.id,
          description,
          location,
        },
      });

      await trx.eventAttendance.create({
        data: {
          eventId: event.id,
          userId: userCheck.data.id,
          status: EventStatus.ATTENDING,
        },
      });

      return event;
    });

    const fullEvent = await db.event.findUnique({
      where: { id: event.id },
      select: {
        id: true,
        name: true,
        description: true,
        location: true,
        startsAt: true,
        endsAt: true,
        orgId: true,
        createdBy: { select: { name: true } },
        discordChannelId: true,
        discordMessageId: true,
      },
    });
    if (!fullEvent) return { success: false, error: "Failed to create event" };

    const attendance = await getEventAttendanceCounts(
      fullEvent.id,
      fullEvent.orgId,
    );

    const eventForDiscord = {
      id: fullEvent.id,
      name: fullEvent.name,
      description: fullEvent.description,
      location: fullEvent.location,
      startsAt: fullEvent.startsAt,
      endsAt: fullEvent.endsAt,
      createdByName: fullEvent.createdBy.name,
      attendance,
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
  const userCheck = await checkUser();
  if (!userCheck.success) return userCheck;

  const membership = await requireOrgMember(userCheck.data.id, orgId);
  if (!membership.success) {
    return redirect("/unauthorized");
  }

  try {
    const organization = await db.organization.findUnique({
      where: {
        id: orgId,
        memberships: {
          some: { userId: userCheck.data.id },
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
  const userCheck = await checkUser();
  if (!userCheck.success) return userCheck;

  const membership = await requireEventOrgMember(userCheck.data.id, eventId);
  if (!membership.success) {
    return redirect("/unauthorized");
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
  const userCheck = await checkUser();
  if (!userCheck.success) return userCheck;

  const parsed = RSVPEventSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
      code: "VALIDATION",
    };
  }

  const { eventId, status } = parsed.data;

  const membership = await requireEventOrgMember(userCheck.data.id, eventId);
  if (!membership.success) {
    return redirect("/unauthorized");
  }

  try {
    const event = await db.event.findUnique({
      where: { id: eventId },
      include: {
        org: { select: { id: true } },
      },
    });
    if (!event)
      return { success: false, error: "Event not found", code: "NOT_FOUND" };

    const existing = await db.eventAttendance.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: userCheck.data.id,
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
          userId: userCheck.data.id,
        },
      },
      update: { status },
      create: {
        eventId,
        userId: userCheck.data.id,
        status,
      },
    });

    const updatedEvent = await db.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        name: true,
        description: true,
        location: true,
        startsAt: true,
        endsAt: true,
        orgId: true,
        createdBy: { select: { name: true } },
        discordChannelId: true,
        discordMessageId: true,
      },
    });
    if (!updatedEvent) {
      return { success: false, error: "Event not found", code: "NOT_FOUND" };
    }

    const attendance = await getEventAttendanceCounts(
      updatedEvent.id,
      updatedEvent.orgId,
    );

    const eventForDiscord = {
      id: updatedEvent.id,
      name: updatedEvent.name,
      description: updatedEvent.description,
      location: updatedEvent.location,
      startsAt: updatedEvent.startsAt,
      endsAt: updatedEvent.endsAt,
      createdByName: updatedEvent.createdBy.name,
      attendance,
    };

    const embed = renderEventEmbed(eventForDiscord);

    if (updatedEvent.discordMessageId && updatedEvent.discordChannelId) {
      await fetch(`${env.BOT_URL}/update-event`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-bot-secret": env.BOT_SECRET,
        },
        body: JSON.stringify({
          channelId: updatedEvent.discordChannelId,
          messageId: updatedEvent.discordMessageId,
          eventId: updatedEvent.id,
          eventStartTime: updatedEvent.startsAt,
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

export type UserEvent = {
  id: string;
  name: string;
  startsAt: Date;
  endsAt: Date | null;
  description: string | null;
  location: string | null;

  organization: {
    id: string;
    name: string;
    slug: string;
  };

  myStatus: EventStatus | null;
  attendanceCounts: {
    attending: number;
    maybe: number;
    notAttending: number;
    pending: number;
  };
};

export type UserEventsFilter = "ALL" | "UPCOMING" | "PAST";

export async function getUserEvents({
  filter = "UPCOMING",
}: {
  filter?: UserEventsFilter;
} = {}): Promise<ActionResult<UserEvent[]>> {
  const userCheck = await checkUser();
  if (!userCheck.success) return userCheck;

  const now = new Date();

  const timeFilter =
    filter === "UPCOMING"
      ? { startsAt: { gte: now } }
      : filter === "PAST"
        ? { startsAt: { lt: now } }
        : {};

  try {
    const events = await db.event.findMany({
      where: {
        ...timeFilter,
        org: {
          memberships: {
            some: {
              userId: userCheck.data.id,
            },
          },
        },
      },
      orderBy: {
        startsAt: filter === "PAST" ? "desc" : "asc",
      },
      include: {
        org: {
          select: {
            id: true,
            name: true,
            slug: true,
            _count: {
              select: { memberships: true },
            },
          },
        },
        eventAttendances: {
          select: {
            userId: true,
            status: true,
          },
        },
      },
    });

    const mapped: UserEvent[] = events.map((event) => {
      const myAttendance = event.eventAttendances.find(
        (a) => a.userId === userCheck.data.id,
      );

      const counts = {
        attending: 0,
        maybe: 0,
        notAttending: 0,
        pending: event.org._count.memberships,
      };

      for (const a of event.eventAttendances) {
        if (a.status === "ATTENDING") counts.attending++;
        if (a.status === "MAYBE") counts.maybe++;
        if (a.status === "NOT_ATTENDING") counts.notAttending++;
      }

      return {
        id: event.id,
        name: event.name,
        startsAt: event.startsAt,
        endsAt: event.endsAt,
        description: event.description,
        location: event.location,
        organization: event.org,
        myStatus: myAttendance?.status ?? null,
        attendanceCounts: counts,
      };
    });

    return {
      success: true,
      data: mapped,
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      error: "Failed to load events",
      code: "UNKNOWN",
    };
  }
}

export async function getOrgIdFromEvent(
  eventId: string,
): Promise<string | null> {
  const event = await db.event.findUnique({
    where: { id: eventId },
    select: { orgId: true },
  });

  return event?.orgId ?? null;
}
