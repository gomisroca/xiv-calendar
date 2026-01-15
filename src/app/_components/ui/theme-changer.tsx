"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex h-10 w-20 cursor-pointer items-center rounded-full bg-gray-200 px-1 transition-colors duration-300 dark:bg-gray-800"
    >
      {/* Sun and Moon icons */}
      <span className="absolute left-2 text-yellow-500">🌞</span>
      <span className="absolute right-2 text-gray-200 dark:text-yellow-300">
        🌙
      </span>

      {/* The toggle circle */}
      <span
        className={`absolute top-1 left-1 h-8 w-8 transform rounded-full bg-white shadow-md transition-transform duration-300 ${isDark ? "translate-x-10" : "translate-x-0"}`}
      />
    </button>
  );
}
