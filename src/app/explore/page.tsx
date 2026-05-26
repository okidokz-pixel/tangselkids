"use client";
import { useEffect, useRef, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { type Place } from "@/lib/mockData";
import { fetchPlacesPreview, searchAllPlaces } from "@/lib/db";
import { PlaceCard } from "@/components/PlaceCard";
import { SkeletonList } from "@/components/SkeletonCard";
import { BottomNav } from "@/components/BottomNav";
import { useLang } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { ActionButton } from "@/components/ActionButton";
import { PremiumBadge } from "@/components/PremiumBadge";

// ── Category config ───────────────────────────────────────────────────────────
type CatConfig = {
  id: Place["category"];
  labelId: string;
  labelEn: string;
  emoji: string;
  href: string;
};

// Tempat Kursus is 2nd, no emojis in pills
const CATS: CatConfig[] = [
  { id: "school",          labelId: "Sekolah",        labelEn: "Schools",          emoji: "🏫", href: "/schools?view=results" },
  { id: "learning-center", labelId: "Tempat Kursus",  labelEn: "Learning Centers", emoji: "📚", href: "/learning-centers?view=results" },
  { id: "daycare",         labelId: "Daycare",         labelEn: "Daycares",         emoji: "🍼", href: "/daycare?view=results" },
  { id: "playground",      labelId: "Playground",      labelEn: "Playgrounds",      emoji: "🎠", href: "/playgrounds?view=results" },
  { id: "clinic",          labelId: "Klinik",          labelEn: "Clinics",          emoji: "🏥", href: "/clinics?view=results" },
  { id: "cafe",            labelId: "Kafe Ramah Anak", labelEn: "Family Cafes",     emoji: "☕", href: "/cafes?view=results" },
  { id: "swimming-pool",   labelId: "Kolam Renang",    labelEn: "Swimming Pools",   emoji: "🏊", href: "/swimming-pools?view=results" },
  { id: "bookstore",       labelId: "Toko Buku",       labelEn: "Bookstores",       emoji: "📖", href: "/bookstores?view=results" },
  { id: "mini-zoo",        labelId: "Mini Zoo",        labelEn: "Mini Zoo",         emoji: "🦁", href: "/mini-zoo?view=results" },
];

// ── Explore page ──────────────────────────────────────────────────────────────
function ExplorePageInner() {
  const { lang } = useLang();
  const { tier } = useAuth();
  const tabsRef  = useRef<HTMLDivElement>(null);
  const [canScrollL, setCanScrollL] = useState(false);
  const [canScrollR, setCanScrollR] = useState(true);

  const searchParams = useSearchParams();
  const [allPlaces,    setAllPlaces]    = useState<Place[]>([]);
  const [search,       setSearch]       = useState(() => searchParams.get("q") ?? "");
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [searching,    setSearching]    = useState(false);
  const [offset,       setOffset]       = useState(6);
  const [loadingMore,  setLoadingMore]  = useState(false);
  const [hasMore,      setHasMore]      = useState(true);

  function shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Initial load — 6 per category
  useEffect(() => {
    Promise.all(CATS.map((c) => fetchPlacesPreview(c.id, 6, 0)))
      .then((results) => setAllPlaces(shuffle(results.flat())));
  }, []);

  async function loadMore() {
    setLoadingMore(true);
    const results = await Promise.all(CATS.map((c) => fetchPlacesPreview(c.id, 6, offset)));
    const batch = shuffle(results.flat());
    if (batch.length === 0) setHasMore(false);
    else {
      setAllPlaces((prev) => [...prev, ...batch]);
      setOffset((o) => o + 6);
    }
    setLoadingMore(false);
  }

  // Track scroll arrows
  function updateArrows() {
    const el = tabsRef.current;
    if (!el) return;
    setCanScrollL(el.scrollLeft > 4);
    setCanScrollR(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }
  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => { el.removeEventListener("scroll", updateArrows); window.removeEventListener("resize", updateArrows); };
  }, []);

  function scrollTabs(dir: "l" | "r") {
    tabsRef.current?.scrollBy({ left: dir === "r" ? 160 : -160, behavior: "smooth" });
  }

  // Debounced live search against Supabase
  useEffect(() => {
    const q = search.trim();
    if (!q) { setSearchResults([]); setSearching(false); return; }
    setSearching(true);
    const timer = setTimeout(() => {
      searchAllPlaces(q).then((res) => {
        setSearchResults(res);
        setSearching(false);
      });
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const searchLow = search.trim();
  const displayPlaces = searchLow ? searchResults : allPlaces;

  return (
    <div style={{ maxWidth: 448, margin: "0 auto", minHeight: "100vh", paddingBottom: 80 }}>

      {/* ── Green sticky header ───────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(160deg, #0a2018 0%, #1f6b43 60%, #2e8a5a 100%)",
        borderRadius: "0 0 32px 32px",
        position: "sticky", top: 0, zIndex: 40,
      }}>
        <div style={{ padding: "28px 20px 14px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <p className="text-[#a8d5ba] text-xs font-jakarta font-semibold tracking-widest uppercase" style={{ margin: 0 }}>
              TangselKids
            </p>
            <PremiumBadge />
          </div>
          <h1 className="text-white text-3xl font-bold leading-tight mt-0.5"
              style={{ fontFamily: "var(--font-fraunces), Georgia, serif", margin: "2px 0 0" }}>
            {lang === "id" ? "Jelajahi" : "Explore"}
          </h1>
        </div>

        {/* ── Category tabs with scroll arrows ──────────────────────────── */}
        <style>{`
          @keyframes tab-nudge-r {
            0%, 60%, 100% { transform: translateX(0); }
            20%            { transform: translateX(4px); }
            40%            { transform: translateX(2px); }
          }
          @keyframes tab-nudge-l {
            0%, 60%, 100% { transform: translateX(0); }
            20%            { transform: translateX(-4px); }
            40%            { transform: translateX(-2px); }
          }
          .tab-arrow-l { animation: tab-nudge-l 1.6s ease-in-out infinite; }
          .tab-arrow-r { animation: tab-nudge-r 1.6s ease-in-out infinite; }
        `}</style>
        <div style={{ position: "relative" }}>
          {/* Left arrow */}
          {canScrollL && (
            <ActionButton
              onClick={() => scrollTabs("l")}
              style={{
                position: "absolute", left: 8, top: "50%", zIndex: 2,
                width: 24, height: 24, borderRadius: 999,
                background: "#0e1d4f",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "2px solid rgba(255,255,255,0.7)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
                transform: "translateY(-50%)",
              }}
            >
              <span className="tab-arrow-l" style={{ display: "flex" }}>
                <ChevronLeft size={13} color="#fff" strokeWidth={3} />
              </span>
            </ActionButton>
          )}

          <div
            ref={tabsRef}
            style={{
              display: "flex", gap: 8,
              overflowX: "auto", scrollbarWidth: "none",
              padding: "0 16px",
            }}
          >
            {/* Semua — active */}
            <span style={{
              display: "inline-block", flexShrink: 0,
              padding: "6px 14px", borderRadius: 999,
              fontSize: 13, fontWeight: 700,
              background: "#fff", color: "#1f6b43",
              fontFamily: "var(--font-jakarta), sans-serif",
            }}>
              {lang === "id" ? "Semua" : "All"}
            </span>

            {/* Category pills — no emoji */}
            {CATS.map((c) => (
              <Link
                key={c.id}
                href={c.href}
                style={{
                  display: "inline-block", flexShrink: 0,
                  padding: "6px 14px", borderRadius: 999,
                  fontSize: 13, fontWeight: 600,
                  background: "rgba(255,255,255,0.15)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.2)",
                  fontFamily: "var(--font-jakarta), sans-serif",
                  textDecoration: "none",
                }}
              >
                {lang === "id" ? c.labelId : c.labelEn}
              </Link>
            ))}
          </div>

          {/* Right arrow */}
          {canScrollR && (
            <ActionButton
              onClick={() => scrollTabs("r")}
              style={{
                position: "absolute", right: 8, top: "50%", zIndex: 2,
                width: 24, height: 24, borderRadius: 999,
                background: "#0e1d4f",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "2px solid rgba(255,255,255,0.7)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
                transform: "translateY(-50%)",
              }}
            >
              <span className="tab-arrow-r" style={{ display: "flex" }}>
                <ChevronRight size={13} color="#fff" strokeWidth={3} />
              </span>
            </ActionButton>
          )}
        </div>

        {/* ── Search box ────────────────────────────────────────────────── */}
        <div style={{ padding: "14px 16px 16px" }}>
          <div style={{ position: "relative" }}>
            <Search
              size={15}
              color="rgba(255,255,255,0.55)"
              style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
            />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === "id" ? "Cari tempat..." : "Search places..."}
            style={{
              width: "100%", boxSizing: "border-box",
              padding: "9px 14px 9px 36px",
              borderRadius: 999, border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.15)",
              color: "#fff", fontSize: 13,
              fontFamily: "var(--font-jakarta), sans-serif",
              outline: "none",
            }}
          />
          </div>
        </div>
      </div>

      {/* ── Flat random feed ──────────────────────────────────────────────── */}
      <div style={{ padding: "16px 16px 0" }}>
        {/* Initial loading */}
        {allPlaces.length === 0 && !searchLow && <SkeletonList count={6} />}

        {/* Searching */}
        {searching && <SkeletonList count={4} />}

        {/* No results */}
        {!searching && searchLow && searchResults.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 14, color: "#94a3b8" }}>
              {lang === "id" ? "Tidak ada hasil untuk pencarian ini." : "No results found."}
            </p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {!searching && displayPlaces.map((place) => (
            <Link
              key={place.id}
              href={`/place/${place.slug ?? place.id}`}
              style={{ textDecoration: "none", color: "inherit", display: "block" }}
            >
              <PlaceCard place={place} />
            </Link>
          ))}
        </div>

        {/* Load more */}
        {!searchLow && !searching && hasMore && allPlaces.length > 0 && (
          <div style={{ padding: "20px 0 8px", display: "flex", justifyContent: "center" }}>
            <ActionButton
              onClick={loadMore}
              style={{
                padding: "11px 28px", borderRadius: 999,
                background: loadingMore ? "#e2e8f0" : "#0e1d4f",
                color: loadingMore ? "#94a3b8" : "#fff",
                fontFamily: "var(--font-jakarta), sans-serif",
                fontSize: 14, fontWeight: 700,
                border: "none",
              }}
            >
              {loadingMore
                ? (lang === "id" ? "Memuat..." : "Loading...")
                : (lang === "id" ? "Muat lebih banyak" : "Load more places")}
            </ActionButton>
          </div>
        )}
      </div>

      <BottomNav active="explore" />
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense>
      <ExplorePageInner />
    </Suspense>
  );
}
