# 01 — Role fit: Data Engineer (Microsoft Fabric)

Source: the Data Engineer posting for a Microsoft Fabric role (100%), with pipelines from Abacus / c-tree, MS SQL Server and MySQL.

## 1. What the role asks for

| # | Responsibility |
|---|---|
| R1 | Build and maintain the central data platform on Microsoft Fabric and OneLake |
| R2 | Build pipelines from Abacus / c-tree, MS SQL Server and MySQL |
| R3 | ETL / ELT processes and the medallion architecture (bronze, silver, gold) |
| R4 | Semantic models and Power BI reports |
| R5 | Work with business teams and contribute to data governance |

## 2. Coverage

| Responsibility | Status | Evidence | Gap |
|---|---|---|---|
| R1 | Partly built | Three-layer platform, one repeatable build, run log; Fabric plan in `06` | Not deployed to Fabric |
| R2 | Partly built | Connectors for SQL Server, MySQL, c-tree; load log per table | Not tested against live servers |
| R3 | Built | Medallion pipeline, 22 automated tests | Python, not yet Fabric notebooks |
| R4 | Partly built | Metrics catalogue; gold tables feed the dashboards | No Power BI semantic model yet |
| R5 | Partly built | Data contracts, quality gate, data-quality report, run log | No Purview catalogue or access control |

## 3. Experience that supports the role

- Refactored production Python data pipelines for scalability, testing and deployment readiness.
- Led the vision and delivery of a risk data-quality product and a statistical validation engine.
- Led a Tableau-to-Power-BI migration across a risk function.
- Strong in SQL and Python; brought many data sources together into one set of dashboards.

## 4. What I would verify first

1. Which Abacus version runs at LUZI, and how it can be read (ODBC, export or API).
2. Whether c-tree has a driver I can use from Fabric or from a gateway.
3. Which Fabric capacity and licences are available, and who owns the workspace.
4. The refresh needs of each domain, which decide whether the first pipelines run daily or nightly.
