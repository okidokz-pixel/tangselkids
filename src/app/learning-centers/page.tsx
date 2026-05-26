"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, SlidersHorizontal, ArrowUpDown, X, Check } from "lucide-react";
import { placeMatchesAreas, type Place } from "@/lib/mockData";
import { fetchPlacesByCategory } from "@/lib/db";
import { useLang } from "@/context/LanguageContext";
import { BottomNav } from "@/components/BottomNav";
import { PlaceCard } from "@/components/PlaceCard";
import { ActionButton } from "@/components/ActionButton";
import { useAuth } from "@/context/AuthContext";
import { PremiumBadge } from "@/components/PremiumBadge";
import { AreaCoverageButton } from "@/components/AreaCoverageButton";
import { SkeletonList } from "@/components/SkeletonCard";

// ── Hidden input style ────────────────────────────────────────────────────────
const HI = { position: "absolute" as const, width: 1, height: 1, opacity: 0,
  margin: -1, padding: 0, overflow: "hidden" as const, clip: "rect(0,0,0,0)", border: 0 };

// ── Single-select chip (radio) ────────────────────────────────────────────────
function Chip({ name, value, checked, onChange, children, compact }: {
  name: string; value: string; checked: boolean; onChange: () => void;
  children: React.ReactNode; compact?: boolean;
}) {
  return (
    <label style={{ cursor: "pointer", userSelect: "none", WebkitUserSelect: "none" }}>
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} style={HI} />
      <span style={{
        display: "inline-block", padding: compact ? "5px 11px" : "6px 13px", borderRadius: 999,
        fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap", transition: "all 0.15s",
        border: checked ? "2px solid #2e8a5a" : "2px solid #e2e8f0",
        background: checked ? "#2e8a5a" : "#fff", color: checked ? "#fff" : "#374151",
      }}>
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
  return (
    <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
      color: "#94a3b8", textTransform: "uppercase" as const }}>
      {children}
    </p>
  );
}

// ── Constants ─────────────────────────────────────────────────────────────────
const COURSE_TYPES = [
  "Bahasa Inggris", "Matematika", "Seni Rupa", "Musik & Vokal",
  "Coding / Robotik", "Tari & Balet", "Gimnastik",
];

const AGE_GROUPS = ["Toddler", "Kids", "Tween", "Teen"];

const TEACHING_LANGS = ["Indonesia", "Inggris", "Bilingual"];

const MONTHLY_FEE_BUCKETS: Record<string, string> = {
  all:        "Semua",
  lt200:      "< Rp 200 rb",
  "200to500": "Rp 200–500 rb",
  "500to1k":  "Rp 500 rb–1 jt",
  "1to2jt":   "Rp 1–2 jt",
  gt2jt:      "> Rp 2 jt",
};

const REG_FEE_BUCKETS: Record<string, string> = {
  all:        "Semua",
  lt200:      "< Rp 200 rb",
  "200to500": "Rp 200–500 rb",
  "500to1k":  "Rp 500 rb–1 jt",
  "1to2jt":   "Rp 1–2 jt",
  gt2jt:      "> Rp 2 jt",
};

const HEADER_STYLE = {
  background: "linear-gradient(160deg, #0a2018 0%, #1f6b43 60%, #2e8a5a 100%)",
  borderRadius: "0 0 28px 28px", padding: "44px 20px 22px",
};

// ── Bucket matchers ───────────────────────────────────────────────────────────
function matchesMonthlyFee(priceMin: number, bucket: string): boolean {
  if (bucket === "all")       return true;
  if (bucket === "lt200")     return priceMin < 200_000;
  if (bucket === "200to500")  return priceMin >= 200_000 && priceMin <= 500_000;
  if (bucket === "500to1k")   return priceMin > 500_000 && priceMin <= 1_000_000;
  if (bucket === "1to2jt")    return priceMin > 1_000_000 && priceMin <= 2_000_000;
  if (bucket === "gt2jt")     return priceMin > 2_000_000;
  return true;
}

function matchesRegFee(regFeeMin: number | undefined, bucket: string): boolean {
  if (bucket === "all")       return true;
  if (regFeeMin === undefined) return false;
  if (bucket === "lt200")     return regFeeMin < 200_000;
  if (bucket === "200to500")  return regFeeMin >= 200_000 && regFeeMin <= 500_000;
  if (bucket === "500to1k")   return regFeeMin > 500_000 && regFeeMin <= 1_000_000;
  if (bucket === "1to2jt")    return regFeeMin > 1_000_000 && regFeeMin <= 2_000_000;
  if (bucket === "gt2jt")     return regFeeMin > 2_000_000;
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────

function LearningCentersContent() {
  const { t } = useLang();
  const { loaded } = useAuth();
  const [allPlaces, setAllPlaces] = useState<Place[]>([]);
  const [loading,   setLoading]   = useState(true);
  useEffect(() => { fetchPlacesByCategory("learning-center").then(d => { setAllPlaces(d); setLoading(false); }); }, []);

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const view: "filter" | "results" =
    searchParams.get("view") === "results" ? "results" : "filter";

  // ── Filter state ─────────────────────────────────────────────────────────────
  const [area,         setArea]         = useState<"all"|"bintaro"|"bsd">((searchParams.get("area") as "all"|"bintaro"|"bsd") ?? "all");
  const [courseTypes,  setCourseTypes]  = useState<string[]>(() => {
    const v = searchParams.get("course");
    return v && v !== "all" ? v.split(",") : [];
  });
  const [regFeeBucket,  setRegFeeBucket]  = useState(searchParams.get("rf") ?? "all");
  const [monthlyBucket, setMonthlyBucket] = useState(searchParams.get("price") ?? "all");
  const [ageGroup,      setAgeGroup]      = useState(searchParams.get("age") ?? "all");
  const [teachingLang,  setTeachingLang]  = useState(searchParams.get("lang") ?? "all");
  const [sortBy,        setSortBy]        = useState<"alpha"|"za">((searchParams.get("sort") as "alpha"|"za") ?? "alpha");

  const ageGroupLabels: Record<string, string> = {
    Toddler: t.ageGroupToddler, Kids: t.ageGroupKids,
    Tween: t.ageGroupTween, Teen: t.ageGroupTeen,
  };

  // ── Filtering ─────────────────────────────────────────────────────────────────
  const filtered = allPlaces
    .filter(c => area === "all" || placeMatchesAreas(c, [area]))
    .filter(c => courseTypes.length === 0 || courseTypes.some(ct => c.courseTypes?.includes(ct)))
    .filter(c => matchesRegFee(c.registrationFeeMin, regFeeBucket))
    .filter(c => matchesMonthlyFee(c.priceMin, monthlyBucket))
    .filter(c => ageGroup === "all" || c.ageGroups?.includes(ageGroup))
    .filter(c => teachingLang === "all" || c.teachingLanguage === teachingLang)
    .sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return sortBy === "za" ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name);
    });

  const activeCount = [
    area !== "all",
    courseTypes.length > 0,
    regFeeBucket !== "all",
    monthlyBucket !== "all",
    ageGroup !== "all",
    teachingLang !== "all",
  ].filter(Boolean).length;

  function resetFilters() {
    setArea("all"); setCourseTypes([]); setRegFeeBucket("all");
    setMonthlyBucket("all"); setAgeGroup("all"); setTeachingLang("all");
  }

  function toResults() {
    const p = new URLSearchParams({ view: "results" });
    if (area !== "all") p.set("area", area);
    if (courseTypes.length > 0) p.set("course", courseTypes.join(","));
    if (regFeeBucket !== "all") p.set("rf", regFeeBucket);
    if (monthlyBucket !== "all") p.set("price", monthlyBucket);
    if (ageGroup !== "all") p.set("age", ageGroup);
    if (teachingLang !== "all") p.set("lang", teachingLang);
    if (sortBy !== "alpha") p.set("sort", sortBy);
    return `${pathname}?${p}`;
  }
  function toFilter() {
    const p = new URLSearchParams();
    if (area !== "all") p.set("area", area);
    if (courseTypes.length > 0) p.set("course", courseTypes.join(","));
    if (regFeeBucket !== "all") p.set("rf", regFeeBucket);
    if (monthlyBucket !== "all") p.set("price", monthlyBucket);
    if (ageGroup !== "all") p.set("age", ageGroup);
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
                  background: "rgba(255,255,255,0.18)", display: "inline-flex",
                  alignItems: "center", justifyContent: "center" }}>
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

          {/* Tipe Kursus */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "10px 14px", border: "1px solid #ede8df" }}>
            <SectionHead>{t.filterCourseType}</SectionHead>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              <Chip name="f-course-all" value="all" checked={courseTypes.length === 0} onChange={() => setCourseTypes([])}>
                {t.filterAll}
              </Chip>
              {COURSE_TYPES.map(ct => (
                <MultiChip
                  key={ct}
                  checked={courseTypes.includes(ct)}
                  onChange={() => setCourseTypes(prev =>
                    prev.includes(ct) ? prev.filter(x => x !== ct) : [...prev, ct]
                  )}
                >
                  {ct}
                </MultiChip>
              ))}
            </div>
          </div>

          {/* Biaya Pendaftaran */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "10px 14px", border: "1px solid #ede8df" }}>
            <SectionHead>Biaya Pendaftaran</SectionHead>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {Object.entries(REG_FEE_BUCKETS).map(([v, label]) => (
                <Chip key={v} name="f-rf" value={v} checked={regFeeBucket === v} onChange={() => setRegFeeBucket(v)}>
                  {label}
                </Chip>
              ))}
            </div>
          </div>

          {/* Biaya Bulanan */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "10px 14px", border: "1px solid #ede8df" }}>
            <SectionHead>Biaya Bulanan</SectionHead>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {Object.entries(MONTHLY_FEE_BUCKETS).map(([v, label]) => (
                <Chip key={v} name="f-price" value={v} checked={monthlyBucket === v} onChange={() => setMonthlyBucket(v)}>
                  {label}
                </Chip>
              ))}
            </div>
          </div>

          {/* Rentang Usia */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "10px 14px", border: "1px solid #ede8df" }}>
            <SectionHead>Rentang Usia</SectionHead>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              <Chip name="f-age" value="all" checked={ageGroup === "all"} onChange={() => setAgeGroup("all")}>
                {t.filterAll}
              </Chip>
              {AGE_GROUPS.map(ag => (
                <Chip key={ag} name="f-age" value={ag} checked={ageGroup === ag} onChange={() => setAgeGroup(ag)}>
                  {ageGroupLabels[ag] ?? ag}
                </Chip>
              ))}
            </div>
          </div>

          {/* Bahasa Pengantar */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "10px 14px", border: "1px solid #ede8df" }}>
            <SectionHead>Bahasa Pengantar</SectionHead>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              <Chip name="f-lang" value="all" checked={teachingLang === "all"} onChange={() => setTeachingLang("all")}>
                {t.filterAll}
              </Chip>
              {TEACHING_LANGS.map(l => (
                <Chip key={l} name="f-lang" value={l} checked={teachingLang === l} onChange={() => setTeachingLang(l)}>
                  {l}
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
              {t.lcFound(filtered.length)}
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
          {courseTypes.map(ct => (
            <FTag key={ct} label={ct} onRemove={() => setCourseTypes(prev => prev.filter(x => x !== ct))} />
          ))}
          {regFeeBucket !== "all" && <FTag label={`Daftar: ${REG_FEE_BUCKETS[regFeeBucket] ?? regFeeBucket}`} onRemove={() => setRegFeeBucket("all")} />}
          {monthlyBucket !== "all" && <FTag label={`Bulanan: ${MONTHLY_FEE_BUCKETS[monthlyBucket] ?? monthlyBucket}`} onRemove={() => setMonthlyBucket("all")} />}
          {ageGroup !== "all" && <FTag label={`Usia: ${ageGroupLabels[ageGroup] ?? ageGroup}`} onRemove={() => setAgeGroup("all")} />}
          {teachingLang !== "all" && <FTag label={`Bahasa: ${teachingLang}`} onRemove={() => setTeachingLang("all")} />}
          <ActionButton onClick={resetFilters} style={{ fontSize: 12, fontWeight: 600, color: "#2e8a5a" }}>
            {t.filterClearAll}
          </ActionButton>
        </div>
      )}

      {/* Results */}
      <div style={{ padding: "12px 14px 0" }}>
        {loading && <SkeletonList count={6} />}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8", fontSize: 13 }}>
            {t.lcNoResults}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(center => (
            <Link key={center.id} href={`/place/${center.slug ?? center.id}`} style={{ textDecoration: "none", display: "block" }}>
              <PlaceCard place={center} />
            </Link>
          ))}
        </div>
      </div>

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
