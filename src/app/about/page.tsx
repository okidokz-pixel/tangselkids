"use client";
import { useRouter } from "next/navigation";
import { ChevronLeft, MapPin, Heart, Star, Users } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

const features = [
  { icon: MapPin, label: "Direktori Lengkap", desc: "Sekolah, daycare, kursus, playground, kafe, dan banyak lagi — semua dalam satu tempat." },
  { icon: Star,   label: "Review Jujur",      desc: "Ulasan dari sesama orang tua di Tangerang Selatan yang bisa kamu percaya." },
  { icon: Users,  label: "Komunitas Lokal",   desc: "Dibuat oleh orang tua Tangsel, untuk orang tua Tangsel." },
];

export default function AboutPage() {
  const router = useRouter();

  return (
    <div style={{ maxWidth: 448, margin: "0 auto", minHeight: "100vh", background: "#EFF6FF", paddingBottom: 100 }}>

      {/* Header */}
      <div style={{
        padding: "52px 20px 32px",
        background: "linear-gradient(160deg, #0F1E3C 0%, #1A3A6C 60%, #2563EB 100%)",
        borderRadius: "0 0 32px 32px",
      }}>
        <button
          type="button"
          onClick={() => router.back()}
          onTouchEnd={(e) => { e.preventDefault(); router.back(); }}
          style={{
            width: 36, height: 36, borderRadius: 999, border: "none", cursor: "pointer",
            background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center",
            justifyContent: "center", marginBottom: 24,
            touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
          } as React.CSSProperties}
        >
          <ChevronLeft size={20} color="white" />
        </button>

        {/* Logo + name */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: "linear-gradient(135deg, #1e3fb0, #3a64ee)",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "2px solid rgba(255,255,255,0.25)",
            flexShrink: 0,
          }}>
            <MapPin size={24} color="#fff" strokeWidth={1.75} />
          </div>
          <div>
            <h1 style={{
              fontFamily: "var(--font-fraunces), Georgia, serif",
              fontSize: 26, fontWeight: 700, color: "#fff",
              margin: 0, letterSpacing: -0.5,
            }}>
              TangselKids
            </h1>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, margin: "2px 0 0", fontFamily: "var(--font-jakarta), sans-serif" }}>
              Versi 1.0 · Bintaro, Tangerang Selatan
            </p>
          </div>
        </div>

        <p style={{
          fontSize: 14.5, color: "rgba(255,255,255,0.80)",
          lineHeight: 1.65, margin: 0,
          fontFamily: "var(--font-jakarta), sans-serif",
        }}>
          TangselKids adalah direktori hyperlokal untuk orang tua di Tangerang Selatan — membantu kamu menemukan sekolah, daycare, tempat kursus, playground, dan banyak tempat seru lainnya di sekitar rumah.
        </p>
      </div>

      <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* Feature highlights */}
        {features.map(({ icon: Icon, label, desc }) => (
          <div key={label} style={{
            background: "#fff", borderRadius: 18, padding: "16px 18px",
            display: "flex", alignItems: "flex-start", gap: 14,
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 0 rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.05)",
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              background: "#EFF6FF",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon size={20} color="#1d4ed8" strokeWidth={1.75} />
            </div>
            <div>
              <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>
                {label}
              </p>
              <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 13, color: "#64748b", margin: 0, lineHeight: 1.55 }}>
                {desc}
              </p>
            </div>
          </div>
        ))}

        {/* Mission card */}
        <div style={{
          background: "linear-gradient(135deg, #0F1E3C, #1D4ED8)",
          borderRadius: 18, padding: "20px 20px",
          marginTop: 4,
        }}>
          <p style={{
            fontFamily: "var(--font-fraunces), Georgia, serif",
            fontSize: 17, fontWeight: 600, color: "#fff",
            margin: "0 0 8px", lineHeight: 1.4,
          }}>
            "Semua yang kamu butuhkan untuk tumbuh kembang si kecil, dalam genggamanmu."
          </p>
          <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 12.5, color: "rgba(255,255,255,0.60)", margin: 0 }}>
            Misi kami
          </p>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", padding: "16px 0 8px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 4 }}>
            <Heart size={13} color="#ef4444" fill="#ef4444" />
            <span style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 12, color: "#94a3b8" }}>
              Made with love for parents in Tangsel
            </span>
          </div>
          <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 11, color: "#cbd5e1", margin: 0 }}>
            © 2026 TangselKids. All rights reserved.
          </p>
        </div>
      </div>

      <BottomNav active="profile" />
    </div>
  );
}
