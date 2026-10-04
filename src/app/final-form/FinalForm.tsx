"use client";

import { runeCopy, sections } from "@/content";
import { MagicCircle } from "@/components/motion/MagicCircle";
import { buttonClass } from "@/components/ui/Button";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { useRunes } from "@/lib/runes";

export function FinalForm() {
  const found = useRunes().length;
  const open = found >= runeCopy.total;

  return (
    <main
      id="main"
      data-mode="colour"
      className="relative grid min-h-svh place-items-center overflow-hidden px-4 py-24 text-center"
    >
      {open && (
        <MagicCircle trigger="mount" className="absolute size-[min(110vw,92svh)] opacity-60" />
      )}
      <div className="relative max-w-2xl">
        <p className="font-display text-18 text-aura">
          {runeCopy.progress(Math.min(found, runeCopy.total), runeCopy.total)}
        </p>
        <h1 className="mt-4 text-96 md:text-160">
          {open ? runeCopy.unlockedTitle : runeCopy.sealedTitle}
        </h1>
        <p className="mx-auto mt-6 max-w-prose text-18 md:text-24">
          {open ? runeCopy.unlockedBody : runeCopy.sealedBody}
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <TransitionLink href="/" className={buttonClass("ghost")}>
            {runeCopy.back}
          </TransitionLink>
          {open && (
            <TransitionLink href={`/#${sections.contact.id}`} className={buttonClass("primary")}>
              {runeCopy.contact}
            </TransitionLink>
          )}
        </div>
      </div>
    </main>
  );
}
