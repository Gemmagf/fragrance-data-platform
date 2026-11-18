# 02 — Business requirements, user stories and KPI dictionary

Scope: the Phase 0–1 slice of the BRD roadmap (BRD §14), plus the two analyses that carry the most commercial weight (win rate and price). All figures are simulated.

## 1. Business requirements

| ID | Requirement | Owner | BRD reference |
|---|---|---|---|
| BR-01 | One agreed version of revenue, gross margin and win rate across commercial and finance | CFO | §10 Dashboard 1, §13 master data |
| BR-02 | Explain why briefs are won or lost, with a structured reason code on every loss | CCO | §10 Dashboard 3, §11 use case 1 |
| BR-03 | Know which customer tiers can absorb a price move, and which cannot | CFO / CCO | §11 use case 4 |
| BR-04 | Identify single-source raw materials and the revenue they expose | COO | §11 use case 3 and 8 |
| BR-05 | Simulate a regulatory change (IFRA cap) before it lands | Head of Regulatory | §11 use case 10, §12 D |
| BR-06 | Answer a customer's sustainability question from source data | Head of Sustainability | §10 Dashboard 12 |
| BR-07 | Every number carries a data-quality status | Head of BI | §13 data quality, §15 platform health |

## 2. User stories and acceptance criteria

### US-01 — Executive one-page (BR-01)
*As the CFO, I want revenue, gross margin, win rate and concentration on one page, so that I can review the business in five minutes.*

- AC-01.1: Revenue is shown for the last 12 complete months, with growth against the prior 12 months.
- AC-01.2: Gross margin uses standard cost per kg from the formula at the order month. The method is written on the page.
- AC-01.3: Returns (negative quantity) and orders without a price are excluded from revenue and margin, and the exclusion is in the DQ report.
- AC-01.4: The page states that it is a simulation until connected to real sources.

### US-02 — Win-rate explanation (BR-02)
*As the CCO, I want to see which levers are associated with winning, so that I can coach the team on what they control.*

- AC-02.1: Win rate is computed on decided briefs only (won + lost). Open and no-decision briefs are excluded and counted separately.
- AC-02.2: Each driver shows its effect with a 95% CI. A driver whose CI crosses zero is labelled as not yet proven.
- AC-02.3: Duplicate brief rows from the CRM export are removed before counting; the removed count appears in the DQ report.
- AC-02.4: Brief outcome labels such as "WON " and "won" are normalised to one value.

### US-03 — Targeted repricing (BR-03)
*As the CFO, I want to compare a list-price move across tiers, so that I can approve targeted rather than blanket increases.*

- AC-03.1: Elasticity is estimated per tier, controlling for compound and month, with a 95% CI.
- AC-03.2: The scenario shows gross-margin uplift in CHF and in basis points of revenue, by tier.
- AC-03.3: The scenario states that churn and competitor response are not modelled.

### US-04 — Raw-material risk and IFRA what-if (BR-04, BR-05)
*As the COO, I want to see which raw materials are single-source and what a regulatory cap would break, so that I can prioritise second-source qualification.*

- AC-04.1: A raw material is single-source when no qualified second supplier is recorded.
- AC-04.2: Revenue exposed is shown per raw material and labelled as not additive, because one order counts for every raw material in its formula.
- AC-04.3: The IFRA what-if takes a limited raw material and a new cap, and returns formulas that breach, revenue at risk and the number of substitution candidates of the same type.
- AC-04.4: The engine ranks and never submits a reformulation. Perfumer sign-off is recorded as a required step.

### US-05 — Sustainability answer (BR-06)
*As the Head of Sustainability, I want CO2e per kg and naturals share for every compound, so that I can answer a customer's disclosure request in one place.*

- AC-05.1: CO2e per kg is the formula-weighted sum of raw-material factors.
- AC-05.2: Circular compounds are flagged, and the observed price premium is shown with its CI.
- AC-05.3: Median turnaround for disclosure requests is shown by quarter, with the baseline before the target (-70%).

### US-06 — Trust in the numbers (BR-07)
*As the Head of BI, I want every table's data-quality status visible, so that no one takes a dirty number to the Steering Committee.*

- AC-06.1: Each rule shows failures in the raw export and failures after cleaning.
- AC-06.2: Any high-severity rule still failing after cleaning blocks a release (enforced by a test).
- AC-06.3: Planted issues in the simulated export are detected by the DQ report (test).

## 3. KPI dictionary

| KPI | Definition | Grain | Owner | Refresh | Primary action |
|---|---|---|---|---|---|
| Revenue (LTM) | Σ qty_kg × unit price, orders with qty > 0 and price present, last 12 complete months | Month | CFO | Daily | Review growth against prior year |
| Gross margin % | Σ (revenue − qty × standard cost/kg) ÷ Σ revenue. Standard cost = Σ pct × RM price in the order month | Month | CFO | Daily | Trigger price review if margin falls |
| Brief-to-win rate | Won ÷ (won + lost), briefs received in the period | Brief, quarter | CCO | Weekly | Coach on response time and sample rounds |
| Response time | Hours from brief receipt to first sample | Brief | CCO | Weekly | Set a 48-hour response target |
| Elasticity by tier | Coefficient on log unit price in log(qty) ~ log(price) + compound FE + month FE | Tier | CFO | Quarterly | Approve targeted price move |
| Single-source RM count | RMs with no qualified second supplier | RM | COO | Monthly | Qualify second source above CHF 1M exposure |
| Supplier outage exposure | Revenue of compounds whose single-source RMs come from one supplier, × weeks ÷ 52 | Supplier | COO | Monthly | Build a playbook for top 3 suppliers |
| IFRA breach count | Formula lines where pct > current limit | Formula | Head of Regulatory | Monthly | Reformulate with perfumer sign-off |
| CO2e per kg | Σ pct × RM CO2e factor ÷ 100 | Compound | Head of Sustainability | Monthly | Answer disclosure requests |
| Circular premium | exp(coef on is_circular in log(unit/quote) ~ is_circular + customer FE + month FE) − 1 | Compound | CFO / CCO | Quarterly | Decide sustainability pricing |
| Disclosure lead time | Days from request to delivery | Request | Head of Sustainability | Monthly | Target −70% vs baseline |
| DQ failures (high) | Count of high-severity checks failing after cleaning | Table | Head of BI | Every load | Steward action before release |

## 4. Process: brief to shipment (as the case models it)

```
Brief received (CRM)
  → first sample (perfumer, formulation system)
  → sampling rounds (iterations)
  → submitted to customer
  → customer decision (won / lost / no decision)
  → shipped (ERP)
  → monthly orders
```

Stage durations are measured from dates on the brief record. Where a date is missing, the stage is excluded and counted in `n`, not imputed.
