import { site } from "@/lib/data";
import { getSection } from "@/lib/content";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { Explain } from "@/components/Explain";
import { PrevNext } from "@/components/PrevNext";
import { num } from "@/lib/format";

const SEVERITY_LABEL: Record<string, string> = { high: "High", medium: "Medium", low: "Low" };
const SEVERITY_CLASS: Record<string, string> = {
  high: "font-semibold text-rose-600",
  medium: "text-amber-700",
  low: "text-muted-foreground",
};

export default function DataQualityPage() {
  const s = getSection("data-quality");
  const rows = site.dq;
  const blocking = rows.filter((r) => r.severity === "high" && r.failures_after_cleaning > 0).length;

  return (
    <>
      <PageHeader title={s.title} subtitle={s.question} owner={s.owner} sla={s.sla} action={s.action} />
      <Explain section={s} />

      <div className="mt-8 space-y-4">
        <p className="rounded-lg border border-border bg-background p-4 text-sm">
          Important checks still failing after cleaning:{" "}
          <strong className={blocking === 0 ? "text-emerald-600" : "text-rose-600"}>{blocking}</strong>
          {blocking === 0 ? " (the goal is zero)" : ""}
        </p>

        <DataTable
          columns={[
            { key: "table", label: "Data source" },
            { key: "check", label: "What is checked" },
            { key: "severity", label: "Importance" },
            { key: "raw", label: "Found in source", align: "right" },
            { key: "after", label: "Still wrong after cleaning", align: "right" },
            { key: "action", label: "What we do" },
          ]}
          rows={rows.map((r) => ({
            table: r.table,
            check: r.check,
            severity: <span className={SEVERITY_CLASS[r.severity]}>{SEVERITY_LABEL[r.severity] ?? r.severity}</span>,
            raw: num(r.failures_raw),
            after:
              r.failures_after_cleaning === 0 ? (
                <span className="font-semibold text-emerald-600">0</span>
              ) : (
                num(r.failures_after_cleaning)
              ),
            action: r.action,
          }))}
        />
      </div>

      <PrevNext href="/data-quality" />
    </>
  );
}
