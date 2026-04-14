import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { GROUPED_PERFORMANCE_ROWS } from "@/lib/grouped-performance-data";

const COLLECTION = "grouped_performance_rows";

export const runtime = "nodejs";

export async function GET() {
  try {
    const db = await getDb();
    const col = db.collection(COLLECTION);

    // Keep grouped rows synced with exact table values.
    await col.deleteMany({});
    await col.insertMany(
      GROUPED_PERFORMANCE_ROWS.map((r) => ({
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
            qualityMeasureId: 1,
            performanceRate: 1,
          },
        },
      )
      .toArray();

    return NextResponse.json({ rows });
  } catch (e) {
    const error = e instanceof Error ? e.message : "Failed to load grouped performance rows";
    return NextResponse.json({ rows: GROUPED_PERFORMANCE_ROWS, error }, { status: 200 });
  }
}
