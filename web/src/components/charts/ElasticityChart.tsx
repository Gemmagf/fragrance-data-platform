"use client";

import { Bar, BarChart, CartesianGrid, ErrorBar, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART, axisTick, tooltipStyle } from "./chartStyle";

type Row = { tier: string; elasticity: number; ci_low: number; ci_high: number; n_obs: number };

/** Negative elasticities; closer to zero means less price-sensitive. Error bars are the 95% CI. */
export function ElasticityChart({ rows }: { rows: Row[] }) {
  const data = rows.map((r) => ({
    name: `Tier ${r.tier}`,
    elasticity: r.elasticity,
    err: [r.elasticity - r.ci_low, r.ci_high - r.elasticity],
    ci: `${r.ci_low.toFixed(2)} to ${r.ci_high.toFixed(2)}`,
  }));
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
          <XAxis dataKey="name" tick={axisTick} axisLine={false} tickLine={false} />
          <YAxis tick={axisTick} axisLine={false} tickLine={false} width={48} domain={[-2.4, 0]} />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(_v, _n, p) => [`${(p.payload.elasticity as number).toFixed(2)} (95% CI ${p.payload.ci})`, "Elasticity"]}
          />
          <Bar dataKey="elasticity" fill={CHART.primary} radius={[3, 3, 0, 0]}>
            <ErrorBar dataKey="err" direction="y" stroke="#5b5b58" strokeWidth={1.5} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
