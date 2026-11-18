"use client";

import { CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { CHART, axisTick, tooltipStyle } from "./chartStyle";

type Point = { compound_id: string; segment: string; is_circular: boolean; co2e: number; price: number; revenue: number };

export function LedgerScatter({ conventional, circular }: { conventional: Point[]; circular: Point[] }) {
  return (
    <div className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 8, right: 16, left: 0, bottom: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} />
          <XAxis
            type="number"
            dataKey="co2e"
            name="CO2e"
            unit=" kg/kg"
            tick={axisTick}
            axisLine={false}
            tickLine={false}
            label={{ value: "CO2e, kg per kg of compound", position: "insideBottom", offset: -8, fontSize: 11, fill: CHART.tick }}
          />
          <YAxis
            type="number"
            dataKey="price"
            name="Price"
            unit=" CHF"
            tick={axisTick}
            axisLine={false}
            tickLine={false}
            width={56}
          />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            contentStyle={tooltipStyle}
            formatter={(v, n) => [n === "CO2e" ? `${Number(v).toFixed(2)} kg/kg` : `CHF ${Number(v).toFixed(1)}/kg`, n]}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
          <Scatter name="Conventional" data={conventional} fill={CHART.muted} fillOpacity={0.7} />
          <Scatter name="Circular" data={circular} fill={CHART.positive} fillOpacity={0.85} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
