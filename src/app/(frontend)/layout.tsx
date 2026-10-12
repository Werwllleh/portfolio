import "@/styles/globals.css";
import type {Metadata} from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Sphere from "@/components/sphere";
import {Suspense} from "react";
import YandexMetrica from "@/components/yandex-metrika";
import { ThemeProvider } from "@/context/theme-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Alexey Aleksandrov — Creative Frontend Engineer",
  description: "Portfolio of Alexey Aleksandrov — Front End Developer. The Digital Collider: High-End Cyberpunk & Precision Typographics.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({children,}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${geistSans.variable} ${geistMono.variable} dark scroll-smooth`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const saved = localStorage.getItem('portfolio-theme');
                if (saved === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="bg-obsidian text-text-primary antialiased min-h-screen selection:bg-lime selection:text-obsidian">
        <ThemeProvider>
          <main className="relative min-h-screen">
            <Suspense fallback={null}>
              {children}
              <YandexMetrica />
            </Suspense>
            <Sphere/>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
