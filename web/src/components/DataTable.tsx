import { cn } from "@/lib/utils";

export type Column = {
  key: string;
  label: string;
  align?: "left" | "right";
};

type Props = {
  columns: Column[];
  rows: Record<string, React.ReactNode>[];
  empty?: string;
};

/** Server-rendered table. Rows are pre-formatted by the page, so no functions cross the server/client boundary. */
export function DataTable({ columns, rows, empty = "No rows." }: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-background">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className={cn("px-3 py-2.5 font-medium", c.align === "right" ? "text-right" : "text-left")}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-3 py-4 text-muted-foreground">
                {empty}
              </td>
            </tr>
          )}
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-border">
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={cn(
                    "px-3 py-2 align-top",
                    c.align === "right" ? "text-right tabular-nums" : "text-left",
                  )}
                >
                  {r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
