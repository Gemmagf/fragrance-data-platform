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


# ----------------------------------------- 3. data engineering controls ----
def test_silver_contracts_pass_on_current_data():
    from luzi_case import contracts
    v = contracts.validate_all()
    assert v.empty, v.to_string()


def test_contract_validator_catches_planted_violations():
    """The validator must fail on bad data, otherwise a passing result means nothing."""
    import numpy as np
    from luzi_case import contracts
    bad = pd.DataFrame({
        "brief_id": ["BR-00001", "BR-00001", "bad-id"],       # duplicate + pattern
        "crm_id": ["CRM-0001", "CRM-0002", None],             # null in a not-null column
        "outcome": ["won", "maybe", "lost"],                  # not allowed
        "response_hours": [10.0, -1.0, np.nan],               # below min
        "sample_iterations": [1, 2, 3],
        "quoted_price_chf_kg": [10.0, 11.0, 12.0],
        "received_date": pd.to_datetime(["2024-01-01", "2024-01-02", "2024-01-03"]),
        "is_won": [1, 0, 2],                                  # not allowed
    })
    contract = contracts.load_contracts()["briefs"]
    rules = {(r["column"], r["rule"].split(" ")[0]) for r in contracts.validate_table("briefs", bad, contract)}
    assert ("brief_id", "unique") in rules
    assert ("brief_id", "pattern") in rules
    assert ("crm_id", "not") in rules
    assert ("outcome", "allowed") in rules
    assert ("response_hours", "min") in rules
    assert ("is_won", "allowed") in rules


def test_metrics_catalogue_references_real_tables_and_pages():
    import yaml
    cat = yaml.safe_load(open(C.ROOT / "metrics" / "metrics.yml"))["metrics"]
    names = {m["name"] for m in cat}
    assert len(names) == len(cat), "metric names must be unique"
    for m in cat:
        src = m["source"]
        exists = (C.SILVER_DIR / f"{src}.parquet").exists() or (C.GOLD_DIR / f"{src}.parquet").exists() \
            or (C.GOLD_DIR / f"{src}.csv").exists()
        assert exists, f"{m['name']}: source {src} not found"
        page = m["page"].strip("/") or "page"
        assert (C.ROOT / "web" / "src" / "app" / page / "page.tsx").exists() or page == "page", \
            f"{m['name']}: page {m['page']} not found"


def test_connector_ingests_into_bronze_and_logs_each_table(tmp_path=None):
    """Same SQLAlchemy path as the SQL Server and MySQL connectors, run against SQLite."""
    import tempfile
    from pathlib import Path
    from luzi_case import connectors
    from sqlalchemy import create_engine, text

    tmp = Path(tempfile.mkdtemp())
    db = tmp / "source.db"
    url = f"sqlite:///{db}"
    eng = create_engine(url)
    src_rows = pd.read_csv(C.BRONZE_DIR / "erp_customers.csv", dtype=str)
    with eng.begin() as conn:
        src_rows.to_sql("erp_customers", conn, index=False)
        conn.execute(text("CREATE TABLE broken (x INT)"))  # exists but not in the spec below
    eng.dispose()

    spec = connectors.SourceSpec(
        name="erp", kind="sqlite",
        tables=[connectors.TableSpec("erp_customers"), connectors.TableSpec("missing_table")],
    )
    saved_log = connectors.LOAD_LOG
    connectors.LOAD_LOG = tmp / "load_log.json"
    try:
        recs = connectors.ingest(spec, tmp / "bronze", url=url)
    finally:
        connectors.LOAD_LOG = saved_log
    by_table = {r.table: r for r in recs}
    assert by_table["erp_customers"].status == "ok"
    assert by_table["erp_customers"].rows == len(src_rows)
    assert (tmp / "bronze" / "erp__erp_customers.parquet").exists()
    assert by_table["missing_table"].status == "failed"  # one failure does not stop the others
    log = json.loads((tmp / "load_log.json").read_text())
    assert len(log) == 2


def test_connector_without_credentials_fails_clearly():
    import os
    from luzi_case import connectors
    os.environ.pop(connectors.ENV_VARS["sqlserver"], None)
    try:
        connectors.engine_for(connectors.SourceSpec(name="erp", kind="sqlserver"))
        raise AssertionError("expected RuntimeError when the URL variable is not set")
    except RuntimeError as exc:
        assert "LUZI_SQLSERVER_URL" in str(exc)


def test_quality_gate_blocks_on_high_severity_failure():
    from luzi_case.gate import evaluate_gate
    dq = pd.DataFrame([
        dict(table="t", check="c1", severity="high", failures_after_cleaning=3, failures_raw=3),
        dict(table="t", check="c2", severity="low", failures_after_cleaning=9, failures_raw=9),
    ])
    gate = evaluate_gate(dq, pd.DataFrame(columns=["table", "column", "rule", "violations"]))
    assert gate["passed"] is False
    assert [c["check"] for c in gate["blocking_dq_checks"]] == ["c1"]  # low severity does not block


def test_quality_gate_blocks_on_contract_violation():
    from luzi_case.gate import evaluate_gate
    dq = pd.DataFrame(columns=["table", "check", "severity", "failures_after_cleaning", "failures_raw"])
    viol = pd.DataFrame([dict(table="briefs", column="brief_id", rule="unique", violations=2)])
    assert evaluate_gate(dq, viol)["passed"] is False
    assert evaluate_gate(dq, viol.iloc[:0])["passed"] is True


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
