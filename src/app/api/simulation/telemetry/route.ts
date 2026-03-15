import { NextResponse } from "next/server";
import { getMongoClientPromise } from "@/lib/mongodb";
import { TELEMETRY_COLLECTION_NAME } from "@/lib/simulation/config";
import { publishTelemetry } from "@/lib/simulation/telemetry-bus";
import {
  SimulationTelemetryPayload,
  TrashTelemetryEvent,
  DroneTelemetryEvent,
} from "@/types/simulation";

function isDroneTelemetry(value: unknown): value is DroneTelemetryEvent {
  if (!value || typeof value !== "object") {
    return false;
  }
  const item = value as Partial<DroneTelemetryEvent>;
  return (
    typeof item.boardId === "string" &&
    typeof item.droneId === "number" &&
    typeof item.timestamp === "string" &&
    !!item.position &&
    typeof item.position.x === "number" &&
    typeof item.position.y === "number" &&
    typeof item.status === "string"
  );
}

function isTrashTelemetry(value: unknown): value is TrashTelemetryEvent {
  if (!value || typeof value !== "object") {
    return false;
  }
  const item = value as Partial<TrashTelemetryEvent>;
  return (
    typeof item.boardId === "string" &&
    typeof item.placementId === "string" &&
    typeof item.zoneId === "number" &&
    typeof item.timestamp === "string" &&
    !!item.position &&
    typeof item.position.x === "number" &&
    typeof item.position.y === "number"
  );
}

function isTelemetryPayload(value: unknown): value is SimulationTelemetryPayload {
  if (!value || typeof value !== "object") {
    return false;
  }
  const payload = value as Partial<SimulationTelemetryPayload>;
  return (
    typeof payload.boardId === "string" &&
    typeof payload.timestamp === "string" &&
    Array.isArray(payload.drones) &&
    payload.drones.every((entry) => isDroneTelemetry(entry)) &&
    Array.isArray(payload.trashes) &&
    payload.trashes.every((entry) => isTrashTelemetry(entry))
  );
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as unknown;

    if (!isTelemetryPayload(payload)) {
      return NextResponse.json({ error: "Invalid telemetry payload." }, { status: 400 });
    }

    // Always publish to SSE first — this is fast (in-memory) and the primary real-time path.
    publishTelemetry(payload);

    // Best-effort persistence to MongoDB. Failure does not block the response.
    let persisted = false;
    try {
      const client = await getMongoClientPromise();
      const dbName = process.env.MONGODB_DB_NAME ?? "aeropitch";
      const collection = client.db(dbName).collection(TELEMETRY_COLLECTION_NAME);

      await collection.insertOne({
        boardId: payload.boardId,
        timestamp: payload.timestamp,
        drones: payload.drones,
        trashes: payload.trashes,
        insertedAt: new Date().toISOString(),
      });
      persisted = true;
    } catch (dbError) {
      console.warn("[telemetry] MongoDB insert failed, SSE was still published.", dbError);
    }

    return NextResponse.json({ ok: true, persisted }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
