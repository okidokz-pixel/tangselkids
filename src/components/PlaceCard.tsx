"use client";
import { MapPin, Star } from "lucide-react";
import { type Place, formatPriceRange } from "@/lib/mockData";
import { useLang } from "@/context/LanguageContext";

export function PlaceCard({
  place,
  photoOverlay,
  selected,
}: {
  place: Place;
  photoOverlay?: React.ReactNode;
  selected?: boolean;
}) {
  const { t } = useLang();
  const bottomRow = (() => {
    if (place.category === "school") return place.curriculum ?? place.curriculumCategory ?? null;
    if (place.category === "learning-center") return place.centerType ?? (place.courseTypes?.[0] ?? null);
    if (place.category === "bookstore") return null;
    return place.priceMin === 0 ? "Gratis" : formatPriceRange(place.priceMin, place.priceMax);
  })();

  return (
    <div style={{
      display: "flex",
      background: "#fff",
      borderRadius: 18,
      border: "1px solid var(--tk-line)",
      outline: selected ? "2.5px solid var(--tk-accent, #2e8a5a)" : undefined,
      outlineOffset: selected ? -1 : undefined,
      boxShadow: "0 1px 0 rgba(15,23,42,0.04), 0 6px 16px rgba(15,23,42,0.06)",
      overflow: "clip",
      minHeight: 96,
    }}>
      {/* Photo thumbnail */}
      <div style={{ width: 96, flexShrink: 0, alignSelf: "stretch", position: "relative", overflow: "hidden" }}>
        <img
          src={place.photo}
          alt={place.name}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }}
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

        {/* Area */}
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
          </span>
        </div>

        {/* Rating or Bahasa Pengantar for schools */}
        {place.category === "school" && place.bahasa?.length ? (
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: 12, color: "var(--tk-muted)", fontFamily: "var(--font-jakarta, sans-serif)" }}>
              {t.cardLabelBahasa}:
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--tk-ink)", fontFamily: "var(--font-jakarta, sans-serif)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {place.bahasa.join(", ")}
            </span>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: 12, color: "var(--tk-muted)", fontFamily: "var(--font-jakarta, sans-serif)" }}>
              Google Ratings:
            </span>
            <Star size={12} fill="#f6b545" stroke="none" />
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--tk-ink)", fontFamily: "var(--font-jakarta, sans-serif)" }}>
              {place.rating}
            </span>
          </div>
        )}

        {/* Bottom info row */}
        {bottomRow && (
          place.category === "school" ? (
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <span style={{ fontSize: 12, color: "var(--tk-muted)", fontFamily: "var(--font-jakarta, sans-serif)" }}>
                {t.cardLabelKurikulum}:
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--tk-blue-700)", fontFamily: "var(--font-jakarta, sans-serif)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {bottomRow}
              </span>
            </div>
          ) : (
            <p style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 700,
              color: "var(--tk-blue-700)",
              fontFamily: "var(--font-jakarta, sans-serif)",
            }}>
              {bottomRow}
            </p>
          )
        )}
      </div>
    </div>
  );
}
