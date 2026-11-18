import { site } from "@/lib/data";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { KPICard } from "@/components/KPICard";
import { LedgerScatter } from "@/components/charts/LedgerScatter";
import { SlaChart } from "@/components/charts/SlaChart";
import { mean, median, num, pct } from "@/lib/format";

export default function SustainabilityPage() {
  const c = site.circular;
  const ledger = site.ledger;
  const points = ledger.map((r) => ({
    compound_id: r.compound_id,
    segment: r.segment,
    is_circular: r.is_circular,
    co2e: Number(r.co2e_kg_per_kg_compound),
    price: Number(r.ltm_avg_price_chf_kg),
    revenue: Number(r.ltm_revenue_chf),
  }));
  const conventional = points.filter((p) => !p.is_circular);
  const circular = points.filter((p) => p.is_circular);
  const sla = site.sustSla;
  const baseline = median(sla.map((s) => s.median_lead_time_days)) ?? 0;

  return (
    <>
      <PageHeader
        title="Sustainability ledger"
        subtitle="CO2e and naturals share per compound, and the premium customers pay for circular compounds."
        owner="Head of Sustainability"
        sla="Monthly"
        action="Answer a customer's CO2e or naturals request from source in under two clicks"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KPICard
          label="Circular price premium"
          value={pct(c.premium_pct)}
          help={`95% CI ${pct(c.premium_ci_low)} to ${pct(c.premium_ci_high)}`}
          accent="positive"
        />
        <KPICard
          label="Median CO2e per kg"
          value={`${num(median(ledger.map((r) => Number(r.co2e_kg_per_kg_compound))), 1)} kg`}
          help="Per compound, unweighted"
        />
        <KPICard
          label="Average naturals share"
          value={`${num(mean(ledger.map((r) => Number(r.naturals_pct))), 1)}%`}
          help="Of formula weight, per compound"
        />
      </div>

      <Card className="mt-6" title="CO2e per kg vs realised price, per compound (LTM)" subtitle="Each dot is one compound. Green = circular.">
        <LedgerScatter conventional={conventional} circular={circular} />
      </Card>

      <Card className="mt-6" title="Disclosure request turnaround" subtitle={`Median days to answer a customer request, by quarter. Dashed line: 30% of the current median (the BRD -70% target).`}>
        <SlaChart data={sla} baseline={baseline} />
      </Card>

      <p className="mt-4 text-sm text-muted-foreground">
        Premium method: log(realised price / quote) on a circular flag, with customer and month fixed effects. Without the
        customer effect the estimate is biased down (about 5.4% against the planted 6%).
      </p>
    </>
  );
}
