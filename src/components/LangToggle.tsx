"use client";
import { useLang } from "@/context/LanguageContext";

interface LangToggleProps {
  variant?: "light" | "dark";
}

/**
 * Sliding flag toggle — ID 🇮🇩 ←→ EN 🇬🇧
 *
 * light variant: for use on dark/photo backgrounds (onboarding, dark headers)
 * dark  variant: for use on white/light backgrounds (profile preferences card)
 */
export function LangToggle({ variant = "light" }: LangToggleProps) {
  const { lang, toggleLang } = useLang();
  const isEN   = lang === "en";
  const isDark = variant === "dark";

  // Colours that adapt to background
  const labelActive = isDark ? "#1e3a5f"                   : "#fff";
  const labelMuted  = isDark ? "rgba(30,58,95,0.30)"       : "rgba(255,255,255,0.40)";
  const trackBg     = isDark ? "rgba(15,23,42,0.08)"       : "rgba(255,255,255,0.18)";
  const trackBorder = isDark ? "1.5px solid rgba(15,23,42,0.14)" : "1.5px solid rgba(255,255,255,0.28)";

  // Knob travels: left:2 (ID) → left:28 (EN) inside a 52px track
  const knobLeft = isEN ? 28 : 2;

  return (
    <button
      type="button"
      onClick={toggleLang}
      onTouchEnd={(e) => { e.preventDefault(); toggleLang(); }}
      title="Toggle language"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        background: "none",
        border: "none",
        padding: "4px 0",
        cursor: "pointer",
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
        WebkitUserSelect: "none",
        userSelect: "none",
      }}
    >
      {/* ID label */}
      <span style={{
        fontSize: 11, fontWeight: 800, letterSpacing: 0.4,
        color: !isEN ? labelActive : labelMuted,
        transition: "color 0.22s ease",
        lineHeight: 1,
      }}>
        ID
      </span>

      {/* Track */}
      <div style={{
        position: "relative",
        width: 52,
        height: 28,
        borderRadius: 999,
        background: trackBg,
        border: trackBorder,
        flexShrink: 0,
      }}>
        {/* Sliding knob */}
        <div style={{
          position: "absolute",
          top: 2,
          left: knobLeft,
          width: 22,
          height: 22,
          borderRadius: 999,
          background: "#ffffff",
          boxShadow: "0 2px 6px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.04)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 15,
          lineHeight: 1,
          transition: "left 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          // No transform — uses left for the slide (iOS-safe, no compositing layer)
        }}>
          {isEN ? "🇬🇧" : "🇮🇩"}
        </div>
      </div>

      {/* EN label */}
      <span style={{
        fontSize: 11, fontWeight: 800, letterSpacing: 0.4,
        color: isEN ? labelActive : labelMuted,
        transition: "color 0.22s ease",
        lineHeight: 1,
      }}>
        EN
      </span>
    </button>
  );
}
