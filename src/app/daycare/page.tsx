"use client";
import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, SlidersHorizontal, ArrowUpDown, X, Check, Scale } from "lucide-react";
import { placeMatchesAreas, haversineKm, type Place } from "@/lib/mockData";
import { fetchPlacesByCategory } from "@/lib/db";
import { useLocation } from "@/context/LocationContext";
import { useLang } from "@/context/LanguageContext";
import { BottomNav } from "@/components/BottomNav";
import { PlaceCard } from "@/components/PlaceCard";
import { ActionButton } from "@/components/ActionButton";
import { FilterGateSheet } from "@/components/FilterGateSheet";
import { useAuth } from "@/context/AuthContext";
import { PremiumBadge } from "@/components/PremiumBadge";
import { SkeletonList } from "@/components/SkeletonCard";
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

function MultiChip({ checked, onChange, children }: {
  checked: boolean; onChange: () => void; children: React.ReactNode;
}) {
  return (
    <label style={{ cursor: "pointer", userSelect: "none", WebkitUserSelect: "none" }}>
      <input type="checkbox" checked={checked} onChange={onChange} style={HI} />
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: "6px 13px", borderRadius: 999,
        fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap", transition: "all 0.15s",
        border: checked ? "2px solid #2e8a5a" : "2px solid #e2e8f0",
        background: checked ? "#2e8a5a" : "#fff", color: checked ? "#fff" : "#374151",
      }}>
        {checked && <Check size={10} color="white" strokeWidth={3} />}
        {children}
      </span>
    </label>
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

function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
      color: "#94a3b8", textTransform: "uppercase" as const }}>
      {children}
    </p>
  );
}

const AGE_GROUP_OPTIONS = [
  "Bayi (0–1 thn)", "Toddler (1–2 thn)", "Balita (2–4 thn)", "Usia 4+ thn",
];

const PRICE_BUCKETS: Record<string, string> = {
  all:      "Semua",
  lt1jt:    "< Rp 1 jt",
  "1to2jt": "Rp 1–2 jt",
  "2to3jt": "Rp 2–3 jt",
  gt3jt:    "> Rp 3 jt",
};

const CARER_RATIO_OPTIONS: { value: string; label: string }[] = [
  { value: "all",   label: "Semua" },
  { value: "1to3",  label: "≤ 1:3" },
  { value: "1to5",  label: "1:4–1:5" },
  { value: "1to8",  label: "1:6+" },
];

const METHOD_OPTIONS = ["Montessori", "Play-based", "Structured", "Waldorf", "Reggio Emilia"];

const ADA_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "yes", label: "Ada" },
  { value: "no",  label: "Tidak Ada" },
];

const HEADER_STYLE = {
  background: "linear-gradient(160deg, #0a2018 0%, #1f6b43 60%, #2e8a5a 100%)",
  borderRadius: "0 0 28px 28px", padding: "44px 20px 22px",
};

function DaycareContent() {
  const { t } = useLang();
  const { tier } = useAuth();
  const { userLat, userLng, locationStatus, requestLocation } = useLocation();

  const [allPlaces,   setAllPlaces]   = useState<Place[]>([]);
  const [allFeatured, setAllFeatured] = useState<Place[]>([]);
  const [loading,     setLoading]     = useState(true);
  useEffect(() => {
    fetchPlacesByCategory("daycare").then(d => {
      setAllPlaces(d);
      setAllFeatured(d.filter(p => p.isFeatured));
      setLoading(false);
    });
  }, []);

  const [showFilterGate, setShowFilterGate] = useState(false);
  const router = useRouter();

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const view: "filter" | "results" =
    searchParams.get("view") === "results" ? "results" : "filter";

  const [area,          setArea]          = useState<"all"|"bintaro"|"bsd">((searchParams.get("area") as "all"|"bintaro"|"bsd") ?? "all");
  const [usiaSelections, setUsiaSelections] = useState<string[]>(() => {
    const v = searchParams.get("usia");
    return v && v !== "all" ? v.split(",") : [];
  });
  const [priceBucket,   setPriceBucket]   = useState(searchParams.get("price") ?? "all");
  const [carerRatio,    setCarerRatio]    = useState(searchParams.get("cr") ?? "all");
  const [daycareMethod, setDaycareMethod] = useState(searchParams.get("method") ?? "all");
  const [hasCctv,       setHasCctv]       = useState(searchParams.get("cctv") ?? "all");
  const [hasAccreditation, setHasAccreditation] = useState(searchParams.get("acc") ?? "all");
  const [sortBy,        setSortBy]        = useState<"alpha"|"za"|"random"|"nearest">((searchParams.get("sort") as "alpha"|"za"|"random"|"nearest") ?? "nearest");
  const [sortSeed]                        = useState(() => Math.random());
  const [compareIds,  setCompareIds]  = useState<string[]>([]);
  const [compareMode, setCompareMode] = useState(false);

  useEffect(() => {
    if (sortBy === "nearest" && locationStatus === "idle") requestLocation();
  }, [sortBy, locationStatus, requestLocation]);

  function toggleCompare(id: string) {
    setCompareIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length >= 3 ? prev : [...prev, id]
    );
  }
  function toggleCompareMode() {
    setCompareMode(prev => { if (prev) setCompareIds([]); return !prev; });
  }
  function goCompare() {
    if (typeof window !== "undefined") localStorage.setItem("compareDcIds", JSON.stringify(compareIds));
    window.location.href = "/compare?type=dc";
  }

  function matchesPriceBucket(d: { priceMin: number }): boolean {
    if (priceBucket === "lt1jt")  return d.priceMin < 1_000_000;
    if (priceBucket === "1to2jt") return d.priceMin >= 1_000_000 && d.priceMin <= 2_000_000;
    if (priceBucket === "2to3jt") return d.priceMin > 2_000_000 && d.priceMin <= 3_000_000;
    if (priceBucket === "gt3jt")  return d.priceMin > 3_000_000;
    return true;
  }

  function applyFilters(list: Place[]) {
    return list
      .filter(d => area === "all" || placeMatchesAreas(d, [area]))
      .filter(d => usiaSelections.length === 0 || usiaSelections.some(u => d.daycareAgeGroups?.includes(u)))
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
      });
  }

  const featuredSpot = useMemo(() => {
    const candidates = applyFilters(allFeatured);
    if (!candidates.length) return null;
    return candidates[Math.floor(sortSeed * candidates.length) % candidates.length];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allFeatured, area, usiaSelections, priceBucket, carerRatio, daycareMethod, hasCctv, hasAccreditation, sortSeed]);

  function sortList(list: Place[]) {
    return [...list].sort((a, b) => {
      if (sortBy === "za") return b.name.localeCompare(a.name);
      if (sortBy === "alpha") return a.name.localeCompare(b.name);
      if (sortBy === "nearest" && userLat && userLng) {
        const dA = (a.lat && a.lng) ? haversineKm(userLat, userLng, a.lat, a.lng) : 9999;
        const dB = (b.lat && b.lng) ? haversineKm(userLat, userLng, b.lat, b.lng) : 9999;
        return dA - dB;
      }
      const h = (id: string) => { let v = sortSeed; for (let i = 0; i < id.length; i++) v = Math.sin(v + id.charCodeAt(i)) * 10000; return v - Math.floor(v); };
      return h(a.id) - h(b.id);
    });
  }

  const filtered = sortList(applyFilters(allPlaces).filter(d => d.id !== featuredSpot?.id));

  const activeCount = [
    area !== "all", usiaSelections.length > 0, priceBucket !== "all",
    carerRatio !== "all", daycareMethod !== "all", hasCctv !== "all", hasAccreditation !== "all",
  ].filter(Boolean).length;

  function resetFilters() {
    setArea("all"); setUsiaSelections([]); setPriceBucket("all");
    setCarerRatio("all"); setDaycareMethod("all"); setHasCctv("all"); setHasAccreditation("all");
  }

  function toResults() {
    const p = new URLSearchParams({ view: "results" });
    if (area !== "all") p.set("area", area);
    if (usiaSelections.length > 0) p.set("usia", usiaSelections.join(","));
    if (priceBucket !== "all") p.set("price", priceBucket);
    if (carerRatio !== "all") p.set("cr", carerRatio);
    if (daycareMethod !== "all") p.set("method", daycareMethod);
    if (hasCctv !== "all") p.set("cctv", hasCctv);
    if (hasAccreditation !== "all") p.set("acc", hasAccreditation);
    if (sortBy !== "nearest") p.set("sort", sortBy);
    return `${pathname}?${p}`;
  }
  function toFilter() {
    const p = new URLSearchParams();
    if (area !== "all") p.set("area", area);
    if (usiaSelections.length > 0) p.set("usia", usiaSelections.join(","));
    if (priceBucket !== "all") p.set("price", priceBucket);
    if (carerRatio !== "all") p.set("cr", carerRatio);
    if (daycareMethod !== "all") p.set("method", daycareMethod);
    if (hasCctv !== "all") p.set("cctv", hasCctv);
    if (hasAccreditation !== "all") p.set("acc", hasAccreditation);
    if (sortBy !== "nearest") p.set("sort", sortBy);
    const qs = p.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  const totalCount = filtered.length + (featuredSpot ? 1 : 0);

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

        <div style={{ padding: "16px 16px 130px", display: "flex", flexDirection: "column", gap: 10 }}>

          {/* Area */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "10px 14px", border: "1px solid #ede8df" }}>
            <SectionHead>Area</SectionHead>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
              {(["all","bintaro","bsd"] as const).map(v => (
                <Chip key={v} name="f-area" value={v} checked={area === v} onChange={() => setArea(v)}>
                  {v === "all" ? t.filterAll : v === "bintaro" ? "Bintaro" : "BSD"}
                </Chip>
              ))}
              <AreaCoverageButton />
            </div>
          </div>

          {/* Kelompok Usia */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "10px 14px", border: "1px solid #ede8df" }}>
            <SectionHead>Kelompok Usia</SectionHead>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              <Chip name="f-usia-all" value="all" checked={usiaSelections.length === 0} onChange={() => setUsiaSelections([])}>
                {t.filterAll}
              </Chip>
              {AGE_GROUP_OPTIONS.map(g => (
                <MultiChip
                  key={g}
                  checked={usiaSelections.includes(g)}
                  onChange={() => setUsiaSelections(prev =>
                    prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]
                  )}
                >
                  {g}
                </MultiChip>
              ))}
            </div>
          </div>

          {/* Harga Bulanan */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "10px 14px", border: "1px solid #ede8df" }}>
            <SectionHead>Harga Bulanan</SectionHead>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {Object.entries(PRICE_BUCKETS).map(([v, label]) => (
                <Chip key={v} name="f-price" value={v} checked={priceBucket === v} onChange={() => setPriceBucket(v)}>
                  {label}
                </Chip>
              ))}
            </div>
          </div>

          {/* Rasio Pengasuh:Anak */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "10px 14px", border: "1px solid #ede8df" }}>
            <SectionHead>Rasio Pengasuh:Anak</SectionHead>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {CARER_RATIO_OPTIONS.map(({ value, label }) => (
                <Chip key={value} name="f-cr" value={value} checked={carerRatio === value} onChange={() => setCarerRatio(value)}>
                  {label}
                </Chip>
              ))}
            </div>
          </div>

          {/* Kurikulum / Metode */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "10px 14px", border: "1px solid #ede8df" }}>
            <SectionHead>Kurikulum / Metode</SectionHead>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              <Chip name="f-method" value="all" checked={daycareMethod === "all"} onChange={() => setDaycareMethod("all")}>
                {t.filterAll}
              </Chip>
              {METHOD_OPTIONS.map(m => (
                <Chip key={m} name="f-method" value={m} checked={daycareMethod === m} onChange={() => setDaycareMethod(m)}>
                  {m}
                </Chip>
              ))}
            </div>
          </div>

          {/* CCTV & Akses */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "10px 14px", border: "1px solid #ede8df" }}>
            <SectionHead>CCTV & Akses</SectionHead>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {ADA_OPTIONS.map(({ value, label }) => (
                <Chip key={value} name="f-cctv" value={value} checked={hasCctv === value} onChange={() => setHasCctv(value)}>
                  {label}
                </Chip>
              ))}
            </div>
          </div>

          {/* Akreditasi */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "10px 14px", border: "1px solid #ede8df" }}>
            <SectionHead>Akreditasi</SectionHead>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {ADA_OPTIONS.map(({ value, label }) => (
                <Chip key={value} name="f-acc" value={value} checked={hasAccreditation === value} onChange={() => setHasAccreditation(value)}>
                  {label}
                </Chip>
              ))}
            </div>
          </div>

        </div>

        {/* Sticky CTA */}
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 10,
          padding: "14px 20px", paddingBottom: "max(14px, env(safe-area-inset-bottom))",
          background: "#fff", borderTop: "1px solid #f1f5f9" }}>
          <div style={{ maxWidth: 448, margin: "0 auto" }}>
            <button
              onClick={() => router.push(toResults())}
              onTouchEnd={(e) => { e.preventDefault(); router.push(toResults()); }}
              style={{ width: "100%", padding: "15px 0", borderRadius: 16, border: "none",
                background: "linear-gradient(135deg,#1f6b43,#2e8a5a)", color: "#fff",
                fontFamily: "var(--font-jakarta),system-ui,sans-serif",
                fontSize: 15, fontWeight: 700, cursor: "pointer",
                touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}>
              {t.dcShowResults(totalCount)}
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
            <ActionButton onClick={() => router.back()} ariaLabel="Back" style={{
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
                {t.dcShowResults(totalCount)}
              </p>
            </div>
          </div>
          <PremiumBadge />
        </div>
      </div>

      {/* Filter / Sort bar */}
      <div style={{ display: "flex", gap: 10, margin: "12px 14px 0", alignItems: "center" }}>
        <ActionButton onClick={() => router.push(toFilter())} style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "10px 16px", borderRadius: 999,
          background: "#0e1d4f", color: "#fff", fontWeight: 700, fontSize: 13.5, flexShrink: 0,
          animation: "filter-pulse 2s ease-in-out infinite" }}>
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

        {/* Sort dropdown */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <select
            value={sortBy}
            onChange={(e) => {
              const v = e.target.value as typeof sortBy;
              setSortBy(v);
              if (v === "nearest" && locationStatus !== "granted") requestLocation();
            }}
            style={{
              padding: "10px 36px 10px 14px", borderRadius: 999, fontSize: 13.5,
              fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 600,
              color: "#16a34a", border: "1.5px solid #16a34a", background: "#e6f4ed",
              outline: "none", appearance: "none" as const, WebkitAppearance: "none" as const, cursor: "pointer",
            }}
          >
            <option value="random">Acak</option>
            <option value="alpha">Urut A–Z</option>
            <option value="za">Urut Z–A</option>
            <option value="nearest">{t.sortNearest}</option>
          </select>
          <div style={{ position: "absolute", right: 10, top: 0, bottom: 0,
            display: "flex", alignItems: "center", pointerEvents: "none" }}>
            <ArrowUpDown size={13} strokeWidth={2.5} color="#16a34a" />
          </div>
        </div>

        {/* Compare button */}
        {(tier === "premium" || tier === "free") && (
          <ActionButton onClick={tier === "premium" ? toggleCompareMode : () => setShowFilterGate(true)} style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "10px 14px", borderRadius: 999, flexShrink: 0,
            background: compareMode ? "#2e8a5a" : "#fff",
            color: compareMode ? "#fff" : tier === "free" ? "#94a3b8" : "#374151",
            fontWeight: 700, fontSize: 13,
            opacity: tier === "free" ? 0.85 : 1,
            border: `1.5px solid ${compareMode ? "#2e8a5a" : "#e2e8f0"}` }}>
            {compareMode ? <X size={13} strokeWidth={2.5} /> : <Scale size={13} strokeWidth={2.5} />}
            {compareMode ? t.schoolsCompareCancelBtn : t.schoolsCompareModeBtn}
          </ActionButton>
        )}
      </div>

      {/* Compare hint */}
      {tier === "premium" && compareMode && totalCount > 0 && (
        <div style={{ padding: "8px 14px 0" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "9px 13px", borderRadius: 10,
            background: compareIds.length === 0 ? "#fef9c3" : "#e6f4ed",
            border: `1.5px solid ${compareIds.length === 0 ? "#fde68a" : "#a7d4bc"}`,
          }}>
            <Scale size={14} color={compareIds.length === 0 ? "#854d0e" : "#2e8a5a"} />
            <span style={{ fontSize: 12, fontWeight: 600,
              color: compareIds.length === 0 ? "#854d0e" : "#2e8a5a",
              fontFamily: "var(--font-jakarta), sans-serif" }}>
              {compareIds.length === 0 ? t.lcCmpHint : t.lcCmpSelectedFor(compareIds.length)}
            </span>
          </div>
        </div>
      )}

      {/* Active filter tags */}
      {activeCount > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "8px 14px 0", alignItems: "center" }}>
          {area !== "all" && <FTag label={area === "bintaro" ? "Bintaro" : "BSD"} onRemove={() => setArea("all")} />}
          {usiaSelections.map(u => (
            <FTag key={u} label={u} onRemove={() => setUsiaSelections(prev => prev.filter(x => x !== u))} />
          ))}
          {priceBucket !== "all" && <FTag label={PRICE_BUCKETS[priceBucket] ?? priceBucket} onRemove={() => setPriceBucket("all")} />}
          {carerRatio !== "all" && <FTag label={`Pengasuh: ${CARER_RATIO_OPTIONS.find(o => o.value === carerRatio)?.label ?? carerRatio}`} onRemove={() => setCarerRatio("all")} />}
          {daycareMethod !== "all" && <FTag label={`Metode: ${daycareMethod}`} onRemove={() => setDaycareMethod("all")} />}
          {hasCctv !== "all" && <FTag label={`CCTV: ${ADA_OPTIONS.find(o => o.value === hasCctv)?.label ?? hasCctv}`} onRemove={() => setHasCctv("all")} />}
          {hasAccreditation !== "all" && <FTag label={`Akreditasi: ${ADA_OPTIONS.find(o => o.value === hasAccreditation)?.label ?? hasAccreditation}`} onRemove={() => setHasAccreditation("all")} />}
          <ActionButton onClick={resetFilters} style={{ fontSize: 12, fontWeight: 600, color: "#2e8a5a" }}>
            {t.filterClearAll}
          </ActionButton>
        </div>
      )}

      {/* Results */}
      <div style={{ padding: "12px 14px 0" }}>
        {loading && <SkeletonList count={6} />}

        {/* ✦ Featured */}
        {!loading && featuredSpot && (
          <div style={{
            marginBottom: 14, background: "#fef9c3",
            border: "1.5px dashed #f59e0b", padding: "8px 10px",
          }}>
            <span style={{
              display: "block", marginBottom: 7,
              fontSize: 10, fontWeight: 800, letterSpacing: 1.3,
              color: "#b45309", textTransform: "uppercase" as const,
              fontFamily: "var(--font-jakarta), sans-serif",
            }}>
              ✦ Featured
            </span>
            {tier === "premium" && compareMode ? (
              <ActionButton
                onClick={() => toggleCompare(featuredSpot.id)}
                style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", padding: 0 }}
              >
                <PlaceCard
                  place={featuredSpot}
                  selected={compareIds.includes(featuredSpot.id)}
                  distanceKm={
                    locationStatus === "granted" && userLat && userLng && featuredSpot.lat && featuredSpot.lng
                      ? haversineKm(userLat, userLng, featuredSpot.lat, featuredSpot.lng) : null
                  }
                />
              </ActionButton>
            ) : (
              <Link href={`/place/${featuredSpot.slug ?? featuredSpot.id}`} style={{ textDecoration: "none", display: "block" }}>
                <PlaceCard
                  place={featuredSpot}
                  distanceKm={
                    locationStatus === "granted" && userLat && userLng && featuredSpot.lat && featuredSpot.lng
                      ? haversineKm(userLat, userLng, featuredSpot.lat, featuredSpot.lng) : null
                  }
                />
              </Link>
            )}
          </div>
        )}

        {!loading && filtered.length === 0 && !featuredSpot && (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8", fontSize: 13 }}>
            {t.dpNoResults}
          </div>
        )}
        {!loading && filtered.length === 0 && featuredSpot && (
          <div style={{ textAlign: "center", padding: "12px 0 32px", color: "#94a3b8", fontSize: 13 }}>
            {t.dpNoResults}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(dc => {
            const isSelected = compareIds.includes(dc.id);
            return (
              <div key={dc.id}>
                {tier === "premium" && compareMode ? (
                  <ActionButton
                    onClick={() => toggleCompare(dc.id)}
                    style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", padding: 0 }}
                  >
                    <PlaceCard
                      place={dc} selected={isSelected}
                      distanceKm={
                        locationStatus === "granted" && userLat && userLng && dc.lat && dc.lng
                          ? haversineKm(userLat, userLng, dc.lat, dc.lng) : null
                      }
                    />
                  </ActionButton>
                ) : (
                  <Link href={`/place/${dc.slug ?? dc.id}`} style={{ textDecoration: "none", display: "block" }}>
                    <PlaceCard
                      place={dc}
                      distanceKm={
                        locationStatus === "granted" && userLat && userLng && dc.lat && dc.lng
                          ? haversineKm(userLat, userLng, dc.lat, dc.lng) : null
                      }
                    />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating compare button */}
      {tier === "premium" && compareIds.length >= 2 && (
        <div style={{ position: "fixed", bottom: 96, left: 14, right: 14, margin: "0 auto", maxWidth: 420, zIndex: 20 }}>
          <ActionButton onClick={goCompare} style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            width: "100%", padding: "16px 20px", borderRadius: 18,
            background: "linear-gradient(135deg,#1f6b43,#2e8a5a)", color: "#fff", fontWeight: 700, fontSize: 14,
            boxShadow: "0 8px 24px rgba(30,63,176,0.36)" }}>
            <Scale size={16} />{t.lcCmpBtn(compareIds.length)}
          </ActionButton>
        </div>
      )}

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
