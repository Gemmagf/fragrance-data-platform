# 04 — Findings, caveats and recommendations

Read this first: **the data is simulated.** The planted truths are in `data/_ground_truth/ground_truth.json`. The analyses never read them; the tests compare the analyses with them afterwards. So the useful content here is the method, the decision it supports, and whether the method recovers the truth. It is not a claim about LUZI.

## 1. Headline numbers (simulated, last 12 complete months to Oct 2026)

| Measure | Value | Note |
|---|---|---|
| Revenue | CHF 102.1M | Same order of magnitude as the BRD's USD 100–200M estimate. Coincidence of scale, not calibration. |
| Growth vs prior 12 months | +53% | Growing book: the simulated customer base accumulates compounds from 2023. |
| Gross margin (standard cost) | 44.0% | Formula cost at order-month RM prices. |
| Brief-to-win rate (LTM) | 27.7% | Decided briefs only. |
| Top-10 customer share | 43% | Concentration is high for 60 accounts. |
| Circular revenue share | 9.2% | |
| Single-source RMs | 12 of 60 | 20% of the raw-material master. |

## 2. Analysis results and how they compare with the truth

### 2.1 Price elasticity by tier (BR-03)

| Tier | Estimated elasticity | 95% CI | Planted truth | Within CI? |
|---|---|---|---|---|
| A | −0.55 | −0.93 to −0.17 | −0.6 | Yes |
| B | −1.11 | −1.32 to −0.89 | −1.1 | Yes |
| C | −1.66 | −2.07 to −1.26 | −1.6 | Yes |

Method: log(quantity) on log(unit price), with compound and month fixed effects, estimated separately per tier. Price variation comes from each account's list-price increases, which are not chosen by the volume, so the estimate is not driven by reverse causality.

**Reading for the CFO:** tier A is the least price-sensitive segment, so it gives most of the margin gain per point of price. Tier C is the most price-sensitive. The CI for tier A is wide, so the first move should be a small test in tier A and a measured read-out.

### 2.2 Repricing scenario (+4% list price, last 12 months)

| Tier | Gross-margin uplift | Uplift, bps of tier revenue |
|---|---|---|
| A | CHF 0.91M | +299 |
| B | CHF 1.10M | +195 |
| C | CHF 0.14M | +90 |
| **Total** | **CHF 2.15M** | **+211** |

The BRD target is +50 bps through selective repricing. A blanket 4% gives +211 bps **before churn**. The gap is a reason to target, not a reason to be pleased. Once churn is modelled (using the flight-risk early-warning in BRD use case 7, not built here), the uplift will shrink, and tier C is where that risk concentrates.

### 2.3 Brief-to-win drivers (BR-02)

Logit on decided briefs (n = 1,264). Each row is a planted driver.

| Driver | Odds ratio | 95% CI on logit | Planted | Result |
|---|---|---|---|---|
| Perfumer specialises in the brief's family | 2.78 | 0.75 to 1.29 | +0.90 | Recovered (strong) |
| Quote above target, per +1% | 0.92 (≈ −0.083 logit) | −0.110 to −0.057 | −0.060 | Recovered; the point estimate is a bit larger than the truth, but the CI contains it |
| Customer tier A | 1.65 | 0.18 to 0.83 | +0.30 | Recovered |
| Response days beyond 2 (per day) | 0.89 | −0.33 to +0.10 | −0.20 | Right direction, **not significant** (p = 0.29) |
| Sample rounds beyond 4 (per round) | 0.90 | −0.26 to +0.04 | −0.25 | Right direction, **not significant** (p = 0.16) |

**What to take from it:** the two levers the BRD most wants to move (response time and sample rounds) have the right sign but this sample cannot prove them. That is a real finding about the method: with about 1,300 decided briefs and this spread, the effect of a day of response time is too small to pin down. The proper next step is to collect the reason codes and response times for every brief (not 2% missing) and to test the response-time target on a subset, rather than to claim the lever works.

Two patterns are worth a question but are not in the planted model: the Woody family has a 20% win rate against about 30% overall (n = 160), and tier A has a 38% win rate. The Woody gap might be noise. It should be checked with the perfumers before anyone acts on it.

### 2.4 Cycle time (BR-02, use case 6)

| Stage | Median days | Share of median total |
|---|---|---|
| Brief received → first sample | 1 | 1% |
| Sampling rounds | 13 | 18% |
| Customer decision | 18 | 25% |
| Decision → first shipment (won only) | 40 | 56% |

**Caveat:** the simulator sets these durations, so this table shows that the method can split cycle time into stages. It does not show that LUZI's shipping lag is 40 days. The real version of this table needs the ERP shipment dates, which the BRD notes are not yet in the platform.

### 2.5 Raw-material risk and supplier stress (BR-04)

- 12 of 60 raw materials are single-source. The biggest by revenue exposed is a synthetic aroma chemical (RM-033) used in about 420 formulas. Exposure is not additive: one order counts for every raw material in its formula.
- The supplier with the biggest 8-week revenue at risk (SUP-02) covers three single-source naturals. Its 8-week stop would put about CHF 6.4M of LTM revenue at risk.

**Recommendation:** start the second-source qualification with the top three suppliers in the stress table, and with any single-source RM whose exposure is above CHF 1M. Qualification is a COO decision with R&D; the analysis only ranks.

### 2.6 IFRA regulatory impact (BR-05)

- **Current compliance:** 148 formulas already exceed the limit on at least one restricted raw material (each formula appears once in the breach table). This is in the simulation by design: restricted materials appear as controlled traces, sometimes above the limit. The point of the page is that the number is visible and owned, not that the simulated number matters.
- **What-if:** halving the cap on one restricted RM breaches 38 formulas, with about CHF 1.3M of LTM revenue at risk and 23 same-type substitution candidates.

The engine gives a list and a revenue number in minutes. The perfumer still decides each substitution. Substitution candidates are counted by raw-material type only; the real check needs odour and performance data that the case does not have.

### 2.7 Sustainability (BR-06)

- **Circular premium:** 6.0% (95% CI 5.9% to 6.2%), against the planted 6%.
- **Method lesson:** a first version with month effects only gave 5.4%, outside the CI. The gap comes from each account's list-price increases, which were correlated with the timing of circular orders. Adding customer fixed effects fixed it. This is a useful example for the write-up: the first model was wrong, and the test suite caught it.
- **Disclosure turnaround:** median 4–5 days per request, and 12–26% of requests answered within 2 days each quarter. The BRD's −70% target means about 1.2 days. The baseline is in the dashboard; the improvement needs a process change, not a dashboard.

## 3. Data quality

The silver layer cleans every planted issue, and the DQ report shows the counts before and after:

| Issue | Raw count | After cleaning |
|---|---|---|
| Duplicate brief rows | 28 | 0 |
| CRM keys with stray whitespace or lower case | 44 | 0 |
| Brief outcome labels such as "WON " | 97 | 0 |
| Formula RM codes in lower case | 326 | 0 |
| Customer names in inconsistent case | 2 | 0 |
| Briefs with no response time | 67 | 67 (kept as null, excluded from the response model) |
| Orders with no unit price | 29 | 29 (kept as null, excluded from revenue) |
| Returns (negative quantity) | 28 | 28 (flagged, excluded from the elasticity model) |
| Secondary ERP accounts for the same customer | 3 | 3 (kept out of joins, flagged to Sales Ops) |

The rows still flagged after cleaning are not hidden. They are the data steward's backlog.

## 4. Caveats

1. **Simulated world.** The logic is planted; the method is what is being tested.
2. **Small samples for the operational levers.** Response time and sample rounds do not reach significance. Do not present them as proven.
3. **No churn, competitor response or cannibalisation** in the repricing scenario.
4. **Standard cost, not actual cost.** Overheads, freight and yield are out of scope.
5. **Exposure figures are not additive.**
6. **Cycle-time stages are set by the simulator.**

## 5. Recommendations for the first 90 days

These match BRD §18, scaled to this case. They are the things I would test first in the real business, not decisions.

1. **Interview and verify** (the five points in `01_role_fit_analysis.md`, §4).
2. **Fix the brief record first.** Response time, the reason for each loss and the decision date are the inputs to the most valuable question (win rate). Make them mandatory in the CRM before building anything else.
3. **Pilot repricing in tier A** on a subset of accounts, with a holdout, before any blanket move. Measure churn explicitly.
4. **Qualify second sources** for the top three single-source suppliers, starting with the revenue-at-risk table.
5. **Put the IFRA what-if in the regulatory team's hands** with a named perfumer reviewer, and time one real amendment against the target of days rather than weeks.
6. **Measure adoption:** weekly active users on each page, reviewed at the Steering Committee. Archive pages unused for three months.
