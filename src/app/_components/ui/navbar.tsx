import ThemeToggle from "@/app/_components/ui/theme-changer";
import { auth, signIn, signOut } from "@/server/auth";
import Link from "next/link";

export default async function Navbar() {
  const session = await auth();

  return (
    <header className="w-full border-b bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo / site name */}
        <Link href="/" className="text-2xl font-bold text-indigo-600">
          XIV Calendar
        </Link>

        {/* Right side: auth */}
        <div>
          {session?.user ? (
            <button
              onClick={() => signOut()}
              className="rounded-lg bg-red-500 px-4 py-2 text-white transition hover:bg-red-400"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => signIn("discord")}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-500"
            >
              Login with Discord
            </button>
          )}
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
