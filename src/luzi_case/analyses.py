"""Analyses that answer the BRD's priority questions.

Each function takes silver/gold tables and returns a tidy DataFrame (or a dict
of KPIs). None of them read the ground truth: tests compare their output with
the planted truth afterwards.

Map to the BRD (section 11, use cases):
  brief_win_drivers        -> #1 Brief-to-win analysis
  cycle_time_decomposition -> #6 Lead-time decomposition
  price_elasticity_by_tier -> #4 Price elasticity by customer tier
  repricing_scenario       -> #4 (target +50 bps gross margin)
  rm_single_source_risk    -> #3 / #8 Raw-material risk and supplier concentration
  supplier_outage_stress   -> #8 Supplier concentration stress test
  ifra_amendment_impact    -> #10 IFRA regulatory impact simulation
  circular_price_premium   -> #9 Sustainability premium analysis
  sustainability_ledger    -> Dashboard 12
  exec_one_page            -> Dashboard 1
"""

from __future__ import annotations

import numpy as np
import pandas as pd
import statsmodels.api as sm
import statsmodels.formula.api as smf

REF_END = pd.Timestamp("2026-10-31")
LTM_START = REF_END - pd.DateOffset(months=12) + pd.Timedelta(days=1)   # 2025-11-01
PRIOR_START = LTM_START - pd.DateOffset(months=12)                       # 2024-11-01


def _ltm(df: pd.DataFrame, col: str = "order_date") -> pd.DataFrame:
    return df[(df[col] >= LTM_START) & (df[col] <= REF_END)]


# ----------------------------------------------------------- brief to win ----
def brief_funnel_by_quarter(briefs: pd.DataFrame) -> pd.DataFrame:
    g = briefs.groupby("received_quarter")
    out = pd.DataFrame({
        "briefs_received": g.size(),
        "decided": g.is_decided.sum(),
        "won": g.is_won.sum(),
        "open_or_no_decision": g.size() - g.is_decided.sum(),
        "median_response_hours": g.response_hours.median(),
    }).reset_index()
    out["win_rate_of_decided"] = out.won / out.decided
    return out


def win_rate_by_dimension(briefs: pd.DataFrame, customers: pd.DataFrame) -> pd.DataFrame:
    b = briefs.merge(customers[["crm_id", "tier", "region"]], on="crm_id", how="left")
    d = b[b.is_decided == 1]
    frames = []
    for dim in ["segment", "tier", "region", "olfactive_family"]:
        t = d.groupby(dim).agg(decided=("is_won", "size"), won=("is_won", "sum")).reset_index()
        t = t.rename(columns={dim: "value"})
        t.insert(0, "dimension", dim)
        frames.append(t)
    out = pd.concat(frames, ignore_index=True)
    out["win_rate"] = out.won / out.decided
    return out


def brief_win_drivers(briefs: pd.DataFrame, customers: pd.DataFrame) -> pd.DataFrame:
    """Logit of won (1/0) on controllable and contextual levers, decided briefs only."""
    b = briefs.merge(customers[["crm_id", "tier"]], on="crm_id", how="left")
    d = b[(b.is_decided == 1) & b.response_hours.notna()].copy()
    d["price_pct_over_target"] = d.price_ratio - 1
    d["tier_A"] = (d.tier == "A").astype(int)
    d["tier_C"] = (d.tier == "C").astype(int)
    X = sm.add_constant(d[["family_match", "days_over_2", "iter_over_4",
                           "price_pct_over_target", "tier_A", "tier_C"]].astype(float))
    res = sm.Logit(d.is_won.astype(float), X).fit(disp=0, maxiter=200)
    ci = res.conf_int()
    out = pd.DataFrame({
        "term": res.params.index,
        "logit_coef": res.params.values,
        "ci_low": ci[0].values,
        "ci_high": ci[1].values,
        "p_value": res.pvalues.values,
    })
    out["odds_ratio"] = np.exp(out.logit_coef)
    out["n_decided"] = len(d)
    out = out[out.term != "const"].reset_index(drop=True)
    return out


def cycle_time_decomposition(briefs: pd.DataFrame) -> pd.DataFrame:
    b = briefs.copy()
    stages = {
        "Brief received -> first sample": ("received_date", "first_sample_date"),
        "Sampling rounds (first -> submitted)": ("first_sample_date", "submitted_date"),
        "Customer decision (submitted -> decision)": ("submitted_date", "decision_date"),
        "Ship lead (decision -> shipped, won only)": ("decision_date", "shipped_date"),
    }
    rows = []
    for name, (a, z) in stages.items():
        days = (b[z] - b[a]).dt.days.dropna()
        rows.append(dict(stage=name, n=len(days), median_days=days.median(),
                         p75_days=days.quantile(0.75)))
    out = pd.DataFrame(rows)
    out["share_of_median_days"] = out.median_days / out.median_days.sum()
    return out


# ------------------------------------------------------------ price / volume --
def price_elasticity_by_tier(fct_orders: pd.DataFrame, customers: pd.DataFrame) -> pd.DataFrame:
    """Log-log panel: log(qty) on log(unit price) with compound and month fixed effects,
    estimated separately per customer tier. Returns: returns/ negative quantities
    and missing prices are excluded upstream."""
    o = fct_orders.merge(customers[["crm_id", "tier"]], on="crm_id", how="left")
    o = o[(o.qty_kg > 0) & o.unit_price_chf_kg.notna()].copy()
    o["log_qty"] = np.log(o.qty_kg)
    o["log_price"] = np.log(o.unit_price_chf_kg)
    rows = []
    for tier, g in o.groupby("tier"):
        m = smf.ols("log_qty ~ log_price + C(compound_id) + C(month)", data=g).fit()
        ci = m.conf_int().loc["log_price"]
        rows.append(dict(tier=tier, elasticity=m.params["log_price"], ci_low=ci[0],
                         ci_high=ci[1], n_obs=int(m.nobs), r_squared=m.rsquared))
    return pd.DataFrame(rows).sort_values("tier").reset_index(drop=True)


def repricing_scenario(fct_orders: pd.DataFrame, customers: pd.DataFrame,
                       elasticity: pd.DataFrame, pct: float = 0.04) -> dict:
    """Last-12-month gross-margin effect of a +pct list-price move, applying the
    tier-level elasticity to volume (log-linear demand)."""
    o = _ltm(fct_orders)
    o = o.merge(customers[["crm_id", "tier"]], on="crm_id", how="left")
    e = dict(zip(elasticity.tier, elasticity.elasticity))
    o = o[o.tier.notna()].copy()
    o["e"] = o.tier.map(e)
    o["new_qty"] = o.qty_kg * (1 + pct) ** o.e
    o["new_rev"] = o.new_qty * o.unit_price_chf_kg * (1 + pct)
    o["new_gm"] = o.new_rev - o.new_qty * o.std_cost_chf_kg
    base_rev = o.revenue_chf.sum()
    base_gm = o.gross_margin_chf.sum()
    by_tier = o.groupby("tier").apply(
        lambda g: pd.Series({"gm_uplift_chf": (g.new_gm - g.gross_margin_chf).sum(),
                             "revenue_ltm_chf": g.revenue_chf.sum()}),
        include_groups=False).reset_index()
    by_tier["uplift_bps_of_tier_revenue"] = 1e4 * by_tier.gm_uplift_chf / by_tier.revenue_ltm_chf
    uplift = (o.new_gm - o.gross_margin_chf).sum()
    return dict(
        price_increase_pct=pct,
        ltm_revenue_chf=base_rev,
        ltm_gross_margin_pct=base_gm / base_rev,
        gm_uplift_chf=uplift,
        gm_uplift_bps=1e4 * uplift / base_rev,
        gm_pct_after=(base_gm + uplift) / (base_rev + (o.new_rev - o.revenue_chf).sum()),
        by_tier=by_tier,
    )


# ----------------------------------------------------------- raw materials ----
def rm_single_source_risk(lines: pd.DataFrame, rms: pd.DataFrame, fct_orders: pd.DataFrame,
                          prices: pd.DataFrame) -> pd.DataFrame:
    ltm = _ltm(fct_orders)
    rev_by_formula = ltm.groupby("formula_id").revenue_chf.sum()
    used = lines.groupby("rm_code").agg(formulas_using=("formula_id", "nunique"),
                                        avg_pct_when_used=("pct", "mean")).reset_index()
    vol = prices.sort_values(["rm_code", "month"]).copy()
    vol["ret"] = vol.groupby("rm_code").price_chf_kg.transform(lambda s: np.log(s).diff())
    vol = vol.groupby("rm_code").ret.std().rename("price_volatility_monthly").reset_index()
    out = rms[["rm_code", "rm_name", "rm_type", "origin", "climate_exposed",
               "primary_supplier", "secondary_supplier"]].copy()
    out["single_source"] = out.secondary_supplier.isna()
    out = out.merge(used, on="rm_code", how="left").merge(vol, on="rm_code", how="left")
    exposed = (lines[["formula_id", "rm_code"]].drop_duplicates()
               .assign(rev=lambda d: d.formula_id.map(rev_by_formula).fillna(0))
               .groupby("rm_code").rev.sum().rename("ltm_revenue_exposed_chf").reset_index())
    out = out.merge(exposed, on="rm_code", how="left")
    out["ltm_revenue_exposed_chf"] = out.ltm_revenue_exposed_chf.fillna(0)
    return out.sort_values("ltm_revenue_exposed_chf", ascending=False).reset_index(drop=True)


def formula_supplier_hhi(lines: pd.DataFrame, rms: pd.DataFrame) -> pd.DataFrame:
    """Herfindahl index of a formula's weight across its primary suppliers
    (1.0 = one supplier for everything; ~0 = many)."""
    l = lines.merge(rms[["rm_code", "primary_supplier"]], on="rm_code", how="left")
    w = l.groupby(["formula_id", "primary_supplier"]).pct.sum().reset_index()
    w["share"] = w.pct / w.groupby("formula_id").pct.transform("sum")
    return w.groupby("formula_id").apply(lambda g: (g.share ** 2).sum(),
                                         include_groups=False).rename("supplier_hhi").reset_index()


def supplier_outage_stress(rms: pd.DataFrame, rm_risk: pd.DataFrame,
                           suppliers: pd.DataFrame, weeks: int = 8) -> pd.DataFrame:
    """Revenue exposed if a supplier stops for `weeks`, counting only RMs with no
    qualified second source (dual-sourced RMs are assumed to be switched)."""
    r = rm_risk.copy()
    single = r[r.single_source]
    agg = single.groupby("primary_supplier").agg(
        single_source_rms=("rm_code", "size"),
        revenue_exposed_ltm_chf=("ltm_revenue_exposed_chf", "sum"),
    ).reset_index()
    out = suppliers[["supplier_id", "supplier_name", "country", "category", "otif_pct"]].merge(
        agg, left_on="supplier_id", right_on="primary_supplier", how="left")
    out["single_source_rms"] = out.single_source_rms.fillna(0).astype(int)
    out["revenue_exposed_ltm_chf"] = out.revenue_exposed_ltm_chf.fillna(0)
    out[f"revenue_at_risk_{weeks}w_chf"] = out.revenue_exposed_ltm_chf * weeks / 52
    return out.drop(columns=["primary_supplier"]).sort_values(
        f"revenue_at_risk_{weeks}w_chf", ascending=False).reset_index(drop=True)


def ifra_amendment_impact(lines: pd.DataFrame, rms: pd.DataFrame, fct_orders: pd.DataFrame,
                          rm_code: str, new_limit_pct: float) -> dict:
    """What breaks if `rm_code` is capped at `new_limit_pct` of formula weight."""
    l = lines[lines.rm_code == rm_code]
    breach = l[l.pct > new_limit_pct].copy()
    ltm = _ltm(fct_orders)
    rev = ltm.groupby("formula_id").revenue_chf.sum()
    breach["ltm_revenue_chf"] = breach.formula_id.map(rev).fillna(0)
    rm_type = rms.loc[rms.rm_code == rm_code, "rm_type"].iloc[0]
    candidates = rms[(rms.rm_type == rm_type) & (rms.rm_code != rm_code)].rm_code
    return dict(
        rm_code=rm_code,
        new_limit_pct=new_limit_pct,
        formulas_in_use=int(l.formula_id.nunique()),
        formulas_breaching=int(len(breach)),
        revenue_at_risk_ltm_chf=float(breach.ltm_revenue_chf.sum()),
        avg_excess_pct=float((breach.pct - new_limit_pct).mean()) if len(breach) else 0.0,
        substitution_candidates=int(len(candidates)),
        breaching_formulas=breach.sort_values("ltm_revenue_chf", ascending=False),
    )


def current_ifra_compliance(lines: pd.DataFrame, rms: pd.DataFrame) -> pd.DataFrame:
    l = lines.merge(rms[["rm_code", "ifra_limit_pct", "rm_name"]], on="rm_code")
    l = l[l.ifra_limit_pct.notna()]
    return l[l.pct > l.ifra_limit_pct].assign(excess_pct=lambda d: d.pct - d.ifra_limit_pct)[
        ["formula_id", "rm_code", "rm_name", "pct", "ifra_limit_pct", "excess_pct"]]


# ----------------------------------------------------------- sustainability ---
def circular_price_premium(fct_orders: pd.DataFrame, briefs: pd.DataFrame,
                           formulas: pd.DataFrame) -> dict:
    """Premium realised on orders vs the quoted price, circular vs conventional
    compounds. Customer and month fixed effects absorb each account's list-price
    increases; without the customer effect the estimate is biased down (~5.4% vs 6%)."""
    q = briefs[["formula_id", "quoted_price_chf_kg"]].dropna()
    o = fct_orders.merge(q, on="formula_id", how="left")
    o = o[o.quoted_price_chf_kg.notna()].copy()
    o["log_ratio"] = np.log(o.unit_price_chf_kg / o.quoted_price_chf_kg)
    o["is_circular_i"] = o.is_circular.astype(int)
    m = smf.ols("log_ratio ~ is_circular_i + C(crm_id) + C(month)", data=o).fit()
    coef = m.params["is_circular_i"]
    ci = m.conf_int().loc["is_circular_i"]
    return dict(
        premium_pct=float(np.exp(coef) - 1),
        premium_ci_low=float(np.exp(ci[0]) - 1),
        premium_ci_high=float(np.exp(ci[1]) - 1),
        n_orders_circular=int(o.is_circular_i.sum()),
        n_orders_total=int(len(o)),
    )


def sustainability_ledger(formula_sus: pd.DataFrame, fct_orders: pd.DataFrame) -> pd.DataFrame:
    """One row per compound: CO2e per kg, naturals share, circular share, LTM revenue."""
    ltm = _ltm(fct_orders)
    rev = ltm.groupby(["compound_id", "formula_id", "segment", "is_circular"]).agg(
        ltm_revenue_chf=("revenue_chf", "sum"), ltm_kg=("qty_kg", "sum")).reset_index()
    out = rev.merge(formula_sus, on="formula_id", how="left")
    out["ltm_avg_price_chf_kg"] = out.ltm_revenue_chf / out.ltm_kg
    return out.sort_values("ltm_revenue_chf", ascending=False).reset_index(drop=True)


def sustainability_request_sla(sust: pd.DataFrame) -> pd.DataFrame:
    s = sust.copy()
    s["quarter"] = s.requested_date.dt.to_period("Q").astype(str)
    g = s.groupby("quarter").lead_time_days
    return pd.DataFrame({
        "requests": g.size(),
        "median_lead_time_days": g.median(),
        "share_within_2_days": g.apply(lambda x: (x <= 2).mean()),
    }).reset_index()


# -------------------------------------------------------------- exec one-pager
def exec_one_page(fct_orders: pd.DataFrame, briefs: pd.DataFrame,
                  customers: pd.DataFrame) -> dict:
    o_ltm = _ltm(fct_orders)
    o_prior = fct_orders[(fct_orders.order_date >= PRIOR_START) & (fct_orders.order_date < LTM_START)]
    b_ltm = briefs[(briefs.received_date >= LTM_START) & (briefs.received_date <= REF_END)]
    top10 = (o_ltm.groupby("crm_id").revenue_chf.sum().nlargest(10).sum()
             / o_ltm.revenue_chf.sum())
    monthly = fct_orders.groupby("month").agg(revenue_chf=("revenue_chf", "sum"),
                                              gross_margin_chf=("gross_margin_chf", "sum")
                                              ).reset_index()
    return dict(
        ltm_revenue_chf=float(o_ltm.revenue_chf.sum()),
        prior_revenue_chf=float(o_prior.revenue_chf.sum()),
        revenue_growth_pct=float(o_ltm.revenue_chf.sum() / o_prior.revenue_chf.sum() - 1),
        ltm_gross_margin_pct=float(o_ltm.gross_margin_chf.sum() / o_ltm.revenue_chf.sum()),
        ltm_win_rate=float(b_ltm.is_won.sum() / b_ltm.is_decided.sum()),
        ltm_briefs=int(len(b_ltm)),
        top10_customer_share=float(top10),
        circular_revenue_share=float(o_ltm[o_ltm.is_circular].revenue_chf.sum()
                                     / o_ltm.revenue_chf.sum()),
        active_customers_ltm=int(o_ltm.crm_id.nunique()),
        monthly=monthly,
    )
