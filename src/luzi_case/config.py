"""World definition for the LUZI-style Data & Analytics case.

Everything here is SIMULATED. Company names, customers, suppliers, raw materials,
formulas, prices and sales are invented to mirror the shape of a mid-size
fragrance-compound manufacturer. Nothing is taken from LUZI AG's real systems
or data. The business logic (win drivers, price elasticity, circular premium)
is planted on purpose so the analyses can be checked against a known answer.
"""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / "data"
BRONZE_DIR = DATA_DIR / "bronze"
SILVER_DIR = DATA_DIR / "silver"
GOLD_DIR = DATA_DIR / "gold"
GROUND_TRUTH_DIR = DATA_DIR / "_ground_truth"

SEED = 20261118

BRIEF_START = "2023-01-01"  # history starts a year before the reporting window (no ramp-up artefact)
START = "2024-01-01"  # reporting window start (LTM / prior-year comparisons)
END = "2026-10-31"           # last full month of data (today is 2026-11-18)
PRICE_START = "2022-10"      # RM prices start before the first brief (cost roll-ups)

# ---- scale -----------------------------------------------------------------
N_CUSTOMERS = 60
N_BRIEFS = 1400
N_PERFUMERS = 14
N_SUPPLIERS = 25
N_NATURAL_RM = 24
N_SYNTH_RM = 24
N_SOLVENT_RM = 12

# ---- business vocabulary ---------------------------------------------------
SEGMENTS = ["fine_fragrance", "personal_care", "home_care", "air_care", "industrial"]
SEGMENT_MIX = [0.20, 0.30, 0.20, 0.15, 0.15]
# Target price = standard cost x markup (+ noise). Markup differs by segment.
MARKUP = {"fine_fragrance": 2.4, "personal_care": 1.9, "home_care": 1.7,
          "air_care": 1.8, "industrial": 1.5}

REGIONS = ["CH", "EU", "GCC", "NA", "APAC", "LATAM"]
REGION_MIX = [0.20, 0.30, 0.10, 0.20, 0.10, 0.10]

TIERS = ["A", "B", "C"]
TIER_MIX = [0.20, 0.40, 0.40]
# Latent (true) price elasticity of volume by customer tier. Used by the
# simulator; the analysis has to recover these from the data.
TIER_ELASTICITY = {"A": -0.6, "B": -1.1, "C": -1.6}

FAMILIES = ["Floral", "Woody", "Citrus", "Fresh", "Oriental", "Aromatic", "Gourmand", "Green"]

NAME_PREFIXES = [
    "Halden", "Varro", "Lumen", "Sable", "Corvin", "Alder", "Brisa", "Ondine", "Estera",
    "Maren", "Tessin", "Vesta", "Oriel", "Kestrel", "Fenwick", "Solace", "Aurin", "Briar",
    "Calder", "Dorado",
]
NAME_SUFFIXES = ["Beauty", "Home", "Labs", "Care", "Atelier", "Naturals", "Air", "Industries",
                 "Goods", "Collective"]

NATURAL_BASES = ["Bergamot", "Vetiver", "Patchouli", "Sandalwood", "Rose", "Jasmine", "Orange",
                 "Lavender", "Tonka", "Vanilla", "Oakmoss", "Cedar", "Ginger", "Geranium", "Ylang"]
NATURAL_ORIGINS = ["Madagascar", "India", "Indonesia", "France", "Bulgaria", "Morocco", "Brazil"]
CLIMATE_EXPOSED_ORIGINS = {"Madagascar", "India", "Indonesia"}
SYNTH_ORIGINS = ["CH", "DE", "CN", "IN"]

# Fraction of formula weight by raw-material type (before random jitter).
TYPE_WEIGHT_SHARE = {"natural": 0.30, "synthetic": 0.45, "solvent": 0.25}

# Standard seasonality of demand by calendar month (Jan..Dec).
MONTHLY_SEASONALITY = [0.92, 0.90, 1.00, 1.04, 1.00, 0.96, 0.90, 0.95, 1.04, 1.08, 1.10, 1.10]

# ---- planted win-driver truth (logit scale) --------------------------------
WIN_BASE_P = 0.30
WIN_TRUTH = {
    "family_match": 0.90,            # perfumer specialises in the brief's family
    "days_over_2": -0.20,            # per day of response time beyond 2 days (capped at 3)
    "iterations_over_4": -0.25,      # per sample round beyond 4
    "price_pct_over_target": -6.0,   # per 1.0 of quote/target ratio above 1 (~ -0.3 per +5%)
    "tier_A": 0.30,
    "tier_C": -0.20,
}

# ---- planted sustainability truth -----------------------------------------
CIRCULAR_PREMIUM = 0.06              # Circular Toolbox compounds sell at +6% vs comparable
CIRCULAR_SHARE_OF_BRIEFS = 0.10

# ---- planted regulatory (IFRA-style) limits --------------------------------
N_IFRA_LIMITED_RM = 6
IFRA_LIMITS = [0.5, 1.0, 0.2, 2.0, 0.1, 1.5]  # max % of formula weight, per limited RM

# ---- price increase programme ---------------------------------------------
PRICE_INCREASE_PROB = 0.5        # share of customers with one list-price increase
PRICE_INCREASE_MEAN = 0.06
PRICE_INCREASE_SD = 0.02

# Typical monthly kg volume multiplier by segment (applied to each compound).
SEGMENT_VOLUME = {"fine_fragrance": 0.35, "personal_care": 1.0, "home_care": 1.6,
                  "air_care": 1.4, "industrial": 2.2}
# Share of compounds' customers that order in a given month, by tier.
ORDER_PROB_BY_TIER = {"A": 0.75, "B": 0.60, "C": 0.50}
CLIMATE_SHOCK_START = "2025-06"  # naturals from climate-exposed origins spike
CLIMATE_SHOCK_END = "2025-12"
CLIMATE_SHOCK_SIZE = 0.25        # +25% level shift in that window

# Orders are generated from shipment onwards.
MONTHLY_ORDER_PROB = 0.60
