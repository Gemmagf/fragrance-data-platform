"""Quality gate and run log.

The gate decides whether a load may publish. It fails when:
  - any high-severity data-quality check still fails after cleaning, or
  - any silver data contract is violated.

Every run appends one record to data/gold/run_log.json, pass or fail, so there is a
history of loads and of the checks that stopped them.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone

import pandas as pd

from luzi_case import config as C

RUN_LOG = C.GOLD_DIR / "run_log.json"


class QualityGateError(RuntimeError):
    pass


def evaluate_gate(dq: pd.DataFrame, violations: pd.DataFrame) -> dict:
    blocking_dq = dq[(dq.severity == "high") & (dq.failures_after_cleaning > 0)]
    passed = blocking_dq.empty and violations.empty
    return dict(
        passed=bool(passed),
        blocking_dq_checks=blocking_dq[["table", "check", "failures_after_cleaning"]].to_dict("records"),
        contract_violations=violations.to_dict("records"),
    )


def write_run_log(status: str, gate: dict, row_counts: dict[str, int]) -> dict:
    record = dict(
        run_at_utc=datetime.now(timezone.utc).isoformat(timespec="seconds"),
        status=status,
        row_counts=row_counts,
        gate=gate,
    )
    history = json.loads(RUN_LOG.read_text()) if RUN_LOG.exists() else []
    history.append(record)
    RUN_LOG.parent.mkdir(parents=True, exist_ok=True)
    RUN_LOG.write_text(json.dumps(history, indent=2, default=str))
    return record
