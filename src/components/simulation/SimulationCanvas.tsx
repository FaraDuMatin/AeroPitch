"use client";

import Image from "next/image";
import { DragEvent, useEffect, useMemo, useRef, useState } from "react";
import DroneLayer from "@/components/simulation/layers/DroneLayer";
import PlacementLayer from "@/components/simulation/layers/PlacementLayer";
import SimulationActionBar from "@/components/simulation/ui/SimulationActionBar";
import TrashSidebar from "@/components/simulation/palette/TrashSidebar";
import ZoneGrid from "@/components/simulation/zones/ZoneGrid";
import TrashDropArea from "@/components/simulation/ui/TrashDropArea";
import {
  droneArrivalOffsets,
  droneCatalog,
  DRONE_MOVE_DURATION_MS,
  droneSpawnArea,
} from "@/lib/simulation/config";
import {
  getSpawnPointFromArea,
  getSafeSpawnPointInZone,
  lerpPoint,
  getZoneTargetPoint,
  getZoneIdForPoint,
  getZoneRect,
  randomZoneId,
  toPercent,
} from "@/lib/simulation/coordinates";
import {
  DroneState,
  OperationField,
  PlacedTrash,
  SimulationTelemetryPayload,
  TrashAsset,
  TrashDropArea as TrashDropAreaType,
  ZoneDefinition,
} from "@/types/simulation";

type SimulationCanvasProps = {
  zones: ZoneDefinition[];
  trashAssets: TrashAsset[];
  trashArea: TrashDropAreaType;
  field: OperationField;
  boardId: string;
  backgroundImage?: string;
};

export default function SimulationCanvas({
  zones,
  trashAssets,
  trashArea,
  field,
  boardId,
  backgroundImage = "/beach.png",
}: SimulationCanvasProps) {
  const [placements, setPlacements] = useState<PlacedTrash[]>([]);
  const [deliveredPlacements, setDeliveredPlacements] = useState<PlacedTrash[]>([]);
  const [drones, setDrones] = useState<DroneState[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [telemetryStatus, setTelemetryStatus] = useState("disconnected");
  const [liveTelemetryCount, setLiveTelemetryCount] = useState(0);
  const placementsRef = useRef<PlacedTrash[]>([]);
  const dronesRef = useRef<DroneState[]>([]);
  const telemetryAbortRef = useRef(false);
  const telemetryDirtyRef = useRef(false);
  const telemetryFlushTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pushTelemetry = async (payload: SimulationTelemetryPayload) => {
    try {
      await fetch("/api/simulation/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      // Keep simulation resilient even if telemetry backend is temporarily unavailable.
    }
  };

  const flushTelemetry = (force = false) => {
    if (!force && !telemetryDirtyRef.current) return;
    telemetryDirtyRef.current = false;

    const droneSnapshot = dronesRef.current;
    const placementSnapshot = placementsRef.current;
    const timestamp = new Date().toISOString();

    pushTelemetry({
      boardId,
      timestamp,
      drones: droneSnapshot.map((drone) => ({
        boardId,
        droneId: drone.id,
        position: drone.position,
        status: drone.status,
        timestamp,
      })),
      trashes: placementSnapshot.map((placement) => ({
        boardId,
        placementId: placement.id,
        position: placement.position,
        zoneId: placement.zoneId,
        timestamp,
      })),
    });
  };

  const startTelemetryFlushTimer = () => {
    stopTelemetryFlushTimer();
    telemetryFlushTimerRef.current = setInterval(() => flushTelemetry(), 2000);
  };

  const stopTelemetryFlushTimer = () => {
    if (telemetryFlushTimerRef.current) {
      clearInterval(telemetryFlushTimerRef.current);
      telemetryFlushTimerRef.current = null;
    }
  };

  useEffect(() => {
    telemetryAbortRef.current = false;
    const source = new EventSource(`/api/simulation/telemetry/stream?boardId=${encodeURIComponent(boardId)}`);

    source.addEventListener("ready", () => {
      if (!telemetryAbortRef.current) {
        setTelemetryStatus("connected");
      }
    });

    source.addEventListener("telemetry", () => {
      if (!telemetryAbortRef.current) {
        setLiveTelemetryCount((count) => count + 1);
      }
    });

    source.onerror = () => {
      if (!telemetryAbortRef.current) {
        setTelemetryStatus("reconnecting");
      }
    };

    return () => {
      telemetryAbortRef.current = true;
      source.close();
    };
  }, [boardId]);

  useEffect(() => {
    placementsRef.current = placements;
  }, [placements]);

  useEffect(() => {
    dronesRef.current = drones;
  }, [drones]);

  const zoneCoordinates = zones.map((zone) => ({
    zone,
    rect: getZoneRect(field, zone.id),
  }));

  const zoneRectMap = useMemo(() => {
    const map = new Map<number, ReturnType<typeof getZoneRect>>();
    for (const zone of zones) {
      map.set(zone.id, getZoneRect(field, zone.id));
    }
    return map;
  }, [field, zones]);

  const dropAreaCenter = useMemo(
    () => ({
      x: trashArea.rect.x + trashArea.rect.width * 0.5,
      y: trashArea.rect.y + trashArea.rect.height * 0.5,
    }),
    [trashArea],
  );

  const markTelemetryDirty = () => {
    telemetryDirtyRef.current = true;
  };

  const updateDrones = (updater: DroneState[] | ((current: DroneState[]) => DroneState[])) => {
    setDrones((current) => {
      const next = typeof updater === "function" ? updater(current) : updater;
      dronesRef.current = next;
      markTelemetryDirty();
      return next;
    });
  };

  const updatePlacements = (
    updater: PlacedTrash[] | ((current: PlacedTrash[]) => PlacedTrash[]),
  ) => {
    setPlacements((current) => {
      const next = typeof updater === "function" ? updater(current) : updater;
      placementsRef.current = next;
      markTelemetryDirty();
      return next;
    });
  };

  const wait = (durationMs: number) =>
    new Promise<void>((resolve) => {
      setTimeout(resolve, durationMs);
    });

  type DroneActionOptions = {
    droneId: DroneState["id"];
    destination: { x: number; y: number };
    movingStatus: DroneState["status"];
    moveDurationMs: number;
    holdStatus?: DroneState["status"];
    holdDurationMs?: number;
  };

  const performDroneAction = async ({
    droneId,
    destination,
    movingStatus,
    moveDurationMs,
    holdStatus,
    holdDurationMs = 0,
  }: DroneActionOptions) => {
    await animateDroneTo(droneId, destination, moveDurationMs, movingStatus);

    if (holdDurationMs > 0) {
      updateDrones((current) =>
        current.map((entry) =>
          entry.id === droneId ? { ...entry, status: holdStatus ?? movingStatus } : entry,
        ),
      );
      await wait(holdDurationMs);
    }
  };

  const getDistance = (ax: number, ay: number, bx: number, by: number) => {
    const dx = ax - bx;
    const dy = ay - by;
    return Math.sqrt(dx * dx + dy * dy);
  };

  /** Scale movement duration proportionally to distance (min 500ms, max DRONE_MOVE_DURATION_MS). */
  const durationForDistance = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const dist = getDistance(from.x, from.y, to.x, to.y);
    const maxDiag = Math.sqrt(2); // longest possible path in [0,1]x[0,1]
    return Math.max(500, Math.round(DRONE_MOVE_DURATION_MS * (dist / maxDiag)));
  };

  const animateDroneTo = (
    droneId: DroneState["id"],
    destination: { x: number; y: number },
    durationMs: number,
    activeStatus: DroneState["status"],
  ) =>
    new Promise<void>((resolve) => {
      const startDrone = dronesRef.current.find((entry) => entry.id === droneId);
      if (!startDrone) {
        resolve();
        return;
      }

      const startPoint = startDrone.position;
      const startedAt = performance.now();

      const step = (timestamp: number) => {
        const progress = Math.min(1, (timestamp - startedAt) / durationMs);

        updateDrones((current) =>
          current.map((drone) => {
            if (drone.id !== droneId) {
              return drone;
            }

            return {
              ...drone,
              position: lerpPoint(startPoint, destination, progress),
              status: progress >= 1 ? "arrived" : activeStatus,
            };
          }),
        );

        if (progress >= 1) {
          flushTelemetry(true);
          resolve();
          return;
        }

        requestAnimationFrame(step);
      };

      requestAnimationFrame(step);
    });

  /** Pickup-only loop: drone picks all trash in its zone and returns collected items. */
  const runPickupLoopForDrone = async (
    droneId: DroneState["id"],
    zoneId: DroneState["targetZoneId"],
  ): Promise<PlacedTrash[]> => {
    const collectedItems: PlacedTrash[] = [];

    while (true) {
      const drone = dronesRef.current.find((entry) => entry.id === droneId);
      if (!drone) return collectedItems;

      const zonePlacements = placementsRef.current.filter((p) => p.zoneId === zoneId);
      if (zonePlacements.length === 0) {
        updateDrones((current) =>
          current.map((entry) =>
            entry.id === droneId
              ? { ...entry, status: "arrived", carryingPlacementId: null, carryingSpritePath: null }
              : entry,
          ),
        );
        return collectedItems;
      }

      const nearest = zonePlacements.reduce((best, candidate) => {
        const bd = getDistance(drone.position.x, drone.position.y, best.position.x, best.position.y);
        const cd = getDistance(drone.position.x, drone.position.y, candidate.position.x, candidate.position.y);
        return cd < bd ? candidate : best;
      });

      await performDroneAction({
        droneId,
        destination: nearest.position,
        movingStatus: "moving",
        moveDurationMs: durationForDistance(drone.position, nearest.position),
        holdStatus: "picking",
        holdDurationMs: 1200,
      });

      let picked: PlacedTrash | null = null;
      updatePlacements((current) => {
        const found = current.find((p) => p.id === nearest.id);
        if (!found) return current;
        picked = found;
        return current.filter((p) => p.id !== nearest.id);
      });

      if (picked) {
        collectedItems.push(picked);
        setStatusMessage(`${drone.label} collected ${(picked as PlacedTrash).name} in Zone ${zoneId}.`);
      }
    }
  };

  const startDronePhase = async () => {
    const initialDrones: DroneState[] = droneCatalog.map((drone, index) => ({
      id: drone.id,
      label: drone.label,
      spritePath: drone.spritePath,
      targetZoneId: drone.id,
      position: getSpawnPointFromArea(droneSpawnArea, index, droneCatalog.length),
      status: "idle",
      carryingPlacementId: null,
      carryingSpritePath: null,
    }));

    updateDrones(initialDrones);
    setDeliveredPlacements([]);
    setStatusMessage("Drones spawned. Moving to assigned zones...");
    startTelemetryFlushTimer();

    // Phase 1: Fly to assigned zones
    await Promise.all(
      initialDrones.map((drone) => {
        const dest = getZoneTargetPoint(field, drone.targetZoneId, droneArrivalOffsets[drone.id]);
        return performDroneAction({
          droneId: drone.id,
          destination: dest,
          movingStatus: "moving",
          moveDurationMs: durationForDistance(drone.position, dest),
        });
      }),
    );

    setStatusMessage("Drones reached their zones. Collecting trash...");

    // Phase 2: Pick all trash in zones (trash sprites disappear on pickup)
    const allCollected = await Promise.all(
      initialDrones.map((drone) => runPickupLoopForDrone(drone.id, drone.targetZoneId)),
    );
    const totalCollected = allCollected.flat();

    if (totalCollected.length === 0) {
      flushTelemetry(true);
      stopTelemetryFlushTimer();
      setStatusMessage("All zones were already clean. No trash to deliver.");
      return;
    }

    setStatusMessage(`All trash collected (${totalCollected.length} items). Delivering to drop zone...`);

    // Phase 3: Fly all drones to the drop zone together
    await Promise.all(
      dronesRef.current.map((drone) =>
        performDroneAction({
          droneId: drone.id,
          destination: dropAreaCenter,
          movingStatus: "delivering",
          moveDurationMs: durationForDistance(drone.position, dropAreaCenter),
        }),
      ),
    );

    // Phase 4: Spawn collected trash sprites inside the drop zone
    setDeliveredPlacements(totalCollected);

    updateDrones((current) =>
      current.map((entry) => ({
        ...entry,
        status: "arrived",
        carryingPlacementId: null,
        carryingSpritePath: null,
      })),
    );

    flushTelemetry(true);
    stopTelemetryFlushTimer();
    setStatusMessage(
      `Delivery complete! ${totalCollected.length} items dropped at the collection zone.`,
    );
  };

  const getDropSlotPosition = (index: number, total: number) => {
    const cols = Math.max(3, Math.ceil(Math.sqrt(total)));
    const rows = Math.max(2, Math.ceil(total / cols));
    const col = index % cols;
    const row = Math.floor(index / cols);

    const gapX = trashArea.rect.width / (cols + 1);
    const gapY = trashArea.rect.height / (rows + 1);

    return {
      x: trashArea.rect.x + gapX * (col + 1),
      y: trashArea.rect.y + gapY * (row + 1),
    };
  };

  const createPlacement = (assetId: string, targetZoneId?: number) => {
    const asset = trashAssets.find((entry) => entry.id === assetId);
    if (!asset) {
      setStatusMessage("Unknown trash asset.");
      return;
    }

    const zoneId = (targetZoneId ?? randomZoneId()) as (typeof zones)[number]["id"];
    const zoneRect = zoneRectMap.get(zoneId);
    if (!zoneRect) {
      setStatusMessage("Target zone unavailable.");
      return;
    }

    const safePoint = getSafeSpawnPointInZone(zoneRect, placements, zoneId);
    const placement: PlacedTrash = {
      id: `placement-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      assetId: asset.id,
      name: asset.name,
      spritePath: asset.spritePath,
      type: asset.type,
      zoneId,
      position: safePoint,
    };

    setPlacements((current) => [...current, placement]);
    setStatusMessage(`${asset.name} placed in Zone ${zoneId}.`);
  };

  const handleMapDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const assetId = event.dataTransfer.getData("text/plain");
    if (!assetId) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const point = {
      x: (event.clientX - bounds.left) / bounds.width,
      y: (event.clientY - bounds.top) / bounds.height,
    };

    const zoneId = getZoneIdForPoint(field, point);
    if (!zoneId) {
      setStatusMessage("Drop rejected. You can only place trash inside cleaning zones.");
      return;
    }

    const asset = trashAssets.find((entry) => entry.id === assetId);
    if (!asset) {
      setStatusMessage("Unknown trash asset.");
      return;
    }

    const zoneRect = zoneRectMap.get(zoneId);
    if (!zoneRect) {
      setStatusMessage("Target zone unavailable.");
      return;
    }

    const safePoint = getSafeSpawnPointInZone(zoneRect, placements, zoneId, point);
    const placement: PlacedTrash = {
      id: `placement-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      assetId: asset.id,
      name: asset.name,
      spritePath: asset.spritePath,
      type: asset.type,
      zoneId,
      position: safePoint,
    };

    setPlacements((current) => [...current, placement]);
    setStatusMessage(`${asset.name} dropped in Zone ${zoneId}.`);
  };

  const handleStartSimulation = async () => {
    if (placements.length === 0) {
      setStatusMessage("Place at least one trash item before starting simulation.");
      return;
    }

    if (isSimulationRunning) {
      setStatusMessage("Simulation is already running.");
      return;
    }

    setIsSaving(true);
    setIsSimulationRunning(true);
    setStatusMessage("Saving board snapshot to MongoDB...");

    try {
      const response = await fetch("/api/simulation/placements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boardId,
          createdAt: new Date().toISOString(),
          placements,
        }),
      });

      if (!response.ok) {
        const raw = await response.text();
        try {
          const payload = JSON.parse(raw) as { error?: string };
          throw new Error(payload.error ?? "Failed to save placements.");
        } catch {
          throw new Error(raw || "Failed to save placements.");
        }
      }

      setStatusMessage("Saved to MongoDB. Initializing drones...");
    } catch (error) {
      setStatusMessage(
        `MongoDB save failed. Running local simulation only. ${
          error instanceof Error ? error.message : "Unexpected persistence error."
        }`,
      );
    } finally {
      setIsSaving(false);
    }

    try {
      await startDronePhase();
    } finally {
      setIsSimulationRunning(false);
    }
  };

  return (
    <section className="grid gap-4 lg:grid-cols-[260px_1fr]" aria-label="Simulation map">
      <TrashSidebar assets={trashAssets} onQuickSpawn={createPlacement} />

      <div className="aether-panel rounded-3xl p-4 sm:p-6">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
            Cleanup Stage - Trash Placement
          </h1>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#a1a1a1]">
            Step 2: Place Trashes + Save Snapshot
          </p>
        </div>

        <div
          className="relative overflow-hidden rounded-xl border border-white/20"
          style={{ aspectRatio: "1 / 1" }}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleMapDrop}
        >
          <div className="absolute inset-0 bg-[#1ac463]" />
          <div className="absolute inset-x-0 bottom-0 h-[38%] bg-[#1496db]" />
          <div className="absolute inset-x-0 top-[28%] h-[34%] bg-[#ead8b0]/85" />

          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url('${backgroundImage}')` }}
          />

          <ZoneGrid zones={zones} field={field} />
          <PlacementLayer placements={placements} />
          <section className="pointer-events-none absolute inset-0 z-35" aria-label="Delivered trash in drop zone">
            {deliveredPlacements.map((placement, index) => {
              const point = getDropSlotPosition(index, deliveredPlacements.length);
              return (
                <div
                  key={`delivered-${placement.id}`}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: toPercent(point.x), top: toPercent(point.y) }}
                >
                  <Image
                    src={placement.spritePath}
                    alt={`${placement.name} delivered`}
                    width={30}
                    height={30}
                    className="h-7 w-7 object-contain drop-shadow-[0_1px_4px_rgba(0,0,0,0.45)] sm:h-8 sm:w-8"
                  />
                </div>
              );
            })}
          </section>
          <DroneLayer drones={drones} moveDurationMs={DRONE_MOVE_DURATION_MS} />
          <TrashDropArea area={trashArea} />
        </div>

        <div className="mt-4 grid gap-2 rounded-xl border border-white/10 bg-black/25 p-3 text-xs text-white/80 sm:grid-cols-2 lg:grid-cols-3">
          {zoneCoordinates.map(({ zone, rect }) => (
            <div key={zone.id} className="rounded-md border border-white/10 px-2 py-1 font-mono">
              <span className="text-[#ff5ca8]">Z{zone.id}</span>
              <span className="ml-2 text-[#a1a1a1]">
                x:{rect.x.toFixed(3)} y:{rect.y.toFixed(3)} w:{rect.width.toFixed(3)} h:{rect.height.toFixed(3)}
              </span>
            </div>
          ))}
          <div className="rounded-md border border-[#ffde59]/35 px-2 py-1 font-mono text-[#ffe783] lg:col-span-3">
            DROP x:{trashArea.rect.x.toFixed(3)} y:{trashArea.rect.y.toFixed(3)} w:{trashArea.rect.width.toFixed(3)} h:{trashArea.rect.height.toFixed(3)}
          </div>
        </div>

        <div className="mt-4">
          <SimulationActionBar
            placementsCount={placements.length}
            onStartSimulation={handleStartSimulation}
            isSaving={isSaving}
            statusMessage={`${statusMessage}${
              drones.length > 0
                ? ` (${drones.filter((drone) => drone.status === "arrived").length}/${drones.length} drones arrived)`
                : ""
            } | delivered: ${deliveredPlacements.length} | realtime: ${telemetryStatus} (${liveTelemetryCount} events)`}
          />
        </div>
      </div>
    </section>
  );
}