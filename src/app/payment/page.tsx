"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Check, Shield } from "lucide-react";
import { ActionButton } from "@/components/ActionButton";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";

// ── Inner component (needs useSearchParams) ───────────────────────────────────
function PaymentContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { upgradeToPremium, user } = useAuth();
  const { t } = useLang();

  const product     = searchParams.get("product") ?? "premium-monthly";
  const isFeatured  = product === "featured-listing";
  const isLifetime  = product === "premium-lifetime";
  const isPremium   = !isFeatured; // monthly or lifetime

  const [selectedMethod, setSelectedMethod] = useState("bca");
  const [paying,  setPaying]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [showAddressNudge, setShowAddressNudge] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ── Confetti effect on premium / lifetime success ─────────────────────────
  useEffect(() => {
    if (!success || isFeatured) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const c: HTMLCanvasElement = canvas;
    const g: CanvasRenderingContext2D = ctx;

    const COLORS = isLifetime
      ? ["#f59e0b","#fbbf24","#d97706","#78350f","#b45309","#fff8dc","#fff","#fde68a"]
      : ["#f59e0b","#fbbf24","#d97706","#2e8a5a","#3aab74","#a78bfa","#ec4899","#34d399","#fff"];

    type Piece = {
      x: number; y: number; vx: number; vy: number;
      w: number; h: number; color: string; angle: number; va: number;
    };

    const pieces: Piece[] = Array.from({ length: 160 }, () => ({
      x:     Math.random() * c.width,
      y:     Math.random() * c.height * -1.5,
      vx:    (Math.random() - 0.5) * 4,
      vy:    Math.random() * 3 + 1.5,
      w:     Math.random() * 10 + 5,
      h:     Math.random() * 5 + 3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      angle: Math.random() * Math.PI * 2,
      va:    (Math.random() - 0.5) * 0.15,
    }));

    let frame: number;
    const startTime = performance.now();

    function draw() {
      const elapsed = performance.now() - startTime;
      g.clearRect(0, 0, c.width, c.height);
      const alpha = elapsed < 3500 ? 1 : Math.max(0, 1 - (elapsed - 3500) / 800);

      pieces.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.va;
        p.vy += 0.06;
        if (p.y > c.height + 20 && elapsed < 3500) {
          p.y = -20;
          p.x = Math.random() * c.width;
          p.vy = Math.random() * 3 + 1.5;
        }
        g.save();
        g.globalAlpha = alpha;
        g.translate(p.x, p.y);
        g.rotate(p.angle);
        g.fillStyle = p.color;
        g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        g.restore();
      });

      if (elapsed < 4300) frame = requestAnimationFrame(draw);
    }

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [success, isFeatured, isLifetime]);

  const price       = isFeatured ? "Rp 299.000" : isLifetime ? "Rp 169.000" : "Rp 29.000";
  const productName = isFeatured ? "✦ Featured Listing" : "TangselKids Premium";
  const productSub  = isFeatured ? t.paymentFeaturedSub : isLifetime ? t.paymentLifetimeSub : t.paymentPremiumSub;
  const productIcon = isFeatured ? "✦" : isLifetime ? "👑" : "⭐";
  const productBg   = isFeatured
    ? "linear-gradient(135deg, #1f6b43, #2e8a5a)"
    : isLifetime
    ? "linear-gradient(135deg, #78350f 0%, #b45309 25%, #d97706 50%, #fbbf24 68%, #b45309 85%, #78350f 100%)"
    : "linear-gradient(135deg, #f59e0b, #d97706)";

  async function handlePay() {
    setPaying(true);
    await new Promise((r) => setTimeout(r, 1800));
    if (isPremium) upgradeToPremium(isLifetime);
    setPaying(false);
    setSuccess(true);
    // Show complete-profile nudge after a short delay for premium users
    if (isPremium) {
      setTimeout(() => setShowAddressNudge(true), 1400);
    }
  }

  // ── Success state ────────────────────────────────────────────────────────────
  if (success) {
    if (isFeatured) {
      return (
        <div style={{
          maxWidth: 448, margin: "0 auto", minHeight: "100vh", background: "#f6f1e8",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "40px 28px", textAlign: "center",
        }}>
          <div style={{
            width: 96, height: 96, borderRadius: 999,
            background: "linear-gradient(135deg, #1f6b43, #2e8a5a)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 24, fontSize: 42,
            boxShadow: "0 8px 28px rgba(30,63,176,0.35)",
          }}>
            ✦
          </div>
          <h1 style={{ margin: "0 0 10px", fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 26, fontWeight: 700, color: "#0e1d4f" }}>
            {t.paymentFeaturedSuccessTitle}
          </h1>
          <p style={{ margin: "0 0 8px", fontFamily: "var(--font-jakarta), sans-serif", fontSize: 13, color: "#64748b", lineHeight: 1.65 }}>
            {t.paymentFeaturedSuccessDesc}
          </p>
          <p style={{ margin: "0 0 32px", fontFamily: "var(--font-jakarta), sans-serif", fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>
            {t.paymentFeaturedSuccessNote}
          </p>
          <ActionButton
            onClick={() => router.replace("/")}
            style={{
              width: "100%", padding: "15px 0", borderRadius: 16, border: "none",
              background: "linear-gradient(135deg, #1f6b43, #2e8a5a)",
              color: "#fff", fontFamily: "var(--font-jakarta), sans-serif",
              fontSize: 15, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
              touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
            } as React.CSSProperties}
          >
            {t.paymentBackHome}
          </ActionButton>
        </div>
      );
    }

    // Shared success screen for both monthly and lifetime premium
    const highlights  = isLifetime ? t.paymentLifetimeHighlights : t.paymentPremiumHighlights;
    const congrats    = isLifetime ? t.paymentLifetimeCongrats   : t.paymentPremiumCongrats;
    const title       = isLifetime ? t.paymentLifetimeTitle      : t.paymentPremiumTitle;
    const desc        = isLifetime ? t.paymentLifetimeDesc       : null;
    const viewProfile = isLifetime ? t.paymentViewLifetimeProfile : t.paymentViewProfile;

    const iconBg = isLifetime
      ? "linear-gradient(135deg, #78350f 0%, #b45309 25%, #d97706 50%, #fbbf24 68%, #b45309 85%, #78350f 100%)"
      : "linear-gradient(135deg, #f59e0b, #d97706)";

    return (
      <>
        <style>{`
          @keyframes pop-in {
            0%   { transform: scale(0.4); opacity: 0; }
            70%  { transform: scale(1.12); }
            100% { transform: scale(1);   opacity: 1; }
          }
          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 0 0   rgba(245,158,11,0.45), 0 8px 28px rgba(245,158,11,0.35); }
            50%       { box-shadow: 0 0 0 18px rgba(245,158,11,0),   0 8px 28px rgba(245,158,11,0.35); }
          }
          @keyframes float-up {
            0%   { transform: translateY(28px); opacity: 0; }
            100% { transform: translateY(0);    opacity: 1; }
          }
        `}</style>

        <canvas
          ref={canvasRef}
          style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 5 }}
        />

        <div style={{
          position: "relative", zIndex: 10,
          maxWidth: 448, margin: "0 auto", minHeight: "100vh",
          background: "linear-gradient(180deg, #fffbeb 0%, #f6f1e8 55%)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "40px 28px", textAlign: "center",
        }}>

          <div style={{ position: "absolute", top: 44, left: 0, right: 0, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
            {(["✦","⭐","✦","⭐","✦"] as const).map((s, i) => (
              <span key={i} style={{ fontSize: i % 2 === 0 ? 13 : 20, opacity: 0.22, margin: "0 8px", color: "#f59e0b" }}>{s}</span>
            ))}
          </div>

          <div style={{
            width: 96, height: 96, borderRadius: 999,
            background: iconBg,
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 20, fontSize: 46,
            animation: "pop-in 0.65s cubic-bezier(0.34,1.56,0.64,1) both, pulse-glow 2.2s ease 0.65s infinite",
          }}>
            {isLifetime ? "👑" : "⭐"}
          </div>

          <span style={{
            display: "inline-block",
            background: iconBg,
            color: "#fff", fontSize: 11, fontWeight: 800,
            padding: "4px 16px", borderRadius: 999,
            fontFamily: "var(--font-jakarta), sans-serif",
            letterSpacing: 1.3, marginBottom: 14,
            animation: "float-up 0.5s ease 0.3s both",
          }}>
            {congrats}
          </span>

          <h1 style={{
            margin: "0 0 10px",
            fontFamily: "var(--font-fraunces), Georgia, serif",
            fontSize: 28, fontWeight: 700, color: "#0e1d4f", lineHeight: 1.2,
            whiteSpace: "pre-line",
            animation: "float-up 0.5s ease 0.45s both",
          }}>
            {title}
          </h1>

          <p style={{
            margin: "0 0 26px",
            fontFamily: "var(--font-jakarta), sans-serif",
            fontSize: 13, color: "#64748b", lineHeight: 1.7,
            animation: "float-up 0.5s ease 0.55s both",
          }}>
            {desc ?? (
              <>
                {t.paymentPremiumDescPart1} <strong>{t.paymentPremiumDescDays}</strong>.<br />
                {t.paymentPremiumDescPart2}
              </>
            )}
          </p>

          <div style={{
            width: "100%", background: "#fff", borderRadius: 20,
            padding: "18px 16px", marginBottom: 28,
            border: isLifetime ? "1px solid #fde68a" : "1px solid #fde68a",
            boxShadow: "0 4px 24px rgba(245,158,11,0.13)",
            animation: "float-up 0.5s ease 0.65s both",
          }}>
            {highlights.map((f, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 12,
                paddingTop: i > 0 ? 10 : 2, marginTop: i > 0 ? 10 : 0,
                borderTop: i > 0 ? "1px solid #fef3c7" : "none",
              }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{f.emoji}</span>
                <p style={{ margin: 0, flex: 1, fontFamily: "var(--font-jakarta), sans-serif", fontSize: 13, fontWeight: 600, color: "#0e1d4f", textAlign: "left" }}>
                  {f.text}
                </p>
                <Check size={15} color="#22c55e" strokeWidth={2.5} style={{ flexShrink: 0 }} />
              </div>
            ))}
          </div>

          <div style={{ width: "100%", animation: "float-up 0.5s ease 0.75s both" }}>
            <ActionButton
              onClick={() => { window.location.href = "/profile"; }}
              style={{
                width: "100%", padding: "15px 0", borderRadius: 16, border: "none",
                background: iconBg, color: "#fff",
                fontFamily: "var(--font-jakarta), sans-serif", fontSize: 15, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
              } as React.CSSProperties}
            >
              {viewProfile}
            </ActionButton>
            <ActionButton
              onClick={() => {
                const from = sessionStorage.getItem("upgradeFrom") || "/";
                sessionStorage.removeItem("upgradeFrom");
                router.replace(from);
              }}
              style={{
                marginTop: 10, padding: "13px 0", width: "100%", borderRadius: 16, border: "none",
                background: "#f1f5f9", color: "#64748b",
                fontFamily: "var(--font-jakarta), sans-serif", fontSize: 14, fontWeight: 600,
                display: "flex", alignItems: "center", justifyContent: "center",
                touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
              } as React.CSSProperties}
            >
              Kembali
            </ActionButton>
          </div>
        </div>

        {/* ── Complete-profile nudge bottom sheet ───────────────────────── */}
        {showAddressNudge && (
          <div
            style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(0,0,0,0.45)", animation: "sheet-fade-in 0.25s ease both" }}
            onClick={() => setShowAddressNudge(false)}
          >
            <div
              style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                maxWidth: 448, margin: "0 auto",
                background: "#fff", borderRadius: "24px 24px 0 0",
                padding: "20px 20px 44px",
                animation: "sheet-slide-up 0.38s cubic-bezier(0.32,0.72,0,1) both",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ width: 36, height: 4, borderRadius: 999, background: "#e2e8f0", margin: "0 auto 20px" }} />
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
                <div style={{
                  width: 60, height: 60, borderRadius: 999,
                  background: "linear-gradient(135deg, #d97706, #f59e0b)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
                }}>✨</div>
              </div>
              <p style={{
                fontFamily: "var(--font-fraunces), Georgia, serif",
                fontSize: 19, fontWeight: 700, color: "#0e1d4f",
                textAlign: "center", margin: "0 0 8px",
              }}>
                Lengkapi profilmu!
              </p>
              <p style={{
                fontFamily: "var(--font-jakarta), sans-serif",
                fontSize: 13, color: "#64748b", lineHeight: 1.6,
                textAlign: "center", margin: "0 0 18px", padding: "0 8px",
              }}>
                Tambahkan foto profil, tanggal lahir, dan data anakmu untuk pengalaman yang lebih personal.
              </p>
              {/* What they can add */}
              <div style={{
                display: "flex", justifyContent: "center", gap: 20,
                margin: "0 0 24px",
              }}>
                {[["📸", "Foto profil"], ["🎂", "Tanggal lahir"], ["👦", "Data anak"]].map(([emoji, label]) => (
                  <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 22 }}>{emoji}</span>
                    <span style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 10, fontWeight: 700, color: "#94a3b8", textAlign: "center" }}>{label}</span>
                  </div>
                ))}
              </div>
              <ActionButton
                onClick={() => { window.location.href = "/profile?edit=1"; }}
                style={{
                  width: "100%", padding: "15px 0", borderRadius: 16, border: "none",
                  background: "linear-gradient(135deg, #d97706, #f59e0b)", color: "#fff",
                  fontFamily: "var(--font-jakarta), sans-serif", fontSize: 15, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                  boxShadow: "0 4px 16px rgba(217,119,6,0.35)",
                }}
              >
                Lengkapi Sekarang →
              </ActionButton>
              <ActionButton
                onClick={() => setShowAddressNudge(false)}
                style={{
                  marginTop: 10, width: "100%", padding: "13px 0", borderRadius: 16,
                  background: "transparent", color: "#94a3b8",
                  fontFamily: "var(--font-jakarta), sans-serif", fontSize: 14, fontWeight: 600,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                Nanti Saja
              </ActionButton>
            </div>
          </div>
        )}
      </>
    );
  }

  // ── Payment form ─────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 448, margin: "0 auto", minHeight: "100vh", background: "#f6f1e8" }}>

      {/* Header */}
      <div style={{
        background: "linear-gradient(150deg, #1f6b43 0%, #2e8a5a 55%, #3aab74 100%)",
        borderRadius: "0 0 28px 28px",
        padding: "44px 20px 24px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
          <div>
            <h1 style={{ margin: 0, fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 22, fontWeight: 700, color: "#fff", lineHeight: 1 }}>
              {t.paymentTitle}
            </h1>
            <p style={{ margin: "3px 0 0", fontFamily: "var(--font-jakarta), sans-serif", fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
              {productName} · {productSub}
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 20px 140px" }}>

        {/* Order summary */}
        <div style={{ background: "#fff", borderRadius: 18, padding: "18px", marginBottom: 20, border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(15,23,42,0.05)" }}>
          <p style={{ margin: "0 0 14px", fontSize: 10, fontWeight: 700, letterSpacing: 1.2, color: "#94a3b8", textTransform: "uppercase", fontFamily: "var(--font-jakarta), sans-serif" }}>
            {t.paymentOrderSummary}
          </p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: productBg,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, flexShrink: 0, color: "#fff",
              }}>
                {productIcon}
              </div>
              <div>
                <p style={{ margin: 0, fontFamily: "var(--font-jakarta), sans-serif", fontSize: 14, fontWeight: 700, color: "#0e1d4f" }}>
                  {productName}
                </p>
                <p style={{ margin: 0, fontFamily: "var(--font-jakarta), sans-serif", fontSize: 11, color: "#94a3b8" }}>
                  {productSub}
                </p>
              </div>
            </div>
            <p style={{ margin: 0, fontFamily: "var(--font-jakarta), sans-serif", fontSize: 15, fontWeight: 800, color: "#0e1d4f" }}>
              {price}
            </p>
          </div>
          <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 12, display: "flex", justifyContent: "space-between" }}>
            <p style={{ margin: 0, fontFamily: "var(--font-jakarta), sans-serif", fontSize: 13, color: "#64748b" }}>{t.paymentTotal}</p>
            <p style={{ margin: 0, fontFamily: "var(--font-jakarta), sans-serif", fontSize: 15, fontWeight: 800, color: "#0e1d4f" }}>
              {price}
            </p>
          </div>
        </div>

        {/* Payment methods */}
        <p style={{ margin: "0 0 12px", fontSize: 10, fontWeight: 700, letterSpacing: 1.2, color: "#94a3b8", textTransform: "uppercase", fontFamily: "var(--font-jakarta), sans-serif" }}>
          {t.paymentMethodLabel}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {t.paymentMethods.map((m) => {
            const isSelected = selectedMethod === m.id;
            return (
              <label key={m.id} style={{ display: "flex", alignItems: "center", gap: 14, background: "#fff", borderRadius: 14, padding: "14px 16px", border: `2px solid ${isSelected ? "#2e8a5a" : "#f1f5f9"}`, cursor: "pointer", transition: "border-color 0.15s" }}>
                <input type="radio" name="payment-method" value={m.id} checked={isSelected} onChange={() => setSelectedMethod(m.id)} style={{ position: "absolute", opacity: 0, width: 1, height: 1 }} />
                <span style={{ fontSize: 22, flexShrink: 0 }}>{m.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontFamily: "var(--font-jakarta), sans-serif", fontSize: 13, fontWeight: 700, color: "#0e1d4f" }}>{m.label}</p>
                  <p style={{ margin: 0, fontFamily: "var(--font-jakarta), sans-serif", fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{m.desc}</p>
                </div>
                <div style={{ width: 20, height: 20, borderRadius: 999, flexShrink: 0, border: `2px solid ${isSelected ? "#2e8a5a" : "#cbd5e1"}`, background: isSelected ? "#2e8a5a" : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {isSelected && <div style={{ width: 8, height: 8, borderRadius: 999, background: "#fff" }} />}
                </div>
              </label>
            );
          })}
        </div>

        {/* Security note */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", borderRadius: 12, background: "#f0fdf4", marginBottom: isLifetime ? 12 : 0 }}>
          <Shield size={16} color="#16a34a" strokeWidth={2} style={{ flexShrink: 0 }} />
          <p style={{ margin: 0, fontFamily: "var(--font-jakarta), sans-serif", fontSize: 11, color: "#15803d", lineHeight: 1.5 }}>
            {t.paymentSecureNote}
          </p>
        </div>

        {/* Non-refundable note for lifetime */}
        {isLifetime && (
          <p style={{ margin: 0, fontFamily: "var(--font-jakarta), sans-serif", fontSize: 11, color: "#94a3b8", lineHeight: 1.5, textAlign: "center" }}>
            {t.paymentNonRefundable}
          </p>
        )}
      </div>

      {/* Sticky Pay button */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 10, padding: "14px 20px", paddingBottom: "max(14px, env(safe-area-inset-bottom))", background: "#fff", borderTop: "1px solid #f1f5f9" }}>
        <div style={{ maxWidth: 448, margin: "0 auto" }}>
          <ActionButton
            onClick={handlePay}
            style={{
              width: "100%", padding: "15px 0", borderRadius: 16, border: "none",
              background: paying ? "#94a3b8" : isFeatured
                ? "linear-gradient(135deg, #f6b545, #e89a18)"
                : isLifetime
                ? "linear-gradient(135deg, #78350f 0%, #b45309 25%, #d97706 50%, #fbbf24 68%, #b45309 85%, #78350f 100%)"
                : "linear-gradient(135deg, #f59e0b, #d97706)",
              color: paying ? "#fff" : isFeatured ? "#3a2304" : "#fff",
              fontFamily: "var(--font-jakarta), sans-serif",
              fontSize: 15, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
              cursor: paying ? "not-allowed" : "pointer",
            } as React.CSSProperties}
          >
            {paying ? t.paymentProcessing : t.paymentPay(price)}
          </ActionButton>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense>
      <PaymentContent />
    </Suspense>
  );
}
