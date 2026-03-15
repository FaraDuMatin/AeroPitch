import {
  DroneDefinition,
  NormalizedPoint,
  OperationField,
  TrashAsset,
  TrashDropArea,
  ZoneDefinition,
} from "@/types/simulation";

export const SIMULATION_GRID_COLUMNS = 3;
export const SIMULATION_GRID_ROWS = 2;
export const SHARED_BOARD_ID = "shared-main-board";
export const DRONE_MOVE_DURATION_MS = 2200;
export const DRONE_TICK_INTERVAL_MS = 120;
export const TELEMETRY_COLLECTION_NAME = "simulation_telemetry";

export const simulationZones: ZoneDefinition[] = [
  { id: 1, label: "Zone 1", description: "Top-left cleaning sector" },
  { id: 2, label: "Zone 2", description: "Top-center cleaning sector" },
  { id: 3, label: "Zone 3", description: "Top-right cleaning sector" },
  { id: 4, label: "Zone 4", description: "Bottom-left cleaning sector" },
  { id: 5, label: "Zone 5", description: "Bottom-center cleaning sector" },
  { id: 6, label: "Zone 6", description: "Bottom-right cleaning sector" },
];

export const operationField: OperationField = {
  rect: {
    x: 0,
    y: 0.36,
    width: 1,
    height: 0.64,
  },
};

export const trashDropArea: TrashDropArea = {
  label: "Trash Drop Zone",
  note: "Reserved for drone delivery phase.",
  rect: {
    x: 0.69,
    y: 0.01,
    width: 0.3,
    height: 0.24,
  },
};

export const trashCatalog: TrashAsset[] = [
  { id: "trash1", name: "Paper Cup", spritePath: "/trashes/trash1.png", type: "trash" },
  { id: "trash2", name: "Plastic Bag", spritePath: "/trashes/trash2.png", type: "trash" },
  { id: "trash3", name: "Plastic Bottle", spritePath: "/trashes/trash3.png", type: "recycle" },
  { id: "trash4", name: "Rotten Apple", spritePath: "/trashes/trash4.png", type: "trash" },
  { id: "trash5", name: "Pear", spritePath: "/trashes/trash5.png", type: "recycle" },
  { id: "trash6", name: "Banana Peel", spritePath: "/trashes/trash6.png", type: "trash" },
];

export const droneCatalog: DroneDefinition[] = [
  { id: 1, label: "Drone 1", spritePath: "/drone1.png" },
  { id: 2, label: "Drone 2", spritePath: "/drone2.png" },
  { id: 3, label: "Drone 3", spritePath: "/drone3.png" },
  { id: 4, label: "Drone 4", spritePath: "/drone4.png" },
  { id: 5, label: "Drone 5", spritePath: "/drone5.png" },
  { id: 6, label: "Drone 6", spritePath: "/drone6.png" },
];

export const droneSpawnArea = {
  x: 0.035,
  y: 0.035,
  width: 0.24,
  height: 0.145,
};

export const droneArrivalOffsets: Record<number, NormalizedPoint> = {
  1: { x: 0.15, y: 0.17 },
  2: { x: 0.06, y: -0.2 },
  3: { x: 0.16, y: -0.16 },
  4: { x: -0.14, y: 0.16 },
  5: { x: 0.03, y: 0.16 },
  6: { x: 0.17, y: 0.14 },
};