import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Dela_Gothic_One, Rampart_One, Zen_Kaku_Gothic_New } from "next/font/google";
import { profile } from "@/content";
import { SlashWipeProvider } from "@/components/motion/SlashWipe";
import { AntiMagicLayer } from "@/components/ui/AntiMagicLayer";
import { Cursor } from "@/components/ui/Cursor";
import { Nav } from "@/components/ui/Nav";
import { Preloader } from "@/components/ui/Preloader";
import { ProgressLine } from "@/components/ui/ProgressLine";
import { Toast } from "@/components/ui/Toast";
import { headScript } from "@/lib/intro";
import { SmoothScroll } from "@/lib/smooth-scroll";
import "./globals.css";

const dela = Dela_Gothic_One({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dela",
});

const zen = Zen_Kaku_Gothic_New({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-zen",
});

// Used a handful of times, so not preloaded.
const rampart = Rampart_One({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-rampart",
});

export const metadata: Metadata = {
  title: {
    default: `${profile.name.full}, ${profile.role}`,
    template: `%s | ${profile.name.alias}`,
  },
  description: `${profile.name.full} (${profile.name.alias}), ${profile.role.toLowerCase()} from ${profile.location}.`,
};

export const viewport: Viewport = {
  themeColor: "#1d1614",
  colorScheme: "light dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${dela.variable} ${zen.variable} ${rampart.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: headScript }} />
      </head>
      <body className="grain">
        <a
          href="#main"
          className="sr-only bg-washi px-4 py-2 text-sumi focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200]"
        >
          Skip to content
        </a>
        <SmoothScroll>
          <SlashWipeProvider>
            <Preloader />
            <ProgressLine />
            <Nav />
            {children}
            <AntiMagicLayer />
            <Toast />
            <Cursor />
          </SlashWipeProvider>
        </SmoothScroll>
        {/* Vercel serves the analytics script only on its own deployments. */}
        {process.env.VERCEL && <Analytics />}
      </body>
    </html>
  );
}
