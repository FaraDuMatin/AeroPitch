import { NextResponse } from "next/server";
import { getMongoClientPromise } from "@/lib/mongodb";
import { PlacementSnapshot, PlacedTrash, TrashType } from "@/types/simulation";

const COLLECTION_NAME = "simulation_placements";

function isTrashType(value: string): value is TrashType {
  return value === "trash" || value === "recycle";
}

function isPlacement(value: unknown): value is PlacedTrash {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<PlacedTrash>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.assetId === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.spritePath === "string" &&
    typeof candidate.zoneId === "number" &&
    candidate.zoneId >= 1 &&
    candidate.zoneId <= 6 &&
    !!candidate.position &&
    typeof candidate.position.x === "number" &&
    typeof candidate.position.y === "number" &&
    isTrashType(String(candidate.type))
  );
}

function isSnapshot(value: unknown): value is PlacementSnapshot {
  if (!value || typeof value !== "object") {
    return false;
  }

  const snapshot = value as Partial<PlacementSnapshot>;
  return (
    typeof snapshot.boardId === "string" &&
    typeof snapshot.createdAt === "string" &&
    Array.isArray(snapshot.placements) &&
    snapshot.placements.every((entry) => isPlacement(entry))
  );
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as unknown;

    if (!isSnapshot(payload)) {
      return NextResponse.json(
        { error: "Invalid payload format for placement snapshot." },
        { status: 400 },
      );
    }

    if (payload.placements.length === 0) {
      return NextResponse.json(
        { error: "At least one placement is required." },
        { status: 400 },
      );
    }

    const client = await getMongoClientPromise();
    const dbName = process.env.MONGODB_DB_NAME ?? "aeropitch";
    const collection = client.db(dbName).collection(COLLECTION_NAME);

    // Shared board mode: keep only latest snapshot for this board.
    await collection.deleteMany({ boardId: payload.boardId });

    const result = await collection.insertOne({
      boardId: payload.boardId,
      createdAt: payload.createdAt,
      placements: payload.placements,
      insertedAt: new Date().toISOString(),
    });

    return NextResponse.json({ id: result.insertedId.toString() }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}