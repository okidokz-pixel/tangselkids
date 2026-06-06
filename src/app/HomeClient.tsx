"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { LangToggle } from "@/components/LangToggle";
import { PremiumBadge } from "@/components/PremiumBadge";
import { BottomNav } from "@/components/BottomNav";
import { AreaCoverageButton } from "@/components/AreaCoverageButton";
import { useLoginSheet } from "@/context/LoginSheetContext";
import { ActionButton } from "@/components/ActionButton";
import { getAreaGroup } from "@/lib/mockData";
import { fetchCategoryCounts, fetchPlacesByCategory, fetchAllPlaces, fetchPrimaryCountsFast, getCachedCategory, getCachedCounts, searchAllPlaces } from "@/lib/db";
import type { Place } from "@/lib/mockData";
import { articles, localizeArticle } from "@/lib/articles";
import { fetchPublishedArticles, type DbArticle } from "@/lib/articles-db";

// ─── Photo URLs (replace before launch — see README) ─────────────────────────
const P = {
  sekolah: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=700&q=80&auto=format&fit=crop",
  kursus:  "https://images.unsplash.com/photo-1588072432836-e10032774350?w=700&q=80&auto=format&fit=crop",
};

// ─── Types ────────────────────────────────────────────────────────────────────
type AreaKey     = "Bintaro" | "BSD" | "Semua";
type CategoryKey = "sekolah" | "kursus";

// ─── Typewriter words per language ───────────────────────────────────────────
const TYPE_WORDS: Record<"id" | "en", string[]> = {
  id: ["sekolah", "tempat kursus", "daycare", "playground", "Klinik Anak", "kafe ramah anak", "kolam renang"],
  en: ["school", "learning center", "daycare", "playground", "children's clinic", "family café", "swimming pool"],
};

// ─── Age-band data (bilingual) ────────────────────────────────────────────────
// key = Grade value used by the schools page filter (grade= URL param)
const SCHOOL_LEVELS_DATA: Record<"id" | "en", { key: string; label: string; sub: string; dot: string }[]> = {
  id: [
    { key: "Preschool", label: "Preschool", sub: "2–4 thn",   dot: "#f59e0b" },
    { key: "TK",        label: "TK",        sub: "4–6 thn",   dot: "#ef6f6c" },
    { key: "SD",        label: "SD",        sub: "6–12 thn",  dot: "#1f9b6a" },
    { key: "SMP",       label: "SMP",       sub: "12–15 thn", dot: "#3a64ee" },
    { key: "SMA",       label: "SMA",       sub: "15–18 thn", dot: "#9c5a7a" },
  ],
  en: [
    { key: "Preschool", label: "Preschool",    sub: "2–4 yrs",   dot: "#f59e0b" },
    { key: "TK",        label: "Kindergarten", sub: "4–6 yrs",   dot: "#ef6f6c" },
    { key: "SD",        label: "Primary",      sub: "6–12 yrs",  dot: "#1f9b6a" },
    { key: "SMP",       label: "Jr. High",     sub: "12–15 yrs", dot: "#3a64ee" },
    { key: "SMA",       label: "Sr. High",     sub: "15–18 yrs", dot: "#9c5a7a" },
  ],
};

// LC age bands match exactly the 4 groups used on the Learning Centers filter page.
// Keys ("Toddler", "Kids", "Tween", "Teen") match the ageGroups field in mockData.
const LC_AGE_BANDS: Record<"id" | "en", { key: string; label: string; sub: string; dot: string }[]> = {
  id: [
    { key: "Toddler", label: "Toddler", sub: "0–3 thn",  dot: "#f59e0b" },
    { key: "Kids",    label: "Kids",    sub: "4–8 thn",  dot: "#ef6f6c" },
    { key: "Tween",   label: "Tween",   sub: "9–12 thn", dot: "#1f9b6a" },
    { key: "Teen",    label: "Teen",    sub: "13+ thn",  dot: "#3a64ee" },
  ],
  en: [
    { key: "Toddler", label: "Toddler", sub: "0–3 yrs",  dot: "#f59e0b" },
    { key: "Kids",    label: "Kids",    sub: "4–8 yrs",  dot: "#ef6f6c" },
    { key: "Tween",   label: "Tween",   sub: "9–12 yrs", dot: "#1f9b6a" },
    { key: "Teen",    label: "Teen",    sub: "13+ yrs",  dot: "#3a64ee" },
  ],
};

// ─── Count helpers (accept data arrays so they work with both mock and live data)
function matchesArea(area: string, areaKey: AreaKey): boolean {
  if (areaKey === "Semua") return true;
  const g = getAreaGroup(area);
  return g === "both" || g === (areaKey === "Bintaro" ? "bintaro" : "bsd");
}

// Mirrors the parsing logic in learning-centers/page.tsx
function parseAgeRange(str: string): [number, number] {
  const keAtas = str.match(/(\d+)\s*tahun\s*ke\s*atas/i);
  if (keAtas) return [parseInt(keAtas[1]), 99];
  const range = str.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (range) return [parseInt(range[1]), parseInt(range[2])];
  const single = str.match(/(\d+)/);
  if (single) return [parseInt(single[1]), parseInt(single[1])];
  return [0, 99];
}

const LC_AGE_BUCKET_RANGES: Record<string, [number, number]> = {
  Toddler: [0, 3],
  Kids:    [4, 8],
  Tween:   [9, 12],
  Teen:    [13, 99],
};

function matchesLCAgeGroup(ageRange: string | undefined, ageKey: string): boolean {
  if (!ageRange) return false;
  const bucket = LC_AGE_BUCKET_RANGES[ageKey];
  if (!bucket) return false;
  const [placeMin, placeMax] = parseAgeRange(ageRange);
  return placeMin <= bucket[1] && placeMax >= bucket[0];
}

function buildAreas(schools: Place[], lcs: Place[]): { key: AreaKey; counts: Record<CategoryKey, number> }[] {
  return (["Bintaro", "BSD", "Semua"] as AreaKey[]).map(key => ({
    key,
    counts: {
      sekolah: schools.filter(p => matchesArea(p.area, key)).length,
      kursus:  lcs.filter(p => matchesArea(p.area, key)).length,
    },
  }));
}

function countSchoolByGrade(gradeKey: string, areaKey: AreaKey, schools: Place[]): number {
  return schools.filter(p =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    p.grades?.includes(gradeKey as any) && matchesArea(p.area, areaKey)
  ).length;
}

function countLCByAge(ageKey: string, areaKey: AreaKey, lcs: Place[]): number {
  return lcs.filter(p =>
    matchesLCAgeGroup(p.ageRange, ageKey) && matchesArea(p.area, areaKey)
  ).length;
}

// ─── Chev ─────────────────────────────────────────────────────────────────────
function Chev({
  size = 14,
  color = "#0e1d4f",
  stroke = 2.2,
}: {
  size?: number;
  color?: string;
  stroke?: number;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path d="M9 6l6 6-6 6" stroke={color} strokeWidth={stroke}
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Pressable ────────────────────────────────────────────────────────────────
// iOS-safe button with scale-on-press animation.
function Pressable({
  children,
  onClick,
  style,
  scale = 0.97,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
  scale?: number;
  ariaLabel?: string;
}) {
  const [pressed, setPressed] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={(e) => {
        const t = e.touches[0];
        touchStart.current = { x: t.clientX, y: t.clientY };
        setPressed(true);
      }}
      onTouchEnd={(e) => {
        setPressed(false);
        if (touchStart.current) {
          const t = e.changedTouches[0];
          const dx = Math.abs(t.clientX - touchStart.current.x);
          const dy = Math.abs(t.clientY - touchStart.current.y);
          touchStart.current = null;
          if (dx > 8 || dy > 8) return;
        }
        e.preventDefault();
        onClick?.();
      }}
      style={{
        transform: pressed ? `scale(${scale})` : "scale(1)",
        transition: "transform .14s cubic-bezier(.2,.7,.3,1)",
        cursor: "pointer",
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
        background: "none",
        border: "none",
        padding: 0,
        textAlign: "left",
        display: "block",
        WebkitUserSelect: "none",
        userSelect: "none",
        font: "inherit",
        color: "inherit",
        ...style,
      } as React.CSSProperties}
    >
      {children}
    </button>
  );
}

// ─── Logo ─────────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <div style={{ width: 52, height: 52, flexShrink: 0 }}>
      <img src="/tangsel-kids-logo.png" alt="logo" width={52} height={52}
        style={{ width: 52, height: 52, objectFit: "contain" }} />
    </div>
  );
}

// ─── HeroSearch — typewriter slogan + live search, one combined block ─────────
function HeroSearch() {
  const { lang, t } = useLang();
  const router = useRouter();
  const words  = TYPE_WORDS[lang];

  // ── Typewriter state ──
  const [wordIdx, setWordIdx] = useState(0);
  const [text,    setText]    = useState("");
  const [phase,   setPhase]   = useState<"typing" | "deleting">("typing");
  const [caretOn, setCaretOn] = useState(true);

  useEffect(() => { setText(""); setPhase("typing"); setWordIdx(0); }, [lang]);
  useEffect(() => {
    const id = setInterval(() => setCaretOn((v) => !v), 500);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    const word = words[wordIdx];
    let timer: ReturnType<typeof setTimeout>;
    if (phase === "typing") {
      if (text.length < word.length) {
        timer = setTimeout(() => setText(word.slice(0, text.length + 1)), 70);
      } else {
        timer = setTimeout(() => setPhase("deleting"), 1300);
      }
    } else {
      if (text.length > 0) {
        timer = setTimeout(() => setText(word.slice(0, text.length - 1)), 40);
      } else {
        timer = setTimeout(() => { setWordIdx((i) => (i + 1) % words.length); setPhase("typing"); }, 260);
      }
    }
    return () => clearTimeout(timer);
  }, [text, phase, wordIdx, words]);

  // ── Search state ──
  const [query,    setQuery]    = useState("");
  const [results,  setResults]  = useState<Place[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (!q) { setResults([]); setSearching(false); return; }
    setSearching(true);
    const timer = setTimeout(() => {
      searchAllPlaces(q, 8).then((res) => { setResults(res); setSearching(false); });
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  const showDropdown = query.trim().length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/explore?q=${encodeURIComponent(q)}`);
  }

  return (
    <div style={{
      marginTop: 12,
      background: "#fff7ec",
      borderTop: "1px solid rgba(15,23,42,0.1)",
      borderBottom: "1px solid rgba(15,23,42,0.1)",
      padding: "14px 22px 16px",
    }}>
      {/* Typewriter text */}
      <div style={{
        fontSize: 17, color: "#475569", lineHeight: 1.3,
        fontFamily: "var(--font-fraunces), Georgia, serif", fontWeight: 500,
      }}>
        {t.homeAltTypewriterPre}{" "}
        <span style={{ color: "#0e1d4f", fontWeight: 700, fontStyle: "italic" }}>
          {text}
          <span style={{
            display: "inline-block", width: 2, height: "0.85em",
            background: "var(--tk-accent, #c47a14)",
            marginLeft: 2, verticalAlign: "-2px",
            opacity: caretOn ? 1 : 0,
            transition: "opacity .08s linear",
          }} />
        </span>
        {" "}{t.homeAltTypewriterPost}
      </div>

      {/* Search input */}
      <div style={{ marginTop: 12, position: "relative" }}>
        <form onSubmit={handleSubmit}>
          <div style={{
            position: "absolute", left: 13, top: "50%",
            transform: "translateY(-50%)", pointerEvents: "none",
            display: "flex", alignItems: "center",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="rgba(15,23,42,0.35)" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" />
            </svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={lang === "id" ? "Cari sekolah, kursus, daycare..." : "Search schools, courses, daycare..."}
            style={{
              width: "100%", boxSizing: "border-box",
              padding: "10px 14px 10px 36px",
              borderRadius: showDropdown ? "12px 12px 0 0" : 999,
              border: "1.5px solid rgba(15,23,42,0.14)",
              borderBottom: showDropdown ? "none" : "1.5px solid rgba(15,23,42,0.14)",
              background: "#fff",
              color: "#0e1d4f", fontSize: 13,
              fontFamily: "var(--font-jakarta), sans-serif",
              outline: "none",
              boxShadow: "0 1px 4px rgba(15,23,42,0.06)",
            }}
          />
        </form>

        {/* Results dropdown */}
        {showDropdown && (
          <div style={{
            position: "absolute", left: 0, right: 0, zIndex: 10,
            background: "#fff",
            borderRadius: "0 0 12px 12px",
            border: "1.5px solid rgba(15,23,42,0.14)", borderTop: "none",
            boxShadow: "0 8px 24px rgba(15,23,42,0.12)",
            overflow: "clip",
          }}>
            {searching ? (
              <div style={{ padding: "11px 16px", fontSize: 13, color: "#94a3b8",
                fontFamily: "var(--font-jakarta), sans-serif" }}>
                {lang === "id" ? "Mencari..." : "Searching..."}
              </div>
            ) : results.length === 0 ? (
              <div style={{ padding: "11px 16px", fontSize: 13, color: "#94a3b8",
                fontFamily: "var(--font-jakarta), sans-serif" }}>
                {lang === "id" ? "Tidak ada hasil." : "No results found."}
              </div>
            ) : (
              <>
                {results.slice(0, 5).map((place, i) => (
                  <Link
                    key={place.id}
                    href={`/place/${place.slug ?? place.id}`}
                    onClick={() => setQuery("")}
                    style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "8px 14px",
                      borderBottom: i < Math.min(results.length, 5) - 1
                        ? "1px solid rgba(15,23,42,0.06)" : "none",
                      textDecoration: "none", color: "inherit",
                      touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    <img
                      src={place.photo?.includes("supabase") ? `${place.photo}?width=80&height=80&resize=cover` : place.photo}
                      alt=""
                      width={36}
                      height={36}
                      style={{
                        width: 36, height: 36, borderRadius: 8,
                        objectFit: "cover", flexShrink: 0,
                        background: "#f1f5f9",
                      }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div style={{
                        fontSize: 13, fontWeight: 700, color: "#0e1d4f",
                        fontFamily: "var(--font-jakarta), sans-serif",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {place.name}
                      </div>
                      <div style={{ fontSize: 10.5, color: "#94a3b8",
                        fontFamily: "var(--font-jakarta), sans-serif" }}>
                        {place.area}
                      </div>
                    </div>
                  </Link>
                ))}
                <button
                  onClick={() => { router.push(`/explore?q=${encodeURIComponent(query.trim())}`); setQuery(""); }}
                  onTouchEnd={(e) => { e.preventDefault(); router.push(`/explore?q=${encodeURIComponent(query.trim())}`); setQuery(""); }}
                  style={{
                    width: "100%", padding: "9px 14px",
                    background: "rgba(15,23,42,0.03)",
                    border: "none", borderTop: "1px solid rgba(15,23,42,0.08)",
                    fontSize: 12, fontWeight: 700,
                    color: "var(--tk-accent, #2e8a5a)",
                    fontFamily: "var(--font-jakarta), sans-serif",
                    textAlign: "left", cursor: "pointer",
                    touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                    display: "flex", alignItems: "center", gap: 4,
                  }}
                >
                  {lang === "id" ? "Lihat semua hasil" : "See all results"}
                  <Chev size={12} color="var(--tk-accent, #2e8a5a)" stroke={2.5} />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Ico ──────────────────────────────────────────────────────────────────────
const Ico: Record<string, React.ReactNode> = {
  daycare: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6.5" cy="6.5" r="2"/>
      <circle cx="17.5" cy="6.5" r="2"/>
      <circle cx="12" cy="13" r="6"/>
      <circle cx="9.8" cy="12" r="0.8" fill="currentColor"/>
      <circle cx="14.2" cy="12" r="0.8" fill="currentColor"/>
      <path d="M10.5 15.5c.5.6 2.5.6 3 0"/>
    </svg>
  ),
  playground: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 20V8"/><path d="M5 8l11-3"/>
      <path d="M16 5v8c0 3-2 5-5 5H7"/>
      <path d="M3 20h18"/>
      <path d="M5 11h-2M5 14h-2M5 17h-2"/>
    </svg>
  ),
  clinic: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 4v6a4 4 0 008 0V4"/>
      <path d="M3 4h3M10 4h3"/>
      <path d="M9 14v2a4 4 0 008 0v-2"/>
      <circle cx="17" cy="18" r="2"/>
    </svg>
  ),
  cafe: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 4c-.5 1 .5 1.5 0 2.5M13 4c-.5 1 .5 1.5 0 2.5"/>
      <path d="M5 10h12v5a4 4 0 01-4 4H9a4 4 0 01-4-4v-5z"/>
      <path d="M17 12h2a2 2 0 010 4h-2"/>
    </svg>
  ),
  animals: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="6" cy="9" rx="1.6" ry="2.2"/>
      <ellipse cx="10" cy="6" rx="1.6" ry="2.2"/>
      <ellipse cx="14" cy="6" rx="1.6" ry="2.2"/>
      <ellipse cx="18" cy="9" rx="1.6" ry="2.2"/>
      <path d="M12 11c-3 0-5 2.5-5 5 0 1.5 1 2.5 2.5 2.5 1 0 1.5-.5 2.5-.5s1.5.5 2.5.5c1.5 0 2.5-1 2.5-2.5 0-2.5-2-5-5-5z"/>
    </svg>
  ),
  pool: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 10c2 0 2-1.5 5-1.5s3 1.5 5 1.5 2-1.5 5-1.5 3 1.5 5 1.5"/>
      <path d="M2 15c2 0 2-1.5 5-1.5s3 1.5 5 1.5 2-1.5 5-1.5 3 1.5 5 1.5"/>
      <path d="M2 20c2 0 2-1.5 5-1.5s3 1.5 5 1.5 2-1.5 5-1.5 3 1.5 5 1.5"/>
    </svg>
  ),
  books: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 5h7a2 2 0 012 2v12a1.5 1.5 0 00-1.5-1.5H3V5z"/>
      <path d="M21 5h-7a2 2 0 00-2 2v12a1.5 1.5 0 011.5-1.5H21V5z"/>
    </svg>
  ),
  more: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6"  cy="12" r="1.4" fill="currentColor"/>
      <circle cx="12" cy="12" r="1.4" fill="currentColor"/>
      <circle cx="18" cy="12" r="1.4" fill="currentColor"/>
    </svg>
  ),
};

// ─── StickyHeader ─────────────────────────────────────────────────────────────
function StickyHeader({ visible }: { visible: boolean }) {
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 40,
      transform: visible ? "translateY(0)" : "translateY(-100%)",
      opacity: visible ? 1 : 0,
      transition: "transform .3s ease, opacity .25s ease",
      background: "rgba(246,241,232,0.92)",
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      borderBottom: "2px solid #2e8a5a",
      padding: "12px 22px 10px",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <img src="/tangsel-kids-logo.png" alt="logo" width={32} height={32}
          style={{ width: 32, height: 32, objectFit: "contain", flexShrink: 0 }} />
        <div style={{
          fontFamily: "var(--font-logo), Georgia, serif",
          fontWeight: 800, fontSize: 22, letterSpacing: -1, color: "#0e1d4f", lineHeight: 1,
        }}>
          Tangsel<span style={{ color: "var(--tk-accent, #c47a14)" }}>.</span>
          <span style={{ fontStyle: "italic", fontSize: 18, fontWeight: 500, opacity: 0.7, marginLeft: 4 }}>
            Kids
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Masthead ─────────────────────────────────────────────────────────────────
function Masthead({ userInitial }: { userInitial: string }) {
  const { lang, t } = useLang();
  const { tier, user } = useAuth();
  const { openLoginSheet } = useLoginSheet();
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  useEffect(() => {
    setProfilePhoto(localStorage.getItem("profilePhoto"));
  }, [user]);
  return (
    <>
      <div style={{ padding: "20px 22px 0" }}>
        {/* top row — single compact line */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Logo icon */}
          <Logo />

          {/* Two-line wordmark */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: "var(--font-logo), Georgia, serif",
              fontWeight: 700, fontSize: 38, letterSpacing: -1.4,
              lineHeight: 0.95, color: "#0e1d4f",
            }}>
              Tangsel<span style={{ color: "var(--tk-accent, #c47a14)" }}>.</span>
            </div>
            <div style={{
              fontFamily: "var(--font-logo), Georgia, serif",
              fontStyle: "italic", fontWeight: 500, fontSize: 24,
              color: "#0e1d4f", opacity: 0.7, marginTop: -8, letterSpacing: 4,
            }}>
              Kids
            </div>
          </div>

          {/* Right: lang toggle on top, Masuk below (or badge for premium) */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
            {!user ? (
              <>
                <LangToggle variant="dark" />
                <ActionButton
                  onClick={() => openLoginSheet()}
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    fontFamily: "var(--font-jakarta), sans-serif",
                    fontSize: 12, fontWeight: 700, color: "#0e1d4f",
                  }}
                >
                  {t.loginSignIn}
                  <svg width="16" height="9" viewBox="0 0 22 10" fill="none" style={{ flexShrink: 0 }}>
                    <path d="M0 5H16M16 5L11 1M16 5L11 9"
                      stroke="#0e1d4f" strokeWidth="1.8"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </ActionButton>
              </>
            ) : tier === "premium" ? (
              /* Premium — lang toggle on top, badge below */
              <>
                <LangToggle variant="dark" />
                <PremiumBadge />
              </>
            ) : (
              /* Logged in, free — lang toggle on top, avatar below */
              <>
                <LangToggle variant="dark" />
                <Link href="/profile" style={{
                  width: 26, height: 26, borderRadius: 999,
                  background: profilePhoto ? "transparent" : "#0e1d4f",
                  color: "#fff", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 11, fontWeight: 700,
                  textDecoration: "none",
                  fontFamily: "var(--font-jakarta), sans-serif",
                  touchAction: "manipulation", flexShrink: 0, overflow: "hidden",
                }}>
                  {profilePhoto
                    ? <img src={profilePhoto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : userInitial}
                </Link>
              </>
            )}
          </div>
        </div>

        {/* tagline */}
        <div style={{ marginTop: 8, fontSize: 12.5, lineHeight: 1.45, color: "#475569", maxWidth: 320 }}>
          {t.homeAltTagline}{" "}
          <b style={{ color: "var(--tk-accent, #c47a14)", fontWeight: 700 }}>Bintaro</b>
          {" "}{lang === "id" ? "dan" : "&"}{" "}
          <b style={{ color: "var(--tk-accent, #c47a14)", fontWeight: 700 }}>BSD</b>
          <span style={{ display: "inline-flex", verticalAlign: "middle", marginLeft: 5 }}>
            <AreaCoverageButton />
          </span>
        </div>

      </div>

      {/* full-bleed hero band — typewriter slogan + search, outside the padded div */}
      <HeroSearch />
    </>
  );
}

// ─── FeatureSquare ────────────────────────────────────────────────────────────
function FeatureSquare({
  title, count, sub, photo, tone, accent, expanded, onToggle, animDelay = "0s",
}: {
  title: string; count: number; sub: string;
  photo: string; tone: string; accent: string;
  expanded: boolean; onToggle: () => void;
  animDelay?: string;
}) {
  const { t } = useLang();
  useEffect(() => {
    const id = "chev-nudge-keyframe";
    let style = document.getElementById(id) as HTMLStyleElement | null;
    if (!style) { style = document.createElement("style"); style.id = id; document.head.appendChild(style); }
    style.textContent = "@keyframes chevNudge{0%,100%{transform:translateX(0)}8%{transform:translateX(4px)}16%{transform:translateX(0)}24%{transform:translateX(4px)}32%{transform:translateX(0)}40%{transform:translateX(4px)}48%{transform:translateX(0)}}";
    // Restart animation now that the keyframe exists
    document.querySelectorAll<HTMLSpanElement>("[data-chev]").forEach(el => {
      const delay = el.dataset.chev ?? "0s";
      el.style.animation = "none";
      el.getBoundingClientRect();
      el.style.animation = `chevNudge 3s ease-in-out ${delay} infinite`;
    });
  }, []);
  return (
    <Pressable onClick={onToggle} scale={0.97} style={{
      aspectRatio: "1/1.1", borderRadius: 6, position: "relative",
      overflow: "clip",   /* clip not hidden — iOS touch-safe */
      border: expanded ? `1.5px solid ${accent}` : "1px solid rgba(15,23,42,0.18)",
      boxShadow: expanded
        ? `0 14px 30px ${accent}55`
        : "0 12px 28px rgba(15,23,42,0.12)",
      transition: "border-color .25s ease, box-shadow .25s ease",
      width: "100%",
    }}>
      {/* photo */}
      <img src={photo} alt={title} style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        objectFit: "cover",
        transition: "transform .6s cubic-bezier(.2,.7,.3,1)",
        transform: expanded ? "scale(1.08)" : "scale(1)",
      }} />
      {/* tone overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: tone, mixBlendMode: "multiply",
      }} />
      {/* bottom darken */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.55) 100%)",
      }} />
      {/* content layer — anchored to bottom */}
      <div style={{
        position: "absolute", inset: 0,
        padding: "14px 14px 16px", boxSizing: "border-box",
        color: "#fff",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
      }}>
        {/* top-left subhead */}
        <div style={{
          fontSize: 11, fontWeight: 800, letterSpacing: 1.2,
          color: "rgba(255,255,255,0.8)", textTransform: "uppercase",
          alignSelf: "flex-start",
        }}>
          {t.homeAltFeatureKicker}
        </div>
        {/* bottom content */}
        <div>
        <div style={{
          fontFamily: "var(--font-fraunces), Georgia, serif",
          fontWeight: 700, fontSize: 28, letterSpacing: -0.5, lineHeight: 1,
        }}>{title}</div>
        <div style={{
          fontSize: 10.5, opacity: 0.92, marginTop: 6, lineHeight: 1.35,
          maxHeight: expanded ? 60 : 28, overflow: "hidden",
          transition: "max-height .35s ease",
        }}>{sub}</div>
        <div style={{
          marginTop: 8, display: "flex", alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.28)",
        }}>
          <span style={{
            fontFamily: "var(--font-fraunces), Georgia, serif",
            fontSize: 20, fontWeight: 700, color: accent,
          }}>
            {count}
            <span style={{ fontSize: 10.5, opacity: 0.95, fontWeight: 700, marginLeft: 4 }}>
              {t.homeAltTempatUnit}
            </span>
          </span>
          <span data-chev={animDelay} style={{
            width: 26, height: 26, borderRadius: 999, background: "#fff7ec",
            display: "flex", alignItems: "center", justifyContent: "center",
            transform: expanded ? "rotate(90deg)" : "rotate(0)",
            transition: "transform .3s ease",
            animation: expanded ? "none" : `chevNudge 3s ease-in-out ${animDelay} infinite`,
          }}>
            <Chev size={13} color="#0e1d4f" stroke={2.2} />
          </span>
        </div>
        </div>
      </div>
    </Pressable>
  );
}

// ─── AreaPills ────────────────────────────────────────────────────────────────
function AreaPills({
  category, value, onPick, areas,
}: {
  category: CategoryKey;
  value: AreaKey | null;
  onPick: (k: AreaKey) => void;
  areas: { key: AreaKey; counts: Record<CategoryKey, number> }[];
}) {
  const { t } = useLang();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flexShrink: 0 }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 0.5, color: "#94a3b8", lineHeight: 1.35 }}>
          {t.homeAltAreaWhere}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flex: 1 }}>
        {areas.map((a) => {
          const active = value === a.key;
          const displayLabel = a.key === "Semua" ? t.homeAltAreaAll : a.key;
          return (
            <Pressable
              key={a.key}
              scale={0.94}
              onClick={() => onPick(a.key)}
              style={{
                flex: 1,
                padding: "7px 12px",
                borderRadius: 999,
                border: active
                  ? "1px solid #0e1d4f"
                  : "1px solid rgba(15,23,42,0.14)",
                background: active ? "#0e1d4f" : "#fff",
                display: "flex", alignItems: "center",
                justifyContent: "center", gap: 5,
                transition: "background .2s ease, border-color .2s ease",
              }}
            >
              <span style={{
                fontFamily: "var(--font-fraunces), Georgia, serif",
                fontSize: 14, fontWeight: 700, letterSpacing: -0.2,
                color: active ? "#fff" : "#0e1d4f",
                whiteSpace: "nowrap",
              }}>
                {displayLabel}
              </span>
              <span style={{
                fontSize: 10, fontWeight: 700,
                color: active ? "rgba(255,255,255,0.8)" : "#94a3b8",
                fontVariantNumeric: "tabular-nums",
              }}>
                {a.counts[category]}
              </span>
            </Pressable>
          );
        })}
      </div>
    </div>
  );
}

// ─── RailArrow ────────────────────────────────────────────────────────────────
function RailArrow({
  side, show, onClick,
}: {
  side: "left" | "right";
  show: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onTouchEnd={(e) => { e.preventDefault(); onClick(); }}
      style={{
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        ...(side === "left" ? { left: 6 } : { right: 6 }),
        width: 28, height: 28, borderRadius: 999,
        background: "#fff",
        border: "1px solid rgba(15,23,42,0.14)",
        boxShadow: "0 4px 12px rgba(15,23,42,0.12)",
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: show ? 1 : 0,
        pointerEvents: show ? "auto" : "none",
        transition: "opacity .2s ease",
        cursor: "pointer",
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
        padding: 0,
        marginTop: -4,
      } as React.CSSProperties}
    >
      <span style={{ display: "flex", transform: side === "left" ? "rotate(180deg)" : "none" }}>
        <span className="rail-arrow-icon">
          <Chev size={13} color="#0e1d4f" stroke={2.2} />
        </span>
      </span>
    </button>
  );
}

// ─── BAHASA list — values must match what's stored in kategori_bahasa column ──
const BAHASA_LIST = [
  "Indonesia",
  "Inggris",
  "Arab",
  "Mandarin",
  "Jerman",
  "Jepang",
];

// Display labels per UI language — short & readable on pills
const BAHASA_PILL_LABELS: Record<"id" | "en", Record<string, string>> = {
  id: {
    "Indonesia": "Indonesia",
    "Inggris":   "Inggris",
    "Arab":      "Arab",
    "Mandarin":  "Mandarin",
    "Jerman":    "Jerman",
    "Jepang":    "Jepang",
  },
  en: {
    "Indonesia": "Indonesian",
    "Inggris":   "English",
    "Arab":      "Arabic",
    "Mandarin":  "Mandarin",
    "Jerman":    "German",
    "Jepang":    "Japanese",
  },
};

// ─── CourseTypePills ──────────────────────────────────────────────────────────
function CourseTypePills({
  ageKey, area, lcs,
}: {
  ageKey: string;
  area: AreaKey;
  lcs: Place[];
}) {
  const { lang, t } = useLang();
  const areaParam = area === "Semua" ? "all" : area.toLowerCase();
  const railRef = useRef<HTMLDivElement>(null);
  const [canL, setCanL] = useState(false);
  const [canR, setCanR] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string | null | "ALL">(null);

  const updateArrows = () => {
    const el = railRef.current;
    if (!el) return;
    setCanL(el.scrollLeft > 4);
    setCanR(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    const id = requestAnimationFrame(updateArrows);
    return () => cancelAnimationFrame(id);
  }, [ageKey, area]);

  useEffect(() => {
    if (!selectedCourse || !railRef.current) return;
    const selected = railRef.current.querySelector<HTMLElement>("[data-course-selected='true']");
    if (selected) {
      const railRect = railRef.current.getBoundingClientRect();
      const elRect = selected.getBoundingClientRect();
      if (elRect.right > railRect.right || elRect.left < railRect.left) {
        selected.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
      }
    }
  }, [selectedCourse]);

  const nudge = (dir: number) => {
    railRef.current?.scrollBy({ left: dir * 140, behavior: "smooth" });
  };

  const courseTypes: { value: string; label: string }[] = [
    { value: "Bahasa Inggris",  label: t.courseTypeEnglish },
    { value: "Matematika",      label: t.courseTypeMath },
    { value: "Seni Rupa",       label: t.courseTypeArts },
    { value: "Musik & Vokal",   label: t.courseTypeMusic },
    { value: "Coding / Robotik", label: t.courseTypeCoding },
    { value: "Tari & Balet",    label: t.courseTypeDance },
    { value: "Gimnastik",       label: t.courseTypeGymnastics },
  ];

  function countByCourse(course: string | null): number {
    return lcs.filter(p =>
      matchesLCAgeGroup(p.ageRange, ageKey) &&
      matchesArea(p.area, area) &&
      (course === null || p.courseTypes?.includes(course))
    ).length;
  }

  const lcAgeBucketKey: Record<string, string> = { Toddler: "0-3", Kids: "4-8", Tween: "9-12", Teen: "13+" };
  const ageBucket = lcAgeBucketKey[ageKey] ?? ageKey;

  function goResults(course: string | null) {
    const q = course ? `&course=${encodeURIComponent(course)}` : "";
    window.location.href = `/learning-centers?age=${ageBucket}&area=${areaParam}${q}&view=results`;
  }

  function goFilter(course: string | null) {
    const q = course ? `&course=${encodeURIComponent(course)}` : "";
    window.location.href = `/learning-centers?age=${ageBucket}&area=${areaParam}${q}`;
  }

  const pillStyle: React.CSSProperties = {
    flexShrink: 0,
    padding: "7px 12px",
    borderRadius: 999,
    border: "1px solid rgba(15,23,42,0.14)",
    background: "#fff",
    display: "flex", alignItems: "center", gap: 5, justifyContent: "center",
  };
  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-fraunces), Georgia, serif",
    fontSize: 13, fontWeight: 700, letterSpacing: -0.2, color: "#0e1d4f",
    whiteSpace: "nowrap",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* Label + scrollable rail row */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flexShrink: 0, fontSize: 9, fontWeight: 800, letterSpacing: 0.5, color: "#94a3b8", lineHeight: 1.35, whiteSpace: "pre-line" }}>
          {t.filterCourseType.toUpperCase().replace(" ", "\n")}
        </div>
        <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
          <div
            ref={railRef}
            onScroll={updateArrows}
            className="tk-age-rail"
            style={{
              display: "flex", gap: 8,
              overflowX: "auto", overflowY: "hidden",
              paddingTop: 0, paddingBottom: 0,
              paddingLeft: 0, paddingRight: 22,
              scrollbarWidth: "none",
              margin: "0 -22px 0 0",
            } as React.CSSProperties}
          >
            <Pressable scale={0.94} onClick={() => setSelectedCourse("ALL")}
              data-course-selected={selectedCourse === "ALL" ? "true" : undefined}
              style={{
                ...pillStyle,
                border: selectedCourse === "ALL" ? "1px solid #0e1d4f" : pillStyle.border,
                background: selectedCourse === "ALL" ? "#0e1d4f" : pillStyle.background,
              }}>
              <span style={{ ...labelStyle, color: selectedCourse === "ALL" ? "#fff" : labelStyle.color }}>{t.homeAltCourseTypeAll}</span>
            </Pressable>
            {courseTypes.map(({ value, label }) => (
              <Pressable key={value} scale={0.94} onClick={() => setSelectedCourse(value)}
                data-course-selected={selectedCourse === value ? "true" : undefined}
                style={{
                  ...pillStyle,
                  border: selectedCourse === value ? "1px solid #0e1d4f" : pillStyle.border,
                  background: selectedCourse === value ? "#0e1d4f" : pillStyle.background,
                }}>
                <span style={{ ...labelStyle, color: selectedCourse === value ? "#fff" : labelStyle.color }}>{label}</span>
              </Pressable>
            ))}
          </div>
          <div style={{
            position: "absolute", top: 0, bottom: 0, right: -22, width: 28,
            background: "linear-gradient(270deg, #f6f1e8, rgba(246,241,232,0))",
            opacity: canR ? 1 : 0, transition: "opacity .2s", pointerEvents: "none",
          }} />
          <RailArrow side="left"  show={canL} onClick={() => nudge(-1)} />
          <RailArrow side="right" show={canR} onClick={() => nudge(1)}  />
        </div>
      </div>

      {/* CTA row — slides in below after a course type is tapped */}
      <div style={{
        marginTop: selectedCourse ? 8 : 0,
        maxHeight: selectedCourse ? 60 : 0,
        opacity: selectedCourse ? 1 : 0,
        overflow: "clip",
        transition: "max-height .35s ease, opacity .25s ease, margin-top .25s ease",
      }}>
        {selectedCourse && (() => {
          const course = selectedCourse === "ALL" ? null : selectedCourse;
          const n = countByCourse(course);
          return (
            <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 2 }}>
              <button
                onClick={() => goFilter(course)}
                onTouchEnd={(e) => { e.preventDefault(); goFilter(course); }}
                style={{
                  background: "none", border: "none", padding: 0,
                  fontSize: 12, fontWeight: 600, color: "#64748b",
                  textDecoration: "underline", textDecorationStyle: "dotted",
                  textUnderlineOffset: 3, cursor: "pointer",
                  whiteSpace: "nowrap", flexShrink: 0,
                  touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                }}
              >
                {lang === "id" ? "Filter lebih dalam?" : "More filters?"}
              </button>
              <button
                onClick={() => goResults(course)}
                onTouchEnd={(e) => { e.preventDefault(); goResults(course); }}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: 999,
                  background: "#2e8a5a",
                  border: "none",
                  color: "#fff",
                  fontFamily: "var(--font-fraunces), Georgia, serif",
                  fontSize: 14, fontWeight: 700, letterSpacing: -0.2,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                  transition: "background .15s ease",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}
              >
                {lang === "id" ? `Tampilkan ${n} Tempat` : `Show ${n} Places`}
                <span className="rail-arrow-icon" style={{ display: "flex", alignItems: "center" }}>
                  <svg width="16" height="10" viewBox="0 0 16 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <line x1="0" y1="5" x2="13" y2="5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                    <path d="M9 1L13.5 5L9 9" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                </span>
              </button>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// ─── LangPills ────────────────────────────────────────────────────────────────
function LangPills({
  grade, area, schools,
}: {
  grade: string;
  area: AreaKey;
  schools: Place[];
}) {
  const { lang, t } = useLang();
  const areaParam = area === "Semua" ? "all" : area.toLowerCase();
  const labelMap = BAHASA_PILL_LABELS[lang];
  const [selectedLang, setSelectedLang] = useState<string | null | "ALL">(null);
  const railRef = useRef<HTMLDivElement>(null);
  const [canL, setCanL] = useState(false);
  const [canR, setCanR] = useState(true);

  const updateArrows = () => {
    const el = railRef.current;
    if (!el) return;
    setCanL(el.scrollLeft > 4);
    setCanR(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    const id = requestAnimationFrame(updateArrows);
    return () => cancelAnimationFrame(id);
  }, [grade, area]);

  // Scroll selected pill into view when language changes
  useEffect(() => {
    if (!selectedLang || !railRef.current) return;
    const rail = railRef.current;
    const selected = rail.querySelector<HTMLElement>("[data-lang-selected='true']");
    if (selected) {
      const railRect = rail.getBoundingClientRect();
      const elRect = selected.getBoundingClientRect();
      if (elRect.right > railRect.right || elRect.left < railRect.left) {
        selected.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
      }
    }
  }, [selectedLang]);

  const nudge = (dir: number) => {
    railRef.current?.scrollBy({ left: dir * 140, behavior: "smooth" });
  };

  function countByLang(bhs: string | null): number {
    return schools.filter(p =>
      p.jenjang === grade &&
      (area === "Semua" || p.area === area) &&
      (bhs === null || p.bahasa?.includes(bhs))
    ).length;
  }

  function goResults(bhs: string | null) {
    const q = bhs ? `&bhs=${encodeURIComponent(bhs)}` : "";
    window.location.href = `/schools?grade=${grade}&area=${areaParam}${q}&view=results`;
  }

  function goFilter(bhs: string | null) {
    const q = bhs ? `&bhs=${encodeURIComponent(bhs)}` : "";
    window.location.href = `/schools?grade=${grade}&area=${areaParam}${q}`;
  }

  const bahasaIcons: Record<string, { code: string; color: string }> = {
    "Indonesia": { code: "ID", color: "#ef4444" },
    "Inggris":   { code: "EN", color: "#3b82f6" },
    "Arab":      { code: "AR", color: "#10b981" },
    "Mandarin":  { code: "CN", color: "#f97316" },
    "Jerman":    { code: "DE", color: "#64748b" },
    "Jepang":    { code: "JP", color: "#f43f5e" },
  };

  const pillStyle: React.CSSProperties = {
    flexShrink: 0,
    padding: "7px 12px",
    borderRadius: 999,
    border: "1px solid rgba(15,23,42,0.14)",
    background: "#fff",
    display: "flex", alignItems: "center", gap: 5, justifyContent: "center",
  };
  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-fraunces), Georgia, serif",
    fontSize: 13, fontWeight: 700, letterSpacing: -0.2, color: "#0e1d4f",
    whiteSpace: "nowrap",
  };

  function LangBadge({ langKey }: { langKey: string }) {
    const info = bahasaIcons[langKey];
    if (!info) return null;
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        padding: "0 5px", height: 18, borderRadius: 5,
        background: info.color, color: "#fff",
        fontSize: 9, fontWeight: 800, letterSpacing: 0.4,
        fontFamily: "var(--font-jakarta), sans-serif",
        flexShrink: 0, lineHeight: 1,
      }}>
        {info.code}
      </span>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* Label + scrollable rail row */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flexShrink: 0, fontSize: 9, fontWeight: 800, letterSpacing: 0.5, color: "#94a3b8", lineHeight: 1.35, whiteSpace: "pre-line" }}>
          {t.homeAltSchoolLang.replace(" ", "\n")}
        </div>
        <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
          {/* Scrollable rail */}
          <div
            ref={railRef}
            onScroll={updateArrows}
            className="tk-age-rail"
            style={{
              display: "flex", gap: 8,
              overflowX: "auto", overflowY: "hidden",
              paddingTop: 0, paddingBottom: 0,
              paddingLeft: 0, paddingRight: 22,
              scrollbarWidth: "none",
              margin: "0 -22px 0 0",
            } as React.CSSProperties}
          >
            <Pressable scale={0.94} onClick={() => setSelectedLang("ALL")}
              data-lang-selected={selectedLang === "ALL" ? "true" : undefined}
              style={{
                ...pillStyle,
                border: selectedLang === "ALL" ? "1px solid #0e1d4f" : pillStyle.border,
                background: selectedLang === "ALL" ? "#0e1d4f" : pillStyle.background,
              }}>
              <span style={{ ...labelStyle, color: selectedLang === "ALL" ? "#fff" : labelStyle.color }}>{t.homeAltSchoolLangAll}</span>
            </Pressable>
            {BAHASA_LIST.map((key) => (
              <Pressable key={key} scale={0.94} onClick={() => setSelectedLang(key)}
                data-lang-selected={selectedLang === key ? "true" : undefined}
                style={{
                  ...pillStyle,
                  border: selectedLang === key ? "1px solid #0e1d4f" : pillStyle.border,
                  background: selectedLang === key ? "#0e1d4f" : pillStyle.background,
                }}>
                <span style={{ ...labelStyle, color: selectedLang === key ? "#fff" : labelStyle.color }}>{labelMap[key] ?? key}</span>
              </Pressable>
            ))}
          </div>
          {/* Edge fades */}
          <div style={{
            position: "absolute", top: 0, bottom: 0, right: -22, width: 28,
            background: "linear-gradient(270deg, #f6f1e8, rgba(246,241,232,0))",
            opacity: canR ? 1 : 0, transition: "opacity .2s", pointerEvents: "none",
          }} />
          <RailArrow side="left"  show={canL} onClick={() => nudge(-1)} />
          <RailArrow side="right" show={canR} onClick={() => nudge(1)}  />
        </div>
      </div>

      {/* CTA row — slides in below the full band after a language pill is tapped */}
      <div style={{
        marginTop: selectedLang ? 8 : 0,
        maxHeight: selectedLang ? 60 : 0,
        opacity: selectedLang ? 1 : 0,
        overflow: "clip",
        transition: "max-height .35s ease, opacity .25s ease, margin-top .25s ease",
      }}>
        {selectedLang && (() => {
          const bhs = selectedLang === "ALL" ? null : selectedLang;
          const n = countByLang(bhs);
          return (
            <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 2 }}>
              <button
                onClick={() => goFilter(bhs)}
                onTouchEnd={(e) => { e.preventDefault(); goFilter(bhs); }}
                style={{
                  background: "none", border: "none", padding: 0,
                  fontSize: 12, fontWeight: 600, color: "#64748b",
                  textDecoration: "underline", textDecorationStyle: "dotted",
                  textUnderlineOffset: 3, cursor: "pointer",
                  whiteSpace: "nowrap", flexShrink: 0,
                  touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                }}
              >
                {lang === "id" ? "Filter lebih dalam?" : "More filters?"}
              </button>
              <button
                onClick={() => goResults(bhs)}
                onTouchEnd={(e) => { e.preventDefault(); goResults(bhs); }}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: 999,
                  background: "#2e8a5a",
                  border: "none",
                  color: "#fff",
                  fontFamily: "var(--font-fraunces), Georgia, serif",
                  fontSize: 14, fontWeight: 700, letterSpacing: -0.2,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                  transition: "background .15s ease",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}
              >
                {lang === "id" ? `Tampilkan ${n} Sekolah` : `Show ${n} Schools`}
                <span className="rail-arrow-icon" style={{ display: "flex", alignItems: "center" }}>
                  <svg width="16" height="10" viewBox="0 0 16 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <line x1="0" y1="5" x2="13" y2="5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                    <path d="M9 1L13.5 5L9 9" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                </span>
              </button>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// ─── AgeBands ─────────────────────────────────────────────────────────────────
function AgeBands({
  category, area, onPick, selected, schools, lcs,
}: {
  category: CategoryKey;
  area: AreaKey;
  onPick?: (key: string) => void;
  selected?: string | null;
  schools: Place[];
  lcs: Place[];
}) {
  const { lang, t } = useLang();
  const railRef = useRef<HTMLDivElement>(null);
  const [canL, setCanL] = useState(false);
  const [canR, setCanR] = useState(true);

  const updateArrows = () => {
    const el = railRef.current;
    if (!el) return;
    setCanL(el.scrollLeft > 4);
    setCanR(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    const id = requestAnimationFrame(updateArrows);
    return () => cancelAnimationFrame(id);
  }, [category, area]);

  const nudge = (dir: number) => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 140, behavior: "smooth" });
  };

  const isSchool  = category === "sekolah";
  const eyebrow   = isSchool ? t.homeAltSchoolLevel : t.homeAltAgeQuestion;

  // Both schools and LC now use real counts from mockData — no multiplier.
  const schoolBands = SCHOOL_LEVELS_DATA[lang];
  const lcBands     = LC_AGE_BANDS[lang];

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flexShrink: 0, fontSize: 9, fontWeight: 800, letterSpacing: 0.5, color: "#94a3b8", lineHeight: 1.35, whiteSpace: "pre-line" }}>
        {eyebrow.replace(" ", "\n")}
      </div>
      <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
        {/* scrollable rail */}
        <div
          ref={railRef}
          onScroll={updateArrows}
          className="tk-age-rail"
          style={{
            display: "flex", gap: 10,
            overflowX: "auto", overflowY: "hidden",
            padding: "4px 2px 2px",
            scrollbarWidth: "none",
            margin: "0 -22px 0 0",
            paddingLeft: 0, paddingRight: 22,
          } as React.CSSProperties}
        >
          {isSchool
            ? schoolBands.map((b) => {
                const n = countSchoolByGrade(b.key, area, schools);
                const active = selected === b.key;
                const inner = (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: 999, background: b.dot,
                        boxShadow: `0 0 0 2px ${b.dot}${active ? "55" : "22"}`, flexShrink: 0,
                      }} />
                      <span style={{
                        fontFamily: "var(--font-fraunces), Georgia, serif",
                        fontSize: 14, fontWeight: 700,
                        color: active ? "#fff" : "#0e1d4f",
                        letterSpacing: -0.2, whiteSpace: "nowrap",
                      }}>
                        {b.label}
                      </span>
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 500, whiteSpace: "nowrap",
                      color: active ? "rgba(255,255,255,0.65)" : "#94a3b8" }}>
                      {b.sub} · <b style={{ color: active ? "rgba(255,255,255,0.9)" : "#475569", fontWeight: 700 }}>{n}</b>
                    </div>
                  </>
                );
                const cardStyle: React.CSSProperties = {
                  flexShrink: 0, display: "flex", flexDirection: "column", gap: 3,
                  padding: "7px 12px", borderRadius: 10, minWidth: 80,
                  border: active ? "1px solid #0e1d4f" : "1px solid rgba(15,23,42,0.14)",
                  background: active ? "#0e1d4f" : "#fff",
                  transition: "background .2s ease, border-color .2s ease",
                };
                return onPick ? (
                  <Pressable
                    key={b.key}
                    scale={0.95}
                    onClick={() => onPick(b.key)}
                    style={cardStyle}
                  >
                    {inner}
                  </Pressable>
                ) : (
                  <Link
                    key={b.key}
                    href={`/schools?grade=${b.key}&area=${area === "Semua" ? "all" : area.toLowerCase()}&view=results`}
                    style={{
                      ...cardStyle,
                      textDecoration: "none", color: "inherit",
                      touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    {inner}
                  </Link>
                );
              })
            : lcBands.map((b) => {
                const n = countLCByAge(b.key, area, lcs);
                const active = selected === b.key;
                const inner = (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: 999, background: b.dot,
                        boxShadow: `0 0 0 2px ${b.dot}${active ? "55" : "22"}`, flexShrink: 0,
                      }} />
                      <span style={{
                        fontFamily: "var(--font-fraunces), Georgia, serif",
                        fontSize: 14, fontWeight: 700,
                        color: active ? "#fff" : "#0e1d4f",
                        letterSpacing: -0.2, whiteSpace: "nowrap",
                      }}>
                        {b.sub}
                      </span>
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 500, whiteSpace: "nowrap",
                      color: active ? "rgba(255,255,255,0.65)" : "#94a3b8" }}>
                      {b.label} · <b style={{ color: active ? "rgba(255,255,255,0.9)" : "#475569", fontWeight: 700 }}>{n}</b>
                    </div>
                  </>
                );
                const cardStyle: React.CSSProperties = {
                  flexShrink: 0, display: "flex", flexDirection: "column", gap: 3,
                  padding: "7px 12px", borderRadius: 10, minWidth: 80,
                  border: active ? "1px solid #0e1d4f" : "1px solid rgba(15,23,42,0.14)",
                  background: active ? "#0e1d4f" : "#fff",
                  transition: "background .2s ease, border-color .2s ease",
                };
                const lcAgeBucketKey: Record<string, string> = { Toddler: "0-3", Kids: "4-8", Tween: "9-12", Teen: "13+" };
                return onPick ? (
                  <Pressable
                    key={b.key}
                    scale={0.95}
                    onClick={() => onPick(b.key)}
                    style={cardStyle}
                  >
                    {inner}
                  </Pressable>
                ) : (
                  <Link
                    key={b.key}
                    href={`/learning-centers?age=${lcAgeBucketKey[b.key] ?? b.key}&area=${area === "Semua" ? "all" : area.toLowerCase()}&view=results`}
                    style={{
                      ...cardStyle,
                      textDecoration: "none", color: "inherit",
                      touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    {inner}
                  </Link>
                );
              })
          }
        </div>

        {/* edge fade — right */}
        <div style={{
          position: "absolute", top: 0, bottom: 0, right: -22, width: 28,
          background: "linear-gradient(270deg, #f6f1e8, rgba(246,241,232,0))",
          opacity: canR ? 1 : 0, transition: "opacity .2s", pointerEvents: "none",
        }} />

        <RailArrow side="left"  show={canL} onClick={() => nudge(-1)} />
        <RailArrow side="right" show={canR} onClick={() => nudge(1)}  />
      </div>
    </div>
  );
}

// ─── FeaturePair ──────────────────────────────────────────────────────────────
function FeaturePair() {
  const { lang, t } = useLang();
  const [open, setOpen] = useState<CategoryKey | null>(null);
  const [area, setArea] = useState<AreaKey | null>(null);
  const [grade, setGrade] = useState<string | null>(null);

  const [allSchools,   setAllSchools]   = useState<Place[]>([]);
  const [allLCs,       setAllLCs]       = useState<Place[]>([]);
  const [schoolCount,  setSchoolCount]  = useState<number>(() => getCachedCategory("school").length  || 0);
  const [lcCount,      setLcCount]      = useState<number>(() => getCachedCategory("learning-center").length || 0);

  // Fast count: two HEAD requests (~100ms) so cards show real numbers immediately.
  useEffect(() => {
    if (schoolCount > 0 && lcCount > 0) return; // already know from cache
    fetchPrimaryCountsFast().then(({ school, learningCenter }) => {
      setSchoolCount(school);
      setLcCount(learningCenter);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Full data: needed for filter pill counts. Hydrate from window cache first,
  // then refetch fresh. Re-runs on back-navigation / tab refocus.
  useEffect(() => {
    const load = () => {
      const sc = getCachedCategory("school");
      const lc = getCachedCategory("learning-center");
      if (sc.length) { setAllSchools(sc); setSchoolCount(sc.length); }
      if (lc.length) { setAllLCs(lc);     setLcCount(lc.length); }
      fetchPlacesByCategory("school").then(d => { setAllSchools(d); setSchoolCount(d.length); });
      fetchPlacesByCategory("learning-center").then(d => { setAllLCs(d); setLcCount(d.length); });
    };
    load();
    const onVisible = () => { if (document.visibilityState === "visible") load(); };
    window.addEventListener("popstate", load);
    window.addEventListener("pageshow", load);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("popstate", load);
      window.removeEventListener("pageshow", load);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const tier2Ref = useRef<HTMLDivElement>(null);
  const tier3Ref = useRef<HTMLDivElement>(null);

  // Scroll newly revealed tiers above the bottom nav (≈80px)
  function scrollIntoViewAboveNav(ref: React.RefObject<HTMLDivElement | null>) {
    setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const bottomNavH = 84;
      const gap = 12;
      const overflow = rect.bottom - (window.innerHeight - bottomNavH - gap);
      if (overflow > 0) window.scrollBy({ top: overflow, behavior: "smooth" });
    }, 420); // after CSS slide-down animation
  }

  useEffect(() => {
    if (area) scrollIntoViewAboveNav(tier2Ref);
  }, [area]);

  useEffect(() => {
    if (grade) scrollIntoViewAboveNav(tier3Ref);
  }, [grade]);

  const toggleCard = (k: CategoryKey) => {
    if (open === k) {
      setOpen(null);
      setArea(null);
      setGrade(null);
    } else {
      setOpen(k);
      setArea(null);
      setGrade(null);
    }
  };

  const schoolTotal = schoolCount || allSchools.length;
  const lcTotal     = lcCount     || allLCs.length;
  const areas       = buildAreas(allSchools, allLCs);

  return (
    <div style={{ padding: "18px 22px 0" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 0 }}>
        {/* Sekolah column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <FeatureSquare
            title={t.catSchool}
            count={schoolTotal}
            sub={t.homeAltSchoolSub}
            photo={P.sekolah}
            tone="linear-gradient(165deg,rgba(58,100,238,0.85) 0%,rgba(30,63,176,0.92) 100%)"
            accent="#f6b545"
            expanded={open === "sekolah"}
            onToggle={() => toggleCard("sekolah")}
          />
          <Link href="/schools?view=results" style={{
            fontSize: 13, fontWeight: 700,
            color: "var(--tk-accent, #2e8a5a)",
            textDecoration: "none",
            display: open ? "none" : "flex",
            alignItems: "center", justifyContent: "center", gap: 3,
            fontFamily: "var(--font-jakarta), sans-serif",
            padding: "3px 0",
          }}>
            {lang === "id" ? "Lihat Semua Sekolah" : "See All Schools"}
            <Chev size={11} color="var(--tk-accent, #2e8a5a)" stroke={2.5} />
          </Link>
        </div>

        {/* Tempat Kursus column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <FeatureSquare
            title={t.lcTitle}
            count={lcTotal}
            sub={t.homeAltKursusSub}
            photo={P.kursus}
            tone="linear-gradient(165deg,rgba(42,125,98,0.85) 0%,rgba(31,155,106,0.92) 100%)"
            accent="#7af0b6"
            expanded={open === "kursus"}
            onToggle={() => toggleCard("kursus")}
            animDelay="1.5s"
          />
          <Link href="/learning-centers?view=results" style={{
            fontSize: 13, fontWeight: 700,
            color: "var(--tk-accent, #2e8a5a)",
            textDecoration: "none",
            display: open ? "none" : "flex",
            alignItems: "center", justifyContent: "center", gap: 3,
            fontFamily: "var(--font-jakarta), sans-serif",
            padding: "3px 0",
          }}>
            {lang === "id" ? "Lihat Semua Kursus" : "See All Centers"}
            <Chev size={11} color="var(--tk-accent, #2e8a5a)" stroke={2.5} />
          </Link>
        </div>
      </div>

      {/* Tier 1: area pills — slides in when a card is tapped */}
      <div style={{
        marginTop: open ? 8 : 0,
        maxHeight: open ? 90 : 0,
        opacity: open ? 1 : 0,
        overflow: "clip",
        transition: "max-height .35s ease, opacity .25s ease, margin-top .3s ease",
      }}>
        {open && (
          <AreaPills
            category={open}
            value={area}
            onPick={(k) => { setArea(k); setGrade(null); }}
            areas={areas}
          />
        )}

      </div>

      {/* Tier 2: age bands — slides in after an area is picked */}
      <div ref={tier2Ref} style={{
        marginTop: open && area ? 8 : 0,
        maxHeight: open && area ? 160 : 0,
        opacity: open && area ? 1 : 0,
        overflow: "clip",
        transition: "max-height .4s ease, opacity .3s ease, margin-top .3s ease",
      }}>
        {open && area && (
          <AgeBands
            category={open}
            area={area}
            selected={grade}
            onPick={(key) => setGrade(key)}
            schools={allSchools}
            lcs={allLCs}
          />
        )}
      </div>

      {/* Tier 3: language pills (schools) — slides in after a grade is picked */}
      <div ref={tier3Ref} style={{
        marginTop: open === "sekolah" && area && grade ? 8 : 0,
        maxHeight: open === "sekolah" && area && grade ? 280 : 0,
        opacity: open === "sekolah" && area && grade ? 1 : 0,
        overflow: "clip",
        transition: "max-height .4s ease, opacity .3s ease, margin-top .3s ease",
      }}>
        {open === "sekolah" && area && grade && (
          <LangPills grade={grade} area={area} schools={allSchools} />
        )}
      </div>

      {/* Tier 3: course type pills (learning centers) — slides in after an age is picked */}
      <div ref={open === "kursus" ? tier3Ref : undefined} style={{
        marginTop: open === "kursus" && area && grade ? 8 : 0,
        maxHeight: open === "kursus" && area && grade ? 280 : 0,
        opacity: open === "kursus" && area && grade ? 1 : 0,
        overflow: "clip",
        transition: "max-height .4s ease, opacity .3s ease, margin-top .3s ease",
      }}>
        {open === "kursus" && area && grade && (
          <CourseTypePills ageKey={grade} area={area} lcs={allLCs} />
        )}
      </div>
    </div>
  );
}

// ─── IndexList ────────────────────────────────────────────────────────────────
function IndexList() {
  const { lang, t } = useLang();
  const [counts, setCounts] = useState<Partial<Record<string, number>>>({});

  // Same defensive pattern as FeaturePair — hydrate from window cache and
  // refetch on back-nav / refocus so we never get stuck on an empty {}
  // showing the "+4 kategori" fallback for every row.
  useEffect(() => {
    const load = () => {
      const c = getCachedCounts();
      if (Object.keys(c).length) setCounts(c);
      fetchCategoryCounts().then(setCounts);
    };
    load();
    const onVisible = () => { if (document.visibilityState === "visible") load(); };
    window.addEventListener("popstate", load);
    window.addEventListener("pageshow", load);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("popstate", load);
      window.removeEventListener("pageshow", load);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const INDEX_CATS = [
    { icon: "daycare",    name: t.catDaycare,       count: counts["daycare"]        ?? null, href: "/daycare?view=results"        },
    { icon: "clinic",     name: t.catClinic,        count: counts["clinic"]         ?? null, href: "/clinics?view=results"        },
    { icon: "playground", name: t.catPlayground,    count: counts["playground"]     ?? null, href: "/playgrounds?view=results"    },
    { icon: "animals",    name: t.catMiniZoo,       count: counts["mini-zoo"]       ?? null, href: "/mini-zoo?view=results"       },
    { icon: "pool",       name: t.catSwimmingPool,  count: counts["swimming-pool"]  ?? null, href: "/swimming-pools?view=results" },
    { icon: "cafe",       name: t.catCafe,          count: counts["cafe"]           ?? null, href: "/cafes?view=results"          },
    { icon: "books",      name: t.catBookstore,     count: counts["bookstore"]      ?? null, href: "/bookstores?view=results"     },
  ];

  return (
    <div style={{ padding: "28px 22px 0" }}>
      <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1.2, color: "#94a3b8" }}>
        {t.homeAltCatOther}
      </div>
      <div style={{ marginTop: 12, borderTop: "1px solid rgba(15,23,42,0.18)" }}>
        {INDEX_CATS.map(({ icon, name, count, href }) => (
          <Link key={href} href={href} style={{
            display: "flex", alignItems: "center", gap: 14, padding: "11px 0",
            borderBottom: "1px solid rgba(15,23,42,0.08)",
            textDecoration: "none", color: "inherit",
            touchAction: "manipulation",
            WebkitTapHighlightColor: "transparent",
          }}>
            {/* line icon in accent color */}
            <span style={{
              width: 22, height: 22,
              color: "var(--tk-accent, #c47a14)",
              flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {Ico[icon]}
            </span>
            {/* category name */}
            <span style={{
              flex: 1,
              fontFamily: "var(--font-fraunces), Georgia, serif",
              fontSize: 19, fontWeight: 600, color: "#0e1d4f", letterSpacing: -0.3,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              minWidth: 0,
            }}>
              {name}
            </span>
            <span style={{ fontSize: 10.5, color: "#94a3b8", fontWeight: 600, flexShrink: 0 }}>
              {count !== null ? `${count} ${t.homeAltTempatUnit}` : (lang === "id" ? "+ 4 kategori" : "+ 4 categories")}
            </span>
            <Chev size={14} color="#94a3b8" stroke={2} />
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── CoverStoryCard ───────────────────────────────────────────────────────────
function CoverStoryCard({
  place, saved, onToggleSave,
}: {
  place: { id: string; slug?: string; name: string; area: string; photo: string; rating: number; reviews: number };
  saved: boolean;
  onToggleSave: () => void;
}) {
  const [heartScale, setHeartScale] = useState(1);
  const toggle = () => {
    onToggleSave();
    setHeartScale(1.18);
    setTimeout(() => setHeartScale(1), 250);
  };
  return (
    <div style={{
      borderRadius: 6, overflow: "clip",
      border: "1px solid rgba(15,23,42,0.12)",
      boxShadow: "0 8px 20px rgba(15,23,42,0.10)",
    }}>
      {/* full-bleed photo — no white body below */}
      <div style={{ aspectRatio: "4/3", position: "relative", overflow: "clip" }}>
        <Link href={`/place/${place.slug ?? place.id}`} style={{ display: "block", height: "100%", textDecoration: "none" }}>
          <img src={place.photo} alt={place.name} style={{
            position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
          }} />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(180deg, rgba(14,29,79,0.0) 20%, rgba(14,29,79,0.80) 100%)",
          }} />
          {/* FEATURED badge */}
          <span style={{
            position: "absolute", top: 8, left: 8,
            fontSize: 8, fontWeight: 800, letterSpacing: 0.5,
            padding: "3px 7px", background: "#0e1d4f", color: "#f6f1e8",
          }}>
            FEATURED
          </span>
          {/* place name — bigger */}
          <div style={{
            position: "absolute", bottom: 8, left: 10, right: 10, color: "#fff",
            fontFamily: "var(--font-fraunces), Georgia, serif",
            fontSize: 17, fontWeight: 700, letterSpacing: -0.4, lineHeight: 1.15,
            textShadow: "0 1px 10px rgba(0,0,0,0.55)",
          }}>
            {place.name}
          </div>
        </Link>
        {/* heart save button — sits inside the photo, top-right */}
        <Pressable onClick={toggle} ariaLabel={saved ? "Hapus" : "Simpan"} scale={0.85} style={{
          position: "absolute", top: 8, right: 8,
          width: 28, height: 28, borderRadius: 999,
          background: "rgba(255,255,255,0.88)",
          border: `1px solid ${saved ? "#EF4444" : "rgba(255,255,255,0.5)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{
            transform: `scale(${heartScale})`,
            transition: "transform .25s cubic-bezier(.5,1.6,.4,1)",
            display: "flex",
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24"
              fill={saved ? "#EF4444" : "none"}
              stroke={saved ? "#EF4444" : "#94a3b8"} strokeWidth="2" strokeLinejoin="round">
              <path d="M12 21s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 5.65-7 10-7 10z" />
            </svg>
          </span>
        </Pressable>
      </div>
    </div>
  );
}

// ─── CoverStory — 2×2 grid ────────────────────────────────────────────────────
function CoverStory() {
  const { t } = useLang();
  const [allPlaces, setAllPlaces] = useState<Place[]>([]);
  useEffect(() => { fetchAllPlaces().then(setAllPlaces); }, []);

  const featured = allPlaces.filter((p) => p.isFeatured).slice(0, 4);
  const cards = featured.length >= 4
    ? featured
    : [...featured, ...allPlaces.filter((p) => !p.isFeatured)].slice(0, 4);

  const [saved, setSaved] = useState<boolean[]>([]);
  useEffect(() => { setSaved(cards.map(() => false)); }, [cards.length]);
  const toggle = (i: number) => setSaved((s) => s.map((v, j) => j === i ? !v : v));

  return (
    <div style={{ padding: "28px 22px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1.2, color: "#94a3b8" }}>
          {t.homeAltEditorPick}
        </div>
        <Link href="/explore" style={{
          fontSize: 12, fontWeight: 700, color: "var(--tk-accent, #c47a14)",
          letterSpacing: 0.4, textDecoration: "none",
        }}>
          {t.homeAltSeeAll}
        </Link>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
        {cards.map((place, i) => (
          <CoverStoryCard
            key={place.id}
            place={place}
            saved={saved[i]}
            onToggleSave={() => toggle(i)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── ArticleList ──────────────────────────────────────────────────────────────
function ArticleList() {
  const { lang, t } = useLang();
  const [dbArticles, setDbArticles] = useState<DbArticle[]>([]);
  const [dbLoaded, setDbLoaded] = useState(false);

  useEffect(() => {
    fetchPublishedArticles().then((data) => { setDbArticles(data); setDbLoaded(true); });
  }, []);

  // Use Supabase articles if any exist, otherwise fall back to static
  const useDb = dbLoaded && dbArticles.length > 0;
  const staticDisplay = articles.slice(0, 3).map((a) => localizeArticle(a, lang));

  return (
    <div style={{ padding: "28px 22px 0" }}>
      <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1.2, color: "#94a3b8" }}>
        {t.homeAltNewsKicker}
      </div>
      <div style={{ marginTop: 14, borderTop: "1px solid rgba(15,23,42,0.18)" }}>
        {useDb ? (
          dbArticles.slice(0, 3).map((a) => (
            <Link key={a.id} href={`/berita/${a.slug}`} style={{
              padding: "14px 0",
              borderBottom: "1px solid rgba(15,23,42,0.08)",
              display: "flex", gap: 12, alignItems: "flex-start",
              textDecoration: "none", color: "inherit",
              touchAction: "manipulation",
              WebkitTapHighlightColor: "transparent",
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 9.5, fontWeight: 800, color: "var(--tk-accent, #c47a14)", letterSpacing: 0.7 }}>
                  ARTIKEL
                </div>
                <div style={{
                  fontFamily: "var(--font-fraunces), Georgia, serif",
                  fontSize: 16, fontWeight: 700, color: "#0e1d4f",
                  letterSpacing: -0.2, marginTop: 4, lineHeight: 1.2,
                }}>
                  {a.title}
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                  {a.published_at ? new Date(a.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : ""}
                </div>
              </div>
              {a.cover_image_url && (
                <img src={a.cover_image_url} alt="" style={{
                  width: 72, height: 72, objectFit: "cover", borderRadius: 4,
                  border: "1px solid rgba(15,23,42,0.08)", flexShrink: 0,
                }} />
              )}
            </Link>
          ))
        ) : (
          staticDisplay.map((article) => (
            <Link key={article.id} href={`/berita/${article.id}`} style={{
              padding: "14px 0",
              borderBottom: "1px solid rgba(15,23,42,0.08)",
              display: "flex", gap: 12, alignItems: "flex-start",
              textDecoration: "none", color: "inherit",
              touchAction: "manipulation",
              WebkitTapHighlightColor: "transparent",
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 9.5, fontWeight: 800, color: "var(--tk-accent, #c47a14)", letterSpacing: 0.7 }}>
                  {article.category.toUpperCase()}
                </div>
                <div style={{
                  fontFamily: "var(--font-fraunces), Georgia, serif",
                  fontSize: 16, fontWeight: 700, color: "#0e1d4f",
                  letterSpacing: -0.2, marginTop: 4, lineHeight: 1.2,
                }}>
                  {article.title}
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                  {article.date} · {article.readTime}
                </div>
              </div>
              <img src={article.photo} alt="" style={{
                width: 72, height: 72, objectFit: "cover", borderRadius: 4,
                border: "1px solid rgba(15,23,42,0.08)", flexShrink: 0,
              }} />
            </Link>
          ))
        )}
      </div>

      {/* See all articles link */}
      <Link href="/berita" style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        marginTop: 14, gap: 4,
        fontSize: 12, fontWeight: 700,
        color: "var(--tk-accent, #c47a14)",
        textDecoration: "none",
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
        opacity: 0.85,
      }}>
        {t.newsSeeAll}
        <Chev size={12} color="var(--tk-accent, #c47a14)" stroke={2.5} />
      </Link>
    </div>
  );
}

// ─── DaftarCard ───────────────────────────────────────────────────────────────
function DaftarCard() {
  const { t } = useLang();
  return (
    <div style={{ padding: "24px 22px 0" }}>
      <div style={{
        border: "1px solid rgba(15,23,42,0.12)", borderRadius: 4,
        background: "#fff",
        padding: "18px 18px", display: "flex", alignItems: "center", gap: 14,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 9.5, fontWeight: 800, letterSpacing: 0.6, color: "#94a3b8",
          }}>
            {t.homeOwnerKicker.toUpperCase()}
          </div>
          <div style={{
            fontFamily: "var(--font-fraunces), Georgia, serif",
            fontWeight: 700, fontSize: 18, color: "#0e1d4f", marginTop: 4, letterSpacing: -0.2,
          }}>
            {t.homeAltDaftarTitle}
          </div>
        </div>
        <Link href="/list-your-place" style={{
          background: "#0e1d4f", color: "#fff",
          padding: "10px 14px", borderRadius: 4, fontWeight: 700, fontSize: 12,
          textDecoration: "none", flexShrink: 0,
          touchAction: "manipulation",
          WebkitTapHighlightColor: "transparent",
        }}>
          {t.homeAltDaftarBtn}
        </Link>
      </div>
    </div>
  );
}

// ─── FooterMark ───────────────────────────────────────────────────────────────
function FooterMark() {
  return (
    <div style={{
      textAlign: "center", padding: "20px 0 0",
      fontSize: 9.5, fontWeight: 700, letterSpacing: 1, color: "#94a3b8",
    }}>
      TANGSELKIDS · EDISI MEI 2026
    </div>
  );
}


// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomeClient() {
  const { user } = useAuth();
  const [scrollY, setScrollY] = useState(0);

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "?";
  const showSticky  = scrollY > 140;

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    // Outer wrapper sets --tk-accent to emerald for this route only.
    <div style={{ "--tk-accent": "#2e8a5a" } as React.CSSProperties}>
      <style>{`
        @keyframes alt-home-enter {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .alt-home-content {
          animation: alt-home-enter 0.5s ease both;
        }
        .alt-press-row { transition: opacity .12s ease; }
        .alt-press-row:active { opacity: 0.7; }
        .tk-age-rail::-webkit-scrollbar { display: none; }
      `}</style>

      <StickyHeader visible={showSticky} />

      <div
        className="alt-home-content"
        style={{
          background: "#f6f1e8",
          minHeight: "100vh",
          maxWidth: 430,
          marginLeft: "auto",
          marginRight: "auto",
          paddingBottom: 110,
          fontFamily: "var(--font-jakarta), system-ui, sans-serif",
          color: "#0e1d4f",
        } as React.CSSProperties}
      >
        <Masthead userInitial={userInitial} />
        <FeaturePair />
        <IndexList />
        <CoverStory />
        <ArticleList />
        <DaftarCard />
        <FooterMark />
      </div>

      <BottomNav active="home" />
    </div>
  );
}
