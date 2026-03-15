"use client";

import DroneSprite from "@/components/simulation/layers/DroneSprite";
import { DroneState } from "@/types/simulation";

type DroneLayerProps = {
  drones: DroneState[];
  moveDurationMs: number;
};

export default function DroneLayer({ drones, moveDurationMs }: DroneLayerProps) {
  return (
    <section className="pointer-events-none absolute inset-0 z-40" aria-label="Drone layer">
      {drones.map((drone) => (
        <DroneSprite key={drone.id} drone={drone} moveDurationMs={moveDurationMs} />
      ))}
    </section>
  );
}