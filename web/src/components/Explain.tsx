import { cn } from "@/lib/utils";
import type { Section } from "@/lib/content";

type Tone = "neutral" | "accent" | "muted";

function Box({ title, tone = "neutral", className, children }: { title: string; tone?: Tone; className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-lg border p-5",
        tone === "accent" && "border-accent/40 bg-accent/10",
        tone === "muted" && "border-border bg-muted",
        tone === "neutral" && "border-border bg-background",
        className,
      )}
    >
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed">{children}</p>
    </div>
  );
}

/** Plain-language panel shown at the top of every dashboard page. */
export function Explain({ section }: { section: Section }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Box title="In plain words">{section.plain}</Box>
      <Box title="How to read it">{section.read}</Box>
      <Box title="Why it matters for LUZI" tone="accent">
        {section.forLuzi}
      </Box>
      <Box title="Decision it supports">{section.decision}</Box>
      <Box title="Limits to keep in mind" tone="muted" className="md:col-span-2">
        {section.limit}
      </Box>
    </div>
  );
}
