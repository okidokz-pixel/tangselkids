"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { Star, TrendingUp, Home, Search, MapPin, Zap } from "lucide-react";
import { ActionButton } from "@/components/ActionButton";
import { useLang } from "@/context/LanguageContext";
import Link from "next/link";

const BENEFIT_ICONS  = [Star, TrendingUp, Home, Search, Zap, MapPin];
const BENEFIT_COLORS = ["#f6b545","#16a34a","#2e8a5a","#9d80ff","#e26a4f","#49c4d2"];
const BENEFIT_BGS    = ["#fffbeb","#f0fdf4","#e6f4ed","#f5f3ff","#fff5f0","#f0fdfe"];

const ROW_ACCESS = [
  [true,  true ],
  [true,  true ],
  [false, true ],
  [false, true ],
  [false, true ],
  [false, true ],
  [false, true ],
];

function UpsellContent() {
  const { t }        = useLang();
  const searchParams = useSearchParams();
  const router       = useRouter();
  const placeName    = searchParams.get("name") || "";

  return (
    <div style={{ maxWidth: 448, margin: "0 auto", minHeight: "100vh", background: "#f6f1e8", paddingBottom: 48 }}>

      {/* ── Promo header ────────────────────────────────────────────────────── */}
      <div style={{
        padding: "48px 20px 28px",
        background: "linear-gradient(160deg, #0a2018 0%, #1f6b43 60%, #2e8a5a 100%)",
        borderRadius: "0 0 32px 32px",
        textAlign: "center",
      }}>
        {/* Urgency badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "linear-gradient(135deg, #f6b545, #e89a18)",
          borderRadius: 999, padding: "6px 16px", marginBottom: 14,
        }}>
          <span style={{ fontSize: 14 }}>⚡</span>
          <span style={{
            fontFamily: "var(--font-jakarta), sans-serif",
            fontSize: 12, fontWeight: 900, color: "#3a2304",
            letterSpacing: 0.3,
          }}>
            {t.listUpsellUrgency}
          </span>
        </div>

        <h1 style={{
          margin: "0 0 18px",
          fontFamily: "var(--font-fraunces), Georgia, serif",
          fontSize: 26, fontWeight: 700, color: "#fff", lineHeight: 1.2,
        }}>
          {t.listUpsellTitle}
        </h1>

        {/* Price display */}
        <div style={{
          display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 4,
          background: "rgba(255,255,255,0.10)", borderRadius: 18,
          padding: "14px 28px",
          border: "1px solid rgba(255,255,255,0.18)",
        }}>
          {/* Original price — strikethrough */}
          <span style={{
            fontFamily: "var(--font-jakarta), sans-serif",
            fontSize: 14, fontWeight: 600,
            color: "rgba(255,255,255,0.45)",
            textDecoration: "line-through",
          }}>
            Rp 599.000
          </span>
          {/* Sale price */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{
              fontFamily: "var(--font-fraunces), Georgia, serif",
              fontSize: 38, fontWeight: 700, color: "#fff", lineHeight: 1,
            }}>
              Rp 299.000
            </span>
            <span style={{
              fontSize: 12, color: "rgba(255,255,255,0.55)",
              fontFamily: "var(--font-jakarta), sans-serif",
            }}>
              {t.listUpsellPer}
            </span>
          </div>
        </div>
      </div>

      <div style={{ padding: "24px 20px 0" }}>

        {/* ── Upsell CTA card ───────────────────────────────────────────────── */}
        <div style={{
          borderRadius: 22,
          background: "linear-gradient(145deg, #1f6b43 0%, #2e8a5a 60%, #3aab74 100%)",
          padding: "20px",
          boxShadow: "0 12px 32px rgba(30,63,176,0.28)",
          marginBottom: 24,
          position: "relative",
          overflow: "clip",
        }}>
          <div style={{
            position: "absolute", top: -20, right: -20,
            width: 110, height: 110, borderRadius: 999,
            background: "rgba(246,181,69,0.12)", pointerEvents: "none",
          }} />

          <p style={{
            margin: "0 0 10px", color: "rgba(255,255,255,0.75)", fontSize: 13.5,
            fontFamily: "var(--font-jakarta), sans-serif", lineHeight: 1.55,
          }}>
            {t.listUpsellDesc}
          </p>

          <ActionButton
            onClick={() => router.push(`/payment?product=featured-listing&name=${encodeURIComponent(placeName)}`)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              width: "100%", padding: "16px 0", borderRadius: 14,
              background: "linear-gradient(135deg, #f6b545, #e89a18)",
              color: "#3a2304", fontFamily: "var(--font-jakarta), sans-serif",
              fontSize: 15, fontWeight: 900, border: "none", cursor: "pointer",
              touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
              boxShadow: "0 4px 18px rgba(246,181,69,0.50)",
            } as React.CSSProperties}
          >
            {t.listUpsellCta}
            <span style={{ display: "inline-block", fontSize: 18, animation: "arrow-slide 1s ease-in-out infinite" }}>→</span>
          </ActionButton>
        </div>

        {/* ── Benefits ──────────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 28 }}>
          <p style={{
            margin: "0 0 14px", fontSize: 10, fontWeight: 800, letterSpacing: 1.4,
            color: "#94a3b8", textTransform: "uppercase",
            fontFamily: "var(--font-jakarta), sans-serif",
          }}>
            {t.listUpsellWhatYouGet}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {t.listUpsellBenefits.map(({ title, desc }, i) => {
              const Icon  = BENEFIT_ICONS[i];
              const color = BENEFIT_COLORS[i];
              const bg    = BENEFIT_BGS[i];
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: 14,
                  background: "#fff", borderRadius: 16, padding: "14px 16px",
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 1px 4px rgba(15,23,42,0.05)",
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                    background: bg, display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={18} color={color} strokeWidth={1.75} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: "0 0 3px", fontSize: 13.5, fontWeight: 700, color: "#0e1d4f", fontFamily: "var(--font-fraunces), Georgia, serif" }}>
                      {title}
                    </p>
                    <p style={{ margin: 0, fontSize: 12.5, color: "#64748b", lineHeight: 1.5, fontFamily: "var(--font-jakarta), sans-serif" }}>
                      {desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Comparison table ──────────────────────────────────────────────── */}
        <div style={{ background: "#fff", borderRadius: 20, overflow: "clip", border: "1px solid #e2e8f0", marginBottom: 28 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px", borderBottom: "1px solid #f1f5f9" }}>
            <div style={{ padding: "12px 16px" }} />
            <div style={{ padding: "12px 8px", textAlign: "center", fontSize: 11, fontWeight: 800, color: "#94a3b8", fontFamily: "var(--font-jakarta), sans-serif" }}>
              {t.listUpsellCompareFree}
            </div>
            <div style={{ padding: "12px 8px", textAlign: "center", fontSize: 11, fontWeight: 800, color: "#fff", background: "linear-gradient(135deg, #2e8a5a, #3aab74)", fontFamily: "var(--font-jakarta), sans-serif" }}>
              {t.listUpsellCompareFeat}
            </div>
          </div>
          {t.listUpsellCompareRows.map((label, i) => {
            const [free, feat] = ROW_ACCESS[i] ?? [false, true];
            return (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "1fr 80px 80px",
                borderBottom: i < t.listUpsellCompareRows.length - 1 ? "1px solid #f6f1e8" : "none",
                background: i % 2 === 0 ? "#fff" : "#fafbfc",
              }}>
                <div style={{ padding: "11px 16px", fontSize: 12.5, fontWeight: 600, color: "#374151", fontFamily: "var(--font-jakarta), sans-serif" }}>
                  {label}
                </div>
                <div style={{ padding: "11px 8px", textAlign: "center", fontSize: 15 }}>
                  {free ? <span style={{ color: "#16a34a", fontWeight: 700 }}>✓</span> : <span style={{ color: "#e2e8f0", fontSize: 18 }}>—</span>}
                </div>
                <div style={{ padding: "11px 8px", textAlign: "center", fontSize: 15, color: "#16a34a", fontWeight: 700 }}>
                  {feat ? "✓" : "—"}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Skip ──────────────────────────────────────────────────────────── */}
        <div style={{ textAlign: "center" }}>
          <ActionButton
            onClick={() => router.push(`/list-your-place/submitted${placeName ? `?name=${encodeURIComponent(placeName)}` : ""}`)}
            style={{
              display: "inline-block",
              fontFamily: "var(--font-jakarta), sans-serif",
              fontSize: 13.5, fontWeight: 600,
              color: "#94a3b8", background: "none", border: "none",
              padding: "10px 20px", cursor: "pointer",
              touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
            } as React.CSSProperties}
          >
            {t.listUpsellSkip}
          </ActionButton>
          <p style={{ margin: "6px 0 0", fontSize: 11, color: "#cbd5e1", fontFamily: "var(--font-jakarta), sans-serif" }}>
            {t.listUpsellSkipNote}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function UpsellPage() {
  return (
    <Suspense>
      <UpsellContent />
    </Suspense>
  );
}
