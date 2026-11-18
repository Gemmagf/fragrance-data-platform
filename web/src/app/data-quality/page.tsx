import { site } from "@/lib/data";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { num } from "@/lib/format";

const SEVERITY_CLASS: Record<string, string> = {
  high: "font-semibold text-rose-600",
  medium: "text-amber-700",
  low: "text-muted-foreground",
};

export default function DataQualityPage() {
  const rows = site.dq;
  const blocking = rows.filter((r) => r.severity === "high" && r.failures_after_cleaning > 0).length;

  return (
    <>
      <PageHeader
        title="Data quality"
        subtitle="Every check, with the failures the source sent and the failures still left after cleaning."
        owner="Domain data stewards; monitored by Head of BI"
        sla="Every load"
        action="Clear high-severity items before any number goes to the Steering Committee"
      />

      <p className="mb-4 text-sm">
        High-severity checks still failing after cleaning:{" "}
        <strong className={blocking === 0 ? "text-emerald-600" : "text-rose-600"}>{blocking}</strong>
      </p>

      <DataTable
        columns={[
          { key: "table", label: "Table" },
          { key: "check", label: "Check" },
          { key: "severity", label: "Severity" },
          { key: "raw", label: "Raw failures", align: "right" },
          { key: "after", label: "After cleaning", align: "right" },
          { key: "action", label: "Action" },
        ]}
        rows={rows.map((r) => ({
          table: r.table,
          check: r.check,
          severity: <span className={SEVERITY_CLASS[r.severity]}>{r.severity}</span>,
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

      <p className="mt-4 text-sm text-muted-foreground">
        Raw failures are what the source sent. Failures after cleaning are what is still wrong after the silver rules.
        Anything left is a steward action, not a silent fix.
      </p>
    </>
  );
}
