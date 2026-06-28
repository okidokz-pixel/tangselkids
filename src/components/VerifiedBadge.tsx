"use client";
import { BadgeCheck } from "lucide-react";

/** Verified visual language — reused everywhere so it reads as one program. */
export const VERIFIED_BLUE  = "#2563eb"; // the "blue check" trust color
export const VERIFIED_GREEN = "#16a34a"; // card border / accent

/**
 * The TangselKids "VERIFIED" badge: a blue seal-check + label on a white pill.
 * - size "sm" → result cards / compare / home rails
 * - size "md" → larger contexts
 * - variant "hero" → high-contrast pill for image overlays (carousel)
 */
export function VerifiedBadge({
  size = "sm",
  variant = "pill",
  label = true,
  style,
}: {
  size?: "sm" | "md";
  variant?: "pill" | "hero";
  label?: boolean;
  style?: React.CSSProperties;
}) {
  const sm = size === "sm";
  const icon = sm ? 13 : 16;
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: sm ? 3 : 5,
        background: "#fff",
        borderRadius: 999,
        padding: label ? (sm ? "3px 9px 3px 7px" : "4px 12px 4px 9px") : (sm ? 3 : 4),
        boxShadow: variant === "hero"
          ? "0 2px 10px rgba(0,0,0,0.22)"
          : "0 1px 3px rgba(0,0,0,0.16)",
        fontFamily: "var(--font-jakarta), sans-serif",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      <BadgeCheck size={icon} color="#fff" fill={VERIFIED_BLUE} strokeWidth={2.5} />
      {label && (
        <span style={{ fontSize: sm ? 10 : 12, fontWeight: 800, letterSpacing: 0.6, color: VERIFIED_BLUE }}>
          VERIFIED
        </span>
      )}
    </span>
  );
}
