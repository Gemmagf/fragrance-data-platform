"""Validate silver tables against the data contracts in contracts/silver_contracts.yml.

A contract violation is a finding, not a silent fix. `validate_all` returns one row per
violation, and the quality gate in run_all fails the run if any exist.
"""

from __future__ import annotations

from pathlib import Path

import pandas as pd
import yaml

from luzi_case import config as C

CONTRACTS_FILE = C.ROOT / "contracts" / "silver_contracts.yml"

_DTYPE_CHECK = {
    "str": lambda s: s.map(lambda v: isinstance(v, str)).all(),
    "int": lambda s: pd.api.types.is_integer_dtype(s),
    "float": lambda s: pd.api.types.is_float_dtype(s) or pd.api.types.is_integer_dtype(s),
    "bool": lambda s: pd.api.types.is_bool_dtype(s),
    "datetime": lambda s: pd.api.types.is_datetime64_any_dtype(s),
}


def load_contracts(path: Path = CONTRACTS_FILE) -> dict:
    with open(path) as fh:
        return yaml.safe_load(fh)


def validate_table(name: str, df: pd.DataFrame, contract: dict) -> list[dict]:
    """Return a list of violations for one table. An empty list means the table passes."""
    out: list[dict] = []

    def fail(column: str, rule: str, count: int):
        out.append(dict(table=name, column=column, rule=rule, violations=int(count)))

    for col, rules in contract["columns"].items():
        if col not in df.columns:
            fail(col, "column present", 1)
            continue
        s = df[col]
        if not rules.get("nullable", True):
            n = int(s.isna().sum())
            if n:
                fail(col, "not null", n)
        s_nonnull = s.dropna()
        if rules["type"] in _DTYPE_CHECK and len(s_nonnull) and not _DTYPE_CHECK[rules["type"]](s_nonnull):
            fail(col, f"type {rules['type']}", len(s_nonnull))
        if rules.get("unique") and s.duplicated().any():
            fail(col, "unique", int(s.duplicated().sum()))
        if "allowed" in rules:
            bad = ~s_nonnull.isin(rules["allowed"])
            if bad.any():
                fail(col, f"allowed values {rules['allowed']}", int(bad.sum()))
        if "min" in rules and len(s_nonnull):
            n = int((pd.to_numeric(s_nonnull, errors="coerce") < rules["min"]).sum())
            if n:
                fail(col, f"min {rules['min']}", n)
        if "max" in rules and len(s_nonnull):
            n = int((pd.to_numeric(s_nonnull, errors="coerce") > rules["max"]).sum())
            if n:
                fail(col, f"max {rules['max']}", n)
        if "pattern" in rules and len(s_nonnull):
            n = int((~s_nonnull.astype(str).str.match(rules["pattern"])).sum())
            if n:
                fail(col, f"pattern {rules['pattern']}", n)

    key = contract.get("key", [])
    if key and all(k in df.columns for k in key) and df.duplicated(subset=key).any():
        fail("+".join(key), "key unique", int(df.duplicated(subset=key).sum()))
    return out


def validate_all(silver_dir: Path = C.SILVER_DIR) -> pd.DataFrame:
    contracts = load_contracts()
    rows: list[dict] = []
    for table, contract in contracts.items():
        path = silver_dir / f"{table}.parquet"
        if not path.exists():
            rows.append(dict(table=table, column="*", rule="table present", violations=1))
            continue
        rows.extend(validate_table(table, pd.read_parquet(path), contract))
    return pd.DataFrame(rows, columns=["table", "column", "rule", "violations"])


if __name__ == "__main__":
    result = validate_all()
    print(result.to_string(index=False) if len(result) else "All silver contracts pass.")
