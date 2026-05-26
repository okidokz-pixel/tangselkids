"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, MessageSquare, Check } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/context/AuthContext";

export default function FeedbackPage() {
  const router    = useRouter();
  const { user }  = useAuth();

  const [topic,   setTopic]   = useState("");
  const [message, setMessage] = useState("");
  const [sent,    setSent]    = useState(false);

  const canSubmit = topic && message.trim().length >= 10;

  function handleSubmit() {
    if (!canSubmit) return;
    setSent(true);
  }

  const topicOptions = [
    { value: "suggestion",   label: "💡 Saran / Ide" },
    { value: "correction",   label: "✏️ Koreksi Info Tempat" },
    { value: "new-place",    label: "📍 Usul Tempat Baru" },
    { value: "bug",          label: "🐛 Bug / Masalah Teknis" },
    { value: "other",        label: "💬 Lainnya" },
  ];

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px", borderRadius: 14, fontSize: 14,
    border: "1.5px solid #e2e8f0", background: "#fff", outline: "none",
    fontFamily: "var(--font-jakarta), sans-serif", color: "#0f172a",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
    color: "#94a3b8", marginBottom: 6, display: "block",
  };

  return (
    <div style={{ maxWidth: 448, margin: "0 auto", minHeight: "100vh", background: "#fff", paddingBottom: 100 }}>

      {/* Header */}
      <div style={{
        padding: "52px 20px 24px",
        background: "linear-gradient(135deg, #1f6b43 0%, #2e8a5a 100%)",
        borderRadius: "0 0 32px 32px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            type="button"
            onClick={() => router.back()}
            onTouchEnd={(e) => { e.preventDefault(); router.back(); }}
            style={{
              width: 36, height: 36, borderRadius: 999, border: "none", cursor: "pointer",
              background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
            } as React.CSSProperties}
          >
            <ChevronLeft size={20} color="white" />
          </button>
          <div>
            <h1 style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 22, fontWeight: 700, color: "#fff", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <MessageSquare size={20} /> Kirim Masukan
            </h1>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, marginTop: 2, fontFamily: "var(--font-jakarta), sans-serif" }}>
              Bantu kami terus berkembang
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding: "24px 20px" }}>

        {/* Success state */}
        {sent ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "48px 0", gap: 16 }}>
            <div style={{ width: 80, height: 80, borderRadius: 999, background: "#e6f4ed", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Check size={38} color="#2e8a5a" strokeWidth={2.5} />
            </div>
            <h2 style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 24, fontWeight: 700, color: "#0e1d4f", margin: "8px 0 0" }}>
              Terima kasih! 🙌
            </h2>
            <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6, maxWidth: 280, margin: 0, fontFamily: "var(--font-jakarta), sans-serif" }}>
              Masukan kamu sudah kami terima. Tim TangselKids akan meninjau dan menghubungi kamu jika diperlukan.
            </p>
            <button
              type="button"
              onClick={() => router.back()}
              onTouchEnd={(e) => { e.preventDefault(); router.back(); }}
              style={{
                marginTop: 8, padding: "12px 28px", borderRadius: 999, border: "none", cursor: "pointer",
                background: "linear-gradient(135deg, #1f6b43, #2e8a5a)", color: "#fff",
                fontSize: 14, fontWeight: 700, touchAction: "manipulation",
                fontFamily: "var(--font-jakarta), sans-serif",
              } as React.CSSProperties}
            >
              Kembali
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Topic */}
            <div>
              <label style={labelStyle}>Topik <span style={{ color: "#ef4444" }}>*</span></label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                style={{
                  ...inputStyle,
                  appearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 14px center",
                  paddingRight: 40,
                  color: topic ? "#0f172a" : "#94a3b8",
                } as React.CSSProperties}
              >
                <option value="" disabled>Pilih topik…</option>
                {topicOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div>
              <label style={labelStyle}>Pesan <span style={{ color: "#ef4444" }}>*</span></label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tulis masukan, saran, atau informasi kamu di sini..."
                rows={5}
                style={{ ...inputStyle, resize: "none" }}
              />
              <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, textAlign: "right", fontFamily: "var(--font-jakarta), sans-serif" }}>
                {message.length} karakter
              </p>
            </div>

            {/* Submit */}
            <button
              type="button"
              onClick={handleSubmit}
              onTouchEnd={(e) => { e.preventDefault(); handleSubmit(); }}
              disabled={!canSubmit}
              style={{
                width: "100%", padding: "15px 0", borderRadius: 16, border: "none", cursor: canSubmit ? "pointer" : "default",
                background: "linear-gradient(135deg, #1f6b43, #2e8a5a)", color: "#fff",
                fontSize: 15, fontWeight: 700, opacity: canSubmit ? 1 : 0.4,
                touchAction: "manipulation", fontFamily: "var(--font-jakarta), sans-serif",
              } as React.CSSProperties}
            >
              Kirim Masukan 📨
            </button>
          </div>
        )}
      </div>

      <BottomNav active="profile" />
    </div>
  );
}
