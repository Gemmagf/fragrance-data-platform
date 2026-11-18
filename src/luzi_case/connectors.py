"""Source connectors: extract tables from operational databases into bronze.

Each source is described by a kind and an environment variable that holds its
SQLAlchemy URL. Credentials never go in the code or in the repository:

    LUZI_SQLSERVER_URL  mssql+pyodbc://...   (needs Microsoft ODBC Driver 18; NOT TESTED against a live server)
    LUZI_MYSQL_URL      mysql+pymysql://...  (needs a reachable MySQL; NOT TESTED against a live server)
    LUZI_CTREE_URL      ODBC via vendor driver (NOT TESTED; c-tree driver and DSN to be confirmed with the vendor)

The extraction code path is the same for every kind: SQLAlchemy engine, one
SELECT per table, DataFrame, parquet in bronze, one row in the load log. The test
suite runs that path against SQLite, which is the only engine available here.

Run (once the environment variables are set):
    PYTHONPATH=src python -m luzi_case.connectors
"""

from __future__ import annotations

import json
import os
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine

from luzi_case import config as C

LOAD_LOG = C.DATA_DIR / "load_log.json"

ENV_VARS = {
    "sqlserver": "LUZI_SQLSERVER_URL",
    "mysql": "LUZI_MYSQL_URL",
    "ctree": "LUZI_CTREE_URL",
}


@dataclass
class TableSpec:
    name: str                      # table name in the source
    query: str | None = None       # optional SELECT; defaults to SELECT * FROM name


@dataclass
class SourceSpec:
    name: str                      # e.g. "erp"
    kind: str                      # sqlserver | mysql | ctree | sqlite (tests only)
    tables: list[TableSpec] = field(default_factory=list)


@dataclass
class LoadRecord:
    load_id: str
    source: str
    table: str
    rows: int
    extracted_at_utc: str
    status: str
    detail: str = ""


def engine_for(source: SourceSpec, url: str | None = None) -> Engine:
    """Create an engine. The URL comes from the environment unless passed in (tests)."""
    if url is None:
        if source.kind == "sqlite":
            raise ValueError("sqlite is only for tests; pass an explicit URL")
        env = ENV_VARS.get(source.kind)
        if env is None:
            raise ValueError(f"Unknown source kind: {source.kind}")
        url = os.environ.get(env)
        if not url:
            raise RuntimeError(
                f"Environment variable {env} is not set. Set it to the SQLAlchemy URL for source '{source.name}'."
            )
    return create_engine(url)


def extract_table(engine: Engine, table: TableSpec) -> pd.DataFrame:
    sql = table.query or f"SELECT * FROM {table.name}"
    with engine.connect() as conn:
        return pd.read_sql(text(sql), conn)


def _log(records: list[LoadRecord]) -> None:
    existing = []
    if LOAD_LOG.exists():
        existing = json.loads(LOAD_LOG.read_text())
    existing.extend(asdict(r) for r in records)
    LOAD_LOG.parent.mkdir(parents=True, exist_ok=True)
    LOAD_LOG.write_text(json.dumps(existing, indent=2))


def ingest(source: SourceSpec, out_dir: Path, url: str | None = None) -> list[LoadRecord]:
    """Extract every table of a source into out_dir/<source>__<table>.parquet and log the load.

    A failing table is logged with status 'failed' and the error text; the other tables still load.
    """
    load_id = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    out_dir.mkdir(parents=True, exist_ok=True)
    records: list[LoadRecord] = []
    try:
        engine = engine_for(source, url)
    except Exception as exc:  # connection setup problems are logged, not hidden
        rec = LoadRecord(load_id, source.name, "*", 0, datetime.now(timezone.utc).isoformat(), "failed", str(exc))
        _log([rec])
        raise
    for spec in source.tables:
        now = datetime.now(timezone.utc).isoformat()
        try:
            df = extract_table(engine, spec)
            df.to_parquet(out_dir / f"{source.name}__{spec.name}.parquet", index=False)
            records.append(LoadRecord(load_id, source.name, spec.name, len(df), now, "ok"))
        except Exception as exc:
            records.append(LoadRecord(load_id, source.name, spec.name, 0, now, "failed", str(exc)))
    engine.dispose()
    _log(records)
    return records


# Declared sources for the case. The table names are the ones an ERP export would use;
# they must be confirmed against the real system before the first load.
CASE_SOURCES = [
    SourceSpec(
        name="erp",
        kind="sqlserver",
        tables=[TableSpec("erp_sales_orders"), TableSpec("erp_customers"), TableSpec("erp_raw_materials"),
                TableSpec("erp_suppliers"), TableSpec("erp_compounds")],
    ),
    SourceSpec(
        name="formulation",
        kind="mysql",
        tables=[TableSpec("formulation_formulas"), TableSpec("formulation_lines")],
    ),
    SourceSpec(
        name="production",
        kind="ctree",
        tables=[TableSpec("production_batches")],
    ),
]


if __name__ == "__main__":
    for src in CASE_SOURCES:
        try:
            for r in ingest(src, C.BRONZE_DIR / "from_sources"):
                print(f"{r.source}.{r.table}: {r.status} ({r.rows} rows) {r.detail}")
        except RuntimeError as exc:
            print(f"SKIPPED {src.name}: {exc}")
