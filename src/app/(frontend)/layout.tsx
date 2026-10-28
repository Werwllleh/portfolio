import "@/styles/globals.css";
import type {Metadata} from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Sphere from "@/components/sphere-client";
import {Suspense} from "react";
import Script from "next/script";
import YandexMetrica from "@/components/yandex-metrika";
import { ThemeProvider } from "@/context/theme-context";
import { YM_METRIKA_ID } from "@/consts";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "cyrillic"],
  display: "swap",
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
        <meta name="yandex-verification" content="f8956d973beb8b20" />
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
        <Script id="yandex-metrika" strategy="afterInteractive">
          {`
            (function(m,e,t,r,i,k,a){
              m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              for (var j = 0; j < document.scripts.length; j++) {
                if (document.scripts[j].src === r) { return; }
              }
              k=e.createElement(t),a=e.getElementsByTagName(t)[0],
              k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
            })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

            ym(${Number(YM_METRIKA_ID)}, "init", {
              clickmap: true,
              webvisor: true,
              trackLinks: true,
              accurateTrackBounce: true
            });
          `}
        </Script>
        <noscript>
          <div>
            <img
              src={`https://mc.yandex.ru/watch/${Number(YM_METRIKA_ID)}`}
              style={{ position: "absolute", left: "-9999px" }}
              alt=""
            />
          </div>
        </noscript>
      </body>
    </html>
  );
}
