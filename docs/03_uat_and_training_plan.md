# 03 — UAT plan, training and support

This document is the test and training plan for the data platform and the dashboards built on it. The automated part of the testing is in `tests/test_case.py`; the business part is the UAT script below.

## 1. Test levels

| Level | What it checks | Where | Who |
|---|---|---|---|
| Data contract | Keys unique, labels valid, formulas balance, joins resolve | `tests/test_case.py` | Data engineer |
| Recovery of truth | Analyses recover the planted effects within their CI | `tests/test_case.py` | Data engineer |
| Data quality | Planted dirt is detected; high-severity rules pass after cleaning | `gold/dq_report.csv` | Data steward |
| UAT | Business users confirm each page answers its question | Section 3 below | Named business owner per page |
| Dashboard build and render | Production build passes; every page renders with no console errors | `npm run build` and browser check (see §4) | Data engineer |

## 2. Automated test results (current run)

- 15 of 15 tests pass.
- Data contract and DQ tests: 9.
- Recovery-of-truth tests: 6 (elasticity per tier, circular premium, win-driver sign and CI, single-source flags, IFRA breach detection, repricing bounds).

## 3. UAT script

Each test case lists the user story it proves, the step, the expected result and the acceptance criteria it covers. Failures are logged with the page, the screenshot and the expected value. A test passes only if the expected result is shown on screen.

| ID | Story | Step | Expected result | Covers |
|---|---|---|---|---|
| UAT-01 | US-01 | Open page 1 | Five KPI tiles show revenue, margin, win rate, top-10 share, circular share | AC-01.1 |
| UAT-02 | US-01 | Read the caption under the KPI tiles | The margin method and the simulation status are stated | AC-01.2, AC-01.4 |
| UAT-03 | US-02 | Open page 2, choose "Tier" in the cut selector | Tier A has the highest win rate; tier C the lowest | AC-02.1 |
| UAT-04 | US-02 | Read the driver chart | Family match and tier A point right (help); a driver whose CI crosses zero is visibly uncertain | AC-02.2 |
| UAT-05 | US-02 | Open page 6 | Duplicate brief rows and label variants appear with raw counts and cleaned counts | AC-02.3, AC-02.4, AC-06.1 |
| UAT-06 | US-03 | Open page 3 | Elasticity is shown by tier with CI; tier C more elastic than tier A | AC-03.1 |
| UAT-07 | US-03 | Move the price slider to 4% | Uplift in CHF and bps by tier updates; warning about churn is visible | AC-03.2, AC-03.3 |
| UAT-08 | US-04 | Open page 4 | Single-source table is sorted by revenue exposed; caption says not additive | AC-04.1, AC-04.2 |
| UAT-09 | US-04 | Pick a restricted RM, drag the cap to half its limit | Breaching formulas, revenue at risk and substitution count update | AC-04.3 |
| UAT-10 | US-04 | Read the reformulation caption | Human sign-off is stated; no automatic submission | AC-04.4 |
| UAT-11 | US-05 | Open page 5 | Circular premium shown with CI; CO2e per compound in the scatter | AC-05.1, AC-05.2 |
| UAT-12 | US-05 | Read the disclosure chart | Median lead time by quarter with the −70% target in the title | AC-05.3 |
| UAT-13 | US-06 | Open page 6 | No high-severity row shows failures after cleaning, or the row says why | AC-06.2 |

### Defect severity

- **Blocker**: a number on a page is wrong, or a page raises an error.
- **Major**: a number is right but a caption or label would lead a reader to a wrong conclusion.
- **Minor**: layout, wording, sort order.

A release needs no open blockers and no open majors in the pages each owner uses.

### Sign-off

| Page | Business owner | Date | Result (pass / pass with notes / fail) | Notes |
|---|---|---|---|---|
| 1. Executive one-page | CFO | | | |
| 2. Brief-to-win | CCO | | | |
| 3. Margin & pricing | CFO | | | |
| 4. Raw-material risk & IFRA | COO, Head of Regulatory | | | |
| 5. Sustainability ledger | Head of Sustainability | | | |
| 6. Data quality | Head of BI | | | |

## 4. Dashboard build and render check

The dashboard is a Next.js static site in `web/`. The check has two parts:

```bash
cd web
npm install
npm run typecheck      # TypeScript, no errors expected
npm run build          # static export to web/out, all six routes prerendered
npx next start        # not used: the export is static; serve web/out with any static server
```

Then open each route (`/`, `/win/`, `/pricing/`, `/risk/`, `/sustainability/`, `/data-quality/`) and confirm the browser console shows no errors. This was done for this case: all six pages render, and the figures on the pages match `data/gold/findings.json`.

## 5. Training plan

Training is by role, not by feature. Each session has one job to be done.

| Audience | Session | Length | Job to be done | Materials |
|---|---|---|---|---|
| CFO, COO, CCO (leaders) | "How to read the one-page and the margin scenario" | 30 min | Decide with the right caveats | Captions, pages 1 and 3 |
| Sales and commercial team | "Why do we win?" | 45 min | Change response habits | Page 2, response-time target |
| Perfumers and R&D | "Find a similar formula and check the regulatory impact" | 45 min, with 2–3 senior perfumers | Co-design the formula search and the IFRA page | Page 4 |
| Procurement | "Single-source and supplier stress" | 30 min | Pick the next second-source qualification | Page 4 tables |
| Sustainability team | "Answer a disclosure in two clicks" | 30 min | Use the ledger for customer requests | Page 5 |
| Data stewards | "Clear the high-severity list" | 60 min | Own the DQ backlog | Page 6 |

## 6. Support model

- **Questions**: a shared channel, answered within one working day. Answers that repeat twice become a caption or a training item.
- **Defects**: logged with the UAT ID, page, screenshot and expected value. Triage weekly with the business owner.
- **Adoption**: weekly active users per page, reviewed at the monthly Steering Committee (BRD §15). A page unused for three months is archived (BRD §10).
- **Change**: any new metric needs a KPI dictionary entry and an owner before it appears on a page.
