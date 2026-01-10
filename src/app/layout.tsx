import "@/styles/globals.css";

import { type Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Geist } from "next/font/google";
import ThemeChanger from "./theme-changer";

export const metadata: Metadata = {
  title: "XIV Calendar",
  description: "Organize your XIV life with ease",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col items-center justify-center bg-linear-to-b/shorter from-sky-700 from-65% to-indigo-950 text-white dark:from-[#002349] dark:to-[#09002f]">
        <ThemeProvider attribute="class">
          {/* TODO: Add a navbar */}
          <ThemeChanger />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
