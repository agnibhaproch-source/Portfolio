import { contactCopy } from "@/content";

/** The sealed letter the form folds into (data-envelope), with its 火 wax seal (data-wax). */
export function Envelope() {
  return (
    <div
      aria-hidden
      data-envelope
      className="pointer-events-none absolute top-1/2 left-1/2 z-30 w-56 -translate-x-1/2 -translate-y-1/2 opacity-0"
    >
      <svg
        viewBox="0 0 220 140"
        className="w-full overflow-visible drop-shadow-[0_10px_20px_rgb(0_0_0/0.5)]"
      >
        <rect
          x="2"
          y="2"
          width="216"
          height="136"
          fill="#ebdcb9"
          stroke="#1d1614"
          strokeWidth="3"
        />
        <path d="M2 2 L110 80 L218 2" fill="#e0cfa8" stroke="#1d1614" strokeWidth="3" />
        <path
          d="M2 138 L88 64 M218 138 L132 64"
          stroke="#1d1614"
          strokeOpacity="0.4"
          strokeWidth="2"
        />
      </svg>
      <span
        data-wax
        className="absolute top-[56%] left-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[radial-gradient(circle_at_35%_35%,#e04a40,#a0181e_70%)] font-display text-24 text-[#ebdcb9] opacity-0 shadow-[0_3px_6px_rgb(0_0_0/0.45),inset_0_0_0_3px_rgb(0_0_0/0.15)]"
      >
        {contactCopy.seal}
      </span>
    </div>
  );
}

/** An original ink-drawn crow, wings on separate groups so they can beat. */
export function Crow() {
  return (
    <div
      aria-hidden
      data-crow
      className="pointer-events-none fixed top-0 left-0 z-[90] w-40 opacity-0"
    >
      <svg viewBox="0 0 160 110" className="w-full overflow-visible">
        <g data-wing="back" style={{ transformOrigin: "78px 52px" }}>
          <path
            d="M78 52 C60 30 40 14 8 10 C24 22 30 30 34 40 C22 38 14 40 6 46 C28 50 46 56 70 60 Z"
            fill="#120d0c"
          />
        </g>
        <path
          d="M60 56 C64 44 80 40 98 44 C110 38 122 38 130 42 L148 40 L132 50 C130 62 116 70 100 70 L84 84 L80 72 C70 70 62 66 60 56 Z"
          fill="#1d1614"
        />
        <circle cx="122" cy="46" r="2.2" fill="#e04a40" />
        <path d="M60 58 L36 66 L42 58 L30 56 L58 52 Z" fill="#1d1614" />
        <g data-wing="front" style={{ transformOrigin: "86px 52px" }}>
          <path
            d="M86 52 C96 28 112 10 140 2 C130 18 128 28 128 38 C136 36 146 38 154 42 C134 50 112 56 90 60 Z"
            fill="#2a1f1c"
          />
        </g>
      </svg>
    </div>
  );
}

/** Loose feathers the crow drops (data-feather). */
export function Feathers() {
  return (
    <>
      {[0, 1, 2, 3].map((k) => (
        <svg
          key={k}
          aria-hidden
          data-feather
          viewBox="0 0 20 40"
          className="pointer-events-none fixed top-0 left-0 z-[89] h-8 w-4 opacity-0"
        >
          <path
            d="M10 2 C16 12 16 26 10 38 C4 26 4 12 10 2 Z M10 2 V38"
            fill="#1d1614"
            stroke="#3a2c26"
            strokeWidth="1"
          />
        </svg>
      ))}
    </>
  );
}

/** A pillar of light rising out of the summoning circle (data-pillar). */
export function Pillar() {
  return (
    <div
      aria-hidden
      data-pillar
      className="pointer-events-none absolute bottom-10 left-1/2 z-10 h-[140%] w-28 origin-bottom -translate-x-1/2 scale-y-0 opacity-0"
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgb(255_236_200/0.95),rgb(201_162_74/0.55)_40%,transparent)] blur-md" />
      <div className="absolute inset-x-1/3 inset-y-0 bg-[linear-gradient(to_top,#fff8e6,rgb(255_236_200/0.3)_70%,transparent)]" />
    </div>
  );
}

const PANEL_ART = [
  // a quill writing
  <svg key="0" viewBox="0 0 80 60" className="h-16 w-20">
    <path d="M10 50 H70" stroke="currentColor" strokeWidth="2" />
    <path d="M14 46 C24 40 30 48 40 42" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M40 42 L66 10 C70 6 74 8 70 14 Z" fill="currentColor" />
  </svg>,
  // a sealed envelope
  <svg key="1" viewBox="0 0 80 60" className="h-16 w-20">
    <rect x="8" y="12" width="64" height="40" fill="none" stroke="currentColor" strokeWidth="2.5" />
    <path d="M8 12 L40 36 L72 12" fill="none" stroke="currentColor" strokeWidth="2.5" />
    <circle cx="40" cy="38" r="7" fill="var(--agni)" />
  </svg>,
  // a crow in flight with speed lines
  <svg key="2" viewBox="0 0 80 60" className="h-16 w-20">
    <path
      d="M4 20 H24 M2 30 H20 M6 40 H22"
      stroke="currentColor"
      strokeOpacity="0.5"
      strokeWidth="2"
    />
    <path
      d="M30 34 C40 14 54 10 72 8 C64 18 62 24 62 30 C66 30 72 32 76 34 C60 38 46 40 30 34 Z"
      fill="currentColor"
    />
  </svg>,
  // delivered: a letter in a tray with a burst
  <svg key="3" viewBox="0 0 80 60" className="h-16 w-20">
    <path d="M10 40 L20 52 H60 L70 40" fill="none" stroke="currentColor" strokeWidth="2.5" />
    <rect
      x="26"
      y="22"
      width="28"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    />
    <path
      d="M40 4 V12 M24 8 L28 15 M56 8 L52 15"
      stroke="var(--kiln)"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>,
];

/** The success screen as a 4-panel manga strip; panels pop in order (data-comic-panel). */
export function SuccessComic() {
  return (
    <ol className="grid grid-cols-2 gap-2">
      {contactCopy.comic.map((label, i) => (
        <li
          key={label}
          data-comic-panel
          className={
            "relative grid place-items-center gap-1 border-[3px] border-washi bg-sumi/60 px-2 py-3 text-washi " +
            (i === 3 ? "border-kiln text-kiln shadow-[0_0_14px_var(--agni)]" : "")
          }
        >
          {PANEL_ART[i]}
          <span className="font-display text-14">{label}</span>
          <span aria-hidden className="absolute top-1 left-1.5 font-display text-[10px] text-muted">
            {i + 1}
          </span>
        </li>
      ))}
    </ol>
  );
}

/** Folded letters drifting up behind the section. Decorative. */
export function DriftingLetters() {
  return (
    <div
      aria-hidden
      className="calm-hide pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden"
    >
      {Array.from({ length: 9 }, (_, k) => (
        <svg
          key={k}
          viewBox="0 0 40 28"
          className="absolute bottom-[-10%] w-10 animate-[letter-drift_linear_infinite] text-washi md:w-14"
          style={
            {
              left: `${(k * 37) % 96}%`,
              animationDuration: `${18 + (k % 4) * 6}s`,
              animationDelay: `${-k * 3.3}s`,
              "--r": `${((k * 29) % 50) - 25}deg`,
              "--o": `${0.08 + (k % 3) * 0.04}`,
            } as React.CSSProperties
          }
        >
          <rect
            x="1"
            y="1"
            width="38"
            height="26"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path d="M1 1 L20 16 L39 1" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      ))}
    </div>
  );
}
