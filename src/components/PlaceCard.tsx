"use client";
import { MapPin, Star } from "lucide-react";
import { type Place, formatPriceRange } from "@/lib/mockData";

export function PlaceCard({
  place,
  photoOverlay,
  selected,
}: {
  place: Place;
  photoOverlay?: React.ReactNode;
  selected?: boolean;
}) {
  const isFree = place.priceMin === 0;

  return (
    <div style={{
      display: "flex",
      background: "#fff",
      borderRadius: 18,
      border: "1px solid var(--tk-line)",
      outline: selected ? "2.5px solid #1d4ed8" : undefined,
      outlineOffset: selected ? -1 : undefined,
      boxShadow: "0 1px 0 rgba(15,23,42,0.04), 0 6px 16px rgba(15,23,42,0.06)",
      overflow: "clip",
    }}>
      {/* Photo thumbnail */}
      <div style={{ width: 96, flexShrink: 0, alignSelf: "stretch", position: "relative" }}>
        <img
          src={place.photo}
          alt={place.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }}
        />
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
          <MapPin size={10} style={{ color: "var(--tk-muted)", flexShrink: 0 }} strokeWidth={2} />
          <span style={{
            fontSize: 11,
            color: "var(--tk-muted)",
            fontFamily: "var(--font-jakarta, sans-serif)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {place.area}
          </span>
        </div>

        {/* Rating */}
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Star size={11} fill="#f6b545" stroke="none" />
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--tk-ink)", fontFamily: "var(--font-jakarta, sans-serif)" }}>
            {place.rating}
          </span>
          <span style={{ fontSize: 10, color: "var(--tk-muted)", fontFamily: "var(--font-jakarta, sans-serif)" }}>
            ({place.reviews})
          </span>
        </div>

        {/* Price */}
        <p style={{
          margin: 0,
          fontSize: 12,
          fontWeight: 700,
          color: "var(--tk-blue-700)",
          fontFamily: "var(--font-jakarta, sans-serif)",
        }}>
          {isFree ? "Gratis" : formatPriceRange(place.priceMin, place.priceMax)}
        </p>
      </div>
    </div>
  );
}
