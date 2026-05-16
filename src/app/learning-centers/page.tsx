"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronDown, SlidersHorizontal, ArrowUpDown, X } from "lucide-react";
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
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
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

const AGE_GROUP_OPTIONS_BASE = ["Toddler", "Kids", "Tween", "Teen"];

const TEACHER_RATIO_LABELS: Record<string, string> = {
  all: "Semua", "1to5": "≤ 1:5", "1to8": "1:6–1:8", "1to10": "1:9+",
};
const ADA_LABELS_LC: Record<string, string> = { all: "Semua", yes: "Ada", no: "Tidak Ada" };
const TEACHING_LANG_OPTIONS_BASE = ["Indonesia", "Inggris", "Bilingual"];

const HEADER_STYLE = {
  background: "linear-gradient(160deg, #0a2018 0%, #1f6b43 60%, #2e8a5a 100%)",
  borderRadius: "0 0 28px 28px", padding: "44px 20px 22px",
};

function LearningCentersContent() {
  const { t } = useLang();
  const { tier, loaded } = useAuth();
  const [allPlaces, setAllPlaces] = useState<Place[]>([]);
  const [loading,   setLoading]   = useState(true);
  useEffect(() => { fetchPlacesByCategory("learning-center").then(d => { setAllPlaces(d); setLoading(false); }); }, []);

  const [showFilterGate, setShowFilterGate] = useState(false);
  const [premiumOpen,   setPremiumOpen]   = useState(false);
  const router = useRouter();

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const view: "filter" | "results" =
    searchParams.get("view") === "results" ? "results" : "filter";

  const [area,        setArea]        = useState<"all"|"bintaro"|"bsd">((searchParams.get("area") as "all"|"bintaro"|"bsd") ?? "all");
  const [courseType,  setCourseType]  = useState(searchParams.get("course") ?? "all");
  const [ageGroup,    setAgeGroup]    = useState(searchParams.get("age") ?? "all");
  const [priceBucket, setPriceBucket] = useState(searchParams.get("price") ?? "all");
  const [freeTrial,    setFreeTrial]    = useState(searchParams.get("ft") ?? "all");
  const [teacherRatio, setTeacherRatio] = useState(searchParams.get("tr") ?? "all");
  const [teachingLang, setTeachingLang] = useState(searchParams.get("lang") ?? "all");
  const [sortBy,      setSortBy]      = useState<"alpha"|"za">((searchParams.get("sort") as "alpha"|"za") ?? "alpha");


  const COURSE_TYPE_OPTIONS = [
    { value: "all",             label: t.filterAll },
    { value: "Bahasa Inggris",  label: t.courseTypeEnglish },
    { value: "Matematika",      label: t.courseTypeMath },
    { value: "Seni Rupa",       label: t.courseTypeArts },
    { value: "Musik & Vokal",   label: t.courseTypeMusic },
    { value: "Coding / Robotik",  label: t.courseTypeCoding },
    { value: "Tari & Balet",    label: t.courseTypeDance },
    { value: "Gimnastik",       label: t.courseTypeGymnastics },
  ];
  const PRICE_OPTIONS = [
    { value: "all",        label: t.filterAll },
    { value: "lt200",      label: "< Rp 200 rb" },
    { value: "200to500",   label: "Rp 200–500 rb" },
    { value: "500to1000",  label: "Rp 500 rb–1 jt" },
    { value: "1to2jt",     label: "Rp 1–2 jt" },
    { value: "gt2jt",      label: "> Rp 2 jt" },
  ];

  const ageGroupLabels: Record<string, string> = {
    Toddler: t.ageGroupToddler, Kids: t.ageGroupKids,
    Tween: t.ageGroupTween, Teen: t.ageGroupTeen,
  };

  const ageGroupOptions = [
    { value: "all", label: t.filterAll },
    ...AGE_GROUP_OPTIONS_BASE.map(ag => ({ value: ag, label: ageGroupLabels[ag] ?? ag })),
  ];

  const teacherRatioOptions = Object.entries(TEACHER_RATIO_LABELS).map(([v, l]) => ({ value: v, label: l }));
  const adaOptionsLC        = Object.entries(ADA_LABELS_LC).map(([v, l]) => ({ value: v, label: l }));
  const teachingLangOptions = [
    { value: "all", label: "Semua" },
    ...TEACHING_LANG_OPTIONS_BASE.map(l => ({ value: l, label: l })),
  ];

  function matchesPriceBucket(c: { priceMin: number }): boolean {
    if (priceBucket === "lt200")    return c.priceMin < 200_000;
    if (priceBucket === "200to500") return c.priceMin >= 200_000 && c.priceMin <= 500_000;
    if (priceBucket === "500to1000") return c.priceMin > 500_000 && c.priceMin <= 1_000_000;
    if (priceBucket === "1to2jt")   return c.priceMin > 1_000_000 && c.priceMin <= 2_000_000;
    if (priceBucket === "gt2jt")    return c.priceMin > 2_000_000;
    return true;
  }

  const filtered = allPlaces
    .filter(c => area === "all" || placeMatchesAreas(c, [area]))
    .filter(c => courseType === "all" || c.courseTypes?.includes(courseType))
    .filter(c => ageGroup === "all" || c.ageGroups?.includes(ageGroup))
    .filter(c => matchesPriceBucket(c))
    .filter(c => {
      if (freeTrial === "all") return true;
      return freeTrial === "yes" ? c.freeTrial === true : c.freeTrial !== true;
    })
    .filter(c => {
      if (teacherRatio === "all") return true;
      const n = parseInt((c.teacherStudentRatio ?? "").split(":")[1] ?? "0");
      if (teacherRatio === "1to5")  return n > 0 && n <= 5;
      if (teacherRatio === "1to8")  return n >= 6 && n <= 8;
      if (teacherRatio === "1to10") return n >= 9;
      return true;
    })
    .filter(c => teachingLang === "all" || c.teachingLanguage === teachingLang)
    .sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return sortBy === "za" ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name);
  });

  const activeCount = [
    area !== "all",
    courseType !== "all",
    ageGroup !== "all",
    priceBucket !== "all",
    freeTrial !== "all",
    teacherRatio !== "all",
    teachingLang !== "all",
  ].filter(Boolean).length;

  function resetFilters() {
    setArea("all"); setCourseType("all"); setAgeGroup("all"); setPriceBucket("all");
    setFreeTrial("all"); setTeacherRatio("all"); setTeachingLang("all");
  }

  function toResults() {
    const p = new URLSearchParams({ view: "results" });
    if (area !== "all") p.set("area", area);
    if (courseType !== "all") p.set("course", courseType);
    if (ageGroup !== "all") p.set("age", ageGroup);
    if (priceBucket !== "all") p.set("price", priceBucket);
    if (freeTrial !== "all") p.set("ft", freeTrial);
    if (teacherRatio !== "all") p.set("tr", teacherRatio);
    if (teachingLang !== "all") p.set("lang", teachingLang);
    if (sortBy !== "alpha") p.set("sort", sortBy);
    return `${pathname}?${p}`;
  }
  function toFilter() {
    const p = new URLSearchParams();
    if (area !== "all") p.set("area", area);
    if (courseType !== "all") p.set("course", courseType);
    if (ageGroup !== "all") p.set("age", ageGroup);
    if (priceBucket !== "all") p.set("price", priceBucket);
    if (freeTrial !== "all") p.set("ft", freeTrial);
    if (teacherRatio !== "all") p.set("tr", teacherRatio);
    if (teachingLang !== "all") p.set("lang", teachingLang);
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
                {t.lcTitle}
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
          {([
            { label: t.filterAgeGroup,   value: ageGroup,    set: setAgeGroup,    opts: ageGroupOptions    },
            { label: t.filterCourseType, value: courseType,  set: setCourseType,  opts: COURSE_TYPE_OPTIONS },
            { label: t.filterPrice,      value: priceBucket, set: setPriceBucket, opts: PRICE_OPTIONS       },
          ] as const).map(({ label, value, set, opts }) => (
            <div key={String(label)} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
                color: "#94a3b8", textTransform: "uppercase", flexShrink: 0, width: 96 }}>{label}</p>
              <div style={{ flex: 1 }}>
                <FilterDropdown value={value} onChange={set as (v: string) => void} options={opts as { value: string; label: string }[]} />
              </div>
            </div>
          ))}

          {/* Collapsible premium filter section */}
          <ActionButton
            onClick={() => setPremiumOpen(o => !o)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              width: "100%", padding: "13px 16px", marginBottom: premiumOpen ? 0 : 8,
              borderRadius: premiumOpen ? "14px 14px 0 0" : 14,
              background: "#f0fdf4",
              border: "1.5px solid #bbf7d0",
              touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
              cursor: "pointer",
            } as React.CSSProperties}
          >
            <span style={{
              fontFamily: "var(--font-jakarta), sans-serif",
              fontSize: 13, fontWeight: 700, color: "#166534",
            }}>
              Filter Lebih Dalam?{" "}
              <span style={{ fontWeight: 500, color: "#15803d" }}>(Fitur Khusus Premium)</span>
            </span>
            <ChevronDown
              size={18} color="#166534"
              style={{ transform: premiumOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}
            />
          </ActionButton>

          {premiumOpen && (
            <div style={{
              border: "1.5px solid #bbf7d0", borderTop: "none",
              borderRadius: "0 0 14px 14px",
              padding: "16px 16px 4px",
              marginBottom: 8,
              background: "#fff",
            }}>
              {tier === "premium" ? (
                <>
                  {([
                    { label: "Free Trial",        value: freeTrial,    set: setFreeTrial,    opts: adaOptionsLC        },
                    { label: "Rasio Guru:Murid",  value: teacherRatio, set: setTeacherRatio, opts: teacherRatioOptions },
                    { label: "Bahasa Pengantar",  value: teachingLang, set: setTeachingLang, opts: teachingLangOptions },
                  ] as const).map(({ label, value, set, opts }) => (
                    <div key={String(label)} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
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
                  {(["Free Trial", "Rasio Guru:Murid", "Bahasa Pengantar"] as const).map((label) => (
                    <ActionButton
                      key={String(label)}
                      onClick={() => setShowFilterGate(true)}
                      style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14,
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
              {t.lcFound(filtered.length)}
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
            <ActionButton onClick={() => router.replace(toFilter())} ariaLabel="Back" style={{
              width: 36, height: 36, borderRadius: 999, flexShrink: 0,
              background: "rgba(255,255,255,0.18)", display: "inline-flex",
              alignItems: "center", justifyContent: "center" }}>
              <ChevronLeft size={20} color="white" />
            </ActionButton>
            <div>
              <h1 style={{ margin: 0, fontFamily: "var(--font-fraunces),Georgia,serif",
                fontSize: 26, fontWeight: 600, letterSpacing: -0.5, lineHeight: 1, color: "#fff" }}>
                {t.lcTitle}
              </h1>
              <p style={{ margin: "3px 0 0", color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
                {t.lcFound(filtered.length)}
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
          {courseType !== "all" && <FTag label={`${t.ftagCourse}: ${COURSE_TYPE_OPTIONS.find(o => o.value === courseType)?.label ?? courseType}`} onRemove={() => setCourseType("all")} />}
          {ageGroup !== "all" && <FTag label={`${t.ftagAge}: ${ageGroupLabels[ageGroup] ?? ageGroup}`} onRemove={() => setAgeGroup("all")} />}
          {priceBucket !== "all" && <FTag label={`${t.ftagPrice}: ${PRICE_OPTIONS.find(o => o.value === priceBucket)?.label ?? priceBucket}`} onRemove={() => setPriceBucket("all")} />}
          {freeTrial !== "all" && <FTag label={`Free Trial: ${ADA_LABELS_LC[freeTrial] ?? freeTrial}`} onRemove={() => setFreeTrial("all")} />}
          {teacherRatio !== "all" && <FTag label={`Rasio: ${TEACHER_RATIO_LABELS[teacherRatio] ?? teacherRatio}`} onRemove={() => setTeacherRatio("all")} />}
          {teachingLang !== "all" && <FTag label={`Bahasa: ${teachingLang}`} onRemove={() => setTeachingLang("all")} />}
          <ActionButton onClick={resetFilters} style={{ fontSize: 12, fontWeight: 600, color: "#2e8a5a" }}>
            {t.filterClearAll}
          </ActionButton>
        </div>
      )}

      {/* Results */}
      <div style={{ padding: "12px 14px 0" }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8", fontSize: 13 }}>
            {t.lcNoResults}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(center => (
            <Link key={center.id} href={`/place/${center.id}`} style={{ textDecoration: "none", display: "block" }}>
              <PlaceCard place={center} />
            </Link>
          ))}
        </div>
      </div>
      <FilterGateSheet isOpen={showFilterGate} onClose={() => setShowFilterGate(false)} />

      <BottomNav active="explore" />
    </div>
  );
}

export default function LearningCentersPage() {
  return (
    <Suspense>
      <LearningCentersContent />
    </Suspense>
  );
}
