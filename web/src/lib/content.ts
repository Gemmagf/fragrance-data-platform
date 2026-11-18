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
  owner: string;
  sla: string;
  action: string;
};

export const DASHBOARD_SECTIONS: Section[] = [
  {
    slug: "executive",
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
    decision: "Data owners fix problems at the source. The BA tracks the open items until they are closed.",
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
  { href: "/value", nav: "What I bring" },
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
    need: "Turn raw data into a reliable process, not one-off spreadsheets",
    bring:
      "Product owner of a risk data-quality product and of a statistical validation engine at UBS. I designed data models for governance and automated manual reporting.",
    proof: "A repeatable pipeline from raw exports to clean, checked tables, with a data-quality report showing every issue found and fixed.",
    proofHref: "/data-quality",
  },
  {
    need: "Build a BI capability that grows over time, with clear owners",
    bring:
      "Led the Tableau-to-Power-BI migration across a risk function. I know how to choose the KPIs a team really uses, and how to make a dashboard someone acts on.",
    proof: "Six dashboards, each with a named owner, a refresh schedule and the decision it should drive.",
    proofHref: "/executive",
  },
  {
    need: "Test new functionality and make sure it does what users need",
    bring:
      "Ran full agile cycles as product owner, with a cross-functional team of five (IT and business). Cut project time by half on the tools I owned.",
    proof:
      "A UAT script of 13 business test cases, each linked to an acceptance criterion, plus 15 automated tests. Both are in the project repository (docs/ and tests/).",
    proofHref: "",
  },
  {
    need: "Train and support users so they actually adopt the tools",
    bring:
      "Translated complex model outputs into recommendations for senior stakeholders. Mentored an intern for 18 months. Presented insights to senior stakeholders at Google.",
    proof: "Explanations written for non-technical readers on every page, and a training and support plan by role.",
    proofHref: "/",
  },
  {
    need: "Understand a manufacturing and consumer-goods business",
    bring:
      "Sixteen months as a data scientist at KH Lloreda (KH-7), a consumer-goods company: regression-based sales forecasting, marketing-mix analysis and ROI work to guide spending.",
    proof: "Pricing, win-rate and raw-material analyses built on a formula-level model of the business.",
    proofHref: "/pricing",
  },
  {
    need: "Be prepared to step into varied tasks, and work across languages",
    bring:
      "Native Catalan and Spanish, fluent English and French, intermediate German. Comfortable moving between finance, commercial, operations and sustainability topics.",
    proof: "A full case built end to end, from business analysis to working dashboard, in a single repository.",
    proofHref: "/",
  },
];

export const VALUE_GAP = {
  gap: "My experience as a business analyst with a formal title is shorter than the 3+ years the posting asks for. My strongest evidence is as a product owner and data scientist, plus a consumer-goods company background.",
  close:
    "I would close the gap in the first 30 days by building the stakeholder map, asking for an ERP super-user as an early contact, and checking the five assumptions listed in the role-fit analysis before proposing any change.",
};

export const FIRST_90_DAYS = [
  {
    phase: "Days 1–30: Listen",
    items: [
      "Interview R&D, operations, commercial, finance and sustainability leads.",
      "Map the systems that matter: the ERP, the formulation system, the CRM.",
      "Confirm how a won brief, a shipment and a price change are recorded.",
    ],
  },
  {
    phase: "Days 31–60: Verify",
    items: [
      "Test each assumption in this case against real LUZI data, and keep or drop it.",
      "Set up the first real data load for one domain, with its data-quality checks.",
      "Agree the owner, refresh schedule and primary action for each dashboard.",
    ],
  },
  {
    phase: "Days 61–90: Commit",
    items: [
      "Return to the Steering Committee with a LUZI-specific version of this plan.",
      "Propose a 12-month roadmap, not a 24-month one, because the second year is hard to predict.",
      "Hand over training material and a support route to the first users.",
    ],
  },
];

export function getSection(slug: string): Section {
  const s = DASHBOARD_SECTIONS.find((x) => x.slug === slug);
  if (!s) throw new Error(`Unknown section: ${slug}`);
  return s;
}
