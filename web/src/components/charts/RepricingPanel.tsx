"use client";

import { useState } from "react";
import { KPICard } from "../KPICard";
import { DataTable } from "../DataTable";
import { chfMillions, num, pct } from "@/lib/format";

type Tier = { tier: string; elasticity: number; sp: number; sc: number; revenue: number; gm: number };

/**
 * Recomputes the LTM gross-margin uplift in the browser.
 * With elasticity e per tier, new_gm = (1+p)^e * ((1+p) * Sp - Sc), where
 * Sp = sum(qty * price) and Sc = sum(qty * standard cost). Same model as analyses.repricing_scenario.
 */
export function RepricingPanel({ tiers, ltmRevenue, ltmGm }: { tiers: Tier[]; ltmRevenue: number; ltmGm: number }) {
  const [step, setStep] = useState(4); // percent, in 0.5 steps
  const p = step / 100;

  const rows = [...tiers]
    .sort((a, b) => (a.tier < b.tier ? -1 : 1))
    .map((t) => {
      const newGm = Math.pow(1 + p, t.elasticity) * ((1 + p) * t.sp - t.sc);
      const uplift = newGm - t.gm;
      return { tier: t.tier, revenue: t.revenue, uplift, bps: (1e4 * uplift) / t.revenue };
    });
  const total = rows.reduce((s, r) => s + r.uplift, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-background p-4">
        <label htmlFor="price-step" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          List-price increase
        </label>
        <input
          id="price-step"
          type="range"
          min={0}
          max={10}
          step={0.5}
          value={step}
          onChange={(e) => setStep(Number(e.target.value))}
          className="w-64 accent-[#0a2540]"
        />
        <output className="min-w-16 font-mono text-lg font-semibold tabular-nums">{step.toFixed(1)}%</output>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <KPICard
          label="Gross-margin uplift"
          value={chfMillions(total, 2)}
          help={`${num((1e4 * total) / ltmRevenue)} bps of LTM revenue, before churn`}
          accent={total >= 0 ? "positive" : "negative"}
        />
        <KPICard label="LTM gross margin, baseline" value={pct(ltmGm / ltmRevenue)} help="Standard-cost method" />
        <KPICard label="BRD target" value="+50 bps" help="Selective repricing, not a blanket increase" />
      </div>

      <DataTable
        columns={[
          { key: "tier", label: "Tier" },
          { key: "revenue", label: "Revenue, LTM", align: "right" },
          { key: "uplift", label: "GM uplift", align: "right" },
          { key: "bps", label: "bps of tier revenue", align: "right" },
        ]}
        rows={rows.map((r) => ({
          tier: `Tier ${r.tier}`,
          revenue: chfMillions(r.revenue),
          uplift: chfMillions(r.uplift, 2),
          bps: num(r.bps),
        }))}
      />
    </div>
  );
}
