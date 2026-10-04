import type { Metadata } from "next";
import { logCopy, publishedPosts } from "@/content";
import { Footer } from "@/components/sections/Footer";
import { TransitionLink } from "@/components/ui/TransitionLink";

export const metadata: Metadata = { title: logCopy.heading };

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export default function LogIndex() {
  return (
    <>
      <main id="main" data-mode="print" className="min-h-svh px-4 pt-32 pb-24 md:px-10">
        <h1 className="text-96">{logCopy.heading}</h1>
        <p className="mt-2 text-18 text-muted md:text-24">{logCopy.subtitle}</p>
        {publishedPosts.length === 0 ? (
          <p className="mt-16 text-24">{logCopy.empty}</p>
        ) : (
          <ol className="mt-16 space-y-gutter">
            {publishedPosts.map((p) => (
              <li key={p.slug} className="border-[3px] border-sumi p-6 md:p-8">
                <p className="text-14 text-muted">{fmtDate(p.date)}</p>
                <h2 className="mt-2 text-36">
                  <TransitionLink href={`/log/${p.slug}`} className="ink-link">
                    {p.title}
                  </TransitionLink>
                </h2>
                <p className="mt-3 max-w-prose text-18">{p.summary}</p>
              </li>
            ))}
          </ol>
        )}
      </main>
      <Footer />
    </>
  );
}
