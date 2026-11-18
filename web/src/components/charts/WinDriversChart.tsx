"use client";

import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  ErrorBar,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART, axisTick, tooltipStyle } from "./chartStyle";

type Driver = { term: string; label: string; logit_coef: number; ci_low: number; ci_high: number; p_value: number };

/** Horizontal bars of the logit coefficient with 95% CI as asymmetric error bars. */
export function WinDriversChart({ drivers }: { drivers: Driver[] }) {
  const data = drivers.map((d) => ({
    ...d,
    err: [d.logit_coef - d.ci_low, d.ci_high - d.logit_coef],
  }));
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} horizontal={false} />
          <XAxis type="number" tick={axisTick} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="label" tick={axisTick} axisLine={false} tickLine={false} width={210} />
          <ReferenceLine x={0} stroke="#0a0a0a" strokeDasharray="4 4" />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(_v, _n, p) => {
              const d = p.payload as Driver;
              return [
                `${d.logit_coef.toFixed(3)} (95% CI ${d.ci_low.toFixed(2)} to ${d.ci_high.toFixed(2)}, p=${d.p_value.toFixed(3)})`,
                "Logit effect",
              ];
            }}
          />
          <Bar dataKey="logit_coef" radius={[0, 3, 3, 0]}>
            {data.map((d) => (
              <Cell key={d.term} fill={d.p_value < 0.05 ? CHART.primary : CHART.muted} />
            ))}
            <ErrorBar dataKey="err" direction="x" stroke="#5b5b58" strokeWidth={1.5} />
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
