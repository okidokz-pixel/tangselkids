"""
TangselKids – Supabase Export Script
Fetches all data from Supabase and writes to an Excel file.

Usage:
    python scripts/export_from_supabase.py

Requirements:
    pip install pandas openpyxl requests
"""

import requests
import pandas as pd
from datetime import datetime

# ── CONFIG ────────────────────────────────────────────────────────────────────

SUPABASE_URL = "https://szyujzbnfkkqwoeuyjwg.supabase.co"
SUPABASE_KEY = "sb_publishable_Y28TUw1a9PK4oSB5MGp-KQ_rxJN_QDB"

OUTPUT_FILE = f"C:/Users/USER/Downloads/TangselKids_Export_{datetime.now().strftime('%Y%m%d_%H%M')}.xlsx"

# ── FETCH ─────────────────────────────────────────────────────────────────────

def fetch_table(table: str) -> list[dict]:
    """Fetch all rows from a Supabase table (handles pagination)."""
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Range-Unit": "items",
    }
    rows = []
    offset = 0
    page_size = 1000
    while True:
        resp = requests.get(
            f"{SUPABASE_URL}/rest/v1/{table}",
            headers={**headers, "Range": f"{offset}-{offset + page_size - 1}"},
            params={"select": "*", "order": "name.asc"},
        )
        if resp.status_code not in (200, 206):
            print(f"  ERROR fetching {table}: {resp.status_code} {resp.text[:200]}")
            break
        batch = resp.json()
        rows.extend(batch)
        if len(batch) < page_size:
            break
        offset += page_size
    return rows


# ── TABLES ────────────────────────────────────────────────────────────────────

TABLES = [
    ("schools",          "Schools"),
    ("daycares",         "Daycares"),
    ("learning_centers", "Learning Centers"),
    ("playgrounds",      "Playgrounds"),
    ("clinics",          "Clinics"),
    ("cafes",            "Cafes"),
    ("mini_zoo",         "Mini Zoo"),
    ("swimming_pools",   "Swimming Pools"),
    ("bookstores",       "Bookstores"),
    ("others",           "Others"),
]

# ── MAIN ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print(f"Exporting to {OUTPUT_FILE}\n")

    with pd.ExcelWriter(OUTPUT_FILE, engine="openpyxl") as writer:
        for table, sheet_name in TABLES:
            print(f"  Fetching {table}...")
            rows = fetch_table(table)
            if rows:
                df = pd.DataFrame(rows)
                # Put id, name, area, latitude, longitude first for easy editing
                priority = [c for c in ["id", "name", "area", "latitude", "longitude"] if c in df.columns]
                rest = [c for c in df.columns if c not in priority]
                df = df[priority + rest]
                df.to_excel(writer, sheet_name=sheet_name, index=False)
                print(f"    -> {len(df)} rows written to sheet '{sheet_name}'")
            else:
                pd.DataFrame().to_excel(writer, sheet_name=sheet_name, index=False)
                print(f"    -> empty sheet '{sheet_name}'")

    print(f"\nDone. File saved to:\n  {OUTPUT_FILE}")
