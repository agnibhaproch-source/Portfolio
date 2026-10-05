import { learning, skillsCopy } from "@/content";

/**
 * "Currently learning" as a training gauge: striped energy runs along the bar
 * and a glow sweeps through it, with an "In training" stamp. No percentage:
 * there is no honest number for it.
 */
export function TrainingGauge({ className }: { className?: string }) {
  if (!learning) return null;
  return (
    <div className={className}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-18">
          <span className="text-muted">{skillsCopy.learning}: </span>
          {learning}
        </p>
        <span className="-rotate-6 border-[3px] border-agni px-2 py-0.5 font-display text-14 text-kiln uppercase">
          {skillsCopy.inTraining}
        </span>
      </div>
      <div aria-hidden className="relative mt-3 h-4 overflow-hidden border-2 border-washi/70">
        <div className="absolute inset-0 animate-[gauge-run_1.2s_linear_infinite] bg-[repeating-linear-gradient(-45deg,var(--agni)_0_10px,var(--kiln)_10px_20px)] [background-size:28px_28px] opacity-80 motion-reduce:animate-none [html[data-calm]_&]:animate-none" />
        <div className="absolute inset-y-0 w-1/3 animate-[gauge-sweep_2.4s_ease-in-out_infinite] bg-[linear-gradient(90deg,transparent,rgb(255_230_190/0.7),transparent)] motion-reduce:hidden [html[data-calm]_&]:hidden" />
      </div>
    </div>
  );
}
