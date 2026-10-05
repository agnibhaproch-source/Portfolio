import { GLYPHS } from "@/components/ui/Rune";

/** Faint columns of rune glyphs drifting down behind the section. Decorative. */
export function RuneRain() {
  return (
    <div
      aria-hidden
      className="calm-hide pointer-events-none absolute inset-0 -z-10 overflow-hidden motion-reduce:hidden"
    >
      {Array.from({ length: 12 }, (_, c) => (
        <div
          key={c}
          className="absolute top-0 flex animate-[rune-fall_linear_infinite] flex-col gap-10 text-aura opacity-[0.09]"
          style={{
            left: `${4 + c * 8.2}%`,
            animationDuration: `${22 + (c % 5) * 6}s`,
            animationDelay: `${-c * 3.1}s`,
          }}
        >
          {Array.from({ length: 16 }, (_, k) => (
            <svg key={k} viewBox="0 0 24 24" className="size-6">
              <path
                d={GLYPHS[(c + k) % GLYPHS.length]}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              />
            </svg>
          ))}
        </div>
      ))}
    </div>
  );
}
