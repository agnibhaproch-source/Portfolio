"use client";

import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { useSlash } from "@/components/motion/SlashWipe";

type Props = Omit<ComponentPropsWithoutRef<typeof Link>, "href"> & { href: string };

/**
 * Internal link that plays the dimension-slash transition: cover, change
 * route, uncover. Modified clicks (new tab etc.) behave normally.
 */
export function TransitionLink({ href, onClick, ...rest }: Props) {
  const slash = useSlash();
  return (
    <Link
      href={href}
      onClick={(e) => {
        onClick?.(e);
        if (
          e.defaultPrevented ||
          e.metaKey ||
          e.ctrlKey ||
          e.shiftKey ||
          e.altKey ||
          e.button !== 0
        )
          return;
        e.preventDefault();
        void slash.navigate(href);
      }}
      {...rest}
    />
  );
}
