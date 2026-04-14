import { NextResponse } from "next/server";
import { buildDashboardPayload } from "@/lib/dashboard-payload";
import { getDb, SNAPSHOT_COLLECTION } from "@/lib/mongodb";

export const runtime = "nodejs";

function q(s: string | null) {
  return (s ?? "").trim().slice(0, 400);
}

export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  const practice = q(p.get("practice"));
  const provider = q(p.get("provider"));
  const measure = q(p.get("measure"));
  if (!practice || !provider || !measure) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  let db;
  try {
    db = await getDb();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "DB", hint: "MONGODB_URI" },
      { status: 503 },
    );
  }

  const col = db.collection(SNAPSHOT_COLLECTION);

  try {
    if (p.get("refresh") !== "1") {
      const ex = await col.findOne({ practice, provider, measure });
      if (ex) {
        return NextResponse.json({
          source: "database",
          practice: ex.practice,
          provider: ex.provider,
          measure: ex.measure,
          scores: ex.scores,
          overall: ex.overall,
          performanceByTab: ex.performanceByTab,
          updatedAt: ex.updatedAt,
        });
      }
    }

    const pl = buildDashboardPayload(practice, provider, measure);
    const now = new Date();

    await col.updateOne(
      { practice, provider, measure },
      {
        $set: {
          practice: pl.practice,
          provider: pl.provider,
          measure: pl.measure,
          scores: pl.scores,
          overall: pl.overall,
          performanceByTab: pl.performanceByTab,
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true },
    );

    const saved = await col.findOne({ practice, provider, measure });

    return NextResponse.json({
      source: p.get("refresh") === "1" ? "recomputed" : "computed",
      ...pl,
      updatedAt: saved?.updatedAt ?? now,
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "err" }, { status: 500 });
  }
}
