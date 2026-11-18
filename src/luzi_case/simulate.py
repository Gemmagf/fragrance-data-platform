"""Generate the SIMULATED LUZI-style world into data/bronze (raw exports) and
data/_ground_truth (the answers the analyses should recover).

Run:  PYTHONPATH=src python -m luzi_case.simulate
"""

from __future__ import annotations

import json

import numpy as np
import pandas as pd

from luzi_case import config as C


def _sigmoid(x):
    return 1.0 / (1.0 + np.exp(-x))


def _logit(p):
    return np.log(p / (1 - p))


# ---------------------------------------------------------------- masters ----
def make_customers(rng):
    combos = [(p, s) for p in C.NAME_PREFIXES for s in C.NAME_SUFFIXES]
    pick = rng.choice(len(combos), C.N_CUSTOMERS, replace=False)
    tiers = rng.choice(C.TIERS, C.N_CUSTOMERS, p=C.TIER_MIX)
    segs = rng.choice(C.SEGMENTS, C.N_CUSTOMERS, p=C.SEGMENT_MIX)
    regs = rng.choice(C.REGIONS, C.N_CUSTOMERS, p=C.REGION_MIX)
    rows = []
    for i in range(C.N_CUSTOMERS):
        p, s = combos[pick[i]]
        t = tiers[i]
        rows.append(dict(
            customer_id=f"CUS-{i + 1:03d}",
            name=f"{p} {s}",
            segment=segs[i],
            tier=t,
            region=regs[i],
            true_elasticity=C.TIER_ELASTICITY[t] + rng.normal(0, 0.15),
            crm_id=f"CRM-{i + 1:04d}",
            erp_id=str(10000 + i + 1),
        ))
    return pd.DataFrame(rows)


def make_perfumers(rng):
    rows = []
    for i in range(C.N_PERFUMERS):
        spec = rng.choice(C.FAMILIES, 2, replace=False)
        rows.append(dict(
            perfumer_id=f"PF-{i + 1:02d}",
            perfumer_name=f"Perfumer {i + 1:02d}",
            specialisation_1=spec[0],
            specialisation_2=spec[1],
            load_weight=float(rng.uniform(0.5, 1.5)),
        ))
    return pd.DataFrame(rows)


def make_suppliers(rng):
    countries = ["CH", "FR", "DE", "NL", "IN", "CN", "US", "MA", "BG", "ID"]
    cats = (["natural"] * 8) + (["synthetic"] * 10) + (["solvent"] * 7)
    rows = []
    for i in range(C.N_SUPPLIERS):
        rows.append(dict(
            supplier_id=f"SUP-{i + 1:02d}",
            supplier_name=f"Supplier {i + 1:02d}",
            country=countries[i % len(countries)],
            category=cats[i],
            otif_pct=round(float(np.clip(rng.normal(0.90, 0.05), 0.70, 0.99)) * 100, 1),
        ))
    return pd.DataFrame(rows)


def make_raw_materials(rng, suppliers):
    sup_by_cat = {c: suppliers.loc[suppliers.category == c, "supplier_id"].tolist()
                  for c in ["natural", "synthetic", "solvent"]}
    rows = []
    k = 0

    def add(rm_type, name, origin, base, co2, circular):
        nonlocal k
        k += 1
        code = f"RM-{k:03d}"
        sup = rng.choice(sup_by_cat[rm_type])
        single = rng.random() < {"natural": 0.40, "synthetic": 0.15, "solvent": 0.0}[rm_type]
        sec = None
        if not single:
            sec = rng.choice([s for s in sup_by_cat[rm_type] if s != sup])
        rows.append(dict(
            rm_code=code, rm_name=name, rm_type=rm_type, origin=origin,
            climate_exposed=origin in C.CLIMATE_EXPOSED_ORIGINS,
            circular_feedstock=circular,
            co2e_kg_per_kg=round(co2 * (0.5 if circular else 1.0), 2),
            base_price_chf_kg=round(base, 2),
            primary_supplier=sup,
            secondary_supplier=sec,
            ifra_limit_pct=np.nan,
        ))

    for i in range(C.N_NATURAL_RM):
        base = float(np.clip(rng.lognormal(np.log(90), 0.6), 20, 600))
        origin = C.NATURAL_ORIGINS[i % len(C.NATURAL_ORIGINS)]
        add("natural", f"Natural {C.NATURAL_BASES[i % len(C.NATURAL_BASES)]} ({origin})",
            origin, base, float(rng.uniform(3, 8)), circular=(i % 3 == 0))
    for i in range(C.N_SYNTH_RM):
        base = float(np.clip(rng.lognormal(np.log(25), 0.5), 5, 120))
        origin = C.SYNTH_ORIGINS[i % len(C.SYNTH_ORIGINS)]
        add("synthetic", f"Aroma chemical AC-{i + 1:02d}", origin, base,
            float(rng.uniform(4, 12)), circular=False)
    for i in range(C.N_SOLVENT_RM):
        origin = "CH"
        add("solvent", f"Solvent / carrier SV-{i + 1:02d}", origin, float(rng.uniform(2, 6)),
            float(rng.uniform(1, 2)), circular=(i % 3 == 0))

    rms = pd.DataFrame(rows)
    # Regulatory limits on 6 RMs (3 naturals, 3 synthetics).
    limited = list(rms[rms.rm_type == "natural"].rm_code.iloc[:3]) + \
        list(rms[rms.rm_type == "synthetic"].rm_code.iloc[:3])
    for code, lim in zip(limited, C.IFRA_LIMITS):
        rms.loc[rms.rm_code == code, "ifra_limit_pct"] = lim
    return rms


def make_rm_prices(rng, rms):
    months = pd.period_range(C.PRICE_START, C.END, freq="M")
    shock_idx = (months >= pd.Period(C.CLIMATE_SHOCK_START, "M")) & \
        (months <= pd.Period(C.CLIMATE_SHOCK_END, "M"))
    vol = {"natural": 0.035, "synthetic": 0.012, "solvent": 0.008}
    wide = {}
    for _, r in rms.iterrows():
        lp = np.log(r.base_price_chf_kg)
        path = []
        for m in range(len(months)):
            lp += rng.normal(0, vol[r.rm_type])
            shock = C.CLIMATE_SHOCK_SIZE if (r.climate_exposed and r.rm_type == "natural"
                                             and shock_idx[m]) else 0.0
            path.append(np.exp(lp + shock))
        wide[r.rm_code] = path
    wide = pd.DataFrame(wide, index=[str(m) for m in months])
    wide.index.name = "month"
    return wide


# -------------------------------------------------------------- formulas -----
def _pick(rng, df, k):
    if len(df) == 0:
        return []
    k = min(k, len(df))
    idx = rng.choice(len(df), k, replace=False)
    return df.rm_code.iloc[idx].tolist()


def build_formula(rng, rms, circular):
    restricted = rms[rms.ifra_limit_pct.notna()]
    restricted_pct = {}
    if (not circular) and rng.random() < 0.25:
        r = restricted.iloc[int(rng.integers(len(restricted)))]
        restricted_pct[r.rm_code] = float(rng.uniform(0.1, r.ifra_limit_pct * 1.6))
    pool = rms[~rms.rm_code.isin(restricted.rm_code)]  # limited RMs only as controlled traces
    nat = pool[pool.rm_type == "natural"]
    syn = pool[pool.rm_type == "synthetic"]
    sol = pool[pool.rm_type == "solvent"]
    if circular:
        nat = nat[nat.circular_feedstock]
        sol = sol[sol.circular_feedstock]
    groups = {
        "natural": _pick(rng, nat, int(rng.integers(2, 6))),
        "synthetic": _pick(rng, syn, int(rng.integers(4, 9))),
        "solvent": _pick(rng, sol, int(rng.integers(1, 3))),
    }
    groups = {t: c for t, c in groups.items() if c}
    rest_total = 100 - sum(restricted_pct.values())
    share = {t: C.TYPE_WEIGHT_SHARE[t] * float(rng.normal(1, 0.1)) for t in groups}
    tot = sum(share.values())
    lines = dict(restricted_pct)
    for t, codes in groups.items():
        g_total = rest_total * share[t] / tot
        w = rng.uniform(0.5, 1.5, len(codes))
        for c, wi in zip(codes, w):
            lines[c] = g_total * wi / w.sum()
    out = {c: round(v, 2) for c, v in lines.items()}
    diff = round(100 - sum(out.values()), 2)
    biggest = max(out, key=out.get)
    out[biggest] = round(out[biggest] + diff, 2)
    return out


def formula_cost(lines, prices_row):
    return float(sum(pct / 100.0 * prices_row[c] for c, pct in lines.items()))


# ----------------------------------------------------------- transactions ----
def make_briefs_and_formulas(rng, customers, perfumers, rms, prices):
    start = pd.Timestamp(C.BRIEF_START)
    span = (pd.Timestamp(C.END) - pd.Timedelta(days=150) - start).days
    received = start + pd.to_timedelta(np.sort(rng.integers(0, span, C.N_BRIEFS)), unit="D")

    tier_w = customers.tier.map({"A": 3.0, "B": 2.0, "C": 1.0}).to_numpy()
    tier_w = tier_w / tier_w.sum()
    cust_idx = rng.choice(len(customers), C.N_BRIEFS, p=tier_w)
    perf_w = perfumers.load_weight.to_numpy() / perfumers.load_weight.sum()

    briefs, formulas, truth = [], [], []
    for i in range(C.N_BRIEFS):
        cust = customers.iloc[cust_idx[i]]
        perf = perfumers.iloc[rng.choice(len(perfumers), p=perf_w)]
        family = str(rng.choice(C.FAMILIES))
        family_match = int(family in (perf.specialisation_1, perf.specialisation_2))
        circular = bool(rng.random() < C.CIRCULAR_SHARE_OF_BRIEFS)
        brief_id = f"BR-{i + 1:05d}"
        formula_id = f"F-{i + 1:05d}"
        lines = build_formula(rng, rms, circular)
        rec = received[i]
        row_prices = prices.loc[str(rec.to_period("M"))]
        std_cost = formula_cost(lines, row_prices)
        target = std_cost * C.MARKUP[cust.segment] * float(rng.lognormal(0, 0.08))
        price_ratio = 1 + rng.normal(0.02, 0.05)
        quote = target * price_ratio
        response_hours = round(float(np.clip(rng.lognormal(np.log(30), 0.7), 2, 400)), 1)
        iterations = int(np.clip(rng.poisson(2.5) + 1, 1, 8))

        # --- planted win model -----------------------------------------
        t = C.WIN_TRUTH
        days_over = min(max(response_hours / 24 - 2, 0), 3)
        lo = _logit(C.WIN_BASE_P) \
            + t["family_match"] * family_match \
            + t["days_over_2"] * days_over \
            + t["iterations_over_4"] * max(iterations - 4, 0) \
            + t["price_pct_over_target"] * (price_ratio - 1) \
            + (t["tier_A"] if cust.tier == "A" else 0) \
            + (t["tier_C"] if cust.tier == "C" else 0)
        p_win = float(_sigmoid(lo))
        decided = rng.random() > 0.05
        won = decided and (rng.random() < p_win)

        first_sample = rec + pd.to_timedelta(response_hours, unit="h")
        submitted = first_sample + pd.to_timedelta(
            float(iterations * rng.lognormal(np.log(4), 0.3)), unit="D")
        decision = submitted + pd.to_timedelta(float(rng.lognormal(np.log(18), 0.4)), unit="D") \
            if decided else pd.NaT
        shipped = decision + pd.to_timedelta(float(rng.lognormal(np.log(40), 0.4)), unit="D") \
            if won else pd.NaT

        end = pd.Timestamp(C.END)
        if pd.isna(decision) or decision > end:
            outcome = "open" if decided else "no_decision"
        else:
            outcome = "won" if won else "lost"

        loss_reason = None
        if outcome == "lost":
            probs = [0.55, 0.15, 0.15, 0.10, 0.05] if price_ratio > 1.03 \
                else [0.20, 0.20, 0.30, 0.20, 0.10]
            loss_reason = str(rng.choice(
                ["price", "timing", "olfactive_fit", "relationship", "other"], p=probs))

        briefs.append(dict(
            brief_id=brief_id,
            crm_id=cust.crm_id,
            received_date=rec.date(),
            perfumer_id=perf.perfumer_id,
            olfactive_family=family,
            segment=cust.segment,
            response_hours=response_hours,
            sample_iterations=iterations,
            target_price_chf_kg=round(target, 2),
            quoted_price_chf_kg=round(quote, 2),
            outcome=outcome,
            loss_reason=loss_reason,
            first_sample_date=first_sample.date(),
            submitted_date=submitted.date(),
            decision_date=None if pd.isna(decision) else decision.date(),
            shipped_date=None if pd.isna(shipped) else shipped.date(),
            formula_id=formula_id,
            is_circular_brief=circular,
        ))
        formulas.append(dict(formula_id=formula_id, brief_id=brief_id,
                             created_date=rec.date(), lines=lines,
                             std_cost_chf_kg=round(std_cost, 2), circular=circular,
                             segment=cust.segment, customer_id=cust.customer_id))
        truth.append(dict(brief_id=brief_id, true_win_prob=round(p_win, 4),
                          family_match=family_match, days_over_2=round(days_over, 3),
                          iterations=iterations, price_ratio=round(price_ratio, 4),
                          tier=cust.tier, true_won=int(won), outcome=outcome))
    return pd.DataFrame(briefs), formulas, pd.DataFrame(truth)


def make_orders(rng, customers, briefs, formulas, prices):
    months = pd.period_range(C.BRIEF_START, C.END, freq="M")
    cust = customers.set_index("customer_id")
    # One optional list-price increase per customer, at a random month in 2025-2026H1.
    inc_month, inc_size = {}, {}
    for cid in customers.customer_id:
        if rng.random() < C.PRICE_INCREASE_PROB:
            inc_month[cid] = int(rng.integers(24, 42))  # 2025-01 .. 2026-06 (window starts 2023-01)
            inc_size[cid] = float(rng.normal(C.PRICE_INCREASE_MEAN, C.PRICE_INCREASE_SD))

    crm_to_cust = customers.set_index("crm_id")
    won = briefs[briefs.outcome == "won"].merge(
        pd.DataFrame(formulas)[["formula_id", "lines", "customer_id", "circular"]],
        on="formula_id")
    items, orders = [], []
    order_no = 0
    for _, b in won.iterrows():
        if pd.isna(b.shipped_date):
            continue
        cid = crm_to_cust.loc[b.crm_id, "customer_id"]
        c = cust.loc[cid]
        compound_id = "CMP-" + b.brief_id[3:]
        base_qty = float(rng.lognormal(np.log(350), 0.5)) * C.SEGMENT_VOLUME[c.segment]
        items.append(dict(compound_id=compound_id, formula_id=b.formula_id,
                          erp_customer_id=c.erp_id, customer_id=cid,
                          segment=c.segment, is_circular=bool(b.is_circular_brief),
                          quoted_price_chf_kg=b.quoted_price_chf_kg,
                          base_qty_kg=round(base_qty, 1)))
        ship_m = pd.Period(str(pd.Timestamp(b.shipped_date)), "M")
        p_order = C.ORDER_PROB_BY_TIER[c.tier]
        for m in months[months >= ship_m]:
            if rng.random() >= p_order:
                continue
            mi = int(months.get_loc(m))
            idx = (1 + inc_size[cid]) if (cid in inc_month and mi >= inc_month[cid]) else 1.0
            price_rel = idx * ((1 + C.CIRCULAR_PREMIUM) if b.is_circular_brief else 1.0)
            qty = base_qty * C.MONTHLY_SEASONALITY[m.month - 1] * \
                price_rel ** c.true_elasticity * float(rng.lognormal(0, 0.08))
            day = int(rng.integers(0, m.days_in_month))
            order_no += 1
            orders.append(dict(
                order_id=f"SO-{order_no:06d}",
                erp_customer_id=c.erp_id,
                compound_id=compound_id,
                order_date=(m.start_time + pd.Timedelta(days=day)).date(),
                qty_kg=round(qty, 1),
                unit_price_chf_kg=round(b.quoted_price_chf_kg * price_rel, 2),
                currency="CHF",
            ))
    orders = pd.DataFrame(orders)
    # Returns (negative quantity) and missing prices, as found in real ERP extracts.
    ret = rng.random(len(orders)) < 0.005
    orders.loc[ret, "qty_kg"] = -orders.loc[ret, "qty_kg"].abs()
    miss = rng.random(len(orders)) < 0.005
    orders.loc[miss, "unit_price_chf_kg"] = np.nan
    return pd.DataFrame(items), orders, inc_month, inc_size


def make_sustainability_requests(rng, customers):
    start = pd.Timestamp("2025-01-01")
    n = 150
    days = rng.integers(0, (pd.Timestamp(C.END) - start).days, n)
    req = start + pd.to_timedelta(days, unit="D")
    done = req + pd.to_timedelta(np.round(rng.lognormal(np.log(4), 0.5, n)), unit="D")
    cust = customers.sample(n, replace=True, random_state=int(rng.integers(1e6)))
    return pd.DataFrame(dict(
        request_id=[f"SR-{i + 1:04d}" for i in range(n)],
        crm_id=cust.crm_id.values,
        requested_date=req.date,
        delivered_date=done.date,
    ))


# ------------------------------------------------------------ dirt + write ---
def inject_dirt(rng, briefs, crm_customers, lines, gt):
    """Realistic messiness so the silver layer has real work to do."""
    counts = {}
    # 1) duplicate brief rows in the CRM export
    dup = briefs.sample(frac=0.02, random_state=int(rng.integers(1e6)))
    briefs = pd.concat([briefs, dup], ignore_index=True)
    counts["duplicate_brief_rows"] = len(dup)
    # 2) CRM ids with stray whitespace / lowercase
    m = rng.random(len(briefs)) < 0.03
    briefs.loc[m, "crm_id"] = briefs.loc[m, "crm_id"].str.lower().map(lambda s: f" {s} ")
    counts["brief_crm_id_dirty"] = int(m.sum())
    # 3) missing response times
    m = rng.random(len(briefs)) < 0.04
    briefs.loc[m, "response_hours"] = np.nan
    counts["brief_response_hours_missing"] = int(m.sum())
    # 4) outcome label variants
    m = (briefs.outcome == "won") & (rng.random(len(briefs)) < 0.2)
    briefs.loc[m, "outcome"] = "WON "
    counts["outcome_label_variants"] = int(m.sum())
    # 5) customer names inconsistent in CRM
    crm_customers = crm_customers.copy()
    m = rng.random(len(crm_customers)) < 0.08
    crm_customers.loc[m, "customer_name"] = crm_customers.loc[m, "customer_name"].str.upper()
    counts["crm_name_case_variants"] = int(m.sum())
    # 6) lower-case RM codes in formulation export
    lines = lines.copy()
    m = rng.random(len(lines)) < 0.02
    lines.loc[m, "rm_code"] = lines.loc[m, "rm_code"].str.lower()
    counts["formula_rm_code_case"] = int(m.sum())
    gt["dq_injected"] = counts
    return briefs, crm_customers, lines


def run(seed: int = C.SEED):
    rng = np.random.default_rng(seed)
    C.BRONZE_DIR.mkdir(parents=True, exist_ok=True)
    C.GROUND_TRUTH_DIR.mkdir(parents=True, exist_ok=True)

    customers = make_customers(rng)
    perfumers = make_perfumers(rng)
    suppliers = make_suppliers(rng)
    rms = make_raw_materials(rng, suppliers)
    prices = make_rm_prices(rng, rms)

    briefs, formulas, brief_truth = make_briefs_and_formulas(rng, customers, perfumers, rms, prices)
    items, orders, inc_month, inc_size = make_orders(rng, customers, briefs, formulas, prices)
    sust = make_sustainability_requests(rng, customers)

    lines = pd.DataFrame([
        dict(formula_id=f["formula_id"], rm_code=c, pct=p)
        for f in formulas for c, p in f["lines"].items()
    ])
    formulas_tbl = pd.DataFrame([{k: v for k, v in f.items() if k != "lines"} for f in formulas])

    crm_customers = pd.DataFrame(dict(
        crm_id=customers.crm_id, customer_name=customers.name, segment=customers.segment,
        tier=customers.tier, region=customers.region))
    erp_customers = pd.DataFrame(dict(
        erp_id=customers.erp_id, customer_name=customers.name.str.title(),
        region=customers.region))
    # Crosswalk: one primary ERP id per CRM id, plus 3 CRM ids with a second ERP account.
    xw = [dict(crm_id=r.crm_id, erp_id=r.erp_id, is_primary=True) for r in customers.itertuples()]
    dup_ids = rng.choice(len(customers), 3, replace=False)
    for k, idx in enumerate(dup_ids):
        r = customers.iloc[idx]
        xw.append(dict(crm_id=r.crm_id, erp_id=str(20000 + k), is_primary=False))
        erp_customers = pd.concat([erp_customers, pd.DataFrame([dict(
            erp_id=str(20000 + k), customer_name=r["name"].title() + " (2)", region=r.region)])],
            ignore_index=True)
    crosswalk = pd.DataFrame(xw)

    gt = dict(
        seed=seed,
        win_truth=C.WIN_TRUTH,
        win_base_p=C.WIN_BASE_P,
        tier_elasticity=C.TIER_ELASTICITY,
        customer_true_elasticity=dict(zip(customers.customer_id, customers.true_elasticity.round(3))),
        circular_premium=C.CIRCULAR_PREMIUM,
        single_source_rm=rms.loc[rms.secondary_supplier.isna(), "rm_code"].tolist(),
        ifra_limited_rm=dict(zip(rms.loc[rms.ifra_limit_pct.notna(), "rm_code"],
                                 rms.loc[rms.ifra_limit_pct.notna(), "ifra_limit_pct"].astype(float))),
        climate_shock=dict(start=C.CLIMATE_SHOCK_START, end=C.CLIMATE_SHOCK_END,
                           size=C.CLIMATE_SHOCK_SIZE),
        price_increase_customers=len(inc_month),
    )

    briefs_dirty, crm_customers_dirty, lines_dirty = inject_dirt(
        rng, briefs, crm_customers, lines, gt)

    # ---- write bronze (raw exports, as the source systems would hand them over)
    b = C.BRONZE_DIR
    briefs_dirty.to_csv(b / "crm_briefs.csv", index=False)
    crm_customers_dirty.to_csv(b / "crm_customers.csv", index=False)
    sust.to_csv(b / "crm_sustainability_requests.csv", index=False)
    perfumers.to_csv(b / "hr_perfumers.csv", index=False)
    erp_customers.to_csv(b / "erp_customers.csv", index=False)
    crosswalk.to_csv(b / "customer_crosswalk.csv", index=False)
    orders.to_csv(b / "erp_sales_orders.csv", index=False)
    items.to_csv(b / "erp_compounds.csv", index=False)
    formulas_tbl.to_csv(b / "formulation_formulas.csv", index=False)
    lines_dirty.to_csv(b / "formulation_lines.csv", index=False)
    suppliers.to_csv(b / "erp_suppliers.csv", index=False)
    rms_out = rms.drop(columns=["ifra_limit_pct"])
    rms_out.to_csv(b / "erp_raw_materials.csv", index=False)
    rms[["rm_code", "ifra_limit_pct"]].dropna().to_csv(b / "regulatory_ifra_limits.csv", index=False)
    prices.reset_index().melt(id_vars="month", var_name="rm_code", value_name="price_chf_kg") \
        .round({"price_chf_kg": 2}).to_csv(b / "rm_price_feed.csv", index=False)

    # ---- ground truth (never read by the pipeline; used only by tests / validation)
    brief_truth.to_csv(C.GROUND_TRUTH_DIR / "brief_truth.csv", index=False)
    with open(C.GROUND_TRUTH_DIR / "ground_truth.json", "w") as fh:
        json.dump(gt, fh, indent=2, default=str)

    print(f"Simulated {len(briefs_dirty)} brief rows, {len(orders)} order lines, "
          f"{items.compound_id.nunique()} compounds, {len(rms)} raw materials.")
    print("Injected dirt:", gt["dq_injected"])
    return dict(briefs=len(briefs_dirty), orders=len(orders))


if __name__ == "__main__":
    run()
