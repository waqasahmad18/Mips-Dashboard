import { MongoClient, type Db } from "mongodb";

const URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME?.trim() || "mips_dashboard";

export const SNAPSHOT_COLLECTION = "dashboard_snapshots";

type Cache = { promise: Promise<MongoClient> | null };
const g = globalThis as unknown as { __mipsMongo?: Cache };

function cache(): Cache {
  if (!g.__mipsMongo) g.__mipsMongo = { promise: null };
  return g.__mipsMongo;
}

export async function getDb(): Promise<Db> {
  if (!URI?.trim()) throw new Error("MONGODB_URI is not set");
  const c = cache();
  if (!c.promise) {
    c.promise = new MongoClient(URI).connect();
  }
  const client = await c.promise;
  return client.db(DB_NAME);
}
