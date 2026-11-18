# 06 — Fabric deployment plan, and what is tested versus not

This case does not run on Microsoft Fabric. This document says exactly what would be done on the platform, in order, and what has and has not been tested. Anything marked **not tested** is code or configuration that has not run against the real system.

## 1. What exists in the repository

| Area | Built | Tested | Where |
|---|---|---|---|
| Source connectors (SQL Server, MySQL, c-tree) | Yes | Against SQLite only (same SQLAlchemy path) | `src/luzi_case/connectors.py` |
| Load log for every extract, including failures | Yes | Yes | `data/load_log.json` |
| Medallion layers: bronze, silver, gold | Yes | Yes (15 tests plus contract tests) | `src/luzi_case/pipeline.py` |
| Data contracts per silver table | Yes | Yes, including planted violations | `contracts/silver_contracts.yml`, `src/luzi_case/contracts.py` |
| Quality gate that stops a bad load | Yes | Yes | `src/luzi_case/gate.py`, run log in `data/gold/run_log.json` |
| Metrics catalogue (one definition per KPI) | Yes | Yes (sources and pages exist) | `metrics/metrics.yml` |

## 2. Not tested (must be checked on the real system)

- **SQL Server**: the `mssql+pyodbc` URL needs Microsoft ODBC Driver 18 and network access to the server. Not tested against a live server.
- **MySQL**: the `mysql+pymysql` URL needs a reachable server. Not tested against a live server.
- **c-tree**: needs the vendor ODBC driver and a DSN. The driver is not installed here, and the table names are not confirmed. The connector is a placeholder until the vendor is consulted.
- **Table names and columns** in `CASE_SOURCES` are assumed from the posting, not read from the real ERP. They must be confirmed with the super-user.
- **Microsoft Fabric itself**: no workspace, Lakehouse, pipeline or semantic model has been created. Nothing below has run on Fabric.
- **Power BI**: no semantic model or report exists. The web dashboard is not Power BI.

## 3. Deployment steps on Fabric, in order

1. **Workspace per domain.** Create one workspace for finance, one for commercial and one for operations, with roles assigned to named owners. Access requests go through the data owner.
2. **Lakehouses per layer.** Create `lh_bronze`, `lh_silver` and `lh_gold` in the domain workspace. Store tables in Delta format on OneLake.
3. **Connectivity.** Install an on-premises data gateway for sources inside the network. Create connections for SQL Server and MySQL. Confirm c-tree access with the vendor, and decide between a gateway connector and a scheduled file export.
4. **Bronze pipeline.** A Data Pipeline with one Copy activity per table, writing to `lh_bronze`, and a load-log table written at the end of each run, as `connectors.py` does now.
5. **Silver transformations.** Port the logic in `pipeline.build_silver` to Dataflows Gen2 or PySpark notebooks. Keep the same column names, so the contracts in `silver_contracts.yml` apply unchanged.
6. **Contracts as a gate.** Run the contract check and the data-quality checks inside the pipeline. A failure stops the run and notifies the owner, as `gate.py` does now.
7. **Gold and semantic model.** Build the gold tables, then a Direct Lake semantic model with the measures defined in `metrics/metrics.yml`. Each measure is defined once.
8. **Reports.** Power BI reports on the semantic model, one per audience. Only after steps 1 to 7 pass.
9. **Governance.** Register the tables in Microsoft Purview with owner, sensitivity and lineage. Mark formula tables as restricted.
10. **Operations.** Monitor the run log daily. Review the data-quality backlog at the Steering Committee each month.

## 4. Effort and order of magnitude

These are estimates for planning, not commitments. They assume a working Fabric tenant and access to one ERP super-user.

- Steps 1–3: about two weeks, most of it waiting on access.
- Steps 4–6 for one domain (ERP orders): about three weeks.
- Steps 7–8 for the first four dashboards: about three weeks.
- Step 9 and the rest of the domains: ongoing.

## 5. What would change my plan

- If the ERP cannot be read directly, the first pipeline becomes a scheduled file export, and the contracts check the files instead.
- If c-tree has no ODBC driver, its data arrives by export as well.
- If Power BI licences are not available, the semantic model still works, but the reports are built on another tool.
