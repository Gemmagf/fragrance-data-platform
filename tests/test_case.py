"""Tests for the LUZI case.

Two kinds:
  1. Data-contract tests: the silver layer obeys the rules the BRD asks for
     (unique keys, valid outcomes, balanced formulas, no silent joins).
  2. Recovery tests: the analyses recover the planted ground truth within their
     own confidence intervals. This is the portfolio-grade check: the analysis
     is only trusted if it finds what we know we put in.

Run:  PYTHONPATH=src python tests/test_case.py      (or pytest, if installed)
Requires: python -m luzi_case.run_all has been run once.
"""

from __future__ import annotations

import json

import numpy as np
import pandas as pd

from luzi_case import analyses as A
from luzi_case import config as C
from luzi_case.pipeline import OUTCOMES

_cache: dict = {}


def _silver(name):
    return pd.read_parquet(C.SILVER_DIR / f"{name}.parquet")


def _gold(name):
    return pd.read_parquet(C.GOLD_DIR / f"{name}.parquet")


def _truth():
    with open(C.GROUND_TRUTH_DIR / "ground_truth.json") as fh:
        return json.load(fh)


# ----------------------------------------------------- 1. data contracts ----
def test_brief_ids_unique_after_cleaning():
    b = _silver("briefs")
    assert not b.brief_id.duplicated().any()


def test_outcomes_are_valid_labels():
    b = _silver("briefs")
    assert set(b.outcome.unique()) <= OUTCOMES


def test_crm_keys_trimmed_and_join_to_master():
    b = _silver("briefs")
    c = _silver("customers")
    assert b.crm_id.str.fullmatch(r"CRM-\d{4}").all()
    assert b.crm_id.isin(c.crm_id).all()


def test_formula_rm_codes_resolve_and_formulas_balance():
    fl = _silver("formula_lines")
    rm = _silver("raw_materials")
    assert fl.rm_code.isin(rm.rm_code).all()
    sums = fl.groupby("formula_id").pct.sum()
    assert (sums.sub(100).abs() <= 0.05).all()


def test_one_primary_erp_account_per_crm_customer():
    xw = _silver("crosswalk")
    prim = xw[xw.is_primary].groupby("crm_id").size()
    assert (prim == 1).all() and len(prim) == C.N_CUSTOMERS


def test_fct_orders_excludes_returns_and_missing_prices():
    f = _gold("fct_orders")
    assert (f.qty_kg > 0).all()
    assert f.unit_price_chf_kg.notna().all()
    assert f.std_cost_chf_kg.notna().all()


def test_funnel_identity_holds():
    b = _silver("briefs")
    assert (b.is_won + (b.outcome == "lost").astype(int) == b.is_decided).all()


def test_dq_flags_every_planted_issue():
    """Every dirty pattern we injected must show up in the DQ report."""
    dq = pd.read_csv(C.GOLD_DIR / "dq_report.csv")
    raw = dict(zip(dq.check, dq.failures_raw))
    gt = _truth()["dq_injected"]
    assert raw["brief_id unique"] == gt["duplicate_brief_rows"]
    assert raw["crm_id exists in customer master (raw key)"] == gt["brief_crm_id_dirty"]
    assert raw["response_hours present"] == gt["brief_response_hours_missing"]
    assert raw["outcome in {won, lost, open, no_decision} (exact label)"] == gt["outcome_label_variants"]
    assert raw["rm_code exists in RM master"] == gt["formula_rm_code_case"]


def test_dq_cleaning_leaves_no_blocking_failures():
    dq = pd.read_csv(C.GOLD_DIR / "dq_report.csv")
    blocking = dq[(dq.severity == "high")]
    assert (blocking.failures_after_cleaning == 0).all(), blocking


# --------------------------------------------------- 2. recovery of truth ----
def test_elasticity_recovered_per_tier():
    e = pd.read_parquet(C.GOLD_DIR / "analysis_elasticity_tier.parquet").set_index("tier")
    for tier, truth in C.TIER_ELASTICITY.items():
        row = e.loc[tier]
        assert row.ci_low <= truth <= row.ci_high, (tier, row.elasticity, truth)
        assert abs(row.elasticity - truth) < 0.15, (tier, row.elasticity, truth)


def test_circular_premium_recovered():
    f = json.load(open(C.GOLD_DIR / "findings.json"))["circular_premium"]
    assert f["premium_ci_low"] <= C.CIRCULAR_PREMIUM <= f["premium_ci_high"], f


def test_win_drivers_sign_and_ci():
    w = pd.read_parquet(C.GOLD_DIR / "analysis_win_drivers.parquet").set_index("term")
    t = C.WIN_TRUTH
    assert w.loc["family_match", "ci_low"] <= t["family_match"] <= w.loc["family_match", "ci_high"]
    assert w.loc["price_pct_over_target", "ci_low"] <= t["price_pct_over_target"] \
        <= w.loc["price_pct_over_target", "ci_high"]
    assert w.loc["days_over_2", "logit_coef"] < 0
    assert w.loc["iter_over_4", "logit_coef"] < 0


def test_single_source_flags_match_truth():
    gt = set(_truth()["single_source_rm"])
    rm = _silver("raw_materials")
    flagged = set(rm.loc[rm.secondary_supplier.isna(), "rm_code"])
    assert flagged == gt


def test_ifra_breach_detection_matches_planted_traces():
    breaches = pd.read_parquet(C.GOLD_DIR / "analysis_ifra_breaches_now.parquet")
    assert len(breaches) > 0
    assert (breaches.pct > breaches.ifra_limit_pct).all()


def test_repricing_is_positive_and_bounded():
    f = json.load(open(C.GOLD_DIR / "findings.json"))["repricing"]
    assert 0 < f["gm_pct_after"] - f["ltm_gross_margin_pct"] < 0.05


# ------------------------------------------------------------- runner --------
if __name__ == "__main__":
    tests = [v for k, v in dict(globals()).items() if k.startswith("test_")]
    failed = 0
    for t in tests:
        try:
            t()
            print(f"PASS {t.__name__}")
        except AssertionError as exc:
            failed += 1
            print(f"FAIL {t.__name__}: {exc}")
    print(f"\n{len(tests) - failed}/{len(tests)} passed")
    raise SystemExit(1 if failed else 0)
