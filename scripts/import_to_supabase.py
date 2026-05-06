"""
TangselKids – Supabase Import Script
Reads the spreadsheet, geocodes addresses, and inserts all data into Supabase.

Usage:
    python scripts/import_to_supabase.py

Requirements:
    pip install pandas openpyxl requests
"""

import re
import time
import json
import pandas as pd
import requests

# ── CONFIG ────────────────────────────────────────────────────────────────────

SPREADSHEET = "C:/Users/USER/Downloads/Family_Directory_Bintaro_BSD_v20_5.xlsx"

SUPABASE_URL = "https://szyujzbnfkkqwoeuyjwg.supabase.co"
SUPABASE_KEY = "sb_publishable_Y28TUw1a9PK4oSB5MGp-KQ_rxJN_QDB"

# Set to True to skip geocoding (useful for re-runs when coords already exist)
SKIP_GEOCODING = False

# ── HELPERS ───────────────────────────────────────────────────────────────────

NULL_VALUES = {"-", "", "nan", "none", "n/a", "cek website", "gratis/umum", "-"}

def clean(val):
    """Return None for null-like values, strip whitespace and (est.) notes otherwise."""
    if val is None or (isinstance(val, float) and str(val) == "nan"):
        return None
    s = str(val).strip()
    if s.lower() in NULL_VALUES:
        return None
    # Strip common noise
    s = re.sub(r"\s*\(est\.\)", "", s, flags=re.IGNORECASE).strip()
    s = re.sub(r"\s*\(estimasi\)", "", s, flags=re.IGNORECASE).strip()
    return s or None


def clean_phone(val):
    """Strip noise from phone/WA values."""
    v = clean(val)
    if not v:
        return None
    # Remove trailing notes like " (WA only)" etc.
    v = re.sub(r"\s*\(.*?\)", "", v).strip()
    return v or None


def to_int(val):
    """Parse year or integer field."""
    v = clean(val)
    if not v:
        return None
    try:
        return int(float(v))
    except (ValueError, TypeError):
        return None


def to_float(val):
    """Parse rating (handle comma as decimal separator)."""
    v = clean(val)
    if not v:
        return None
    try:
        return float(str(v).replace(",", "."))
    except (ValueError, TypeError):
        return None


def parse_price(text):
    """
    Parse an Indonesian price string into (price_min, price_max) in Rupiah.
    Returns (None, None) when unparseable.
    Returns (0, 0) for free/gratis.

    Handles:
        ~Rp 123.500           → (123500, 123500)
        ~Rp1.700.000/bln      → (1700000, 1700000)
        Rp 65rb weekday       → (65000, 65000)
        Rp 65rb; Rp 100rb     → (65000, 100000)
        Rp 300.000–500.000    → (300000, 500000)
        1.5jt                 → (1500000, 1500000)
        Gratis                → (0, 0)
    """
    if text is None or (isinstance(text, float) and str(text) == "nan"):
        return None, None
    s = str(text).strip()
    if s in ["-", "", "nan", "Cek website"]:
        return None, None
    if s.lower().startswith("gratis"):
        return 0, 0

    pattern = re.compile(r"(\d[\d.,]*)\s*(rb|ribu|jt|juta|k)?", re.IGNORECASE)
    values = []
    for m in pattern.finditer(s):
        num_s, unit = m.group(1), (m.group(2) or "").lower()
        try:
            # Decide if period is thousands-sep or decimal point
            if unit and num_s.count(".") == 1 and not num_s.endswith("."):
                # "1.5jt" style → decimal
                val = float(num_s.replace(",", "."))
            else:
                # "1.700.000" or "123.500" → thousands separators
                val = float(num_s.replace(".", "").replace(",", ""))

            if unit in ("rb", "ribu", "k"):
                val *= 1_000
            elif unit in ("jt", "juta"):
                val *= 1_000_000

            if val >= 100:   # ignore noise like "65" in "65th"
                values.append(int(val))
        except (ValueError, TypeError):
            pass

    if not values:
        return None, None
    return min(values), max(values)


def split_array(val):
    """Split comma-separated string into a cleaned list, or return []."""
    v = clean(val)
    if not v:
        return []
    return [x.strip() for x in re.split(r"[,;]", v) if x.strip() and x.strip() not in NULL_VALUES]


def to_bool(val, true_tokens=("ya", "ada", "yes", "true", "1")):
    """Convert Ya/Ada/Tidak/Tidak Ada to boolean, None if unknown."""
    v = clean(val)
    if not v:
        return None
    return v.lower().split()[0] in true_tokens


# ── GEOCODING ─────────────────────────────────────────────────────────────────

_geocache: dict[str, tuple] = {}

def geocode(address: str) -> tuple[float | None, float | None]:
    """Geocode using Nominatim (1 req/sec limit)."""
    if SKIP_GEOCODING or not address:
        return None, None
    if address in _geocache:
        return _geocache[address]

    # Append city for better results if not already there
    query = address if "tangerang" in address.lower() else f"{address}, Tangerang Selatan, Indonesia"
    try:
        resp = requests.get(
            "https://nominatim.openstreetmap.org/search",
            params={"q": query, "format": "json", "limit": 1},
            headers={"User-Agent": "TangselKids/1.0 (tangselkids@gmail.com)"},
            timeout=10,
        )
        time.sleep(1.1)  # Nominatim rate limit: 1 req/sec
        results = resp.json()
        if results:
            lat, lon = float(results[0]["lat"]), float(results[0]["lon"])
            _geocache[address] = (lat, lon)
            return lat, lon
    except Exception as e:
        print(f"  Geocode error for '{address[:50]}': {e}")
    _geocache[address] = (None, None)
    return None, None


# ── SUPABASE INSERT ───────────────────────────────────────────────────────────

def supabase_insert(table: str, rows: list[dict]):
    """Batch-insert rows into a Supabase table."""
    if not rows:
        print(f"  {table}: no rows to insert")
        return
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal",
    }
    # Supabase has a ~1MB body limit; chunk if needed
    chunk_size = 200
    for i in range(0, len(rows), chunk_size):
        chunk = rows[i : i + chunk_size]
        resp = requests.post(url, headers=headers, data=json.dumps(chunk))
        if resp.status_code not in (200, 201):
            print(f"  ERROR inserting into {table}: {resp.status_code} {resp.text[:200]}")
        else:
            print(f"  {table}: inserted rows {i+1}–{i+len(chunk)}")


# ── DATA LOADERS ─────────────────────────────────────────────────────────────

def load_tab(xl, tab_name):
    """Return a DataFrame of clean data rows (skips title rows & section headers)."""
    df = pd.read_excel(xl, sheet_name=tab_name, header=None)
    # Find the header row (where col[0] == 'No')
    header_row = next(i for i, row in df.iterrows() if str(row[0]).strip() == "No")
    cols = list(df.iloc[header_row])
    data = df.iloc[header_row + 1 :].copy()
    data.columns = cols
    # Keep only rows where 'No' is a digit (real data rows)
    data = data[data["No"].apply(lambda x: str(x).strip().isdigit())].copy()
    # Deduplicate within the spreadsheet on the name column (keeps first occurrence)
    name_col = next((c for c in cols if c not in [None, "No"] and "nama" in str(c).lower()), None)
    if name_col:
        data = data.drop_duplicates(subset=[name_col]).copy()
    data = data.reset_index(drop=True)
    return data


def import_schools(xl):
    df = load_tab(xl, "🏫 Schools")
    # Deduplicate: same school appears once per jenjang section; Jenjang col already has full list
    df = df.drop_duplicates(subset=["Nama Sekolah"]).copy()
    print(f"  Schools: {len(df)} unique schools after dedup")

    rows = []
    for _, r in df.iterrows():
        addr = clean(r["Alamat"])
        lat, lon = geocode(addr) if addr else (None, None)
        pmin, _ = parse_price(r.get("SPP/Bulan (est.)"))
        upmin, _ = parse_price(r.get("Uang Pangkal (est.)"))
        rows.append({
            "name":               clean(r["Nama Sekolah"]),
            "google_rating":      to_float(r["Google Rating"]),
            "address":            addr,
            "latitude":           lat,
            "longitude":          lon,
            "phone":              clean_phone(r.get("Telepon")),
            "whatsapp":           clean_phone(r.get("WhatsApp")),
            "email":              clean(r.get("Email")),
            "hours":              clean(r.get("Jam Operasional")),
            "grades":             split_array(r.get("Jenjang")),
            "curriculum":         clean(r.get("Kurikulum")),
            "curriculum_category": clean(r.get("Kategori Kurikulum")),
            "teaching_language":  clean(r.get("Bahasa Pengantar")),
            "uang_pangkal":       clean(r.get("Uang Pangkal (est.)")),
            "uang_pangkal_min":   upmin,
            "spp_per_month":      clean(r.get("SPP/Bulan (est.)")),
            "price_min":          pmin,
            "students_per_class": to_int(r.get("Murid/Kelas")),
            "has_computer_lab":   to_bool(r.get("Lab Komputer")),
            "has_pool":           to_bool(r.get("Kolam Renang")),
            "instagram":          clean(r.get("Instagram")),
            "facebook":           clean(r.get("Facebook")),
            "tiktok":             clean(r.get("TikTok")),
            "website":            clean(r.get("Website")),
            "year_founded":       to_int(r.get("Tahun Berdiri")),
            "area":               clean(r.get("Area")),
            "location_detail":    clean(r.get("Lokasi Spesifik")),
        })
    supabase_insert("schools", rows)


def import_daycares(xl):
    df = load_tab(xl, "🍼 Daycares")
    rows = []
    for _, r in df.iterrows():
        addr = clean(r["Alamat"])
        lat, lon = geocode(addr) if addr else (None, None)
        pmin, _ = parse_price(r.get("Harga/Bulan (est.)"))
        rows.append({
            "name":              clean(r["Nama Daycare"]),
            "google_rating":     to_float(r["Google Rating"]),
            "address":           addr,
            "latitude":          lat,
            "longitude":         lon,
            "phone":             clean_phone(r.get("Telepon")),
            "whatsapp":          clean_phone(r.get("WhatsApp")),
            "email":             clean(r.get("Email")),
            "hours":             clean(r.get("Jam Buka")),
            "age_groups":        split_array(r.get("Usia")),
            "price_per_month":   clean(r.get("Harga/Bulan (est.)")),
            "price_min":         pmin,
            "carer_child_ratio": clean(r.get("Rasio Pengasuh:Anak")),
            "method":            clean(r.get("Metode / Kurikulum")),
            "has_cctv":          to_bool(r.get("CCTV & Akses Ortu")),
            "has_accreditation": to_bool(r.get("Akreditasi")),
            "instagram":         clean(r.get("Instagram")),
            "facebook":          clean(r.get("Facebook")),
            "tiktok":            clean(r.get("TikTok")),
            "website":           clean(r.get("Website")),
            "year_founded":      to_int(r.get("Tahun Berdiri")),
            "area":              clean(r.get("Area")),
            "location_detail":   clean(r.get("Lokasi Spesifik")),
        })
    supabase_insert("daycares", rows)


def import_learning_centers(xl):
    df = load_tab(xl, "📚 Learning Centers")
    rows = []
    for _, r in df.iterrows():
        addr = clean(r["Alamat"])
        lat, lon = geocode(addr) if addr else (None, None)
        pmin, _ = parse_price(r.get("Harga (est.)"))
        ft_raw = clean(r.get("Free Trial"))
        free_trial = None
        if ft_raw:
            free_trial = ft_raw.lower().startswith("ada") or ft_raw.lower() == "ya"
        rows.append({
            "name":                   clean(r["Nama"]),
            "google_rating":          to_float(r["Google Rating"]),
            "address":                addr,
            "latitude":               lat,
            "longitude":              lon,
            "phone":                  clean_phone(r.get("Telepon")),
            "whatsapp":               clean_phone(r.get("WhatsApp")),
            "email":                  clean(r.get("Email")),
            "hours":                  clean(r.get("Jam Buka")),
            "course_types":           split_array(r.get("Tipe")),
            "age_groups":             split_array(r.get("Rentang Usia")),
            "price_estimate":         clean(r.get("Harga (est.)")),
            "price_min":              pmin,
            "free_trial":             free_trial,
            "teacher_student_ratio":  clean(r.get("Rasio Guru:Murid")),
            "teaching_language":      clean(r.get("Bahasa Pengantar")),
            "instagram":              clean(r.get("Instagram")),
            "facebook":               clean(r.get("Facebook")),
            "tiktok":                 clean(r.get("TikTok")),
            "website":                clean(r.get("Website")),
            "year_founded":           to_int(r.get("Tahun Berdiri")),
            "area":                   clean(r.get("Area")),
            "location_detail":        clean(r.get("Lokasi Spesifik")),
        })
    supabase_insert("learning_centers", rows)


def import_playgrounds(xl):
    df = load_tab(xl, "🎡 Playgrounds")
    rows = []
    for _, r in df.iterrows():
        addr = clean(r["Alamat"])
        lat, lon = geocode(addr) if addr else (None, None)
        pmin, pmax = parse_price(r.get("Harga Tiket"))
        rows.append({
            "name":            clean(r["Nama"]),
            "google_rating":   to_float(r["Google Rating"]),
            "address":         addr,
            "latitude":        lat,
            "longitude":       lon,
            "phone":           clean_phone(r.get("Telepon")),
            "whatsapp":        clean_phone(r.get("WhatsApp")),
            "email":           clean(r.get("Email")),
            "hours":           clean(r.get("Jam Buka")),
            "price_ticket":    clean(r.get("Harga Tiket")),
            "price_min":       pmin,
            "price_max":       pmax,
            "playground_type": clean(r.get("Tipe")),
            "instagram":       clean(r.get("Instagram")),
            "facebook":        clean(r.get("Facebook")),
            "tiktok":          clean(r.get("TikTok")),
            "website":         clean(r.get("Website")),
            "year_founded":    to_int(r.get("Tahun Berdiri")),
            "area":            clean(r.get("Area")),
            "location_detail": clean(r.get("Lokasi Spesifik")),
        })
    supabase_insert("playgrounds", rows)


def import_clinics(xl):
    df = load_tab(xl, "🏥 Special Needs Clinics")
    rows = []
    for _, r in df.iterrows():
        addr = clean(r["Alamat"])
        lat, lon = geocode(addr) if addr else (None, None)
        pmin, _ = parse_price(r.get("Estimasi Biaya"))
        rows.append({
            "name":            clean(r["Nama Klinik"]),
            "google_rating":   to_float(r["Google Rating"]),
            "address":         addr,
            "latitude":        lat,
            "longitude":       lon,
            "phone":           clean_phone(r.get("Telepon")),
            "whatsapp":        clean_phone(r.get("WhatsApp")),
            "email":           clean(r.get("Email")),
            "hours":           clean(r.get("Jam Operasional")),
            "services":        split_array(r.get("Layanan")),
            "price_estimate":  clean(r.get("Estimasi Biaya")),
            "price_min":       pmin,
            "instagram":       clean(r.get("Instagram")),
            "facebook":        clean(r.get("Facebook")),
            "tiktok":          clean(r.get("TikTok")),
            "website":         clean(r.get("Website")),
            "year_founded":    to_int(r.get("Tahun Berdiri")),
            "area":            clean(r.get("Area")),
            "location_detail": clean(r.get("Lokasi Spesifik")),
        })
    supabase_insert("clinics", rows)


def import_cafes(xl):
    df = load_tab(xl, "☕ Kids-Friendly Cafes")
    rows = []
    for _, r in df.iterrows():
        addr = clean(r["Alamat"])
        lat, lon = geocode(addr) if addr else (None, None)
        rows.append({
            "name":             clean(r["Nama"]),
            "google_rating":    to_float(r["Google Rating"]),
            "address":          addr,
            "latitude":         lat,
            "longitude":        lon,
            "phone":            clean_phone(r.get("Telepon")),
            "whatsapp":         clean_phone(r.get("WhatsApp")),
            "email":            clean(r.get("Email")),
            "hours":            clean(r.get("Jam Buka")),
            "price_per_person": clean(r.get("Est. Harga/Orang")),
            "price_category":   clean(r.get("Est. Harga/Orang")),  # used as filter value
            "child_features":   clean(r.get("Fitur Anak")),
            "instagram":        clean(r.get("Instagram")),
            "facebook":         clean(r.get("Facebook")),
            "tiktok":           clean(r.get("TikTok")),
            "website":          clean(r.get("Website")),
            "year_founded":     to_int(r.get("Tahun Berdiri")),
            "area":             clean(r.get("Area")),
            "location_detail":  clean(r.get("Lokasi Spesifik")),
        })
    supabase_insert("cafes", rows)


def import_mini_zoo(xl):
    df = load_tab(xl, "🦁 Mini Zoo & Animals")
    rows = []
    for _, r in df.iterrows():
        addr = clean(r["Alamat"])
        lat, lon = geocode(addr) if addr else (None, None)
        pmin, pmax = parse_price(r.get("Harga Tiket"))
        rows.append({
            "name":            clean(r["Nama"]),
            "google_rating":   to_float(r["Google Rating"]),
            "address":         addr,
            "latitude":        lat,
            "longitude":       lon,
            "phone":           clean_phone(r.get("Telepon")),
            "whatsapp":        clean_phone(r.get("WhatsApp")),
            "email":           clean(r.get("Email")),
            "hours":           clean(r.get("Jam Buka")),
            "price_ticket":    clean(r.get("Harga Tiket")),
            "price_min":       pmin,
            "price_max":       pmax,
            "animals":         clean(r.get("Hewan/Atraksi")),
            "instagram":       clean(r.get("Instagram")),
            "facebook":        clean(r.get("Facebook")),
            "tiktok":          clean(r.get("TikTok")),
            "website":         clean(r.get("Website")),
            "year_founded":    to_int(r.get("Tahun Berdiri")),
            "area":            clean(r.get("Area")),
            "location_detail": clean(r.get("Lokasi Spesifik")),
        })
    supabase_insert("mini_zoo", rows)


def import_swimming_pools(xl):
    df = load_tab(xl, "🏊 Swimming & Water Parks")
    rows = []
    for _, r in df.iterrows():
        addr = clean(r["Alamat"])
        lat, lon = geocode(addr) if addr else (None, None)
        pmin, _ = parse_price(r.get("Harga Tiket"))
        rows.append({
            "name":            clean(r["Nama"]),
            "google_rating":   to_float(r["Google Rating"]),
            "address":         addr,
            "latitude":        lat,
            "longitude":       lon,
            "phone":           clean_phone(r.get("Telepon")),
            "whatsapp":        clean_phone(r.get("WhatsApp")),
            "email":           clean(r.get("Email")),
            "hours":           clean(r.get("Jam Buka")),
            "price_ticket":    clean(r.get("Harga Tiket")),
            "price_min":       pmin,
            "facilities":      clean(r.get("Fasilitas")),
            "instagram":       clean(r.get("Instagram")),
            "facebook":        clean(r.get("Facebook")),
            "tiktok":          clean(r.get("TikTok")),
            "website":         clean(r.get("Website")),
            "year_founded":    to_int(r.get("Tahun Berdiri")),
            "area":            clean(r.get("Area")),
            "location_detail": clean(r.get("Lokasi Spesifik")),
        })
    supabase_insert("swimming_pools", rows)


def import_bookstores(xl):
    df = load_tab(xl, "📖 Bookstores & Stationery")
    rows = []
    for _, r in df.iterrows():
        addr = clean(r["Alamat"])
        lat, lon = geocode(addr) if addr else (None, None)
        rows.append({
            "name":            clean(r["Nama Toko"]),
            "google_rating":   to_float(r["Google Rating"]),
            "address":         addr,
            "latitude":        lat,
            "longitude":       lon,
            "phone":           clean_phone(r.get("Telepon")),
            "whatsapp":        clean_phone(r.get("WhatsApp")),
            "email":           clean(r.get("Email")),
            "hours":           clean(r.get("Jam Buka")),
            "specialization":  clean(r.get("Spesialisasi")),
            "instagram":       clean(r.get("Instagram")),
            "facebook":        clean(r.get("Facebook")),
            "tiktok":          clean(r.get("TikTok")),
            "website":         clean(r.get("Website")),
            "year_founded":    to_int(r.get("Tahun Berdiri")),
            "area":            clean(r.get("Area")),
            "location_detail": clean(r.get("Lokasi Spesifik")),
        })
    supabase_insert("bookstores", rows)


def import_others(xl):
    df = load_tab(xl, "🎭 Others")
    rows = []
    for _, r in df.iterrows():
        addr = clean(r["Alamat"])
        lat, lon = geocode(addr) if addr else (None, None)
        pmin, pmax = parse_price(r.get("Harga Tiket"))
        rows.append({
            "name":            clean(r["Nama"]),
            "google_rating":   to_float(r["Google Rating"]),
            "address":         addr,
            "latitude":        lat,
            "longitude":       lon,
            "phone":           clean_phone(r.get("Telepon")),
            "whatsapp":        clean_phone(r.get("WhatsApp")),
            "email":           clean(r.get("Email")),
            "hours":           clean(r.get("Jam Buka")),
            "price_ticket":    clean(r.get("Harga Tiket")),
            "price_min":       pmin,
            "price_max":       pmax,
            "type":            clean(r.get("Tipe")),
            "instagram":       clean(r.get("Instagram")),
            "facebook":        clean(r.get("Facebook")),
            "tiktok":          clean(r.get("TikTok")),
            "website":         clean(r.get("Website")),
            "year_founded":    to_int(r.get("Tahun Berdiri")),
            "area":            clean(r.get("Area")),
            "location_detail": clean(r.get("Lokasi Spesifik")),
        })
    supabase_insert("others", rows)


# ── MAIN ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("Loading spreadsheet…")
    xl = pd.ExcelFile(SPREADSHEET)

    importers = [
        ("Schools",          import_schools),
        ("Daycares",         import_daycares),
        ("Learning Centers", import_learning_centers),
        ("Playgrounds",      import_playgrounds),
        ("Clinics",          import_clinics),
        ("Cafes",            import_cafes),
        ("Mini Zoo",         import_mini_zoo),
        ("Swimming Pools",   import_swimming_pools),
        ("Bookstores",       import_bookstores),
        ("Others",           import_others),
    ]

    for label, fn in importers:
        print(f"\n>> Importing {label}...")
        fn(xl)

    print("\nDone.")
