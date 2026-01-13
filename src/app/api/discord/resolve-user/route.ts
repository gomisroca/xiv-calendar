import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { env } from "@/env";

const ResolveDiscordUserSchema = z.object({
  discordUserId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  // 🔐 Bot authentication
  if (req.headers.get("x-bot-secret") !== env.BOT_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 🧼 Parse + validate body (no `any`)
  const parsed = ResolveDiscordUserSchema.safeParse(await req.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { discordUserId } = parsed.data;

  // 🔎 Find user account
  const account = await db.account.findFirst({
    where: { providerAccountId: discordUserId },
    select: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!account) {
    return NextResponse.json(
      {
        error: "User not linked",
        code: "NOT_LINKED",
        message: "User must log in via Discord first",
      },
      { status: 404 },
    );
  }

  // ✅ Success
  return NextResponse.json({
    success: true,
    data: {
      userId: account.user.id,
      name: account.user.name,
    },
  });
}
