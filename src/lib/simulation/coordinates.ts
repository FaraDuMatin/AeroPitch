import {
  SIMULATION_GRID_COLUMNS,
  SIMULATION_GRID_ROWS,
} from "@/lib/simulation/config";
import {
  NormalizedPoint,
  NormalizedRect,
  OperationField,
  PlacedTrash,
  ZoneId,
} from "@/types/simulation";

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

export const toPercent = (value: number) => `${clamp01(value) * 100}%`;

export function getZoneRect(field: OperationField, zoneId: ZoneId): NormalizedRect {
  const zoneIndex = zoneId - 1;
  const column = zoneIndex % SIMULATION_GRID_COLUMNS;
  const row = Math.floor(zoneIndex / SIMULATION_GRID_COLUMNS);

  const zoneWidth = field.rect.width / SIMULATION_GRID_COLUMNS;
  const zoneHeight = field.rect.height / SIMULATION_GRID_ROWS;

  return {
    x: field.rect.x + column * zoneWidth,
    y: field.rect.y + row * zoneHeight,
    width: zoneWidth,
    height: zoneHeight,
  };
}

export function formatRectForStyle(rect: NormalizedRect): Record<string, string> {
  return {
    left: toPercent(rect.x),
    top: toPercent(rect.y),
    width: toPercent(rect.width),
    height: toPercent(rect.height),
  };
}

export function pointInRect(point: NormalizedPoint, rect: NormalizedRect): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

export function randomZoneId(): ZoneId {
  return (Math.floor(Math.random() * SIMULATION_GRID_COLUMNS * SIMULATION_GRID_ROWS) + 1) as ZoneId;
}

export function getZoneIdForPoint(field: OperationField, point: NormalizedPoint): ZoneId | null {
  if (!pointInRect(point, field.rect)) {
    return null;
  }

  const relativeX = (point.x - field.rect.x) / field.rect.width;
  const relativeY = (point.y - field.rect.y) / field.rect.height;

  const column = Math.min(
    SIMULATION_GRID_COLUMNS - 1,
    Math.max(0, Math.floor(relativeX * SIMULATION_GRID_COLUMNS)),
  );
  const row = Math.min(
    SIMULATION_GRID_ROWS - 1,
    Math.max(0, Math.floor(relativeY * SIMULATION_GRID_ROWS)),
  );

  return (row * SIMULATION_GRID_COLUMNS + column + 1) as ZoneId;
}

function randomPointInRect(rect: NormalizedRect, margin = 0.02): NormalizedPoint {
  const safeMarginX = Math.min(margin, rect.width / 3);
  const safeMarginY = Math.min(margin, rect.height / 3);
  const minX = rect.x + safeMarginX;
  const maxX = rect.x + rect.width - safeMarginX;
  const minY = rect.y + safeMarginY;
  const maxY = rect.y + rect.height - safeMarginY;

  return {
    x: minX + Math.random() * Math.max(0.001, maxX - minX),
    y: minY + Math.random() * Math.max(0.001, maxY - minY),
  };
}

function distance(a: NormalizedPoint, b: NormalizedPoint): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function getSafeSpawnPointInZone(
  zoneRect: NormalizedRect,
  existingPlacements: PlacedTrash[],
  zoneId: ZoneId,
  preferredPoint?: NormalizedPoint,
  minDistance = 0.06,
): NormalizedPoint {
  const zonePlacements = existingPlacements.filter((placement) => placement.zoneId === zoneId);
  const attempts = 45;

  if (preferredPoint && pointInRect(preferredPoint, zoneRect)) {
    const collision = zonePlacements.some(
      (placement) => distance(preferredPoint, placement.position) < minDistance,
    );
    if (!collision) {
      return preferredPoint;
    }
  }

  let fallbackPoint = randomPointInRect(zoneRect);
  for (let i = 0; i < attempts; i += 1) {
    const candidate = randomPointInRect(zoneRect);
    fallbackPoint = candidate;
    const collision = zonePlacements.some(
      (placement) => distance(candidate, placement.position) < minDistance,
    );
    if (!collision) {
      return candidate;
    }
  }

  return fallbackPoint;
}

export function getSpawnPointFromArea(
  spawnArea: NormalizedRect,
  index: number,
  total: number,
): NormalizedPoint {
  const cols = Math.ceil(Math.sqrt(total));
  const rows = Math.ceil(total / cols);
  const col = index % cols;
  const row = Math.floor(index / cols);

  const gapX = spawnArea.width / Math.max(cols + 1, 2);
  const gapY = spawnArea.height / Math.max(rows + 1, 2);

  return {
    x: spawnArea.x + gapX * (col + 1),
    y: spawnArea.y + gapY * (row + 1),
  };
}

export function getZoneTargetPoint(
  field: OperationField,
  zoneId: ZoneId,
  offset?: NormalizedPoint,
): NormalizedPoint {
  const zoneRect = getZoneRect(field, zoneId);
  const centerX = zoneRect.x + zoneRect.width * 0.5;
  const centerY = zoneRect.y + zoneRect.height * 0.5;
  const dx = offset ? offset.x * zoneRect.width : 0;
  const dy = offset ? offset.y * zoneRect.height : 0;

  return {
    x: clamp01(centerX + dx),
    y: clamp01(centerY + dy),
  };
}

export function lerpPoint(from: NormalizedPoint, to: NormalizedPoint, t: number): NormalizedPoint {
  const clamped = clamp01(t);
  return {
    x: from.x + (to.x - from.x) * clamped,
    y: from.y + (to.y - from.y) * clamped,
  };
}