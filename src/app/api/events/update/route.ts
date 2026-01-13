import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { EventStatus } from "generated/prisma";
import { env } from "@/env";
import { z } from "zod";

const DiscordRSVPSchema = z.object({
  eventId: z.string(),
  discordUserId: z.string(),
  emoji: z.enum(["✅", "❌"]),
});

export async function POST(req: NextRequest) {
  // 1. Authenticate bot
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

  const { eventId, discordUserId, emoji } = parsed.data;

  if (!eventId || !discordUserId || !emoji) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  const status =
    emoji === "✅"
      ? EventStatus.ATTENDING
      : emoji === "❌"
        ? EventStatus.NOT_ATTENDING
        : null;

  if (!status) {
    return NextResponse.json({ error: "Invalid emoji" }, { status: 400 });
  }

  // 2. Find event
  const event = await db.event.findUnique({
    where: { id: eventId },
    include: {
      org: true,
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // 3. Find user account
  const account = await db.account.findFirst({
    where: { providerAccountId: discordUserId },
  });

  if (!account) {
    return NextResponse.json({ error: "User not linked" }, { status: 404 });
  }

  // 4. Update RSVP
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

  // 5. Ask bot to re-render Discord message
  await fetch(`${env.BOT_URL}/update-event`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-bot-secret": env.BOT_SECRET,
    },
    body: JSON.stringify({
      eventId: event.id,
    }),
  });

  return NextResponse.json({ success: true });
}
