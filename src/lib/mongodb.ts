import { MongoClient } from "mongodb";

type MongoGlobal = {
  mongoClientPromise?: Promise<MongoClient>;
};

const globalMongo = globalThis as typeof globalThis & MongoGlobal;

export function getMongoClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not set. Add it to my-app/.env.local.");
  }

  if (!globalMongo.mongoClientPromise) {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    globalMongo.mongoClientPromise = client.connect().catch((err) => {
      // Clear cached promise so the next call retries instead of returning the same rejection.
      globalMongo.mongoClientPromise = undefined;
      throw err;
    });
  }

  return globalMongo.mongoClientPromise;
}