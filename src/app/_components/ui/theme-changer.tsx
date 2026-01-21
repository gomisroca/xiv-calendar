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
    <div className="ml-2 flex items-center">
      <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="relative flex h-9 w-16 cursor-pointer items-center rounded-full bg-white/30 p-1 shadow-inner backdrop-blur-sm transition-all duration-300 dark:bg-black/30"
      >
        {/* Sun & Moon */}
        <span className="absolute left-2 text-sm text-yellow-400">🌞</span>
        <span className="absolute right-2 text-sm text-gray-400 dark:text-yellow-300">
          🌙
        </span>

        {/* Toggle circle */}
        <span
          className={`absolute top-1 h-7 w-7 rounded-full bg-white shadow transition-transform duration-300 dark:bg-gray-900 ${
            isDark ? "translate-x-7" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
