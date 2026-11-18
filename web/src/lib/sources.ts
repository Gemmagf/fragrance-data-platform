/**
 * Register of every external source used in the case, with its status.
 *
 * "verified" means the figure was read in the source text (or the search summary of it)
 * on the access date. Re-open each link before quoting a figure in an interview.
 * "estimate" means a third-party figure that disagrees with other sources.
 * "context" means the author's own material (BRD, CV), not an external reference.
 */

export type Source = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  kind: "company filing" | "press" | "estimate" | "official register" | "company website" | "author material";
  status: "verified" | "estimate" | "context" | "not yet verified";
  accessed: string;
  used: string;
  caveat?: string;
};

const ACCESSED = "2026-11-18";

export const SOURCES: Source[] = [
  {
    id: "S1",
    title: "Givaudan 2025 financial summary",
    publisher: "Givaudan SA",
    url: "https://www.givaudan.com/files/giv-2025-financial-summary.pdf",
    kind: "company filing",
    status: "verified",
    accessed: ACCESSED,
    used: "Fragrance & Beauty sales CHF 3.83bn (+7.9% like-for-like); EBITDA CHF 985m; margin 25.7% (2024: 26.9%); group sales CHF 7.47bn (+5.1% like-for-like).",
    caveat: "The press release labels 2024 operating income twice; the financial summary figures were used instead.",
  },
  {
    id: "S2",
    title: "Beauty and fragrance frontrunner in Givaudan 2025 financial report",
    publisher: "Personal Care Insights",
    url: "https://www.personalcareinsights.com/news/givaudan-2025-financial-results-growth.html",
    kind: "press",
    status: "verified",
    accessed: ACCESSED,
    used: "Fine Fragrance +18.3% like-for-like; Consumer Products +6.8%; Fragrance Ingredients and Active Beauty -1.4%.",
    caveat: "Secondary source. The company's own figures (S1) take precedence.",
  },
  {
    id: "S3",
    title: "Givaudan SA full-year 2025 summary",
    publisher: "allmind.ai",
    url: "https://allmind.ai/news/4afb041f7509e9a42eb69eb91d44efe1d71af1500cb41b7252f0cba8ff0316ba",
    kind: "press",
    status: "verified",
    accessed: ACCESSED,
    used: "Group EBITDA CHF 1.75bn.",
    caveat: "Secondary aggregator. Confirm against the company report before quoting.",
  },
  {
    id: "L1",
    title: "LUZI AG company profile",
    publisher: "RocketReach (data aggregator)",
    url: "https://rocketreach.co/luzi-profile_b452df69fc8c3aa5",
    kind: "estimate",
    status: "estimate",
    accessed: ACCESSED,
    used: "Estimated annual revenue of about USD 15.7M; headcount estimates of 155 and 330 in different fields.",
    caveat: "Modelled by a data aggregator, not a company filing. The two headcount figures contradict each other.",
  },
  {
    id: "L2",
    title: "LUZI employee estimate",
    publisher: "Prospeo (data aggregator)",
    url: "https://prospeo.io/c/luzi-email-format",
    kind: "estimate",
    status: "estimate",
    accessed: ACCESSED,
    used: "Headcount bracket 201–500 employees.",
    caveat: "Estimate. The BRD uses the same bracket.",
  },
  {
    id: "L3",
    title: "Fragrance player Luzi returns to being a family run business",
    publisher: "Cosmetics Design Europe",
    url: "https://cosmeticsdesign-europe.com/Article/2018/06/12/Fragrance-player-Luzi-returns-to-being-a-family-run-business",
    kind: "press",
    status: "verified",
    accessed: ACCESSED,
    used: "LUZI is a family-run fragrance company (ownership context).",
    caveat: "Reported in 2018. Ownership may have changed since.",
  },
  {
    id: "L4",
    title: "LUZI fragrance compounds is celebrating its 90th anniversary",
    publisher: "Cosmetics Business",
    url: "https://www.cosmeticsbusiness.com/luzi-fragrance-compounds-is-celebrating-its-90th-anniversary-118031",
    kind: "press",
    status: "verified",
    accessed: ACCESSED,
    used: "Reports a 90th anniversary, which implies a founding around 1926. Consistent with the BRD, but the article itself is the only source for this.",
  },
  {
    id: "L5",
    title: "Swiss commercial register (Zefix)",
    publisher: "Swiss Federal Office of Justice",
    url: "https://www.zefix.ch",
    kind: "official register",
    status: "not yet verified",
    accessed: ACCESSED,
    used: "The authoritative place to check LUZI AG's legal details, capital and officers.",
    caveat: "Not yet consulted for this case. Use it before quoting any legal or ownership fact.",
  },
  {
    id: "C1",
    title: "Author's Business Analyst brief (BRD)",
    publisher: "Gemma Garcia de la Fuente",
    url: "",
    kind: "author material",
    status: "context",
    accessed: ACCESSED,
    used: "The role scope, the analytical use cases and the 18-month roadmap that this case follows.",
    caveat: "Company facts in the BRD (revenue, founding year, team size) are the author's assumptions and are not checked against sources. The BRD revenue (USD 100–200M) conflicts with estimate L1.",
  },
  {
    id: "C2",
    title: "Author's CV",
    publisher: "Gemma Garcia de la Fuente",
    url: "",
    kind: "author material",
    status: "context",
    accessed: ACCESSED,
    used: "Professional experience shown on the 'What I bring' page.",
    caveat: "Personal document. Experience at UBS is described at a general level.",
  },
  {
    id: "SIM",
    title: "Simulated dataset of this case",
    publisher: "Generated by the project code (fixed random seed)",
    url: "",
    kind: "author material",
    status: "context",
    accessed: ACCESSED,
    used: "All customers, suppliers, ingredients, formulas, prices, briefs, orders and sustainability figures on the dashboard pages.",
    caveat: "Invented to behave like a fragrance business. Not LUZI data. The planted effects are known to the test suite.",
  },
];

export function getSource(id: string): Source {
  const s = SOURCES.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown source: ${id}`);
  return s;
}
