import "@/styles/globals.css";

import { NextSSRPlugin as UploadThingSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { UploadThingRouter } from "@/app/api/uploadthing/core";
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
  modal,
}: Readonly<{ children: React.ReactNode; modal: React.ReactNode }>) {
  const session = await auth();
  return (
    <html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
      <body className="relative min-h-screen text-black dark:text-white">
        <div className="fixed inset-0 -z-10 bg-linear-to-b/shorter from-indigo-100 via-sky-200 to-white dark:from-[#00162f] dark:via-[#012538] dark:to-black" />
        <div className="pointer-events-none fixed inset-0 -z-10 bg-black/10" />

        <UploadThingSSRPlugin
          routerConfig={extractRouterConfig(UploadThingRouter)}
        />
        <SessionProvider session={session}>
          <ThemeProvider attribute="class">
            <Navbar />

            <main className="relative flex-1">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-32 mx-auto h-[70%] max-w-6xl rounded-3xl bg-indigo-200/10 blur-3xl dark:bg-[#00162f]/10"
              />
              <section className="mx-auto mt-24 mb-6 flex max-w-6xl min-w-2xl flex-col items-center gap-14 rounded-2xl bg-linear-to-b from-slate-50 to-white px-6 py-28 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.25)] ring-1 ring-black/5 dark:from-slate-900 dark:to-slate-950 dark:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.7)] dark:ring-white/5">
                {children}
              </section>
            </main>

            <div id="modal-root" />
            {modal}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
