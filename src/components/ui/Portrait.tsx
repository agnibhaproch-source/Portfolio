import Image from "next/image";
import { profile } from "@/content";
import { cn } from "@/lib/utils";
import { Silhouette } from "./Silhouette";

/**
 * The owner's photo, framed for a manga panel: cropped around him, a touch
 * more contrast, and a fine screentone over the top so it sits with the ink.
 * Falls back to the silhouette when no photo is set.
 */
export function Portrait({
  className,
  position = "55% 60%",
  zoom = 1,
  sizes,
  priority = false,
  tone = true,
  silhouetteClassName,
}: {
  className?: string;
  /** object-position of the crop, as "x% y%". */
  position?: string;
  /** >1 zooms in around `position` (for small avatars). */
  zoom?: number;
  sizes: string;
  priority?: boolean;
  tone?: boolean;
  silhouetteClassName?: string;
}) {
  const p = profile.portrait;
  if (!p) {
    return (
      <Silhouette
        className={cn("absolute inset-x-0 bottom-0 mx-auto h-[85%] text-sumi", silhouetteClassName)}
      />
    );
  }
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      <Image
        src={p.src}
        alt={p.alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover [filter:contrast(1.08)_saturate(0.9)_sepia(0.12)]"
        style={{ objectPosition: position, scale: zoom, transformOrigin: position }}
      />
      {tone && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 tone opacity-25 mix-blend-multiply [--tone-dot:var(--sumi)]"
        />
      )}
    </div>
  );
}
