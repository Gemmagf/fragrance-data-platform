"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART, axisTick, tooltipStyle } from "./chartStyle";

type Point = { month: string; revenue_chf: number; gross_margin_chf: number };

export function MonthlyRevenueChart({ data }: { data: Point[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
          <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} minTickGap={18} />
          <YAxis
            tick={axisTick}
            axisLine={false}
            tickLine={false}
            width={56}
            tickFormatter={(v: number) => `${(v / 1e6).toFixed(0)}M`}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v) => `CHF ${(Number(v) / 1e6).toFixed(2)}M`}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
          <Bar dataKey="revenue_chf" name="Revenue" fill={CHART.primary} radius={[3, 3, 0, 0]} />
          <Bar dataKey="gross_margin_chf" name="Gross margin" fill={CHART.accent} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
