import Link from "next/link";
import { ALL_PAGES } from "@/lib/content";

/** Previous and next page links, so a reader can move through the case in order. */
export function PrevNext({ href }: { href: string }) {
  const i = ALL_PAGES.findIndex((p) => p.href === href);
  const prev = i > 0 ? ALL_PAGES[i - 1] : null;
  const next = i >= 0 && i < ALL_PAGES.length - 1 ? ALL_PAGES[i + 1] : null;
  return (
    <nav aria-label="Page navigation" className="mt-10 grid gap-3 border-t border-border pt-6 sm:grid-cols-2">
      {prev ? (
        <Link href={prev.href} className="rounded-lg border border-border bg-background p-4 text-sm hover:bg-muted">
          <span className="block text-xs uppercase tracking-wide text-muted-foreground">Previous</span>
          <span className="mt-1 block font-medium">{prev.nav}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={next.href}
          className="rounded-lg border border-border bg-background p-4 text-right text-sm hover:bg-muted sm:col-start-2"
        >
          <span className="block text-xs uppercase tracking-wide text-muted-foreground">Next</span>
          <span className="mt-1 block font-medium">{next.nav}</span>
        </Link>
      ) : null}
    </nav>
  );
}
