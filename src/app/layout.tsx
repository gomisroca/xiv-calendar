import "@/styles/globals.css";

import { type Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Geist } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/server/auth";
import Navbar from "./_components/ui/navbar";

export const metadata: Metadata = {
  title: "XIV Calendar",
  description: "Organize your XIV life with ease",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  return (
    <html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col items-center justify-center bg-linear-to-b/shorter from-sky-700 from-65% to-indigo-950 text-black dark:from-[#002349] dark:to-[#09002f] dark:text-white">
        <SessionProvider session={session}>
          <ThemeProvider attribute="class">
            <Navbar />
            <main className="min-h-screen bg-linear-to-b from-slate-100 to-white dark:from-slate-900 dark:to-black">
              <section className="mx-auto flex max-w-6xl min-w-2xl flex-col items-center gap-14 px-6 py-28">
                {children}
              </section>
              <div className="pointer-events-none relative">
                {/* Subtle glow */}
                <div className="absolute -inset-4 -z-10 rounded-xl bg-indigo-100/40 blur-2xl" />
              </div>
            </main>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
