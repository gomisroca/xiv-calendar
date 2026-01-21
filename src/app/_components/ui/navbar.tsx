"use client";

import ThemeToggle from "@/app/_components/ui/theme-changer";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function Navbar() {
  const session = useSession();

  return (
    <header className="fixed top-0 z-50 w-full bg-white shadow-sm dark:bg-black dark:shadow-white/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo / site name */}
        <Link href="/" className="text-2xl font-bold text-indigo-600">
          XIV Calendar
        </Link>

        {/* Right side: auth */}
        <div className="flex gap-2">
          {session?.data?.user ? (
            <button
              onClick={() => signOut()}
              className="cursor-pointer rounded-lg bg-red-500 px-4 py-2 text-white transition hover:bg-red-400"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => signIn("discord")}
              className="cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-500"
            >
              Login with Discord
            </button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
