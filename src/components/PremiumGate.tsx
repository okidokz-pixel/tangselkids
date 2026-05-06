"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { ActionButton } from "./ActionButton";

/**
 * PremiumGate — wraps premium-only content with a blur + lock badge.
 * - Free (anonymous): amber lock icon → upgrade bottom sheet → /upgrade
 * - Premium:          renders children unblurred (no gate)
 */
export function PremiumGate({
  children,
}: {
  children: React.ReactNode;
  label?: string; // kept for backwards-compat
}) {
  const router = useRouter();
  const { tier } = useAuth();
  const { t } = useLang();
  const [showUpgradeSheet, setShowUpgradeSheet] = useState(false);

  if (tier === "premium") return <>{children}</>;

  return (
    <>
      <div
        style={{ position: "relative", display: "inline-flex", cursor: "pointer" }}
        onClick={() => setShowUpgradeSheet(true)}
      >
        {/* Blurred content */}
        <div style={{ filter: "blur(4px)", pointerEvents: "none", userSelect: "none" }}>
          {children}
        </div>

        {/* Lock badge */}
        <div style={{ position: "absolute", inset: 0 }}>
          <div style={{
            position: "absolute", bottom: -6, right: -6,
            width: 22, height: 22, borderRadius: 999,
            background: "#d97706",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 1px 5px rgba(0,0,0,0.25)",
          }}>
            <Lock size={13} strokeWidth={3} color="#fff" />
          </div>
        </div>
      </div>

      {/* Registered → upgrade sheet */}
      {showUpgradeSheet && (
        <>
          <style>{`
            @keyframes pg-fade-in  { from { opacity: 0; } to { opacity: 1; } }
            @keyframes pg-slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
          `}</style>

          {/* Backdrop */}
          <div
            onClick={() => setShowUpgradeSheet(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 1000,
              background: "rgba(0,0,0,0.45)",
              animation: "pg-fade-in 0.25s ease both",
            }}
          />

          {/* Sheet */}
          <div
            style={{
              position: "fixed", bottom: 0, left: 0, right: 0,
              maxWidth: 448, margin: "0 auto",
              background: "#fff", borderRadius: "24px 24px 0 0",
              padding: "20px 20px 40px",
              zIndex: 1001,
              boxShadow: "0 -8px 40px rgba(0,0,0,0.20)",
              animation: "pg-slide-up 0.38s cubic-bezier(0.32, 0.72, 0, 1) both",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div style={{ width: 36, height: 4, borderRadius: 999, background: "#e2e8f0", margin: "0 auto 24px" }} />

            {/* Icon */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <div style={{
                width: 64, height: 64, borderRadius: 999,
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 30,
              }}>
                ⭐
              </div>
            </div>

            {/* Title */}
            <p style={{
              fontFamily: "var(--font-fraunces), Georgia, serif",
              fontSize: 20, fontWeight: 700, color: "var(--tk-ink, #0e1d4f)",
              textAlign: "center", margin: "0 0 8px",
            }}>
              {t.premiumGateTitle}
            </p>

            {/* Body */}
            <p style={{
              fontFamily: "var(--font-jakarta), sans-serif",
              fontSize: 13, color: "#64748b", lineHeight: 1.6,
              textAlign: "center", margin: "0 0 24px",
            }}>
              {t.premiumGateDesc}
            </p>

            {/* CTA */}
            <ActionButton
              onClick={() => { setShowUpgradeSheet(false); router.push("/upgrade"); }}
              style={{
                width: "100%", padding: "15px 0",
                borderRadius: 16, border: "none",
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                color: "#fff",
                fontFamily: "var(--font-jakarta), sans-serif",
                fontSize: 15, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
              } as React.CSSProperties}
            >
              {t.premiumGateCta}
            </ActionButton>

            {/* Cancel */}
            <ActionButton
              onClick={() => setShowUpgradeSheet(false)}
              style={{
                width: "100%", marginTop: 10, padding: "13px 0",
                borderRadius: 16, border: "none",
                background: "#f1f5f9", color: "#64748b",
                fontFamily: "var(--font-jakarta), sans-serif",
                fontSize: 14, fontWeight: 600,
                display: "flex", alignItems: "center", justifyContent: "center",
                touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
              } as React.CSSProperties}
            >
              {t.premiumGateCancel}
            </ActionButton>
          </div>
        </>
      )}
    </>
  );
}
