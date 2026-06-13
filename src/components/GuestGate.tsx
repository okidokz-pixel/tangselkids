"use client";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ActionButton } from "./ActionButton";
import { BottomNav, type NavTab } from "./BottomNav";
import { useLoginSheet } from "@/context/LoginSheetContext";
import { useRegisterSheet } from "@/context/RegisterSheetContext";

/**
 * GuestGate — full-screen prompt shown on personal-data pages (saved, my-reviews,
 * my-notes, feedback) when the visitor is not logged in. These pages display data
 * that belongs to a registered account and is synced to the database, so guests
 * are asked to register / sign in first. Mirrors the gate in list-your-place.
 */
export function GuestGate({
  title,
  emoji = "🔒",
  heading,
  body,
  active = "profile",
}: {
  title: string;
  emoji?: string;
  heading: string;
  body: string;
  active?: NavTab;
}) {
  const router = useRouter();
  const { openLoginSheet } = useLoginSheet();
  const { openRegisterSheet } = useRegisterSheet();

  return (
    <div style={{ maxWidth: 448, margin: "0 auto", minHeight: "100vh", background: "#fff", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "52px 20px 28px", background: "linear-gradient(135deg, #1f6b43 0%, #2e8a5a 100%)", borderRadius: "0 0 32px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <ActionButton onClick={() => router.back()} style={{ width: 36, height: 36, borderRadius: 999, flexShrink: 0, background: "rgba(255,255,255,0.18)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <ChevronLeft size={20} color="white" />
          </ActionButton>
          <h1 style={{ margin: 0, fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 24, fontWeight: 700, color: "#fff" }}>
            {title}
          </h1>
        </div>
      </div>

      {/* Gate body */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 28px", textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>{emoji}</div>
        <h2 style={{ margin: "0 0 12px", fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 22, fontWeight: 700, color: "#0e1d4f" }}>
          {heading}
        </h2>
        <p style={{ margin: "0 0 32px", fontFamily: "var(--font-jakarta), sans-serif", fontSize: 14, color: "#64748b", lineHeight: 1.65 }}>
          {body}
        </p>

        <ActionButton
          onClick={() => openRegisterSheet({ onRegistered: () => {} })}
          style={{
            width: "100%", padding: "15px 0", borderRadius: 16, border: "none",
            background: "linear-gradient(135deg, #1f6b43, #2e8a5a)",
            color: "#fff", fontFamily: "var(--font-jakarta), sans-serif",
            fontSize: 15, fontWeight: 800, cursor: "pointer",
            touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
            marginBottom: 12,
          } as React.CSSProperties}
        >
          Daftar Sekarang
        </ActionButton>

        <ActionButton
          onClick={() => openLoginSheet()}
          style={{
            width: "100%", padding: "15px 0", borderRadius: 16,
            border: "1.5px solid #e2e8f0", background: "#fff",
            color: "#374151", fontFamily: "var(--font-jakarta), sans-serif",
            fontSize: 15, fontWeight: 700, cursor: "pointer",
            touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
          } as React.CSSProperties}
        >
          Sudah punya akun? Masuk
        </ActionButton>
      </div>

      <BottomNav active={active} />
    </div>
  );
}
