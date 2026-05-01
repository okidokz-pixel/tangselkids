"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { PremiumGuestSheet } from "./PremiumGuestSheet";

/**
 * PremiumGate — wraps premium-only content with a blur + lock badge.
 * - Guest:   red lock icon → PremiumGuestSheet (two-step: Register → Upgrade)
 * - Free:    amber "Upgrade ke Premium" pill → /upgrade
 * - Premium: renders children unblurred (no gate)
 */
export function PremiumGate({
  children,
}: {
  children: React.ReactNode;
  label?: string; // kept for backwards-compat
}) {
  const router = useRouter();
  const { tier } = useAuth();
  const [showSheet, setShowSheet] = useState(false);

  if (tier === "premium") return <>{children}</>;

  const isGuest = tier === "guest";

  return (
    <>
      <div
        style={{ position: "relative", display: "inline-flex", cursor: "pointer" }}
        onClick={() => isGuest ? setShowSheet(true) : router.push("/upgrade")}
      >
        {/* Blurred content */}
        <div style={{ filter: "blur(4px)", pointerEvents: "none", userSelect: "none" }}>
          {children}
        </div>

        {/* Badge */}
        <div style={{ position: "absolute", inset: 0 }}>
          {isGuest ? (
            <div style={{
              position: "absolute", bottom: -6, right: -6,
              width: 22, height: 22, borderRadius: 999,
              background: "#ef4444",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 1px 5px rgba(0,0,0,0.25)",
            }}>
              <Lock size={13} strokeWidth={3} color="#fff" />
            </div>
          ) : (
            <span style={{
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              color: "#fff",
              fontSize: 9, fontWeight: 800,
              padding: "3px 7px", borderRadius: 999,
              whiteSpace: "nowrap",
              fontFamily: "var(--font-jakarta), sans-serif",
              boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
            }}>
              Upgrade ke Premium
            </span>
          )}
        </div>
      </div>

      <PremiumGuestSheet isOpen={showSheet} onClose={() => setShowSheet(false)} />
    </>
  );
}
