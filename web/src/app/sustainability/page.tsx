import { site } from "@/lib/data";
import { getSection } from "@/lib/content";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { KPICard } from "@/components/KPICard";
import { Explain } from "@/components/Explain";
import { PrevNext } from "@/components/PrevNext";
import { LedgerScatter } from "@/components/charts/LedgerScatter";
import { SlaChart } from "@/components/charts/SlaChart";
import { mean, median, num, pct } from "@/lib/format";

export default function SustainabilityPage() {
  const s = getSection("sustainability");
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
  const baseline = median(sla.map((x) => x.median_lead_time_days)) ?? 0;

  return (
    <>
      <PageHeader title={s.title} subtitle={s.question} owner={s.owner} sla={s.sla} action={s.action} />
      <Explain section={s} />

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-muted-foreground">The numbers</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KPICard
          label="Extra price for circular products"
          value={pct(c.premium_pct)}
          help={`We are 95% confident it lies between ${pct(c.premium_ci_low)} and ${pct(c.premium_ci_high)}`}
          accent="positive"
        />
        <KPICard label="Typical footprint per kg" value={`${num(median(ledger.map((r) => Number(r.co2e_kg_per_kg_compound))), 1)} kg CO2e`} help="Median product, unweighted" />
        <KPICard label="Natural ingredients" value={`${num(mean(ledger.map((r) => Number(r.naturals_pct))), 1)}%`} help="Average share of formula weight" />
      </div>

      <div className="mt-6 space-y-6">
        <Card title="Footprint against price, product by product" subtitle="Each dot is one product. Green = circular. Lower dots have a smaller carbon footprint.">
          <LedgerScatter conventional={conventional} circular={circular} />
        </Card>
        <Card title="How fast do we answer customer requests?" subtitle={`Typical days to answer a sustainability request, by quarter. Target: 70% faster (dashed line).`}>
          <SlaChart data={sla} baseline={baseline} />
        </Card>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        How the premium is measured: we compare the price customers actually paid with the quoted price, for circular and
        conventional products, adjusting for each customer and each month. Without that adjustment the estimate would be
        too low.
      </p>

      <PrevNext href="/sustainability" />
    </>
  );
}
