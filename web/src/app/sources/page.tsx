import { SOURCES, getSource } from "@/lib/sources";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { DataTable } from "@/components/DataTable";
import { PrevNext } from "@/components/PrevNext";

const FLOW = [
  { n: "1", title: "Generate", text: "Python code creates the simulated business with a fixed random seed, so anyone who runs it gets the same numbers." },
  { n: "2", title: "Land as raw files", text: "Each source system gets its own export file: CRM, ERP, formulation system, price feed, HR, regulatory limits." },
  { n: "3", title: "Clean and check", text: "The pipeline removes duplicates, matches codes between systems and logs every problem in a data-quality report." },
  { n: "4", title: "Calculate", text: "Analyses produce the tables behind each page: win rates, elasticities, risk exposure, footprints." },
  { n: "5", title: "Publish", text: "The results are exported to one data file, which the website reads when it is built. The website makes no live calls to any system." },
];

export default function SourcesPage() {
  const external = SOURCES.filter((s) => s.kind !== "author material");
  return (
    <>
      <PageHeader
        title="Sources and method"
        subtitle="Where every number comes from, what is real, what is simulated, and how far each source can be trusted."
        owner="Author of this case"
        sla="Updated when data or sources change"
        action="Check the status of any figure before quoting it"
      />

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <Card title="Simulated" subtitle="Invented data, built to behave like a fragrance business">
          <p className="text-sm leading-relaxed">
            Customers, suppliers, ingredients, formulas, prices, briefs, orders and sustainability figures on every
            dashboard page. Nothing here is LUZI&apos;s data. Planted effects are known to the test suite, so the method can be checked.
          </p>
        </Card>
        <Card title="Public benchmarks" subtitle="Real figures published by other companies">
          <p className="text-sm leading-relaxed">
            Givaudan&apos;s 2025 results, used for context only. They are not comparable to the simulated business and are
            cited wherever they appear.
          </p>
        </Card>
        <Card title="Estimates and author material" subtitle="Lower confidence, or the author's own documents">
          <p className="text-sm leading-relaxed">
            Third-party estimates of LUZI (they disagree with each other), the author&apos;s brief and CV. Each is labelled
            with its status.
          </p>
        </Card>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">How the data flows to the page you are reading</h2>
        <ol className="grid gap-3 md:grid-cols-5">
          {FLOW.map((f) => (
            <li key={f.n} className="rounded-lg border border-border bg-background p-4">
              <span className="font-mono text-xs text-muted-foreground">Step {f.n}</span>
              <span className="mt-1 block font-semibold">{f.title}</span>
              <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">{f.text}</span>
            </li>
          ))}
        </ol>
        <p className="text-sm text-muted-foreground">
          To refresh the figures, run <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">python -m luzi_case.run_all</code>{" "}
          and then rebuild the site. Each step is a file in the repository, so every number can be traced back to its input.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Which data feeds which page</h2>
        <DataTable
          columns={[
            { key: "dataset", label: "Dataset" },
            { key: "what", label: "What it is" },
            { key: "origin", label: "Origin" },
            { key: "pages", label: "Used on" },
          ]}
          rows={[
            { dataset: "CRM briefs", what: "Customer requests, outcomes, response times, perfumer assigned", origin: "Simulated", pages: "Brief-to-win, Data quality" },
            { dataset: "ERP sales orders", what: "Monthly orders per compound, price and quantity", origin: "Simulated", pages: "Executive, Margin & pricing, Data quality" },
            { dataset: "Formulations", what: "Formula per compound, raw-material share by weight", origin: "Simulated", pages: "Raw materials, Sustainability" },
            { dataset: "Raw materials and suppliers", what: "Ingredient type, origin, primary and second supplier, supplier delivery record", origin: "Simulated", pages: "Raw materials, Sustainability" },
            { dataset: "Raw-material price feed", what: "Monthly price per ingredient, with a 2025 climate shock on some natural ingredients", origin: "Simulated", pages: "Raw materials, Executive" },
            { dataset: "Regulatory limits", what: "Maximum share of weight for six restricted ingredients", origin: "Simulated values", pages: "Raw materials & IFRA" },
            { dataset: "Sustainability requests", what: "Customer requests and the days taken to answer them", origin: "Simulated", pages: "Sustainability" },
            { dataset: "Customers and crosswalk", what: "Customer master, CRM and ERP identifiers, duplicate accounts", origin: "Simulated", pages: "All pages that show customers" },
          ]}
        />
        <p className="text-xs text-muted-foreground">
          The regulatory limits are invented for the simulation. They are not the official IFRA standard. Check the
          current IFRA publications before using any limit in a real decision.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">External sources, with citations and status</h2>
        <p className="text-sm text-muted-foreground">
          Figures were read in the sources listed here on the access date. Open each link and check it before quoting it.
        </p>
        <DataTable
          columns={[
            { key: "id", label: "Id" },
            { key: "source", label: "Source" },
            { key: "used", label: "What we use from it" },
            { key: "status", label: "Status" },
            { key: "caveat", label: "Caveat" },
          ]}
          rows={external.map((s) => ({
            id: <span className="font-mono text-xs">{s.id}</span>,
            source: (
              <span>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-medium underline underline-offset-2">
                  {s.title}
                </a>
                <span className="block text-xs text-muted-foreground">
                  {s.publisher} · accessed {s.accessed}
                </span>
              </span>
            ),
            used: s.used,
            status: <span className={s.status === "verified" ? "font-medium text-emerald-700" : "font-medium text-amber-700"}>{s.status}</span>,
            caveat: s.caveat ?? "—",
          }))}
        />
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Estimates of LUZI, and why they are not used as facts</h2>
        <div className="rounded-lg border border-accent/40 bg-accent/10 p-5 text-sm leading-relaxed">
          <p>
            Public estimates of LUZI disagree widely. An aggregator puts annual revenue at about USD 15.7M ({getSource("L1").id}),
            while the BRD used a range of USD 100–200M ({getSource("C1").id}). Headcount estimates range from 155 to 201–500.
            None of these is a company filing.
          </p>
          <p className="mt-3">
            The case therefore does not claim any real LUZI figure. The revenue, margin and headcount on the dashboards are
            simulated. The first check before any real use is the official commercial register ({getSource("L5").id}) and LUZI&apos;s own website.
          </p>
        </div>
      </section>

      <section className="mt-10">
        <Card title="What is verified, and what is not">
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
            <li><strong>Verified:</strong> the Givaudan 2025 figures (from the company&apos;s own financial summary, with a secondary article for the business-unit growth).</li>
            <li><strong>Estimate:</strong> every figure about LUZI itself, including its revenue and headcount.</li>
            <li><strong>Not yet checked:</strong> legal and ownership details, which need the commercial register.</li>
            <li><strong>Author material:</strong> the BRD assumptions and the CV. They describe the author&apos;s view, not independent evidence.</li>
            <li><strong>Simulated:</strong> all operational data. It shows how the method works, not how LUZI performs.</li>
          </ul>
        </Card>
      </section>

      <PrevNext href="/sources" />
    </>
  );
}
