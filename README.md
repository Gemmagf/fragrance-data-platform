# LUZI-style Data & Analytics Case (simulated)

A portfolio case for the **Data Engineer** role (Microsoft Fabric, pipelines, data quality, semantic layer) at a mid-size Swiss fragrance-compound manufacturer. It builds a working, testable data platform on a simulated business: source connectors, bronze-silver-gold layers, data contracts, a quality gate, a metrics catalogue and dashboards that read the gold tables.

> **Everything here is simulated.** Customers, suppliers, raw materials, formulas, prices and sales are invented to mirror the shape of the business. Nothing comes from LUZI AG's real systems or data. The planted business logic (win drivers, price elasticity, circular premium, regulatory limits) is known to the test suite, so each analysis can be checked against an answer.

## Read this first (no technical background needed)

**The question this case answers:** how can a fragrance manufacturer use its data to decide faster: which customer
requests to chase, how to set prices, which ingredients could stop production, and how to answer sustainability questions?

**How to explore it:** open the web dashboard (`web/`) and start with the home page, *Start here*. It links to six
sections, each answering one business question in plain language, plus a glossary and a page on what I would bring to LUZI.

**What is real and what is not:** everything is simulated. Customers, suppliers, ingredients, formulas and sales are
invented to behave like a real fragrance business. Nothing here is LUZI AG's data. The logic is built in on purpose, so
the analyses can be checked against a known answer.

**What I would bring:** a Data Engineer who builds pipelines that are tested and redeployable, puts quality checks inside the pipeline, and serves Power BI from one clean model. The mapping to each responsibility of the role, with the gaps stated, is on the *What I would bring* page.

## What it demonstrates against the job

| Role requirement (posting) | Where it is evidenced |
|---|---|
| Build and maintain the data platform | `src/luzi_case/pipeline.py` (bronze→silver→gold), `run_all` with a run log, `docs/06` Fabric plan |
| Build pipelines from ERP and databases | `src/luzi_case/connectors.py` for SQL Server, MySQL and c-tree (tested on SQLite; live servers not yet tested) |
| ETL / ELT and medallion architecture | `src/luzi_case/pipeline.py`, 22 automated tests in `tests/test_case.py` |
| Data quality and governance | `contracts/silver_contracts.yml`, `src/luzi_case/gate.py` (quality gate), `metrics/metrics.yml` |
| Semantic models and Power BI | Metrics catalogue with one definition per KPI; gold tables feed the dashboards; Power BI plan in `docs/06` |
| Versatile, works with business teams | Product-owner delivery, a cross-language web application, plain-language guidance for every page |

Full mapping, with gaps stated honestly: [`docs/01_role_fit_analysis.md`](docs/01_role_fit_analysis.md).

## The analyses (BRD section 11)

| BRD use case | Analysis | Module |
|---|---|---|
| #1 Brief-to-win | Win-rate cuts, logit on win drivers with 95% CI | `analyses.brief_win_drivers` |
| #4 Price elasticity by tier | Log-log panel with compound and month fixed effects, per tier | `analyses.price_elasticity_by_tier` |
| #4 Repricing (+50 bps target) | Last-12-month gross-margin scenario by tier | `analyses.repricing_scenario` |
| #3 / #8 Raw-material risk | Single-source flags, exposure, price volatility, supplier outage stress | `analyses.rm_single_source_risk`, `supplier_outage_stress` |
| #10 IFRA impact simulation | "What breaks if this RM is capped at X%?" with revenue at risk | `analyses.ifra_amendment_impact` |
| #9 Sustainability premium | Circular-compound price premium vs quote, with customer fixed effects | `analyses.circular_price_premium` |
| #6 Lead-time decomposition | Median stage durations and share of total | `analyses.cycle_time_decomposition` |
| Dashboard 12 | CO2e per kg, naturals share, circular share per compound | `analyses.sustainability_ledger` |

Results and their caveats: [`docs/04_findings_and_recommendations.md`](docs/04_findings_and_recommendations.md).

## Architecture and the production mapping

The repo runs on Python and parquet so it works anywhere. The BRD's target stack maps onto it one-to-one.

| Layer | This case (runs locally) | BRD target stack |
|---|---|---|
| Sources | CSV exports in `data/bronze/` (CRM, ERP, formulation, RM prices, HR, IFRA) | ERP (SAP/Abacus), formulation system, LIMS, CRM, broker feeds |
| Ingestion | Copy of raw exports, untouched | ADF + Fivetran into ADLS Gen2 + Delta Lake |
| Silver | `src/luzi_case/pipeline.py` `build_silver` (pandas) | dbt models on Databricks SQL / Snowflake |
| Quality | `dq_report` with raw vs after-cleaning counts | Great Expectations in CI |
| Gold | `build_gold` and analysis tables in `data/gold/` | dbt marts + Power BI semantic model |
| Analyses | `src/luzi_case/analyses.py` (statsmodels) | Databricks notebooks / ML pilots |
| Consume | Next.js + React + Recharts static dashboard (`web/`) | Power BI |

## Quick start

```bash
cd fragrance-data-platform
pip install -r requirements.txt
PYTHONPATH=src python -m luzi_case.run_all        # simulate -> pipeline -> analyses -> export
PYTHONPATH=src python tests/test_case.py          # 22 tests

cd web
npm install
npm run dev                                       # http://localhost:3000
npm run build                                     # static export in web/out
```

To regenerate the raw world with a different seed: `PYTHONPATH=src python -m luzi_case.simulate` (seed in `src/luzi_case/config.py`).

## Repository layout

```
src/luzi_case/
  config.py        world definition and planted truths (win drivers, elasticities, premium, limits)
  simulate.py      generates the simulated world, injects realistic dirt, writes bronze + ground truth
  pipeline.py      bronze -> silver -> gold, data-quality report
  analyses.py      the analyses that answer the BRD's questions
  run_all.py       end-to-end run; writes gold tables and findings.json
web/              Next.js 16 + React 19 + TypeScript + Tailwind v4 + Recharts 3 dashboard (static export)
  src/app/        six routes, each with owner, refresh SLA and primary action
  src/components/ charts (client) and layout/table primitives (server)
  src/data/       site.json, generated by luzi_case.export_site
tests/test_case.py data contracts + recovery of the planted truth
docs/              role fit, requirements and KPIs, UAT and training, findings
data/
  bronze/          raw exports (generated)
  silver/          cleansed tables (generated)
  gold/            marts, analysis outputs, dq_report.csv, findings.json (generated)
  _ground_truth/   the answers. Read only by tests, never by the pipeline
```

## Limits of the case

- The data is simulated. Logic is planted on purpose, so a passing test shows the method works, not that a real business behaves this way.
- Because the simulator fixes stage durations and effect sizes, the cycle-time and elasticity numbers are demonstrations of method, not findings about LUZI.
- No churn, competitor response or cannibalisation is modelled in the repricing scenario.
- Gross margin uses standard cost per kg from the formula at the order month. Actual costing, overheads and freight are out of scope.
