"""Bronze -> Silver -> Gold pipeline with explicit data-quality checks.

Bronze = raw exports exactly as the source systems hand them over (CRM, ERP,
formulation system, RM price feed, regulatory limits, HR).
Silver = cleansed, de-duplicated, keys standardised, types enforced.
Gold   = business marts used by the dashboard and the analyses.

Every cleaning rule is backed by a data-quality check that reports how many
rows failed in the raw export and how many still fail after cleaning. Anything
still failing is a finding for the data steward, not something to hide.

Run:  PYTHONPATH=src python -m luzi_case.pipeline
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import pandas as pd

from luzi_case import config as C

OUTCOMES = {"won", "lost", "open", "no_decision"}


@dataclass
class Bronze:
    briefs: pd.DataFrame
    crm_customers: pd.DataFrame
    erp_customers: pd.DataFrame
    crosswalk: pd.DataFrame
    orders: pd.DataFrame
    compounds: pd.DataFrame
    formulas: pd.DataFrame
    formula_lines: pd.DataFrame
    raw_materials: pd.DataFrame
    suppliers: pd.DataFrame
    perfumers: pd.DataFrame
    ifra: pd.DataFrame
    prices: pd.DataFrame
    sust_requests: pd.DataFrame


def read_bronze() -> Bronze:
    b = C.BRONZE_DIR

    def rd(name):
        return pd.read_csv(b / name, dtype=str, keep_default_na=True)

    return Bronze(
        briefs=rd("crm_briefs.csv"),
        crm_customers=rd("crm_customers.csv"),
        erp_customers=rd("erp_customers.csv"),
        crosswalk=rd("customer_crosswalk.csv"),
        orders=rd("erp_sales_orders.csv"),
        compounds=rd("erp_compounds.csv"),
        formulas=rd("formulation_formulas.csv"),
        formula_lines=rd("formulation_lines.csv"),
        raw_materials=rd("erp_raw_materials.csv"),
        suppliers=rd("erp_suppliers.csv"),
        perfumers=rd("hr_perfumers.csv"),
        ifra=rd("regulatory_ifra_limits.csv"),
        prices=rd("rm_price_feed.csv"),
        sust_requests=rd("crm_sustainability_requests.csv"),
    )


def _key(s: pd.Series) -> pd.Series:
    """Standard key form: trimmed, upper case."""
    return s.str.strip().str.upper()


# ----------------------------------------------------------------- silver ---
def build_silver(br: Bronze) -> dict[str, pd.DataFrame]:
    s: dict[str, pd.DataFrame] = {}

    # Customers: CRM is the master for segment/tier/region; name standardised.
    cust = br.crm_customers.copy()
    cust["crm_id"] = _key(cust.crm_id)
    cust["customer_name"] = cust.customer_name.str.strip().str.title()
    cust = cust.drop_duplicates("crm_id")
    s["customers"] = cust[["crm_id", "customer_name", "segment", "tier", "region"]]

    # Crosswalk CRM -> ERP: exactly one primary ERP account per CRM customer.
    xw = br.crosswalk.copy()
    xw["crm_id"] = _key(xw.crm_id)
    xw["erp_id"] = xw.erp_id.str.strip()
    xw["is_primary"] = xw.is_primary.str.lower().eq("true")
    s["crosswalk"] = xw

    primary = xw[xw.is_primary].drop_duplicates("crm_id")
    erp = br.erp_customers.copy()
    erp["erp_id"] = erp.erp_id.str.strip()
    s["erp_customers"] = erp.merge(primary[["crm_id", "erp_id"]], on="erp_id", how="left")

    # Briefs: trim keys, normalise outcome labels, drop exact re-exports.
    bf = br.briefs.copy()
    bf["crm_id"] = _key(bf.crm_id)
    bf["outcome"] = bf.outcome.str.strip().str.lower()
    bf = bf.drop_duplicates("brief_id", keep="first")
    for col in ["response_hours", "sample_iterations", "target_price_chf_kg", "quoted_price_chf_kg"]:
        bf[col] = pd.to_numeric(bf[col], errors="coerce")
    for col in ["received_date", "first_sample_date", "submitted_date", "decision_date", "shipped_date"]:
        bf[col] = pd.to_datetime(bf[col], errors="coerce")
    bf["is_circular_brief"] = bf.is_circular_brief.str.lower().eq("true")
    perf = br.perfumers.set_index("perfumer_id")
    bf["family_match"] = [
        int(f in (perf.loc[p, "specialisation_1"], perf.loc[p, "specialisation_2"]))
        for p, f in zip(bf.perfumer_id, bf.olfactive_family)
    ]
    bf["price_ratio"] = bf.quoted_price_chf_kg / bf.target_price_chf_kg
    bf["days_over_2"] = (bf.response_hours / 24 - 2).clip(lower=0, upper=3)
    bf["iter_over_4"] = (bf.sample_iterations - 4).clip(lower=0)
    bf["is_won"] = bf.outcome.eq("won").astype(int)
    bf["is_decided"] = bf.outcome.isin(["won", "lost"]).astype(int)
    bf["received_quarter"] = bf.received_date.dt.to_period("Q").astype(str)
    s["briefs"] = bf

    # Formulation: RM codes trimmed + upper-cased, percentages typed.
    fl = br.formula_lines.copy()
    fl["rm_code"] = _key(fl.rm_code)
    fl["pct"] = pd.to_numeric(fl.pct, errors="coerce")
    s["formula_lines"] = fl
    s["formulas"] = br.formulas.copy()

    rm = br.raw_materials.copy()
    rm["rm_code"] = _key(rm.rm_code)
    rm["climate_exposed"] = rm.climate_exposed.str.lower().eq("true")
    rm["circular_feedstock"] = rm.circular_feedstock.str.lower().eq("true")
    rm["co2e_kg_per_kg"] = pd.to_numeric(rm.co2e_kg_per_kg)
    rm["base_price_chf_kg"] = pd.to_numeric(rm.base_price_chf_kg)
    ifra = br.ifra.copy()
    ifra["rm_code"] = _key(ifra.rm_code)
    ifra["ifra_limit_pct"] = pd.to_numeric(ifra.ifra_limit_pct)
    rm = rm.merge(ifra, on="rm_code", how="left")
    s["raw_materials"] = rm
    s["suppliers"] = br.suppliers.copy()
    s["suppliers"]["otif_pct"] = pd.to_numeric(s["suppliers"].otif_pct)

    pr = br.prices.copy()
    pr["rm_code"] = _key(pr.rm_code)
    pr["price_chf_kg"] = pd.to_numeric(pr.price_chf_kg, errors="coerce")
    s["rm_prices"] = pr

    # Compounds (finished products) and orders.
    comp = br.compounds.copy()
    comp["is_circular"] = comp.is_circular.str.lower().eq("true")
    comp["erp_customer_id"] = comp.erp_customer_id.str.strip()
    comp = comp.merge(primary[["erp_id", "crm_id"]].rename(columns={"erp_id": "erp_customer_id"}),
                      on="erp_customer_id", how="left")
    s["compounds"] = comp

    od = br.orders.copy()
    od["erp_customer_id"] = od.erp_customer_id.str.strip()
    od["order_date"] = pd.to_datetime(od.order_date)
    od["qty_kg"] = pd.to_numeric(od.qty_kg)
    od["unit_price_chf_kg"] = pd.to_numeric(od.unit_price_chf_kg, errors="coerce")
    od["is_return"] = od.qty_kg < 0
    od["month"] = od.order_date.dt.to_period("M").astype(str)
    od = od.merge(comp[["compound_id", "formula_id", "crm_id", "segment", "is_circular"]],
                  on="compound_id", how="left")
    od["revenue_chf"] = od.qty_kg * od.unit_price_chf_kg
    s["orders"] = od

    sr = br.sust_requests.copy()
    sr["crm_id"] = _key(sr.crm_id)
    sr["requested_date"] = pd.to_datetime(sr.requested_date)
    sr["delivered_date"] = pd.to_datetime(sr.delivered_date)
    sr["lead_time_days"] = (sr.delivered_date - sr.requested_date).dt.days
    s["sust_requests"] = sr
    return s


# ------------------------------------------------------------ data quality ---
def dq_report(br: Bronze, s: dict[str, pd.DataFrame]) -> pd.DataFrame:
    rows = []

    def add(table, check, raw_fail, after_fail, action, severity="high"):
        rows.append(dict(table=table, check=check, failures_raw=int(raw_fail),
                         failures_after_cleaning=int(after_fail), action=action,
                         severity=severity))

    b = br.briefs
    add("crm_briefs", "brief_id unique",
        b.brief_id.duplicated().sum(), s["briefs"].brief_id.duplicated().sum(),
        "drop exact re-export rows (keep first)")
    raw_keys = set(br.crm_customers.crm_id)
    add("crm_briefs", "crm_id exists in customer master (raw key)",
        (~b.crm_id.isin(raw_keys)).sum(),
        (~s["briefs"].crm_id.isin(s["customers"].crm_id)).sum(),
        "trim and upper-case keys before join")
    add("crm_briefs", "response_hours present",
        b.response_hours.isna().sum(), s["briefs"].response_hours.isna().sum(),
        "kept as null; excluded from response-time model", "medium")
    add("crm_briefs", "outcome in {won, lost, open, no_decision} (exact label)",
        (~b.outcome.isin(OUTCOMES)).sum(),
        (~s["briefs"].outcome.isin(OUTCOMES)).sum(),
        "normalise label case and whitespace")
    add("crm_customers", "customer names in standard case",
        (br.crm_customers.customer_name != br.crm_customers.customer_name.str.title()).sum(),
        (s["customers"].customer_name != s["customers"].customer_name.str.title()).sum(),
        "title-case names", "low")
    add("customer_crosswalk", "secondary ERP accounts (duplicate-account risk)",
        (br.crosswalk.is_primary.str.lower() == "false").sum(),
        (~s["crosswalk"].is_primary).sum(),
        "kept out of joins; flagged to Sales Ops for account merge", "medium")
    add("formulation_lines", "rm_code exists in RM master",
        (~br.formula_lines.rm_code.isin(br.raw_materials.rm_code)).sum(),
        (~s["formula_lines"].rm_code.isin(s["raw_materials"].rm_code)).sum(),
        "upper-case codes before join")
    raw_sums = pd.to_numeric(br.formula_lines.pct).groupby(br.formula_lines.formula_id).sum()
    sums = s["formula_lines"].groupby("formula_id").pct.sum()
    add("formulation_lines", "formula percentages sum to 100 (+/-0.05)",
        (~raw_sums.sub(100).abs().le(0.05)).sum(), (~sums.sub(100).abs().le(0.05)).sum(),
        "flag formulas that do not balance")
    add("erp_sales_orders", "unit price present",
        br.orders.unit_price_chf_kg.isna().sum(), s["orders"].unit_price_chf_kg.isna().sum(),
        "kept; excluded from revenue and margin", "medium")
    add("erp_sales_orders", "quantity positive (returns flagged)",
        (pd.to_numeric(br.orders.qty_kg) < 0).sum(), s["orders"].is_return.sum(),
        "returns kept with is_return flag; excluded from volume-elasticity model", "medium")
    add("erp_sales_orders", "customer resolves to CRM master",
        (~s["orders"].erp_customer_id.isin(s["crosswalk"].erp_id)).sum(),
        s["orders"].crm_id.isna().sum(), "join through primary crosswalk")
    add("erp_sales_orders", "compound resolves to formula",
        0, s["orders"].formula_id.isna().sum(), "none expected")
    add("rm_price_feed", "prices present and positive",
        (br.prices.price_chf_kg.isna()).sum(),
        (s["rm_prices"].price_chf_kg.isna() | (s["rm_prices"].price_chf_kg <= 0)).sum(),
        "none expected")
    return pd.DataFrame(rows)


# ------------------------------------------------------------------- gold ---
def formula_monthly_cost(lines: pd.DataFrame, prices: pd.DataFrame) -> pd.DataFrame:
    """Standard cost (CHF/kg) of each formula in each month, from RM prices."""
    px = prices[["month", "rm_code", "price_chf_kg"]].rename(columns={"month": "month_str"})
    m = lines.merge(px, on="rm_code", how="inner")
    m["cost_part"] = m.pct / 100.0 * m.price_chf_kg
    out = m.groupby(["formula_id", "month_str"], as_index=False).cost_part.sum()
    return out.rename(columns={"cost_part": "std_cost_chf_kg"})


def build_gold(s: dict[str, pd.DataFrame]) -> dict[str, pd.DataFrame]:
    g: dict[str, pd.DataFrame] = {}
    ob = s["orders"][~s["orders"].is_return & s["orders"].unit_price_chf_kg.notna()].copy()

    cost = formula_monthly_cost(s["formula_lines"], s["rm_prices"])
    ob = ob.merge(cost, left_on=["formula_id", "month"], right_on=["formula_id", "month_str"],
                  how="left")
    ob["cost_revenue_chf"] = ob.qty_kg * ob.std_cost_chf_kg
    ob["gross_margin_chf"] = ob.revenue_chf - ob.cost_revenue_chf
    g["fct_orders"] = ob[[
        "order_id", "order_date", "month", "erp_customer_id", "crm_id", "compound_id",
        "formula_id", "segment", "is_circular", "qty_kg", "unit_price_chf_kg",
        "revenue_chf", "std_cost_chf_kg", "cost_revenue_chf", "gross_margin_chf"]]

    b = s["briefs"]
    g["fct_briefs"] = b

    # Compound-level sustainability ledger (CO2e per kg, naturals share).
    lines = s["formula_lines"].merge(
        s["raw_materials"][["rm_code", "rm_type", "co2e_kg_per_kg", "circular_feedstock"]],
        on="rm_code", how="left")
    lines["co2_part"] = lines.pct / 100 * lines.co2e_kg_per_kg
    lines["nat_part"] = np.where(lines.rm_type == "natural", lines.pct, 0.0)
    lines["circ_part"] = np.where(lines.circular_feedstock.fillna(False), lines.pct, 0.0)
    sus = lines.groupby("formula_id").agg(
        co2e_kg_per_kg_compound=("co2_part", "sum"),
        naturals_pct=("nat_part", "sum"),
        circular_feedstock_pct=("circ_part", "sum"),
    ).reset_index()
    g["mart_formula_sustainability"] = sus
    return g


def run() -> dict[str, pd.DataFrame]:
    C.SILVER_DIR.mkdir(parents=True, exist_ok=True)
    C.GOLD_DIR.mkdir(parents=True, exist_ok=True)
    br = read_bronze()
    s = build_silver(br)
    dq = dq_report(br, s)
    g = build_gold(s)
    for name, df in s.items():
        df.to_parquet(C.SILVER_DIR / f"{name}.parquet", index=False)
    for name, df in g.items():
        df.to_parquet(C.GOLD_DIR / f"{name}.parquet", index=False)
    dq.to_csv(C.GOLD_DIR / "dq_report.csv", index=False)
    print(dq.to_string(index=False))
    return {"silver": s, "gold": g, "dq": dq}


if __name__ == "__main__":
    run()
