"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Trash2 } from "lucide-react";
import { places } from "@/lib/mockData";
import { useLang } from "@/context/LanguageContext";
import { BottomNav } from "@/components/BottomNav";
import { PlaceCard } from "@/components/PlaceCard";
import { useAuth } from "@/context/AuthContext";
import { useRegisterSheet } from "@/context/RegisterSheetContext";

export default function SavedPage() {
  const { t } = useLang();
  const { tier, loaded } = useAuth();
  const router = useRouter();
  const { openRegisterSheet } = useRegisterSheet();
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const ids: string[] = JSON.parse(localStorage.getItem("savedIds") || "[]");
    setSavedIds(ids);
    setMounted(true);
  }, []);

  function unsave(id: string) {
    const next = savedIds.filter((x) => x !== id);
    setSavedIds(next);
    localStorage.setItem("savedIds", JSON.stringify(next));
  }

  const savedPlaces = places.filter((p) => savedIds.includes(p.id));

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col pb-28">

      {/* Header */}
      <div
        className="px-5 pt-12 pb-6"
        style={{
          background: "linear-gradient(160deg, #0F1E3C 0%, #1A3A6C 60%, #2563EB 100%)",
          borderRadius: "0 0 32px 32px",
        }}
      >
        <p className="text-[#93C5FD] text-xs font-jakarta font-semibold tracking-widest uppercase">TangselKids</p>
        <h1 className="text-white text-3xl font-bold leading-tight mt-0.5"
            style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}>
          {t.savedTitle}
        </h1>
        {mounted && savedPlaces.length > 0 && (
          <p className="text-white/60 text-xs font-jakarta mt-1">{t.savedCount(savedPlaces.length)}</p>
        )}
        {mounted && tier === "free" && (
          <p className="text-white/50 text-xs font-jakarta mt-0.5">
            {savedPlaces.length}/5 tersimpan · <span className="underline cursor-pointer" onClick={() => router.push("/upgrade")}>Upgrade untuk tanpa batas</span>
          </p>
        )}
      </div>

      {/* Content */}
      {!mounted ? null : (loaded && tier === "guest") ? (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4">
          <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: "#DBEAFE" }}>
            <Heart size={40} style={{ color: "#93C5FD" }} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-xl font-semibold" style={{ color: "#1e3a5f", fontFamily: "var(--font-fraunces), Georgia, serif" }}>
              Simpan Tempat Favoritmu
            </h2>
            <p className="font-jakarta text-sm mt-2 leading-relaxed text-gray-500">
              Daftar gratis untuk menyimpan dan mengakses tempat favoritmu kapan saja.
            </p>
          </div>
          <button
            onClick={() => openRegisterSheet()}
            className="px-8 py-3 rounded-full text-white font-jakarta font-bold text-sm shadow-md mt-2"
            style={{ background: "linear-gradient(135deg, #16a34a, #22c55e)" }}
          >
            Daftar GRATIS Sekarang!
          </button>
          <p className="font-jakarta text-xs text-gray-400">Gratis selamanya · Tanpa kartu kredit</p>
        </div>
      ) : savedPlaces.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4">
          <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: "var(--tk-blue-50)" }}>
            <Heart size={40} style={{ color: "#93C5FD" }} strokeWidth={1.5} />
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
            style={{ background: "linear-gradient(135deg, #1A3A6C, #2563EB)" }}
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
