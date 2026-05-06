"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, HelpCircle, ChevronDown } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { ActionButton } from "@/components/ActionButton";
import { useAuth } from "@/context/AuthContext";

const faqs = [
  {
    q: "Apa itu TangselKids?",
    a: "TangselKids adalah direktori hyperlokal untuk orang tua di Tangerang Selatan. Kami mengumpulkan dan mengkurasi informasi tentang sekolah, daycare, tempat bermain, kursus, klinik, kafe, dan banyak lagi — semuanya dikurasi oleh sesama orang tua.",
  },
  {
    q: "Bagaimana cara mencari tempat terdekat?",
    a: "Kamu bisa menggunakan tombol 'Gunakan Lokasiku' saat mendaftar atau mengedit profil. Sistem akan mendeteksi lokasi rumahmu dan menampilkan tempat-tempat yang paling dekat denganmu.",
  },
  {
    q: "Apakah data saya aman?",
    a: "Data kamu disimpan secara lokal di perangkatmu dan tidak dibagikan ke pihak ketiga tanpa izin. Nomor HP hanya digunakan untuk verifikasi identitas saat mendaftar.",
  },
  {
    q: "Bagaimana cara menyimpan tempat favorit?",
    a: "Buka halaman detail tempat, lalu klik ikon hati (❤) di bagian atas halaman. Tempat akan tersimpan di halaman 'Favorit' dan bisa diakses kapan saja.",
  },
  {
    q: "Bagaimana cara menulis ulasan?",
    a: "Buka halaman detail tempat yang ingin kamu ulas, scroll ke bawah dan klik tombol 'Tulis Ulasan'. Isi rating bintang dan komentarmu, lalu kirim. Ulasan akan ditampilkan setelah diverifikasi tim kami.",
  },
  {
    q: "Apakah informasi tempat selalu up-to-date?",
    a: "Kami berusaha menjaga informasi tetap akurat, namun harga, jam buka, dan detail lainnya bisa berubah sewaktu-waktu. Jika kamu menemukan informasi yang tidak akurat, silakan kirim koreksi melalui menu 'Kirim Masukan'.",
  },
  {
    q: "Bagaimana cara mendaftarkan tempat saya?",
    a: "Pergi ke menu 'Daftarkan Tempatmu' di halaman beranda dan isi formulir pendaftaran. Tim kami akan menghubungi kamu dalam 2–3 hari kerja.",
  },
  {
    q: "Bagaimana cara mengganti bahasa aplikasi?",
    a: "Kamu bisa mengubah bahasa di mana saja — cukup tekan tombol toggle bendera (🇮🇩 / 🇬🇧) di sudut kanan atas halaman. Perubahan langsung berlaku.",
  },
  {
    q: "Bagaimana cara menghapus akun saya?",
    a: "Untuk saat ini, kamu bisa menekan tombol 'Log Out' di halaman Profil untuk keluar dari akun. Jika ingin menghapus data sepenuhnya, silakan hubungi kami melalui menu 'Kirim Masukan'.",
  },
];

export default function HelpPage() {
  const router = useRouter();
  const { tier } = useAuth();
  const [open, setOpen] = useState<number | null>(null);
  const [showUpgradeSheet, setShowUpgradeSheet] = useState(false);

  function toggle(i: number) {
    setOpen((prev) => (prev === i ? null : i));
  }

  return (
    <div style={{ maxWidth: 448, margin: "0 auto", minHeight: "100vh", background: "#f6f1e8", paddingBottom: 100 }}>

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
              <HelpCircle size={20} /> Bantuan & FAQ
            </h1>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, marginTop: 2, fontFamily: "var(--font-jakarta), sans-serif" }}>
              Pertanyaan yang sering ditanyakan
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", gap: 10 }}>

        {faqs.map((faq, i) => (
          <div
            key={i}
            style={{
              background: "#fff",
              borderRadius: 16,
              border: `1.5px solid ${open === i ? "#a7d4bc" : "#e2e8f0"}`,
              overflow: "clip",
              boxShadow: open === i ? "0 4px 16px rgba(30,63,176,0.08)" : "0 1px 4px rgba(15,23,42,0.04)",
              transition: "border-color 0.2s ease, box-shadow 0.2s ease",
            }}
          >
            {/* Question row */}
            <button
              type="button"
              onClick={() => toggle(i)}
              onTouchEnd={(e) => { e.preventDefault(); toggle(i); }}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                gap: 12, padding: "14px 16px", background: "none", border: "none", cursor: "pointer",
                textAlign: "left", touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
              } as React.CSSProperties}
            >
              <span style={{ fontSize: 14, fontWeight: 600, color: "#0e1d4f", lineHeight: 1.4, fontFamily: "var(--font-jakarta), sans-serif", flex: 1 }}>
                {faq.q}
              </span>
              <ChevronDown
                size={18}
                color="#64748b"
                style={{
                  flexShrink: 0,
                  transform: open === i ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.22s ease",
                }}
              />
            </button>

            {/* Answer */}
            {open === i && (
              <div style={{ padding: "0 16px 16px" }}>
                <div style={{ height: 1, background: "#f1f5f9", marginBottom: 12 }} />
                <p style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.65, margin: 0, fontFamily: "var(--font-jakarta), sans-serif" }}>
                  {faq.a}
                </p>
              </div>
            )}
          </div>
        ))}

        {/* Still need help */}
        <div style={{
          marginTop: 8, padding: "20px", borderRadius: 20,
          background: tier === "premium" ? "linear-gradient(135deg, #e6f4ed, #e6f4ed)" : "#f1f5f9",
          border: tier === "premium" ? "1.5px solid #a7d4bc" : "1.5px dashed #cbd5e1",
          textAlign: "center",
        }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#0e1d4f", margin: "0 0 4px", fontFamily: "var(--font-fraunces), Georgia, serif" }}>
            Masih ada pertanyaan?
          </p>
          <p style={{ fontSize: 12.5, color: "#475569", margin: "0 0 14px", lineHeight: 1.5, fontFamily: "var(--font-jakarta), sans-serif" }}>
            {tier === "premium" ? "Kami siap membantu kamu langsung." : "Fitur ini tersedia untuk pengguna Premium."}
          </p>
          {tier === "premium" ? (
            <a
              href="/feedback"
              style={{
                display: "inline-block", padding: "10px 24px", borderRadius: 999,
                background: "linear-gradient(135deg, #1f6b43, #2e8a5a)", color: "#fff",
                fontSize: 13, fontWeight: 700, textDecoration: "none",
                fontFamily: "var(--font-jakarta), sans-serif",
              }}
            >
              Kirim Pertanyaan →
            </a>
          ) : (
            <ActionButton
              onClick={() => setShowUpgradeSheet(true)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "10px 24px", borderRadius: 999,
                background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#fff",
                fontSize: 13, fontWeight: 700,
                fontFamily: "var(--font-jakarta), sans-serif",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Upgrade ke Premium
            </ActionButton>
          )}
        </div>
      </div>

      <BottomNav active="profile" />

      {/* Upgrade sheet */}
      {showUpgradeSheet && (
        <>
          <style>{`
            @keyframes pu-fade-in  { from { opacity: 0; } to { opacity: 1; } }
            @keyframes pu-slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
          `}</style>
          <div
            onClick={() => setShowUpgradeSheet(false)}
            style={{ position: "fixed", inset: 0, zIndex: 1000,
              background: "rgba(0,0,0,0.45)", animation: "pu-fade-in 0.25s ease both" }}
          />
          <div
            style={{ position: "fixed", bottom: 0, left: 0, right: 0,
              maxWidth: 448, margin: "0 auto",
              background: "#fff", borderRadius: "24px 24px 0 0",
              padding: "20px 20px 40px", zIndex: 1001,
              boxShadow: "0 -8px 40px rgba(0,0,0,0.20)",
              animation: "pu-slide-up 0.38s cubic-bezier(0.32,0.72,0,1) both" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ width: 36, height: 4, borderRadius: 999, background: "#e2e8f0", margin: "0 auto 24px" }} />
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: 999,
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30 }}>
                ⭐
              </div>
            </div>
            <p style={{ fontFamily: "var(--font-fraunces), Georgia, serif",
              fontSize: 20, fontWeight: 700, color: "#0e1d4f",
              textAlign: "center", margin: "0 0 8px" }}>
              Fitur Premium
            </p>
            <p style={{ fontFamily: "var(--font-jakarta), sans-serif",
              fontSize: 13, color: "#64748b", lineHeight: 1.6,
              textAlign: "center", margin: "0 0 24px" }}>
              Kirim pertanyaan dan masukan langsung ke tim kami. Upgrade ke Premium untuk mengakses fitur ini.
            </p>
            <ActionButton
              onClick={() => { setShowUpgradeSheet(false); router.push("/upgrade"); }}
              style={{ width: "100%", padding: "15px 0", borderRadius: 16, border: "none",
                background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#fff",
                fontFamily: "var(--font-jakarta), sans-serif",
                fontSize: 15, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                touchAction: "manipulation", WebkitTapHighlightColor: "transparent" } as React.CSSProperties}
            >
              Upgrade ke Premium →
            </ActionButton>
            <ActionButton
              onClick={() => setShowUpgradeSheet(false)}
              style={{ width: "100%", marginTop: 10, padding: "13px 0", borderRadius: 16, border: "none",
                background: "#f1f5f9", color: "#64748b",
                fontFamily: "var(--font-jakarta), sans-serif",
                fontSize: 14, fontWeight: 600,
                display: "flex", alignItems: "center", justifyContent: "center",
                touchAction: "manipulation", WebkitTapHighlightColor: "transparent" } as React.CSSProperties}
            >
              Nanti saja
            </ActionButton>
          </div>
        </>
      )}
    </div>
  );
}
