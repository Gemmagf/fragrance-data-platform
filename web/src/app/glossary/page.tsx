import { GLOSSARY } from "@/lib/content";
import { PageHeader } from "@/components/PageHeader";
import { PrevNext } from "@/components/PrevNext";

export default function GlossaryPage() {
  const terms = [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term));
  return (
    <>
      <PageHeader
        title="Glossary"
        subtitle="The words used across this case, in plain language."
        owner="Everyone reading this case"
        sla="Updated with the case"
        action="Look up any term you do not know before reading a chart"
      />
      <dl className="mt-8 grid gap-3 md:grid-cols-2">
        {terms.map((g) => (
          <div key={g.term} className="rounded-lg border border-border bg-background p-4">
            <dt className="font-semibold">{g.term}</dt>
            <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{g.meaning}</dd>
          </div>
        ))}
      </dl>
      <PrevNext href="/glossary" />
    </>
  );
}
