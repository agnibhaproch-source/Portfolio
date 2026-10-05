import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import {
  Dela_Gothic_One,
  Kaushan_Script,
  Rampart_One,
  Zen_Kaku_Gothic_New,
} from "next/font/google";
import { education, profile, topSkills } from "@/content";
import { siteUrl } from "@/lib/site";
import { SlashWipeProvider } from "@/components/motion/SlashWipe";
import { LazyOverlays } from "@/components/LazyOverlays";
import { OffscreenPause } from "@/components/OffscreenPause";
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

// Sound-effect lettering. Preloaded: it first appears mid-scroll, and a late
// font swap there shifted the About panels.
const rampart = Rampart_One({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-rampart",
});

// Brush signature under the hero name.
const kaushan = Kaushan_Script({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-kaushan",
});

const description =
  `${profile.name.full} (${profile.name.alias}), ${profile.role.toLowerCase()} from ${profile.location}. ${education.degree} at ${education.institution}. ${profile.tagline ?? ""}`.trim();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${profile.name.full}, ${profile.role}`,
    template: `%s | ${profile.name.alias}`,
  },
  description,
  applicationName: `${profile.name.alias} portfolio`,
  authors: [{ name: profile.name.full, url: siteUrl }],
  creator: profile.name.full,
  keywords: [
    profile.name.full,
    profile.name.alias,
    profile.role,
    "portfolio",
    ...topSkills.map((s) => s.name),
  ],
  openGraph: {
    type: "profile",
    siteName: `${profile.name.full}, ${profile.role}`,
    title: `${profile.name.full}, ${profile.role}`,
    description,
    locale: "en_IN",
    firstName: profile.name.first,
    lastName: profile.name.last,
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name.full}, ${profile.role}`,
    description,
  },
};

/** Structured data so search engines know who this site is about. */
const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name.full,
  alternateName: [profile.name.alias, `${profile.name.ja.first} ${profile.name.ja.last}`],
  jobTitle: profile.role,
  description: profile.bio ?? description,
  url: siteUrl,
  email: `mailto:${profile.email}`,
  address: { "@type": "PostalAddress", addressLocality: "Kolkata", addressCountry: "IN" },
  alumniOf: { "@type": "CollegeOrUniversity", name: education.institution },
  knowsAbout: topSkills.map((s) => s.name),
  sameAs: [
    profile.links.github.href,
    profile.links.linkedin.href,
    ...profile.links.others.map((l) => l.href),
  ],
};

export const viewport: Viewport = {
  themeColor: "#1d1614",
  colorScheme: "light dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${dela.variable} ${zen.variable} ${rampart.variable} ${kaushan.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: headScript }} />
      </head>
      <body className="grain">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd).replace(/</g, "\\u003c") }}
        />
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
            <LazyOverlays />
            <OffscreenPause />
            <Cursor />
          </SlashWipeProvider>
        </SmoothScroll>
        {/* Vercel serves the analytics script only on its own deployments. */}
        {process.env.VERCEL && <Analytics />}
      </body>
    </html>
  );
}
