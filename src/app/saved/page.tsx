"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Trash2 } from "lucide-react";
import { type Place } from "@/lib/mockData";
import { fetchPlacesByIds } from "@/lib/db";
import { useLang } from "@/context/LanguageContext";
import { BottomNav } from "@/components/BottomNav";
import { PremiumBadge } from "@/components/PremiumBadge";
import { PlaceCard } from "@/components/PlaceCard";
import { useAuth } from "@/context/AuthContext";

export default function SavedPage() {
  const { t } = useLang();
  const { loaded } = useAuth();
  const [savedIds,    setSavedIds]    = useState<string[]>([]);
  const [savedPlaces, setSavedPlaces] = useState<Place[]>([]);
  const [mounted,     setMounted]     = useState(false);

  useEffect(() => {
    const ids: string[] = JSON.parse(localStorage.getItem("savedIds") || "[]");
    setSavedIds(ids);
    setMounted(true);
    fetchPlacesByIds(ids).then(setSavedPlaces);
  }, []);

  function unsave(id: string) {
    const next = savedIds.filter((x) => x !== id);
    setSavedIds(next);
    setSavedPlaces(prev => prev.filter(p => p.id !== id));
    localStorage.setItem("savedIds", JSON.stringify(next));
  }

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col pb-28">

      {/* Header */}
      <div
        className="px-5 pt-7 pb-6"
        style={{
          background: "linear-gradient(160deg, #0a2018 0%, #1f6b43 60%, #2e8a5a 100%)",
          borderRadius: "0 0 32px 32px",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <p className="text-[#a8d5ba] text-xs font-jakarta font-semibold tracking-widest uppercase">TangselKids</p>
          <PremiumBadge />
        </div>
        <h1 className="text-white text-3xl font-bold leading-tight mt-0.5"
            style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}>
          {t.savedTitle}
        </h1>
        {mounted && savedPlaces.length > 0 && (
          <p className="text-white/60 text-xs font-jakarta mt-1">{t.savedCount(savedPlaces.length)}</p>
        )}
      </div>

      {/* Content */}
      {!mounted ? null : savedPlaces.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4">
          <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: "var(--tk-blue-50)" }}>
            <Heart size={40} style={{ color: "#a8d5ba" }} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-xl font-semibold" style={{ color: "var(--tk-ink)", fontFamily: "var(--font-fraunces), Georgia, serif" }}>
              {t.savedEmpty}
            </h2>
            <p className="font-jakarta text-sm mt-2 leading-relaxed" style={{ color: "var(--tk-muted)" }}>
              {t.savedEmptyDesc}
            </p>
          </div>
          <Link
            href="/explore"
            className="px-8 py-3 rounded-full text-white font-jakarta font-bold text-sm shadow-md mt-2"
            style={{ background: "linear-gradient(135deg, #1f6b43, #2e8a5a)" }}
          >
            {t.savedExplore}
          </Link>
        </div>
      ) : (
        <div className="flex-1 px-5 py-5 space-y-3">
          {savedPlaces.map((place) => (
            <div key={place.id}>
              <Link href={`/place/${place.id}`} style={{ textDecoration: "none", display: "block" }}>
                <PlaceCard place={place} />
              </Link>
              <div style={{ display: "flex", justifyContent: "flex-end", padding: "6px 4px 0" }}>
                <button
                  onClick={() => unsave(place.id)}
                  className="flex items-center gap-1.5 text-xs font-jakarta font-semibold text-red-400"
                >
                  <Trash2 size={13} />
                  {t.savedUnsave}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <BottomNav active="saved" />
    </div>
  );
}
