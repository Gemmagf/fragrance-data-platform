import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string;
  help?: string;
  accent?: "default" | "positive" | "negative";
};

const accentClass = {
  default: "text-foreground",
  positive: "text-emerald-600",
  negative: "text-rose-600",
} as const;

export function KPICard({ label, value, help, accent = "default" }: Props) {
  return (
    <div className="rounded-lg border border-border bg-background p-5">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={cn("mt-2 text-3xl font-semibold tracking-tight tabular-nums", accentClass[accent])}>
        {value}
      </div>
      {help && <div className="mt-2 text-xs leading-snug text-muted-foreground">{help}</div>}
    </div>
  );
}
