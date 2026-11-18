"use client";

import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART, axisTick, tooltipStyle } from "./chartStyle";

type Point = { quarter: string; median_lead_time_days: number; requests: number };

export function SlaChart({ data, baseline }: { data: Point[]; baseline: number }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
          <XAxis dataKey="quarter" tick={axisTick} axisLine={false} tickLine={false} />
          <YAxis tick={axisTick} axisLine={false} tickLine={false} width={40} unit="d" />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${Number(v)} days`} />
          <ReferenceLine
            y={baseline * 0.3}
            stroke={CHART.positive}
            strokeDasharray="4 4"
            label={{ value: "-70% target", position: "insideTopRight", fontSize: 11, fill: CHART.positive }}
          />
          <Bar dataKey="median_lead_time_days" name="Median days" fill={CHART.primary} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
