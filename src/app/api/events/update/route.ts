import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { EventStatus } from "generated/prisma";
import { env } from "@/env";
import { z } from "zod";
import {
  getEventAttendanceCounts,
  RATE_LIMIT_MS,
  renderEventEmbed,
} from "@/utils/events";

const DiscordRSVPSchema = z.object({
  eventId: z.string(),
  discordUserId: z.string(),
  status: z.enum([
    EventStatus.ATTENDING,
    EventStatus.NOT_ATTENDING,
    EventStatus.MAYBE,
  ]),
});

export async function POST(req: NextRequest): Promise<Response> {
  if (req.headers.get("x-bot-secret") !== env.BOT_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = DiscordRSVPSchema.safeParse(await req.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { eventId, discordUserId, status } = parsed.data;

  if (!eventId || !discordUserId || !status) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  const event = await db.event.findUnique({
    where: { id: eventId },
    include: {
      org: { include: { memberships: true } },
      createdBy: { select: { name: true } },
      eventAttendances: { include: { user: { select: { name: true } } } },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const account = await db.account.findFirst({
    where: { providerAccountId: discordUserId },
  });

  if (!account) {
    return NextResponse.json({ error: "User not linked" }, { status: 404 });
  }

  const existing = await db.eventAttendance.findUnique({
    where: {
      eventId_userId: {
        eventId,
        userId: account.userId,
      },
    },
  });

  if (existing) {
    if (existing.status === status) {
      return NextResponse.json({ success: true });
    }

    if (Date.now() - existing.updatedAt.getTime() < RATE_LIMIT_MS) {
      return NextResponse.json({ success: true });
    }
  }

  await db.eventAttendance.upsert({
    where: {
      eventId_userId: {
        eventId: event.id,
        userId: account.userId,
      },
    },
    update: { status },
    create: {
      eventId: event.id,
      userId: account.userId,
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
    return NextResponse.json(
      { success: false, error: "Event not found", code: "NOT_FOUND" },
      { status: 404 },
    );
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

  return NextResponse.json({ success: true });
}
