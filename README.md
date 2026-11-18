# LUZI-style Data & Analytics Case (simulated)

A portfolio case built around the **Business Analyst** role at a mid-size Swiss fragrance-compound manufacturer. It takes the BRD ("LUZI AG — Data & Analytics BRD") and turns it into a working, testable slice of the platform: a simulated world, a bronze→silver→gold pipeline with data-quality controls, the analyses the BRD prioritises, a Streamlit dashboard, a UAT plan and the business-analysis documents that sit in front of it.

> **Everything here is simulated.** Customers, suppliers, raw materials, formulas, prices and sales are invented to mirror the shape of the business. Nothing comes from LUZI AG's real systems or data. The planted business logic (win drivers, price elasticity, circular premium, regulatory limits) is known to the test suite, so each analysis can be checked against an answer.

## What it demonstrates against the job

| Role requirement (posting) | Where it is evidenced |
|---|---|
| Structured process and data analysis as the foundation | `src/luzi_case/pipeline.py` (bronze→silver→gold, reconciliations, DQ report) |
| Build BI capabilities mid-term | Dashboard pages mapped to the BRD's 12-dashboard suite, each with owner, SLA, primary action |
| Test newly developed functionality | `tests/test_case.py` (15 tests) and `docs/03_uat_and_training_plan.md` |
| Train and support users | Training plan, support model and "how to read this chart" captions in the dashboard |
| Chemicals / industrial manufacturing context | Formulas, raw materials, IFRA limits, standard cost roll-up, supplier concentration |
| Versatile, steps into varied tasks | BA analysis, data engineering, analytics, UAT and training all in one repo |

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
| Consume | Streamlit (`dashboard/app.py`) | Power BI |

## Quick start

```bash
cd luzi-data-case
pip install -r requirements.txt
PYTHONPATH=src python -m luzi_case.run_all        # simulate -> pipeline -> analyses
PYTHONPATH=src python tests/test_case.py          # 15 tests
PYTHONPATH=src streamlit run dashboard/app.py     # dashboard
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
dashboard/app.py   six pages, each with owner, refresh SLA and primary action
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
