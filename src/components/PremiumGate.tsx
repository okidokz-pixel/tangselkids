"use client";
import { useState } from "react";
import { Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { FilterGateSheet } from "./FilterGateSheet";

/**
 * PremiumGate — wraps premium-only content with a blur + lock badge.
 * - Free / guest: amber lock icon → unified upgrade bottom sheet → /upgrade
 * - Premium:      renders children unblurred (no gate)
 */
export function PremiumGate({
  children,
}: {
  children: React.ReactNode;
  label?: string; // kept for backwards-compat
}) {
  const { tier } = useAuth();
  const [showSheet, setShowSheet] = useState(false);

  if (tier === "premium") return <>{children}</>;

  return (
    <>
      <div
        style={{ position: "relative", display: "inline-flex", cursor: "pointer" }}
        onClick={() => setShowSheet(true)}
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

      <FilterGateSheet isOpen={showSheet} onClose={() => setShowSheet(false)} />
    </>
  );
}
