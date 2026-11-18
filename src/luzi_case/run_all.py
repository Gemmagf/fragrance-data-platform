"""End-to-end run: simulate -> pipeline -> analyses -> results for the dashboard.

Run:  PYTHONPATH=src python -m luzi_case.run_all
Writes data/gold/analysis_*.parquet and data/gold/findings.json.
"""

from __future__ import annotations

import json

import pandas as pd

from luzi_case import analyses as A
from luzi_case import config as C
from luzi_case import contracts, pipeline, simulate
from luzi_case.gate import QualityGateError, evaluate_gate, write_run_log


def _load(name: str, layer: str) -> pd.DataFrame:
    base = C.SILVER_DIR if layer == "silver" else C.GOLD_DIR
    return pd.read_parquet(base / f"{name}.parquet")


def run() -> dict:
    simulate.run()
    res = pipeline.run()

    # Quality gate: contracts and high-severity checks must pass before anything is published.
    violations = contracts.validate_all()
    gate = evaluate_gate(res["dq"], violations)
    row_counts = {name: len(df) for name, df in res["silver"].items()}
    if not gate["passed"]:
        write_run_log("failed", gate, row_counts)
        raise QualityGateError(
            f"Load stopped by the quality gate: {len(gate['blocking_dq_checks'])} blocking DQ check(s), "
            f"{len(gate['contract_violations'])} contract violation(s). See data/gold/run_log.json."
        )

    s, g = res["silver"], res["gold"]
    briefs, customers = s["briefs"], s["customers"]
    fct = g["fct_orders"]
    lines, rms = s["formula_lines"], s["raw_materials"]
    prices = s["rm_prices"]

    out: dict[str, pd.DataFrame] = {}
    out["analysis_funnel_quarter"] = A.brief_funnel_by_quarter(briefs)
    out["analysis_win_by_dimension"] = A.win_rate_by_dimension(briefs, customers)
    out["analysis_win_drivers"] = A.brief_win_drivers(briefs, customers)
    out["analysis_cycle_time"] = A.cycle_time_decomposition(briefs)
    elast = A.price_elasticity_by_tier(fct, customers)
    out["analysis_elasticity_tier"] = elast
    rm_risk = A.rm_single_source_risk(lines, rms, fct, prices)
    out["analysis_rm_risk"] = rm_risk
    out["analysis_supplier_stress"] = A.supplier_outage_stress(rms, rm_risk, s["suppliers"])
    out["analysis_formula_hhi"] = A.formula_supplier_hhi(lines, rms)
    out["analysis_ifra_breaches_now"] = A.current_ifra_compliance(lines, rms)
    out["analysis_sustainability_ledger"] = A.sustainability_ledger(
        g["mart_formula_sustainability"], fct)
    out["analysis_sust_sla"] = A.sustainability_request_sla(s["sust_requests"])

    repricing = A.repricing_scenario(fct, customers, elast, pct=0.04)
    out["analysis_repricing_by_tier"] = repricing["by_tier"]

    # IFRA what-if: cap the first limited natural at half its current limit.
    limited = rms[rms.ifra_limit_pct.notna()].sort_values("ifra_limit_pct")
    target = limited.iloc[0]
    ifra_whatif = A.ifra_amendment_impact(lines, rms, fct, target.rm_code,
                                          new_limit_pct=float(target.ifra_limit_pct) / 2)
    ifra_table = ifra_whatif.pop("breaching_formulas")
    out["analysis_ifra_whatif_formulas"] = ifra_table

    circ = A.circular_price_premium(fct, briefs, s["formulas"])
    exec_kpis = A.exec_one_page(fct, briefs, customers)
    monthly = exec_kpis.pop("monthly")
    out["exec_monthly_revenue"] = monthly

    for name, df in out.items():
        df.to_parquet(C.GOLD_DIR / f"{name}.parquet", index=False)

    findings = dict(
        exec=exec_kpis,
        win_drivers=out["analysis_win_drivers"].to_dict("records"),
        cycle_time=out["analysis_cycle_time"].to_dict("records"),
        elasticity=elast.to_dict("records"),
        repricing=dict(
            price_increase_pct=repricing["price_increase_pct"],
            ltm_revenue_chf=repricing["ltm_revenue_chf"],
            ltm_gross_margin_pct=repricing["ltm_gross_margin_pct"],
            gm_uplift_chf=repricing["gm_uplift_chf"],
            gm_uplift_bps=repricing["gm_uplift_bps"],
            gm_pct_after=repricing["gm_pct_after"],
        ),
        circular_premium=circ,
        ifra_whatif=ifra_whatif,
        single_source_rms=int(rm_risk.single_source.sum()),
        rm_count=int(len(rms)),
        top_stress=out["analysis_supplier_stress"].head(3).to_dict("records"),
    )
    with open(C.GOLD_DIR / "findings.json", "w") as fh:
        json.dump(findings, fh, indent=2, default=str)
    print(json.dumps({k: findings[k] for k in ["exec", "repricing", "circular_premium",
                                               "ifra_whatif"]}, indent=2, default=str))
    write_run_log("passed", gate, row_counts)
    return findings


if __name__ == "__main__":
    run()
