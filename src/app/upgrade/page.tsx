"use client";
import { useRouter } from "next/navigation";
import { ChevronLeft, Check } from "lucide-react";
import { ActionButton } from "@/components/ActionButton";
import { useAuth } from "@/context/AuthContext";

const BENEFITS = [
  {
    emoji: "📊",
    title: "Data SPP & Uang Pangkal",
    desc: "Lihat biaya lengkap setiap sekolah — SPP bulanan, uang pangkal, dan kurikulum — tanpa blur.",
  },
  {
    emoji: "⚖️",
    title: "Bandingkan Sekolah",
    desc: "Bandingkan hingga 3 sekolah sekaligus: biaya, kurikulum, jenjang, dan rating.",
  },
  {
    emoji: "✍️",
    title: "Tulis Ulasan",
    desc: "Bagikan pengalamanmu dan bantu ribuan orang tua lain membuat keputusan terbaik.",
  },
  {
    emoji: "❤️",
    title: "Simpan Tanpa Batas",
    desc: "Simpan sebanyak apapun tempat favoritmu. Akun gratis dibatasi 5 tempat.",
  },
  {
    emoji: "🔔",
    title: "Notifikasi PSB (Segera Hadir)",
    desc: "Dapatkan notifikasi otomatis saat sekolah pilihanmu membuka pendaftaran siswa baru.",
  },
];

export default function UpgradePage() {
  const router = useRouter();
  const { tier } = useAuth();

  return (
    <div style={{ maxWidth: 448, margin: "0 auto", minHeight: "100vh", background: "#f8fafc" }}>

      {/* Header */}
      <div style={{
        background: "linear-gradient(150deg, #1e3a5f 0%, #1d4ed8 55%, #3b82f6 100%)",
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
            ⭐ PREMIUM
          </span>
        </div>

        <h1 style={{
          margin: "0 0 8px",
          fontFamily: "var(--font-fraunces), Georgia, serif",
          fontSize: 30, fontWeight: 700, color: "#fff",
          textAlign: "center", lineHeight: 1.2,
        }}>
          Akses Penuh,<br />Keputusan Terbaik
        </h1>
        <p style={{
          margin: 0,
          fontFamily: "var(--font-jakarta), sans-serif",
          fontSize: 13, color: "rgba(255,255,255,0.65)",
          textAlign: "center", lineHeight: 1.6,
        }}>
          Semua yang kamu butuhkan untuk memilih tempat terbaik bagi si kecil.
        </p>

        {/* Price pill */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
          <div style={{
            background: "rgba(255,255,255,0.15)",
            borderRadius: 16, padding: "12px 24px",
            textAlign: "center",
          }}>
            <p style={{
              margin: 0,
              fontFamily: "var(--font-fraunces), Georgia, serif",
              fontSize: 28, fontWeight: 700, color: "#fff", lineHeight: 1,
            }}>
              Rp 29.000
            </p>
            <p style={{
              margin: "4px 0 0",
              fontFamily: "var(--font-jakarta), sans-serif",
              fontSize: 12, color: "rgba(255,255,255,0.6)",
            }}>
              per bulan · batalkan kapan saja
            </p>
          </div>
        </div>
      </div>

      {/* Benefits list */}
      <div style={{ padding: "28px 20px 0" }}>
        <p style={{
          margin: "0 0 16px",
          fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
          color: "#94a3b8", textTransform: "uppercase",
          fontFamily: "var(--font-jakarta), sans-serif",
        }}>
          Yang kamu dapatkan
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: "16px",
                display: "flex", alignItems: "flex-start", gap: 14,
                border: "1px solid #f1f5f9",
                boxShadow: "0 1px 3px rgba(15,23,42,0.05)",
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "#eff6ff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, flexShrink: 0,
              }}>
                {b.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{
                  margin: "0 0 3px",
                  fontFamily: "var(--font-jakarta), sans-serif",
                  fontSize: 14, fontWeight: 700, color: "#1e3a5f",
                }}>
                  {b.title}
                </p>
                <p style={{
                  margin: 0,
                  fontFamily: "var(--font-jakarta), sans-serif",
                  fontSize: 12, color: "#64748b", lineHeight: 1.55,
                }}>
                  {b.desc}
                </p>
              </div>
              <Check size={16} color="#22c55e" strokeWidth={2.5} style={{ flexShrink: 0, marginTop: 2 }} />
            </div>
          ))}
        </div>

        {/* Free vs Premium compare note */}
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
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#94a3b8", fontFamily: "var(--font-jakarta), sans-serif" }}>Gratis</p>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: "#1d4ed8", fontFamily: "var(--font-jakarta), sans-serif" }}>Premium</p>

            {[
              ["Lihat listing", "✓", "✓"],
              ["Filter & urutkan", "✓", "✓"],
              ["Simpan tempat", "5", "∞"],
              ["Data SPP & biaya", "—", "✓"],
              ["Kurikulum sekolah", "—", "✓"],
              ["Bandingkan sekolah", "—", "✓"],
              ["Tulis ulasan", "—", "✓"],
              ["Notifikasi PSB", "—", "✓"],
            ].map(([label, free, prem]) => (
              <>
                <p key={label} style={{ margin: 0, fontSize: 12, color: "#374151", fontFamily: "var(--font-jakarta), sans-serif", textAlign: "left", padding: "6px 0", borderTop: "1px solid #f8fafc" }}>{label}</p>
                <p key={label + "f"} style={{ margin: 0, fontSize: 12, color: free === "—" ? "#d1d5db" : "#374151", fontFamily: "var(--font-jakarta), sans-serif", padding: "6px 0", borderTop: "1px solid #f8fafc" }}>{free}</p>
                <p key={label + "p"} style={{ margin: 0, fontSize: 12, color: prem === "—" ? "#d1d5db" : "#1d4ed8", fontWeight: 700, fontFamily: "var(--font-jakarta), sans-serif", padding: "6px 0", borderTop: "1px solid #f8fafc" }}>{prem}</p>
              </>
            ))}
          </div>
        </div>

        <p style={{
          textAlign: "center", marginTop: 14,
          fontSize: 11, color: "#94a3b8",
          fontFamily: "var(--font-jakarta), sans-serif",
        }}>
          Tanpa kontrak · Batalkan kapan saja
        </p>
      </div>

      {/* Sticky CTA */}
      <div style={{
        position: "sticky", bottom: 0,
        padding: "14px 20px", paddingBottom: "max(14px, env(safe-area-inset-bottom))",
        background: "#fff", borderTop: "1px solid #f1f5f9",
        marginTop: 24,
      }}>
        {tier === "premium" ? (
          <div style={{
            width: "100%", padding: "15px 0", borderRadius: 16,
            background: "#f0fdf4", border: "2px solid #bbf7d0",
            fontFamily: "var(--font-jakarta), sans-serif",
            fontSize: 15, fontWeight: 700, color: "#15803d",
            textAlign: "center",
          }}>
            ✓ Kamu sudah Premium
          </div>
        ) : (
          <ActionButton
            onClick={() => router.push("/payment")}
            style={{
              width: "100%", padding: "15px 0", borderRadius: 16, border: "none",
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              color: "#fff",
              fontFamily: "var(--font-jakarta), sans-serif",
              fontSize: 15, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
              touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
            }}
          >
            Bayar Sekarang · Rp 29.000
          </ActionButton>
        )}
      </div>

    </div>
  );
}
