import { site } from "@/lib/data";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { DataTable } from "@/components/DataTable";
import { WinRateTrendChart } from "@/components/charts/FunnelChart";
import { WinByDimensionChart } from "@/components/charts/WinByDimensionChart";
import { WinDriversChart } from "@/components/charts/WinDriversChart";
import { num, pct } from "@/lib/format";

const DRIVER_LABELS: Record<string, string> = {
  family_match: "Perfumer specialises in brief family",
  days_over_2: "Response days beyond 2 (per day)",
  iter_over_4: "Sample rounds beyond 4 (per round)",
  price_pct_over_target: "Quote above target (per 100%)",
  tier_A: "Tier A customer (vs B)",
  tier_C: "Tier C customer (vs B)",
};

export default function WinPage() {
  const drivers = site.winDrivers.map((d) => ({ ...d, label: DRIVER_LABELS[d.term] ?? d.term }));
  const cycle = site.cycleTime;

  return (
    <>
      <PageHeader
        title="Brief-to-win"
        subtitle="Why we win and lose briefs, and where the time goes between a brief and a shipment."
        owner="Head of Commercial (CCO)"
        sla="Weekly, Monday 07:00"
        action="Coach the team on the levers that move win rate"
      />

      <Card title="Win rate of decided briefs, by quarter received" subtitle="Decided = won or lost. Open and no-decision briefs excluded.">
        <WinRateTrendChart data={site.funnel} />
      </Card>

      <div className="mt-6">
        <Card title="Win rate by cut" subtitle="Bars are shaded navy above the overall win rate, grey below.">
          <WinByDimensionChart rows={site.winDimensions} />
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card
          title="What drives a win?"
          subtitle="Logit effects on decided briefs, 95% CI. Navy = p < 0.05; grey = not yet proven by this sample."
        >
          <WinDriversChart drivers={drivers} />
        </Card>
        <div className="space-y-3">
          <h2 className="text-sm font-semibold tracking-tight">Where does the cycle time go?</h2>
          <DataTable
            columns={[
              { key: "stage", label: "Stage" },
              { key: "n", label: "n", align: "right" },
              { key: "median", label: "Median days", align: "right" },
              { key: "p75", label: "P75 days", align: "right" },
              { key: "share", label: "Share", align: "right" },
            ]}
            rows={cycle.map((c) => ({
              stage: c.stage,
              n: num(c.n),
              median: num(c.median_days),
              p75: num(c.p75_days),
              share: pct(c.share_of_median_days, 0),
            }))}
          />
          <p className="text-xs text-muted-foreground">
            The simulator sets these durations. Read the method, not the number.
          </p>
        </div>
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        Caveat: response time and sample rounds have the right sign but are not significant (p &gt; 0.05) in this
        sample. Treat them as hypotheses to test, not as proven levers.
      </p>
    </>
  );
}
