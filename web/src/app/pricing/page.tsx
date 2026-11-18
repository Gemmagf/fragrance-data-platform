import { site } from "@/lib/data";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { ElasticityChart } from "@/components/charts/ElasticityChart";
import { RepricingPanel } from "@/components/charts/RepricingPanel";

export default function PricingPage() {
  return (
    <>
      <PageHeader
        title="Margin & pricing"
        subtitle="How volume responds to list-price moves, by customer tier, and what a move is worth."
        owner="CFO (Finance)"
        sla="Weekly, Monday 07:00"
        action="Approve a targeted price move by tier, not a blanket increase"
      />

      <Card title="Price elasticity of volume, by tier" subtitle="Log-log panel with compound and month fixed effects. Error bars: 95% CI.">
        <ElasticityChart rows={site.elasticity} />
      </Card>

      <div className="mt-6">
        <Card title="Repricing scenario, last 12 months" subtitle="Volume scales with (1+p)^elasticity; standard cost per kg unchanged.">
          <RepricingPanel
            tiers={site.repricing.tiers}
            ltmRevenue={site.repricing.ltm_revenue}
            ltmGm={site.repricing.ltm_gm}
          />
        </Card>
      </div>

      <div className="mt-6 rounded-lg border border-accent/40 bg-accent/10 p-4 text-sm">
        No churn or competitor response is modelled. The BRD target (+50 bps) is for selective repricing; a blanket move
        ignores flight risk in tier C.
      </div>
    </>
  );
}
