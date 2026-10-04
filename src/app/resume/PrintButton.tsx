"use client";

import { resumeCopy } from "@/content";
import { buttonClass } from "@/components/ui/Button";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className={buttonClass("primary")}>
      {resumeCopy.print}
    </button>
  );
}
