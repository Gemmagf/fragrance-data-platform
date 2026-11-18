import { site } from "@/lib/data";
import { PageHeader } from "@/components/PageHeader";
import { KPICard } from "@/components/KPICard";
import { Card } from "@/components/Card";
import { MonthlyRevenueChart } from "@/components/charts/MonthlyRevenueChart";
import { chfMillions, pct } from "@/lib/format";

export default function ExecutivePage() {
  const e = site.exec.findings;
  const monthly = [...site.exec.monthly].sort((a, b) => (a.month < b.month ? -1 : 1));
  const growth = e.revenue_growth_pct;

  return (
    <>
      <PageHeader
        title="Executive one-page"
        subtitle="Revenue, margin and concentration for the last 12 complete months, against the prior 12."
        owner="CFO (Finance)"
        sla="Daily, 06:00"
        action="Decide where the next quarter's commercial push should go"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KPICard
          label="Revenue, last 12 months"
          value={chfMillions(e.ltm_revenue_chf)}
          help={`${growth >= 0 ? "+" : ""}${pct(growth, 0)} vs prior 12 months`}
          accent={growth >= 0 ? "positive" : "negative"}
        />
        <KPICard label="Gross margin" value={pct(e.ltm_gross_margin_pct)} help="Standard cost per kg, order month" />
        <KPICard label="Brief-to-win rate" value={pct(e.ltm_win_rate)} help={`${e.ltm_briefs} briefs received`} />
        <KPICard label="Top-10 customer share" value={pct(e.top10_customer_share, 0)} help="Of LTM revenue" />
        <KPICard label="Circular revenue share" value={pct(e.circular_revenue_share)} help="Circular Toolbox compounds" />
      </div>

      <Card title="Monthly revenue and gross margin" subtitle="CHF, all compounds, 2023 to Oct 2026" className="mt-6">
        <MonthlyRevenueChart data={monthly} />
      </Card>

      <p className="mt-4 text-sm text-muted-foreground">
        Read: the simulated book is still growing from a 2023 start. Compare the last 12 months with the prior 12, not
        with a plan, because this case has no plan data.
      </p>
    </>
  );
}
