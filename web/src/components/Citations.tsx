import Link from "next/link";
import { getSource } from "@/lib/sources";

/**
 * Footer on every dashboard page: which sources feed it, with links and status.
 * Every page also states that the dashboard data is simulated.
 */
export function Citations({ ids }: { ids: string[] }) {
  return (
    <aside aria-label="Sources" className="mt-8 rounded-lg border border-border bg-background p-5 text-sm">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Data behind this page</h3>
      <p className="mt-2 leading-relaxed">
        The customers, ingredients, formulas, prices and sales shown here are <strong>simulated</strong>. See{" "}
        <Link href="/sources" className="font-medium underline underline-offset-2">Sources &amp; method</Link> for how they were built.
      </p>
      {ids.length > 0 && (
        <ul className="mt-3 space-y-2">
          {ids.map((id) => {
            const s = getSource(id);
            return (
              <li key={id} className="leading-relaxed">
                <span className="font-mono text-xs text-muted-foreground">[{s.id}]</span>{" "}
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-medium underline underline-offset-2">
                  {s.title}
                </a>{" "}
                <span className="text-muted-foreground">
                  · {s.publisher} · {s.status === "verified" ? "verified" : s.status} · accessed {s.accessed}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
