"use client";

import Link from "next/link";
import DiscordButton from "@/app/_components/ui/discord-button";

export default function LoggedOutLanding() {
  return (
    <>
      <div>
        <h1 className="mb-4 text-5xl font-bold">XIV Calendar</h1>
        <p className="mb-8 text-lg">
          RSVP to events directly from Discord or the web.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4">
          <DiscordButton />

          <span className="text-sm text-slate-500">
            No extra accounts · One click
          </span>

          <Link
            href="/docs/getting-started"
            className="rounded-lg border px-5 py-2.5 text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-950"
          >
            How it works
          </Link>
        </div>
      </div>
      <div className="pointer-events-none rounded-xl bg-white p-6 shadow-sm dark:bg-black">
        <div className="space-y-3 text-sm">
          <div className="font-semibold">🎉 Friday Game Night</div>
          <div className="text-slate-500">Hosted in Discord</div>

          <div className="mt-4 flex gap-2">
            <span className="rounded bg-green-100 px-3 py-1 text-green-700">
              ✅ Attending (5)
            </span>
            <span className="rounded bg-indigo-100 px-3 py-1 text-indigo-700">
              ❓ Maybe (2)
            </span>
            <span className="rounded bg-red-100 px-3 py-1 text-red-700">
              ❌ Declined (1)
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
