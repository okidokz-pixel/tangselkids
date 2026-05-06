"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, SlidersHorizontal, ArrowUpDown, X } from "lucide-react";
import { placeMatchesAreas, type Place } from "@/lib/mockData";
import { fetchPlacesByCategory } from "@/lib/db";
import { useLang } from "@/context/LanguageContext";
import { BottomNav } from "@/components/BottomNav";
import { PlaceCard } from "@/components/PlaceCard";
import { ActionButton } from "@/components/ActionButton";
import { FilterGateSheet } from "@/components/FilterGateSheet";
import { useAuth } from "@/context/AuthContext";
import { PremiumBadge } from "@/components/PremiumBadge";
import { AreaCoverageButton } from "@/components/AreaCoverageButton";

const HI = { position: "absolute" as const, width: 1, height: 1, opacity: 0,
  margin: -1, padding: 0, overflow: "hidden" as const, clip: "rect(0,0,0,0)", border: 0 };

function Chip({ name, value, checked, onChange, children }: {
  name: string; value: string; checked: boolean; onChange: () => void; children: React.ReactNode;
}) {
  return (
    <label style={{ cursor: "pointer", userSelect: "none", WebkitUserSelect: "none" }}>
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} style={HI} />
      <span style={{ display: "inline-block", padding: "6px 13px", borderRadius: 999,
        fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap", transition: "all 0.15s",
        border: checked ? "2px solid #2e8a5a" : "2px solid #e2e8f0",
        background: checked ? "#2e8a5a" : "#fff", color: checked ? "#fff" : "#374151" }}>
        {children}
      </span>
    </label>
  );
}

function FilterDropdown({ value, onChange, options }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const active = value !== "all";
  return (
    <div style={{ position: "relative" }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          appearance: "none", WebkitAppearance: "none",
          width: "100%", padding: "10px 36px 10px 14px",
          borderRadius: 12, fontSize: 13.5, fontWeight: 600,
          fontFamily: "var(--font-jakarta),sans-serif",
          border: active ? "2px solid #2e8a5a" : "2px solid #e2e8f0",
          background: active ? "#e6f4ed" : "#fff",
          color: active ? "#2e8a5a" : "#374151",
          cursor: "pointer", outline: "none",
        }}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <div style={{ position: "absolute", right: 12, top: 0, bottom: 0,
        display: "flex", alignItems: "center", pointerEvents: "none" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke={active ? "#2e8a5a" : "#94a3b8"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>
  );
}

function FTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 4,
      background: "#e6f4ed", borderRadius: 999, padding: "4px 6px 4px 10px",
      fontSize: 12, fontWeight: 600, color: "#0e1d4f" }}>
      {label}
      <ActionButton onClick={onRemove} ariaLabel="Remove" style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "#2e8a5a", borderRadius: 999, width: 16, height: 16, flexShrink: 0 }}>
        <X size={8} color="white" strokeWidth={3} />
      </ActionButton>
    </div>
  );
}


const CARER_RATIO_OPTIONS = [
  { value: "all",   label: "Semua" },
  { value: "1to3",  label: "≤ 1:3" },
  { value: "1to5",  label: "1:4–1:5" },
  { value: "1to8",  label: "1:6+" },
];
const DAYCARE_METHOD_OPTIONS = [
  { value: "all",           label: "Semua" },
  { value: "Montessori",    label: "Montessori" },
  { value: "Play-based",    label: "Play-based" },
  { value: "Structured",    label: "Structured" },
  { value: "Waldorf",       label: "Waldorf" },
  { value: "Reggio Emilia", label: "Reggio Emilia" },
];
const ADA_LABELS_DC: Record<string, string> = { all: "Semua", yes: "Ada", no: "Tidak Ada" };
const adaOptionsDC = Object.entries(ADA_LABELS_DC).map(([v, l]) => ({ value: v, label: l }));

const HEADER_STYLE = {
  background: "linear-gradient(160deg, #0a2018 0%, #1f6b43 60%, #2e8a5a 100%)",
  borderRadius: "0 0 28px 28px", padding: "44px 20px 22px",
};

function DaycareContent() {
  const { t } = useLang();
  const { tier } = useAuth();

  const USIA_OPTIONS = [
    { value: "all",                label: t.filterAll },
    { value: "Bayi (0–1 thn)",    label: t.daycareAgeBaby },
    { value: "Toddler (1–2 thn)", label: t.daycareAgeToddler },
    { value: "Balita (2–4 thn)",  label: t.daycareAgeBalita },
    { value: "Usia 4+ thn",       label: t.daycareAge4Plus },
  ];
  const PRICE_OPTIONS = [
    { value: "all",      label: t.filterAll },
    { value: "lt1jt",   label: "< Rp 1 jt" },
    { value: "1to2jt",  label: "Rp 1–2 jt" },
    { value: "2to3jt",  label: "Rp 2–3 jt" },
    { value: "gt3jt",   label: "> Rp 3 jt" },
  ];
  const [allPlaces, setAllPlaces] = useState<Place[]>([]);
  const [loading,   setLoading]   = useState(true);
  useEffect(() => { fetchPlacesByCategory("daycare").then(d => { setAllPlaces(d); setLoading(false); }); }, []);

  const [showFilterGate, setShowFilterGate] = useState(false);
  const router = useRouter();

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const view: "filter" | "results" =
    searchParams.get("view") === "results" ? "results" : "filter";

  const [area,        setArea]        = useState<"all"|"bintaro"|"bsd">((searchParams.get("area") as "all"|"bintaro"|"bsd") ?? "all");
  const [usia,        setUsia]        = useState(searchParams.get("usia") ?? "all");
  const [priceBucket, setPriceBucket] = useState(searchParams.get("price") ?? "all");
  const [carerRatio,       setCarerRatio]       = useState(searchParams.get("cr") ?? "all");
  const [daycareMethod,    setDaycareMethod]    = useState(searchParams.get("method") ?? "all");
  const [hasCctv,          setHasCctv]          = useState(searchParams.get("cctv") ?? "all");
  const [hasAccreditation, setHasAccreditation] = useState(searchParams.get("acc") ?? "all");
  const [sortBy,      setSortBy]      = useState<"alpha"|"za">((searchParams.get("sort") as "alpha"|"za") ?? "alpha");

  function matchesPriceBucket(d: { priceMin: number }): boolean {
    if (priceBucket === "lt1jt")  return d.priceMin < 1_000_000;
    if (priceBucket === "1to2jt") return d.priceMin >= 1_000_000 && d.priceMin <= 2_000_000;
    if (priceBucket === "2to3jt") return d.priceMin > 2_000_000 && d.priceMin <= 3_000_000;
    if (priceBucket === "gt3jt")  return d.priceMin > 3_000_000;
    return true;
  }

  const filtered = allPlaces
    .filter(d => area === "all" || placeMatchesAreas(d, [area]))
    .filter(d => usia === "all" || d.daycareAgeGroups?.includes(usia))
    .filter(d => matchesPriceBucket(d))
    .filter(d => {
      if (carerRatio === "all") return true;
      const n = parseInt((d.carerChildRatio ?? "").split(":")[1] ?? "0");
      if (carerRatio === "1to3") return n > 0 && n <= 3;
      if (carerRatio === "1to5") return n >= 4 && n <= 5;
      if (carerRatio === "1to8") return n >= 6;
      return true;
    })
    .filter(d => daycareMethod === "all" || d.daycareMethod === daycareMethod)
    .filter(d => {
      if (hasCctv === "all") return true;
      return hasCctv === "yes" ? d.hasCctv === true : d.hasCctv !== true;
    })
    .filter(d => {
      if (hasAccreditation === "all") return true;
      return hasAccreditation === "yes" ? d.hasAccreditation === true : d.hasAccreditation !== true;
    })
    .sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return sortBy === "za" ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name);
  });

  const activeCount = [
    area !== "all", usia !== "all", priceBucket !== "all",
    carerRatio !== "all", daycareMethod !== "all", hasCctv !== "all", hasAccreditation !== "all",
  ].filter(Boolean).length;
  function resetFilters() {
    setArea("all"); setUsia("all"); setPriceBucket("all");
    setCarerRatio("all"); setDaycareMethod("all"); setHasCctv("all"); setHasAccreditation("all");
  }

  function toResults() {
    const p = new URLSearchParams({ view: "results" });
    if (area !== "all") p.set("area", area);
    if (usia !== "all") p.set("usia", usia);
    if (priceBucket !== "all") p.set("price", priceBucket);
    if (carerRatio !== "all") p.set("cr", carerRatio);
    if (daycareMethod !== "all") p.set("method", daycareMethod);
    if (hasCctv !== "all") p.set("cctv", hasCctv);
    if (hasAccreditation !== "all") p.set("acc", hasAccreditation);
    if (sortBy !== "alpha") p.set("sort", sortBy);
    return `${pathname}?${p}`;
  }
  function toFilter() {
    const p = new URLSearchParams();
    if (area !== "all") p.set("area", area);
    if (usia !== "all") p.set("usia", usia);
    if (priceBucket !== "all") p.set("price", priceBucket);
    if (carerRatio !== "all") p.set("cr", carerRatio);
    if (daycareMethod !== "all") p.set("method", daycareMethod);
    if (hasCctv !== "all") p.set("cctv", hasCctv);
    if (hasAccreditation !== "all") p.set("acc", hasAccreditation);
    if (sortBy !== "alpha") p.set("sort", sortBy);
    const qs = p.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  // ── Filter View ──────────────────────────────────────────────────────────────
  if (view === "filter") {
    return (
      <div style={{ maxWidth: 448, margin: "0 auto", minHeight: "100vh", background: "#f6f1e8" }}>
        <div style={HEADER_STYLE}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <ActionButton
                onClick={() => router.back()}
                ariaLabel="Back"
                style={{ width: 36, height: 36, borderRadius: 999, flexShrink: 0,
                  background: "rgba(255,255,255,0.18)", display: "inline-flex", alignItems: "center",
                  justifyContent: "center" }}>
                <ChevronLeft size={20} color="white" />
              </ActionButton>
              <h1 style={{ margin: 0, fontFamily: "var(--font-fraunces),Georgia,serif",
                fontSize: 26, fontWeight: 600, letterSpacing: -0.5, lineHeight: 1, color: "#fff" }}>
                {t.dpDaycareTab}
              </h1>
            </div>
            <PremiumBadge />
          </div>
        </div>

        <div style={{ padding: "24px 20px 130px" }}>

          {/* Area chips */}
          <div style={{ marginBottom: 28 }}>
            <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
              color: "#94a3b8", textTransform: "uppercase" }}>Area</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
              {(["all","bintaro","bsd"] as const).map(v => (
                <Chip key={v} name="f-area" value={v} checked={area === v} onChange={() => setArea(v)}>
                  {v === "all" ? t.filterAll : v === "bintaro" ? "Bintaro" : "BSD"}
                </Chip>
              ))}
              <AreaCoverageButton />
            </div>
          </div>

          {/* Free filters */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
              color: "#94a3b8", textTransform: "uppercase", flexShrink: 0, width: 96 }}>{t.filterUsia}</p>
            <div style={{ flex: 1 }}>
              <FilterDropdown value={usia} onChange={setUsia} options={USIA_OPTIONS} />
            </div>
          </div>

          {/* Premium-only filters */}
          {tier === "premium" ? (
            <>
              {([
                { label: t.filterPrice,       value: priceBucket,      set: setPriceBucket,      opts: PRICE_OPTIONS        },
                { label: "Rasio Pengasuh:Anak", value: carerRatio,       set: setCarerRatio,       opts: CARER_RATIO_OPTIONS  },
                { label: "Kurikulum / Metode",  value: daycareMethod,    set: setDaycareMethod,    opts: DAYCARE_METHOD_OPTIONS },
                { label: "CCTV & Akses",        value: hasCctv,          set: setHasCctv,          opts: adaOptionsDC         },
                { label: "Akreditasi",           value: hasAccreditation, set: setHasAccreditation, opts: adaOptionsDC         },
              ] as const).map(({ label, value, set, opts }) => (
                <div key={String(label)} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                  <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
                    color: "#94a3b8", textTransform: "uppercase", flexShrink: 0, width: 96 }}>{label}</p>
                  <div style={{ flex: 1 }}>
                    <FilterDropdown value={value} onChange={set as (v: string) => void} options={opts as { value: string; label: string }[]} />
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              {([t.filterPrice, "Rasio Pengasuh:Anak", "Kurikulum / Metode", "CCTV & Akses", "Akreditasi"] as const).map((label) => (
                <ActionButton
                  key={String(label)}
                  onClick={() => setShowFilterGate(true)}
                  style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18,
                    width: "100%", padding: 0, background: "transparent" }}
                >
                  <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
                    color: "#94a3b8", textTransform: "uppercase", flexShrink: 0, width: 96 }}>{label}</p>
                  <div style={{ flex: 1, padding: "11px 14px", borderRadius: 12, fontSize: 13.5,
                    fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 600,
                    color: "#cbd5e1", border: "2px dashed #e2e8f0", background: "#fafafa",
                    display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span>Premium only</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                </ActionButton>
              ))}
            </>
          )}

        </div>

        {/* Sticky CTA */}
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 10,
          padding: "14px 20px", paddingBottom: "max(14px, env(safe-area-inset-bottom))",
          background: "#fff", borderTop: "1px solid #f1f5f9" }}>
          <div style={{ maxWidth: 448, margin: "0 auto" }}>
            <button
              onClick={() => router.replace(toResults())}
              onTouchEnd={(e) => { e.preventDefault(); router.replace(toResults()); }}
              style={{ width: "100%", padding: "15px 0", borderRadius: 16, border: "none",
                background: "linear-gradient(135deg,#1f6b43,#2e8a5a)", color: "#fff",
                fontFamily: "var(--font-jakarta),system-ui,sans-serif",
                fontSize: 15, fontWeight: 700, cursor: "pointer",
                touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}>
              {`Tampilkan ${filtered.length} Daycares →`}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Results View ─────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 448, margin: "0 auto", minHeight: "100vh", paddingBottom: 110, background: "#f6f1e8" }}>
      <div style={HEADER_STYLE}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ActionButton onClick={() => router.replace(toFilter())} ariaLabel="Back" style={{
              width: 36, height: 36, borderRadius: 999, flexShrink: 0,
              background: "rgba(255,255,255,0.18)", display: "inline-flex",
              alignItems: "center", justifyContent: "center" }}>
              <ChevronLeft size={20} color="white" />
            </ActionButton>
            <div>
              <h1 style={{ margin: 0, fontFamily: "var(--font-fraunces),Georgia,serif",
                fontSize: 26, fontWeight: 600, letterSpacing: -0.5, lineHeight: 1, color: "#fff" }}>
                {t.dpDaycareTab}
              </h1>
              <p style={{ margin: "3px 0 0", color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
                {t.dcShowResults(filtered.length)}
              </p>
            </div>
          </div>
          <PremiumBadge />
        </div>
      </div>

      {/* Filter / Sort bar */}
      <div style={{ display: "flex", gap: 10, margin: "12px 14px 0", alignItems: "center" }}>
        <ActionButton onClick={() => router.replace(toFilter())} style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "10px 16px", borderRadius: 999,
          background: "#0e1d4f", color: "#fff", fontWeight: 700, fontSize: 13.5, flexShrink: 0 }}>
          <SlidersHorizontal size={14} strokeWidth={2.5} />
          Filter
          {activeCount > 0 && (
            <span style={{ background: "#f59e0b", color: "#fff", borderRadius: 999,
              minWidth: 20, height: 20, display: "inline-flex", alignItems: "center",
              justifyContent: "center", fontSize: 11, fontWeight: 800, padding: "0 5px" }}>
              {activeCount}
            </span>
          )}
        </ActionButton>
        <ActionButton onClick={() => setSortBy(s => s === "alpha" ? "za" : "alpha")} style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "10px 16px", borderRadius: 999,
          background: "#fff", color: "#374151", fontWeight: 600, fontSize: 13.5,
          border: "1.5px solid #e2e8f0" }}>
          <ArrowUpDown size={14} strokeWidth={2.5} />
          {sortBy === "alpha" ? "Urut abjad A–Z" : "Urut abjad Z–A"}
        </ActionButton>
      </div>

      {/* Active filter tags */}
      {activeCount > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "8px 14px 0", alignItems: "center" }}>
          {area !== "all" && <FTag label={area === "bintaro" ? "Bintaro" : "BSD"} onRemove={() => setArea("all")} />}
          {usia !== "all" && <FTag label={`${t.filterUsia}: ${USIA_OPTIONS.find(o => o.value === usia)?.label ?? usia}`} onRemove={() => setUsia("all")} />}
          {priceBucket !== "all" && <FTag label={PRICE_OPTIONS.find(o => o.value === priceBucket)?.label ?? priceBucket} onRemove={() => setPriceBucket("all")} />}
          {carerRatio !== "all" && <FTag label={`Pengasuh: ${CARER_RATIO_OPTIONS.find(o => o.value === carerRatio)?.label ?? carerRatio}`} onRemove={() => setCarerRatio("all")} />}
          {daycareMethod !== "all" && <FTag label={`Metode: ${daycareMethod}`} onRemove={() => setDaycareMethod("all")} />}
          {hasCctv !== "all" && <FTag label={`CCTV: ${ADA_LABELS_DC[hasCctv] ?? hasCctv}`} onRemove={() => setHasCctv("all")} />}
          {hasAccreditation !== "all" && <FTag label={`Akreditasi: ${ADA_LABELS_DC[hasAccreditation] ?? hasAccreditation}`} onRemove={() => setHasAccreditation("all")} />}
          <ActionButton onClick={resetFilters} style={{ fontSize: 12, fontWeight: 600, color: "#2e8a5a" }}>
            {t.filterClearAll}
          </ActionButton>
        </div>
      )}

      {/* Results */}
      <div style={{ padding: "12px 14px 0" }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8", fontSize: 13 }}>
            {t.dpNoResults}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(dc => (
            <Link key={dc.id} href={`/place/${dc.id}`} style={{ textDecoration: "none", display: "block" }}>
              <PlaceCard place={dc} />
            </Link>
          ))}
        </div>
      </div>
      <FilterGateSheet isOpen={showFilterGate} onClose={() => setShowFilterGate(false)} />

      <BottomNav active="explore" />
    </div>
  );
}

export default function DaycarePage() {
  return (
    <Suspense>
      <DaycareContent />
    </Suspense>
  );
}
