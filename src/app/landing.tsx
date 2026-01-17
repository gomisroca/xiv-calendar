"use client";

import { signIn } from "next-auth/react";

function DiscordIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 127.14 96.36"
      fill="currentColor"
      aria-hidden
    >
      <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.35,2.66-2.06a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.4,2.66,2.06a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69c-6.3,0-11.45-5.76-11.45-12.84S36.06,40,42.45,40s11.54,5.8,11.45,12.89S48.84,65.69,42.45,65.69Zm42.24,0c-6.3,0-11.45-5.76-11.45-12.84S78.3,40,84.69,40s11.54,5.8,11.45,12.89S91.08,65.69,84.69,65.69Z" />
    </svg>
  );
}

export function DiscordButton() {
  return (
    <button
      onClick={() => signIn("discord")}
      className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white shadow-sm transition hover:bg-indigo-500"
    >
      <DiscordIcon />
      Continue with Discord
    </button>
  );
}

export default function LandingPage() {
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
