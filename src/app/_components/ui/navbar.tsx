"use client";

import ThemeToggle from "@/app/_components/ui/theme-changer";
import { LogIn, LogOut } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

function NavbarControls() {
  const { data: session } = useSession();

  return (
    <div className="flex items-center gap-4">
      {session?.user ? (
        <div className="flex items-center gap-2 rounded-full bg-white/30 p-1 shadow-inner dark:bg-black/30">
          {/* Notification bell */}
          <button className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/20 text-slate-700 shadow-inner transition hover:bg-white/50 hover:shadow-md dark:bg-black/20 dark:text-slate-200 dark:hover:bg-black/50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
          </button>

          {/* Avatar */}
          <Link
            href="/profile"
            className="flex h-9 w-9 overflow-hidden rounded-full shadow-sm transition hover:shadow-md hover:contrast-125 dark:border-black"
          >
            <Image
              width={36}
              height={36}
              src={session.user.image ?? "/default-avatar.png"}
              alt={session.user.name ?? "User"}
              className="h-full w-full object-cover"
            />
          </Link>

          {/* Logout */}
          <button
            onClick={() => signOut()}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-red-500 text-white shadow-sm transition hover:bg-red-400 hover:shadow-md"
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      ) : (
        // Login icon button
        <button
          onClick={() => signIn("discord")}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm transition hover:bg-indigo-500 hover:shadow-md"
          aria-label="Login with Discord"
        >
          <LogIn className="h-5 w-5" />
        </button>
      )}

      {/* Theme toggle */}
      <ThemeToggle />
    </div>
  );
}

export default function Navbar() {
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current + 10) {
        // scrolling down → hide
        setHidden(true);
      } else if (currentScrollY < lastScrollY.current - 10) {
        // scrolling up → show
        setHidden(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-4 right-0 left-0 z-50 mx-auto max-w-6xl px-6 transition-transform duration-300 ${
        hidden ? "-translate-y-20" : "translate-y-0"
      }`}
    >
      {/* Glow */}
      <div className="absolute inset-0 -z-10 rounded-xl bg-indigo-100/10 blur-2xl dark:bg-indigo-900/10" />

      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/40 px-5 py-2.5 shadow-lg backdrop-blur-md dark:border-black/20 dark:bg-black/40">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-bold text-slate-900 transition-colors hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
        >
          XIV Calendar
        </Link>

        {/* Right actions */}
        <NavbarControls />
      </div>
    </header>
  );
}
