"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { DiscordButton } from "@/app/landing";

export default function NotFoundShell({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  const session = useSession();
  return (
    <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-sm dark:bg-black">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
        🤖
      </div>

      <h1 className="text-2xl font-semibold">{title}</h1>

      {description && (
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}

      <div className="mt-10 flex flex-col items-center gap-4">
        {session?.data?.user ? (
          <Link
            href="/dashboard"
            className="rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white transition hover:bg-indigo-500"
          >
            Go to dashboard
          </Link>
        ) : (
          <DiscordButton />
        )}
        <Link
          href="/"
          className="rounded-lg border px-5 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
