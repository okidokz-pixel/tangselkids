"use client";
import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronDown, SlidersHorizontal, Check, Scale, ArrowUpDown, X } from "lucide-react";
import { placeMatchesAreas, haversineKm, type Grade, type Place } from "@/lib/mockData";
import { fetchPlacesByCategory } from "@/lib/db";
import { useLocation } from "@/context/LocationContext";
import { useLang } from "@/context/LanguageContext";
import { BottomNav } from "@/components/BottomNav";
import { PlaceCard } from "@/components/PlaceCard";
import { SkeletonList } from "@/components/SkeletonCard";
import { ActionButton } from "@/components/ActionButton";
import { FilterGateSheet } from "@/components/FilterGateSheet";
import { useAuth } from "@/context/AuthContext";
import { PremiumBadge } from "@/components/PremiumBadge";
import { AreaCoverageButton } from "@/components/AreaCoverageButton";

// ── Hidden radio style ────────────────────────────────────────────────────────
const HI = { position: "absolute" as const, width: 1, height: 1, opacity: 0,
  margin: -1, padding: 0, overflow: "hidden" as const, clip: "rect(0,0,0,0)", border: 0 };

// ── Area chip ─────────────────────────────────────────────────────────────────
function Chip({ name, value, checked, onChange, children, compact }: {
  name: string; value: string; checked: boolean; onChange: () => void; children: React.ReactNode; compact?: boolean;
}) {
  return (
    <label style={{ cursor: "pointer", userSelect: "none", WebkitUserSelect: "none" }}>
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} style={HI} />
      <span style={{ display: "inline-block", padding: compact ? "5px 11px" : "6px 13px", borderRadius: 999,
        fontSize: compact ? 12.5 : 12.5, fontWeight: 600, whiteSpace: "nowrap", transition: "all 0.15s",
        border: checked ? "2px solid #2e8a5a" : "2px solid #e2e8f0",
        background: checked ? "#2e8a5a" : "#fff", color: checked ? "#fff" : "#374151" }}>
        {children}
      </span>
    </label>
  );
}

// ── Multi-select chip (checkbox) ──────────────────────────────────────────────
function MultiChip({ checked, onChange, children }: {
  checked: boolean; onChange: () => void; children: React.ReactNode;
}) {
  return (
    <label style={{ cursor: "pointer", userSelect: "none", WebkitUserSelect: "none" }}>
      <input type="checkbox" checked={checked} onChange={onChange} style={HI} />
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4,
        padding: "6px 13px", borderRadius: 999,
        fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap", transition: "all 0.15s",
        border: checked ? "2px solid #2e8a5a" : "2px solid #e2e8f0",
        background: checked ? "#2e8a5a" : "#fff", color: checked ? "#fff" : "#374151" }}>
        {checked && <Check size={10} color="white" strokeWidth={3} />}
        {children}
      </span>
    </label>
  );
}

// ── Filter dropdown ───────────────────────────────────────────────────────────
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
          width: "100%", padding: "11px 40px 11px 14px",
          borderRadius: 12, fontSize: 13.5,
          fontFamily: "var(--font-jakarta), sans-serif",
          fontWeight: 600,
          color: active ? "#1f6b43" : "#94a3b8",
          border: `2px solid ${active ? "#2e8a5a" : "#e2e8f0"}`,
          background: active ? "#e6f4ed" : "#fff",
          outline: "none",
          appearance: "none" as const,
          WebkitAppearance: "none" as const,
          cursor: "pointer",
          boxSizing: "border-box" as const,
        }}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {/* Chevron */}
      <div style={{ position: "absolute", right: 12, top: 0, bottom: 0,
        display: "flex", alignItems: "center", pointerEvents: "none" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke={active ? "#2e8a5a" : "#94a3b8"} strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>
  );
}

// ── Active filter tag ─────────────────────────────────────────────────────────
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

// ── Section heading ───────────────────────────────────────────────────────────
function SectionHead({ children }: { children: React.ReactNode }) {
  return <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
    color: "#94a3b8", textTransform: "uppercase" as const }}>{children}</p>;
}

// ── Constants ─────────────────────────────────────────────────────────────────
// Derived dynamically from allPlaces — see useMemo below
const BAHASA = ["Indonesia","Inggris","Arab","Mandarin","Jerman","Jepang"];
const GRADES: Grade[] = ["Preschool","TK","SD","SMP","SMA"];

const UP_LABELS: Record<string, string> = {
  all:    "Semua",
  lt1:    "< Rp 1 jt",
  "1to5":   "Rp 1–5 jt",
  "5to10":  "Rp 5–10 jt",
  "10to20": "Rp 10–20 jt",
  "20to50": "Rp 20–50 jt",
  gt50:   "> Rp 50 jt",
};

const SPP_LABELS: Record<string, string> = {
  all:   "Semua",
  lt1:   "< Rp 1 jt",
  "1to3":  "Rp 1–3 jt",
  "3to5":  "Rp 3–5 jt",
  "5to10": "Rp 5–10 jt",
  gt10:  "> Rp 10 jt",
};

const CLASS_SIZE_LABELS: Record<string, string> = {
  all:    "Semua",
  small:  "≤ 15 murid",
  medium: "16–20 murid",
  large:  "21–25 murid",
  xlarge: "26+ murid",
};


const HEADER_STYLE = {
  background: "linear-gradient(160deg, #0a2018 0%, #1f6b43 60%, #2e8a5a 100%)",
  borderRadius: "0 0 28px 28px", padding: "44px 20px 22px",
};

// ── Bucket matchers ───────────────────────────────────────────────────────────
function matchesSppBucket(priceMin: number, bucket: string): boolean {
  if (bucket === "all")   return true;
  if (bucket === "lt1")   return priceMin < 1_000_000;
  if (bucket === "1to3")  return priceMin >= 1_000_000  && priceMin < 3_000_000;
  if (bucket === "3to5")  return priceMin >= 3_000_000  && priceMin < 5_000_000;
  if (bucket === "5to10") return priceMin >= 5_000_000  && priceMin < 10_000_000;
  if (bucket === "gt10")  return priceMin >= 10_000_000;
  return true;
}

function matchesUpBucket(upMin: number | undefined, bucket: string): boolean {
  if (bucket === "all")    return true;
  if (upMin === undefined) return false;
  if (bucket === "lt1")    return upMin < 1_000_000;
  if (bucket === "1to5")   return upMin >= 1_000_000  && upMin < 5_000_000;
  if (bucket === "5to10")  return upMin >= 5_000_000  && upMin < 10_000_000;
  if (bucket === "10to20") return upMin >= 10_000_000 && upMin < 20_000_000;
  if (bucket === "20to50") return upMin >= 20_000_000 && upMin < 50_000_000;
  if (bucket === "gt50")   return upMin >= 50_000_000;
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────

function SchoolsContent() {
  const { t, lang } = useLang();
  const { tier, loaded } = useAuth();
  const { userLat, userLng, locationStatus, requestLocation } = useLocation();
  const [allPlaces,   setAllPlaces]   = useState<Place[]>([]);
  const [allFeatured, setAllFeatured] = useState<Place[]>([]);
  const [loading,     setLoading]     = useState(true);
  useEffect(() => {
    fetchPlacesByCategory("school").then(d => {
      setAllPlaces(d);
      setAllFeatured(d.filter(p => p.isFeatured));
      setLoading(false);
    });
  }, []);

  const CURRICULA = useMemo(() =>
    [...new Set(
      allPlaces.flatMap(p => p.curriculumCategory
        ? p.curriculumCategory.split(",").map(s => s.trim()).filter(Boolean)
        : []
      )
    )].sort(),
  [allPlaces]);

  const [showFilterGate, setShowFilterGate] = useState(false);
  const [premiumOpen,   setPremiumOpen]   = useState(false);
  const router = useRouter();

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const view: "filter" | "results" =
    searchParams.get("view") === "results" ? "results" : "filter";

  const [area,       setArea]       = useState<"all"|"bintaro"|"bsd">((searchParams.get("area") as "all"|"bintaro"|"bsd") ?? "all");
  const [grade,      setGrade]      = useState(searchParams.get("grade") ?? "all");
  const [curricula,  setCurricula]  = useState<string[]>(() => {
    const v = searchParams.get("cur");
    return v && v !== "all" ? v.split(",") : [];
  });
  const [bahasaFilter, setBahasaFilter] = useState<string[]>(() => {
    const v = searchParams.get("bhs");
    return v && v !== "all" ? v.split(",") : [];
  });
  const [upBucket,      setUpBucket]      = useState(searchParams.get("up") ?? "all");
  const [sppBucket,     setSppBucket]     = useState(searchParams.get("spp") ?? "all");
  const [classSizeBucket, setClassSizeBucket] = useState(searchParams.get("cs") ?? "all");
  const [sortBy,      setSortBy]      = useState<"alpha"|"za"|"random"|"nearest">((searchParams.get("sort") as "alpha"|"za"|"nearest") ?? "nearest");
  const [sortSeed]                    = useState(() => Math.random());
  const [compareIds,  setCompareIds]  = useState<string[]>([]);
  const [compareMode, setCompareMode] = useState(false);

  // Auto-request location when "Terdekat" is the active sort and location not yet obtained
  useEffect(() => {
    if (sortBy === "nearest" && locationStatus === "idle") requestLocation();
  }, [sortBy, locationStatus, requestLocation]);

  const featuredSpot = useMemo(() => {
    const candidates = allFeatured
      .filter(s => area === "all" || placeMatchesAreas(s, [area]))
      .filter(s => grade === "all" || s.jenjang === grade)
      .filter(s => curricula.length === 0 || (s.curriculumCategory ?? "").split(",").map(v => v.trim()).some(v => curricula.includes(v)))
      .filter(s => bahasaFilter.length === 0 || bahasaFilter.some(b => s.bahasa?.includes(b)))
      .filter(s => matchesUpBucket(s.uangPangkalMin, upBucket))
      .filter(s => matchesSppBucket(s.priceMin, sppBucket))
      .filter(s => {
        if (classSizeBucket === "all") return true;
        if (s.studentsPerClass === undefined) return false;
        if (classSizeBucket === "small")  return s.studentsPerClass <= 15;
        if (classSizeBucket === "medium") return s.studentsPerClass >= 16 && s.studentsPerClass <= 20;
        if (classSizeBucket === "large")  return s.studentsPerClass >= 21 && s.studentsPerClass <= 25;
        if (classSizeBucket === "xlarge") return s.studentsPerClass >= 26;
        return true;
      });
    if (!candidates.length) return null;
    return candidates[Math.floor(sortSeed * candidates.length) % candidates.length];
  }, [allFeatured, area, grade, curricula, bahasaFilter, upBucket, sppBucket, classSizeBucket, sortSeed]);

  const filtered = allPlaces
    .filter(s => s.id !== featuredSpot?.id)
    .filter(s => area === "all" || placeMatchesAreas(s, [area]))
    .filter(s => grade === "all" || s.jenjang === grade)
    .filter(s => curricula.length === 0 || (s.curriculumCategory ?? "").split(",").map(v => v.trim()).some(v => curricula.includes(v)))
    .filter(s => bahasaFilter.length === 0 || bahasaFilter.some(b => s.bahasa?.includes(b)))
    .filter(s => matchesUpBucket(s.uangPangkalMin, upBucket))
    .filter(s => matchesSppBucket(s.priceMin, sppBucket))
    .filter(s => {
      if (classSizeBucket === "all") return true;
      if (s.studentsPerClass === undefined) return false;
      if (classSizeBucket === "small")  return s.studentsPerClass <= 15;
      if (classSizeBucket === "medium") return s.studentsPerClass >= 16 && s.studentsPerClass <= 20;
      if (classSizeBucket === "large")  return s.studentsPerClass >= 21 && s.studentsPerClass <= 25;
      if (classSizeBucket === "xlarge") return s.studentsPerClass >= 26;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "za") return b.name.localeCompare(a.name);
      if (sortBy === "alpha") return a.name.localeCompare(b.name);
      if (sortBy === "nearest" && userLat && userLng) {
        const dA = (a.lat && a.lng) ? haversineKm(userLat, userLng, a.lat, a.lng) : 9999;
        const dB = (b.lat && b.lng) ? haversineKm(userLat, userLng, b.lat, b.lng) : 9999;
        return dA - dB;
      }
      // random — stable per session via seed
      const h = (id: string) => { let v = sortSeed; for (let i = 0; i < id.length; i++) v = Math.sin(v + id.charCodeAt(i)) * 10000; return v - Math.floor(v); };
      return h(a.id) - h(b.id);
    });

  const activeCount = [
    area !== "all", grade !== "all", curricula.length > 0,
    bahasaFilter.length > 0, upBucket !== "all", sppBucket !== "all",
    classSizeBucket !== "all",
  ].filter(Boolean).length;

  function resetFilters() {
    setArea("all"); setGrade("all"); setCurricula([]);
    setBahasaFilter([]); setUpBucket("all"); setSppBucket("all");
    setClassSizeBucket("all");
  }

  function toResults() {
    const p = new URLSearchParams({ view: "results" });
    if (area !== "all") p.set("area", area);
    if (grade !== "all") p.set("grade", grade);
    if (curricula.length > 0) p.set("cur", curricula.join(","));
    if (bahasaFilter.length > 0) p.set("bhs", bahasaFilter.join(","));
    if (upBucket !== "all") p.set("up", upBucket);
    if (sppBucket !== "all") p.set("spp", sppBucket);
    if (classSizeBucket !== "all") p.set("cs", classSizeBucket);
    if (sortBy !== "alpha") p.set("sort", sortBy);
    return `${pathname}?${p}`;
  }
  function toFilter() {
    const p = new URLSearchParams();
    if (area !== "all") p.set("area", area);
    if (grade !== "all") p.set("grade", grade);
    if (curricula.length > 0) p.set("cur", curricula.join(","));
    if (bahasaFilter.length > 0) p.set("bhs", bahasaFilter.join(","));
    if (upBucket !== "all") p.set("up", upBucket);
    if (sppBucket !== "all") p.set("spp", sppBucket);
    if (classSizeBucket !== "all") p.set("cs", classSizeBucket);
    if (sortBy !== "alpha") p.set("sort", sortBy);
    const qs = p.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  function toggleCompare(id: string) {
    setCompareIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length >= 3 ? prev : [...prev, id]
    );
  }
  function goCompare() {
    if (typeof window !== "undefined") localStorage.setItem("compareIds", JSON.stringify(compareIds));
    window.location.href = "/compare";
  }
  function toggleCompareMode() {
    setCompareMode(prev => { if (prev) setCompareIds([]); return !prev; });
  }

  // Dropdown option builders
  const gradeOptions    = [{ value: "all", label: "Semua" }, ...GRADES.map(g => ({ value: g, label: g }))];
  const upOptions         = Object.entries(UP_LABELS).map(([v, l]) => ({ value: v, label: l }));
  const sppOptions        = Object.entries(SPP_LABELS).map(([v, l]) => ({ value: v, label: l }));
  const classSizeOptions  = Object.entries(CLASS_SIZE_LABELS).map(([v, l]) => ({ value: v, label: l }));

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
                {t.schoolsTitle}
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

          {/* Jenjang */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "10px 14px", border: "1px solid #ede8df" }}>
            <SectionHead>{t.filterGrade}</SectionHead>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {(["all", ...GRADES] as const).map(v => (
                <Chip key={v} name="f-grade" value={v} checked={grade === v} onChange={() => setGrade(v)} compact>
                  {v === "all" ? t.filterAll : v}
                </Chip>
              ))}
            </div>
          </div>

          {/* Bahasa */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "10px 14px", border: "1px solid #ede8df" }}>
            <SectionHead>{t.filterBahasa}</SectionHead>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              <Chip name="f-bahasa-all" value="all" checked={bahasaFilter.length === 0} onChange={() => setBahasaFilter([])}>
                {t.filterAll}
              </Chip>
              {BAHASA.map(b => (
                <MultiChip
                  key={b}
                  checked={bahasaFilter.includes(b)}
                  onChange={() => setBahasaFilter(prev =>
                    prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]
                  )}
                >
                  {b}
                </MultiChip>
              ))}
            </div>
          </div>

          {/* Kurikulum */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "10px 14px", border: "1px solid #ede8df" }}>
            <SectionHead>Kurikulum</SectionHead>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              <Chip name="f-cur-all" value="all" checked={curricula.length === 0} onChange={() => setCurricula([])}>
                {t.filterAll}
              </Chip>
              {CURRICULA.map(c => (
                <MultiChip
                  key={c}
                  checked={curricula.includes(c)}
                  onChange={() => setCurricula(prev =>
                    prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
                  )}
                >
                  {c}
                </MultiChip>
              ))}
            </div>
          </div>

          {/* Uang Pangkal */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "10px 14px", border: "1px solid #ede8df" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
                color: "#94a3b8", textTransform: "uppercase", flexShrink: 0, width: 96 }}>
                {t.filterUangPangkal}
              </p>
              <div style={{ flex: 1 }}>
                <FilterDropdown value={upBucket} onChange={setUpBucket} options={upOptions} />
              </div>
            </div>
          </div>

          {/* SPP / Bulan */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "10px 14px", border: "1px solid #ede8df" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
                color: "#94a3b8", textTransform: "uppercase", flexShrink: 0, width: 96 }}>
                SPP / Bulan
              </p>
              <div style={{ flex: 1 }}>
                <FilterDropdown value={sppBucket} onChange={setSppBucket} options={sppOptions} />
              </div>
            </div>
          </div>

          {/* Collapsible premium filter section */}
          <div style={{ borderRadius: 16, overflow: "clip", border: "1.5px solid #bbf7d0" }}>
            <ActionButton
              onClick={() => setPremiumOpen(o => !o)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                width: "100%", padding: "10px 14px",
                borderRadius: 0,
                background: "#f0fdf4",
                touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                cursor: "pointer",
              } as React.CSSProperties}
            >
              <span style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 13, fontWeight: 700, color: "#166534" }}>
                Filter Lebih Dalam?{" "}
                <span style={{ fontWeight: 500, color: "#15803d" }}>(Fitur Khusus Premium)</span>
              </span>
              <ChevronDown
                size={18} color="#166534"
                style={{ transform: premiumOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}
              />
            </ActionButton>

            {premiumOpen && (
              <div style={{ padding: "16px 16px 4px", background: "#fff", borderTop: "1.5px solid #bbf7d0" }}>
                {tier === "premium" ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
                      color: "#94a3b8", textTransform: "uppercase", flexShrink: 0, width: 96 }}>
                      Murid / Kelas
                    </p>
                    <div style={{ flex: 1 }}>
                      <FilterDropdown value={classSizeBucket} onChange={setClassSizeBucket} options={classSizeOptions} />
                    </div>
                  </div>
                ) : (
                  <ActionButton
                    onClick={() => setShowFilterGate(true)}
                    style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14,
                      width: "100%", padding: 0, background: "transparent" }}
                  >
                    <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
                      color: "#94a3b8", textTransform: "uppercase", flexShrink: 0, width: 96 }}>
                      Murid / Kelas
                    </p>
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
                )}
              </div>
            )}
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
              {t.schoolsFound(filtered.length)}
            </button>
          </div>
        </div>
        <FilterGateSheet isOpen={showFilterGate} onClose={() => setShowFilterGate(false)} />
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
                {t.schoolsTitle}
              </h1>
              <p style={{ margin: "3px 0 0", color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
                {t.schoolsFound(filtered.length)}
              </p>
            </div>
          </div>
          <PremiumBadge />
        </div>
      </div>

      {/* Filter / Sort bar */}
      <div style={{ display: "flex", gap: 8, margin: "12px 14px 0", alignItems: "center" }}>
        <ActionButton onClick={() => router.push(toFilter())} style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "10px 16px", borderRadius: 999,
          background: "#0e1d4f", color: "#fff", fontWeight: 700, fontSize: 13.5, flexShrink: 0,
          animation: "filter-pulse 2s ease-in-out infinite" }}>
          <SlidersHorizontal size={14} strokeWidth={2.5} />
          {t.schoolsFilterResultsBtn}
          {activeCount > 0 && (
            <span style={{ background: "#f59e0b", color: "#fff", borderRadius: 999,
              minWidth: 20, height: 20, display: "inline-flex", alignItems: "center",
              justifyContent: "center", fontSize: 11, fontWeight: 800, padding: "0 5px" }}>
              {activeCount}
            </span>
          )}
        </ActionButton>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <select
            value={sortBy}
            onChange={(e) => {
              const v = e.target.value as typeof sortBy;
              setSortBy(v);
              if (v === "nearest" && locationStatus !== "granted") requestLocation();
            }}
            style={{
              padding: "10px 34px 10px 12px",
              borderRadius: 999,
              fontSize: 12,
              fontFamily: "var(--font-jakarta), sans-serif",
              fontWeight: 600,
              color: "#16a34a",
              border: "1.5px solid #16a34a",
              background: "#e6f4ed",
              outline: "none",
              appearance: "none" as const,
              WebkitAppearance: "none" as const,
              cursor: "pointer",
            }}
          >
            <option value="random">{t.schoolsSortRandom}</option>
            <option value="alpha">Urut A–Z</option>
            <option value="za">Urut Z–A</option>
            <option value="nearest">{t.sortNearest}</option>
          </select>
          <div style={{ position: "absolute", right: 9, top: 0, bottom: 0,
            display: "flex", alignItems: "center", pointerEvents: "none" }}>
            <ArrowUpDown size={12} strokeWidth={2.5} color="#16a34a" />
          </div>
        </div>
        {(tier === "premium" || tier === "free") && (
          <ActionButton onClick={tier === "premium" ? toggleCompareMode : () => setShowFilterGate(true)} style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "10px 12px", borderRadius: 999, flexShrink: 0,
            background: compareMode ? "#2e8a5a" : "#fff",
            color: compareMode ? "#fff" : tier === "free" ? "#94a3b8" : "#374151",
            fontWeight: 700, fontSize: 12,
            opacity: tier === "free" ? 0.85 : 1,
            border: `1.5px solid ${compareMode ? "#2e8a5a" : tier === "free" ? "#e2e8f0" : "#e2e8f0"}` }}>
            {compareMode ? <X size={13} strokeWidth={2.5} /> : <Scale size={13} strokeWidth={2.5} />}
            {compareMode ? t.schoolsCompareCancelBtn : t.schoolsCompareModeBtn}
          </ActionButton>
        )}
      </div>

      {/* Compare status hint — only in compare mode */}
      {tier === "premium" && compareMode && filtered.length > 0 && (
        <div style={{ padding: "8px 14px 0" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "9px 13px", borderRadius: 10,
            background: compareIds.length === 0 ? "#fef9c3" : "#e6f4ed",
            border: `1.5px solid ${compareIds.length === 0 ? "#fde68a" : "#a7d4bc"}`,
          }}>
            <Scale size={14} color={compareIds.length === 0 ? "#854d0e" : "#2e8a5a"} />
            <span style={{
              fontSize: 12, fontWeight: 600,
              color: compareIds.length === 0 ? "#854d0e" : "#2e8a5a",
              fontFamily: "var(--font-jakarta), sans-serif",
            }}>
              {compareIds.length === 0
                ? t.schoolsCompareHint
                : t.schoolsSelectedForCompare(compareIds.length)}
            </span>
          </div>
        </div>
      )}

      {/* Active filter tags */}
      {activeCount > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "8px 14px 0", alignItems: "center" }}>
          {area !== "all"   && <FTag label={area === "bintaro" ? "Bintaro" : "BSD"} onRemove={() => setArea("all")} />}
          {grade !== "all"  && <FTag label={`Jenjang: ${grade}`}                   onRemove={() => setGrade("all")} />}
          {curricula.map(c  => <FTag key={c} label={`Kurikulum: ${c}`}             onRemove={() => setCurricula(prev => prev.filter(x => x !== c))} />)}
          {bahasaFilter.map(b => <FTag key={b} label={`Bahasa: ${b}`}              onRemove={() => setBahasaFilter(prev => prev.filter(x => x !== b))} />)}
          {upBucket !== "all"         && <FTag label={`UP: ${UP_LABELS[upBucket]}`}                            onRemove={() => setUpBucket("all")} />}
          {sppBucket !== "all"        && <FTag label={`SPP: ${SPP_LABELS[sppBucket]}`}                         onRemove={() => setSppBucket("all")} />}
          {classSizeBucket !== "all"  && <FTag label={`Kelas: ${CLASS_SIZE_LABELS[classSizeBucket]}`}          onRemove={() => setClassSizeBucket("all")} />}
          <ActionButton onClick={resetFilters} style={{ fontSize: 12, fontWeight: 600, color: "#2e8a5a" }}>
            {t.filterClearAll}
          </ActionButton>
        </div>
      )}

      {/* Results */}
      <div style={{ padding: "12px 14px 0" }}>
        {loading && <SkeletonList count={6} />}

        {/* ✦ Featured — 1 random featured place, pinned above results */}
        {!loading && featuredSpot && (
          <div style={{
            marginBottom: 14,
            background: "#fef9c3",
            border: "1.5px dashed #f59e0b",
            padding: "8px 10px",
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
                      ? haversineKm(userLat, userLng, featuredSpot.lat, featuredSpot.lng)
                      : null
                  }
                />
              </ActionButton>
            ) : (
              <Link href={`/place/${featuredSpot.slug ?? featuredSpot.id}`} style={{ textDecoration: "none", display: "block" }}>
                <PlaceCard
                  place={featuredSpot}
                  distanceKm={
                    locationStatus === "granted" && userLat && userLng && featuredSpot.lat && featuredSpot.lng
                      ? haversineKm(userLat, userLng, featuredSpot.lat, featuredSpot.lng)
                      : null
                  }
                />
              </Link>
            )}
          </div>
        )}

        {!loading && filtered.length === 0 && !featuredSpot && (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8", fontSize: 13 }}>
            {t.schoolsNoResults}
          </div>
        )}
        {!loading && filtered.length === 0 && featuredSpot && (
          <div style={{ textAlign: "center", padding: "12px 0 32px", color: "#94a3b8", fontSize: 13 }}>
            {t.schoolsNoResults}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(school => {
            const isSelected = compareIds.includes(school.id);
            return (
              <div key={school.id}>
                {tier === "premium" && compareMode ? (
                  <ActionButton
                    onClick={() => toggleCompare(school.id)}
                    style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", padding: 0 }}
                  >
                    <PlaceCard
                      place={school}
                      selected={isSelected}
                      distanceKm={
                        locationStatus === "granted" && userLat && userLng && school.lat && school.lng
                          ? haversineKm(userLat, userLng, school.lat, school.lng)
                          : null
                      }
                    />
                  </ActionButton>
                ) : (
                  <Link href={`/place/${school.slug ?? school.id}`} style={{ textDecoration: "none", display: "block" }}>
                    <PlaceCard
                      place={school}
                      distanceKm={
                        locationStatus === "granted" && userLat && userLng && school.lat && school.lng
                          ? haversineKm(userLat, userLng, school.lat, school.lng)
                          : null
                      }
                    />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Compare float button */}
      {tier === "premium" && compareIds.length >= 2 && (
        <div style={{ position: "fixed", bottom: 96, left: 14, right: 14, margin: "0 auto", maxWidth: 420, zIndex: 20 }}>
          <ActionButton onClick={goCompare} style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            width: "100%", padding: "16px 20px", borderRadius: 18,
            background: "linear-gradient(135deg,#1f6b43,#2e8a5a)", color: "#fff", fontWeight: 700, fontSize: 14,
            boxShadow: "0 8px 24px rgba(30,63,176,0.36)" }}>
            <Scale size={16} />{t.schoolsCompareBtn(compareIds.length)}
          </ActionButton>
        </div>
      )}
      <FilterGateSheet isOpen={showFilterGate} onClose={() => setShowFilterGate(false)} />

      <BottomNav active="explore" />
    </div>
  );
}

export default function SchoolsPage() {
  return (
    <Suspense>
      <SchoolsContent />
    </Suspense>
  );
}
