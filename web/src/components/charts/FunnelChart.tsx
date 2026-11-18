"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART, axisTick, tooltipStyle } from "./chartStyle";

type Point = { received_quarter: string; win_rate_of_decided: number; briefs_received: number };

export function WinRateTrendChart({ data }: { data: Point[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
          <XAxis dataKey="received_quarter" tick={axisTick} axisLine={false} tickLine={false} />
          <YAxis
            tick={axisTick}
            axisLine={false}
            tickLine={false}
            width={48}
            domain={[0, 0.5]}
            tickFormatter={(v: number) => `${Math.round(v * 100)}%`}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v) => `${(Number(v) * 100).toFixed(1)}%`}
          />
          <Line
            type="monotone"
            dataKey="win_rate_of_decided"
            name="Win rate (decided)"
            stroke={CHART.primary}
            strokeWidth={2}
            dot={{ r: 3, fill: CHART.primary }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
