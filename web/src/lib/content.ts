/**
 * Plain-language content for the dashboard.
 * Written for non-technical readers: what a page answers, how to read it,
 * why it matters for LUZI, the decision it supports, and its limits.
 */

export type Section = {
  slug: string;
  href: string;
  nav: string;
  title: string;
  question: string;
  plain: string;
  read: string;
  forLuzi: string;
  decision: string;
  limit: string;
  sources: string[];
  owner: string;
  sla: string;
  action: string;
};

export const DASHBOARD_SECTIONS: Section[] = [
  {
    slug: "executive",
    sources: ["S1", "S2", "L1", "L2"],
    href: "/executive",
    nav: "Executive",
    title: "Executive one-page",
    question: "Is the business healthy, and where is it growing?",
    plain:
      "This page answers one question: is the business healthy? It shows what we sold in the last 12 months, how much is left after paying for the ingredients, and how much depends on our biggest customers.",
    read:
      "Compare the last 12 months with the 12 months before. Gross margin is the share of each franc of sales that remains after the cost of the ingredients (standard cost).",
    forLuzi:
      "Board-level numbers should come from one agreed source. In many family-owned industrial firms they are rebuilt by hand every month. This page is the first step to one version of the truth that everyone trusts.",
    decision: "Where to focus the next quarter's commercial effort, and whether margins need attention.",
    limit:
      "Gross margin uses standard cost, not actual cost. Growth is compared with the prior year, because this case has no budget data.",
    owner: "CFO (Finance)",
    sla: "Daily, 06:00",
    action: "Decide where the next quarter's commercial push should go",
  },
  {
    slug: "win",
    sources: [],
    href: "/win",
    nav: "Brief-to-win",
    title: "Brief-to-win",
    question: "Why do we win some customer requests and lose others?",
    plain:
      "A 'brief' is a customer asking us to create a fragrance. The win rate is the share of decided briefs we win. This page shows which factors are linked to winning, and where the time goes between a brief and a shipment.",
    read:
      "In the driver chart, bars to the right help us win and bars to the left hurt. Navy bars are statistically clear. Grey bars are not yet proven by this sample.",
    forLuzi:
      "Every lost brief is revenue that never starts. If we know which levers matter (speed, number of sample rounds, price), sales and perfumers can focus their time where it counts.",
    decision: "Coach the team on response time and sample rounds, once the data proves those levers.",
    limit:
      "Response time and sample rounds point in the right direction but are not statistically significant in this sample. Treat them as hypotheses to test, not as facts.",
    owner: "Head of Commercial (CCO)",
    sla: "Weekly, Monday 07:00",
    action: "Coach the team on the levers that move win rate",
  },
  {
    slug: "pricing",
    sources: [],
    href: "/pricing",
    nav: "Margin & pricing",
    title: "Margin & pricing",
    question: "If we raise prices, how many customers will we lose?",
    plain:
      "The elasticity number measures how much volume changes when price changes. A number close to zero means customers barely react. A more negative number means they react strongly.",
    read:
      "Use the slider to try a price increase. The table shows the extra gross margin per customer tier. The uplift is before any customers we might lose.",
    forLuzi:
      "A blanket price increase can cost customers. A targeted one, by customer group, can protect margin where customers can absorb it. The slider shows the value of each option before anything is decided.",
    decision: "Approve a targeted price move by customer tier, and test it on a small group first.",
    limit:
      "No customer loss or competitor reaction is modelled, so the real gain will be smaller than the slider shows.",
    owner: "CFO (Finance)",
    sla: "Weekly, Monday 07:00",
    action: "Approve a targeted price move by tier, not a blanket increase",
  },
  {
    slug: "risk",
    sources: [],
    href: "/risk",
    nav: "Raw materials & IFRA",
    title: "Raw-material risk & IFRA",
    question: "Which ingredients could stop production, and what would a new safety rule change?",
    plain:
      "Raw materials are the ingredients. 'Single-source' means only one supplier can deliver an ingredient, so if that supplier stops, products stop too. IFRA is the industry body that sets safety limits. When it changes a limit, formulas may need reformulating quickly.",
    read:
      "The first table ranks single-source ingredients by the revenue that depends on them. The what-if panel shows which formulas would break if a limit were tightened.",
    forLuzi:
      "This is the supply-chain and regulatory risk the BRD describes. Instead of finding out after a rule changes, the team can see the impact in minutes and plan the reformulation.",
    decision:
      "Qualify a second supplier for the riskiest ingredients, and prepare reformulation before a rule takes effect.",
    limit:
      "A perfumer always approves any change to a formula. The tool ranks and quantifies; it never decides. Revenue figures overlap, so they cannot be added together.",
    owner: "COO (Operations) with Head of Regulatory",
    sla: "Monthly, 1st working day",
    action: "Qualify a second source for every single-source ingredient with more than CHF 1M at stake",
  },
  {
    slug: "sustainability",
    sources: [],
    href: "/sustainability",
    nav: "Sustainability",
    title: "Sustainability ledger",
    question: "How much carbon does each product carry, and do customers pay more for circular products?",
    plain:
      "CO2e is the carbon footprint of a product. 'Circular' products use recycled or circular ingredients. This page shows the footprint of each product, and whether customers pay a premium for circular ones.",
    read:
      "Each dot is one product. Green dots are circular products. The lower a dot, the smaller its footprint. The premium figure is the average extra price customers pay for circular products.",
    forLuzi:
      "Customers increasingly ask for carbon and ingredient data as a condition of tenders. Answering in a day instead of a week is a commercial advantage, and it can justify a fair price for circular products.",
    decision: "Answer customer disclosure requests from source data, and decide whether circular products deserve a price premium.",
    limit:
      "The footprints are simulated. They are not verified life-cycle assessments, and must not be sent to customers as they are.",
    owner: "Head of Sustainability",
    sla: "Monthly",
    action: "Answer a customer's CO2e or naturals request from source in under two clicks",
  },
  {
    slug: "data-quality",
    sources: [],
    href: "/data-quality",
    nav: "Data quality",
    title: "Data quality",
    question: "Can we trust the numbers in the other pages?",
    plain:
      "Before any number is trusted, we check the data for duplicates, missing values and inconsistent codes. 'Raw failures' are problems in what the source system sent. 'After cleaning' is what is still wrong. For important checks, the goal is zero.",
    read:
      "Look at the 'After cleaning' column first. Anything above zero in a high-severity check needs an owner to fix it at the source.",
    forLuzi:
      "A dashboard is only as good as its data. The BRD sets a clear rule: no number goes to the Steering Committee with an open high-severity issue. This page makes that rule visible.",
    decision: "Data owners fix problems at the source. The data team tracks the open items until they are closed.",
    limit:
      "The checks cover this case's data only. A real project would add checks on every source system.",
    owner: "Domain data stewards; monitored by Head of BI",
    sla: "Every data load",
    action: "Clear high-severity items before any number goes to the Steering Committee",
  },
];

export const ALL_PAGES = [
  { href: "/", nav: "Start here" },
  ...DASHBOARD_SECTIONS.map((s) => ({ href: s.href, nav: s.nav })),
  { href: "/platform", nav: "Data platform" },
  { href: "/value", nav: "What I bring" },
  { href: "/sources", nav: "Sources & method" },
  { href: "/glossary", nav: "Glossary" },
];

export const GLOSSARY: { term: string; meaning: string }[] = [
  { term: "Brief", meaning: "A customer's request for a new fragrance or scent. It starts the sales-and-creation process." },
  { term: "Compound", meaning: "A finished fragrance product that we sell to a customer, made from a formula." },
  { term: "Formula", meaning: "The recipe for a compound: which raw materials are used, and in what share of the total weight." },
  { term: "Raw material", meaning: "An ingredient used in a formula. It can be natural (from plants), synthetic (made in a lab) or a solvent." },
  { term: "Single-source", meaning: "An ingredient that only one qualified supplier can deliver. A risk if that supplier stops." },
  { term: "Win rate", meaning: "The share of decided briefs that we win. Briefs still open are not counted." },
  { term: "Gross margin", meaning: "The share of sales left after paying for the ingredients (standard cost). It does not include salaries, rent or transport." },
  { term: "Standard cost", meaning: "The estimated cost of making one kilogram of a product, based on current raw-material prices." },
  { term: "Elasticity", meaning: "How much sales volume changes when price changes. Close to zero: customers barely react. More negative: they react strongly." },
  { term: "Confidence interval", meaning: "The range in which the true value most likely lies. A narrow range means a precise estimate; a range that crosses zero means the effect is not yet proven." },
  { term: "Circular premium", meaning: "The extra price customers pay for products made with circular (recycled or reused) ingredients." },
  { term: "CO2e", meaning: "Carbon dioxide equivalent. A standard unit for the climate impact of a product." },
  { term: "IFRA", meaning: "The International Fragrance Association. Its safety standards limit how much of certain ingredients a product may contain." },
  { term: "Data quality (DQ) check", meaning: "An automatic test that looks for a specific data problem, such as duplicates or missing values." },
  { term: "Pipeline (bronze, silver, gold)", meaning: "Three stages of the data. Bronze: raw data as received. Silver: cleaned and matched. Gold: ready for business questions." },
  { term: "UAT (user acceptance testing)", meaning: "The final check by business users that a tool does what they need, before it is used for real decisions." },
  { term: "SLA (service level agreement)", meaning: "How fresh the data is and how quickly a problem is answered. For example, 'updated daily by 06:00'." },
  { term: "Simulated data", meaning: "Invented data that behaves like a real business. Every customer, supplier, formula and sale in this case is simulated, so no figure here is LUZI's." },
  { term: "Like-for-like growth (LFL)", meaning: "Growth measured at constant exchange rates and without the effect of acquisitions or disposals. Used by listed companies to compare years fairly." },
  { term: "EBITDA", meaning: "Earnings before interest, tax, depreciation and amortisation. A common measure of operating profit, used when comparing companies." },
  { term: "Third-party estimate", meaning: "A figure modelled by a data company rather than reported by the company. It can be far from the real value, so treat it as a rough guide." },
  { term: "Public benchmark", meaning: "A real figure published by another company, used to put the case in context. Each one is cited on the Sources page." },
  { term: "Steering Committee", meaning: "The group of senior leaders who review the data programme each month and decide on priorities." },
];

export type ValueRow = {
  need: string;
  bring: string;
  proof: string;
  /** Internal page to see the evidence. Empty when the evidence lives in the repository. */
  proofHref: string;
};

export const VALUE_ROWS: ValueRow[] = [
  {
    need: "Build and run a central data platform on Microsoft Fabric and OneLake",
    bring:
      "Built and refactored production Python data pipelines for scalability, testing and deployment readiness. Designed data models that improve governance and usability.",
    proof:
      "A three-layer platform (bronze, silver, gold) with one repeatable build and a run log of every load. A Fabric deployment plan that says exactly what is tested and what is not.",
    proofHref: "/platform",
  },
  {
    need: "Build pipelines from ERP and operational databases (Abacus, SQL Server, MySQL)",
    bring:
      "Strong in SQL and Python. Brought together many data sources (CRM, search, media, marketplace) into one set of dashboards at KH Lloreda.",
    proof:
      "Source connectors for SQL Server, MySQL and c-tree, which extract tables into bronze and log every load. Tested against SQLite; live servers are not yet tested.",
    proofHref: "/platform",
  },
  {
    need: "ETL / ELT processes and the medallion architecture",
    bring:
      "Refactored production pipelines so they can be tested and redeployed. Automated manual reporting, which removed repeated work for the teams that used it.",
    proof:
      "Bronze to silver to gold, with 22 automated tests. The pipeline is a set of plain steps, so each one can be read, tested and replaced.",
    proofHref: "/platform",
  },
  {
    need: "Data quality, validation and governance",
    bring:
      "Led the vision and delivery of a risk data-quality product, and a statistical validation engine, at UBS. Experienced in anomaly detection and validation methods.",
    proof:
      "Data contracts for every silver table (owner, key, types, allowed values), a quality gate that stops a bad load, and a data-quality report with raw and cleaned counts.",
    proofHref: "/data-quality",
  },
  {
    need: "Semantic models and Power BI reports",
    bring:
      "Power BI specialist. Led the Tableau-to-Power-BI migration across a risk function. Designs KPIs and dashboards that teams use to decide.",
    proof:
      "A metrics catalogue that defines each number once, with its owner, source and page. Dashboards read the gold tables, so the same definition is used everywhere.",
    proofHref: "/platform",
  },
  {
    need: "Work with business teams and deliver with them",
    bring:
      "Product owner of two data tools, managing a cross-functional team of five through agile cycles, and cutting project time by half. Translated complex model outputs for senior stakeholders.",
    proof:
      "Every dashboard has a named owner, a refresh schedule and the decision it supports. Every external figure is cited, with its status, on the Sources page.",
    proofHref: "/sources",
  },
];

export const VALUE_GAP = {
  gap: "I have not yet run a pipeline on Microsoft Fabric or against a live ERP. My CV lists Python, SQL and Power BI, but no Spark or Fabric work. The Fabric parts of this case are a plan, not a deployment.",
  close:
    "In the first month I would set up a Fabric workspace, get read-only access to one ERP extract, and ask a senior data engineer to review the first pipeline before it goes live.",
};

export const FIRST_90_DAYS = [
  {
    phase: "Days 1–30: Set up and connect",
    items: [
      "Create the Fabric workspace and the bronze, silver and gold Lakehouses, with roles for each domain.",
      "Get read-only access to the ERP and confirm table names, refresh needs and owners.",
      "Connect the first source and load it into bronze, with the load log running from day one.",
    ],
  },
  {
    phase: "Days 31–60: First pipeline end to end",
    items: [
      "Move one domain (ERP orders) from bronze to silver to gold, with data contracts and the quality gate.",
      "Alert the data owner when a check fails, and track the open items until they are closed.",
      "Run the same checks in Fabric as in this case, and compare the results.",
    ],
  },
  {
    phase: "Days 61–90: Serve and hand over",
    items: [
      "Build the semantic model on the gold tables, using the metrics catalogue, and the first Power BI reports.",
      "Write a runbook: how a load runs, what a failure looks like, who is called.",
      "Propose the next domains, with the effort and risk of each, for the team to decide.",
    ],
  },
];

export function getSection(slug: string): Section {
  const s = DASHBOARD_SECTIONS.find((x) => x.slug === slug);
  if (!s) throw new Error(`Unknown section: ${slug}`);
  return s;
}

/**
 * Data Engineer responsibilities (Microsoft Fabric role), mapped to what this case actually contains.
 * status: "built" = done in this repo; "partial" = same logic, not yet on the target platform;
 * "simulated" = data stands in for the real source.
 */
export type PlatformTask = {
  task: string;
  status: "built" | "partial" | "simulated";
  caseEvidence: string;
  fabricEquivalent: string;
  gap: string;
};

export const PLATFORM_TASKS: PlatformTask[] = [
  {
    task: "Build and maintain the central data platform on Microsoft Fabric and OneLake",
    status: "partial",
    caseEvidence:
      "A three-layer lake (bronze, silver, gold) stored as files, one repeatable build (run_all), and a run log that records every load and whether the quality gate passed.",
    fabricEquivalent:
      "One Fabric Lakehouse per layer, on OneLake, with tables in Delta format, and workspace roles for each domain.",
    gap: "Not deployed to Fabric. The same structure is ready to move, but I have not built the workspace here.",
  },
  {
    task: "Build pipelines from Abacus / c-tree, MS SQL Server and MySQL",
    status: "partial",
    caseEvidence:
      "Source connectors for SQL Server, MySQL and c-tree are written. Each extracts tables into bronze and logs every load, including failures. They are tested against SQLite, which uses the same code path. The case data stands in for the ERP.",
    fabricEquivalent:
      "Data Pipeline with Copy activities for SQL Server and MySQL, and an on-premises data gateway for sources inside the company network.",
    gap:
      "Not tested against a live SQL Server or MySQL server. c-tree needs its vendor driver, and the table names must be confirmed with the ERP super-user.",
  },
  {
    task: "ETL / ELT processes and the Medallion architecture (bronze, silver, gold)",
    status: "built",
    caseEvidence:
      "The pipeline cleans and matches the data (bronze to silver), then builds the business tables and analyses (silver to gold). Every issue is logged in a data-quality report, 22 automated tests check the results, and the quality gate stops any load that breaks a contract.",
    fabricEquivalent:
      "Dataflows Gen2 or PySpark notebooks for the transformations, with the medallion layers as separate Lakehouses.",
    gap: "The logic is in Python and pandas, not yet in Fabric notebooks.",
  },
  {
    task: "Semantic models and Power BI reports",
    status: "partial",
    caseEvidence:
      "A metrics catalogue defines each number once, with owner, source table, refresh and the page that shows it. The dashboards read the gold tables, and a test checks that every source and page in the catalogue exists.",
    fabricEquivalent:
      "A Direct Lake semantic model over the gold Lakehouse, with measures defined once and reused by every Power BI report.",
    gap: "No Power BI model exists yet. The catalogue is a file, not yet a semantic model in Fabric. The dashboards are a web application, not Power BI.",
  },
  {
    task: "Work with business teams and contribute to data governance",
    status: "partial",
    caseEvidence:
      "Requirements, user stories with acceptance criteria, a KPI dictionary, a UAT plan, a data-quality report with named owners, data contracts that name an owner and sensitivity for every table, and a run log of every load.",
    fabricEquivalent:
      "Microsoft Purview for the catalogue and lineage, plus data-owner approval for access requests.",
    gap: "No Purview catalogue, lineage or access control has been set up. The owners are roles in the contracts and documents, not accounts in a system.",
  },
];

export const PLATFORM_LAYERS = [
  {
    name: "Sources",
    detail: "ERP (Abacus-type), SQL Server, MySQL, CRM, formulation system, price feeds",
    tone: "bg-muted",
  },
  {
    name: "Bronze",
    detail: "Raw data exactly as received. Never edited, so every number can be traced back.",
    tone: "bg-amber-100",
  },
  {
    name: "Silver",
    detail: "Cleaned, de-duplicated, keys matched between systems, types enforced.",
    tone: "bg-slate-200",
  },
  {
    name: "Gold",
    detail: "Business tables and analyses: margins, win rates, risk, sustainability.",
    tone: "bg-yellow-200",
  },
  {
    name: "Consume",
    detail: "Dashboards, the semantic layer and the reports the business uses to decide.",
    tone: "bg-accent/20",
  },
];
