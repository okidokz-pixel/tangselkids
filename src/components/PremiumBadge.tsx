"use client";
import { useAuth } from "@/context/AuthContext";

/**
 * Gold shimmer badge — renders "👑 PREMIUM" or "👑 LIFETIME" for premium users,
 * null for guest / free. Drop it anywhere inside a page header.
 */
export function PremiumBadge({ style }: { style?: React.CSSProperties }) {
  const { user, tier } = useAuth();
  if (tier !== "premium") return null;
  return (
    <div
      style={{
        position: "relative", overflow: "hidden",
        display: "inline-flex", alignItems: "center",
        background:
          "linear-gradient(135deg, #78350f 0%, #b45309 25%, #d97706 50%, #fbbf24 68%, #b45309 85%, #78350f 100%)",
        borderRadius: 999, padding: "3px 9px",
        boxShadow: "0 2px 8px rgba(217,119,6,0.55)",
        flexShrink: 0,
        ...style,
      }}
    >
      <span style={{
        fontSize: 10, fontWeight: 800, color: "#fff",
        letterSpacing: 1.1, fontFamily: "var(--font-jakarta), sans-serif",
        position: "relative", zIndex: 1,
      }}>
        {user?.lifetime ? "👑 LIFETIME" : "👑 PREMIUM"}
      </span>
      <div style={{
        position: "absolute", inset: 0,
        background:
          "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.32) 50%, transparent 65%)",
        animation: "gold-shimmer 2.8s ease-in-out infinite",
        pointerEvents: "none",
      }} />
    </div>
  );
}
