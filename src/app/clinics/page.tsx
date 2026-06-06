"use client";
import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, SlidersHorizontal, ArrowUpDown, X, Scale } from "lucide-react";
import { placeMatchesAreas, haversineKm, type Place } from "@/lib/mockData";
import { fetchPlacesByCategory } from "@/lib/db";
import { useLocation } from "@/context/LocationContext";
import { useLang } from "@/context/LanguageContext";
import { BottomNav } from "@/components/BottomNav";
import { PlaceCard } from "@/components/PlaceCard";
import { ActionButton } from "@/components/ActionButton";
import { SkeletonList } from "@/components/SkeletonCard";
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

const SERVICES = [
  "Terapi Wicara","Terapi Okupasi","Fisioterapi",
  "Sensori Integrasi (SI)","Psikologi Anak","Perilaku / ABA",
];

const HEADER_STYLE = {
  background: "linear-gradient(160deg, #0a2018 0%, #1f6b43 60%, #2e8a5a 100%)",
  borderRadius: "0 0 28px 28px", padding: "44px 20px 22px",
};

function ClinicsContent() {
  const { t } = useLang();
  const { userLat, userLng, locationStatus, requestLocation } = useLocation();

  const svcLabel = (s: string) => ({
    "Terapi Wicara":          t.svcTerapiWicara,
    "Terapi Okupasi":         t.svcTerapiOkupasi,
    "Fisioterapi":            t.svcFisioterapi,
    "Sensori Integrasi (SI)": t.svcSensoriIntegrasi,
    "Psikologi Anak":         t.svcPsikologiAnak,
    "Perilaku / ABA":         t.svcPerilakuABA,
  }[s] ?? s);

  const SERVICE_OPTIONS = [
    { value: "all", label: t.filterAll },
    ...SERVICES.map(s => ({ value: s, label: svcLabel(s) })),
  ];
  const BIAYA_OPTIONS = [
    { value: "all",       label: t.filterAll },
    { value: "lt200",     label: "< Rp 200 rb" },
    { value: "200to400",  label: "Rp 200–400 rb" },
    { value: "400to600",  label: "Rp 400–600 rb" },
    { value: "gt600",     label: "> Rp 600 rb" },
  ];

  const [allPlaces,   setAllPlaces]   = useState<Place[]>([]);
  const [allFeatured, setAllFeatured] = useState<Place[]>([]);
  const [loading,     setLoading]     = useState(true);
  useEffect(() => {
    fetchPlacesByCategory("clinic").then(d => {
      setAllPlaces(d);
      setAllFeatured(d.filter(p => p.isFeatured));
      setLoading(false);
    });
  }, []);

  const router = useRouter();

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const view: "filter" | "results" =
    searchParams.get("view") === "results" ? "results" : "filter";

  const [area,    setArea]    = useState<"all"|"bintaro"|"bsd">((searchParams.get("area") as "all"|"bintaro"|"bsd") ?? "all");
  const [service, setService] = useState(searchParams.get("service") ?? "all");
  const [biaya,   setBiaya]   = useState(searchParams.get("biaya") ?? "all");
  const [sortBy,  setSortBy]  = useState<"alpha"|"za"|"random"|"nearest">((searchParams.get("sort") as "alpha"|"za"|"random"|"nearest") ?? "nearest");
  const [sortSeed]            = useState(() => Math.random());
  const [compareIds,  setCompareIds]  = useState<string[]>([]);
  const [compareMode, setCompareMode] = useState(false);

  useEffect(() => {
    if (sortBy === "nearest" && locationStatus === "idle") requestLocation();
  }, [sortBy, locationStatus, requestLocation]);

  function toggleCompare(id: string) {
    setCompareIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length >= 3 ? prev : [...prev, id]
    );
  }
  function toggleCompareMode() {
    setCompareMode(prev => { if (prev) setCompareIds([]); return !prev; });
  }
  function goCompare() {
    if (typeof window !== "undefined") localStorage.setItem("compareClinicIds", JSON.stringify(compareIds));
    window.location.href = "/compare?type=clinic";
  }

  function matchesBiaya(priceMin: number): boolean {
    if (biaya === "lt200")    return priceMin < 200_000;
    if (biaya === "200to400") return priceMin >= 200_000 && priceMin < 400_000;
    if (biaya === "400to600") return priceMin >= 400_000 && priceMin < 600_000;
    if (biaya === "gt600")    return priceMin >= 600_000;
    return true;
  }

  function applyFilters(list: Place[]) {
    return list
      .filter(c => area === "all" || placeMatchesAreas(c, [area]))
      .filter(c => service === "all" || c.clinicServices?.includes(service))
      .filter(c => matchesBiaya(c.priceMin));
  }

  const featuredSpot = useMemo(() => {
    const candidates = applyFilters(allFeatured);
    if (!candidates.length) return null;
    return candidates[Math.floor(sortSeed * candidates.length) % candidates.length];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allFeatured, area, service, biaya, sortSeed]);

  function sortList(list: Place[]) {
    return [...list].sort((a, b) => {
      if (sortBy === "za") return b.name.localeCompare(a.name);
      if (sortBy === "alpha") return a.name.localeCompare(b.name);
      if (sortBy === "nearest" && userLat && userLng) {
        const dA = (a.lat && a.lng) ? haversineKm(userLat, userLng, a.lat, a.lng) : 9999;
        const dB = (b.lat && b.lng) ? haversineKm(userLat, userLng, b.lat, b.lng) : 9999;
        return dA - dB;
      }
      const h = (id: string) => { let v = sortSeed; for (let i = 0; i < id.length; i++) v = Math.sin(v + id.charCodeAt(i)) * 10000; return v - Math.floor(v); };
      return h(a.id) - h(b.id);
    });
  }

  const filtered = sortList(applyFilters(allPlaces).filter(d => d.id !== featuredSpot?.id));

  const activeCount = [area !== "all", service !== "all", biaya !== "all"].filter(Boolean).length;
  function resetFilters() { setArea("all"); setService("all"); setBiaya("all"); }

  const totalCount = filtered.length + (featuredSpot ? 1 : 0);

  function toResults() {
    const p = new URLSearchParams({ view: "results" });
    if (area !== "all") p.set("area", area);
    if (service !== "all") p.set("service", service);
    if (biaya !== "all") p.set("biaya", biaya);
    if (sortBy !== "nearest") p.set("sort", sortBy);
    return `${pathname}?${p}`;
  }
  function toFilter() {
    const p = new URLSearchParams();
    if (area !== "all") p.set("area", area);
    if (service !== "all") p.set("service", service);
    if (biaya !== "all") p.set("biaya", biaya);
    if (sortBy !== "nearest") p.set("sort", sortBy);
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
                {t.catClinic}
              </h1>
            </div>
          </div>
        </div>

        <div style={{ padding: "16px 16px 130px", display: "flex", flexDirection: "column", gap: 10 }}>

          {/* Area */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "10px 14px", border: "1px solid #ede8df" }}>
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

          {/* Dropdowns */}
          {([
            { label: t.filterService, value: service, set: setService, opts: SERVICE_OPTIONS },
            { label: t.filterBiaya,   value: biaya,   set: setBiaya,   opts: BIAYA_OPTIONS },
          ] as const).map(({ label, value, set, opts }) => (
            <div key={String(label)} style={{ background: "#fff", borderRadius: 16, padding: "10px 14px", border: "1px solid #ede8df" }}>
              <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
                color: "#94a3b8", textTransform: "uppercase" }}>{label}</p>
              <FilterDropdown value={value} onChange={set as (v: string) => void} options={opts as { value: string; label: string }[]} />
            </div>
          ))}

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
              {t.clinicShowResults(totalCount)}
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
                {t.catClinic}
              </h1>
              <p style={{ margin: "3px 0 0", color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
                {t.clinicShowResults(totalCount)}
              </p>
            </div>
          </div>
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

        {/* Sort dropdown */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <select
            value={sortBy}
            onChange={(e) => {
              const v = e.target.value as typeof sortBy;
              setSortBy(v);
              if (v === "nearest" && locationStatus !== "granted") requestLocation();
            }}
            style={{
              padding: "10px 36px 10px 14px", borderRadius: 999, fontSize: 13.5,
              fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 600,
              color: "#16a34a", border: "1.5px solid #16a34a", background: "#e6f4ed",
              outline: "none", appearance: "none" as const, WebkitAppearance: "none" as const, cursor: "pointer",
            }}
          >
            <option value="random">Acak</option>
            <option value="alpha">Urut A–Z</option>
            <option value="za">Urut Z–A</option>
            <option value="nearest">{t.sortNearest}</option>
          </select>
          <div style={{ position: "absolute", right: 10, top: 0, bottom: 0,
            display: "flex", alignItems: "center", pointerEvents: "none" }}>
            <ArrowUpDown size={13} strokeWidth={2.5} color="#16a34a" />
          </div>
        </div>

        {/* Compare button */}
        <ActionButton onClick={toggleCompareMode} style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "10px 14px", borderRadius: 999, flexShrink: 0,
          background: compareMode ? "#2e8a5a" : "#fff",
          color: compareMode ? "#fff" : "#374151",
          fontWeight: 700, fontSize: 13,
          border: `1.5px solid ${compareMode ? "#2e8a5a" : "#e2e8f0"}` }}>
          {compareMode ? <X size={13} strokeWidth={2.5} /> : <Scale size={13} strokeWidth={2.5} />}
          {compareMode ? t.schoolsCompareCancelBtn : t.schoolsCompareModeBtn}
        </ActionButton>
      </div>

      {/* Compare hint */}
      {compareMode && totalCount > 0 && (
        <div style={{ padding: "8px 14px 0" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "9px 13px", borderRadius: 10,
            background: compareIds.length === 0 ? "#fef9c3" : "#e6f4ed",
            border: `1.5px solid ${compareIds.length === 0 ? "#fde68a" : "#a7d4bc"}`,
          }}>
            <Scale size={14} color={compareIds.length === 0 ? "#854d0e" : "#2e8a5a"} />
            <span style={{ fontSize: 12, fontWeight: 600,
              color: compareIds.length === 0 ? "#854d0e" : "#2e8a5a",
              fontFamily: "var(--font-jakarta), sans-serif" }}>
              {compareIds.length === 0 ? t.lcCmpHint : t.lcCmpSelectedFor(compareIds.length)}
            </span>
          </div>
        </div>
      )}

      {/* Active filter tags */}
      {activeCount > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "8px 14px 0", alignItems: "center" }}>
          {area !== "all" && <FTag label={area === "bintaro" ? "Bintaro" : "BSD"} onRemove={() => setArea("all")} />}
          {service !== "all" && <FTag label={`${t.filterService}: ${svcLabel(service)}`} onRemove={() => setService("all")} />}
          {biaya !== "all" && <FTag label={BIAYA_OPTIONS.find(o => o.value === biaya)?.label ?? biaya} onRemove={() => setBiaya("all")} />}
          <ActionButton onClick={resetFilters} style={{ fontSize: 12, fontWeight: 600, color: "#2e8a5a" }}>
            {t.filterClearAll}
          </ActionButton>
        </div>
      )}

      {/* Results */}
      <div style={{ padding: "12px 14px 0" }}>
        {loading && <SkeletonList count={6} />}

        {/* ✦ Featured */}
        {!loading && featuredSpot && (
          <div style={{
            marginBottom: 14, background: "#fef9c3",
            border: "1.5px dashed #f59e0b", padding: "8px 10px",
          }}>
            <span style={{
              display: "block", marginBottom: 7,
              fontSize: 10, fontWeight: 800, letterSpacing: 1.3,
              color: "#b45309", textTransform: "uppercase" as const,
              fontFamily: "var(--font-jakarta), sans-serif",
            }}>
              ✦ Featured
            </span>
            {compareMode ? (
              <ActionButton
                onClick={() => toggleCompare(featuredSpot.id)}
                style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", padding: 0 }}
              >
                <PlaceCard
                  place={featuredSpot}
                  selected={compareIds.includes(featuredSpot.id)}
                  distanceKm={
                    locationStatus === "granted" && userLat && userLng && featuredSpot.lat && featuredSpot.lng
                      ? haversineKm(userLat, userLng, featuredSpot.lat, featuredSpot.lng) : null
                  }
                />
              </ActionButton>
            ) : (
              <Link href={`/place/${featuredSpot.slug ?? featuredSpot.id}`} style={{ textDecoration: "none", display: "block" }}>
                <PlaceCard
                  place={featuredSpot}
                  distanceKm={
                    locationStatus === "granted" && userLat && userLng && featuredSpot.lat && featuredSpot.lng
                      ? haversineKm(userLat, userLng, featuredSpot.lat, featuredSpot.lng) : null
                  }
                />
              </Link>
            )}
          </div>
        )}

        {!loading && filtered.length === 0 && !featuredSpot && (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8", fontSize: 13 }}>
            {t.dpNoResults}
          </div>
        )}
        {!loading && filtered.length === 0 && featuredSpot && (
          <div style={{ textAlign: "center", padding: "12px 0 32px", color: "#94a3b8", fontSize: 13 }}>
            {t.dpNoResults}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(place => {
            const isSelected = compareIds.includes(place.id);
            return (
              <div key={place.id}>
                {compareMode ? (
                  <ActionButton
                    onClick={() => toggleCompare(place.id)}
                    style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", padding: 0 }}
                  >
                    <PlaceCard
                      place={place} selected={isSelected}
                      distanceKm={
                        locationStatus === "granted" && userLat && userLng && place.lat && place.lng
                          ? haversineKm(userLat, userLng, place.lat, place.lng) : null
                      }
                    />
                  </ActionButton>
                ) : (
                  <Link href={`/place/${place.slug ?? place.id}`} style={{ textDecoration: "none", display: "block" }}>
                    <PlaceCard
                      place={place}
                      distanceKm={
                        locationStatus === "granted" && userLat && userLng && place.lat && place.lng
                          ? haversineKm(userLat, userLng, place.lat, place.lng) : null
                      }
                    />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating compare button */}
      {compareIds.length >= 2 && (
        <div style={{ position: "fixed", bottom: 96, left: 14, right: 14, margin: "0 auto", maxWidth: 420, zIndex: 20 }}>
          <ActionButton onClick={goCompare} style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            width: "100%", padding: "16px 20px", borderRadius: 18,
            background: "linear-gradient(135deg,#1f6b43,#2e8a5a)", color: "#fff", fontWeight: 700, fontSize: 14,
            boxShadow: "0 8px 24px rgba(30,63,176,0.36)" }}>
            <Scale size={16} />{t.lcCmpBtn(compareIds.length)}
          </ActionButton>
        </div>
      )}

      <BottomNav active="explore" />
    </div>
  );
}

export default function ClinicsPage() {
  return (
    <Suspense>
      <ClinicsContent />
    </Suspense>
  );
}
