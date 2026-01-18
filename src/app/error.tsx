"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const session = useSession();

  return (
    <main className="flex min-h-screen items-center justify-center bg-linear-to-b from-slate-100 to-white px-6 dark:from-slate-900 dark:to-black">
      <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-sm dark:bg-black">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
          ⚠️
        </div>

        <h1 className="text-2xl font-semibold">Something went wrong</h1>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          An unexpected error occurred. You can try again or return to safety.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={reset}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white transition hover:bg-indigo-500"
          >
            Try again
          </button>

          {session?.data?.user ? (
            <Link
              href="/dashboard"
              className="rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white transition hover:bg-indigo-500"
            >
              Go to dashboard
            </Link>
          ) : (
            <Link
              href="/"
              className="rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white transition hover:bg-indigo-500"
            >
              Go to homepage
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
