# 05 — Data platform: mapping the Data Engineer responsibilities to this case

The posting for the Microsoft Fabric role asks for five things. This document says, for each one, what the case contains, what it would look like on Fabric, and what is still missing. The same content is on the `/platform` page of the dashboard.

| # | Responsibility | Status | In this case | On Microsoft Fabric | Still missing |
|---|---|---|---|---|---|
| 1 | Build and maintain the central platform on Fabric and OneLake | Partly built | Three layers (bronze, silver, gold) as files, one repeatable build (`run_all`) | One Lakehouse per layer on OneLake, Delta tables, workspace roles per domain | Not deployed to Fabric |
| 2 | Pipelines from Abacus / c-tree, MS SQL Server and MySQL | Simulated | ERP extracts stand in for Abacus; each source has its own quirks | Data Pipeline with Copy activities; on-premises gateway for internal sources | No live connection; c-tree connectivity to check with the vendor |
| 3 | ETL / ELT and the Medallion architecture | Built | Bronze to silver (cleaning, key matching) to gold (business tables); data-quality report; 15 automated tests | Dataflows Gen2 or PySpark notebooks; one Lakehouse per medallion layer | Logic is in Python and pandas, not yet in Fabric |
| 4 | Semantic models and Power BI reports | Partly built | KPI dictionary with owner, refresh and formula; dashboards read the gold tables | Direct Lake semantic model over the gold Lakehouse; measures defined once | No Power BI model; the dashboard is a web application |
| 5 | Work with BAs and contribute to data governance | Built | Requirements, user stories with acceptance criteria, KPI dictionary, UAT plan, data-quality report with owners | Microsoft Purview for catalogue and lineage; owner approval for access | No catalogue or access control; owners are roles in documents |

## What I would build first on Fabric

1. One workspace per domain (finance, commercial, operations), each with a Lakehouse for bronze, silver and gold.
2. One pipeline per source system, starting with the ERP, so bronze tables are loaded and logged every day.
3. The data-quality checks from this case, run inside each pipeline, with failures sent to the data owner.
4. One semantic model over the gold tables, using the KPI definitions from `02_requirements_and_kpis.md`.
5. Only then the Power BI reports, so the business sees one version of each number.

## Honest scope

This case does not run on Fabric. Its value for the role is the logic and the discipline it demonstrates: a layered design, checks at every layer, and definitions the business can read. Moving it to Fabric is the first task in the plan, not something already done.
