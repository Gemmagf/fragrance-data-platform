import Link from "next/link";
import { site } from "@/lib/data";
import { DASHBOARD_SECTIONS } from "@/lib/content";
import { Card } from "@/components/Card";
import { KPICard } from "@/components/KPICard";
import { chfMillions, num, pct } from "@/lib/format";
import { upliftAt } from "@/lib/repricing";

const STEPS = [
  { n: "1", title: "Collect", text: "Raw exports from the CRM (customer requests), the ERP (orders and stock), the formulation system (recipes) and price feeds." },
  { n: "2", title: "Clean and check", text: "Remove duplicates, align codes between systems, and log every problem found. Nothing is fixed silently." },
  { n: "3", title: "Analyse", text: "Answer business questions: why we win, what price changes do, where supply is fragile, what regulation would change." },
  { n: "4", title: "Show and act", text: "A dashboard with a named owner, a refresh schedule and the decision it should support." },
];

export default function StartPage() {
  const e = site.exec.findings;
  const r = site.repricing;
  const singleSource = site.rmRisk.filter((x) => x.single_source).length;
  const totalRm = site.rmRisk.length;

  return (
    <>
      <section className="pb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">Business Analyst case</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">How data can help a fragrance manufacturer decide faster</h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
          This is a working example of how I would approach the Business Analyst role at LUZI. It turns the questions in
          LUZI&apos;s Data &amp; Analytics brief into tested analyses and dashboards, each one explained in plain language.
        </p>
        <div className="mt-5 max-w-3xl rounded-lg border border-accent/40 bg-accent/10 p-4 text-sm">
          <strong>About the data.</strong> Everything here is simulated. Customers, suppliers, formulas and sales are
          invented to behave like a real fragrance business. Nothing on these pages is LUZI&apos;s real data. The only real
          figures are public benchmarks from other companies, and each is cited.{" "}
          <Link href="/sources" className="font-medium underline underline-offset-2">
            See where every number comes from
          </Link>
          .
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Key numbers (simulated)</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KPICard label="Revenue, last 12 months" value={chfMillions(e.ltm_revenue_chf)} help="Sales across all customers" />
          <KPICard label="Brief-to-win rate" value={pct(e.ltm_win_rate)} help="Share of decided briefs we win" />
          <KPICard
            label="Single-source ingredients"
            value={`${singleSource} of ${totalRm}`}
            help="Ingredients with only one supplier"
            accent="negative"
          />
          <KPICard
            label="Extra margin from a +4% price rise"
            value={`+${num((1e4 * upliftAt(r.tiers, 0.04).total) / r.ltm_revenue)} bps`}
            help="Before any customers are lost"
          />
        </div>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Start here in two minutes</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/executive" className="rounded-lg border border-border bg-background p-5 hover:bg-muted">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">1. The big picture</span>
            <span className="mt-2 block text-lg font-semibold">Is the business healthy?</span>
            <span className="mt-2 block text-sm text-muted-foreground">Sales, margin and customer concentration in one page.</span>
          </Link>
          <Link href="/pricing" className="rounded-lg border border-border bg-background p-5 hover:bg-muted">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">2. A real decision</span>
            <span className="mt-2 block text-lg font-semibold">What would a price rise do?</span>
            <span className="mt-2 block text-sm text-muted-foreground">Try a price change and see the effect on margin, by customer group.</span>
          </Link>
          <Link href="/value" className="rounded-lg border border-accent/50 bg-accent/10 p-5 hover:bg-accent/20">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">3. Why me</span>
            <span className="mt-2 block text-lg font-semibold">What I would bring to LUZI</span>
            <span className="mt-2 block text-sm text-muted-foreground">How my experience maps to the role, and what I would do in the first 90 days.</span>
          </Link>
        </div>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Every section, and the question it answers</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {DASHBOARD_SECTIONS.map((s) => (
            <Link key={s.slug} href={s.href} className="flex flex-col rounded-lg border border-border bg-background p-5 hover:bg-muted">
              <span className="text-base font-semibold">{s.title}</span>
              <span className="mt-2 text-sm text-muted-foreground">{s.question}</span>
              <span className="mt-auto pt-4 text-xs text-muted-foreground">Owner: {s.owner}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <Card title="How the work is organised" subtitle="The same four steps every business analyst repeats, on any data project.">
          <ol className="grid gap-4 md:grid-cols-4">
            {STEPS.map((s) => (
              <li key={s.n} className="rounded-lg bg-muted p-4">
                <span className="font-mono text-xs text-muted-foreground">Step {s.n}</span>
                <span className="mt-1 block font-semibold">{s.title}</span>
                <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">{s.text}</span>
              </li>
            ))}
          </ol>
        </Card>
      </section>

      <section className="mt-10 rounded-lg border border-border bg-background p-5 text-sm">
        <strong>New to the vocabulary?</strong> Terms such as elasticity, gross margin or single-source are explained in the{" "}
        <Link href="/glossary" className="font-medium underline underline-offset-2">glossary</Link>.
      </section>
    </>
  );
}
