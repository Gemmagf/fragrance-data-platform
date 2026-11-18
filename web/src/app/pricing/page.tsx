import { site } from "@/lib/data";
import { getSection } from "@/lib/content";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { Explain } from "@/components/Explain";
import { PrevNext } from "@/components/PrevNext";
import { Citations } from "@/components/Citations";
import { ElasticityChart } from "@/components/charts/ElasticityChart";
import { RepricingPanel } from "@/components/charts/RepricingPanel";

export default function PricingPage() {
  const s = getSection("pricing");
  return (
    <>
      <PageHeader title={s.title} subtitle={s.question} owner={s.owner} sla={s.sla} action={s.action} />
      <Explain section={s} />

      <div className="mt-8 space-y-6">
        <Card title="How much do customers react to price?" subtitle="Lower bars = customers react more strongly. Error bars show the range we are 95% confident in.">
          <ElasticityChart rows={site.elasticity} />
        </Card>

        <Card title="What would a price rise be worth?" subtitle="Move the slider. Figures cover the last 12 months and assume no customer is lost.">
          <RepricingPanel tiers={site.repricing.tiers} ltmRevenue={site.repricing.ltm_revenue} ltmGm={site.repricing.ltm_gm} />
        </Card>

        <div className="rounded-lg border border-accent/40 bg-accent/10 p-4 text-sm">
          <strong>Our recommendation in one line:</strong> start with a small, targeted increase in the customer group that
          reacts least to price, measure what happens to volume, and only then decide on a wider move.
        </div>
      </div>

      <Citations ids={s.sources} />

      <PrevNext href="/pricing" />
    </>
  );
}
