"use client";
import { useRouter } from "next/navigation";
import { ChevronLeft, Check } from "lucide-react";
import { ActionButton } from "@/components/ActionButton";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { useRegisterSheet } from "@/context/RegisterSheetContext";

export default function UpgradePage() {
  const router = useRouter();
  const { tier, user } = useAuth();
  const { t } = useLang();
  const { openRegisterSheet } = useRegisterSheet();

  const isLifetime = !!(user?.lifetime && tier === "premium");
  const isMonthly  = tier === "premium" && !isLifetime;

  function handleUpgradeClick(product: string) {
    if (!user) {
      openRegisterSheet({
        title: "Buat akun dulu",
        subtitle: "Buat akun dalam 30 detik, lalu lanjut ke pembayaran.",
        minimalProfile: true,
        onRegistered: () => router.push(`/payment?product=${product}`),
      });
    } else {
      router.push(`/payment?product=${product}`);
    }
  }

  return (
    <div style={{ maxWidth: 448, margin: "0 auto", minHeight: "100vh", background: "#f6f1e8" }}>

      {/* Header */}
      <div style={{
        background: "linear-gradient(150deg, #1f6b43 0%, #2e8a5a 55%, #3aab74 100%)",
        borderRadius: "0 0 32px 32px",
        padding: "44px 20px 32px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <ActionButton
            onClick={() => router.back()}
            style={{
              width: 36, height: 36, borderRadius: 999, flexShrink: 0,
              background: "rgba(255,255,255,0.18)",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <ChevronLeft size={20} color="white" />
          </ActionButton>
          <p style={{
            margin: 0, fontSize: 12, fontWeight: 700,
            color: "rgba(255,255,255,0.65)",
            fontFamily: "var(--font-jakarta), sans-serif",
            letterSpacing: 1.2, textTransform: "uppercase",
          }}>
            TangselKids
          </p>
        </div>

        {/* Badge */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <span style={{
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            color: "#fff",
            fontSize: 11, fontWeight: 800,
            padding: "5px 14px", borderRadius: 999,
            fontFamily: "var(--font-jakarta), sans-serif",
            letterSpacing: 1,
          }}>
            {t.upgradeBadge}
          </span>
        </div>

        <h1 style={{
          margin: "0 0 8px",
          fontFamily: "var(--font-fraunces), Georgia, serif",
          fontSize: 30, fontWeight: 700, color: "#fff",
          textAlign: "center", lineHeight: 1.2,
          whiteSpace: "pre-line",
        }}>
          {t.upgradeTitle}
        </h1>
        <p style={{
          margin: "0 0 24px",
          fontFamily: "var(--font-jakarta), sans-serif",
          fontSize: 13, color: "rgba(255,255,255,0.65)",
          textAlign: "center", lineHeight: 1.6,
        }}>
          {t.upgradeSubtitle}
        </p>

        {/* ── Header CTAs — side by side ─────────────────────────────── */}
        {!isLifetime && !isMonthly && (
          <div style={{ display: "flex", gap: 10, alignItems: "stretch" }}>
            {/* Monthly — smaller */}
            <ActionButton
              onClick={() => handleUpgradeClick("premium-monthly")}
              style={{
                flex: "0 0 38%",
                padding: "11px 8px", borderRadius: 14,
                background: "rgba(255,255,255,0.18)",
                border: "1.5px solid rgba(255,255,255,0.35)",
                color: "#fff",
                fontFamily: "var(--font-jakarta), sans-serif",
                fontSize: 12, fontWeight: 700,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 1,
                touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
              }}
            >
              <span style={{ fontSize: 10, opacity: 0.75 }}>{t.upgradeMonthlyLabel}</span>
              <span>{t.upgradeMonthlyPrice}</span>
            </ActionButton>
            {/* Lifetime — larger / primary */}
            <ActionButton
              onClick={() => handleUpgradeClick("premium-lifetime")}
              style={{
                flex: 1,
                position: "relative", overflow: "clip",
                padding: "13px 10px", borderRadius: 14,
                background: "linear-gradient(135deg, #78350f 0%, #b45309 25%, #d97706 50%, #fbbf24 68%, #b45309 85%, #78350f 100%)",
                color: "#fff",
                fontFamily: "var(--font-jakarta), sans-serif",
                fontSize: 13, fontWeight: 800,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 1,
                boxShadow: "0 4px 16px rgba(217,119,6,0.50)",
                touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
              }}
            >
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.22) 50%, transparent 65%)", animation: "gold-shimmer 2.8s ease-in-out infinite", pointerEvents: "none" }} />
              <span style={{ position: "relative", fontSize: 10, color: "rgba(255,255,255,0.85)" }}>👑 {t.upgradeLifetimeLabel}</span>
              <span style={{ position: "relative" }}>{t.upgradeLifetimePrice} →</span>
            </ActionButton>
          </div>
        )}
        {isMonthly && (
          <ActionButton
            onClick={() => handleUpgradeClick("premium-lifetime")}
            style={{
              position: "relative", overflow: "clip",
              width: "100%", padding: "14px 0", borderRadius: 14,
              background: "linear-gradient(135deg, #78350f 0%, #b45309 25%, #d97706 50%, #fbbf24 68%, #b45309 85%, #78350f 100%)",
              color: "#fff",
              fontFamily: "var(--font-jakarta), sans-serif",
              fontSize: 14, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              boxShadow: "0 4px 16px rgba(217,119,6,0.50)",
              touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
            }}
          >
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.22) 50%, transparent 65%)", animation: "gold-shimmer 2.8s ease-in-out infinite", pointerEvents: "none" }} />
            <span style={{ position: "relative" }}>👑 {t.upgradePayLifetime}</span>
          </ActionButton>
        )}
      </div>

      {/* Benefits list */}
      <div style={{ padding: "28px 20px 0" }}>
        <p style={{
          margin: "0 0 16px",
          fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
          color: "#94a3b8", textTransform: "uppercase",
          fontFamily: "var(--font-jakarta), sans-serif",
        }}>
          {t.upgradeWhatYouGet}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {t.upgradeBenefits.map((b) => (
            <div
              key={b.title}
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: "10px 12px",
                display: "flex", alignItems: "center", gap: 12,
                border: "1px solid #f1f5f9",
                boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "#e6f4ed",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, flexShrink: 0,
              }}>
                {b.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  margin: "0 0 1px",
                  fontFamily: "var(--font-jakarta), sans-serif",
                  fontSize: 13, fontWeight: 700, color: "#0e1d4f",
                }}>
                  {b.title}
                </p>
                <p style={{
                  margin: 0,
                  fontFamily: "var(--font-jakarta), sans-serif",
                  fontSize: 11, color: "#64748b", lineHeight: 1.45,
                }}>
                  {b.desc}
                </p>
              </div>
              <Check size={15} color="#22c55e" strokeWidth={2.5} style={{ flexShrink: 0 }} />
            </div>
          ))}
        </div>

        {/* Free vs Premium compare table */}
        <div style={{
          marginTop: 20,
          background: "#fff",
          borderRadius: 16,
          padding: "16px",
          border: "1px solid #f1f5f9",
          boxShadow: "0 1px 3px rgba(15,23,42,0.05)",
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, textAlign: "center" }}>
            <div />
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#94a3b8", fontFamily: "var(--font-jakarta), sans-serif" }}>{t.upgradeCompareGratis}</p>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: "#2e8a5a", fontFamily: "var(--font-jakarta), sans-serif" }}>Premium</p>

            {t.upgradeCompareRows.map(([label, free, prem]) => (
              <>
                <p key={label} style={{ margin: 0, fontSize: 12, color: "#374151", fontFamily: "var(--font-jakarta), sans-serif", textAlign: "left", padding: "6px 0", borderTop: "1px solid #f6f1e8" }}>{label}</p>
                <p key={label + "f"} style={{ margin: 0, fontSize: 12, color: free === "—" ? "#d1d5db" : "#374151", fontFamily: "var(--font-jakarta), sans-serif", padding: "6px 0", borderTop: "1px solid #f6f1e8" }}>{free}</p>
                <p key={label + "p"} style={{ margin: 0, fontSize: 12, color: prem === "—" ? "#d1d5db" : "#2e8a5a", fontWeight: 700, fontFamily: "var(--font-jakarta), sans-serif", padding: "6px 0", borderTop: "1px solid #f6f1e8" }}>{prem}</p>
              </>
            ))}
          </div>
        </div>

        <p style={{
          textAlign: "center", marginTop: 14,
          fontSize: 11, color: "#94a3b8",
          fontFamily: "var(--font-jakarta), sans-serif",
        }}>
          {t.upgradeNoContract}
        </p>
      </div>

      {/* Plan cards / CTA */}
      <div style={{ padding: "20px 20px", paddingBottom: "max(24px, env(safe-area-inset-bottom))", marginTop: 8 }}>
        {isLifetime ? (
          /* Already lifetime — show a "you're all set" banner */
          <div style={{
            width: "100%", padding: "15px 0", borderRadius: 16,
            background: "linear-gradient(135deg, #78350f 0%, #b45309 25%, #d97706 50%, #fbbf24 68%, #b45309 85%, #78350f 100%)",
            fontFamily: "var(--font-jakarta), sans-serif",
            fontSize: 15, fontWeight: 700, color: "#fff",
            textAlign: "center",
          }}>
            👑 {t.upgradeAlreadyPremium}
          </div>
        ) : isMonthly ? (
          /* Monthly member — can upgrade to lifetime */
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{
              width: "100%", padding: "13px 0", borderRadius: 16,
              background: "#f0fdf4", border: "2px solid #bbf7d0",
              fontFamily: "var(--font-jakarta), sans-serif",
              fontSize: 14, fontWeight: 700, color: "#15803d",
              textAlign: "center",
            }}>
              {t.upgradeAlreadyPremium}
            </div>
            <ActionButton
              onClick={() => handleUpgradeClick("premium-lifetime")}
              style={{
                position: "relative", overflow: "clip",
                width: "100%", padding: "15px 0", borderRadius: 16, border: "none",
                background: "linear-gradient(135deg, #78350f 0%, #b45309 25%, #d97706 50%, #fbbf24 68%, #b45309 85%, #78350f 100%)",
                color: "#fff",
                fontFamily: "var(--font-jakarta), sans-serif",
                fontSize: 14, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
              }}
            >
              👑 {t.upgradePayLifetime}
            </ActionButton>
            <p style={{ margin: 0, textAlign: "center", fontSize: 10, color: "#94a3b8", fontFamily: "var(--font-jakarta), sans-serif" }}>
              {t.upgradeLifetimeNote}
            </p>
          </div>
        ) : (
          /* Free user — stacked plan cards */
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Monthly card */}
            <div style={{
              background: "#fff",
              border: "2px solid #e2e8f0",
              borderRadius: 24,
              padding: "22px 20px",
              display: "flex", flexDirection: "column", gap: 0,
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "#0e1d4f", fontFamily: "var(--font-jakarta), sans-serif", textTransform: "uppercase", letterSpacing: 0.8 }}>
                    {t.upgradeMonthlyLabel}
                  </p>
                  <p style={{ margin: "3px 0 0", fontSize: 12, color: "#94a3b8", fontFamily: "var(--font-jakarta), sans-serif" }}>
                    {t.upgradeMonthlyTagline}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 26, fontWeight: 700, color: "#0e1d4f", lineHeight: 1 }}>
                    {t.upgradeMonthlyPrice}
                  </p>
                  <p style={{ margin: "3px 0 0", fontSize: 12, color: "#94a3b8", fontFamily: "var(--font-jakarta), sans-serif" }}>
                    {t.upgradeMonthlyPer}
                  </p>
                </div>
              </div>
              <ActionButton
                onClick={() => handleUpgradeClick("premium-monthly")}
                style={{
                  marginTop: 6,
                  width: "100%", padding: "14px 0", borderRadius: 14, border: "none",
                  background: "#2e8a5a",
                  color: "#fff",
                  fontFamily: "var(--font-jakarta), sans-serif",
                  fontSize: 14, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                }}
              >
                {t.upgradePayMonthly}
              </ActionButton>
            </div>

            {/* Lifetime card */}
            <div style={{
              position: "relative",
              background: "linear-gradient(135deg, #78350f 0%, #b45309 25%, #d97706 50%, #fbbf24 68%, #b45309 85%, #78350f 100%)",
              borderRadius: 24,
              padding: "22px 20px",
              display: "flex", flexDirection: "column", gap: 0,
              boxShadow: "0 6px 28px rgba(217,119,6,0.42)",
              overflow: "clip",
            }}>
              {/* Shimmer overlay */}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.25) 50%, transparent 65%)", animation: "gold-shimmer 2.8s ease-in-out infinite", pointerEvents: "none" }} />

              {/* Pill badge */}
              <div style={{ position: "relative", display: "flex", gap: 7, marginBottom: 14 }}>
                <span style={{
                  background: "#dc2626",
                  color: "#fff",
                  fontSize: 10, fontWeight: 800,
                  padding: "4px 11px", borderRadius: 999,
                  fontFamily: "var(--font-jakarta), sans-serif",
                  letterSpacing: 0.4,
                  border: "none",
                }}>
                  ⚡ {t.upgradeEarlyAdopterBadge}
                </span>
              </div>

              {/* Label + price row */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12, position: "relative" }}>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "#fff", fontFamily: "var(--font-jakarta), sans-serif", textTransform: "uppercase", letterSpacing: 0.8 }}>
                    {t.upgradeLifetimeLabel}
                  </p>
                  <p style={{ margin: "3px 0 0", fontSize: 12, color: "rgba(255,255,255,0.78)", fontFamily: "var(--font-jakarta), sans-serif" }}>
                    {t.upgradeLifetimeTagline}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 26, fontWeight: 700, color: "#fff", lineHeight: 1 }}>
                    {t.upgradeLifetimePrice}
                  </p>
                  <p style={{ margin: "3px 0 0", fontSize: 12, color: "rgba(255,255,255,0.78)", fontFamily: "var(--font-jakarta), sans-serif" }}>
                    {t.upgradeLifetimeOnce}
                  </p>
                </div>
              </div>

              {/* Strikethrough price + limit + savings */}
              <div style={{ position: "relative", marginBottom: 18, display: "flex", flexDirection: "column", gap: 6 }}>
                {/* "Normally Rp 299,000 · For 50 New Users ONLY!" */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <p style={{ margin: 0, fontSize: 13, fontFamily: "var(--font-jakarta), sans-serif", color: "rgba(255,255,255,0.80)" }}>
                    {t.upgradeLifetimeWasPrice.replace(/Rp.*/, "").trim()}{" "}
                    <s style={{ color: "rgba(255,255,255,0.50)", fontWeight: 700 }}>
                      {t.upgradeLifetimeWasPrice.match(/Rp[\s\d.,]+/)?.[0]?.trim() ?? "Rp 299.000"}
                    </s>
                  </p>
                  <span style={{
                    background: "rgba(0,0,0,0.28)",
                    color: "#fef9c3",
                    fontSize: 10, fontWeight: 800,
                    padding: "2px 9px", borderRadius: 999,
                    fontFamily: "var(--font-jakarta), sans-serif",
                    letterSpacing: 0.3,
                    border: "1px solid rgba(255,255,255,0.20)",
                    whiteSpace: "nowrap",
                  }}>
                    🎯 {t.upgradeLifetimeLimit}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#fef9c3", fontFamily: "var(--font-jakarta), sans-serif" }}>
                  ✨ {t.upgradeLifetimeSavings}
                </p>
              </div>

              <ActionButton
                onClick={() => handleUpgradeClick("premium-lifetime")}
                style={{
                  position: "relative",
                  width: "100%", padding: "14px 0", borderRadius: 14,
                  border: "2.5px solid #92400e",
                  background: "#fff",
                  color: "#b45309",
                  fontFamily: "var(--font-jakarta), sans-serif",
                  fontSize: 14, fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                  letterSpacing: 0.3,
                }}
              >
                👑 {t.upgradePayLifetime}
              </ActionButton>
            </div>

            <p style={{ margin: 0, textAlign: "center", fontSize: 10, color: "#94a3b8", fontFamily: "var(--font-jakarta), sans-serif", lineHeight: 1.5 }}>
              {t.upgradeLifetimeNote}
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes gold-shimmer {
          0%   { transform: translateX(-100%); }
          60%  { transform: translateX(100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
