import { site } from "@/lib/data";
import { getSection } from "@/lib/content";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { DataTable } from "@/components/DataTable";
import { Explain } from "@/components/Explain";
import { PrevNext } from "@/components/PrevNext";
import { WinRateTrendChart } from "@/components/charts/FunnelChart";
import { WinByDimensionChart } from "@/components/charts/WinByDimensionChart";
import { WinDriversChart } from "@/components/charts/WinDriversChart";
import { num, pct } from "@/lib/format";

const DRIVER_LABELS: Record<string, string> = {
  family_match: "Perfumer specialises in the brief's family",
  days_over_2: "Each day of response beyond 2 days",
  iter_over_4: "Each sample round beyond 4",
  price_pct_over_target: "Quote above target price",
  tier_A: "Tier A customer (vs tier B)",
  tier_C: "Tier C customer (vs tier B)",
};

export default function WinPage() {
  const s = getSection("win");
  const drivers = site.winDrivers.map((d) => ({ ...d, label: DRIVER_LABELS[d.term] ?? d.term }));

  return (
    <>
      <PageHeader title={s.title} subtitle={s.question} owner={s.owner} sla={s.sla} action={s.action} />
      <Explain section={s} />

      <div className="mt-8 space-y-6">
        <Card title="Is our win rate improving?" subtitle="Share of decided briefs we won, by the quarter the brief arrived">
          <WinRateTrendChart data={site.funnel} />
        </Card>

        <Card title="Where do we win most?" subtitle="Pick a cut. Navy bars are above the overall win rate; grey bars are below it.">
          <WinByDimensionChart rows={site.winDimensions} />
        </Card>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card title="What is linked to winning?" subtitle="Each bar is one factor. Right = helps win, left = hurts. Navy = clear; grey = not yet proven.">
            <WinDriversChart drivers={drivers} />
          </Card>
          <div className="space-y-3">
            <h2 className="text-sm font-semibold tracking-tight">Where does the time go, from brief to shipment?</h2>
            <DataTable
              columns={[
                { key: "stage", label: "Stage" },
                { key: "n", label: "Briefs", align: "right" },
                { key: "median", label: "Typical days", align: "right" },
                { key: "p75", label: "Slower cases (days)", align: "right" },
                { key: "share", label: "Share of total", align: "right" },
              ]}
              rows={site.cycleTime.map((c) => ({
                stage: c.stage,
                n: num(c.n),
                median: num(c.median_days),
                p75: num(c.p75_days),
                share: pct(c.share_of_median_days, 0),
              }))}
            />
            <p className="text-xs text-muted-foreground">
              The simulator sets these durations. The value is in the method: once real dates are loaded, the same table
              shows where LUZI actually loses time.
            </p>
          </div>
        </div>
      </div>

      <PrevNext href="/win" />
    </>
  );
}
