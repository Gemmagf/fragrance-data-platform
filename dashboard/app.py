"""LUZI-style Data & Analytics dashboard (SIMULATED data).

Pages follow the BRD's dashboard suite. Every page states its owner, refresh SLA
and the primary action it should drive: no dashboard without an owner, a
refresh SLA and a primary action (BRD section 10).

Run:  PYTHONPATH=src streamlit run dashboard/app.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import pandas as pd
import plotly.express as px
import streamlit as st

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from luzi_case import analyses as A  # noqa: E402
from luzi_case import config as C  # noqa: E402

st.set_page_config(page_title="LUZI-style Data & Analytics (simulated)", layout="wide")
GOLD, SILVER = C.GOLD_DIR, C.SILVER_DIR


@st.cache_data
def gold(name: str) -> pd.DataFrame:
    return pd.read_parquet(GOLD / f"{name}.parquet")


@st.cache_data
def silver(name: str) -> pd.DataFrame:
    return pd.read_parquet(SILVER / f"{name}.parquet")


@st.cache_data
def findings() -> dict:
    with open(GOLD / "findings.json") as fh:
        return json.load(fh)


def chf(x: float) -> str:
    return f"CHF {x / 1e6:,.1f}M"


def header(title: str, owner: str, sla: str, action: str) -> None:
    st.title(title)
    st.caption("SIMULATED data. Not LUZI AG's real systems or figures.")
    c1, c2, c3 = st.columns(3)
    c1.markdown(f"**Owner:** {owner}")
    c2.markdown(f"**Refresh SLA:** {sla}")
    c3.markdown(f"**Primary action:** {action}")
    st.divider()


PAGES = [
    "1. Executive one-page",
    "2. Brief-to-win",
    "3. Margin & pricing",
    "4. Raw-material risk & IFRA",
    "5. Sustainability ledger",
    "6. Data quality",
]
page = st.sidebar.radio("Dashboard", PAGES)
st.sidebar.markdown("---")
st.sidebar.info("Simulated world: 60 customers, 1,400 briefs, 60 raw materials, "
                "2023-2026. Planted truths are used only in the test suite.")

f = findings()

# ----------------------------------------------------------------------------
if page == PAGES[0]:
    header("Executive one-page", "CFO (Finance)", "daily 06:00", "Decide where to focus the next quarter's commercial push")
    e = f["exec"]
    k1, k2, k3, k4, k5 = st.columns(5)
    k1.metric("Revenue, last 12 months", chf(e["ltm_revenue_chf"]),
              f"{e['revenue_growth_pct']:+.0%} vs prior 12m")
    k2.metric("Gross margin (standard cost)", f"{e['ltm_gross_margin_pct']:.1%}")
    k3.metric("Brief-to-win rate (LTM)", f"{e['ltm_win_rate']:.1%}")
    k4.metric("Top-10 customer share", f"{e['top10_customer_share']:.0%}")
    k5.metric("Circular revenue share", f"{e['circular_revenue_share']:.1%}")

    monthly = gold("exec_monthly_revenue")
    monthly["month"] = pd.PeriodIndex(monthly.month, freq="M").to_timestamp()
    monthly = monthly.sort_values("month")
    fig = px.bar(monthly, x="month", y=["revenue_chf", "gross_margin_chf"], barmode="group",
                 labels={"value": "CHF", "month": ""}, title="Monthly revenue and gross margin")
    st.plotly_chart(fig, use_container_width=True)
    st.info("Read: revenue is roughly 1 year into a growing book. Compare the last 12 months with "
            "the prior 12 months, not with a plan (no plan data in this case).")

# ----------------------------------------------------------------------------
elif page == PAGES[1]:
    header("Brief-to-win", "Head of Commercial (CCO)", "weekly, Monday 07:00",
           "Coach the team on the levers that move win rate (response time, sample rounds, price)")
    fun = gold("analysis_funnel_quarter")
    fig = px.line(fun, x="received_quarter", y="win_rate_of_decided", markers=True,
                  title="Win rate of decided briefs, by quarter received")
    fig.update_yaxes(tickformat=".0%")
    st.plotly_chart(fig, use_container_width=True)

    dims = gold("analysis_win_by_dimension")
    dim = st.selectbox("Cut by", ["segment", "tier", "region", "olfactive_family"])
    d = dims[dims.dimension == dim].sort_values("win_rate")
    st.plotly_chart(px.bar(d, x="win_rate", y="value", orientation="h", text="decided",
                           title=f"Win rate by {dim} (label = decided briefs)")
                    .update_xaxes(tickformat=".0%"), use_container_width=True)

    st.subheader("What drives a win? (logit, decided briefs)")
    w = gold("analysis_win_drivers").copy()
    w["label"] = w.term.map({
        "family_match": "Perfumer specialises in brief family",
        "days_over_2": "Response days beyond 2 (per day)",
        "iter_over_4": "Sample rounds beyond 4 (per round)",
        "price_pct_over_target": "Quote above target (per 100%)",
        "tier_A": "Tier A customer",
        "tier_C": "Tier C customer",
    })
    st.plotly_chart(px.scatter(w, x="logit_coef", y="label", error_x=w.ci_high - w.logit_coef,
                               error_x_minus=w.logit_coef - w.ci_low,
                               title="Effect on win odds with 95% CI (right = helps)")
                    .add_vline(x=0, line_dash="dash"), use_container_width=True)
    st.caption("Reading: a coefficient whose CI crosses zero is not yet proven by this sample.")

    st.subheader("Where does the cycle time go?")
    ct = gold("analysis_cycle_time")
    st.dataframe(ct.style.format({"share_of_median_days": "{:.0%}"}), use_container_width=True)

# ----------------------------------------------------------------------------
elif page == PAGES[2]:
    header("Margin & pricing", "CFO (Finance)", "weekly, Monday 07:00",
           "Approve a targeted price move by tier, not a blanket increase")
    el = gold("analysis_elasticity_tier")
    st.subheader("Price elasticity of volume, by customer tier")
    st.plotly_chart(px.bar(el, x="tier", y="elasticity", error_y=el.ci_high - el.elasticity,
                           error_y_minus=el.elasticity - el.ci_low,
                           title="Estimated elasticity (95% CI). Closer to 0 = less price-sensitive"),
                    use_container_width=True)

    st.subheader("Repricing scenario (last 12 months, tier-level elasticities)")
    pct = st.slider("List-price increase", 0.0, 0.10, 0.04, 0.005, format="%.1f%%")
    rep = f["repricing"]
    st.caption(f"Model: volume scales with (1+p)^elasticity; standard cost per kg unchanged. "
               f"Baseline LTM gross margin {rep['ltm_gross_margin_pct']:.1%}.")
    tiers = gold("analysis_repricing_by_tier")
    e = dict(zip(el.tier, el.elasticity))
    ltm = gold("fct_orders")
    ltm = ltm[(ltm.order_date >= A.LTM_START) & (ltm.order_date <= A.REF_END)]
    cust = silver("customers")
    ltm = ltm.merge(cust[["crm_id", "tier"]], on="crm_id", how="left").dropna(subset=["tier"])
    ltm["e"] = ltm.tier.map(e)
    ltm["new_qty"] = ltm.qty_kg * (1 + pct) ** ltm.e
    ltm["new_gm"] = ltm.new_qty * ltm.unit_price_chf_kg * (1 + pct) - ltm.new_qty * ltm.std_cost_chf_kg
    uplift = (ltm.new_gm - ltm.gross_margin_chf).groupby(ltm.tier).sum()
    rev = ltm.groupby("tier").revenue_chf.sum()
    table = pd.DataFrame({"gm_uplift_chf": uplift, "revenue_ltm_chf": rev})
    table["uplift_bps_of_revenue"] = 1e4 * table.gm_uplift_chf / table.revenue_ltm_chf
    table["gm_uplift_chf"] = table.gm_uplift_chf.map(chf)
    table["revenue_ltm_chf"] = table.revenue_ltm_chf.map(chf)
    st.dataframe(table.round(1), use_container_width=True)
    total = (ltm.new_gm - ltm.gross_margin_chf).sum()
    st.metric("Total gross-margin uplift", chf(total),
              f"{1e4 * total / ltm.revenue_chf.sum():.0f} bps of revenue (no churn modelled)")
    st.warning("No churn or competitor response is modelled. The BRD target (+50 bps) is for "
               "selective repricing; a blanket move ignores flight risk in tier C.")

# ----------------------------------------------------------------------------
elif page == PAGES[3]:
    header("Raw-material risk & IFRA", "COO (Operations) with Head of Regulatory",
           "monthly, 1st working day", "Qualify a second source for every single-source RM with >CHF 1M exposure")
    risk = gold("analysis_rm_risk")
    st.subheader("Single-source raw materials, ranked by LTM revenue exposed")
    show = risk[risk.single_source][["rm_code", "rm_name", "rm_type", "origin", "climate_exposed",
                                     "formulas_using", "ltm_revenue_exposed_chf",
                                     "price_volatility_monthly"]]
    st.dataframe(show.style.format({"ltm_revenue_exposed_chf": "{:,.0f}",
                                    "price_volatility_monthly": "{:.1%}"}), use_container_width=True)
    st.caption("Revenue exposed is not additive: one order counts for every RM in its formula.")

    st.subheader("Supplier outage stress test (8 weeks)")
    st.dataframe(gold("analysis_supplier_stress").head(10).style.format(
        {"revenue_at_risk_8w_chf": "{:,.0f}", "revenue_exposed_ltm_chf": "{:,.0f}"}),
        use_container_width=True)

    st.subheader("IFRA amendment what-if")
    rms = silver("raw_materials")
    limited = rms[rms.ifra_limit_pct.notna()]
    code = st.selectbox("Restricted RM", limited.rm_code + " | " + limited.rm_name)
    rm_code = code.split(" | ")[0]
    lim = float(limited.loc[limited.rm_code == rm_code, "ifra_limit_pct"].iloc[0])
    new = st.slider("New cap (% of formula weight)", 0.0, float(max(lim * 2, 0.5)),
                    value=lim / 2, step=0.01)
    lines = silver("formula_lines")
    fct = gold("fct_orders")
    res = A.ifra_amendment_impact(lines, rms, fct, rm_code, new_limit_pct=new)
    a, b, c = st.columns(3)
    a.metric("Formulas that breach the new cap", f"{res['formulas_breaching']} of {res['formulas_in_use']}")
    b.metric("LTM revenue at risk", chf(res["revenue_at_risk_ltm_chf"]))
    c.metric("Substitution candidates (same RM type)", res["substitution_candidates"])
    st.dataframe(res["breaching_formulas"].head(25), use_container_width=True)
    st.caption("Human-in-the-loop: a perfumer signs off every reformulation. The engine ranks, it never submits.")

# ----------------------------------------------------------------------------
elif page == PAGES[4]:
    header("Sustainability ledger", "Head of Sustainability", "monthly",
           "Answer a customer's CO2e / naturals request from source in under 2 clicks")
    circ = f["circular_premium"]
    a, b, c = st.columns(3)
    a.metric("Circular price premium (observed)", f"{circ['premium_pct']:.1%}",
             f"95% CI {circ['premium_ci_low']:.1%} to {circ['premium_ci_high']:.1%}")
    led = gold("analysis_sustainability_ledger")
    b.metric("Median CO2e per kg (LTM revenue-weighted)",
             f"{led.co2e_kg_per_kg_compound.median():.1f} kg")
    c.metric("Avg naturals share of formula", f"{led.naturals_pct.mean():.1f}%")
    fig = px.scatter(led, x="co2e_kg_per_kg_compound", y="ltm_avg_price_chf_kg",
                     color="is_circular", size="ltm_revenue_chf", hover_name="compound_id",
                     title="CO2e per kg vs realised price, per compound (LTM)")
    st.plotly_chart(fig, use_container_width=True)

    sla = gold("analysis_sust_sla")
    st.subheader("Customer sustainability-disclosure turnaround")
    st.plotly_chart(px.bar(sla, x="quarter", y="median_lead_time_days",
                           title="Median days to answer a disclosure request (target -70%)"),
                    use_container_width=True)

# ----------------------------------------------------------------------------
else:
    header("Data quality", "Domain data stewards; monitored by Head of BI", "every load",
           "Clear the high-severity items before a number goes to the Steering Committee")
    dq = pd.read_csv(GOLD / "dq_report.csv")
    st.dataframe(dq, use_container_width=True)
    st.caption("failures_raw = what the source sent. failures_after_cleaning = what is still wrong "
               "after the silver rules. Anything left here is a steward action, not a silent fix.")
