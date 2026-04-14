import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { SINGLE_PERFORMANCE_ROWS } from "@/lib/single-performance-data";

const COLLECTION = "single_performance_rows";

export const runtime = "nodejs";

export async function GET() {
  try {
    const db = await getDb();
    const col = db.collection(COLLECTION);

    // Keep DB in sync with exact fixture percentages for UI.
    await col.deleteMany({});
    await col.insertMany(
      SINGLE_PERFORMANCE_ROWS.map((r) => ({
        ...r,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    );

    const rows = await col
      .find(
        {},
        {
          projection: {
            _id: 0,
            practiceName: 1,
            providerName: 1,
            qualityMeasureId: 1,
            performanceRate: 1,
          },
        },
      )
      .toArray();

    return NextResponse.json({ rows });
  } catch (e) {
    const error = e instanceof Error ? e.message : "Failed to load single performance rows";
    return NextResponse.json({ rows: SINGLE_PERFORMANCE_ROWS, error }, { status: 200 });
  }
}
