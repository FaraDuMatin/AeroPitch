"use client";

import { formatRectForStyle } from "@/lib/simulation/coordinates";
import { TrashDropArea as TrashDropAreaType } from "@/types/simulation";

type TrashDropAreaProps = {
  area: TrashDropAreaType;
};

export default function TrashDropArea({ area }: TrashDropAreaProps) {
  return (
    <aside
      className="absolute z-20 rounded-sm border-4 border-[#ffde59] bg-[#ffde59]/12 p-2 shadow-[0_0_0_1px_rgba(0,0,0,0.15)]"
      style={formatRectForStyle(area.rect)}
      aria-label={area.label}
    >
      <p className="font-mono text-xl uppercase tracking-[0.14em] text-[#ffe783] sm:text-xl">
        {area.label}
      </p>
      <p className="mt-1 hidden max-w-[18rem] text-[10px] leading-snug text-[#f5e6a0] sm:block">
        {area.note}
      </p>
    </aside>
  );
}