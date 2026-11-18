type Tier = { tier: string; elasticity: number; sp: number; sc: number; revenue: number; gm: number };

/**
 * Last-12-month gross-margin uplift of a list-price increase p (e.g. 0.04 for +4%).
 * With elasticity e per tier: new_gm = (1+p)^e * ((1+p) * Sp - Sc). Same model as analyses.repricing_scenario.
 */
export function upliftAt(tiers: Tier[], p: number) {
  const byTier = tiers.map((t) => {
    const newGm = Math.pow(1 + p, t.elasticity) * ((1 + p) * t.sp - t.sc);
    return { tier: t.tier, revenue: t.revenue, uplift: newGm - t.gm };
  });
  return { total: byTier.reduce((s, r) => s + r.uplift, 0), byTier };
}
