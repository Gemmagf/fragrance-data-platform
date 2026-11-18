import { site } from "@/lib/data";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { DataTable } from "@/components/DataTable";
import { IfraWhatIf } from "@/components/charts/IfraWhatIf";
import { chfMillions, num, pct } from "@/lib/format";

export default function RiskPage() {
  const single = site.rmRisk
    .filter((r) => r.single_source)
    .sort((a, b) => b.ltm_revenue_exposed_chf - a.ltm_revenue_exposed_chf);
  const stress = [...site.supplierStress]
    .sort((a, b) => b.revenue_at_risk_8w_chf - a.revenue_at_risk_8w_chf)
    .slice(0, 10);

  return (
    <>
      <PageHeader
        title="Raw-material risk & IFRA"
        subtitle="Single-source raw materials, supplier outage exposure and a regulatory what-if."
        owner="COO (Operations) with Head of Regulatory"
        sla="Monthly, 1st working day"
        action="Qualify a second source for every single-source raw material with more than CHF 1M exposure"
      />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold tracking-tight">Single-source raw materials, by LTM revenue exposed</h2>
        <DataTable
          columns={[
            { key: "rm", label: "RM" },
            { key: "name", label: "Name" },
            { key: "type", label: "Type" },
            { key: "origin", label: "Origin" },
            { key: "climate", label: "Climate exposed" },
            { key: "formulas", label: "Formulas", align: "right" },
            { key: "exposed", label: "LTM revenue exposed", align: "right" },
            { key: "vol", label: "Price volatility (monthly)", align: "right" },
          ]}
          rows={single.map((r) => ({
            rm: r.rm_code,
            name: r.rm_name,
            type: r.rm_type,
            origin: r.origin,
            climate: r.climate_exposed ? "yes" : "no",
            formulas: num(r.formulas_using),
            exposed: chfMillions(r.ltm_revenue_exposed_chf),
            vol: pct(r.price_volatility_monthly),
          }))}
        />
        <p className="text-xs text-muted-foreground">
          Revenue exposed is not additive: one order counts for every raw material in its formula.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-sm font-semibold tracking-tight">Supplier outage stress test, 8 weeks (top 10)</h2>
        <DataTable
          columns={[
            { key: "supplier", label: "Supplier" },
            { key: "country", label: "Country" },
            { key: "category", label: "Category" },
            { key: "otif", label: "OTIF", align: "right" },
            { key: "single", label: "Single-source RMs", align: "right" },
            { key: "risk", label: "Revenue at risk, 8 weeks", align: "right" },
          ]}
          rows={stress.map((s) => ({
            supplier: s.supplier_name,
            country: s.country,
            category: s.category,
            otif: `${num(s.otif_pct, 1)}%`,
            single: num(s.single_source_rms),
            risk: chfMillions(s.revenue_at_risk_8w_chf),
          }))}
        />
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-sm font-semibold tracking-tight">IFRA amendment what-if</h2>
        <Card
          subtitle={`Current position: ${site.ifraNow.formulas} formulas already exceed their raw-material limit (${site.ifraNow.breaches} breach lines). A perfumer signs off every reformulation; the engine ranks and never submits.`}
        >
          <IfraWhatIf items={site.ifra} />
        </Card>
      </section>
    </>
  );
}
