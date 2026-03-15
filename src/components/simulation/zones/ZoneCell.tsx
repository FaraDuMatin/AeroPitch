"use client";

import { formatRectForStyle } from "@/lib/simulation/coordinates";
import { NormalizedRect, ZoneDefinition } from "@/types/simulation";

type ZoneCellProps = {
  zone: ZoneDefinition;
  rect: NormalizedRect;
};

export default function ZoneCell({ zone, rect }: ZoneCellProps) {
  return (
    <article
      className="absolute border border-[#c81a67]/80 bg-[#c81a67]/8"
      style={formatRectForStyle(rect)}
      aria-label={zone.description}
      data-zone-id={zone.id}
    >
      <span className="absolute left-2 top-1 font-mono text-4xl font-semibold text-[#d91f72]/90 sm:left-3 sm:top-2 sm:text-5xl">
        {zone.id}
      </span>
    </article>
  );
}