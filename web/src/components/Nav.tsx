"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Executive" },
  { href: "/win", label: "Brief-to-win" },
  { href: "/pricing", label: "Margin & pricing" },
  { href: "/risk", label: "Raw-material risk & IFRA" },
  { href: "/sustainability", label: "Sustainability" },
  { href: "/data-quality", label: "Data quality" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <nav className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-1 px-6 py-3">
        <span className="mr-4 text-sm font-semibold tracking-tight">LUZI-style D&amp;A</span>
        {LINKS.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors",
                active
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {l.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
