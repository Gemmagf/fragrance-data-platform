"use client";

import { useState } from "react";
import { KPICard } from "../KPICard";
import { DataTable } from "../DataTable";
import { chfMillions, mean, num } from "@/lib/format";

type Formula = { formula_id: string; pct: number; ltm_revenue: number };
type Limited = {
  rm_code: string;
  rm_name: string;
  rm_type: string;
  limit: number;
  substitution_candidates: number;
  formulas: Formula[];
};

/**
 * "What breaks if this restricted raw material is capped at X% of formula weight?"
 * Ranks and quantifies only. A perfumer signs off every reformulation.
 */
export function IfraWhatIf({ items }: { items: Limited[] }) {
  const [index, setIndex] = useState(0);
  const item = items[index];
  const [cap, setCap] = useState(item.limit / 2);

  const select = (i: number) => {
    setIndex(i);
    setCap(items[i].limit / 2);
  };

  const breach = item.formulas.filter((f) => f.pct > cap);
  const revenueAtRisk = breach.reduce((s, f) => s + f.ltm_revenue, 0);
  const avgExcess = mean(breach.map((f) => f.pct - cap));
  const top = [...breach].sort((a, b) => b.ltm_revenue - a.ltm_revenue).slice(0, 15);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 rounded-lg border border-border bg-background p-4 lg:grid-cols-[1fr_1fr]">
        <div className="flex flex-col gap-2">
          <label htmlFor="ifra-rm" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Restricted raw material
          </label>
          <select
            id="ifra-rm"
            value={index}
            onChange={(e) => select(Number(e.target.value))}
            className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
          >
            {items.map((it, i) => (
              <option key={it.rm_code} value={i}>
                {`${it.rm_code} · ${it.rm_name} (limit ${it.limit}%)`}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="ifra-cap" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            New cap, % of formula weight: <span className="font-mono tabular-nums">{cap.toFixed(3)}%</span>
          </label>
          <input
            id="ifra-cap"
            type="range"
            min={0}
            max={item.limit * 2}
            step={item.limit / 100}
            value={cap}
            onChange={(e) => setCap(Number(e.target.value))}
            className="accent-[#0a2540]"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard
          label="Formulas breaching the cap"
          value={`${breach.length} of ${item.formulas.length}`}
          help={`Formulas containing ${item.rm_code}`}
        />
        <KPICard label="LTM revenue at risk" value={chfMillions(revenueAtRisk, 2)} help="Sum over breaching formulas" />
        <KPICard
          label="Avg excess over cap"
          value={avgExcess == null ? "—" : `${num(avgExcess, 3)} pp`}
          help="Mean across breaching formulas"
        />
        <KPICard
          label="Substitution candidates"
          value={num(item.substitution_candidates)}
          help={`Other ${item.rm_type} raw materials`}
        />
      </div>

      <DataTable
        columns={[
          { key: "formula", label: "Formula" },
          { key: "pct", label: "Weight %", align: "right" },
          { key: "excess", label: "Excess over cap, pp", align: "right" },
          { key: "revenue", label: "LTM revenue", align: "right" },
        ]}
        rows={top.map((f) => ({
          formula: f.formula_id,
          pct: num(f.pct, 2),
          excess: num(f.pct - cap, 3),
          revenue: chfMillions(f.ltm_revenue, 2),
        }))}
        empty="No formula breaches this cap."
      />
    </div>
  );
}
