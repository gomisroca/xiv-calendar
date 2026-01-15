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
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
