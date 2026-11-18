import { PLATFORM_LAYERS, PLATFORM_TASKS, type PlatformTask } from "@/lib/content";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { PrevNext } from "@/components/PrevNext";
import { cn } from "@/lib/utils";

const STATUS: Record<PlatformTask["status"], { label: string; cls: string; help: string }> = {
  built: { label: "Built", cls: "bg-emerald-100 text-emerald-800", help: "Done in this repository" },
  partial: { label: "Partly built", cls: "bg-amber-100 text-amber-800", help: "Same logic, not yet on the target platform" },
  simulated: { label: "Simulated", cls: "bg-slate-200 text-slate-800", help: "Data stands in for the real source" },
};

export default function PlatformPage() {
  const built = PLATFORM_TASKS.filter((t) => t.status === "built").length;

  return (
    <>
      <PageHeader
        title="Data platform and engineering"
        subtitle="How the data moves from source systems to decisions, and how each data-engineering responsibility of the role is covered in this case."
        owner="Data engineering with the Business Analysts"
        sla="Daily load, with checks at every layer"
        action="Keep every layer traceable, from the decision back to the raw source"
      />

      <section className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">The flow, in one picture</h2>
        <p className="text-sm text-muted-foreground">
          Data goes through five stages. Each stage has one job, and nothing skips a stage. That makes errors easy to find
          and every number easy to trace.
        </p>
        <ol className="grid gap-3 md:grid-cols-5">
          {PLATFORM_LAYERS.map((l, i) => (
            <li key={l.name} className={cn("relative rounded-lg border border-border p-4", l.tone)}>
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Stage {i + 1}</span>
              <span className="mt-1 block text-base font-semibold">{l.name}</span>
              <span className="mt-2 block text-sm leading-relaxed">{l.detail}</span>
            </li>
          ))}
        </ol>
        <p className="text-xs text-muted-foreground">
          Every stage runs the same way on the case and on a Fabric Lakehouse: sources land in bronze, transformations move
          data to silver and gold, and the semantic layer serves the reports.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">The responsibilities of the role, and where the case stands</h2>
        <p className="text-sm text-muted-foreground">
          {built} of {PLATFORM_TASKS.length} responsibilities are fully built here. The others show the same logic and say
          clearly what is still missing.
        </p>
        <div className="grid gap-4">
          {PLATFORM_TASKS.map((t, i) => (
            <article key={t.task} className="grid gap-4 rounded-lg border border-border bg-background p-5 md:grid-cols-[1fr_1.3fr]">
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Responsibility {i + 1}</span>
                <h3 className="font-semibold leading-snug">{t.task}</h3>
                <span
                  className={cn("inline-block rounded-full px-2.5 py-0.5 text-xs font-medium", STATUS[t.status].cls)}
                  title={STATUS[t.status].help}
                >
                  {STATUS[t.status].label}
                </span>
              </div>
              <div className="space-y-3 text-sm leading-relaxed">
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">In this case</span>
                  <p className="mt-1">{t.caseEvidence}</p>
                </div>
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">On Microsoft Fabric</span>
                  <p className="mt-1">{t.fabricEquivalent}</p>
                </div>
                <div className="rounded-md bg-muted p-3">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">What is still missing</span>
                  <p className="mt-1">{t.gap}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <Card title="What I would build first in Fabric">
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed">
            <li>One workspace per domain (finance, commercial, operations), with a Lakehouse for bronze, silver and gold.</li>
            <li>One pipeline per source system, starting with the ERP, so that bronze tables are loaded and logged every day.</li>
            <li>The data-quality checks from this case, run as part of each pipeline, with failures sent to the data owner.</li>
            <li>A single semantic model over the gold tables, with the KPI definitions from the dictionary, reused by every report.</li>
            <li>Only then the Power BI reports, so the business sees one version of each number.</li>
          </ol>
        </Card>
      </section>

      <PrevNext href="/platform" />
    </>
  );
}
