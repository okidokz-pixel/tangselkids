"use client";
import { MapPin, Star } from "lucide-react";
import { type Place, formatPriceRange, formatTicketPrice } from "@/lib/mockData";
import { useLang } from "@/context/LanguageContext";
import { OptimizedImage } from "@/components/OptimizedImage";
import { VerifiedBadge, VERIFIED_GREEN } from "@/components/VerifiedBadge";

export function PlaceCard({
  place,
  photoOverlay,
  selected,
  distanceKm,
}: {
  place: Place;
  photoOverlay?: React.ReactNode;
  selected?: boolean;
  distanceKm?: number | null;
}) {
  const { t } = useLang();
  const bottomRow = (() => {
    if (place.category === "school") return place.curriculum ?? place.curriculumCategory ?? null;
    if (place.category === "learning-center") return place.centerType ?? (place.courseTypes?.[0] ?? null);
    if (place.category === "bookstore") return null;
    if (place.category === "cafe") return null;
    if (place.category === "daycare") return place.priceKnown === false ? "—" : place.priceMin > 0 ? formatPriceRange(place.priceMin, place.priceMax) : t.free;
    return place.priceKnown === false ? "—" : place.priceMin === 0 ? t.free : formatTicketPrice(place.priceMin, place.priceMax);
  })();

  return (
    <div style={{
      display: "flex",
      background: "#fff",
      borderRadius: 18,
      border: place.isVerified ? `2px solid ${VERIFIED_GREEN}` : "1px solid var(--tk-line)",
      outline: selected ? "2.5px solid var(--tk-accent, #2e8a5a)" : undefined,
      outlineOffset: selected ? -1 : undefined,
      boxShadow: place.isVerified
        ? "0 1px 0 rgba(15,23,42,0.04), 0 6px 16px rgba(22,163,74,0.12)"
        : "0 1px 0 rgba(15,23,42,0.04), 0 6px 16px rgba(15,23,42,0.06)",
      overflow: "clip",
      minHeight: 96,
    }}>
      {/* Photo thumbnail */}
      <div style={{ width: 96, flexShrink: 0, alignSelf: "stretch", position: "relative", overflow: "hidden" }}>
        <OptimizedImage
          src={place.photo}
          alt={place.name}
          fill
          sizes="96px"
          style={{ objectFit: "cover", objectPosition: "center top", display: "block" }}
        />
        {place.isFeatured && (
          <div style={{
            position: "absolute", top: 6, left: 6,
            background: "rgba(0,0,0,0.55)",
            borderRadius: 999,
            padding: "3px 7px",
            fontSize: 9, fontWeight: 700,
            color: "#f6b545",
            letterSpacing: 0.3,
            fontFamily: "var(--font-jakarta), sans-serif",
            whiteSpace: "nowrap",
          }}>
            ✦ Featured
          </div>
        )}
        {place.isVerified && (
          <div style={{ position: "absolute", top: 6, right: 6 }}>
            <VerifiedBadge size="sm" label={false} />
          </div>
        )}
        {photoOverlay}
      </div>

      {/* Info column */}
      <div style={{
        flex: 1,
        padding: "10px 12px",
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        justifyContent: "center",
      }}>
        {/* Name row */}
        <p style={{
          margin: 0,
          fontSize: 16.5,
          fontWeight: 700,
          lineHeight: 1.3,
          letterSpacing: -0.3,
          color: "var(--tk-ink)",
          fontFamily: "var(--font-fraunces), Georgia, serif",
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}>
          {place.name}
        </p>

        {/* Area + optional distance inline */}
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <MapPin size={12} style={{ color: "var(--tk-muted)", flexShrink: 0 }} strokeWidth={2} />
          <span style={{
            fontSize: 13,
            color: "var(--tk-muted)",
            fontFamily: "var(--font-jakarta, sans-serif)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {place.locationDetail ?? place.area}
            {distanceKm != null && (
              <>
                <span style={{ margin: "0 4px", color: "var(--tk-line, #e2e8f0)" }}>|</span>
                <span style={{ color: "#16a34a", fontWeight: 600 }}>
                  {distanceKm < 0.1 ? "Di sini" : `${distanceKm < 10 ? distanceKm.toFixed(1) : Math.round(distanceKm)} km dari tempatmu`}
                </span>
              </>
            )}
          </span>
        </div>

        {place.category === "learning-center" ? (
          <>
            {/* Row 3 — Kursus (course type) */}
            {(place.courseTypes?.[0] ?? place.centerType) && (
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <span style={{ fontSize: 12, color: "var(--tk-muted)", fontFamily: "var(--font-jakarta, sans-serif)", flexShrink: 0 }}>
                  Kursus:
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--tk-ink)", fontFamily: "var(--font-jakarta, sans-serif)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {place.courseTypes?.[0] ?? place.centerType}
                </span>
              </div>
            )}
            {/* Row 4 — Biaya Bulanan */}
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <span style={{ fontSize: 12, color: "var(--tk-muted)", fontFamily: "var(--font-jakarta, sans-serif)", flexShrink: 0 }}>
                {t.pdMonthlyFee}:
              </span>
              <span style={{ fontSize: 12, fontWeight: 400, color: "var(--tk-ink)", fontFamily: "var(--font-jakarta, sans-serif)" }}>
                {place.priceKnown === false ? "—" : place.priceMin === 0 ? t.free : formatPriceRange(place.priceMin, place.priceMax)}
              </span>
            </div>
          </>
        ) : place.category === "school" && place.bahasa?.length ? (
          /* School — Bahasa Pengantar then Kurikulum */
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <span style={{ fontSize: 12, color: "var(--tk-muted)", fontFamily: "var(--font-jakarta, sans-serif)" }}>
                {t.cardLabelBahasa}:
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--tk-ink)", fontFamily: "var(--font-jakarta, sans-serif)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {place.bahasa.join(", ")}
              </span>
            </div>
            {bottomRow && (
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <span style={{ fontSize: 12, color: "var(--tk-muted)", fontFamily: "var(--font-jakarta, sans-serif)" }}>
                  {t.cardLabelKurikulum}:
                </span>
                <span style={{ fontSize: 12, fontWeight: 400, color: "var(--tk-ink)", fontFamily: "var(--font-jakarta, sans-serif)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {bottomRow}
                </span>
              </div>
            )}
          </>
        ) : place.category === "daycare" ? (
          /* Daycare — Usia then price */
          <>
            {place.daycareAgeGroups && place.daycareAgeGroups.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <span style={{ fontSize: 12, color: "var(--tk-muted)", fontFamily: "var(--font-jakarta, sans-serif)", flexShrink: 0 }}>
                  Usia:
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--tk-ink)", fontFamily: "var(--font-jakarta, sans-serif)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {place.daycareAgeGroups.join(", ")}
                </span>
              </div>
            )}
            {bottomRow && (
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <span style={{ fontSize: 12, color: "var(--tk-muted)", fontFamily: "var(--font-jakarta, sans-serif)", flexShrink: 0 }}>
                  Harga:
                </span>
                <span style={{ fontSize: 12, fontWeight: 400, color: "var(--tk-ink)", fontFamily: "var(--font-jakarta, sans-serif)" }}>
                  {bottomRow}
                </span>
              </div>
            )}
          </>
        ) : place.category === "playground" ? (
          /* Playground — Tipe then price */
          <>
            {(place.playgroundTypeRaw ?? place.playgroundType) && (
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <span style={{ fontSize: 12, color: "var(--tk-muted)", fontFamily: "var(--font-jakarta, sans-serif)", flexShrink: 0 }}>
                  Tipe:
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--tk-ink)", fontFamily: "var(--font-jakarta, sans-serif)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {place.playgroundTypeRaw ?? (place.playgroundType === "indoor" ? "Indoor" : "Outdoor")}
                </span>
              </div>
            )}
            {bottomRow && (
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <span style={{ fontSize: 12, color: "var(--tk-muted)", fontFamily: "var(--font-jakarta, sans-serif)", flexShrink: 0 }}>
                  Harga:
                </span>
                <span style={{ fontSize: 12, fontWeight: 400, color: "var(--tk-ink)", fontFamily: "var(--font-jakarta, sans-serif)" }}>
                  {bottomRow}
                </span>
              </div>
            )}
          </>
        ) : place.category === "clinic" ? (
          /* Clinic — Layanan then price */
          <>
            {place.clinicServices && place.clinicServices.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <span style={{ fontSize: 12, color: "var(--tk-muted)", fontFamily: "var(--font-jakarta, sans-serif)", flexShrink: 0 }}>
                  Layanan:
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--tk-ink)", fontFamily: "var(--font-jakarta, sans-serif)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {place.clinicServices.join(", ")}
                </span>
              </div>
            )}
            {bottomRow && (
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--tk-blue-700)", fontFamily: "var(--font-jakarta, sans-serif)" }}>
                {bottomRow}
              </p>
            )}
          </>
        ) : (
          /* All other categories — Google Rating then price */
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <span style={{ fontSize: 12, color: "var(--tk-muted)", fontFamily: "var(--font-jakarta, sans-serif)" }}>
                Google Ratings:
              </span>
              <Star size={12} fill="#f6b545" stroke="none" />
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--tk-ink)", fontFamily: "var(--font-jakarta, sans-serif)" }}>
                {place.rating}
              </span>
            </div>
            {bottomRow && (
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--tk-blue-700)", fontFamily: "var(--font-jakarta, sans-serif)" }}>
                {bottomRow}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
