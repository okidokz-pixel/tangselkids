"use client";
import { useRegisterSheet } from "@/context/RegisterSheetContext";
import { useLang } from "@/context/LanguageContext";
import { ActionButton } from "./ActionButton";

/**
 * FilterGateSheet — bottom sheet shown to guests when they tap Filter or Sort.
 * Explains that filters & sorting are free for registered users, then opens
 * the RegisterSheet when the CTA is tapped.
 */
export function FilterGateSheet({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { openRegisterSheet } = useRegisterSheet();
  const { t } = useLang();

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 70,
        background: "rgba(0,0,0,0.45)",
        animation: "sheet-fade-in 0.25s ease both",
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          background: "#fff", borderRadius: "24px 24px 0 0",
          padding: "20px 20px 44px",
          maxWidth: 448, margin: "0 auto",
          animation: "sheet-slide-up 0.38s cubic-bezier(0.32, 0.72, 0, 1) both",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div style={{
          width: 36, height: 4, borderRadius: 999,
          background: "#e2e8f0", margin: "0 auto 24px",
        }} />

        {/* Icon */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 999,
            background: "linear-gradient(135deg, #dcfce7, #bbf7d0)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28,
          }}>
            🔍
          </div>
        </div>

        {/* Title */}
        <p style={{
          fontFamily: "var(--font-fraunces), Georgia, serif",
          fontSize: 20, fontWeight: 700, color: "#1E3A5F",
          textAlign: "center", margin: "0 0 10px",
        }}>
          {t.filterGateTitle}
        </p>

        {/* Subtitle */}
        <p style={{
          fontFamily: "var(--font-jakarta), sans-serif",
          fontSize: 13, color: "#64748b", lineHeight: 1.6,
          textAlign: "center", margin: "0 0 28px",
          padding: "0 8px",
        }}>
          {t.filterGateSubtitle}
        </p>

        {/* CTA */}
        <ActionButton
          onClick={() => {
            onClose();
            openRegisterSheet();
          }}
          style={{
            width: "100%",
            padding: "17px 0",
            borderRadius: 16,
            border: "none",
            background: "linear-gradient(135deg, #16a34a, #22c55e)",
            color: "#fff",
            fontFamily: "var(--font-jakarta), sans-serif",
            fontSize: 16,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            touchAction: "manipulation",
            WebkitTapHighlightColor: "transparent",
            boxShadow: "0 4px 16px rgba(22,163,74,0.30)",
          }}
        >
          {t.filterGateCta}
          <span style={{
            display: "inline-block",
            fontSize: 20,
            lineHeight: 1,
            animation: "arrow-slide 1s ease-in-out infinite",
          }}>
            →
          </span>
        </ActionButton>

        {/* Cancel */}
        <ActionButton
          onClick={onClose}
          style={{
            width: "100%",
            marginTop: 12,
            padding: "13px 0",
            borderRadius: 16,
            background: "transparent",
            color: "#94a3b8",
            fontFamily: "var(--font-jakarta), sans-serif",
            fontSize: 14,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Batal
        </ActionButton>
      </div>
    </div>
  );
}
