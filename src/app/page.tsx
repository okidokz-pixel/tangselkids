"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { LangToggle } from "@/components/LangToggle";
import { PremiumBadge } from "@/components/PremiumBadge";
import { BottomNav } from "@/components/BottomNav";
import { places, getAreaGroup } from "@/lib/mockData";
import { articles, localizeArticle } from "@/lib/articles";

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

// ─── Area multipliers ─────────────────────────────────────────────────────────
const AREA_MULT: Record<AreaKey, number> = { Bintaro: 1.0, BSD: 0.78, Semua: 1.7 };

// ─── Dynamic count helpers ────────────────────────────────────────────────────
function countCat(cat: string): number {
  return places.filter((p) => p.category === cat).length;
}
function countPlacesByCat(cat: "school" | "learning-center", areaKey: AreaKey): number {
  return places.filter((p) => {
    if (p.category !== cat) return false;
    if (areaKey === "Semua") return true;
    const g = getAreaGroup(p.area);
    return g === "both" || g === (areaKey === "Bintaro" ? "bintaro" : "bsd");
  }).length;
}

/** Count schools that offer a given grade level, filtered by area. */
function countSchoolByGradeAndArea(gradeKey: string, areaKey: AreaKey): number {
  return places.filter((p) => {
    if (p.category !== "school") return false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!p.grades?.includes(gradeKey as any)) return false;
    if (areaKey === "Semua") return true;
    const g = getAreaGroup(p.area);
    return g === "both" || g === (areaKey === "Bintaro" ? "bintaro" : "bsd");
  }).length;
}

/** Count learning centers that serve a given age group key, filtered by area. */
function countLCByAgeAndArea(ageKey: string, areaKey: AreaKey): number {
  return places.filter((p) => {
    if (p.category !== "learning-center") return false;
    if (!p.ageGroups?.includes(ageKey)) return false;
    if (areaKey === "Semua") return true;
    const g = getAreaGroup(p.area);
    return g === "both" || g === (areaKey === "Bintaro" ? "bintaro" : "bsd");
  }).length;
}

// ─── Areas with dynamic counts ───────────────────────────────────────────────
const AREAS: { key: AreaKey; counts: Record<CategoryKey, number> }[] = [
  { key: "Bintaro", counts: { sekolah: countPlacesByCat("school", "Bintaro"), kursus: countPlacesByCat("learning-center", "Bintaro") } },
  { key: "BSD",     counts: { sekolah: countPlacesByCat("school", "BSD"),     kursus: countPlacesByCat("learning-center", "BSD")     } },
  { key: "Semua",   counts: { sekolah: countPlacesByCat("school", "Semua"),   kursus: countPlacesByCat("learning-center", "Semua")   } },
];

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
    <div style={{ position: "relative", width: 52, height: 52, flexShrink: 0 }}>
      <svg viewBox="0 0 52 52" width="52" height="52">
        <g transform="rotate(-6 26 26)">
          <rect x="3" y="3" width="46" height="46" rx="4" fill="var(--tk-accent, #c47a14)" />
          <rect x="18" y="-2" width="16" height="6" rx="1"
            fill="#f6b545" opacity="0.9" transform="rotate(8 26 1)" />
        </g>
        <g stroke="#fff7ec" strokeWidth="2" strokeLinecap="round" fill="none">
          <path d="M26 8 v3"/><path d="M26 41 v3"/>
          <path d="M8 26 h3"/><path d="M41 26 h3"/>
          <path d="M14 14 l2 2"/><path d="M36 36 l2 2"/>
          <path d="M38 14 l-2 2"/><path d="M16 36 l-2 2"/>
        </g>
        <g transform="translate(26 26)">
          <path d="M0 -10 l2.6 6 l6.4 .9 l-4.7 4.4 l1.2 6.4 l-5.5 -3.2 l-5.5 3.2 l1.2 -6.4 l-4.7 -4.4 l6.4 -.9 z"
            fill="#0e1d4f" />
          <circle cx="-2" cy="-2" r="0.9" fill="#fff7ec" />
          <circle cx="2" cy="-2" r="0.9" fill="#fff7ec" />
          <path d="M-2 1.5 q2 1.6 4 0" stroke="#fff7ec" strokeWidth="0.9"
            fill="none" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}

// ─── Typewriter ───────────────────────────────────────────────────────────────
// Cream band: pre-text + italic dark cycling word + post-text + caret.
function Typewriter() {
  const { lang, t } = useLang();
  const words = TYPE_WORDS[lang];

  const [wordIdx, setWordIdx] = useState(0);
  const [text, setText]       = useState("");
  const [phase, setPhase]     = useState<"typing" | "deleting">("typing");
  const [caretOn, setCaretOn] = useState(true);

  // reset when language changes
  useEffect(() => {
    setText("");
    setPhase("typing");
    setWordIdx(0);
  }, [lang]);

  // caret blink every 500ms
  useEffect(() => {
    const id = setInterval(() => setCaretOn((v) => !v), 500);
    return () => clearInterval(id);
  }, []);

  // typewriter state machine
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
        timer = setTimeout(() => {
          setWordIdx((i) => (i + 1) % words.length);
          setPhase("typing");
        }, 260);
      }
    }
    return () => clearTimeout(timer);
  }, [text, phase, wordIdx, words]);

  return (
    <div style={{
      marginTop: 12,
      background: "#fff7ec",
      borderTop: "1px solid rgba(15,23,42,0.1)",
      borderBottom: "1px solid rgba(15,23,42,0.1)",
      padding: "14px 22px",
      fontSize: 17, color: "#475569", lineHeight: 1.3,
      fontFamily: "var(--font-fraunces), Georgia, serif",
      fontWeight: 500,
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
        <svg viewBox="0 0 52 52" width="28" height="28" style={{ flexShrink: 0 }}>
          <g transform="rotate(-6 26 26)">
            <rect x="3" y="3" width="46" height="46" rx="4" fill="var(--tk-accent, #c47a14)" />
            <rect x="18" y="-2" width="16" height="6" rx="1" fill="#f6b545" opacity="0.9" transform="rotate(8 26 1)" />
          </g>
          <g stroke="#fff7ec" strokeWidth="2" strokeLinecap="round" fill="none">
            <path d="M26 8 v3"/><path d="M26 41 v3"/>
            <path d="M8 26 h3"/><path d="M41 26 h3"/>
            <path d="M14 14 l2 2"/><path d="M36 36 l2 2"/>
            <path d="M38 14 l-2 2"/><path d="M16 36 l-2 2"/>
          </g>
          <g transform="translate(26 26)">
            <path d="M0 -10 l2.6 6 l6.4 .9 l-4.7 4.4 l1.2 6.4 l-5.5 -3.2 l-5.5 3.2 l1.2 -6.4 l-4.7 -4.4 l6.4 -.9 z" fill="#0e1d4f" />
            <circle cx="-2" cy="-2" r="0.9" fill="#fff7ec" />
            <circle cx="2" cy="-2" r="0.9" fill="#fff7ec" />
            <path d="M-2 1.5 q2 1.6 4 0" stroke="#fff7ec" strokeWidth="0.9" fill="none" strokeLinecap="round" />
          </g>
        </svg>
        <div style={{
          fontFamily: "var(--font-fraunces), Georgia, serif",
          fontWeight: 700, fontSize: 22, letterSpacing: -1, color: "#0e1d4f", lineHeight: 1,
        }}>
          Tangsel<span style={{ color: "var(--tk-accent, #c47a14)" }}>.</span>
          <span style={{ fontStyle: "italic", fontSize: 14, fontWeight: 500, opacity: 0.7, marginLeft: 4 }}>
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
  const { tier } = useAuth();
  return (
    <>
      <div style={{ padding: "20px 22px 0" }}>
        {/* top row */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", gap: 12,
        }}>
          {/* left: Logo */}
          <Logo />

          {/* middle: wordmark */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: "var(--font-fraunces), Georgia, serif",
              fontWeight: 700, fontSize: 38, letterSpacing: -1.4,
              lineHeight: 0.95, color: "#0e1d4f",
            }}>
              Tangsel<span style={{ color: "var(--tk-accent, #c47a14)" }}>.</span>
            </div>
            <div style={{
              fontFamily: "var(--font-fraunces), Georgia, serif",
              fontStyle: "italic", fontWeight: 500, fontSize: 24,
              color: "#0e1d4f", opacity: 0.7, marginTop: -2, letterSpacing: 4,
            }}>
              Kids
            </div>
          </div>

          {/* right: [avatar + badge] stacked above lang toggle */}
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "flex-end", gap: 6, flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Link href="/profile" style={{
                width: 26, height: 26, borderRadius: 999, background: "#0e1d4f",
                color: "#fff", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 11, fontWeight: 700,
                textDecoration: "none",
                fontFamily: "var(--font-jakarta), sans-serif",
                touchAction: "manipulation",
                flexShrink: 0,
              }}>
                {userInitial}
              </Link>
              {tier === "premium" && <PremiumBadge />}
            </div>
            <LangToggle variant="dark" />
          </div>
        </div>

        {/* tagline */}
        <div style={{
          marginTop: 14, fontSize: 12.5, lineHeight: 1.45,
          color: "#475569", maxWidth: 320,
        }}>
          {t.homeAltTagline}{" "}
          <b style={{ color: "var(--tk-accent, #c47a14)", fontWeight: 700 }}>Bintaro</b>
          {" "}{lang === "id" ? "dan" : "&"}{" "}
          <b style={{ color: "var(--tk-accent, #c47a14)", fontWeight: 700 }}>BSD</b>.
        </div>

      </div>

      {/* full-bleed typewriter band — outside the padded div */}
      <Typewriter />
    </>
  );
}

// ─── FeatureSquare ────────────────────────────────────────────────────────────
function FeatureSquare({
  title, count, sub, photo, tone, accent, expanded, onToggle,
}: {
  title: string; count: number; sub: string;
  photo: string; tone: string; accent: string;
  expanded: boolean; onToggle: () => void;
}) {
  const { t } = useLang();
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
        display: "flex", flexDirection: "column", justifyContent: "flex-end",
      }}>
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
          {/* chevron rotates 90° when expanded */}
          <span style={{
            width: 26, height: 26, borderRadius: 999, background: "#fff7ec",
            display: "flex", alignItems: "center", justifyContent: "center",
            transform: expanded ? "rotate(90deg)" : "rotate(0)",
            transition: "transform .3s ease",
          }}>
            <Chev size={13} color="#0e1d4f" stroke={2.2} />
          </span>
        </div>
      </div>
    </Pressable>
  );
}

// ─── AreaPills ────────────────────────────────────────────────────────────────
function AreaPills({
  category, value, onPick,
}: {
  category: CategoryKey;
  value: AreaKey | null;
  onPick: (k: AreaKey) => void;
}) {
  const { t } = useLang();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{
        fontSize: 13, fontWeight: 800, letterSpacing: 1, color: "#94a3b8",
      }}>
        {t.homeAltAreaWhere}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {AREAS.map((a) => {
          const active = value === a.key;
          const displayLabel = a.key === "Semua" ? t.homeAltAreaAll : a.key;
          return (
            <Pressable
              key={a.key}
              scale={0.94}
              onClick={() => onPick(a.key)}
              style={{
                flex: 1,
                padding: "11px 14px",
                borderRadius: 999,
                border: active
                  ? "1px solid #0e1d4f"
                  : "1px solid rgba(15,23,42,0.14)",
                background: active ? "#0e1d4f" : "#fff",
                display: "flex", alignItems: "center",
                justifyContent: "center", gap: 6,
                transition: "background .2s ease, border-color .2s ease",
              }}
            >
              <span style={{
                fontFamily: "var(--font-fraunces), Georgia, serif",
                fontSize: 17, fontWeight: 700, letterSpacing: -0.2,
                color: active ? "#fff" : "#0e1d4f",
                whiteSpace: "nowrap",
              }}>
                {displayLabel}
              </span>
              <span style={{
                fontSize: 11, fontWeight: 700,
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
      <span style={{
        display: "flex",
        transform: side === "left" ? "rotate(180deg)" : "none",
      }}>
        <Chev size={13} color="#0e1d4f" stroke={2.2} />
      </span>
    </button>
  );
}

// ─── BAHASA list — internal keys match mockData values ───────────────────────
const BAHASA_LIST = [
  "Indonesian",
  "English",
  "Bilingual (ID+EN)",
  "Bilingual (ID+AR)",
  "Bilingual (EN+CN)",
  "Bilingual (DE+EN)",
  "Japanese",
  "Trilingual (ID+EN+CN)",
];

// Display labels per UI language — short & readable on pills
const BAHASA_PILL_LABELS: Record<"id" | "en", Record<string, string>> = {
  id: {
    "Indonesian":           "Indonesia",
    "English":              "Inggris",
    "Bilingual (ID+EN)":    "ID+Inggris",
    "Bilingual (ID+AR)":    "ID+Arabic",
    "Bilingual (EN+CN)":    "ID+Mandarin",
    "Bilingual (DE+EN)":    "Jerman",
    "Japanese":             "Jepang",
    "Trilingual (ID+EN+CN)":"ID+EN+CN",
  },
  en: {
    "Indonesian":           "Indonesian",
    "English":              "English",
    "Bilingual (ID+EN)":    "ID+EN",
    "Bilingual (ID+AR)":    "ID+AR",
    "Bilingual (EN+CN)":    "EN+CN",
    "Bilingual (DE+EN)":    "DE+EN",
    "Japanese":             "Japanese",
    "Trilingual (ID+EN+CN)":"ID+EN+CN",
  },
};

// ─── CourseTypePills ──────────────────────────────────────────────────────────
function CourseTypePills({
  ageKey, area,
}: {
  ageKey: string;
  area: AreaKey;
}) {
  const { t } = useLang();
  const areaParam = area === "Semua" ? "all" : area.toLowerCase();
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
  }, [ageKey, area]);

  const nudge = (dir: number) => {
    railRef.current?.scrollBy({ left: dir * 140, behavior: "smooth" });
  };

  const courseTypes: { value: string; label: string; color: string; icon: React.ReactNode }[] = [
    {
      value: "Bahasa Inggris", label: t.courseTypeEnglish, color: "#3b82f6",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      ),
    },
    {
      value: "Matematika", label: t.courseTypeMath, color: "#f97316",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/>
          <line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>
        </svg>
      ),
    },
    {
      value: "Seni", label: t.courseTypeArts, color: "#ec4899",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="13.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
          <circle cx="17.5" cy="10.5" r="1" fill="currentColor" stroke="none"/>
          <circle cx="8.5" cy="7.5" r="1" fill="currentColor" stroke="none"/>
          <circle cx="6.5" cy="12.5" r="1" fill="currentColor" stroke="none"/>
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
        </svg>
      ),
    },
    {
      value: "Musik", label: t.courseTypeMusic, color: "#a855f7",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V5l12-2v13"/>
          <circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
        </svg>
      ),
    },
    {
      value: "Coding/Robotik", label: t.courseTypeCoding, color: "#10b981",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
        </svg>
      ),
    },
    {
      value: "Tari & Balet", label: t.courseTypeDance, color: "#f43f5e",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17.3l-6.2 4L8.2 14 2 9.4h7.6z"/>
        </svg>
      ),
    },
    {
      value: "Gimnastik", label: t.courseTypeGymnastics, color: "#f59e0b",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="4" r="2"/>
          <path d="M4 13l4-4 3 3 3-3 4 4"/>
          <path d="M7 21l2.5-5 2.5 2 2.5-2 2.5 5"/>
        </svg>
      ),
    },
  ];

  function navigate(course: string | null) {
    const q = course ? `&course=${encodeURIComponent(course)}` : "";
    window.location.href = `/learning-centers?age=${ageKey}&area=${areaParam}${q}&view=results`;
  }

  const pillStyle: React.CSSProperties = {
    flexShrink: 0,
    padding: "11px 14px",
    borderRadius: 999,
    border: "1px solid rgba(15,23,42,0.14)",
    background: "#fff",
    display: "flex", alignItems: "center", gap: 7, justifyContent: "center",
  };
  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-fraunces), Georgia, serif",
    fontSize: 15, fontWeight: 700, letterSpacing: -0.2, color: "#0e1d4f",
    whiteSpace: "nowrap",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1, color: "#94a3b8" }}>
        {t.filterCourseType.toUpperCase()}
      </div>
      <div style={{ position: "relative" }}>
        {/* Scrollable rail */}
        <div
          ref={railRef}
          onScroll={updateArrows}
          className="tk-age-rail"
          style={{
            display: "flex", gap: 8,
            overflowX: "auto", overflowY: "hidden",
            padding: "4px 2px 8px",
            scrollbarWidth: "none",
            margin: "0 -22px",
            paddingLeft: 22, paddingRight: 22,
          } as React.CSSProperties}
        >
          <Pressable scale={0.94} onClick={() => navigate(null)} style={pillStyle}>
            <span style={{ color: "#64748b", display: "flex", alignItems: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="5" cy="5" r="2"/><circle cx="12" cy="5" r="2"/><circle cx="19" cy="5" r="2"/>
                <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
                <circle cx="5" cy="19" r="2"/><circle cx="12" cy="19" r="2"/><circle cx="19" cy="19" r="2"/>
              </svg>
            </span>
            <span style={labelStyle}>{t.homeAltCourseTypeAll}</span>
          </Pressable>
          {courseTypes.map(({ value, label, color, icon }) => (
            <Pressable key={value} scale={0.94} onClick={() => navigate(value)} style={pillStyle}>
              <span style={{ color, display: "flex", alignItems: "center" }}>{icon}</span>
              <span style={labelStyle}>{label}</span>
            </Pressable>
          ))}
        </div>
        {/* Edge fades */}
        <div style={{
          position: "absolute", top: 0, bottom: 0, left: -22, width: 28,
          background: "linear-gradient(90deg, #f6f1e8, rgba(246,241,232,0))",
          opacity: canL ? 1 : 0, transition: "opacity .2s", pointerEvents: "none",
        }} />
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

// ─── LangPills ────────────────────────────────────────────────────────────────
function LangPills({
  grade, area,
}: {
  grade: string;
  area: AreaKey;
}) {
  const { lang, t } = useLang();
  const areaParam = area === "Semua" ? "all" : area.toLowerCase();
  const labelMap = BAHASA_PILL_LABELS[lang];
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

  const nudge = (dir: number) => {
    railRef.current?.scrollBy({ left: dir * 140, behavior: "smooth" });
  };

  function navigate(bhs: string | null) {
    const q = bhs ? `&bhs=${encodeURIComponent(bhs)}` : "";
    window.location.href = `/schools?grade=${grade}&area=${areaParam}${q}&view=results`;
  }

  const bahasaIcons: Record<string, { code: string; color: string }> = {
    "Indonesian":             { code: "ID", color: "#ef4444" },
    "English":                { code: "EN", color: "#3b82f6" },
    "Bilingual (ID+EN)":     { code: "ID+EN", color: "#8b5cf6" },
    "Bilingual (ID+AR)":     { code: "ID+AR", color: "#10b981" },
    "Bilingual (EN+CN)":     { code: "EN+CN", color: "#f97316" },
    "Bilingual (DE+EN)":     { code: "DE+EN", color: "#64748b" },
    "Japanese":               { code: "JP",   color: "#f43f5e" },
    "Trilingual (ID+EN+CN)": { code: "3×",   color: "#f59e0b" },
  };

  const pillStyle: React.CSSProperties = {
    flexShrink: 0,
    padding: "11px 14px",
    borderRadius: 999,
    border: "1px solid rgba(15,23,42,0.14)",
    background: "#fff",
    display: "flex", alignItems: "center", gap: 7, justifyContent: "center",
  };
  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-fraunces), Georgia, serif",
    fontSize: 15, fontWeight: 700, letterSpacing: -0.2, color: "#0e1d4f",
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
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1, color: "#94a3b8" }}>
        {t.homeAltSchoolLang}
      </div>
      <div style={{ position: "relative" }}>
        {/* Scrollable rail */}
        <div
          ref={railRef}
          onScroll={updateArrows}
          className="tk-age-rail"
          style={{
            display: "flex", gap: 8,
            overflowX: "auto", overflowY: "hidden",
            padding: "4px 2px 8px",
            scrollbarWidth: "none",
            margin: "0 -22px",
            paddingLeft: 22, paddingRight: 22,
          } as React.CSSProperties}
        >
          <Pressable scale={0.94} onClick={() => navigate(null)} style={pillStyle}>
            <span style={{ color: "#64748b", display: "flex", alignItems: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="5" cy="5" r="2"/><circle cx="12" cy="5" r="2"/><circle cx="19" cy="5" r="2"/>
                <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
                <circle cx="5" cy="19" r="2"/><circle cx="12" cy="19" r="2"/><circle cx="19" cy="19" r="2"/>
              </svg>
            </span>
            <span style={labelStyle}>{t.homeAltSchoolLangAll}</span>
          </Pressable>
          {BAHASA_LIST.map((key) => (
            <Pressable key={key} scale={0.94} onClick={() => navigate(key)} style={pillStyle}>
              <LangBadge langKey={key} />
              <span style={labelStyle}>{labelMap[key] ?? key}</span>
            </Pressable>
          ))}
        </div>
        {/* Edge fades */}
        <div style={{
          position: "absolute", top: 0, bottom: 0, left: -22, width: 28,
          background: "linear-gradient(90deg, #f6f1e8, rgba(246,241,232,0))",
          opacity: canL ? 1 : 0, transition: "opacity .2s", pointerEvents: "none",
        }} />
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

// ─── AgeBands ─────────────────────────────────────────────────────────────────
function AgeBands({
  category, area, onPick, selected,
}: {
  category: CategoryKey;
  area: AreaKey;
  onPick?: (key: string) => void;
  selected?: string | null;
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
    <div style={{ position: "relative" }}>
      <div style={{
        fontSize: 13, fontWeight: 800, letterSpacing: 1,
        color: "#94a3b8", marginBottom: 8,
      }}>
        {eyebrow}
      </div>
      <div style={{ position: "relative" }}>
        {/* scrollable rail */}
        <div
          ref={railRef}
          onScroll={updateArrows}
          className="tk-age-rail"
          style={{
            display: "flex", gap: 10,
            overflowX: "auto", overflowY: "hidden",
            padding: "4px 2px 8px",
            scrollbarWidth: "none",
            margin: "0 -22px",
            paddingLeft: 22, paddingRight: 22,
          } as React.CSSProperties}
        >
          {isSchool
            ? schoolBands.map((b) => {
                const n = countSchoolByGradeAndArea(b.key, area);
                const active = selected === b.key;
                const inner = (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{
                        width: 8, height: 8, borderRadius: 999, background: b.dot,
                        boxShadow: `0 0 0 3px ${b.dot}${active ? "55" : "22"}`, flexShrink: 0,
                      }} />
                      <span style={{
                        fontFamily: "var(--font-fraunces), Georgia, serif",
                        fontSize: 17, fontWeight: 700,
                        color: active ? "#fff" : "#0e1d4f",
                        letterSpacing: -0.2, whiteSpace: "nowrap",
                      }}>
                        {b.label}
                      </span>
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 500, whiteSpace: "nowrap",
                      color: active ? "rgba(255,255,255,0.65)" : "#94a3b8" }}>
                      {b.sub} · <b style={{ color: active ? "rgba(255,255,255,0.9)" : "#475569", fontWeight: 700 }}>{n}</b> {t.homeAltTempatUnit}
                    </div>
                  </>
                );
                const cardStyle: React.CSSProperties = {
                  flexShrink: 0, display: "flex", flexDirection: "column", gap: 4,
                  padding: "11px 14px", borderRadius: 12, minWidth: 96,
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
                const n = countLCByAgeAndArea(b.key, area);
                const active = selected === b.key;
                const inner = (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{
                        width: 8, height: 8, borderRadius: 999, background: b.dot,
                        boxShadow: `0 0 0 3px ${b.dot}${active ? "55" : "22"}`, flexShrink: 0,
                      }} />
                      <span style={{
                        fontFamily: "var(--font-fraunces), Georgia, serif",
                        fontSize: 17, fontWeight: 700,
                        color: active ? "#fff" : "#0e1d4f",
                        letterSpacing: -0.2, whiteSpace: "nowrap",
                      }}>
                        {b.label}
                      </span>
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 500, whiteSpace: "nowrap",
                      color: active ? "rgba(255,255,255,0.65)" : "#94a3b8" }}>
                      {b.sub} · <b style={{ color: active ? "rgba(255,255,255,0.9)" : "#475569", fontWeight: 700 }}>{n}</b> {t.homeAltTempatUnit}
                    </div>
                  </>
                );
                const cardStyle: React.CSSProperties = {
                  flexShrink: 0, display: "flex", flexDirection: "column", gap: 4,
                  padding: "11px 14px", borderRadius: 12, minWidth: 96,
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
                    href={`/learning-centers?age=${b.key}&area=${area === "Semua" ? "all" : area.toLowerCase()}&view=results`}
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

        {/* edge fade — left. Warm cream bg. */}
        <div style={{
          position: "absolute", top: 0, bottom: 0, left: -22, width: 28,
          background: "linear-gradient(90deg, #f6f1e8, rgba(246,241,232,0))",
          opacity: canL ? 1 : 0, transition: "opacity .2s", pointerEvents: "none",
        }} />
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
  const { t } = useLang();
  const [open, setOpen] = useState<CategoryKey | null>(null);
  const [area, setArea] = useState<AreaKey | null>(null);
  const [grade, setGrade] = useState<string | null>(null);

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

  const schoolTotal = countCat("school");
  const lcTotal     = countCat("learning-center");

  return (
    <div style={{ padding: "28px 22px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1.2, color: "#94a3b8" }}>
          {t.homeAltFeatureKicker}
        </div>
        <Link href="/explore" style={{
          fontSize: 12, fontWeight: 700, color: "var(--tk-accent, #c47a14)",
          letterSpacing: 0.4, textDecoration: "none",
        }}>
          {t.homeAltSeeAll}
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
        <FeatureSquare
          title={t.catSchool}
          count={schoolTotal}
          sub={t.homeAltSchoolSub}
          photo={P.sekolah}
          tone="linear-gradient(165deg,rgba(58,100,238,0.85) 0%,rgba(30,63,176,0.92) 100%)"
          accent="#f6b545"
          expanded={open === "sekolah"}
          onToggle={() => {
            toggleCard("sekolah");
          }}
        />
        <FeatureSquare
          title={t.lcTitle}
          count={lcTotal}
          sub={t.homeAltKursusSub}
          photo={P.kursus}
          tone="linear-gradient(165deg,rgba(42,125,98,0.85) 0%,rgba(31,155,106,0.92) 100%)"
          accent="#7af0b6"
          expanded={open === "kursus"}
          onToggle={() => {
            toggleCard("kursus");
          }}
        />
      </div>

      {/* Tier 1: area pills — slides in when a card is tapped */}
      <div style={{
        marginTop: open ? 14 : 0,
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
          />
        )}

      </div>

      {/* Tier 2: age bands — slides in after an area is picked */}
      <div style={{
        marginTop: open && area ? 14 : 0,
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
          />
        )}
      </div>

      {/* Tier 3: language pills (schools) — slides in after a grade is picked */}
      <div style={{
        marginTop: open === "sekolah" && area && grade ? 14 : 0,
        maxHeight: open === "sekolah" && area && grade ? 200 : 0,
        opacity: open === "sekolah" && area && grade ? 1 : 0,
        overflow: "clip",
        transition: "max-height .4s ease, opacity .3s ease, margin-top .3s ease",
      }}>
        {open === "sekolah" && area && grade && (
          <LangPills grade={grade} area={area} />
        )}
      </div>

      {/* Tier 3: course type pills (learning centers) — slides in after an age is picked */}
      <div style={{
        marginTop: open === "kursus" && area && grade ? 14 : 0,
        maxHeight: open === "kursus" && area && grade ? 220 : 0,
        opacity: open === "kursus" && area && grade ? 1 : 0,
        overflow: "clip",
        transition: "max-height .4s ease, opacity .3s ease, margin-top .3s ease",
      }}>
        {open === "kursus" && area && grade && (
          <CourseTypePills ageKey={grade} area={area} />
        )}
      </div>
    </div>
  );
}

// ─── IndexList ────────────────────────────────────────────────────────────────
function IndexList() {
  const { lang, t } = useLang();

  const INDEX_CATS = [
    { icon: "daycare",    name: t.catDaycare,       count: countCat("daycare"),        href: "/daycare"        },
    { icon: "playground", name: t.catPlayground,    count: countCat("playground"),     href: "/playgrounds"    },
    { icon: "clinic",     name: t.catClinic,        count: countCat("clinic"),         href: "/clinics"        },
    { icon: "cafe",       name: t.catCafe,          count: countCat("cafe"),           href: "/cafes"          },
    { icon: "animals",    name: t.catMiniZoo,       count: countCat("mini-zoo"),       href: "/mini-zoo"       },
    { icon: "pool",       name: t.catSwimmingPool,  count: countCat("swimming-pool"),  href: "/swimming-pools" },
    { icon: "books",      name: t.catBookstore,     count: countCat("bookstore"),      href: "/bookstores"     },
    { icon: "more",       name: t.homeOthers,       count: null,                       href: "/others"         },
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
  place: { id: string; name: string; area: string; photo: string; rating: number; reviews: number };
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
        <Link href={`/place/${place.id}`} style={{ display: "block", height: "100%", textDecoration: "none" }}>
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
  const featured = places.filter((p) => p.isFeatured).slice(0, 4);
  const cards = featured.length >= 4
    ? featured
    : [...featured, ...places.filter((p) => !p.isFeatured)].slice(0, 4);

  const [saved, setSaved] = useState<boolean[]>(cards.map(() => false));
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
  const displayArticles = articles.slice(0, 3).map((a) => localizeArticle(a, lang));

  return (
    <div style={{ padding: "28px 22px 0" }}>
      <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1.2, color: "#94a3b8" }}>
        {t.homeAltNewsKicker}
      </div>
      <div style={{ marginTop: 14, borderTop: "1px solid rgba(15,23,42,0.18)" }}>
        {displayArticles.map((article) => (
          <Link key={article.id} href={`/berita/${article.id}`} style={{
            padding: "14px 0",
            borderBottom: "1px solid rgba(15,23,42,0.08)",
            display: "flex", gap: 12, alignItems: "flex-start",
            textDecoration: "none", color: "inherit",
            touchAction: "manipulation",
            WebkitTapHighlightColor: "transparent",
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 9.5, fontWeight: 800,
                color: "var(--tk-accent, #c47a14)", letterSpacing: 0.7,
              }}>
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
        ))}
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
export default function HomeAltPage() {
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
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
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
