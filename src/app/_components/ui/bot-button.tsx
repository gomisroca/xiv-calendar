import Link from "next/link";
import { DiscordIcon } from "./discord-button";
import { env } from "@/env";

export default async function BotButton() {
  return (
    <Link
      href={`https://discord.com/oauth2/authorize?client_id=${env.NEXT_PUBLIC_BOT_ID}&permissions=17600775989312&integration_type=0&scope=bot`}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <DiscordIcon />
      Invite Bot
    </Link>
  );
}
