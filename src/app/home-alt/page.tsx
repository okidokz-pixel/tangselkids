"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Home, Search, Bookmark, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { LangToggle } from "@/components/LangToggle";
import { places } from "@/lib/mockData";

// ─── Photo URLs (replace before launch — see README) ─────────────────────────
const P = {
  cover:   "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=900&q=80&auto=format&fit=crop",
  sekolah: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=700&q=80&auto=format&fit=crop",
  kursus:  "https://images.unsplash.com/photo-1588072432836-e10032774350?w=700&q=80&auto=format&fit=crop",
  art1:    "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&q=80&auto=format&fit=crop",
  art2:    "https://images.unsplash.com/photo-1588072432904-843af37f03ed?w=400&q=80&auto=format&fit=crop",
  art3:    "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=400&q=80&auto=format&fit=crop",
};

// ─── Types ────────────────────────────────────────────────────────────────────
type AreaKey     = "Bintaro" | "BSD" | "Semua";
type CategoryKey = "sekolah" | "kursus";

// ─── Data ────────────────────────────────────────────────────────────────────
const AREAS: { key: AreaKey; counts: Record<CategoryKey, number> }[] = [
  { key: "Bintaro", counts: { sekolah: 5, kursus: 4 } },
  { key: "BSD",     counts: { sekolah: 4, kursus: 2 } },
  { key: "Semua",   counts: { sekolah: 9, kursus: 6 } },
];

const AREA_MULT: Record<AreaKey, number> = { Bintaro: 1.0, BSD: 0.78, Semua: 1.7 };

const SCHOOL_LEVELS = [
  { label: "Preschool", sub: "2–4 thn",   dot: "#f59e0b", count: 2 },
  { label: "TK",        sub: "4–6 thn",   dot: "#ef6f6c", count: 3 },
  { label: "SD",        sub: "6–12 thn",  dot: "#1f9b6a", count: 5 },
  { label: "SMP",       sub: "12–15 thn", dot: "#3a64ee", count: 3 },
  { label: "SMA",       sub: "15–18 thn", dot: "#9c5a7a", count: 2 },
];

const KURSUS_AGES = [
  { label: "Bayi",        sub: "0–1 thn",  dot: "#f59e0b", count: 1 },
  { label: "Toddler",     sub: "1–3 thn",  dot: "#ef6f6c", count: 2 },
  { label: "Preschooler", sub: "3–6 thn",  dot: "#1f9b6a", count: 3 },
  { label: "Pre-Teen",    sub: "6–12 thn", dot: "#3a64ee", count: 4 },
  { label: "Teenager",    sub: "12+ thn",  dot: "#9c5a7a", count: 2 },
];

const ARTICLES = [
  { tag: "PARENTING", title: "5 Cara Mengajarkan Anak Mengelola Emosi",            meta: "3 Apr · 4 menit",  photo: P.art1 },
  { tag: "SEKOLAH",   title: "Sekolah Terbaik di Bintaro: Panduan Lengkap 2026",  meta: "20 Apr · 7 menit", photo: P.art2 },
  { tag: "AKTIVITAS", title: "Aktivitas Seru Akhir Pekan Bersama Anak di Tangsel", meta: "15 Apr · 5 menit", photo: P.art3 },
];

const INDEX_CATS = [
  { icon: "daycare",    name: "Daycares",                  count: "11 tempat",    href: "/daycare"        },
  { icon: "playground", name: "Playgrounds",               count: "8 tempat",     href: "/playgrounds"    },
  { icon: "clinic",     name: "Klinik Tumbuh Kembang",     count: "4 tempat",     href: "/clinics"        },
  { icon: "cafe",       name: "Kafe Ramah Anak",           count: "7 tempat",     href: "/cafes"          },
  { icon: "animals",    name: "Bermain Dengan Binatang",   count: "3 tempat",     href: "/mini-zoo"       },
  { icon: "pool",       name: "Kolam Renang",              count: "5 tempat",     href: "/swimming-pools" },
  { icon: "books",      name: "Toko Buku & Alat Tulis",   count: "2 tempat",     href: "/bookstores"     },
  { icon: "more",       name: "Lainnya",                  count: "+ 4 kategori", href: "/others"         },
];

const TYPE_WORDS = [
  "sekolah", "tempat kursus", "daycare", "playground",
  "Klinik Anak", "kafe ramah anak", "kolam renang",
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
// Custom 52×52 paper-square icon: tilted amber square, tape strip, sun rays,
// deep-blue star face with eyes + smile. See README component spec.
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
// Cream band: "Temukan " + italic dark cycling word + " yang tepat." + caret.
// Matches the prototype visual (home-v1-polished.jsx).
function Typewriter() {
  const [wordIdx, setWordIdx]   = useState(0);
  const [text, setText]         = useState("");
  const [phase, setPhase]       = useState<"typing" | "deleting">("typing");
  const [caretOn, setCaretOn]   = useState(true);

  // caret blink every 500ms
  useEffect(() => {
    const id = setInterval(() => setCaretOn((v) => !v), 500);
    return () => clearInterval(id);
  }, []);

  // typewriter state machine
  useEffect(() => {
    const word = TYPE_WORDS[wordIdx];
    let timer: ReturnType<typeof setTimeout>;
    if (phase === "typing") {
      if (text.length < word.length) {
        timer = setTimeout(() => setText(word.slice(0, text.length + 1)), 70);
      } else {
        // fully typed — pause 1300ms then start deleting
        timer = setTimeout(() => setPhase("deleting"), 1300);
      }
    } else {
      if (text.length > 0) {
        timer = setTimeout(() => setText(word.slice(0, text.length - 1)), 40);
      } else {
        // fully deleted — pause 260ms then advance to next word
        timer = setTimeout(() => {
          setWordIdx((i) => (i + 1) % TYPE_WORDS.length);
          setPhase("typing");
        }, 260);
      }
    }
    return () => clearTimeout(timer);
  }, [text, phase, wordIdx]);

  return (
    <div style={{
      marginTop: 12,
      background: "#fff7ec",
      borderTop: "1px solid rgba(15,23,42,0.1)",
      borderBottom: "1px solid rgba(15,23,42,0.1)",
      padding: "14px 22px",
      fontSize: 17,
      color: "#475569",
      lineHeight: 1.3,
      fontFamily: "var(--font-fraunces), Georgia, serif",
      fontWeight: 500,
    }}>
      Temukan{" "}
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
      {" "}yang tepat.
    </div>
  );
}

// ─── Ico ──────────────────────────────────────────────────────────────────────
// 24px-viewBox SVG line icons for the Indeks list.
// Paths verbatim from design handoff home-v1-polished.jsx Ico object.
const Ico: Record<string, React.ReactNode> = {
  daycare: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 20V8"/>
      <path d="M5 8l11-3"/>
      <path d="M16 5v8c0 3-2 5-5 5H7"/>
      <path d="M3 20h18"/>
      <path d="M5 11h-2M5 14h-2M5 17h-2"/>
    </svg>
  ),
  clinic: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 4v6a4 4 0 008 0V4"/>
      <path d="M3 4h3M10 4h3"/>
      <path d="M9 14v2a4 4 0 008 0v-2"/>
      <circle cx="17" cy="18" r="2"/>
    </svg>
  ),
  cafe: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 4c-.5 1 .5 1.5 0 2.5M13 4c-.5 1 .5 1.5 0 2.5"/>
      <path d="M5 10h12v5a4 4 0 01-4 4H9a4 4 0 01-4-4v-5z"/>
      <path d="M17 12h2a2 2 0 010 4h-2"/>
    </svg>
  ),
  animals: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="6" cy="9" rx="1.6" ry="2.2"/>
      <ellipse cx="10" cy="6" rx="1.6" ry="2.2"/>
      <ellipse cx="14" cy="6" rx="1.6" ry="2.2"/>
      <ellipse cx="18" cy="9" rx="1.6" ry="2.2"/>
      <path d="M12 11c-3 0-5 2.5-5 5 0 1.5 1 2.5 2.5 2.5 1 0 1.5-.5 2.5-.5s1.5.5 2.5.5c1.5 0 2.5-1 2.5-2.5 0-2.5-2-5-5-5z"/>
    </svg>
  ),
  pool: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 10c2 0 2-1.5 5-1.5s3 1.5 5 1.5 2-1.5 5-1.5 3 1.5 5 1.5"/>
      <path d="M2 15c2 0 2-1.5 5-1.5s3 1.5 5 1.5 2-1.5 5-1.5 3 1.5 5 1.5"/>
      <path d="M2 20c2 0 2-1.5 5-1.5s3 1.5 5 1.5 2-1.5 5-1.5 3 1.5 5 1.5"/>
    </svg>
  ),
  books: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 5h7a2 2 0 012 2v12a1.5 1.5 0 00-1.5-1.5H3V5z"/>
      <path d="M21 5h-7a2 2 0 00-2 2v12a1.5 1.5 0 011.5-1.5H21V5z"/>
    </svg>
  ),
  more: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6"  cy="12" r="1.4" fill="currentColor"/>
      <circle cx="12" cy="12" r="1.4" fill="currentColor"/>
      <circle cx="18" cy="12" r="1.4" fill="currentColor"/>
    </svg>
  ),
};

// ─── StickyHeader ─────────────────────────────────────────────────────────────
// Wordmark only — no location pill. Not tappable → backdrop-filter is safe.
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
      borderBottom: "1px solid rgba(15,23,42,0.1)",
      padding: "50px 22px 10px",
      display: "flex", alignItems: "center",
    }}>
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
  );
}

// ─── Masthead ─────────────────────────────────────────────────────────────────
// 3-col top row: Logo | wordmark stack | avatar + LangToggle
// Followed immediately by the full-bleed Typewriter band.
function Masthead({ userInitial }: { userInitial: string }) {
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

          {/* right: avatar pill + lang toggle */}
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: 6, flexShrink: 0,
          }}>
            <Link href="/profile" style={{
              width: 26, height: 26, borderRadius: 999, background: "#0e1d4f",
              color: "#fff", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 11, fontWeight: 700,
              textDecoration: "none",
              fontFamily: "var(--font-jakarta), sans-serif",
              touchAction: "manipulation",
            }}>
              {userInitial}
            </Link>
            <LangToggle variant="dark" />
          </div>
        </div>

        {/* tagline */}
        <div style={{
          marginTop: 14, fontSize: 12.5, lineHeight: 1.45,
          color: "#475569", maxWidth: 320,
        }}>
          Direktori cerdas untuk orang tua di{" "}
          <b style={{ color: "var(--tk-accent, #c47a14)", fontWeight: 700 }}>Bintaro</b> dan{" "}
          <b style={{ color: "var(--tk-accent, #c47a14)", fontWeight: 700 }}>BSD</b>.
        </div>
      </div>

      {/* full-bleed typewriter band — outside the padded div */}
      <Typewriter />
    </>
  );
}

// ─── FeatureSquare ────────────────────────────────────────────────────────────
// Photo card with content layer anchored to bottom. No badge, no number.
// Expanded card gets accent border + shadow, photo zooms, sub text expands.
function FeatureSquare({
  title, count, sub, photo, tone, accent, expanded, onToggle,
}: {
  title: string; count: string; sub: string;
  photo: string; tone: string; accent: string;
  expanded: boolean; onToggle: () => void;
}) {
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
          fontWeight: 700, fontSize: 24, letterSpacing: -0.5, lineHeight: 1,
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
              tempat
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
// Horizontal row of 3 area selector pills (Bintaro / BSD / Semua).
// Selected pill gets accent background.
function AreaPills({
  category, value, onPick,
}: {
  category: CategoryKey;
  value: AreaKey | null;
  onPick: (k: AreaKey) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{
        fontSize: 9.5, fontWeight: 800, letterSpacing: 1, color: "#94a3b8",
      }}>
        DI MANA?
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {AREAS.map((a) => {
          const active = value === a.key;
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
                fontSize: 14, fontWeight: 700, letterSpacing: -0.2,
                color: active ? "#fff" : "#0e1d4f",
                whiteSpace: "nowrap",
              }}>
                {a.key}
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
// Circular nav button on the left/right of the age-band rail.
// Uses a plain <button> (not Pressable) so we can combine translateY(-50%)
// with the press transform without conflicts. This is position:absolute inside
// a position:relative container (not fixed), so iOS transform rule does not apply.
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
        marginTop: -4, /* compensate for 8px rail padding-bottom */
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

// ─── AgeBands ─────────────────────────────────────────────────────────────────
// Horizontally-scrollable rail of band pills. Edge-fades + arrow nudgers.
// count per band = max(1, round(baseCount × areaMultiplier))
function AgeBands({
  category, area,
}: {
  category: CategoryKey;
  area: AreaKey;
}) {
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

  const mult = AREA_MULT[area] ?? 1;
  const data = category === "sekolah" ? SCHOOL_LEVELS : KURSUS_AGES;
  const eyebrow = category === "sekolah" ? "JENJANG SEKOLAH" : "UNTUK USIA BERAPA?";

  return (
    <div style={{ position: "relative" }}>
      <div style={{
        fontSize: 9.5, fontWeight: 800, letterSpacing: 1,
        color: "#94a3b8", marginBottom: 8,
      }}>
        {eyebrow}
      </div>
      <div style={{ position: "relative" }}>
        {/* scrollable rail — negative margin makes it full-bleed */}
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
          {data.map((b) => {
            const n = Math.max(1, Math.round(b.count * mult));
            return (
              <Pressable
                key={b.label}
                scale={0.94}
                style={{
                  flexShrink: 0,
                  display: "flex", flexDirection: "column", gap: 4,
                  padding: "11px 14px",
                  borderRadius: 12,
                  border: "1px solid rgba(15,23,42,0.14)",
                  background: "#fff",
                  minWidth: 96,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: 999,
                    background: b.dot,
                    boxShadow: `0 0 0 3px ${b.dot}22`,
                    flexShrink: 0,
                  }} />
                  <span style={{
                    fontFamily: "var(--font-fraunces), Georgia, serif",
                    fontSize: 14, fontWeight: 700, color: "#0e1d4f",
                    letterSpacing: -0.2, whiteSpace: "nowrap",
                  }}>
                    {b.label}
                  </span>
                </div>
                <div style={{
                  fontSize: 10, color: "#94a3b8", fontWeight: 500, whiteSpace: "nowrap",
                }}>
                  {b.sub} · <b style={{ color: "#475569", fontWeight: 700 }}>{n}</b> tempat
                </div>
              </Pressable>
            );
          })}
        </div>

        {/* edge fade — left. Warm cream bg to match page background. */}
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
// Two feature cards + two-tier peek-sheet (tier 1: area pills, tier 2: age bands).
// Tap card → show area pills. Pick area → show age bands below.
function FeaturePair() {
  const [open, setOpen]   = useState<CategoryKey | null>(null);
  const [area, setArea]   = useState<AreaKey | null>(null);

  const toggleCard = (k: CategoryKey) => {
    if (open === k) {
      setOpen(null);
      setArea(null);
    } else {
      setOpen(k);
      setArea(null); // reset area when switching cards
    }
  };

  return (
    <div style={{ padding: "28px 22px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.2, color: "#94a3b8" }}>
          FITUR UTAMA · KAMU CARI APA?
        </div>
        <Link href="/explore" style={{
          fontSize: 10, fontWeight: 700, color: "var(--tk-accent, #c47a14)",
          letterSpacing: 0.4, textDecoration: "none",
        }}>
          Lihat semua →
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
        <FeatureSquare
          title="Sekolah" count="9"
          sub="TK · SD · SMP · SMA — kurikulum nasional, internasional & alam."
          photo={P.sekolah}
          tone="linear-gradient(165deg,rgba(58,100,238,0.85) 0%,rgba(30,63,176,0.92) 100%)"
          accent="#f6b545"
          expanded={open === "sekolah"}
          onToggle={() => toggleCard("sekolah")}
        />
        <FeatureSquare
          title="Tempat Kursus" count="6"
          sub="English · Math · Art · Music · Coding — kelas privat & grup."
          photo={P.kursus}
          tone="linear-gradient(165deg,rgba(42,125,98,0.85) 0%,rgba(31,155,106,0.92) 100%)"
          accent="#7af0b6"
          expanded={open === "kursus"}
          onToggle={() => toggleCard("kursus")}
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
            onPick={(k) => setArea(k)}
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
        {open && area && <AgeBands category={open} area={area} />}
      </div>
    </div>
  );
}

// ─── IndexList ────────────────────────────────────────────────────────────────
// Icon-driven list of remaining categories (replaces previous numbered list).
function IndexList() {
  return (
    <div style={{ padding: "28px 22px 0" }}>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.2, color: "#94a3b8" }}>
        KATEGORI LAIN
      </div>
      <div style={{ marginTop: 12, borderTop: "1px solid rgba(15,23,42,0.18)" }}>
        {INDEX_CATS.map(({ icon, name, count, href }) => (
          <Link key={name} href={href} style={{
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
              fontSize: 16, fontWeight: 600, color: "#0e1d4f", letterSpacing: -0.3,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              minWidth: 0,
            }}>
              {name}
            </span>
            <span style={{ fontSize: 10.5, color: "#94a3b8", fontWeight: 600, flexShrink: 0 }}>
              {count}
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
  place, idx, saved, onToggleSave,
}: {
  place: { id: string; name: string; area: string; photo: string; rating: number; reviews: number };
  idx: number;
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
        <Link href={`/place/${place.id}`} style={{ display: "block", textDecoration: "none" }}>
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
  const featured = places.filter((p) => p.isFeatured).slice(0, 4);
  const cards = featured.length >= 4
    ? featured
    : [...featured, ...places.filter((p) => !p.isFeatured)].slice(0, 4);

  const [saved, setSaved] = useState<boolean[]>(cards.map(() => false));
  const toggle = (i: number) => setSaved((s) => s.map((v, j) => j === i ? !v : v));

  return (
    <div style={{ padding: "28px 22px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.2, color: "#94a3b8" }}>
          EDITOR&apos;S PICK · TEMPAT UNGGULAN
        </div>
        <Link href="/explore" style={{
          fontSize: 10, fontWeight: 700, color: "var(--tk-accent, #c47a14)",
          letterSpacing: 0.4, textDecoration: "none",
        }}>
          Lihat semua →
        </Link>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
        {cards.map((place, i) => (
          <CoverStoryCard
            key={place.id}
            place={place}
            idx={i}
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
  return (
    <div style={{ padding: "28px 22px 0" }}>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.2, color: "#94a3b8" }}>
        BERITA &amp; ARTIKEL
      </div>
      <div style={{ marginTop: 14, borderTop: "1px solid rgba(15,23,42,0.18)" }}>
        {ARTICLES.map(({ tag, title, meta, photo }) => (
          <Link key={title} href="/berita" style={{
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
                {tag}
              </div>
              <div style={{
                fontFamily: "var(--font-fraunces), Georgia, serif",
                fontSize: 16, fontWeight: 700, color: "#0e1d4f",
                letterSpacing: -0.2, marginTop: 4, lineHeight: 1.2,
              }}>
                {title}
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{meta}</div>
            </div>
            <img src={photo} alt="" style={{
              width: 72, height: 72, objectFit: "cover", borderRadius: 4,
              border: "1px solid rgba(15,23,42,0.08)", flexShrink: 0,
            }} />
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── DaftarCard ───────────────────────────────────────────────────────────────
function DaftarCard() {
  return (
    <div style={{ padding: "24px 22px 0" }}>
      <div style={{
        border: "1px solid rgba(15,23,42,0.18)", borderRadius: 4,
        padding: "18px 18px", display: "flex", alignItems: "center", gap: 14,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 9.5, fontWeight: 800, letterSpacing: 0.6, color: "#94a3b8",
          }}>
            UNTUK PEMILIK TEMPAT
          </div>
          <div style={{
            fontFamily: "var(--font-fraunces), Georgia, serif",
            fontWeight: 700, fontSize: 18, color: "#0e1d4f", marginTop: 4, letterSpacing: -0.2,
          }}>
            Daftarkan tempatmu.
          </div>
        </div>
        <Link href="/list-your-place" style={{
          background: "#0e1d4f", color: "#fff",
          padding: "10px 14px", borderRadius: 4, fontWeight: 700, fontSize: 12,
          textDecoration: "none", flexShrink: 0,
          touchAction: "manipulation",
          WebkitTapHighlightColor: "transparent",
        }}>
          Daftar →
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

// ─── TabBar ───────────────────────────────────────────────────────────────────
// Pinned at bottom via left/right — NO transform centering (iOS WebKit rule #1)
function TabBar() {
  const tabs = [
    { href: "/home-alt", label: "Beranda",   Icon: Home,     active: true  },
    { href: "/explore",  label: "Jelajah",   Icon: Search,   active: false },
    { href: "/saved",    label: "Tersimpan", Icon: Bookmark, active: false },
    { href: "/profile",  label: "Profil",    Icon: User,     active: false },
  ];
  return (
    <nav style={{
      position: "fixed",
      bottom: 14, left: 14, right: 14,
      margin: "0 auto", maxWidth: 420,
      background: "#fff", borderRadius: 28, padding: 6,
      border: "1px solid rgba(15,23,42,0.08)",
      boxShadow: "0 18px 40px rgba(15,23,42,0.12)",
      display: "flex", alignItems: "center",
      zIndex: 50,
    }}>
      {tabs.map(({ href, label, Icon, active }) => (
        <Link key={href} href={href} style={{
          flex: 1, padding: "8px 6px", textAlign: "center", borderRadius: 22,
          background: active ? "#0e1d4f" : "transparent",
          color: active ? "#fff" : "#64748b",
          fontSize: 11, fontWeight: 700,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
          textDecoration: "none",
          transition: "background .25s ease, color .25s ease",
          touchAction: "manipulation",
          WebkitTapHighlightColor: "transparent",
        }}>
          <Icon size={14} strokeWidth={active ? 2.5 : 2} />
          {label}
        </Link>
      ))}
    </nav>
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
    // CSS custom properties cascade through the DOM tree — fixed-position
    // children (StickyHeader, TabBar) inherit the variable from here.
    <div style={{ "--tk-accent": "#2e8a5a" } as React.CSSProperties}>
      <style>{`
        /* Entrance animation */
        @keyframes alt-home-enter {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .alt-home-content {
          animation: alt-home-enter 0.5s ease both;
        }
        /* Press ripple for Link rows */
        .alt-press-row { transition: opacity .12s ease; }
        .alt-press-row:active { opacity: 0.7; }
        /* Hide scrollbar on age-band rail */
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

      <TabBar />
    </div>
  );
}
