"use client";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Scale } from "lucide-react";
import { formatPriceRange, formatPrice, haversineKm, type Place } from "@/lib/mockData";
import { fetchPlacesByIds } from "@/lib/db";
import { useLang } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@/context/LocationContext";
import { OptimizedImage } from "@/components/OptimizedImage";

// ── Shared fee formatter ──────────────────────────────────────────────────────
function fmtFee(min: number | undefined, max: number | undefined): string {
  if (min === undefined || min === 0) return "—";
  const lo = `Rp ${formatPrice(min)}`;
  return max && max !== min ? `${lo} – ${formatPrice(max)}` : lo;
}

// ── Schools getValue / isBest ─────────────────────────────────────────────────
function getSchoolValue(place: Place, key: string, distKm: number | null): string {
  if (key === "distance")    return distKm != null ? (distKm < 0.1 ? "Di sini" : `${distKm < 10 ? distKm.toFixed(1) : Math.round(distKm)} km`) : "—";
  if (key === "uangPangkal") return fmtFee(place.uangPangkalMin, place.uangPangkalMax);
  if (key === "priceRange")  return place.priceKnown === false ? "—" : formatPriceRange(place.priceMin, place.priceMax);
  if (key === "annualFee")   return fmtFee(place.annualFeeMin, place.annualFeeMax);
  if (key === "bahasa")      return place.teachingLanguageDisplay ?? place.bahasa?.join(", ") ?? "—";
  if (key === "curriculum")  return place.curriculum ?? "—";
  if (key === "area")        return place.area;
  return "—";
}

function isSchoolBest(list: Place[], key: string, index: number, distances: (number | null)[]): boolean {
  if (key === "distance") {
    const vals = distances.map(d => d ?? Infinity);
    const min = Math.min(...vals);
    return min < Infinity && vals[index] === min;
  }
  if (key === "uangPangkal") {
    const vals = list.map(p => p.uangPangkalMin ?? Infinity);
    const min = Math.min(...vals);
    return min < Infinity && vals[index] === min;
  }
  if (key === "priceRange") {
    const vals = list.map(p => p.priceMin);
    return vals[index] === Math.min(...vals);
  }
  if (key === "annualFee") {
    const vals = list.map(p => p.annualFeeMin ?? Infinity);
    const min = Math.min(...vals);
    return min < Infinity && vals[index] === min;
  }
  return false;
}

// ── LC getValue / isBest ──────────────────────────────────────────────────────
function getLcValue(place: Place, key: string, distKm: number | null): string {
  if (key === "courseType")    return place.courseTypes?.[0] ?? place.centerType ?? "—";
  if (key === "distance")      return distKm != null ? (distKm < 0.1 ? "Di sini" : `${distKm < 10 ? distKm.toFixed(1) : Math.round(distKm)} km`) : "—";
  if (key === "regFee")        return fmtFee(place.registrationFeeMin, place.registrationFeeMax);
  if (key === "monthlyFee")    return place.priceKnown === false ? "—" : place.priceMin === 0 ? "Gratis" : formatPriceRange(place.priceMin, place.priceMax);
  if (key === "ageRange")      return place.ageRange ?? "—";
  if (key === "teachingLang")  return place.teachingLanguage ?? place.teachingLanguageDisplay ?? "—";
  if (key === "teacherRatio")  return place.teacherStudentRatio ?? "—";
  return "—";
}

function isLcBest(list: Place[], key: string, index: number, distances: (number | null)[]): boolean {
  if (key === "distance") {
    const vals = distances.map(d => d ?? Infinity);
    const min = Math.min(...vals);
    return min < Infinity && vals[index] === min;
  }
  if (key === "regFee") {
    const vals = list.map(p => p.registrationFeeMin ?? Infinity);
    const min = Math.min(...vals);
    return min < Infinity && vals[index] === min;
  }
  if (key === "monthlyFee") {
    const vals = list.map(p => p.priceMin);
    return vals[index] === Math.min(...vals);
  }
  return false;
}

// ── Main content ──────────────────────────────────────────────────────────────
function CompareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t }  = useLang();
  const { loaded } = useAuth();
  const { userLat, userLng, locationStatus } = useLocation();

  const isLc = searchParams.get("type") === "lc";

  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  const schoolRows = [
    { label: t.lcCmpRowDistance,  key: "distance" },
    { label: t.cmpRowUangPangkal, key: "uangPangkal" },
    { label: t.cmpRowPrice,       key: "priceRange" },
    { label: t.cmpRowAnnualFee,   key: "annualFee" },
    { label: t.cmpRowBahasa,      key: "bahasa" },
    { label: t.cmpRowCurriculum,  key: "curriculum" },
    { label: t.cmpRowArea,        key: "area" },
  ];

  const lcRows = [
    { label: t.lcCmpRowCourseType,   key: "courseType" },
    { label: t.lcCmpRowDistance,     key: "distance" },
    { label: t.lcCmpRowRegFee,       key: "regFee" },
    { label: t.lcCmpRowMonthlyFee,   key: "monthlyFee" },
    { label: t.lcCmpRowAge,          key: "ageRange" },
    { label: t.lcCmpRowTeachingLang, key: "teachingLang" },
    { label: t.lcCmpRowTeacherRatio, key: "teacherRatio" },
  ];

  const rows = isLc ? lcRows : schoolRows;

  // Distances for each LC (computed from location context)
  const distances: (number | null)[] = places.map(p =>
    locationStatus === "granted" && userLat && userLng && p.lat && p.lng
      ? haversineKm(userLat, userLng, p.lat, p.lng)
      : null
  );

  useEffect(() => {
    const storageKey = isLc ? "compareLcIds" : "compareIds";
    const ids: string[] = JSON.parse(localStorage.getItem(storageKey) || "[]");
    fetchPlacesByIds(ids).then(all => {
      const category = isLc ? "learning-center" : "school";
      setPlaces(all.filter(p => p.category === category));
      setLoading(false);
    });
  }, [loaded, isLc]);

  const title    = isLc ? t.lcCmpTitle    : t.cmpTitle;
  const selected = isLc ? t.lcCmpSelected(places.length) : t.cmpSelected(places.length);
  const emptyMsg = isLc ? t.lcCmpEmpty    : t.cmpEmpty;
  const emptyDesc = isLc ? t.lcCmpEmptyDesc : t.cmpEmptyDesc;
  const browseHref = isLc ? "/learning-centers" : "/schools";
  const browseLabel = isLc ? t.lcCmpBrowse : t.cmpBrowse;
  const backLabel  = isLc ? t.lcCmpBackTo  : t.cmpBackToSchools;

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
              <h1 className="text-white text-2xl font-bold" style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}>Bandingkan</h1>
              <p className="text-white/70 text-xs font-jakarta">{selected}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-5">

        {/* Skeleton while fetching */}
        {loaded && loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
            {/* Fake place headers */}
            <div style={{ display: "grid", gap: 8, gridTemplateColumns: "100px 1fr 1fr" }}>
              <div />
              {[0, 1].map(i => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "#e2e8f0" }} />
                  <div style={{ width: 60, height: 10, borderRadius: 6, background: "#e2e8f0" }} />
                </div>
              ))}
            </div>
            {/* Fake rows */}
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
              <div key={i} style={{ display: "grid", gap: 8, gridTemplateColumns: "100px 1fr 1fr" }}>
                <div style={{ height: 44, borderRadius: 12, background: "#f1f5f9" }} />
                <div style={{ height: 44, borderRadius: 12, background: "#f8fafc" }} />
                <div style={{ height: 44, borderRadius: 12, background: "#f8fafc" }} />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {loaded && !loading && places.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
            <Scale size={48} style={{ color: "#a7d4bc" }} strokeWidth={1.25} />
            <p className="text-xl font-semibold text-[#0e1d4f]" style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}>{emptyMsg}</p>
            <p className="font-jakarta text-gray-400 text-sm">{emptyDesc}</p>
            <Link href={browseHref} className="px-6 py-3 rounded-full text-white font-jakarta font-bold text-sm" style={{ background: "#2e8a5a" }}>
              {browseLabel}
            </Link>
          </div>
        )}

        {loaded && !loading && places.length > 0 && (
          <>
            {/* Place headers */}
            <div className="grid gap-2 mb-4" style={{ gridTemplateColumns: `100px repeat(${places.length}, 1fr)` }}>
              <div />
              {places.map(p => (
                <div key={p.id} className="flex flex-col items-center text-center gap-2">
                  <Link href={`/place/${p.slug ?? p.id}`} style={{ display: "block", width: "100%" }}>
                    <div style={{ position: "relative", width: "100%", aspectRatio: "4/3", borderRadius: 12, overflow: "hidden" }}>
                      <OptimizedImage src={p.photo} alt={p.name} fill sizes="(max-width: 480px) 40vw, 180px" style={{ objectFit: "cover", objectPosition: "center top", display: "block" }} />
                    </div>
                  </Link>
                  <Link href={`/place/${p.slug ?? p.id}`} className="font-jakarta font-semibold text-gray-800 text-xs leading-tight hover:underline">
                    {p.name}
                  </Link>
                </div>
              ))}
            </div>

            {/* Comparison rows */}
            <div className="space-y-2">
              {rows.map(row => (
                <div
                  key={row.key}
                  className="grid gap-2 rounded-2xl overflow-hidden"
                  style={{ gridTemplateColumns: `100px repeat(${places.length}, 1fr)` }}
                >
                  <div className="bg-gray-50 px-3 py-3 flex items-center rounded-l-2xl">
                    <span className="font-jakarta text-xs font-semibold text-gray-500">{row.label}</span>
                  </div>
                  {places.map((p, i) => {
                    const best = isLc
                      ? isLcBest(places, row.key, i, distances)
                      : isSchoolBest(places, row.key, i, distances);
                    const value = isLc
                      ? getLcValue(p, row.key, distances[i])
                      : getSchoolValue(p, row.key, distances[i]);
                    return (
                      <div
                        key={p.id}
                        className="px-2 py-3 flex items-center justify-center text-center rounded-r-2xl"
                        style={{
                          background: best ? "#e6f4ed" : "white",
                          border: best ? "1.5px solid #3aab74" : "1.5px solid #F3F4F6",
                        }}
                      >
                        <span className="font-jakarta text-xs font-semibold leading-tight" style={{ color: best ? "#1f6b43" : "#374151" }}>
                          {value}
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

            <div className="mt-6">
              <button
                onClick={() => router.back()}
                className="w-full py-3.5 rounded-2xl font-jakarta font-bold text-white text-sm"
                style={{ background: "linear-gradient(135deg, #1f6b43, #2e8a5a)" }}
              >
                {backLabel}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense>
      <CompareContent />
    </Suspense>
  );
}
