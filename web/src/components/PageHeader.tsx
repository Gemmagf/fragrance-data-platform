type Props = {
  title: string;
  subtitle?: string;
  owner: string;
  sla: string;
  action: string;
};

/** Every dashboard states who owns it, how fresh it is and what decision it should drive (BRD §10). */
export function PageHeader({ title, subtitle, owner, sla, action }: Props) {
  return (
    <div className="pb-6">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
      <dl className="mt-5 grid gap-3 rounded-lg border border-border bg-background p-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Owner</dt>
          <dd className="mt-0.5 font-medium">{owner}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Refresh SLA</dt>
          <dd className="mt-0.5 font-medium">{sla}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Primary action</dt>
          <dd className="mt-0.5 font-medium">{action}</dd>
        </div>
      </dl>
    </div>
  );
}
