import Link from "next/link";
import { FIRST_90_DAYS, VALUE_GAP, VALUE_ROWS } from "@/lib/content";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { PrevNext } from "@/components/PrevNext";

export default function ValuePage() {
  return (
    <>
      <PageHeader
        title="What I would bring as Data Engineer"
        subtitle="Each responsibility of the role, what I have done that matches it, and where to see the evidence in this case."
        owner="Prepared by Gemma Garcia de la Fuente"
        sla="Updated with this case"
        action="Start a conversation about the first 90 days"
      />

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Responsibilities of the role, matched to my experience</h2>
        <div className="grid gap-4">
          {VALUE_ROWS.map((row, i) => (
            <article key={row.need} className="grid gap-4 rounded-lg border border-border bg-background p-5 md:grid-cols-[1fr_1.4fr_1fr]">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Responsibility {i + 1}</span>
                <h3 className="mt-1 font-semibold">{row.need}</h3>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">What I bring</span>
                <p className="mt-1 text-sm leading-relaxed">{row.bring}</p>
              </div>
              <div className="rounded-md bg-muted p-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Evidence in this case</span>
                <p className="mt-1 text-sm leading-relaxed">{row.proof}</p>
                {row.proofHref && (
                  <Link href={row.proofHref} className="mt-2 inline-block text-sm font-medium underline underline-offset-2">
                    See it
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="rounded-lg border border-accent/40 bg-accent/10 p-5">
          <h2 className="text-base font-semibold">Where I am less experienced, and how I would close the gap</h2>
          <p className="mt-2 text-sm leading-relaxed">{VALUE_GAP.gap}</p>
          <p className="mt-2 text-sm leading-relaxed">{VALUE_GAP.close}</p>
        </div>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">The first 90 days</h2>
        <p className="text-sm text-muted-foreground">
          The first month is about getting a real pipeline running, not about slides. Each phase ends with something the
          team can check.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {FIRST_90_DAYS.map((p) => (
            <Card key={p.phase} title={p.phase}>
              <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
                {p.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <Card title="Why this combination fits the role">
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
            <li>
              <strong>I build pipelines that can be tested and redeployed.</strong> I refactored production Python pipelines
              for scalability, testing and deployment, and this case follows the same discipline.
            </li>
            <li>
              <strong>Quality is built in, not checked afterwards.</strong> Contracts, a quality gate and a run log stop a bad
              load before it reaches a report.
            </li>
            <li>
              <strong>I connect the platform to the people who use it.</strong> I have led a data-quality product and a
              validation engine, and run agile delivery with business teams.
            </li>
            <li>
              <strong>I can serve Power BI from a clean model.</strong> I led a Tableau-to-Power-BI migration, and the
              metrics catalogue is designed to become the semantic layer.
            </li>
            <li>
              <strong>I work across languages.</strong> Native Catalan and Spanish, fluent English and French, and German at an
              intermediate level, which matters for a Swiss team.
            </li>
          </ul>
        </Card>
      </section>

      <PrevNext href="/value" />
    </>
  );
}
