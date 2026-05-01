"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import {
  ChevronLeft, ChevronRight, X, MapPin, Clock, Phone,
  Heart, Pencil, Star, Globe, Play, Check, Lock,
} from "lucide-react";
import { places, formatPriceRange, getAreaGroup, formatPrice } from "@/lib/mockData";
import { useLang } from "@/context/LanguageContext";
import { ActionButton } from "@/components/ActionButton";
import { getReviewForPlace, type UserReview } from "@/lib/reviewsStorage";
import { useAuth } from "@/context/AuthContext";
import { PremiumGate } from "@/components/PremiumGate";
import { PremiumGuestSheet } from "@/components/PremiumGuestSheet";
import { FilterGateSheet } from "@/components/FilterGateSheet";
import { useRegisterSheet } from "@/context/RegisterSheetContext";

// ── Social icon SVGs ──────────────────────────────────────────────────────────
function InstagramIcon({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.2" fill={color} stroke="none" />
    </svg>
  );
}
function FacebookIcon({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}
function TikTokIcon({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.56a8.16 8.16 0 0 0 4.77 1.52V7.65a4.85 4.85 0 0 1-1-.96z" />
    </svg>
  );
}

// ── Category colours ──────────────────────────────────────────────────────────
const categoryColor: Record<string, { bg: string; text: string }> = {
  school:            { bg: "#DBEAFE", text: "#1E3A5F" },
  "learning-center": { bg: "#DBEAFE", text: "#1E40AF" },
  daycare:           { bg: "#FCE7F3", text: "#9D174D" },
  playground:        { bg: "#FEF3C7", text: "#92400E" },
  clinic:            { bg: "#D1FAE5", text: "#065F46" },
  cafe:              { bg: "#FEF3C7", text: "#92400E" },
  "mini-zoo":        { bg: "#D1FAE5", text: "#065F46" },
  "swimming-pool":   { bg: "#DBEAFE", text: "#1E3A5F" },
  bookstore:         { bg: "#EDE9FE", text: "#5B21B6" },
};

// ── About extra paragraphs (dummy) ────────────────────────────────────────────
const aboutExtra: Partial<Record<string, string[]>> = {
  school: [
    "Fasilitas sekolah mencakup ruang kelas ber-AC yang nyaman, laboratorium sains, perpustakaan dengan koleksi lebih dari 5.000 judul buku, lapangan olahraga multifungsi, dan kantin sehat. Setiap sudut lingkungan dirancang untuk mendorong rasa ingin tahu dan kreativitas siswa.",
    "Program ekstrakurikuler sangat beragam—mulai dari pramuka, paduan suara, seni lukis, robotika, debat, hingga berbagai cabang olahraga. Kegiatan ini dipandu oleh pembina berpengalaman dan diadakan setiap hari setelah jam pelajaran reguler.",
    "Tenaga pengajar terdiri dari guru-guru bersertifikat dengan rata-rata pengalaman lebih dari 10 tahun. Program pelatihan profesional dilakukan rutin setiap semester untuk memastikan kualitas pengajaran selalu terjaga dan relevan.",
    "Komunikasi antara sekolah dan orang tua dijaga melalui aplikasi parenting digital, pertemuan triwulanan, dan laporan perkembangan belajar yang transparan. Keterlibatan aktif orang tua adalah kunci kesuksesan pendidikan anak kami.",
  ],
  "learning-center": [
    "Ruang belajar kami dirancang dengan suasana yang menyenangkan dan kondusif—bebas tekanan, penuh warna, dan dilengkapi peralatan belajar modern. Setiap sesi didesain untuk memaksimalkan pemahaman dan rasa percaya diri anak.",
    "Kurikulum dikembangkan oleh tim ahli pendidikan dengan mempertimbangkan karakteristik belajar anak Indonesia. Materi diperbarui setiap tahun mengikuti perkembangan kebutuhan akademik dan tren pendidikan global.",
    "Rasio guru dan murid dijaga maksimal 1:8 untuk memastikan setiap anak mendapat perhatian optimal. Setiap instruktur tersertifikasi dan berpengalaman menangani berbagai gaya belajar anak.",
    "Orang tua menerima laporan perkembangan berkala, termasuk pencapaian akademik, area yang perlu ditingkatkan, dan rekomendasi belajar di rumah. Konsultasi dengan pengajar dapat dijadwalkan kapan saja.",
  ],
  daycare: [
    "Keamanan si kecil adalah prioritas utama kami. Fasilitas dilengkapi CCTV 24 jam, akses masuk terbatas untuk orang tua/wali terdaftar, dan protokol kesehatan ketat yang diterapkan setiap hari.",
    "Tim pengasuh terdiri dari tenaga berpengalaman yang tersertifikasi dalam Pertolongan Pertama untuk Anak dan memiliki pemahaman mendalam tentang tumbuh kembang usia dini. Rasio pengasuh dan anak dijaga 1:4.",
    "Program harian mencakup aktivitas bermain terstruktur, sesi bercerita, kegiatan seni dan musik, istirahat siang, dan makan siang bergizi seimbang yang disusun oleh ahli nutrisi anak.",
    "Orang tua dapat memantau aktivitas anak melalui aplikasi khusus yang mengirimkan foto dan laporan harian secara real-time. Transparansi adalah fondasi kepercayaan kami.",
  ],
  playground: [
    "Setiap wahana melewati inspeksi keamanan mingguan oleh teknisi bersertifikat. Material yang digunakan ramah anak, bebas BPA, dan memenuhi standar keamanan internasional EN1176.",
    "Area bermain dirancang berdasarkan prinsip free play yang mendukung perkembangan motorik kasar, kemampuan sosial, dan kreativitas anak. Tata letak memungkinkan gerak bebas anak sambil tetap dalam jangkauan pandang orang tua.",
    "Staf penjaga terlatih selalu berjaga di seluruh area. Pertolongan pertama tersedia di pos kesehatan yang berlokasi strategis.",
    "Fasilitas penunjang untuk orang tua lengkap: area duduk nyaman, WiFi gratis, kafe snack, ruang menyusui, dan toilet bersih. Pengalaman menyenangkan adalah untuk seluruh keluarga.",
  ],
  clinic: [
    "Tim dokter spesialis kami mencakup dokter anak berpengalaman, ahli gizi klinik, psikolog anak, dan terapis tumbuh kembang. Pendekatan multidisiplin memastikan setiap aspek pertumbuhan si kecil dipantau secara komprehensif.",
    "Fasilitas mencakup ruang pemeriksaan privat, laboratorium diagnostik in-house untuk hasil cepat, ruang terapi ramah anak, dan ruang tunggu yang didesain agar anak tetap tenang.",
    "Program pemantauan tumbuh kembang mengikuti standar WHO dan IDAI, mencakup pengukuran fisik, skrining perkembangan, imunisasi, dan konseling parenting.",
    "Rekam medis digital terenkripsi dapat diakses orang tua kapan saja melalui aplikasi kami. Konsultasi online tersedia untuk pertanyaan ringan di luar jam klinik.",
  ],
  cafe: [
    "Seluruh menu dirancang oleh chef dan ahli nutrisi anak—bebas MSG, pewarna buatan, dan pengawet kimia. Tersedia pilihan makanan Indonesia, western, dan snack sehat yang disukai anak-anak.",
    "Area bermain dilengkapi soft play zone untuk balita, meja aktivitas seni, pojok buku bergambar, dan layar hiburan edukatif. Orang tua dapat bersantai sementara anak bermain dengan aman.",
    "Fasilitas lengkap untuk bayi dan balita: ruang menyusui privat, microwave untuk MPASI, high chair di setiap meja, dan area ganti popok yang bersih dan nyaman.",
    "Tersedia untuk venue ulang tahun anak, baby shower, dan gathering keluarga. Paket dekorasi, catering, dan MC anak tersedia dengan harga terjangkau—hubungi kami untuk konsultasi.",
  ],
  "mini-zoo": [
    "Koleksi hewan mencakup lebih dari 50 spesies dari berbagai penjuru dunia—kelinci, marmot, iguana, hingga burung eksotis. Semua dirawat dalam kondisi sesuai habitat aslinya oleh dokter hewan bersertifikat.",
    "Program feeding time diadakan 3 kali sehari. Anak-anak dapat memberi makan, mengelus, dan berfoto bersama hewan-hewan yang sudah terlatih dan aman untuk disentuh.",
    "Setiap kunjungan disertai sesi edukasi oleh keeper hewan yang menjelaskan fakta menarik tentang satwa. Program ini menumbuhkan kecintaan anak pada alam dan kepedulian terhadap satwa liar.",
    "Tersedia untuk school trip, ulang tahun bertema hewan, dan kegiatan edukasi lingkungan. Paket grup dengan harga spesial—hubungi kami untuk informasi pemesanan.",
  ],
  "swimming-pool": [
    "Kolam menggunakan sistem filtrasi modern dengan kadar klorin rendah yang aman untuk kulit bayi dan anak. Kualitas air diuji dua kali sehari oleh teknisi bersertifikat.",
    "Instruktur bersertifikat PRSI dengan sertifikasi penyelamatan air. Rasio instruktur dan murid maksimal 1:4 untuk keselamatan dan perhatian penuh terhadap setiap anak.",
    "Program tersedia dari Baby Swim (6 bulan ke atas), belajar mengapung, teknik dasar, hingga persiapan kompetisi—dengan target pencapaian jelas dan sertifikat kelulusan resmi.",
    "Fasilitas lengkap: kamar ganti bersih dengan shower air panas, loker aman, area tunggu orang tua, kantin, dan toko perlengkapan renang. Parkir luas dan mudah diakses.",
  ],
  bookstore: [
    "Koleksi lebih dari 10.000 judul buku anak dalam bahasa Indonesia, Inggris, dan Mandarin—dari board book untuk bayi, buku bergambar, novel anak, hingga buku pelajaran dan referensi.",
    "Area baca anak yang nyaman tersedia di dalam toko, dengan karpet lunak, bean bag, dan pencahayaan ramah mata. Anak-anak bebas membaca dan menjelajahi buku sebelum memutuskan membeli.",
    "Tersedia perlengkapan alat tulis premium, alat seni, dan perlengkapan sekolah dari merek terpercaya. Diskon produk berbeda setiap minggu diumumkan melalui media sosial kami.",
    "Program loyalitas Membership memberikan diskon 10% tiap pembelian, poin reward yang dapat ditukar hadiah, dan undangan eksklusif ke acara bedah buku, dongeng, dan workshop seni anak.",
  ],
};

// ── Related videos (dummy) ─────────────────────────────────────────────────
const relatedVideos = [
  { id: "iG9CE55wbtY", title: "Do Schools Kill Creativity? — Ken Robinson TED Talk" },
  { id: "wW4UK6FPcHk", title: "How to Raise Successful Kids Without Overparenting" },
  { id: "H14bBuluwB8", title: "Grit: The Power of Passion & Perseverance" },
  { id: "RiM5a-vaNkg", title: "The Importance of Play in Early Learning" },
];

// ─────────────────────────────────────────────────────────────────────────────

export default function PlaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }  = use(params);
  const router  = useRouter();
  const { t }   = useLang();
  const { tier, loaded } = useAuth();
  const { openRegisterSheet } = useRegisterSheet();
  const place   = places.find((p) => p.id === id);

  // Compute allPhotos early so auto-advance effect can reference it
  const allPhotos = place ? [place.photo, ...(place.photos ?? [])] : [];

  const [heroIndex,      setHeroIndex]      = useState(0);
  const [lightboxOpen,   setLightboxOpen]   = useState(false);
  const [isSaved,        setIsSaved]        = useState(false);
  const [videoOpen,      setVideoOpen]      = useState<string | null>(null);
  const [mapOpen,        setMapOpen]        = useState(false);
  const [userReview,     setUserReview]     = useState<UserReview | null>(null);
  const [showReviewGate, setShowReviewGate] = useState(false);
  const [showPsbSheet,   setShowPsbSheet]   = useState(false);
  const [showPsbGate,    setShowPsbGate]    = useState(false);
  const [showFaveGate,      setShowFaveGate]      = useState(false);
  const [showSaveLimitSheet, setShowSaveLimitSheet] = useState(false);

  useEffect(() => {
    const ids: string[] = JSON.parse(localStorage.getItem("savedIds") || "[]");
    setIsSaved(ids.includes(id));

    function loadUserReview() {
      const found = getReviewForPlace(id);
      setUserReview(found ?? null);
    }
    loadUserReview();
    window.addEventListener("focus", loadUserReview);
    return () => window.removeEventListener("focus", loadUserReview);
  }, [id]);

  // Guests can freely view place detail pages (no gate)

  // Auto-advance slideshow every 4 s (pauses when lightbox is open)
  useEffect(() => {
    if (allPhotos.length <= 1 || lightboxOpen) return;
    const timer = setInterval(() => {
      setHeroIndex((i) => (i + 1) % allPhotos.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [allPhotos.length, lightboxOpen]);

  function toggleSave() {
    if (tier === "guest") {
      setShowFaveGate(true);
      return;
    }
    const ids: string[] = JSON.parse(localStorage.getItem("savedIds") || "[]");
    if (!ids.includes(id) && tier === "free" && ids.length >= 3) {
      setShowSaveLimitSheet(true);
      return;
    }
    const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
    localStorage.setItem("savedIds", JSON.stringify(next));
    setIsSaved(next.includes(id));
  }

  const categoryLabel: Record<string, string> = {
    school:            t.catSchool,
    "learning-center": t.catLC,
    daycare:           t.catDaycare,
    playground:        t.catPlayground,
    clinic:            t.catClinic,
    cafe:              t.catCafe,
    "mini-zoo":        t.catMiniZoo,
    "swimming-pool":   t.catSwimmingPool,
    bookstore:         t.catBookstore,
  };

  if (!place) {
    return (
      <div className="max-w-md mx-auto flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="font-jakarta text-gray-500 text-sm">{t.pdNotFound}</p>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 px-6 py-2 rounded-full text-white text-sm font-jakarta font-semibold"
          style={{ background: "#1D4ED8" }}
        >
          <ChevronLeft size={16} /> {t.pdGoBack}
        </button>
      </div>
    );
  }

  const colors = categoryColor[place.category] ?? { bg: "#DBEAFE", text: "#1E3A5F" };
  const extraParas = aboutExtra[place.category] ?? [];

  // Ken Burns animation variant per photo index
  const kbVariant = (i: number) => [`kb0`, `kb1`, `kb2`][i % 3];

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col" style={{ paddingTop: 52 }}>

      {/* ── Animation styles ──────────────────────────────────────────────── */}
      <style>{`
        @keyframes kb0 {
          from { transform: scale(1.0)  translate(0%,    0%);   }
          to   { transform: scale(1.18) translate(-4%,  -3%);   }
        }
        @keyframes kb1 {
          from { transform: scale(1.15) translate(-3%,   1%);   }
          to   { transform: scale(1.0)  translate( 4%,  -2%);   }
        }
        @keyframes kb2 {
          from { transform: scale(1.0)  translate( 3%,   3%);   }
          to   { transform: scale(1.18) translate(-2%,  -3%);   }
        }
      `}</style>

      {/* ── Sticky top bar — blue gradient ────────────────────────────────── */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 52, zIndex: 50,
        background: "linear-gradient(160deg, #0F1E3C 0%, #1A3A6C 60%, #2563EB 100%)",
      }}>
        <div style={{ maxWidth: 448, margin: "0 auto", height: "100%",
          display: "flex", alignItems: "center", padding: "0 12px" }}>
          <ActionButton onClick={() => router.back()} style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "7px 12px", borderRadius: 999,
            background: "rgba(255,255,255,0.18)", color: "#fff",
            fontSize: 13, fontWeight: 700,
            border: "1px solid rgba(255,255,255,0.22)",
          }}>
            <ChevronLeft size={14} strokeWidth={2.5} color="#fff" />
            Back
          </ActionButton>
        </div>
      </div>

      {/* ── Lightbox ──────────────────────────────────────────────────────── */}
      {lightboxOpen && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 60,
            background: "rgba(0,0,0,0.95)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          onClick={() => setLightboxOpen(false)}
        >
          <img
            src={allPhotos[heroIndex]}
            alt=""
            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={(e) => { e.stopPropagation(); setHeroIndex((i) => (i - 1 + allPhotos.length) % allPhotos.length); }}
            style={{ position: "absolute", left: 16, top: "50%", marginTop: -20, width: 40, height: 40, borderRadius: 999, background: "rgba(255,255,255,0.2)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <ChevronLeft size={24} color="white" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setHeroIndex((i) => (i + 1) % allPhotos.length); }}
            style={{ position: "absolute", right: 16, top: "50%", marginTop: -20, width: 40, height: 40, borderRadius: 999, background: "rgba(255,255,255,0.2)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <ChevronRight size={24} color="white" />
          </button>
          <button
            onClick={() => setLightboxOpen(false)}
            style={{ position: "absolute", top: 52, right: 16, width: 36, height: 36, borderRadius: 999, background: "rgba(255,255,255,0.2)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <X size={18} color="white" />
          </button>
          <span style={{ position: "absolute", bottom: 32, left: 0, right: 0, textAlign: "center", color: "rgba(255,255,255,0.7)", fontSize: 13, fontFamily: "var(--font-jakarta), sans-serif" }}>
            {heroIndex + 1} / {allPhotos.length}
          </span>
        </div>
      )}

      {/* ── Map picker bottom sheet ───────────────────────────────────────── */}
      {mapOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(0,0,0,0.45)", animation: "sheet-fade-in 0.25s ease both" }}
          onClick={() => setMapOpen(false)}
        >
          <div
            style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              background: "#fff", borderRadius: "24px 24px 0 0",
              padding: "20px 20px 40px",
              maxWidth: 448, margin: "0 auto",
              animation: "sheet-slide-up 0.38s cubic-bezier(0.32, 0.72, 0, 1) both",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div style={{ width: 36, height: 4, borderRadius: 999, background: "#e2e8f0", margin: "0 auto 20px" }} />
            <p style={{
              fontFamily: "var(--font-fraunces), Georgia, serif",
              fontSize: 16, fontWeight: 700, color: "#1E3A5F",
              margin: "0 0 16px",
            }}>
              Open in Maps
            </p>

            {[
              {
                label: "Google Maps",
                emoji: "🗺",
                href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.address ?? "")}`,
                color: "#4285F4",
              },
              {
                label: "Waze",
                emoji: "🚗",
                href: `https://waze.com/ul?q=${encodeURIComponent(place.address ?? "")}&navigate=yes`,
                color: "#05C8F7",
              },
              {
                label: "Apple Maps",
                emoji: "🍎",
                href: `https://maps.apple.com/?q=${encodeURIComponent(place.address ?? "")}`,
                color: "#1D4ED8",
              },
            ].map(({ label, emoji, href, color }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMapOpen(false)}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "14px 16px", borderRadius: 16, marginBottom: 8,
                  background: "#f8fafc", border: "1px solid #e2e8f0",
                  textDecoration: "none",
                  touchAction: "manipulation",
                }}
              >
                <span style={{ fontSize: 22 }}>{emoji}</span>
                <span style={{
                  fontFamily: "var(--font-jakarta), sans-serif",
                  fontSize: 14, fontWeight: 600, color: "#1E3A5F", flex: 1,
                }}>
                  {label}
                </span>
                <ChevronRight size={16} color="#94a3b8" />
              </a>
            ))}

            <ActionButton
              onClick={() => setMapOpen(false)}
              style={{
                width: "100%", marginTop: 4, padding: "14px 16px",
                borderRadius: 16, border: "none", background: "#f1f5f9",
                fontFamily: "var(--font-jakarta), sans-serif",
                fontSize: 14, fontWeight: 600, color: "#64748b",
                cursor: "pointer", textAlign: "center",
              }}
            >
              Cancel
            </ActionButton>
          </div>
        </div>
      )}

      {/* ── Video lightbox ────────────────────────────────────────────────── */}
      {videoOpen && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 60,
            background: "rgba(0,0,0,0.90)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "0 16px",
          }}
          onClick={() => setVideoOpen(null)}
        >
          <button
            onClick={() => setVideoOpen(null)}
            style={{ position: "absolute", top: 52, right: 16, width: 36, height: 36, borderRadius: 999, background: "rgba(255,255,255,0.18)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <X size={18} color="white" />
          </button>
          <div
            style={{ width: "100%", maxWidth: 420, borderRadius: 16, overflow: "clip", background: "#000" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
              <iframe
                src={`https://www.youtube.com/embed/${videoOpen}?autoplay=1&rel=0`}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                title="Related video"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Hero slideshow ────────────────────────────────────────────────── */}
      <div style={{ position: "relative", height: 288, overflow: "clip" }}
           onClick={() => setLightboxOpen(true)}>
        {allPhotos.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={i === 0 ? place.name : ""}
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%", objectFit: "cover",
              opacity: heroIndex === i ? 1 : 0,
              transition: "opacity 0.6s ease-in-out",
              animation: heroIndex === i ? `${kbVariant(i)} 12s ease-in-out both` : "none",
              transformOrigin: "center center",
              cursor: "pointer",
            }}
          />
        ))}

        {/* Gradient overlay */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.28) 0%, transparent 50%)", pointerEvents: "none" }} />

        {/* Featured badge */}
        {place.isFeatured && (
          <div style={{
            position: "absolute", top: 14, left: 14, zIndex: 10,
            display: "flex", alignItems: "center", gap: 4,
            background: "rgba(0,0,0,0.50)",
            borderRadius: 999, padding: "5px 11px",
            fontSize: 12, fontWeight: 700, color: "#f6b545",
            letterSpacing: 0.4,
            fontFamily: "var(--font-jakarta), sans-serif",
            pointerEvents: "none",
          }}>
            ✦ Featured
          </div>
        )}

        {/* Dot indicators */}
        {allPhotos.length > 1 && (
          <div style={{ position: "absolute", bottom: 14, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 6, zIndex: 10, pointerEvents: "none" }}>
            {allPhotos.map((_, i) => (
              <div key={i} style={{
                height: 5, borderRadius: 999,
                width: heroIndex === i ? 20 : 5,
                background: heroIndex === i ? "#fff" : "rgba(255,255,255,0.5)",
                transition: "width 0.35s ease, background 0.35s ease",
              }} />
            ))}
          </div>
        )}

        {/* Left / right arrows */}
        {allPhotos.length > 1 && (
          <>
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ position: "absolute", left: 12, top: "50%", marginTop: -20, zIndex: 10 }}
            >
              <ActionButton
                onClick={() => setHeroIndex((i) => (i - 1 + allPhotos.length) % allPhotos.length)}
                style={{
                  width: 40, height: 40, borderRadius: 999,
                  background: "rgba(0,0,0,0.30)", border: "1px solid rgba(255,255,255,0.20)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <ChevronLeft size={22} color="white" strokeWidth={2.5} />
              </ActionButton>
            </div>
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ position: "absolute", right: 12, top: "50%", marginTop: -20, zIndex: 10 }}
            >
              <ActionButton
                onClick={() => setHeroIndex((i) => (i + 1) % allPhotos.length)}
                style={{
                  width: 40, height: 40, borderRadius: 999,
                  background: "rgba(0,0,0,0.30)", border: "1px solid rgba(255,255,255,0.20)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <ChevronRight size={22} color="white" strokeWidth={2.5} />
              </ActionButton>
            </div>
          </>
        )}
      </div>

      {/* ── White content card ────────────────────────────────────────────── */}
      <div className="flex-1 rounded-t-[48px] -mt-14 px-5 pt-16 pb-10 space-y-5" style={{ background: "#fff" }}>

        {/* Name + category + rating */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <span className="text-xs font-jakarta font-bold px-2.5 py-0.5 rounded-full inline-block mb-2" style={{ background: colors.bg, color: colors.text }}>
              {categoryLabel[place.category]}
            </span>
            <h1 className="text-2xl font-bold text-[#1E3A5F] leading-tight" style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}>{place.name}</h1>
            {place.address && (
              <ActionButton
                onClick={() => setMapOpen(true)}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 4,
                  marginTop: 6, padding: 0, background: "none", border: "none",
                  cursor: "pointer", textAlign: "left",
                }}
              >
                <MapPin size={12} style={{ color: "#1D4ED8", marginTop: 1, flexShrink: 0 }} />
                <span className="font-jakarta text-xs leading-relaxed" style={{ color: "#1D4ED8", textDecoration: "underline", textDecorationColor: "rgba(29,78,216,0.35)", textUnderlineOffset: 2 }}>
                  {place.address}
                </span>
              </ActionButton>
            )}
            <div className="flex items-center gap-1 mt-0.5">
              <Clock size={12} className="text-gray-400 flex-shrink-0" />
              <p className="font-jakarta text-gray-400 text-xs">{place.hours}</p>
            </div>
            {place.phone !== "-" && (
              <a href={`tel:${place.phone}`} className="inline-flex items-center gap-1 mt-0.5">
                <Phone size={12} style={{ color: "#1D4ED8" }} className="flex-shrink-0" />
                <span className="font-jakarta text-xs text-[#1D4ED8] font-semibold">{place.phone}</span>
              </a>
            )}

          </div>

          <div className="flex flex-col items-end flex-shrink-0 mt-7 gap-2">
            <div className="flex items-center gap-0.5">
              <Star size={14} fill="#FBBF24" stroke="none" />
              <span className="font-jakarta font-bold text-gray-800">{place.rating}</span>
            </div>
            <span className="text-xs text-gray-400 font-jakarta">{place.reviews} {t.reviews}</span>
            <ActionButton onClick={toggleSave} ariaLabel="Save to favorites" style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 36, height: 36, borderRadius: 999,
              background: isSaved ? "#FEF2F2" : "#F1F5F9",
              border: `1.5px solid ${isSaved ? "#EF4444" : "#E2E8F0"}`,
            }}>
              <Heart size={16} fill={isSaved ? "#EF4444" : "none"} stroke={isSaved ? "#EF4444" : "#94A3B8"} strokeWidth={2} />
            </ActionButton>
          </div>
        </div>

        {/* Enrollment dates + PSB alert — schools only */}
        {place.category === "school" && (
          <>
            <div className="rounded-2xl p-4 flex items-center justify-between" style={{ background: "#DBEAFE" }}>
              <div>
                <p className="text-xs font-jakarta text-[#3B82F6] font-semibold uppercase tracking-wide mb-0.5">
                  {t.pdEnrollTitle}
                </p>
                <p className="text-base font-bold text-[#1E3A5F]" style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}>
                  {t.pdEnrollSoon}
                </p>
                <p className="text-xs font-jakarta text-[#3B82F6] mt-0.5">
                  {t.pdEnrollContact}
                </p>
              </div>
              <span style={{ fontSize: 30 }}>📅</span>
            </div>

            {/* PSB Alert placeholder */}
            <ActionButton
              onClick={() => {
                if (tier === "premium") {
                  alert(t.pdPsbAlert);
                } else if (tier === "free") {
                  setShowPsbGate(true);
                } else {
                  setShowPsbSheet(true);
                }
              }}
              style={{
                width: "100%", padding: "13px 16px",
                borderRadius: 14, border: "none",
                background: "linear-gradient(135deg, #1e3a5f, #2563eb)",
                color: "#fff",
                fontFamily: "var(--font-jakarta), sans-serif",
                fontSize: 14, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
              }}
            >
              🔔 {t.pdPsbBtn}
              {tier !== "premium" && (
                <div style={{
                  width: 20, height: 20, borderRadius: 999,
                  background: tier === "guest" ? "#ef4444" : "#d97706",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, marginLeft: 2,
                }}>
                  <Lock size={11} strokeWidth={3} color="#fff" />
                </div>
              )}
            </ActionButton>
          </>
        )}

        {/* Info chips — aligned with category filters */}
        {(() => {
          const ag = getAreaGroup(place.area);
          const areaLabel = ag === "bsd" ? "BSD" : ag === "both" ? "Bintaro & BSD" : "Bintaro";
          const fmtTicket = (place.priceMin === 0 && place.priceMax === 0)
            ? t.free
            : `Rp ${formatPrice(place.priceMin)} – ${formatPrice(place.priceMax)}`;
          const fmtBulanan = `Rp ${formatPrice(place.priceMin)} – ${formatPrice(place.priceMax)} ${t.perMonth}`;

          // Chip card — label on top, content below
          const chip = (label: string, content: React.ReactNode, wide = false) => (
            <div className={`bg-gray-50 rounded-xl px-3 py-2.5 flex flex-col gap-1.5${wide ? " col-span-2" : ""}`}>
              <span className="text-[9px] font-jakarta text-gray-400 uppercase tracking-widest font-bold">{label}</span>
              {content}
            </div>
          );
          const txt = (v: string) => (
            <span className="font-jakarta font-semibold text-gray-800 text-xs leading-snug">{v}</span>
          );
          const pills = (vals: string[]) => (
            <span className="font-jakarta font-semibold text-gray-800 text-xs leading-snug">
              {vals.join(", ")}
            </span>
          );

          if (place.category === "school") return (
            <div className="grid grid-cols-2 gap-2" style={{ marginTop: 8 }}>
              {chip("Area", txt(areaLabel))}
              {place.grades?.length ? chip(t.pdGrade, pills(place.grades)) : null}
              {place.curriculum ? chip(t.pdCurriculum,
                tier === "premium"
                  ? txt(place.curriculum)
                  : <PremiumGate label="Kurikulum">{txt(place.curriculum)}</PremiumGate>
              ) : null}
              {place.bahasa?.length ? chip(t.pdChipBahasa, pills(place.bahasa)) : null}
              {place.uangPangkalMin !== undefined
                ? chip(t.pdChipUangPangkal,
                    tier === "premium"
                      ? txt(`Rp ${formatPrice(place.uangPangkalMin)} – ${formatPrice(place.uangPangkalMax!)}`)
                      : <PremiumGate label="Uang Pangkal">{txt(`Rp ${formatPrice(place.uangPangkalMin)} – ${formatPrice(place.uangPangkalMax!)}`)}</PremiumGate>
                  )
                : null}
              {chip(t.pdChipSpp,
                tier === "premium"
                  ? txt(fmtBulanan)
                  : <PremiumGate label="SPP">{txt(fmtBulanan)}</PremiumGate>
              )}
            </div>
          );

          if (place.category === "learning-center") return (
            <div className="grid grid-cols-2 gap-2">
              {chip("Area", txt(areaLabel))}
              {chip(t.pdChipAgeChild, txt(place.ageRange))}
              {place.courseTypes?.length ? chip(t.pdChipCourseType, pills(place.courseTypes)) : null}
              {chip(t.pdMonthlyFee,
                tier === "premium"
                  ? txt(fmtBulanan)
                  : <PremiumGate label="Biaya">{txt(fmtBulanan)}</PremiumGate>
              )}
            </div>
          );

          if (place.category === "daycare") return (
            <div className="grid grid-cols-2 gap-2">
              {chip("Area", txt(areaLabel))}
              {chip(t.pdMonthlyFee,
                tier === "premium"
                  ? txt(fmtBulanan)
                  : <PremiumGate label="Biaya">{txt(fmtBulanan)}</PremiumGate>
              )}
              {place.daycareAgeGroups?.length ? chip(t.pdAgeRange, pills(place.daycareAgeGroups)) : null}
            </div>
          );

          if (place.category === "playground") return (
            <div className="grid grid-cols-2 gap-2">
              {chip("Area", txt(areaLabel))}
              {place.playgroundType
                ? chip(t.pdType, txt(place.playgroundType === "indoor" ? "🏠 Indoor" : "🌳 Outdoor"))
                : null}
              {chip(t.pdChipTicket, txt(fmtTicket))}
            </div>
          );

          if (place.category === "clinic") return (
            <div className="grid grid-cols-2 gap-2">
              {chip("Area", txt(areaLabel))}
              {chip(t.pdChipCost, txt(`Rp ${formatPrice(place.priceMin)} – ${formatPrice(place.priceMax)}`))}
              {place.clinicServices?.length ? chip(t.pdChipServices, pills(place.clinicServices)) : null}
            </div>
          );

          if (place.category === "cafe") return (
            <div className="grid grid-cols-2 gap-2">
              {chip("Area", txt(areaLabel))}
              {place.priceCategory ? chip(t.pdChipBudget, txt(place.priceCategory)) : null}
            </div>
          );

          if (place.category === "mini-zoo" || place.category === "swimming-pool") return (
            <div className="grid grid-cols-2 gap-2">
              {chip("Area", txt(areaLabel))}
              {chip(t.pdChipTicket, txt(fmtTicket))}
            </div>
          );

          if (place.category === "bookstore") return (
            <div className="grid grid-cols-2 gap-2">
              {chip("Area", txt(areaLabel))}
            </div>
          );

          return null;
        })()}

        {/* TangselKids Rating — playgrounds only */}
        {place.category === "playground" && place.tangselKidsRating && (() => {
          const tkr = place.tangselKidsRating!;
          const cats = [
            { key: "cleanliness", label: t.tkCleanliness, score: tkr.cleanliness },
            { key: "value",       label: t.tkValue,       score: tkr.value },
            { key: "safety",      label: t.tkSafety,      score: tkr.safety },
            { key: "fun",         label: t.tkFun,         score: tkr.fun },
            { key: "facilities",  label: t.tkFacilities,  score: tkr.facilities },
          ];
          return (
            <div className="rounded-2xl p-5 border-2 border-dashed" style={{ background: "#EFF6FF", borderColor: "#BFDBFE" }}>
              <div className="flex items-center gap-2 mb-4">
                <Star size={20} fill="#FBBF24" stroke="none" />
                <h2 className="text-xl font-bold text-[#1E3A5F]" style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}>{t.tkRatingTitle}</h2>
              </div>
              <div className="space-y-3 mb-4">
                {cats.map((cat) => (
                  <div key={cat.key} className="flex items-center gap-3">
                    <span className="font-jakarta text-sm font-medium text-gray-700 w-24 flex-shrink-0">{cat.label}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={18} fill={i < cat.score ? "#FBBF24" : "#D1D5DB"} stroke="none" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-blue-100 pt-3">
                <p className="font-jakarta text-sm font-bold text-[#1E3A5F] mb-1">{t.tkVerdict}</p>
                <p className="font-jakarta text-sm text-gray-600 leading-relaxed">{tkr.verdict}</p>
              </div>
            </div>
          );
        })()}

        {/* About */}
        <div>
          <h2 className="text-lg font-semibold text-[#1E3A5F] mb-3" style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}>{t.pdAbout}</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p className="font-jakarta text-gray-600 text-sm leading-relaxed">{place.description}</p>
            {extraParas.map((para, i) => (
              <p key={i} className="font-jakarta text-gray-600 text-sm leading-relaxed">{para}</p>
            ))}
          </div>
        </div>

        {/* Social Media */}
        <div>
          <h2 className="text-lg font-semibold text-[#1E3A5F] mb-3" style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}>
            Social Media
          </h2>
          <div style={{ display: "flex", gap: 10 }}>
            {([
              { key: "instagram", url: place.instagram, label: "Instagram", color: "#E1306C",  Icon: InstagramIcon },
              { key: "facebook",  url: place.facebook,  label: "Facebook",  color: "#1877F2",  Icon: FacebookIcon  },
              { key: "tiktok",    url: place.tiktok,    label: "TikTok",    color: "#010101",  Icon: TikTokIcon    },
              { key: "website",   url: place.website,   label: "Website",   color: "#1d4ed8",
                Icon: ({ size, color }: { size: number; color: string }) => <Globe size={size} color={color} strokeWidth={1.75} /> },
            ] as const).map(({ key, url, label, color, Icon }) => {
              const active = !!url;
              const bubble = (
                <div style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  opacity: active ? 1 : 0.35,
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: active ? `${color}14` : "#f1f5f9",
                    border: `1.5px solid ${active ? color + "44" : "#e2e8f0"}`,
                  }}>
                    <Icon size={20} color={active ? color : "#94a3b8"} />
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 600, color: active ? "#374151" : "#9ca3af",
                    fontFamily: "var(--font-jakarta), sans-serif",
                  }}>{label}</span>
                </div>
              );
              return active ? (
                <a key={key} href={url} target="_blank" rel="noopener noreferrer" aria-label={label} style={{ display: "block", textDecoration: "none" }}>
                  {bubble}
                </a>
              ) : (
                <div key={key} style={{ pointerEvents: "none" }}>{bubble}</div>
              );
            })}
          </div>
        </div>

        {/* Related Videos */}
        <div>
          <h2 className="text-lg font-semibold text-[#1E3A5F] mb-3" style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}>
            Related Videos
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {relatedVideos.map((v) => (
              <ActionButton
                key={v.id}
                onClick={() => setVideoOpen(v.id)}
                style={{ display: "block", textAlign: "left", padding: 0, borderRadius: 14, overflow: "clip" }}
              >
                {/* Thumbnail */}
                <div style={{ position: "relative", paddingBottom: "56.25%", background: "#000", borderRadius: "14px 14px 0 0", overflow: "clip" }}>
                  <img
                    src={`https://img.youtube.com/vi/${v.id}/mqdefault.jpg`}
                    alt={v.title}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  {/* Play button overlay */}
                  <div style={{
                    position: "absolute", inset: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "rgba(0,0,0,0.22)",
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 999,
                      background: "rgba(255,255,255,0.92)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Play size={16} fill="#1E3A5F" stroke="none" style={{ marginLeft: 2 }} />
                    </div>
                  </div>
                </div>
                {/* Title */}
                <div style={{
                  padding: "8px 10px 10px",
                  background: "#f8fafc",
                  borderRadius: "0 0 14px 14px",
                  border: "1px solid #e2e8f0", borderTop: "none",
                }}>
                  <p style={{
                    fontSize: 11, fontWeight: 600, color: "#1e3a5f", lineHeight: 1.4,
                    fontFamily: "var(--font-jakarta), sans-serif",
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}>
                    {v.title}
                  </p>
                </div>
              </ActionButton>
            ))}
          </div>
        </div>

        {/* Reviews */}
        {(() => {
          const baseList = place.reviewsList ?? [];
          const totalCount = baseList.length + (userReview ? 1 : 0);
          if (totalCount === 0) return null;
          return (
            <div>
              <h2 className="text-lg font-semibold text-[#1E3A5F] mb-3" style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}>
                {t.pdReviewsTitle} ({totalCount})
              </h2>
              <div className="space-y-3">
                {/* User's own review — shown first */}
                {userReview && (
                  <div className="rounded-2xl p-4" style={{ background: "#F0F9FF", border: "1.5px solid #BAE6FD" }}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-jakarta font-semibold text-sm text-gray-800">{userReview.name}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, background: "#1D4ED8", color: "#fff", borderRadius: 999, padding: "2px 7px", fontFamily: "var(--font-jakarta), sans-serif" }}>
                          Ulasanmu
                        </span>
                      </div>
                      <span className="font-jakarta text-xs text-gray-400">{userReview.date}</span>
                    </div>
                    <div className="flex items-center gap-0.5 mb-2">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} size={13} fill={s < userReview.rating ? "#FBBF24" : "#D1D5DB"} stroke="none" />
                      ))}
                    </div>
                    <p className="font-jakarta text-gray-600 text-sm leading-relaxed">{userReview.comment}</p>
                  </div>
                )}
                {/* Existing mock reviews */}
                {baseList.map((review, i) => (
                  <div key={i} className="bg-gray-50 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-jakarta font-semibold text-sm text-gray-800">{review.name}</span>
                      <span className="font-jakarta text-xs text-gray-400">{review.date}</span>
                    </div>
                    <div className="flex items-center gap-0.5 mb-2">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} size={13} fill={s < review.rating ? "#FBBF24" : "#D1D5DB"} stroke="none" />
                      ))}
                    </div>
                    <p className="font-jakarta text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Write a Review button */}
        {userReview ? (
          <div
            className="w-full py-3 rounded-2xl font-jakarta font-bold text-sm flex items-center justify-center gap-2 border-2"
            style={{ borderColor: "#D1D5DB", color: "#9CA3AF", background: "#F9FAFB" }}
          >
            <Check size={15} /> Sudah Diulas
          </div>
        ) : (
          <ActionButton
            onClick={() => {
              if (tier === "premium") {
                router.push(`/write-review/${place.id}`);
              } else {
                setShowReviewGate(true);
              }
            }}
            style={{
              width: "100%", padding: "12px 16px",
              borderRadius: 14, border: "2px solid #1D4ED8",
              background: "#EFF6FF", color: "#1D4ED8",
              fontFamily: "var(--font-jakarta), sans-serif",
              fontSize: 14, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
            }}
          >
            <Pencil size={15} /> {t.reviewWriteBtn}
            {tier !== "premium" && (
              <div style={{
                width: 20, height: 20, borderRadius: 999,
                background: tier === "guest" ? "#ef4444" : "#d97706",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, marginLeft: 2,
              }}>
                <Lock size={11} strokeWidth={3} color="#fff" />
              </div>
            )}
          </ActionButton>
        )}

      </div>

      {/* ── Favourite Gate Sheet (unregistered) ─────────────────────────── */}
      <FilterGateSheet isOpen={showFaveGate} onClose={() => setShowFaveGate(false)} />

      {/* ── Save Limit Upgrade Sheet (registered free — 5-place cap) ─────── */}
      {showSaveLimitSheet && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 70,
            background: "rgba(0,0,0,0.45)",
            animation: "sheet-fade-in 0.25s ease both",
          }}
          onClick={() => setShowSaveLimitSheet(false)}
        >
          <div
            style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              background: "#fff", borderRadius: "24px 24px 0 0",
              padding: "20px 20px 40px",
              maxWidth: 448, margin: "0 auto",
              animation: "sheet-slide-up 0.38s cubic-bezier(0.32, 0.72, 0, 1) both",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div style={{ width: 36, height: 4, borderRadius: 999, background: "#e2e8f0", margin: "0 auto 24px" }} />

            {/* Icon */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <div style={{
                width: 64, height: 64, borderRadius: 999,
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 30,
              }}>
                ⭐
              </div>
            </div>

            {/* Title */}
            <p style={{
              fontFamily: "var(--font-fraunces), Georgia, serif",
              fontSize: 20, fontWeight: 700, color: "#1E3A5F",
              textAlign: "center", margin: "0 0 8px",
            }}>
              {t.premiumGateTitle}
            </p>

            {/* Body */}
            <p style={{
              fontFamily: "var(--font-jakarta), sans-serif",
              fontSize: 13, color: "#64748b", lineHeight: 1.6,
              textAlign: "center", margin: "0 0 24px",
            }}>
              {t.premiumGateDesc}
            </p>

            {/* CTA */}
            <ActionButton
              onClick={() => { setShowSaveLimitSheet(false); router.push("/upgrade"); }}
              style={{
                width: "100%", padding: "15px 0",
                borderRadius: 16, border: "none",
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                color: "#fff",
                fontFamily: "var(--font-jakarta), sans-serif",
                fontSize: 15, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
              }}
            >
              {t.premiumGateCta}
            </ActionButton>

            {/* Cancel */}
            <ActionButton
              onClick={() => setShowSaveLimitSheet(false)}
              style={{
                width: "100%", marginTop: 10, padding: "13px 0",
                borderRadius: 16, border: "none",
                background: "#f1f5f9", color: "#64748b",
                fontFamily: "var(--font-jakarta), sans-serif",
                fontSize: 14, fontWeight: 600,
                display: "flex", alignItems: "center", justifyContent: "center",
                touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
              }}
            >
              {t.premiumGateCancel}
            </ActionButton>
          </div>
        </div>
      )}

      {/* ── PSB Guest Sheet (unregistered) ───────────────────────────────── */}
      <PremiumGuestSheet isOpen={showPsbSheet} onClose={() => setShowPsbSheet(false)} />

      {/* ── PSB Upgrade Sheet (registered) ───────────────────────────────── */}
      {showPsbGate && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 70,
            background: "rgba(0,0,0,0.45)",
            animation: "sheet-fade-in 0.25s ease both",
          }}
          onClick={() => setShowPsbGate(false)}
        >
          <div
            style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              background: "#fff", borderRadius: "24px 24px 0 0",
              padding: "20px 20px 40px",
              maxWidth: 448, margin: "0 auto",
              animation: "sheet-slide-up 0.38s cubic-bezier(0.32, 0.72, 0, 1) both",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div style={{ width: 36, height: 4, borderRadius: 999, background: "#e2e8f0", margin: "0 auto 24px" }} />

            {/* Icon */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <div style={{
                width: 64, height: 64, borderRadius: 999,
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 30,
              }}>
                ⭐
              </div>
            </div>

            {/* Title */}
            <p style={{
              fontFamily: "var(--font-fraunces), Georgia, serif",
              fontSize: 20, fontWeight: 700, color: "#1E3A5F",
              textAlign: "center", margin: "0 0 8px",
            }}>
              {t.premiumGateTitle}
            </p>

            {/* Body */}
            <p style={{
              fontFamily: "var(--font-jakarta), sans-serif",
              fontSize: 13, color: "#64748b", lineHeight: 1.6,
              textAlign: "center", margin: "0 0 24px",
            }}>
              {t.premiumGateDesc}
            </p>

            {/* CTA */}
            <ActionButton
              onClick={() => { setShowPsbGate(false); router.push("/upgrade"); }}
              style={{
                width: "100%", padding: "15px 0",
                borderRadius: 16, border: "none",
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                color: "#fff",
                fontFamily: "var(--font-jakarta), sans-serif",
                fontSize: 15, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
              }}
            >
              {t.premiumGateCta}
            </ActionButton>

            {/* Cancel */}
            <ActionButton
              onClick={() => setShowPsbGate(false)}
              style={{
                width: "100%", marginTop: 10, padding: "13px 0",
                borderRadius: 16, border: "none",
                background: "#f1f5f9", color: "#64748b",
                fontFamily: "var(--font-jakarta), sans-serif",
                fontSize: 14, fontWeight: 600,
                display: "flex", alignItems: "center", justifyContent: "center",
                touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
              }}
            >
              {t.premiumGateCancel}
            </ActionButton>
          </div>
        </div>
      )}

      {/* ── Review Gate Bottom Sheet ──────────────────────────────────────── */}
      {showReviewGate && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 70,
            background: "rgba(0,0,0,0.45)",
            animation: "sheet-fade-in 0.25s ease both",
          }}
          onClick={() => setShowReviewGate(false)}
        >
          <div
            style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              background: "#fff", borderRadius: "24px 24px 0 0",
              padding: "20px 20px 40px",
              maxWidth: 448, margin: "0 auto",
              animation: "sheet-slide-up 0.38s cubic-bezier(0.32, 0.72, 0, 1) both",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div style={{ width: 36, height: 4, borderRadius: 999, background: "#e2e8f0", margin: "0 auto 24px" }} />

            {/* Icon */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <div style={{
                width: 64, height: 64, borderRadius: 999,
                background: tier === "guest" ? "#FEF3C7" : "linear-gradient(135deg, #f59e0b, #d97706)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 30,
              }}>
                ⭐
              </div>
            </div>

            {/* Text */}
            <p style={{
              fontFamily: "var(--font-fraunces), Georgia, serif",
              fontSize: 20, fontWeight: 700, color: "#1E3A5F",
              textAlign: "center", margin: "0 0 8px",
            }}>
              {t.premiumGateTitle}
            </p>
            <p style={{
              fontFamily: "var(--font-jakarta), sans-serif",
              fontSize: 13, color: "#64748b", lineHeight: 1.6,
              textAlign: "center", margin: "0 0 24px",
            }}>
              {tier === "guest" ? t.premiumGateGuestDesc : t.premiumGateDesc}
            </p>

            {/* Two-step visual — unregistered only */}
            {tier === "guest" && (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: 8, marginBottom: 24,
              }}>
                {/* Step 1 */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 999,
                    background: "linear-gradient(135deg, #16a34a, #22c55e)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, flexShrink: 0,
                  }}>👤</div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: "#16a34a",
                    fontFamily: "var(--font-jakarta), sans-serif",
                    whiteSpace: "nowrap",
                  }}>{t.premiumGateStepRegister}</span>
                </div>

                {/* Arrow */}
                <svg width="48" height="12" viewBox="0 0 48 12" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M0 6 H40 M34 2 L46 6 L34 10" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>

                {/* Step 2 */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 999,
                    background: "linear-gradient(135deg, #f59e0b, #d97706)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, flexShrink: 0,
                  }}>⭐</div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: "#d97706",
                    fontFamily: "var(--font-jakarta), sans-serif",
                    whiteSpace: "nowrap",
                  }}>{t.premiumGateStepUpgrade}</span>
                </div>
              </div>
            )}

            {/* CTA */}
            <ActionButton
              onClick={() => {
                setShowReviewGate(false);
                if (tier === "guest") {
                  openRegisterSheet({
                    title: t.premiumGateGuestSheetTitle,
                    subtitle: t.premiumGateGuestSheetSubtitle,
                  });
                } else {
                  router.push("/upgrade");
                }
              }}
              style={{
                width: "100%", padding: "15px 0",
                borderRadius: 16, border: "none",
                background: tier === "guest"
                  ? "linear-gradient(135deg, #16a34a, #22c55e)"
                  : "linear-gradient(135deg, #f59e0b, #d97706)",
                color: "#fff",
                fontFamily: "var(--font-jakarta), sans-serif",
                fontSize: 15, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
              }}
            >
              {tier === "guest" ? t.premiumGateGuestCta : t.premiumGateCta}
            </ActionButton>

            {/* Cancel */}
            <ActionButton
              onClick={() => setShowReviewGate(false)}
              style={{
                width: "100%", marginTop: 10, padding: "13px 0",
                borderRadius: 16, border: "none",
                background: "#f1f5f9",
                color: "#64748b",
                fontFamily: "var(--font-jakarta), sans-serif",
                fontSize: 14, fontWeight: 600,
                display: "flex", alignItems: "center", justifyContent: "center",
                touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
              }}
            >
              {t.premiumGateCancel}
            </ActionButton>
          </div>
        </div>
      )}

    </div>
  );
}
