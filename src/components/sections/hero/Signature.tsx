import { heroCopy } from "@/content";

/**
 * "Agni" in brush script under the name, painted on by the hero timeline
 * (data-sign-ink, data-sign-stroke), then a red hanko seal stamps beside it
 * (data-seal). Static and fully visible without JS.
 */
export function Signature({ className }: { className?: string }) {
  return (
    <div aria-hidden className={`flex items-end gap-4 ${className ?? ""}`}>
      <span className="relative">
        <span
          data-sign-ink
          className="block font-brush text-56 leading-none text-washi md:text-[4.5rem]"
        >
          {heroCopy.signature}
        </span>
        <svg
          viewBox="0 0 200 20"
          preserveAspectRatio="none"
          className="absolute -bottom-3 left-0 h-4 w-full text-agni"
        >
          <path
            data-sign-stroke
            d="M2 12 C 40 4, 90 16, 140 8 S 190 6, 198 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span
        data-seal
        className="mb-1 grid size-12 -rotate-6 place-items-center rounded-sm border-[3px] border-[#c2272d] bg-[#c2272d] font-display text-24 text-washi shadow-[inset_0_0_0_2px_var(--washi)] md:size-14 md:text-36"
      >
        {heroCopy.seal}
      </span>
    </div>
  );
}
