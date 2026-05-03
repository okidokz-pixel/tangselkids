"use client";
import { useState } from "react";
import Link from "next/link";
import { daycares, playgrounds, getAreaGroup } from "@/lib/mockData";
import { useLang } from "@/context/LanguageContext";
import { AreaToggle, type AreaFilter } from "@/components/AreaToggle";
import { PlaceCard } from "@/components/PlaceCard";

export default function DaycarePlaygroundsPage() {
  const { t } = useLang();
  const [activeTab,        setActiveTab]        = useState<"daycare" | "playground">("daycare");
  const [playgroundFilter, setPlaygroundFilter] = useState<"all" | "indoor" | "outdoor">("all");
  const [freeOnly,         setFreeOnly]         = useState(false);
  const [activeArea,       setActiveArea]       = useState<AreaFilter>("all");

  const filteredDaycares = daycares
    .filter((d) => activeArea === "all" || getAreaGroup(d.area) === activeArea);

  const filteredPlaygrounds = playgrounds
    .filter((p) => playgroundFilter === "all" || p.playgroundType === playgroundFilter)
    .filter((p) => !freeOnly || p.isFree)
    .filter((p) => activeArea === "all" || getAreaGroup(p.area) === activeArea);

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col pb-10">

      {/* Header */}
      <div
        className="px-5 pt-12 pb-5"
        style={{ background: "linear-gradient(160deg, #0a2018 0%, #1f6b43 60%, #2e8a5a 100%)", borderRadius: "0 0 32px 32px" }}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <Link href="/" className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white text-lg">‹</Link>
            <div>
              <h1 className="text-white text-2xl font-bold" style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}>{t.dpTitle}</h1>
              <p className="text-white/70 text-xs font-jakarta">{t.dpSubtitle}</p>
            </div>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-white/15 rounded-2xl p-1 gap-1">
          <button
            onClick={() => setActiveTab("daycare")}
            className="flex-1 py-2.5 rounded-xl text-sm font-jakarta font-bold transition-all flex items-center justify-center gap-2"
            style={activeTab === "daycare" ? { background: "white", color: "#0e1d4f" } : { color: "rgba(255,255,255,0.75)" }}
          >
            🧸 {t.dpDaycareTab}
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full"
              style={activeTab === "daycare" ? { background: "#e6f4ed", color: "#0e1d4f" } : { background: "rgba(255,255,255,0.2)", color: "white" }}
            >
              {daycares.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("playground")}
            className="flex-1 py-2.5 rounded-xl text-sm font-jakarta font-bold transition-all flex items-center justify-center gap-2"
            style={activeTab === "playground" ? { background: "white", color: "#0e1d4f" } : { color: "rgba(255,255,255,0.75)" }}
          >
            🎡 {t.dpPlaygroundTab}
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full"
              style={activeTab === "playground" ? { background: "#e6f4ed", color: "#0e1d4f" } : { background: "rgba(255,255,255,0.2)", color: "white" }}
            >
              {playgrounds.length}
            </span>
          </button>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">

        {/* Area toggle — shown on both tabs */}
        <AreaToggle value={activeArea} onChange={setActiveArea} />

        {/* ── DAYCARE ── */}
        {activeTab === "daycare" && (
          <>
            <p className="text-xs font-jakarta text-gray-400">{t.dpDaycareCount(filteredDaycares.length)}</p>
            <div className="space-y-2.5">
              {filteredDaycares.map((dc) => (
                <Link href={`/place/${dc.id}`} key={dc.id} style={{ textDecoration: "none", display: "block" }}>
                  <PlaceCard place={dc} />
                </Link>
              ))}
            </div>
          </>
        )}

        {/* ── PLAYGROUNDS ── */}
        {activeTab === "playground" && (
          <>
            <div className="flex gap-2 flex-wrap">
              {(["all", "indoor", "outdoor"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setPlaygroundFilter(f)}
                  className="px-3 py-1.5 rounded-full text-xs font-jakarta font-semibold border transition-all"
                  style={
                    playgroundFilter === f
                      ? { background: "#2e8a5a", color: "white", borderColor: "#2e8a5a" }
                      : { background: "white", color: "#6B7280", borderColor: "#E5E7EB" }
                  }
                >
                  {f === "all" ? t.dpAll : f === "indoor" ? t.dpIndoorBadge : t.dpOutdoorBadge}
                </button>
              ))}
              <button
                onClick={() => setFreeOnly(!freeOnly)}
                className="ml-auto px-3 py-1.5 rounded-full text-xs font-jakarta font-semibold border transition-all"
                style={freeOnly ? { background: "#2e8a5a", color: "white", borderColor: "#2e8a5a" } : { background: "white", color: "#6B7280", borderColor: "#E5E7EB" }}
              >
                {t.dpFreeOnly}
              </button>
            </div>

            <p className="text-xs font-jakarta text-gray-400">{t.dpPlaygroundFound(filteredPlaygrounds.length)}</p>

            <div className="space-y-2.5">
              {filteredPlaygrounds.length === 0 && (
                <div className="text-center py-12 text-gray-400 font-jakarta text-sm">{t.dpNoResults}</div>
              )}
              {filteredPlaygrounds.map((pg) => (
                <Link href={`/place/${pg.id}`} key={pg.id} style={{ textDecoration: "none", display: "block" }}>
                  <PlaceCard place={pg} />
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
