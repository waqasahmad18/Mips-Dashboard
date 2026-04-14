import { fnv1aMix, mulberry32, round2 } from "@/lib/dashboard-seed";

export type CategoryScores = {
  quality: { earned: number; cap: number };
  cost: { earned: number; cap: number };
  aci: { earned: number; cap: number };
  ia: { earned: number; cap: number };
};

export function computeScores(
  practice: string,
  provider: string,
  measure: string,
): CategoryScores {
  const seed = fnv1aMix([practice, provider, measure]);
  const u = mulberry32(seed);

  const qualityEarned = Math.min(60, round2(6 + u() * 52));
  const costOn = u() > 0.72;
  const costCap = costOn ? 30 : 0;
  const costEarned = costOn ? Math.min(costCap, round2(u() * 28)) : 0;
  const aciEarned = Math.min(25, round2(4 + u() * 20));
  const iaEarned = Math.min(15, round2(3 + u() * 12));

  return {
    quality: { earned: qualityEarned, cap: 60 },
    cost: { earned: costEarned, cap: costCap },
    aci: { earned: aciEarned, cap: 25 },
    ia: { earned: iaEarned, cap: 15 },
  };
}

export function overallFromScores(s: CategoryScores) {
  return round2(s.quality.earned + s.cost.earned + s.aci.earned + s.ia.earned);
}
