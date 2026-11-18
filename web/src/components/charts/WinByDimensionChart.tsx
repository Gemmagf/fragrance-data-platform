"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART, axisTick, tooltipStyle } from "./chartStyle";

type Row = { dimension: string; value: string; decided: number; won: number; win_rate: number };

const DIMENSIONS = [
  { key: "segment", label: "Segment" },
  { key: "tier", label: "Customer tier" },
  { key: "region", label: "Region" },
  { key: "olfactive_family", label: "Olfactive family" },
];

export function WinByDimensionChart({ rows }: { rows: Row[] }) {
  const [dim, setDim] = useState("segment");
  const data = rows
    .filter((r) => r.dimension === dim)
    .sort((a, b) => a.win_rate - b.win_rate)
    .map((r) => ({ name: r.value, win_rate: r.win_rate, decided: r.decided }));
  const overall = rows.filter((r) => r.dimension === dim).reduce((s, r) => s + r.won, 0) /
    rows.filter((r) => r.dimension === dim).reduce((s, r) => s + r.decided, 0);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label htmlFor="dim" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Cut by
        </label>
        <select
          id="dim"
          value={dim}
          onChange={(e) => setDim(e.target.value)}
          className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
        >
          {DIMENSIONS.map((d) => (
            <option key={d.key} value={d.key}>
              {d.label}
            </option>
          ))}
        </select>
        <span className="text-xs text-muted-foreground">Dashed reference: overall win rate {(overall * 100).toFixed(1)}%</span>
      </div>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 40, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 0.5]}
              tick={axisTick}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${Math.round(v * 100)}%`}
            />
            <YAxis type="category" dataKey="name" tick={axisTick} axisLine={false} tickLine={false} width={120} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v, _n, p) => [`${(Number(v) * 100).toFixed(1)}% (n=${p.payload.decided})`, "Win rate"]}
            />
            <Bar dataKey="win_rate" radius={[0, 3, 3, 0]}>
              {data.map((d) => (
                <Cell key={d.name} fill={d.win_rate >= overall ? CHART.primary : CHART.muted} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
