"""Export gold/silver tables to a static data bundle for the HTML dashboard.

The dashboard is a Next.js + React + Recharts app (web/), the same stack as the
shoe-retail allocation app. This module writes web/src/data/site.json, which the app
imports at build time.

Sliders in the app (repricing, IFRA cap) recompute in the browser from small
aggregates exported here, using the same formulas as analyses.py.

Run:  PYTHONPATH=src python -m luzi_case.export_site   (after run_all)
"""

from __future__ import annotations

import json
import math
from datetime import datetime, timezone

import pandas as pd

from luzi_case import analyses as A
from luzi_case import config as C

DATA_OUT = C.ROOT / "web" / "src" / "data" / "site.json"


def _clean(v):
    if v is None:
        return None
    if isinstance(v, float) and math.isnan(v):
        return None
    if isinstance(v, pd.Timestamp):
        return v.strftime("%Y-%m-%d")
    if hasattr(v, "item"):
        return v.item()
    return v


def records(df: pd.DataFrame, cols=None) -> list[dict]:
    d = df[cols] if cols else df
    return [{k: _clean(v) for k, v in row.items()} for row in d.to_dict("records")]


def _gold(name):
    return pd.read_parquet(C.GOLD_DIR / f"{name}.parquet")


def _silver(name):
    return pd.read_parquet(C.SILVER_DIR / f"{name}.parquet")


def build_payload() -> dict:
    with open(C.GOLD_DIR / "findings.json") as fh:
        f = json.load(fh)
    fct = _gold("fct_orders")
    customers = _silver("customers")
    rms = _silver("raw_materials")
    lines = _silver("formula_lines")
    briefs = _silver("briefs")

    # --- repricing aggregates per tier (LTM). With e constant per tier:
    #   new_gm = (1+p)^e * ((1+p)*Sp - Sc), where Sp = sum(qty*price), Sc = sum(qty*cost)
    ltm = fct[(fct.order_date >= A.LTM_START) & (fct.order_date <= A.REF_END)]
    ltm = ltm.merge(customers[["crm_id", "tier"]], on="crm_id", how="left").dropna(subset=["tier"])
    ltm = ltm.assign(sp=ltm.qty_kg * ltm.unit_price_chf_kg, sc=ltm.qty_kg * ltm.std_cost_chf_kg)
    el = _gold("analysis_elasticity_tier").set_index("tier").elasticity
    tiers = []
    for tier, g in ltm.groupby("tier"):
        tiers.append(dict(tier=tier, elasticity=float(el[tier]), sp=float(g.sp.sum()),
                          sc=float(g.sc.sum()), revenue=float(g.revenue_chf.sum()),
                          gm=float(g.gross_margin_chf.sum())))
    repricing = dict(tiers=tiers, ltm_revenue=float(ltm.revenue_chf.sum()),
                     ltm_gm=float(ltm.gross_margin_chf.sum()))

    # --- IFRA: for each restricted RM, formulas containing it and their LTM revenue
    rev_by_formula = ltm.groupby("formula_id").revenue_chf.sum()
    limited = rms[rms.ifra_limit_pct.notna()].sort_values("ifra_limit_pct")
    ifra = []
    for _, r in limited.iterrows():
        l = lines[lines.rm_code == r.rm_code][["formula_id", "pct"]].copy()
        l["ltm_revenue"] = l.formula_id.map(rev_by_formula).fillna(0.0)
        n_cand = int(((rms.rm_type == r.rm_type) & (rms.rm_code != r.rm_code)).sum())
        ifra.append(dict(rm_code=r.rm_code, rm_name=r.rm_name, rm_type=r.rm_type,
                         limit=float(r.ifra_limit_pct), substitution_candidates=n_cand,
                         formulas=records(l)))

    # --- Pricing and risk tables
    risk = _gold("analysis_rm_risk")
    risk_cols = ["rm_code", "rm_name", "rm_type", "origin", "climate_exposed", "single_source",
                 "primary_supplier", "formulas_using", "ltm_revenue_exposed_chf",
                 "price_volatility_monthly"]

    monthly = _gold("exec_monthly_revenue")
    monthly["month"] = monthly.month.astype(str)

    payload = dict(
        meta=dict(
            simulated=True,
            generated_utc=datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
            window="2023-01 to 2026-10 (LTM = Nov 2025 to Oct 2026)",
            seed=C.SEED,
        ),
        exec=dict(findings=f["exec"], monthly=records(monthly)),
        circular=f["circular_premium"],
        repricing=repricing,
        elasticity=records(_gold("analysis_elasticity_tier")),
        funnel=records(_gold("analysis_funnel_quarter")),
        winDimensions=records(_gold("analysis_win_by_dimension")),
        winDrivers=records(_gold("analysis_win_drivers")),
        cycleTime=records(_gold("analysis_cycle_time")),
        rmRisk=records(risk, risk_cols),
        supplierStress=records(_gold("analysis_supplier_stress")),
        ifra=ifra,
        ifraNow=dict(breaches=int(len(_gold("analysis_ifra_breaches_now"))),
                     formulas=int(_gold("analysis_ifra_breaches_now").formula_id.nunique())),
        ledger=records(_gold("analysis_sustainability_ledger"),
                       ["compound_id", "segment", "is_circular", "ltm_revenue_chf",
                        "co2e_kg_per_kg_compound", "naturals_pct", "circular_feedstock_pct",
                        "ltm_avg_price_chf_kg"]),
        sustSla=records(_gold("analysis_sust_sla")),
        dq=records(pd.read_csv(C.GOLD_DIR / "dq_report.csv")),
    )
    return payload


def run() -> Path:
    payload = build_payload()
    DATA_OUT.parent.mkdir(parents=True, exist_ok=True)
    body = json.dumps(payload, ensure_ascii=False, indent=1, default=str)
    DATA_OUT.write_text(body + "\n", encoding="utf-8")
    print(f"Wrote {DATA_OUT} ({DATA_OUT.stat().st_size / 1024:.0f} KB)")
    return DATA_OUT


if __name__ == "__main__":
    run()
