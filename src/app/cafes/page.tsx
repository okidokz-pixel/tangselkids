"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, SlidersHorizontal, ArrowUpDown, X } from "lucide-react";
import { placeMatchesAreas, type Place } from "@/lib/mockData";
import { fetchPlacesByCategory } from "@/lib/db";
import { useLang } from "@/context/LanguageContext";
import { BottomNav } from "@/components/BottomNav";
import { PlaceCard } from "@/components/PlaceCard";
import { ActionButton } from "@/components/ActionButton";
import { FilterGateSheet } from "@/components/FilterGateSheet";
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
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
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


const HEADER_STYLE = {
  background: "linear-gradient(160deg, #0a2018 0%, #1f6b43 60%, #2e8a5a 100%)",
  borderRadius: "0 0 28px 28px", padding: "44px 20px 22px",
};

function CafesContent() {
  const { t } = useLang();

  const BUDGET_OPTIONS = [
    { value: "all",          label: t.filterAll },
    { value: "<Rp50rb",      label: "< Rp 50 rb" },
    { value: "Rp50–100rb",   label: "Rp 50–100 rb" },
    { value: ">Rp100rb",     label: "> Rp 100 rb" },
  ];
  const [allPlaces, setAllPlaces] = useState<Place[]>([]);
  const [loading,   setLoading]   = useState(true);
  useEffect(() => { fetchPlacesByCategory("cafe").then(d => { setAllPlaces(d); setLoading(false); }); }, []);

  const [showFilterGate, setShowFilterGate] = useState(false);
  const router = useRouter();

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const view: "filter" | "results" =
    searchParams.get("view") === "results" ? "results" : "filter";

  const [area,   setArea]   = useState<"all"|"bintaro"|"bsd">((searchParams.get("area") as "all"|"bintaro"|"bsd") ?? "all");
  const [budget, setBudget] = useState(searchParams.get("budget") ?? "all");
  const [sortBy, setSortBy] = useState<"alpha"|"za">((searchParams.get("sort") as "alpha"|"za") ?? "alpha");

  const filtered = allPlaces
    .filter(c => area === "all" || placeMatchesAreas(c, [area]))
    .filter(c => budget === "all" || c.priceCategory === budget)
    .sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return sortBy === "za" ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name);
  });

  const activeCount = [area !== "all", budget !== "all"].filter(Boolean).length;
  function resetFilters() { setArea("all"); setBudget("all"); }

  function toResults() {
    const p = new URLSearchParams({ view: "results" });
    if (area !== "all") p.set("area", area);
    if (budget !== "all") p.set("budget", budget);
    if (sortBy !== "alpha") p.set("sort", sortBy);
    return `${pathname}?${p}`;
  }
  function toFilter() {
    const p = new URLSearchParams();
    if (area !== "all") p.set("area", area);
    if (budget !== "all") p.set("budget", budget);
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
                {t.catCafe}
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

          {/* Budget dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
              color: "#94a3b8", textTransform: "uppercase", flexShrink: 0, width: 96 }}>{t.filterBudget}</p>
            <div style={{ flex: 1 }}>
              <FilterDropdown value={budget} onChange={setBudget} options={BUDGET_OPTIONS} />
            </div>
          </div>

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
              {t.cafeShowResults(filtered.length)}
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
            <ActionButton onClick={() => router.replace(toFilter())} ariaLabel="Back" style={{
              width: 36, height: 36, borderRadius: 999, flexShrink: 0,
              background: "rgba(255,255,255,0.18)", display: "inline-flex",
              alignItems: "center", justifyContent: "center" }}>
              <ChevronLeft size={20} color="white" />
            </ActionButton>
            <div>
              <h1 style={{ margin: 0, fontFamily: "var(--font-fraunces),Georgia,serif",
                fontSize: 26, fontWeight: 600, letterSpacing: -0.5, lineHeight: 1, color: "#fff" }}>
                {t.catCafe}
              </h1>
              <p style={{ margin: "3px 0 0", color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
                {t.cafeShowResults(filtered.length)}
              </p>
            </div>
          </div>
          <PremiumBadge />
        </div>
      </div>

      {/* Filter / Sort bar */}
      <div style={{ display: "flex", gap: 10, margin: "12px 14px 0", alignItems: "center" }}>
        <ActionButton onClick={() => router.replace(toFilter())} style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "10px 16px", borderRadius: 999,
          background: "#0e1d4f", color: "#fff", fontWeight: 700, fontSize: 13.5, flexShrink: 0 }}>
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
          {budget !== "all" && <FTag label={BUDGET_OPTIONS.find(o => o.value === budget)?.label ?? budget} onRemove={() => setBudget("all")} />}
          <ActionButton onClick={resetFilters} style={{ fontSize: 12, fontWeight: 600, color: "#2e8a5a" }}>
            {t.filterClearAll}
          </ActionButton>
        </div>
      )}

      {/* Results */}
      <div style={{ padding: "12px 14px 0" }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8", fontSize: 13 }}>
            {loading ? "Memuat..." : t.exploreNoResults}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(place => (
            <Link key={place.id} href={`/place/${place.id}`} style={{ textDecoration: "none", display: "block" }}>
              <PlaceCard place={place} />
            </Link>
          ))}
        </div>
      </div>
      <FilterGateSheet isOpen={showFilterGate} onClose={() => setShowFilterGate(false)} />

      <BottomNav active="explore" />
    </div>
  );
}

export default function CafesPage() {
  return (
    <Suspense>
      <CafesContent />
    </Suspense>
  );
}
