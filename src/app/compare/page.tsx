"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Scale, GraduationCap, Lock } from "lucide-react";
import { places, formatPriceRange, type Place } from "@/lib/mockData";
import { useLang } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useRegisterSheet } from "@/context/RegisterSheetContext";
import { PremiumBadge } from "@/components/PremiumBadge";

function getValue(place: Place, key: string): string {
  if (key === "priceRange") return formatPriceRange(place.priceMin, place.priceMax);
  if (key === "rating")     return `${place.rating} / 5`;
  if (key === "curriculum") return place.curriculum ?? "—";
  if (key === "ageRange")   return place.ageRange;
  if (key === "hours")      return place.hours;
  if (key === "area")       return place.area;
  return "—";
}

function isBest(list: Place[], key: string, index: number): boolean {
  if (key === "priceRange") return places[index]?.priceMin === Math.min(...list.map((p) => p.priceMin));
  if (key === "rating")     return list[index]?.rating === Math.max(...list.map((p) => p.rating));
  return false;
}

export default function ComparePage() {
  const router = useRouter();
  const { t }  = useLang();
  const { tier, loaded } = useAuth();
  const { openRegisterSheet } = useRegisterSheet();
  const [compareSchools, setCompareSchools] = useState<Place[]>([]);

  const rows = [
    { label: t.cmpRowPrice,      key: "priceRange" },
    { label: t.cmpRowRating,     key: "rating" },
    { label: t.cmpRowCurriculum, key: "curriculum" },
    { label: t.cmpRowAge,        key: "ageRange" },
    { label: t.cmpRowHours,      key: "hours" },
    { label: t.cmpRowArea,       key: "area" },
  ];

  useEffect(() => {
    if (loaded && tier === "guest") {
      openRegisterSheet();
      return;
    }
    const ids: string[] = JSON.parse(localStorage.getItem("compareIds") || "[]");
    const found = ids
      .map((id) => places.find((p) => p.id === id))
      .filter((p): p is Place => !!p && p.category === "school");
    setCompareSchools(found);
  }, [loaded, tier, router]);

  function removeSchool(id: string) {
    const updated = compareSchools.filter((s) => s.id !== id);
    setCompareSchools(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("compareIds", JSON.stringify(updated.map((s) => s.id)));
    }
  }

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col">

      {/* Header */}
      <div
        className="px-5 pt-12 pb-6"
        style={{ background: "linear-gradient(135deg, #1f6b43 0%, #2e8a5a 60%, #3aab74 100%)", borderRadius: "0 0 32px 32px" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"
            >
              <ChevronLeft size={20} color="white" />
            </button>
            <div>
              <h1 className="text-white text-2xl font-bold" style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}>{t.cmpTitle}</h1>
              <p className="text-white/70 text-xs font-jakarta">{t.cmpSelected(compareSchools.length)}</p>
            </div>
          </div>
          <PremiumBadge />
        </div>
      </div>

      <div className="flex-1 px-4 py-5">

        {/* Free-user upgrade prompt */}
        {loaded && tier === "free" && (
          <div className="flex flex-col items-center justify-center gap-4 text-center py-8 px-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "#FEF3C7" }}>
              <Lock size={36} style={{ color: "#D97706" }} strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-semibold text-[#0e1d4f]" style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}>
              Fitur Khusus Premium
            </h2>
            <p className="font-jakarta text-gray-500 text-sm leading-relaxed">
              Bandingkan hingga 3 sekolah secara bersamaan — termasuk SPP, kurikulum, dan jenjang — dengan akun Premium.
            </p>
            <button
              onClick={() => router.push("/upgrade")}
              className="px-8 py-3 rounded-full text-white font-jakarta font-bold text-sm shadow-md"
              style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
            >
              Upgrade ke Premium · Rp 29.000/bln
            </button>
            <button
              onClick={() => router.back()}
              className="font-jakarta text-sm text-gray-400"
            >
              Kembali
            </button>
          </div>
        )}

        {/* Empty state */}
        {loaded && tier === "premium" && compareSchools.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
            <Scale size={48} style={{ color: "#a7d4bc" }} strokeWidth={1.25} />
            <p className="text-xl font-semibold text-[#0e1d4f]" style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}>{t.cmpEmpty}</p>
            <p className="font-jakarta text-gray-400 text-sm">{t.cmpEmptyDesc}</p>
            <Link
              href="/schools"
              className="px-6 py-3 rounded-full text-white font-jakarta font-bold text-sm"
              style={{ background: "#2e8a5a" }}
            >
              {t.cmpBrowse}
            </Link>
          </div>
        )}

        {loaded && tier === "premium" && compareSchools.length > 0 && (
          <>
            {/* School headers */}
            <div className="grid gap-2 mb-4" style={{ gridTemplateColumns: `100px repeat(${compareSchools.length}, 1fr)` }}>
              <div />
              {compareSchools.map((school) => (
                <div key={school.id} className="flex flex-col items-center text-center gap-1">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "#e6f4ed" }}>
                    <GraduationCap size={24} style={{ color: "#0e1d4f" }} strokeWidth={1.5} />
                  </div>
                  <p className="font-jakarta font-semibold text-gray-800 text-xs leading-tight">{school.name}</p>
                  <button onClick={() => removeSchool(school.id)} className="text-[10px] font-jakarta text-red-400">
                    {t.cmpRemove}
                  </button>
                </div>
              ))}
            </div>

            {/* Comparison rows */}
            <div className="space-y-2">
              {rows.map((row) => (
                <div
                  key={row.key}
                  className="grid gap-2 rounded-2xl overflow-hidden"
                  style={{ gridTemplateColumns: `100px repeat(${compareSchools.length}, 1fr)` }}
                >
                  <div className="bg-gray-50 px-3 py-3 flex items-center rounded-l-2xl">
                    <span className="font-jakarta text-xs font-semibold text-gray-500">{row.label}</span>
                  </div>
                  {compareSchools.map((school, i) => {
                    const best = isBest(compareSchools, row.key, i);
                    return (
                      <div
                        key={school.id}
                        className="px-2 py-3 flex items-center justify-center text-center rounded-r-2xl"
                        style={{
                          background: best ? "#e6f4ed" : "white",
                          border: best ? "1.5px solid #3aab74" : "1.5px solid #F3F4F6",
                        }}
                      >
                        <span className="font-jakarta text-xs font-semibold leading-tight" style={{ color: best ? "#1f6b43" : "#374151" }}>
                          {getValue(school, row.key)}
                          {best && (
                            <span className="block text-[9px] font-bold mt-0.5" style={{ color: "#3aab74" }}>
                              {t.cmpBest}
                            </span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Add another */}
            {compareSchools.length < 3 && (
              <Link href="/schools">
                <div className="mt-4 rounded-2xl p-4 flex items-center gap-3 border-2 border-dashed" style={{ borderColor: "#3aab74" }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: "#e6f4ed" }}>
                    ➕
                  </div>
                  <div>
                    <p className="font-jakarta font-semibold text-[#0e1d4f] text-sm">{t.cmpAddAnother}</p>
                    <p className="font-jakarta text-xs text-gray-400">{t.cmpAddAnotherDesc}</p>
                  </div>
                </div>
              </Link>
            )}

            <div className="mt-6">
              <Link href="/schools">
                <button
                  className="w-full py-3.5 rounded-2xl font-jakarta font-bold text-white text-sm"
                  style={{ background: "linear-gradient(135deg, #1f6b43, #2e8a5a)" }}
                >
                  {t.cmpBackToSchools}
                </button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
