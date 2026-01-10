import { redirect } from "next/navigation";

import { auth, signIn, signOut } from "@/server/auth";
import Calendar from "./calendar";

export default async function Home() {
  const session = await auth();

  return (
    <>
      <Calendar />
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <div className="flex flex-col items-center justify-center gap-4">
          <p className="text-center text-2xl text-white">
            {session && <span>Logged in as {session.user?.name}</span>}
          </p>
          {!session ? (
            <form>
              <button
                className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
                formAction={async () => {
                  "use server";
                  await signIn("discord");
                }}
              >
                Sign in with Discord
              </button>
            </form>
          ) : (
            <form>
              <button
                className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
                formAction={async () => {
                  "use server";
                  await signOut();
                  redirect("/");
                }}
              >
                Sign out
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
