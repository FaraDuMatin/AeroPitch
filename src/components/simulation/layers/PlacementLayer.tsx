"use client";

import Image from "next/image";
import { toPercent } from "@/lib/simulation/coordinates";
import { PlacedTrash } from "@/types/simulation";

type PlacementLayerProps = {
  placements: PlacedTrash[];
};

export default function PlacementLayer({ placements }: PlacementLayerProps) {
  return (
    <section className="pointer-events-none absolute inset-0 z-30" aria-label="Placed trash">
      {placements.map((placement) => (
        <div
          key={placement.id}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: toPercent(placement.position.x), top: toPercent(placement.position.y) }}
        >
          <Image
            src={placement.spritePath}
            alt={placement.name}
            width={34}
            height={34}
            className="h-8 w-8 object-contain drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)] sm:h-9 sm:w-9"
          />
        </div>
      ))}
    </section>
  );
}