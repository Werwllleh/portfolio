"use client";

import React from "react";
import { useTheme } from "@/context/theme-context";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={(e) => toggleTheme(e)}
      aria-label={isDark ? "Переключить на светлую тему" : "Переключить на темную тему"}
      className="group relative inline-flex h-11 items-center gap-2.5 rounded-xl border border-hairline/80 bg-surface/50 px-3.5 text-text-muted backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-lime/50 hover:bg-surface hover:text-text-primary hover:shadow-[0_0_20px_rgba(226,241,99,0.15)] focus:outline-none focus:ring-1 focus:ring-lime"
    >
      <span className="relative flex h-5 w-5 items-center justify-center transition-transform group-hover:scale-110">
        {isDark ? (
          /* Sun Icon */
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 text-lime transition-colors"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
          </svg>
        ) : (
          /* Moon Icon */
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 text-lime transition-colors"
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
        )}
      </span>
      <span className="font-mono text-xs uppercase tracking-wider text-text-muted group-hover:text-text-primary">
        {isDark ? "LIGHT" : "DARK"}
      </span>
    </button>
  );
};
