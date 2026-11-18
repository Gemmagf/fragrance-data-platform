import { site } from "@/lib/data";
import { getSection } from "@/lib/content";
import { PageHeader } from "@/components/PageHeader";
import { KPICard } from "@/components/KPICard";
import { Card } from "@/components/Card";
import { Explain } from "@/components/Explain";
import { PrevNext } from "@/components/PrevNext";
import { Citations } from "@/components/Citations";
import { MonthlyRevenueChart } from "@/components/charts/MonthlyRevenueChart";
import { chfMillions, pct } from "@/lib/format";

export default function ExecutivePage() {
  const s = getSection("executive");
  const e = site.exec.findings;
  const monthly = [...site.exec.monthly].sort((a, b) => (a.month < b.month ? -1 : 1));
  const growth = e.revenue_growth_pct;

  return (
    <>
      <PageHeader title={s.title} subtitle={s.question} owner={s.owner} sla={s.sla} action={s.action} />
      <Explain section={s} />

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-muted-foreground">The numbers</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KPICard
          label="Revenue, last 12 months"
          value={chfMillions(e.ltm_revenue_chf)}
          help={`${growth >= 0 ? "+" : ""}${pct(growth, 0)} vs the 12 months before`}
          accent={growth >= 0 ? "positive" : "negative"}
        />
        <KPICard label="Gross margin" value={pct(e.ltm_gross_margin_pct)} help="Left after paying for ingredients" />
        <KPICard label="Brief-to-win rate" value={pct(e.ltm_win_rate)} help={`${e.ltm_briefs} briefs received`} />
        <KPICard label="Top-10 customer share" value={pct(e.top10_customer_share, 0)} help="Of last-12-month revenue" />
        <KPICard label="Circular revenue share" value={pct(e.circular_revenue_share)} help="Sales of circular products" />
      </div>

      <div className="mt-6">
        <Card
          title="Public context: the largest fragrance company"
          subtitle="Real figures, for context only. They are not comparable with the simulated business above."
        >
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
            <li>
              Givaudan&apos;s Fragrance &amp; Beauty division reached CHF 3.83bn of sales in 2025, up 7.9% like-for-like, with an
              EBITDA margin of 25.7% [S1].
            </li>
            <li>
              Within it, Fine Fragrance grew 18.3% like-for-like, while Fragrance Ingredients fell 1.4% [S2]. For a mid-size
              supplier, that gap in the market is the context for the win-rate and pricing questions in this case.
            </li>
          </ul>
        </Card>
      </div>

      <div className="mt-6">
        <Card title="Revenue and gross margin, month by month" subtitle="CHF, all customers, January 2023 to October 2026">
          <MonthlyRevenueChart data={monthly} />
        </Card>
      </div>

      <Citations ids={s.sources} />

      <PrevNext href="/executive" />
    </>
  );
}
