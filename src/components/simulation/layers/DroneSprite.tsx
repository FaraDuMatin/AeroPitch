"use client";

import Image from "next/image";
import { toPercent } from "@/lib/simulation/coordinates";
import { DroneState } from "@/types/simulation";

type DroneSpriteProps = {
  drone: DroneState;
  moveDurationMs: number;
};

export default function DroneSprite({ drone, moveDurationMs }: DroneSpriteProps) {
  const statusClass =
    drone.status === "picking"
      ? "drone-picking"
      : drone.status === "dropping"
        ? "drone-dropping"
        : "";

  return (
    <div
      className={`absolute z-40 -translate-x-1/2 -translate-y-1/2 ${statusClass}`}
      style={{
        left: toPercent(drone.position.x),
        top: toPercent(drone.position.y),
      }}
      aria-label={`${drone.label} ${drone.status}`}
    >
      <Image
        src={drone.spritePath}
        alt={drone.label}
        width={62}
        height={62}
        className="h-14 w-14 object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
      />
      {drone.carryingSpritePath && (drone.status === "delivering" || drone.status === "dropping") ? (
        <div className="absolute left-1/2 top-[82%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/35 bg-black/55 p-0.5">
          <Image
            src={drone.carryingSpritePath}
            alt="Carried trash"
            width={18}
            height={18}
            className="h-4 w-4 object-contain"
          />
        </div>
      ) : null}
    </div>
  );
}