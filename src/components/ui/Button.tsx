import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost";

const base =
  "group relative inline-flex min-h-12 items-center justify-center gap-2 border-[3px] border-current px-6 py-3 font-display text-18 leading-none transition-[translate,box-shadow] duration-200 ease-heat select-none";

/*
 * Flame never sits flat behind text (01-DESIGN), so the "heat" lives in the
 * hard offset shadow, which shifts on hover like a panel being pressed.
 */
const variants: Record<Variant, string> = {
  primary:
    "bg-fg text-bg border-fg shadow-[5px_5px_0_0_var(--agni)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_0_var(--kiln)] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0_0_var(--agni)]",
  ghost:
    "bg-transparent text-fg shadow-[5px_5px_0_0_currentColor] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_0_currentColor] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0_0_currentColor]",
};

type Common = { variant?: Variant; className?: string; children: ReactNode };

type AsLink = Common & { href: string; download?: boolean | string } & Omit<
    ComponentPropsWithoutRef<"a">,
    "className" | "children" | "href"
  >;
type AsButton = Common & { href?: undefined } & Omit<
    ComponentPropsWithoutRef<"button">,
    "className" | "children"
  >;

type LinkRest = Omit<AsLink, keyof Common>;
type ButtonRest = Omit<AsButton, keyof Common>;

export function Button(props: AsLink | AsButton) {
  const { variant = "primary", className, children, ...rest } = props;
  const classes = cn(base, variants[variant], className);
  const cursor = { "data-cursor": "charge" };

  if (rest.href !== undefined) {
    const { href, ...anchor } = rest as LinkRest;
    const external = /^https?:|^mailto:/.test(href) || anchor.download !== undefined;
    if (external) {
      return (
        <a href={href} className={classes} {...cursor} {...anchor}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} {...cursor} {...anchor}>
        {children}
      </Link>
    );
  }

  const { type = "button", ...button } = rest as ButtonRest;
  return (
    <button type={type} className={classes} {...cursor} {...button}>
      {children}
    </button>
  );
}
