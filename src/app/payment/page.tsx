"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Check, Shield } from "lucide-react";
import { ActionButton } from "@/components/ActionButton";
import { useAuth } from "@/context/AuthContext";

// Payment method options — Midtrans will populate these dynamically
const PAYMENT_METHODS = [
  { id: "bca", label: "BCA Virtual Account", icon: "🏦", desc: "Transfer via ATM, m-Banking, atau internet banking" },
  { id: "gopay", label: "GoPay", icon: "💚", desc: "Bayar langsung dari aplikasi Gojek" },
  { id: "ovo", label: "OVO", icon: "💜", desc: "Bayar langsung dari aplikasi OVO" },
  { id: "qris", label: "QRIS", icon: "📱", desc: "Scan QR code dengan aplikasi apapun" },
  { id: "cc", label: "Kartu Kredit / Debit", icon: "💳", desc: "Visa, Mastercard, JCB" },
];

export default function PaymentPage() {
  const router = useRouter();
  const { upgradeToPremium } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState("bca");
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handlePay() {
    setPaying(true);
    // TODO: Replace this block with Midtrans Snap integration:
    //   const token = await fetch("/api/midtrans/token", { method: "POST", ... }).then(r => r.json());
    //   window.snap.pay(token, { onSuccess: () => { upgradeToPremium(); setSuccess(true); }, ... });
    await new Promise((r) => setTimeout(r, 1800)); // simulate network delay
    upgradeToPremium();
    setPaying(false);
    setSuccess(true);
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div style={{ maxWidth: 448, margin: "0 auto", minHeight: "100vh", background: "#f8fafc",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "40px 28px", textAlign: "center" }}>

        {/* Checkmark circle */}
        <div style={{
          width: 88, height: 88, borderRadius: 999,
          background: "linear-gradient(135deg, #22c55e, #16a34a)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 24,
          boxShadow: "0 8px 24px rgba(34,197,94,0.35)",
        }}>
          <Check size={42} color="white" strokeWidth={2.5} />
        </div>

        <h1 style={{
          margin: "0 0 10px",
          fontFamily: "var(--font-fraunces), Georgia, serif",
          fontSize: 26, fontWeight: 700, color: "#1e3a5f",
        }}>
          Selamat, kamu Premium!
        </h1>
        <p style={{
          margin: "0 0 32px",
          fontFamily: "var(--font-jakarta), sans-serif",
          fontSize: 13, color: "#64748b", lineHeight: 1.65,
        }}>
          Akun Premium kamu aktif selama 30 hari. Nikmati akses penuh ke semua fitur TangselKids.
        </p>

        <ActionButton
          onClick={() => router.replace("/profile")}
          style={{
            width: "100%", padding: "15px 0", borderRadius: 16, border: "none",
            background: "linear-gradient(135deg, #1e3a5f, #2563eb)",
            color: "#fff",
            fontFamily: "var(--font-jakarta), sans-serif",
            fontSize: 15, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
          }}
        >
          Lihat Profil Saya
        </ActionButton>
        <ActionButton
          onClick={() => router.replace("/")}
          style={{
            marginTop: 10, padding: "13px 0", width: "100%", borderRadius: 16, border: "none",
            background: "#f1f5f9", color: "#64748b",
            fontFamily: "var(--font-jakarta), sans-serif",
            fontSize: 14, fontWeight: 600,
            display: "flex", alignItems: "center", justifyContent: "center",
            touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
          }}
        >
          Kembali ke Beranda
        </ActionButton>
      </div>
    );
  }

  // ── Payment form ───────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 448, margin: "0 auto", minHeight: "100vh", background: "#f8fafc" }}>

      {/* Header */}
      <div style={{
        background: "linear-gradient(150deg, #1e3a5f 0%, #1d4ed8 55%, #3b82f6 100%)",
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
            <h1 style={{
              margin: 0,
              fontFamily: "var(--font-fraunces), Georgia, serif",
              fontSize: 22, fontWeight: 700, color: "#fff", lineHeight: 1,
            }}>
              Pembayaran
            </h1>
            <p style={{
              margin: "3px 0 0",
              fontFamily: "var(--font-jakarta), sans-serif",
              fontSize: 12, color: "rgba(255,255,255,0.6)",
            }}>
              TangselKids Premium · 30 hari
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 20px 120px" }}>

        {/* Order summary */}
        <div style={{
          background: "#fff", borderRadius: 18,
          padding: "18px", marginBottom: 20,
          border: "1px solid #f1f5f9",
          boxShadow: "0 1px 3px rgba(15,23,42,0.05)",
        }}>
          <p style={{
            margin: "0 0 14px",
            fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
            color: "#94a3b8", textTransform: "uppercase",
            fontFamily: "var(--font-jakarta), sans-serif",
          }}>
            Ringkasan Pesanan
          </p>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, flexShrink: 0,
              }}>⭐</div>
              <div>
                <p style={{ margin: 0, fontFamily: "var(--font-jakarta), sans-serif", fontSize: 14, fontWeight: 700, color: "#1e3a5f" }}>
                  TangselKids Premium
                </p>
                <p style={{ margin: 0, fontFamily: "var(--font-jakarta), sans-serif", fontSize: 11, color: "#94a3b8" }}>
                  Langganan 1 bulan
                </p>
              </div>
            </div>
            <p style={{ margin: 0, fontFamily: "var(--font-jakarta), sans-serif", fontSize: 15, fontWeight: 800, color: "#1e3a5f" }}>
              Rp 29.000
            </p>
          </div>

          <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 12, display: "flex", justifyContent: "space-between" }}>
            <p style={{ margin: 0, fontFamily: "var(--font-jakarta), sans-serif", fontSize: 13, color: "#64748b" }}>Total</p>
            <p style={{ margin: 0, fontFamily: "var(--font-jakarta), sans-serif", fontSize: 15, fontWeight: 800, color: "#1e3a5f" }}>
              Rp 29.000
            </p>
          </div>
        </div>

        {/* Payment methods */}
        <p style={{
          margin: "0 0 12px",
          fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
          color: "#94a3b8", textTransform: "uppercase",
          fontFamily: "var(--font-jakarta), sans-serif",
        }}>
          Metode Pembayaran
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {PAYMENT_METHODS.map((m) => {
            const isSelected = selectedMethod === m.id;
            return (
              <label
                key={m.id}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  background: "#fff",
                  borderRadius: 14,
                  padding: "14px 16px",
                  border: `2px solid ${isSelected ? "#1d4ed8" : "#f1f5f9"}`,
                  cursor: "pointer",
                  transition: "border-color 0.15s",
                }}
              >
                <input
                  type="radio"
                  name="payment-method"
                  value={m.id}
                  checked={isSelected}
                  onChange={() => setSelectedMethod(m.id)}
                  style={{ position: "absolute", opacity: 0, width: 1, height: 1 }}
                />
                <span style={{ fontSize: 22, flexShrink: 0 }}>{m.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontFamily: "var(--font-jakarta), sans-serif", fontSize: 13, fontWeight: 700, color: "#1e3a5f" }}>
                    {m.label}
                  </p>
                  <p style={{ margin: 0, fontFamily: "var(--font-jakarta), sans-serif", fontSize: 11, color: "#94a3b8", marginTop: 1 }}>
                    {m.desc}
                  </p>
                </div>
                <div style={{
                  width: 20, height: 20, borderRadius: 999, flexShrink: 0,
                  border: `2px solid ${isSelected ? "#1d4ed8" : "#cbd5e1"}`,
                  background: isSelected ? "#1d4ed8" : "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {isSelected && <div style={{ width: 8, height: 8, borderRadius: 999, background: "#fff" }} />}
                </div>
              </label>
            );
          })}
        </div>

        {/* Security note */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", borderRadius: 12, background: "#f0fdf4" }}>
          <Shield size={16} color="#16a34a" strokeWidth={2} style={{ flexShrink: 0 }} />
          <p style={{ margin: 0, fontFamily: "var(--font-jakarta), sans-serif", fontSize: 11, color: "#15803d", lineHeight: 1.5 }}>
            Pembayaran diproses secara aman melalui Midtrans. Data kartu kamu tidak disimpan.
          </p>
        </div>
      </div>

      {/* Sticky Pay button */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 10,
        padding: "14px 20px", paddingBottom: "max(14px, env(safe-area-inset-bottom))",
        background: "#fff", borderTop: "1px solid #f1f5f9",
      }}>
        <div style={{ maxWidth: 448, margin: "0 auto" }}>
          <ActionButton
            onClick={handlePay}
            style={{
              width: "100%", padding: "15px 0", borderRadius: 16, border: "none",
              background: paying
                ? "#94a3b8"
                : "linear-gradient(135deg, #f59e0b, #d97706)",
              color: "#fff",
              fontFamily: "var(--font-jakarta), sans-serif",
              fontSize: 15, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
              cursor: paying ? "not-allowed" : "pointer",
            }}
          >
            {paying ? "Memproses pembayaran…" : "Bayar Rp 29.000"}
          </ActionButton>
        </div>
      </div>

    </div>
  );
}
