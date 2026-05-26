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
  const labelActive = isDark ? "var(--tk-ink, #0e1d4f)"    : "#fff";
  const labelMuted  = isDark ? "rgba(14,29,79,0.30)"       : "rgba(255,255,255,0.40)";
  const trackBg     = isDark ? "rgba(15,23,42,0.08)"       : "rgba(255,255,255,0.18)";
  const trackBorder = isDark ? "1.5px solid rgba(15,23,42,0.14)" : "1.5px solid rgba(255,255,255,0.28)";

  return (
    <button
      type="button"
      onClick={toggleLang}
      onTouchEnd={(e) => { e.preventDefault(); toggleLang(); }}
      title="Toggle language"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
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
        fontSize: 10, fontWeight: 800, letterSpacing: 0.4,
        color: !isEN ? labelActive : labelMuted,
        transition: "color 0.22s ease",
        lineHeight: 1,
      }}>
        ID
      </span>

      {/* Track */}
      <div style={{
        position: "relative",
        width: 48,
        height: 26,
        borderRadius: 999,
        background: trackBg,
        border: trackBorder,
        flexShrink: 0,
        overflow: "clip",
      }}>
        {/* Sliding knob — flag image fills the circle */}
        <div style={{
          position: "absolute",
          top: 3,
          left: isEN ? 25 : 3,
          width: 20,
          height: 20,
          borderRadius: 999,
          overflow: "clip",
          boxShadow: "0 2px 6px rgba(0,0,0,0.28), 0 0 0 1.5px rgba(255,255,255,0.6)",
          transition: "left 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          // No transform — uses left for the slide (iOS-safe, no compositing layer)
        }}>
          <img
            src={isEN ? "https://flagcdn.com/gb.svg" : "https://flagcdn.com/id.svg"}
            alt={isEN ? "EN" : "ID"}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>
      </div>

      {/* EN label */}
      <span style={{
        fontSize: 10, fontWeight: 800, letterSpacing: 0.4,
        color: isEN ? labelActive : labelMuted,
        transition: "color 0.22s ease",
        lineHeight: 1,
      }}>
        EN
      </span>
    </button>
  );
}
