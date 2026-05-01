"use client";
import { useRegisterSheet } from "@/context/RegisterSheetContext";
import { ActionButton } from "./ActionButton";

/**
 * PremiumGuestSheet — reusable bottom sheet shown to guests when they
 * try to access a Premium-only feature.
 * Explains the two-step path (Register → Upgrade) and opens RegisterSheet on CTA.
 */
export function PremiumGuestSheet({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { openRegisterSheet } = useRegisterSheet();

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
          padding: "20px 20px 40px",
          maxWidth: 448, margin: "0 auto",
          animation: "sheet-slide-up 0.38s cubic-bezier(0.32, 0.72, 0, 1) both",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div style={{ width: 36, height: 4, borderRadius: 999, background: "#e2e8f0", margin: "0 auto 24px" }} />

        {/* Icon */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 999,
            background: "#FEF3C7",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 30,
          }}>⭐</div>
        </div>

        {/* Heading */}
        <p style={{
          fontFamily: "var(--font-fraunces), Georgia, serif",
          fontSize: 20, fontWeight: 700, color: "#1E3A5F",
          textAlign: "center", margin: "0 0 8px",
        }}>
          Fitur Khusus Premium
        </p>

        {/* Body */}
        <p style={{
          fontFamily: "var(--font-jakarta), sans-serif",
          fontSize: 13, color: "#64748b", lineHeight: 1.6,
          textAlign: "center", margin: "0 0 20px",
        }}>
          Fitur ini khusus untuk member Premium. Daftar gratis terlebih dahulu, lalu upgrade ke Premium untuk mengakses fitur ini.
        </p>

        {/* Two-step visual */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 8, marginBottom: 24,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 999,
              background: "linear-gradient(135deg, #16a34a, #22c55e)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, flexShrink: 0,
            }}>👤</div>
            <span style={{
              fontSize: 11, fontWeight: 700, color: "#16a34a",
              fontFamily: "var(--font-jakarta), sans-serif",
              whiteSpace: "nowrap",
            }}>Daftar Gratis</span>
          </div>

          <svg width="48" height="12" viewBox="0 0 48 12" fill="none" style={{ flexShrink: 0 }}>
            <path d="M0 6 H40 M34 2 L46 6 L34 10" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>

          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 999,
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, flexShrink: 0,
            }}>⭐</div>
            <span style={{
              fontSize: 11, fontWeight: 700, color: "#d97706",
              fontFamily: "var(--font-jakarta), sans-serif",
              whiteSpace: "nowrap",
            }}>Upgrade Premium</span>
          </div>
        </div>

        {/* CTA */}
        <ActionButton
          onClick={() => {
            onClose();
            openRegisterSheet({
              title: "Daftar untuk Mulai",
              subtitle: "Daftar gratis terlebih dahulu, lalu upgrade ke Premium untuk mengakses fitur ini.",
            });
          }}
          style={{
            width: "100%", padding: "15px 0",
            borderRadius: 16, border: "none",
            background: "linear-gradient(135deg, #16a34a, #22c55e)",
            color: "#fff",
            fontFamily: "var(--font-jakarta), sans-serif",
            fontSize: 15, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
          }}
        >
          Daftar Gratis
        </ActionButton>

        {/* Cancel */}
        <ActionButton
          onClick={onClose}
          style={{
            width: "100%", marginTop: 12,
            padding: "12px 0", borderRadius: 16,
            background: "transparent", color: "#94a3b8",
            fontFamily: "var(--font-jakarta), sans-serif",
            fontSize: 14, fontWeight: 600,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          Batal
        </ActionButton>
      </div>
    </div>
  );
}
