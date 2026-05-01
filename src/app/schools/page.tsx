"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, SlidersHorizontal, Check, Scale, ArrowUpDown, X } from "lucide-react";
import { schools, placeMatchesAreas, type Grade } from "@/lib/mockData";
import { useLang } from "@/context/LanguageContext";
import { BottomNav } from "@/components/BottomNav";
import { PlaceCard } from "@/components/PlaceCard";
import { ActionButton } from "@/components/ActionButton";
import { GuestGate } from "@/components/GuestGate";
import { FilterGateSheet } from "@/components/FilterGateSheet";
import { useAuth } from "@/context/AuthContext";

// ── Hidden radio style ────────────────────────────────────────────────────────
const HI = { position: "absolute" as const, width: 1, height: 1, opacity: 0,
  margin: -1, padding: 0, overflow: "hidden" as const, clip: "rect(0,0,0,0)", border: 0 };

// ── Area chip ─────────────────────────────────────────────────────────────────
function Chip({ name, value, checked, onChange, children }: {
  name: string; value: string; checked: boolean; onChange: () => void; children: React.ReactNode;
}) {
  return (
    <label style={{ cursor: "pointer", userSelect: "none", WebkitUserSelect: "none" }}>
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} style={HI} />
      <span style={{ display: "inline-block", padding: "6px 13px", borderRadius: 999,
        fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap", transition: "all 0.15s",
        border: checked ? "2px solid #1d4ed8" : "2px solid #e2e8f0",
        background: checked ? "#1d4ed8" : "#fff", color: checked ? "#fff" : "#374151" }}>
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
          color: active ? "#1e3a5f" : "#94a3b8",
          border: `2px solid ${active ? "#1d4ed8" : "#e2e8f0"}`,
          background: active ? "#eff6ff" : "#fff",
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
          stroke={active ? "#1d4ed8" : "#94a3b8"} strokeWidth="2.5"
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
      background: "#eff6ff", borderRadius: 999, padding: "4px 6px 4px 10px",
      fontSize: 12, fontWeight: 600, color: "#1e3a5f" }}>
      {label}
      <ActionButton onClick={onRemove} ariaLabel="Remove" style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "#1d4ed8", borderRadius: 999, width: 16, height: 16, flexShrink: 0 }}>
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
const CURRICULA = ["Nasional","Nasional Plus","Merdeka","Cambridge","IB","Montessori","Islam Terpadu","Blended Learning","Others"];
const BAHASA    = ["Indonesian","English","Bilingual (ID+EN)","Bilingual (ID+MND)","Bilingual (ID+ARB)","Japanese","German"];
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

const HEADER_STYLE = {
  background: "linear-gradient(150deg,#1e3a5f 0%,#1d4ed8 55%,#3b82f6 100%)",
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
  const { t } = useLang();
  const { tier, loaded } = useAuth();
  const [showFilterGate, setShowFilterGate] = useState(false);
  const router = useRouter();

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const view: "filter" | "results" =
    (loaded && tier === "guest") || searchParams.get("view") === "results"
      ? "results"
      : "filter";

  const [area,       setArea]       = useState<"all"|"bintaro"|"bsd">((searchParams.get("area") as "all"|"bintaro"|"bsd") ?? "all");
  const [grade,      setGrade]      = useState(searchParams.get("grade") ?? "all");
  const [curriculum, setCurriculum] = useState(searchParams.get("cur") ?? "all");
  const [bahasa,     setBahasa]     = useState(searchParams.get("bhs") ?? "all");
  const [upBucket,   setUpBucket]   = useState(searchParams.get("up") ?? "all");
  const [sppBucket,  setSppBucket]  = useState(searchParams.get("spp") ?? "all");
  const [sortBy,     setSortBy]     = useState<"rating"|"price">((searchParams.get("sort") as "rating"|"price") ?? "rating");
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const filtered = schools
    .filter(s => area === "all" || placeMatchesAreas(s, [area]))
    .filter(s => grade === "all" || s.grades?.includes(grade as Grade))
    .filter(s => curriculum === "all" || s.curriculum === curriculum)
    .filter(s => bahasa === "all" || s.bahasa?.includes(bahasa))
    .filter(s => matchesUpBucket(s.uangPangkalMin, upBucket))
    .filter(s => matchesSppBucket(s.priceMin, sppBucket))
    .sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return sortBy === "price" ? a.priceMin - b.priceMin : b.rating - a.rating;
  });

  const activeCount = [
    area !== "all", grade !== "all", curriculum !== "all",
    bahasa !== "all", upBucket !== "all", sppBucket !== "all",
  ].filter(Boolean).length;

  function resetFilters() {
    setArea("all"); setGrade("all"); setCurriculum("all");
    setBahasa("all"); setUpBucket("all"); setSppBucket("all");
  }

  function toResults() {
    const p = new URLSearchParams({ view: "results" });
    if (area !== "all") p.set("area", area);
    if (grade !== "all") p.set("grade", grade);
    if (curriculum !== "all") p.set("cur", curriculum);
    if (bahasa !== "all") p.set("bhs", bahasa);
    if (upBucket !== "all") p.set("up", upBucket);
    if (sppBucket !== "all") p.set("spp", sppBucket);
    if (sortBy !== "rating") p.set("sort", sortBy);
    return `${pathname}?${p}`;
  }
  function toFilter() {
    const p = new URLSearchParams();
    if (area !== "all") p.set("area", area);
    if (grade !== "all") p.set("grade", grade);
    if (curriculum !== "all") p.set("cur", curriculum);
    if (bahasa !== "all") p.set("bhs", bahasa);
    if (upBucket !== "all") p.set("up", upBucket);
    if (sppBucket !== "all") p.set("spp", sppBucket);
    if (sortBy !== "rating") p.set("sort", sortBy);
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

  // Dropdown option builders
  const gradeOptions    = [{ value: "all", label: "Semua" }, ...GRADES.map(g => ({ value: g, label: g }))];
  const curriculumOpts  = [{ value: "all", label: "Semua" }, ...CURRICULA.map(c => ({ value: c, label: c }))];
  const bahasaOptions   = [{ value: "all", label: "Semua" }, ...BAHASA.map(b => ({ value: b, label: b }))];
  const upOptions       = Object.entries(UP_LABELS).map(([v, l]) => ({ value: v, label: l }));
  const sppOptions      = Object.entries(SPP_LABELS).map(([v, l]) => ({ value: v, label: l }));

  // ── Filter View ──────────────────────────────────────────────────────────────
  if (view === "filter") {
    return (
      <div style={{ maxWidth: 448, margin: "0 auto", minHeight: "100vh", background: "#f8fafc" }}>
        <div style={HEADER_STYLE}>
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
        </div>

        <div style={{ padding: "24px 20px 130px" }}>

          {/* Area */}
          <div style={{ marginBottom: 28 }}>
            <SectionHead>Area</SectionHead>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {(["all","bintaro","bsd"] as const).map(v => (
                <Chip key={v} name="f-area" value={v} checked={area === v} onChange={() => setArea(v)}>
                  {v === "all" ? t.filterAll : v === "bintaro" ? "Bintaro" : "BSD"}
                </Chip>
              ))}
            </div>
          </div>

          {/* Dropdown rows — label + dropdown on same line */}
          {([
            { label: t.filterGrade,       value: grade,      set: setGrade,      opts: gradeOptions   },
            { label: "Kurikulum",          value: curriculum, set: setCurriculum, opts: curriculumOpts  },
            { label: t.filterBahasa,       value: bahasa,     set: setBahasa,     opts: bahasaOptions  },
            { label: t.filterUangPangkal,  value: upBucket,   set: setUpBucket,   opts: upOptions      },
            { label: "SPP / Bulan",        value: sppBucket,  set: setSppBucket,  opts: sppOptions     },
          ] as const).map(({ label, value, set, opts }) => (
            <div key={String(label)} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
                color: "#94a3b8", textTransform: "uppercase", flexShrink: 0, width: 96 }}>
                {label}
              </p>
              <div style={{ flex: 1 }}>
                <FilterDropdown value={value} onChange={set} options={opts as { value: string; label: string }[]} />
              </div>
            </div>
          ))}

        </div>

        {/* Sticky CTA */}
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 10,
          padding: "14px 20px", paddingBottom: "max(14px, env(safe-area-inset-bottom))",
          background: "#fff", borderTop: "1px solid #f1f5f9" }}>
          <div style={{ maxWidth: 448, margin: "0 auto" }}>
            <button
              onClick={() => tier === "guest" ? setShowFilterGate(true) : router.replace(toResults())}
              onTouchEnd={(e) => { e.preventDefault(); tier === "guest" ? setShowFilterGate(true) : router.replace(toResults()); }}
              style={{ width: "100%", padding: "15px 0", borderRadius: 16, border: "none",
                background: "linear-gradient(135deg,#1e3a5f,#2563eb)", color: "#fff",
                fontFamily: "var(--font-jakarta),system-ui,sans-serif",
                fontSize: 15, fontWeight: 700, cursor: "pointer",
                touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}>
              {tier === "guest" ? "Daftar untuk Lihat Semua" : t.schoolsFound(filtered.length)}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Results View ─────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 448, margin: "0 auto", minHeight: "100vh", paddingBottom: 110, background: "#f8fafc" }}>
      <div style={HEADER_STYLE}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <ActionButton onClick={() => tier === "guest" ? router.back() : router.replace(toFilter())} ariaLabel="Back" style={{
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
      </div>

      {/* Filter / Sort bar */}
      <div style={{ display: "flex", gap: 10, margin: "12px 14px 0", alignItems: "center" }}>
        <ActionButton onClick={() => tier === "guest" ? setShowFilterGate(true) : router.replace(toFilter())} style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "10px 16px", borderRadius: 999,
          background: "#0f172a", color: "#fff", fontWeight: 700, fontSize: 13.5, flexShrink: 0 }}>
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
        <ActionButton onClick={() => tier === "guest" ? setShowFilterGate(true) : setSortBy(s => s === "rating" ? "price" : "rating")} style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "10px 16px", borderRadius: 999,
          background: "#fff", color: "#374151", fontWeight: 600, fontSize: 13.5,
          border: "1.5px solid #e2e8f0" }}>
          <ArrowUpDown size={14} strokeWidth={2.5} />
          {t.filterSort}
          <span style={{ fontSize: 11, color: "#1d4ed8", fontWeight: 700 }}>
            {sortBy === "rating" ? "★" : "↑Rp"}
          </span>
        </ActionButton>
      </div>

      {/* Active filter tags */}
      {activeCount > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "8px 14px 0", alignItems: "center" }}>
          {area !== "all"       && <FTag label={area === "bintaro" ? "Bintaro" : "BSD"}          onRemove={() => setArea("all")} />}
          {grade !== "all"      && <FTag label={`Jenjang: ${grade}`}                             onRemove={() => setGrade("all")} />}
          {curriculum !== "all" && <FTag label={`Kurikulum: ${curriculum}`}                      onRemove={() => setCurriculum("all")} />}
          {bahasa !== "all"     && <FTag label={`Bahasa: ${bahasa}`}                             onRemove={() => setBahasa("all")} />}
          {upBucket !== "all"   && <FTag label={`UP: ${UP_LABELS[upBucket]}`}                   onRemove={() => setUpBucket("all")} />}
          {sppBucket !== "all"  && <FTag label={`SPP: ${SPP_LABELS[sppBucket]}`}                onRemove={() => setSppBucket("all")} />}
          <ActionButton onClick={resetFilters} style={{ fontSize: 12, fontWeight: 600, color: "#1d4ed8" }}>
            {t.filterClearAll}
          </ActionButton>
        </div>
      )}

      {/* Results */}
      <div style={{ padding: "12px 14px 0" }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8", fontSize: 13 }}>
            {t.schoolsNoResults}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.slice(0, tier === "guest" ? 3 : undefined).map(school => {
            const isSelected = compareIds.includes(school.id);
            return (
              <div key={school.id} style={{ position: "relative" }}>
                <Link href={`/place/${school.id}`} style={{ textDecoration: "none", display: "block" }}>
                  <PlaceCard place={school} selected={isSelected} />
                </Link>
                {tier !== "guest" && (
                  <div style={{ position: "absolute", top: 8, right: 8, zIndex: 10 }}>
                    <ActionButton onClick={() => toggleCompare(school.id)} ariaLabel="Toggle compare" style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      width: 22, height: 22, borderRadius: 6,
                      border: `2px solid ${isSelected ? "#1d4ed8" : "#cbd5e1"}`,
                      background: isSelected ? "#1d4ed8" : "#fff" }}>
                      {isSelected && <Check size={11} color="white" strokeWidth={3} />}
                    </ActionButton>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {tier === "guest" && filtered.length > 3 && (
          <GuestGate hiddenCount={filtered.length - 3}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.slice(3, 6).map(school => (
                <div key={school.id}><PlaceCard place={school} /></div>
              ))}
            </div>
          </GuestGate>
        )}
      </div>

      {/* Compare float button */}
      {tier !== "guest" && compareIds.length >= 2 && (
        <div style={{ position: "fixed", bottom: 80, left: 14, right: 14, margin: "0 auto", maxWidth: 420, zIndex: 20 }}>
          <ActionButton onClick={goCompare} style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            width: "100%", padding: "16px 20px", borderRadius: 18,
            background: "linear-gradient(135deg,#1e3a5f,#1d4ed8)", color: "#fff", fontWeight: 700, fontSize: 14,
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
