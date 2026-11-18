import { site } from "@/lib/data";
import { getSection } from "@/lib/content";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { DataTable } from "@/components/DataTable";
import { Explain } from "@/components/Explain";
import { PrevNext } from "@/components/PrevNext";
import { Citations } from "@/components/Citations";
import { IfraWhatIf } from "@/components/charts/IfraWhatIf";
import { chfMillions, num, pct } from "@/lib/format";

export default function RiskPage() {
  const s = getSection("risk");
  const single = site.rmRisk
    .filter((r) => r.single_source)
    .sort((a, b) => b.ltm_revenue_exposed_chf - a.ltm_revenue_exposed_chf);
  const stress = [...site.supplierStress]
    .sort((a, b) => b.revenue_at_risk_8w_chf - a.revenue_at_risk_8w_chf)
    .slice(0, 10);

  return (
    <>
      <PageHeader title={s.title} subtitle={s.question} owner={s.owner} sla={s.sla} action={s.action} />
      <Explain section={s} />

      <div className="mt-8 space-y-10">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">Ingredients with a single supplier</h2>
          <p className="text-sm text-muted-foreground">
            Ranked by the revenue that depends on each ingredient. Price volatility shows how much its cost moves each month.
          </p>
          <DataTable
            columns={[
              { key: "rm", label: "Ingredient" },
              { key: "name", label: "Name" },
              { key: "type", label: "Type" },
              { key: "origin", label: "Origin" },
              { key: "climate", label: "Exposed to climate?" },
              { key: "formulas", label: "Formulas using it", align: "right" },
              { key: "exposed", label: "Revenue depending on it", align: "right" },
              { key: "vol", label: "Monthly price swing", align: "right" },
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
            The same revenue can depend on several ingredients, so these figures cannot be added up.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">If a supplier stopped for 8 weeks</h2>
          <p className="text-sm text-muted-foreground">Top 10 suppliers by the revenue that would be at risk. Only ingredients with no second supplier are counted.</p>
          <DataTable
            columns={[
              { key: "supplier", label: "Supplier" },
              { key: "country", label: "Country" },
              { key: "category", label: "Ingredient type" },
              { key: "otif", label: "On-time delivery", align: "right" },
              { key: "single", label: "Single-source ingredients", align: "right" },
              { key: "risk", label: "Revenue at risk", align: "right" },
            ]}
            rows={stress.map((x) => ({
              supplier: x.supplier_name,
              country: x.country,
              category: x.category,
              otif: `${num(x.otif_pct, 1)}%`,
              single: num(x.single_source_rms),
              risk: chfMillions(x.revenue_at_risk_8w_chf),
            }))}
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">What if a safety rule tightened?</h2>
          <Card subtitle={`Today, ${site.ifraNow.formulas} formulas already exceed their ingredient limit (${site.ifraNow.breaches} breach lines). Choose an ingredient and a new limit to see the impact. A perfumer approves every change.`}>
            <IfraWhatIf items={site.ifra} />
          </Card>
        </section>
      </div>

      <Citations ids={s.sources} />

      <PrevNext href="/risk" />
    </>
  );
}
