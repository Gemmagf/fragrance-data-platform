# 01 — Role fit: what the posting asks, what the BRD implies, how this case answers

Source: LUZI job posting "Business Analyst, 80–100%, Dietlikon HQ" and the Data & Analytics BRD in this repo's parent folder.

## 1. What the posting asks (explicit)

| # | Requirement | Reading |
|---|---|---|
| R1 | 3+ years as BA in consulting, industrial manufacturing, chemicals or similar | Experience gate. This case does not replace it; it shows the method in a comparable sector. |
| R2 | Structured process and data analysis as the foundation | Needs a repeatable way to go from raw source to decision. |
| R3 | Build business-intelligence capabilities in the team mid-term | Expect to design the first BI layer, not only use one. |
| R4 | Organise and conduct tests of newly developed functionality | Acceptance criteria, test design and UAT, not just "looks right". |
| R5 | Train and support users | Documentation, training and support model. |
| R6 | Versatile; prepared to step into varied tasks | Breadth across domains (R&D, ops, commercial, finance, sustainability). |

## 2. What the BRD implies (inferred, to be verified in the first 30 days)

- **Build the house, not run it.** "Build BI capabilities mid-term" means the seat is seeding a function. Scope will grow. → Phased roadmap (BRD §14) and a case that is deliberately small but end-to-end.
- **Chemistry and manufacturing fluency.** Formulas, raw materials, supplier concentration, IFRA limits, standard cost. → The simulated world is built from formula-level data, not from sales data alone.
- **Product-owner flavour.** Running UAT and driving adoption is the closest part of the role to a product owner's job. → UAT plan with acceptance criteria and sign-off (`03_uat_and_training_plan.md`).
- **Stakeholders by domain.** R&D, operations, commercial, finance and sustainability each need different answers. → Dashboard pages organised by owner, not by data source.
- **Regulatory and sustainability pressure.** IFRA amendments and customer disclosure requests are now part of the job. → IFRA what-if simulation and a sustainability ledger.

## 3. Coverage: how the case answers each requirement

| Requirement | Evidence in the repo | Strength | Gap stated honestly |
|---|---|---|---|
| R1 (experience) | Not applicable | — | This case cannot prove years of BA practice. |
| R2 (process and data) | `pipeline.py`: silver rules, DQ report with raw vs after-cleaning counts; `simulate.py` injects realistic dirt (duplicates, key whitespace, label variants, missing values) | Strong | Only CSV and pandas. Production would be dbt + a warehouse. |
| R3 (BI capability) | Six dashboard pages mapped to the BRD suite, each with owner, refresh SLA and primary action | Medium-strong | Dashboards are a static Next.js site (same stack as the shoe-retail app), not Power BI; no row-level security. |
| R4 (testing) | 15 tests: data contracts plus recovery of the planted truth (elasticities, premium, win drivers, single-source flags, IFRA breaches) | Strong | Tests check the case's own logic, not a real system's integration. |
| R5 (training and support) | `03_uat_and_training_plan.md`: training plan per audience and support model | Medium | Not yet delivered to real users. |
| R6 (breadth) | Covers commercial, R&D, operations, finance, sustainability in one model | Medium-strong | Depth is limited to what the BRD prioritises. |

## 4. What I would verify first in the role (first 30 days)

1. Which ERP is actually in use (SAP Business One, Business Central, or Abacus) and what the export rights are.
2. Whether the formulation system has an API or only file exports. This decides the ingestion design.
3. How "won" is recorded: at the customer decision, at the first order, or at the first shipment. The win-rate definition in this case assumes the decision date.
4. Whether the CRM and ERP customer keys really differ, and how many accounts are duplicated.
5. Which IFRA amendments are live, and who currently owns the response.

Those five points are the first items in the stakeholder interview guide, not assumptions to defend.
