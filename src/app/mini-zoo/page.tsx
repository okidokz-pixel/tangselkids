"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, SlidersHorizontal, ArrowUpDown, X } from "lucide-react";
import { miniZoos, placeMatchesAreas } from "@/lib/mockData";
import { useLang } from "@/context/LanguageContext";
import { BottomNav } from "@/components/BottomNav";
import { PlaceCard } from "@/components/PlaceCard";
import { ActionButton } from "@/components/ActionButton";
import { GuestGate } from "@/components/GuestGate";
import { FilterGateSheet } from "@/components/FilterGateSheet";
import { useAuth } from "@/context/AuthContext";

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
        border: checked ? "2px solid #1d4ed8" : "2px solid #e2e8f0",
        background: checked ? "#1d4ed8" : "#fff", color: checked ? "#fff" : "#374151" }}>
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
          border: active ? "2px solid #1d4ed8" : "2px solid #e2e8f0",
          background: active ? "#eff6ff" : "#fff",
          color: active ? "#1d4ed8" : "#374151",
          cursor: "pointer", outline: "none",
        }}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <div style={{ position: "absolute", right: 12, top: 0, bottom: 0,
        display: "flex", alignItems: "center", pointerEvents: "none" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke={active ? "#1d4ed8" : "#94a3b8"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>
  );
}

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

const PRICE_LABELS: Record<string, string> = {
  all:     "Semua",
  gratis:  "Gratis",
  lt30:    "< Rp 30 rb",
  "30to70": "Rp 30–70 rb",
  gt70:    "> Rp 70 rb",
};

const HEADER_STYLE = {
  background: "linear-gradient(150deg,#1e3a5f 0%,#1d4ed8 55%,#3b82f6 100%)",
  borderRadius: "0 0 28px 28px", padding: "44px 20px 22px",
};

export default function MiniZooPage() {
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

  const [area,        setArea]        = useState<"all"|"bintaro"|"bsd">((searchParams.get("area") as "all"|"bintaro"|"bsd") ?? "all");
  const [priceBucket, setPriceBucket] = useState(searchParams.get("price") ?? "all");
  const [sortBy,      setSortBy]      = useState<"rating"|"price">((searchParams.get("sort") as "rating"|"price") ?? "rating");

  function matchesBucket(p: { priceMin: number; priceMax: number }): boolean {
    if (priceBucket === "gratis") return p.priceMin === 0 && p.priceMax === 0;
    if (priceBucket === "lt30")   return p.priceMax > 0 && p.priceMax < 30_000;
    if (priceBucket === "30to70") return p.priceMin >= 30_000 && p.priceMax <= 70_000;
    if (priceBucket === "gt70")   return p.priceMin > 70_000;
    return true;
  }

  const filtered = miniZoos
    .filter(p => area === "all" || placeMatchesAreas(p, [area]))
    .filter(p => matchesBucket(p))
    .sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return sortBy === "price" ? a.priceMin - b.priceMin : b.rating - a.rating;
  });

  const activeCount = [area !== "all", priceBucket !== "all"].filter(Boolean).length;
  function resetFilters() { setArea("all"); setPriceBucket("all"); }

  function toResults() {
    const p = new URLSearchParams({ view: "results" });
    if (area !== "all") p.set("area", area);
    if (priceBucket !== "all") p.set("price", priceBucket);
    if (sortBy !== "rating") p.set("sort", sortBy);
    return `${pathname}?${p}`;
  }
  function toFilter() {
    const p = new URLSearchParams();
    if (area !== "all") p.set("area", area);
    if (priceBucket !== "all") p.set("price", priceBucket);
    if (sortBy !== "rating") p.set("sort", sortBy);
    const qs = p.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

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
              {t.catMiniZoo}
            </h1>
          </div>
        </div>

        <div style={{ padding: "24px 20px 130px" }}>

          {/* Area chips */}
          <div style={{ marginBottom: 28 }}>
            <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
              color: "#94a3b8", textTransform: "uppercase" }}>Area</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {(["all","bintaro","bsd"] as const).map(v => (
                <Chip key={v} name="f-area" value={v} checked={area === v} onChange={() => setArea(v)}>
                  {v === "all" ? t.filterAll : v === "bintaro" ? "Bintaro" : "BSD"}
                </Chip>
              ))}
            </div>
          </div>

          {/* Harga Tiket dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
              color: "#94a3b8", textTransform: "uppercase", flexShrink: 0, width: 96 }}>Harga Tiket</p>
            <div style={{ flex: 1 }}>
              <FilterDropdown
                value={priceBucket}
                onChange={setPriceBucket}
                options={Object.entries(PRICE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
              />
            </div>
          </div>

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
              {tier === "guest" ? "Daftar untuk Lihat Semua" : t.zooShowResults(filtered.length)}
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
              {t.catMiniZoo}
            </h1>
            <p style={{ margin: "3px 0 0", color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
              {t.zooShowResults(filtered.length)}
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
          {area !== "all" && <FTag label={area === "bintaro" ? "Bintaro" : "BSD"} onRemove={() => setArea("all")} />}
          {priceBucket !== "all" && <FTag label={PRICE_LABELS[priceBucket]} onRemove={() => setPriceBucket("all")} />}
          <ActionButton onClick={resetFilters} style={{ fontSize: 12, fontWeight: 600, color: "#1d4ed8" }}>
            {t.filterClearAll}
          </ActionButton>
        </div>
      )}

      {/* Results */}
      <div style={{ padding: "12px 14px 0" }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8", fontSize: 13 }}>
            {t.exploreNoResults}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.slice(0, tier === "guest" ? 3 : undefined).map(place => (
            <Link key={place.id} href={`/place/${place.id}`} style={{ textDecoration: "none", display: "block" }}>
              <PlaceCard place={place} />
            </Link>
          ))}
        </div>
        {tier === "guest" && filtered.length > 3 && (
          <GuestGate hiddenCount={filtered.length - 3}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.slice(3, 6).map(place => (
                <div key={place.id}><PlaceCard place={place} /></div>
              ))}
            </div>
          </GuestGate>
        )}
      </div>
      <FilterGateSheet isOpen={showFilterGate} onClose={() => setShowFilterGate(false)} />

      <BottomNav active="explore" />
    </div>
  );
}
