"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: (event?: React.MouseEvent | MouseEvent) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("portfolio-theme") as Theme | null;
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initial = prefersDark ? "dark" : "dark"; // default dark aesthetic
      setTheme(initial);
      document.documentElement.classList.toggle("dark", initial === "dark");
    }
  }, []);

  const toggleTheme = (event?: React.MouseEvent | MouseEvent) => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";

    const updateDOM = () => {
      setTheme(nextTheme);
      localStorage.setItem("portfolio-theme", nextTheme);
      document.documentElement.classList.toggle("dark", nextTheme === "dark");
    };

    const doc = typeof document !== "undefined" ? (document as any) : null;
    if (!doc) {
      updateDOM();
      return;
    }

    // Modern browsers: Circular clip-path Reveal via View Transitions API
    if (typeof doc.startViewTransition === "function") {
      const x = event?.clientX ?? window.innerWidth - 30;
      const y = event?.clientY ?? 30;
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      const transition = doc.startViewTransition(() => {
        updateDOM();
      });

      transition.ready.then(() => {
        const clipPath = [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ];
        doc.documentElement.animate(
          {
            clipPath: clipPath,
          },
          {
            duration: 700,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)", // Quintic out curve: fast startup, ultra-soft, silky deceleration
            pseudoElement: "::view-transition-new(root)",
          }
        );
      });
    } else {
      // Clean instant switch fallback for browsers without View Transitions
      updateDOM();
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
