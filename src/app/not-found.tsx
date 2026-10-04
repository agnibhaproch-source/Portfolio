import Link from "next/link";
import { notFoundCopy } from "@/content";
import { buttonClass } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";

export default function NotFound() {
  return (
    <main
      id="main"
      data-mode="print"
      className="grid min-h-svh place-items-center px-4 py-24 md:px-10"
    >
      <div className="relative w-full max-w-3xl">
        <Panel shape="slant-bottom" tone className="h-[50svh] min-h-72" />
        <p
          aria-hidden
          className="absolute top-[38%] right-[-2%] sfx text-96 text-washi md:text-160"
        >
          {notFoundCopy.sfx}
        </p>
        <div className="mt-10">
          <h1 className="text-56">{notFoundCopy.title}</h1>
          <p className="mt-2 text-18 text-muted">{notFoundCopy.body}</p>
          <Link href="/" className={buttonClass("primary", "mt-8")}>
            {notFoundCopy.home}
          </Link>
        </div>
      </div>
    </main>
  );
}
