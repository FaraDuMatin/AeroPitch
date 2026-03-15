export type ZoneId = 1 | 2 | 3 | 4 | 5 | 6;
export type TrashType = "trash" | "recycle";
export type DroneStatus = "idle" | "moving" | "arrived" | "picking" | "delivering" | "dropping";

export interface NormalizedRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ZoneDefinition {
  id: ZoneId;
  label: string;
  description: string;
}

export interface TrashAsset {
  id: string;
  name: string;
  spritePath: string;
  type: TrashType;
}

export interface NormalizedPoint {
  x: number;
  y: number;
}

export interface PlacedTrash {
  id: string;
  assetId: string;
  name: string;
  spritePath: string;
  type: TrashType;
  zoneId: ZoneId;
  position: NormalizedPoint;
}

export interface PlacementSnapshot {
  boardId: string;
  createdAt: string;
  placements: PlacedTrash[];
}

export interface DroneDefinition {
  id: ZoneId;
  label: string;
  spritePath: string;
}

export interface DroneState {
  id: ZoneId;
  label: string;
  spritePath: string;
  targetZoneId: ZoneId;
  position: NormalizedPoint;
  status: DroneStatus;
  carryingPlacementId: string | null;
  carryingSpritePath: string | null;
}

export interface DroneTelemetryEvent {
  boardId: string;
  droneId: ZoneId;
  position: NormalizedPoint;
  status: DroneStatus;
  timestamp: string;
}

export interface TrashTelemetryEvent {
  boardId: string;
  placementId: string;
  position: NormalizedPoint;
  zoneId: ZoneId;
  timestamp: string;
}

export interface SimulationTelemetryPayload {
  boardId: string;
  timestamp: string;
  drones: DroneTelemetryEvent[];
  trashes: TrashTelemetryEvent[];
}

export interface SimulationTelemetryStreamEvent {
  type: "telemetry";
  payload: SimulationTelemetryPayload;
}

export interface OperationField {
  rect: NormalizedRect;
}

export interface TrashDropArea {
  label: string;
  note: string;
  rect: NormalizedRect;
}