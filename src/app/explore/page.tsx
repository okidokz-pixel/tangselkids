"use client";
import { useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { places, getAreaGroup } from "@/lib/mockData";
import { useLang } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { PlaceCard } from "@/components/PlaceCard";
import { GuestGate } from "@/components/GuestGate";
import { type AreaFilter } from "@/components/AreaToggle";
import { BottomNav } from "@/components/BottomNav";

type Cat =
  | "all" | "school" | "learning-center" | "daycare" | "playground"
  | "clinic" | "cafe" | "mini-zoo" | "swimming-pool" | "bookstore";

export default function ExplorePage() {
  const { t } = useLang();
  const { tier } = useAuth();
  const [query, setQuery] = useState("");
  const [cat,   setCat]   = useState<Cat>("all");
  const [area,  setArea]  = useState<AreaFilter>("all");

  const categoryOptions: { value: Cat; label: string }[] = [
    { value: "all",             label: t.exploreAllCats       },
    { value: "school",          label: t.exploreSchools       },
    { value: "learning-center", label: t.exploreLCs           },
    { value: "daycare",         label: t.exploreDaycare       },
    { value: "playground",      label: t.explorePlaygrounds   },
    { value: "clinic",          label: t.exploreClinics       },
    { value: "cafe",            label: t.exploreCafes         },
    { value: "mini-zoo",        label: t.exploreMiniZoo       },
    { value: "swimming-pool",   label: t.exploreSwimmingPools },
    { value: "bookstore",       label: t.exploreBookstores    },
  ];

  const filtered = places
    .filter((p) => {
      const matchCat   = cat === "all" || p.category === cat;
      const matchArea  = area === "all" || getAreaGroup(p.area) === area;
      const q          = query.toLowerCase();
      const matchQuery = !q || p.name.toLowerCase().includes(q) || p.area.toLowerCase().includes(q);
      return matchCat && matchArea && matchQuery;
    })
    .sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return b.rating - a.rating;
    });

  const isGuest = tier === "guest";
  const visiblePlaces  = isGuest ? filtered.slice(0, 3) : filtered;
  const hiddenPlaces   = isGuest ? filtered.slice(3, 6)  : [];
  const hiddenCount    = isGuest ? Math.max(0, filtered.length - 3) : 0;

  const catActive = cat !== "all";

  return (
    <div style={{ maxWidth: 448, margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column", paddingBottom: 112 }}>

      {/* Header */}
      <div
        style={{
          padding: "48px 20px 20px",
          background: "linear-gradient(160deg, #0F1E3C 0%, #1A3A6C 60%, #2563EB 100%)",
          borderRadius: "0 0 32px 32px",
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <p style={{ color: "#93C5FD", fontSize: 11, fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>
            TangselKids
          </p>
          <h1 style={{ color: "#fff", fontSize: 30, fontWeight: 700, lineHeight: 1.1, margin: "4px 0 0", fontFamily: "var(--font-fraunces), Georgia, serif" }}>
            {t.exploreTitle}
          </h1>
        </div>

        {/* Search bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, borderRadius: 16, padding: "12px 16px", background: "#fff", boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}>
          <Search size={18} strokeWidth={2} style={{ color: "var(--tk-blue-700)", flexShrink: 0 }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.exploreSearch}
            style={{ flex: 1, fontSize: 14, color: "#374151", outline: "none", border: "none", background: "transparent", fontFamily: "var(--font-jakarta), sans-serif" }}
          />
          {query && (
            <button onClick={() => setQuery("")} style={{ color: "#9ca3af", background: "none", border: "none", cursor: "pointer", flexShrink: 0, display: "flex" }}>
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Filters + Results */}
      <div style={{ padding: "16px 20px 0", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* 1 — Area chips */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(["all", "bintaro", "bsd"] as AreaFilter[]).map((v) => {
            const label = v === "all" ? t.areaAll : v === "bintaro" ? t.areaBintaro : t.areaBSD;
            const active = area === v;
            return (
              <label key={v} style={{ cursor: "pointer", userSelect: "none", WebkitUserSelect: "none" }}>
                <input
                  type="radio"
                  name="explore-area"
                  value={v}
                  checked={active}
                  onChange={() => setArea(v)}
                  style={{ position: "absolute", width: 1, height: 1, opacity: 0, margin: -1, padding: 0, overflow: "hidden", clip: "rect(0,0,0,0)", border: 0 }}
                />
                <span style={{
                  display: "inline-block",
                  padding: "6px 16px",
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  fontFamily: "var(--font-jakarta), sans-serif",
                  transition: "all 0.15s",
                  border: active ? "2px solid #1d4ed8" : "2px solid #e2e8f0",
                  background: active ? "#1d4ed8" : "#fff",
                  color: active ? "#fff" : "#374151",
                }}>
                  {label}
                </span>
              </label>
            );
          })}
        </div>

        {/* 2 — Category dropdown (label + select on one line) */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <p style={{
            margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
            color: "#94a3b8", textTransform: "uppercase", flexShrink: 0, width: 96,
            fontFamily: "var(--font-jakarta), sans-serif",
          }}>
            {t.exploreCategory}
          </p>
          <div style={{ flex: 1, position: "relative" }}>
            <select
              value={cat}
              onChange={(e) => setCat(e.target.value as Cat)}
              style={{
                width: "100%",
                padding: "11px 40px 11px 14px",
                borderRadius: 12,
                fontSize: 13.5,
                fontFamily: "var(--font-jakarta), sans-serif",
                fontWeight: 600,
                color: catActive ? "#1e3a5f" : "#94a3b8",
                border: `2px solid ${catActive ? "#1d4ed8" : "#e2e8f0"}`,
                background: catActive ? "#eff6ff" : "#fff",
                outline: "none",
                appearance: "none",
                WebkitAppearance: "none",
                cursor: "pointer",
                boxSizing: "border-box",
              }}
            >
              {categoryOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <div style={{ position: "absolute", right: 12, top: 0, bottom: 0, display: "flex", alignItems: "center", pointerEvents: "none" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke={catActive ? "#1d4ed8" : "#94a3b8"} strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
        </div>

        {/* Results count */}
        <p style={{ margin: 0, fontSize: 12, color: "var(--tk-muted)", fontFamily: "var(--font-jakarta), sans-serif" }}>
          {t.exploreResults(filtered.length)}
        </p>

        {/* Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "64px 0" }}>
              <Search size={40} style={{ color: "var(--tk-line)", margin: "0 auto 12px" }} />
              <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 14, color: "var(--tk-muted)" }}>
                {t.exploreNoResults}
              </p>
            </div>
          )}
          {visiblePlaces.map((place) => (
            <Link key={place.id} href={`/place/${place.id}`} style={{ textDecoration: "none", display: "block" }}>
              <PlaceCard place={place} />
            </Link>
          ))}
        </div>

        {/* Guest blur gate */}
        {isGuest && hiddenCount > 0 && (
          <GuestGate hiddenCount={hiddenCount}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {hiddenPlaces.map((place) => (
                <div key={place.id}>
                  <PlaceCard place={place} />
                </div>
              ))}
            </div>
          </GuestGate>
        )}
      </div>

      <BottomNav active="explore" />
    </div>
  );
}
