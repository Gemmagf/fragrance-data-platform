import { cn } from "@/lib/utils";

type Props = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
};

export function Card({ title, subtitle, children, className }: Props) {
  return (
    <section className={cn("rounded-lg border border-border bg-background", className)}>
      {title && (
        <header className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}
