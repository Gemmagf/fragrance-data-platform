"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ALL_PAGES } from "@/lib/content";
import { cn } from "@/lib/utils";

export function Nav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-1 px-6 py-3">
        <Link href="/" className="mr-4 text-sm font-semibold tracking-tight">
          LUZI-style D&amp;A
        </Link>
        {ALL_PAGES.map((p) => {
          const active = pathname === p.href || pathname === p.href.replace(/\/$/, "") || pathname === `${p.href}/`;
          return (
            <Link
              key={p.href}
              href={p.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors",
                active ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {p.nav}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
