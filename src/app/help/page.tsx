"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, HelpCircle, ChevronDown } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

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
  const [open, setOpen] = useState<number | null>(null);

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
          background: "linear-gradient(135deg, #e6f4ed, #e6f4ed)",
          border: "1.5px solid #a7d4bc", textAlign: "center",
        }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#0e1d4f", margin: "0 0 4px", fontFamily: "var(--font-fraunces), Georgia, serif" }}>
            Masih ada pertanyaan?
          </p>
          <p style={{ fontSize: 12.5, color: "#475569", margin: "0 0 14px", lineHeight: 1.5, fontFamily: "var(--font-jakarta), sans-serif" }}>
            Kami siap membantu kamu langsung.
          </p>
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
        </div>
      </div>

      <BottomNav active="profile" />
    </div>
  );
}
