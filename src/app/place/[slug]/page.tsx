"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use } from "react";
import {
  ChevronLeft, ChevronRight, ChevronDown, X, MapPin, Clock, Phone,
  Heart, Pencil, Star, Globe, Play, Check, Lock, MessageCircle,
  GraduationCap, BookOpen, Banknote, Calendar, Users, Monitor,
  Droplets, Gift, Wallet, Camera, Award, Layers, Ticket,
  CreditCard, Activity, Baby, Home,
} from "lucide-react";
import { formatPriceRange, getAreaGroup, formatPrice, haversineKm, type Place } from "@/lib/mockData";
import { fetchPlaceBySlug, fetchPlaceById, fetchSimilarSchools, fetchSimilarLearningCenters, fetchSimilarDaycares, fetchSimilarPlaygrounds, fetchSimilarClinics, fetchSimilarCafes, fetchSimilarMiniZoos, fetchSimilarSwimmingPools, fetchSimilarBookstores } from "@/lib/db";
import { useLang } from "@/context/LanguageContext";
import { ActionButton } from "@/components/ActionButton";
import { getReviewForPlace, type UserReview } from "@/lib/reviewsStorage";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { getNote, saveNote, deleteNote } from "@/lib/notesStorage";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@/context/LocationContext";
import { useLoginSheet } from "@/context/LoginSheetContext";
import { useRegisterSheet } from "@/context/RegisterSheetContext";
import { addSaved, removeSaved } from "@/lib/savedPlaces";

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

// ── YouTube icon ──────────────────────────────────────────────────────────────
function YouTubeIcon({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

// ── WhatsApp icon ─────────────────────────────────────────────────────────────
function WhatsAppIcon({ size = 18, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

/** Convert a local Indonesian phone number to WhatsApp-compatible E.164 format.
 *  "0812-3456-7890" → "628123456789" */
function toWaNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("0") ? "62" + digits.slice(1) : digits;
}

// TODO: replace with real support/editorial WhatsApp number
const SUGGEST_WA_NUMBER = "6281234567890";

// ── Category colours ──────────────────────────────────────────────────────────
const categoryColor: Record<string, { bg: string; text: string }> = {
  school:            { bg: "#e6f4ed", text: "#1f6b43" },
  "learning-center": { bg: "#e6f4ed", text: "#2e8a5a" },
  daycare:           { bg: "#FCE7F3", text: "#9D174D" },
  playground:        { bg: "#FEF3C7", text: "#92400E" },
  clinic:            { bg: "#D1FAE5", text: "#065F46" },
  cafe:              { bg: "#FEF3C7", text: "#92400E" },
  "mini-zoo":        { bg: "#D1FAE5", text: "#065F46" },
  "swimming-pool":   { bg: "#e6f4ed", text: "#1f6b43" },
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


// ─────────────────────────────────────────────────────────────────────────────

export default function PlaceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug }  = use(params);
  const router  = useRouter();
  const { t, lang } = useLang();
  const { loaded, user } = useAuth();
  const { openLoginSheet } = useLoginSheet();
  const { openRegisterSheet } = useRegisterSheet();
  const { userLat, userLng, locationStatus, requestLocation } = useLocation();

  const [place,   setPlace]   = useState<Place | null>(null);
  const [loadingPlace, setLoadingPlace] = useState(true);

  const [heroIndex,      setHeroIndex]      = useState(0);
  const [lightboxOpen,   setLightboxOpen]   = useState(false);
  const [isSaved,        setIsSaved]        = useState(false);
  const [videoOpen,      setVideoOpen]      = useState<string | null>(null);
  const [feeImageOpen,   setFeeImageOpen]   = useState(false);
  const [mapOpen,        setMapOpen]        = useState(false);
  const [userReview,        setUserReview]        = useState<UserReview | null>(null);
  const [publishedReviews,  setPublishedReviews]  = useState<UserReview[]>([]);
  const [showSuggestSheet,  setShowSuggestSheet]  = useState(false);
  const [similarSchools,    setSimilarSchools]    = useState<Place[]>([]);
  const [similarCenters,   setSimilarCenters]    = useState<Place[]>([]);
  const [similarDaycares,    setSimilarDaycares]    = useState<Place[]>([]);
  const [similarPlaygrounds, setSimilarPlaygrounds] = useState<Place[]>([]);
  const [similarClinics,     setSimilarClinics]     = useState<Place[]>([]);
  const [similarCafes,       setSimilarCafes]       = useState<Place[]>([]);
  const [similarMiniZoos,    setSimilarMiniZoos]    = useState<Place[]>([]);
  const [similarPools,       setSimilarPools]       = useState<Place[]>([]);
  const [similarBookstores,  setSimilarBookstores]  = useState<Place[]>([]);
  const similarRailRef = useRef<HTMLDivElement>(null);
  const [similarCanL, setSimilarCanL] = useState(false);
  const [similarCanR, setSimilarCanR] = useState(true);
  const updateSimilarArrows = () => {
    const el = similarRailRef.current;
    if (!el) return;
    setSimilarCanL(el.scrollLeft > 4);
    setSimilarCanR(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };
  const [detailOpen,        setDetailOpen]        = useState(false);

  // ── Suggest Edits form state ────────────────────────────────────────────────
  const [suggestField,     setSuggestField]     = useState(0);
  const [suggestDetails,   setSuggestDetails]   = useState("");
  const [suggestSubmitted, setSuggestSubmitted] = useState(false);

  // ── Favorites tooltip state ──────────────────────────────────────────────────
  const [favTooltip, setFavTooltip] = useState<"add" | "remove" | null>(null);
  const favTooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Contact N/A tooltip state ─────────────────────────────────────────────
  const [contactTooltip, setContactTooltip] = useState<"phone" | "wa" | "email" | null>(null);
  const contactTooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function showContactNA(target: "phone" | "wa" | "email") {
    if (contactTooltipTimer.current) clearTimeout(contactTooltipTimer.current);
    setContactTooltip(target);
    contactTooltipTimer.current = setTimeout(() => setContactTooltip(null), 1500);
  }

  // ── Personal note state ─────────────────────────────────────────────────────
  const NOTE_MAX = 500;
  const [noteText,      setNoteText]      = useState("");
  const [noteUpdatedAt, setNoteUpdatedAt] = useState<string | null>(null);
  const [noteEditing,   setNoteEditing]   = useState(false);
  const saveTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartX   = useRef<number>(0);

  // Derived from place state — safe here (not a hook)
  const allPhotos = place
    ? (place.photos && place.photos.length > 0 ? place.photos : [place.photo])
    : [];

  // Fetch place from Supabase
  useEffect(() => {
    setLoadingPlace(true);
    fetchPlaceBySlug(slug).then(p => {
      if (p) { setPlace(p); setLoadingPlace(false); return; }
      fetchPlaceById(slug).then(p2 => { setPlace(p2); setLoadingPlace(false); });
    });
  }, [slug]);

  useEffect(() => {
    if (!place?.id) return;
    const placeId = place.id;
    const ids: string[] = JSON.parse(localStorage.getItem("savedIds") || "[]");
    setIsSaved(ids.includes(placeId));

    function loadUserReview() {
      const found = getReviewForPlace(placeId);
      setUserReview(found ?? null);
    }
    loadUserReview();
    window.addEventListener("focus", loadUserReview);

    // Fetch approved reviews from Supabase
    getSupabaseBrowserClient()
      .from("reviews")
      .select("place_id,place_name,place_icon,reviewer_name,rating,comment,created_at")
      .eq("place_id", placeId)
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .then(({ data }: { data: any[] | null }) => {
        if (!data) return;
        setPublishedReviews(data.map(r => ({
          placeId:   r.place_id,
          placeName: r.place_name  ?? "",
          placeIcon: r.place_icon  ?? "📍",
          name:      r.reviewer_name ?? "",
          rating:    r.rating,
          comment:   r.comment    ?? "",
          date:      new Date(r.created_at).toLocaleDateString("id-ID", { month: "short", year: "numeric" }),
        })));
      });

    // Load existing note
    const existing = getNote(placeId);
    if (existing) {
      setNoteText(existing.noteText);
      setNoteUpdatedAt(existing.updatedAt);
    } else {
      setNoteText("");
      setNoteUpdatedAt(null);
    }

    return () => window.removeEventListener("focus", loadUserReview);
  }, [place?.id]);

  useEffect(() => {
    if (!place || place.category !== "school") return;
    fetchSimilarSchools(place.curriculum, place.id, place.grades).then((results) => {
      setSimilarSchools(results);
      setTimeout(() => updateSimilarArrows(), 50);
    });
  }, [place?.id, place?.curriculum]);

  useEffect(() => {
    if (!place || place.category !== "learning-center") return;
    fetchSimilarLearningCenters(place.courseTypes, place.id).then((results) => {
      setSimilarCenters(results);
      setTimeout(() => updateSimilarArrows(), 50);
    });
  }, [place?.id, place?.courseTypes?.join(",")]);

  useEffect(() => {
    if (!place || place.category !== "daycare") return;
    fetchSimilarDaycares(place.id).then((results) => {
      const sorted = (place.lat && place.lng)
        ? [...results].sort((a, b) => {
            const da = (a.lat && a.lng) ? haversineKm(place.lat!, place.lng!, a.lat, a.lng) : 999;
            const db2 = (b.lat && b.lng) ? haversineKm(place.lat!, place.lng!, b.lat, b.lng) : 999;
            return da - db2;
          })
        : results;
      setSimilarDaycares(sorted.slice(0, 6));
      setTimeout(() => updateSimilarArrows(), 50);
    });
  }, [place?.id]);

  useEffect(() => {
    if (!place || place.category !== "playground") return;
    fetchSimilarPlaygrounds(place.id).then((results) => {
      const sorted = (place.lat && place.lng)
        ? [...results].sort((a, b) => {
            const da = (a.lat && a.lng) ? haversineKm(place.lat!, place.lng!, a.lat, a.lng) : 999;
            const db2 = (b.lat && b.lng) ? haversineKm(place.lat!, place.lng!, b.lat, b.lng) : 999;
            return da - db2;
          })
        : results;
      setSimilarPlaygrounds(sorted.slice(0, 6));
      setTimeout(() => updateSimilarArrows(), 50);
    });
  }, [place?.id]);

  useEffect(() => {
    if (!place || place.category !== "clinic") return;
    fetchSimilarClinics(place.id).then((results) => {
      const sorted = (place.lat && place.lng)
        ? [...results].sort((a, b) => {
            const da = (a.lat && a.lng) ? haversineKm(place.lat!, place.lng!, a.lat, a.lng) : 999;
            const db2 = (b.lat && b.lng) ? haversineKm(place.lat!, place.lng!, b.lat, b.lng) : 999;
            return da - db2;
          })
        : results;
      setSimilarClinics(sorted.slice(0, 6));
      setTimeout(() => updateSimilarArrows(), 50);
    });
  }, [place?.id]);

  useEffect(() => {
    if (!place || place.category !== "cafe") return;
    fetchSimilarCafes(place.id).then((results) => {
      const sorted = (place.lat && place.lng)
        ? [...results].sort((a, b) => {
            const da = (a.lat && a.lng) ? haversineKm(place.lat!, place.lng!, a.lat, a.lng) : 999;
            const db2 = (b.lat && b.lng) ? haversineKm(place.lat!, place.lng!, b.lat, b.lng) : 999;
            return da - db2;
          })
        : results;
      setSimilarCafes(sorted.slice(0, 6));
      setTimeout(() => updateSimilarArrows(), 50);
    });
  }, [place?.id]);

  useEffect(() => {
    if (!place || place.category !== "mini-zoo") return;
    fetchSimilarMiniZoos(place.id).then((results) => {
      const sorted = (place.lat && place.lng)
        ? [...results].sort((a, b) => {
            const da = (a.lat && a.lng) ? haversineKm(place.lat!, place.lng!, a.lat, a.lng) : 999;
            const db2 = (b.lat && b.lng) ? haversineKm(place.lat!, place.lng!, b.lat, b.lng) : 999;
            return da - db2;
          })
        : results;
      setSimilarMiniZoos(sorted.slice(0, 6));
      setTimeout(() => updateSimilarArrows(), 50);
    });
  }, [place?.id]);

  useEffect(() => {
    if (!place || place.category !== "swimming-pool") return;
    fetchSimilarSwimmingPools(place.id).then((results) => {
      const sorted = (place.lat && place.lng)
        ? [...results].sort((a, b) => {
            const da = (a.lat && a.lng) ? haversineKm(place.lat!, place.lng!, a.lat, a.lng) : 999;
            const db2 = (b.lat && b.lng) ? haversineKm(place.lat!, place.lng!, b.lat, b.lng) : 999;
            return da - db2;
          })
        : results;
      setSimilarPools(sorted.slice(0, 6));
      setTimeout(() => updateSimilarArrows(), 50);
    });
  }, [place?.id]);

  useEffect(() => {
    if (!place || place.category !== "bookstore") return;
    fetchSimilarBookstores(place.id).then((results) => {
      const sorted = (place.lat && place.lng)
        ? [...results].sort((a, b) => {
            const da = (a.lat && a.lng) ? haversineKm(place.lat!, place.lng!, a.lat, a.lng) : 999;
            const db2 = (b.lat && b.lng) ? haversineKm(place.lat!, place.lng!, b.lat, b.lng) : 999;
            return da - db2;
          })
        : results;
      setSimilarBookstores(sorted.slice(0, 6));
      setTimeout(() => updateSimilarArrows(), 50);
    });
  }, [place?.id]);

  // Guests can freely view place detail pages (no gate)

  // Auto-advance slideshow every 2 s (pauses when lightbox is open)
  useEffect(() => {
    if (allPhotos.length <= 1 || lightboxOpen) return;
    const timer = setInterval(() => {
      setHeroIndex((i) => (i + 1) % allPhotos.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [allPhotos.length, lightboxOpen]);

  function toggleSave() {
    if (!user) {
      openLoginSheet();
      return;
    }
    const placeId = place?.id ?? slug;
    const ids: string[] = JSON.parse(localStorage.getItem("savedIds") || "[]");
    const adding = !ids.includes(placeId);
    const next = adding ? [...ids, placeId] : ids.filter((x) => x !== placeId);
    localStorage.setItem("savedIds", JSON.stringify(next));
    setIsSaved(next.includes(placeId));
    if (adding) addSaved(placeId, user?.id);
    else removeSaved(placeId, user?.id);
    if (favTooltipTimer.current) clearTimeout(favTooltipTimer.current);
    setFavTooltip(adding ? "add" : "remove");
    favTooltipTimer.current = setTimeout(() => setFavTooltip(null), 2200);
  }

  const categoryHref: Record<string, string> = {
    school:            "/schools",
    "learning-center": "/learning-centers",
    daycare:           "/daycare",
    playground:        "/playgrounds",
    clinic:            "/clinics",
    cafe:              "/cafes",
    "mini-zoo":        "/mini-zoo",
    "swimming-pool":   "/swimming-pools",
    bookstore:         "/bookstores",
    other:             "/others",
  };

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

  if (loadingPlace) {
    return (
      <div className="max-w-md mx-auto flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="font-jakarta text-gray-500 text-sm">Memuat...</p>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="max-w-md mx-auto flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="font-jakarta text-gray-500 text-sm">{t.pdNotFound}</p>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 px-6 py-2 rounded-full text-white text-sm font-jakarta font-semibold"
          style={{ background: "#2e8a5a" }}
        >
          <ChevronLeft size={16} /> {t.pdGoBack}
        </button>
      </div>
    );
  }

  const colors = categoryColor[place.category] ?? { bg: "#e6f4ed", text: "#1f6b43" };
  const extraParas = aboutExtra[place.category] ?? [];

  // ── Distance from home (premium saved address) ───────────────────────────
  const homeKm: number | null = (user?.addressLat && user?.addressLng && place.lat && place.lng)
    ? haversineKm(user.addressLat, user.addressLng, place.lat, place.lng)
    : null;

  // ── Distance from browser geolocation (all users) ────────────────────────
  const geoKm: number | null = (locationStatus === "granted" && userLat && userLng && place.lat && place.lng)
    ? haversineKm(userLat, userLng, place.lat, place.lng)
    : null;

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col" style={{ paddingTop: 52 }}>

      {/* ── Sticky top bar — blue gradient ────────────────────────────────── */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 52, zIndex: 50,
        background: "linear-gradient(160deg, #0a2018 0%, #1f6b43 60%, #2e8a5a 100%)",
      }}>
        <div style={{ maxWidth: 448, margin: "0 auto", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link href="/" style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 34, height: 34, borderRadius: 999,
              background: "rgba(255,255,255,0.18)",
              border: "1px solid rgba(255,255,255,0.22)",
            }}>
              <Home size={15} strokeWidth={2.5} color="#fff" />
            </Link>
            <ActionButton onClick={() => router.back()} style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "7px 12px", borderRadius: 999,
              background: "rgba(255,255,255,0.18)", color: "#fff",
              fontSize: 13, fontWeight: 700,
              border: "1px solid rgba(255,255,255,0.22)",
            }}>
              <ChevronLeft size={14} strokeWidth={2.5} color="#fff" />
              {lang === "id" ? "Kembali" : "Back"}
            </ActionButton>
          </div>
        </div>
      </div>

      {/* ── Lightbox ──────────────────────────────────────────────────────── */}
      {lightboxOpen && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 60,
            background: "rgba(0,0,0,0.95)",
            display: "flex", alignItems: "center", justifyContent: "center",
            touchAction: "pan-y",
          }}
          onClick={() => setLightboxOpen(false)}
          onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            const dx = e.changedTouches[0].clientX - touchStartX.current;
            if (allPhotos.length > 1 && Math.abs(dx) > 40) {
              e.preventDefault();
              setHeroIndex((i) => dx < 0 ? (i + 1) % allPhotos.length : (i - 1 + allPhotos.length) % allPhotos.length);
            }
          }}
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
              fontSize: 16, fontWeight: 700, color: "#0e1d4f",
              margin: "0 0 16px",
            }}>
              Open in Maps
            </p>

            {[
              {
                label: "Google Maps",
                href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.address ?? "")}`,
                logo: (
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                    <rect width="36" height="36" rx="8" fill="#fff" stroke="#e8e8e8" strokeWidth="1"/>
                    {/* Pin body */}
                    <path d="M18 6C13.03 6 9 10.03 9 15c0 7.2 8.25 15.4 8.6 15.75a.6.6 0 00.8 0C18.75 30.4 27 22.2 27 15c0-4.97-4.03-9-9-9z" fill="#EA4335"/>
                    <circle cx="18" cy="15" r="4.2" fill="white"/>
                    <circle cx="18" cy="15" r="2.2" fill="#4285F4"/>
                  </svg>
                ),
              },
              {
                label: "Waze",
                href: `https://waze.com/ul?q=${encodeURIComponent(place.address ?? "")}&navigate=yes`,
                logo: (
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                    <rect width="36" height="36" rx="8" fill="#33CCFF"/>
                    {/* Head */}
                    <ellipse cx="18" cy="20" rx="10" ry="9" fill="white"/>
                    {/* Left horn */}
                    <path d="M11 13c0-3 2-5 4-5 0 2-1 4-4 5z" fill="white"/>
                    {/* Right horn */}
                    <path d="M25 13c0-3-2-5-4-5 0 2 1 4 4 5z" fill="white"/>
                    {/* Left eye */}
                    <ellipse cx="14.5" cy="19" rx="2" ry="2.5" fill="#33CCFF"/>
                    <circle cx="14.5" cy="18.5" r="1" fill="#1a1a1a"/>
                    {/* Right eye */}
                    <ellipse cx="21.5" cy="19" rx="2" ry="2.5" fill="#33CCFF"/>
                    <circle cx="21.5" cy="18.5" r="1" fill="#1a1a1a"/>
                    {/* Smile */}
                    <path d="M13.5 23.5 Q18 27 22.5 23.5" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                  </svg>
                ),
              },
              {
                label: "Apple Maps",
                href: `https://maps.apple.com/?q=${encodeURIComponent(place.address ?? "")}`,
                logo: (
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                    <rect width="36" height="36" rx="8" fill="url(#apple-maps-bg)"/>
                    <defs>
                      <linearGradient id="apple-maps-bg" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#3BC9F5"/>
                        <stop offset="100%" stopColor="#2563EB"/>
                      </linearGradient>
                    </defs>
                    {/* Map road horizontal */}
                    <rect x="6" y="16" width="24" height="4" rx="2" fill="white" opacity="0.9"/>
                    {/* Map road vertical */}
                    <rect x="16" y="6" width="4" height="24" rx="2" fill="white" opacity="0.9"/>
                    {/* Location pin */}
                    <circle cx="18" cy="13" r="4" fill="#FF3B30"/>
                    <circle cx="18" cy="13" r="2" fill="white"/>
                  </svg>
                ),
              },
            ].map(({ label, href, logo }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMapOpen(false)}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "12px 16px", borderRadius: 16, marginBottom: 8,
                  background: "#fff", border: "1.5px solid #e2e8f0",
                  textDecoration: "none",
                  touchAction: "manipulation",
                }}
              >
                {logo}
                <span style={{
                  fontFamily: "var(--font-jakarta), sans-serif",
                  fontSize: 14, fontWeight: 600, color: "#0e1d4f", flex: 1,
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

      {/* ── Fee image lightbox ───────────────────────────────────────────── */}
      {feeImageOpen && place?.feeImageUrl && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 60,
            background: "rgba(0,0,0,0.92)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "0 16px",
            touchAction: "none",
          }}
          onClick={() => setFeeImageOpen(false)}
        >
          {/* Close */}
          <button
            onClick={() => setFeeImageOpen(false)}
            style={{ position: "absolute", top: 52, right: 16, width: 36, height: 36, borderRadius: 999, background: "rgba(255,255,255,0.18)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}
          >
            <X size={18} color="white" />
          </button>
          {/* Download */}
          <button
            onClick={async (e) => {
              e.stopPropagation();
              if (!place?.feeImageUrl) return;
              try {
                const res = await fetch(place.feeImageUrl);
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                const ext = blob.type.includes("png") ? "png" : blob.type.includes("webp") ? "webp" : "jpg";
                a.download = `biaya-${place.slug ?? place.id}.${ext}`;
                a.click();
                URL.revokeObjectURL(url);
              } catch {
                window.open(place.feeImageUrl, "_blank");
              }
            }}
            style={{ position: "absolute", top: 52, left: 16, width: 36, height: 36, borderRadius: 999, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1, border: "none", cursor: "pointer" }}
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>
          {/* Image */}
          <img
            src={place.feeImageUrl}
            alt="Detail biaya"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "100%", maxHeight: "85vh", borderRadius: 12, objectFit: "contain", display: "block" }}
          />
        </div>
      )}

      {/* ── Hero slideshow ────────────────────────────────────────────────── */}
      <div
        style={{ position: "relative", height: 288, overflow: "clip", touchAction: "pan-y" }}
        onClick={() => setLightboxOpen(true)}
        onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - touchStartX.current;
          if (allPhotos.length > 1 && Math.abs(dx) > 40) {
            e.preventDefault();
            setHeroIndex((i) => dx < 0 ? (i + 1) % allPhotos.length : (i - 1 + allPhotos.length) % allPhotos.length);
          }
        }}
      >
        <div style={{
          display: "flex",
          width: `${allPhotos.length * 100}%`,
          height: "100%",
          transform: `translateX(-${heroIndex * (100 / allPhotos.length)}%)`,
          transition: "transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          willChange: "transform",
        }}>
          {allPhotos.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={i === 0 ? place.name : ""}
              style={{
                width: `${100 / allPhotos.length}%`,
                flexShrink: 0,
                height: "100%", objectFit: "cover",
                cursor: "pointer",
              }}
            />
          ))}
        </div>

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
          <div style={{ position: "absolute", bottom: 42, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 6, zIndex: 10, pointerEvents: "none" }}>
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
      <div className="flex-1 rounded-t-[28px] -mt-6 px-5 pt-5 pb-10 space-y-5" style={{ background: "#fff", position: "relative" }}>

        {/* Facility logo badge — photo/card boundary, top-right */}
        {(() => {
          const initials = place.name
            .split(/\s+/).filter(Boolean)
            .slice(0, 2).map(w => w[0].toUpperCase()).join("");
          return (
            <div style={{
              position: "absolute", top: -35, right: 16,
              width: 70, height: 70, borderRadius: 18,
              border: "3px solid #fff",
              boxShadow: "0 4px 14px rgba(0,0,0,0.20)",
              overflow: "clip", zIndex: 10,
              background: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {place.logo
                ? <img src={place.logo} alt={`${place.name} logo`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 17, fontWeight: 800, color: "#f0b429", letterSpacing: -0.5 }}>{initials}</span>
              }
            </div>
          );
        })()}

        {/* Name + category + rating + buttons */}
        <div style={{ marginTop: -8 }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1" style={{ minWidth: 0 }}>
              {/* Breadcrumb */}
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 8, flexWrap: "nowrap", overflow: "hidden" }}>
                <Link href="/" style={{ fontSize: 11, color: "#94a3b8", textDecoration: "none", fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 500, whiteSpace: "nowrap" }}>
                  {lang === "id" ? "Beranda" : "Home"}
                </Link>
                <span style={{ fontSize: 10, color: "#cbd5e1" }}>›</span>
                <Link href={categoryHref[place.category] ?? "/explore"} style={{ fontSize: 11, color: "#94a3b8", textDecoration: "none", fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 500, whiteSpace: "nowrap" }}>
                  {categoryLabel[place.category]}
                </Link>
                <span style={{ fontSize: 10, color: "#cbd5e1" }}>›</span>
                <span style={{ fontSize: 11, color: "#64748b", fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>
                  {place.name}
                </span>
              </div>
              <div style={{ height: 1, background: "rgba(15,23,42,0.08)", margin: "4px 0 6px" }} />

              <h1 className="text-2xl font-bold text-[#0e1d4f] leading-tight" style={{ fontFamily: "var(--font-fraunces), Georgia, serif", letterSpacing: "-0.5px" }}>{place.name}</h1>
              {place.address && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 4, marginTop: 6 }}>
                  <MapPin size={12} style={{ color: "#2e8a5a", marginTop: 1, flexShrink: 0 }} />
                  <span style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
                    {place.address}
                  </span>
                </div>
              )}
              {/* Distance — priority: geoKm (current location) > homeKm (saved address) > geo prompt */}
              {place.lat && place.lng ? (
                geoKm !== null ? (
                  // Browser geolocation obtained — matches the distance shown in filter list
                  <ActionButton
                    onClick={() => setMapOpen(true)}
                    style={{
                      margin: "3px 0 0", display: "flex", alignItems: "center", gap: 4,
                      background: "none", border: "none", padding: 0, cursor: "pointer",
                      fontFamily: "var(--font-jakarta), sans-serif", fontSize: 14,
                      color: "#16a34a", fontWeight: 700,
                    }}
                  >
                    📍 {t.distanceFromLocation(geoKm)}
                  </ActionButton>
                ) : homeKm !== null ? (
                  // Fallback: premium user with saved home address, no geo available
                  <ActionButton
                    onClick={() => setMapOpen(true)}
                    style={{
                      margin: "3px 0 0", display: "flex", alignItems: "center", gap: 4,
                      background: "none", border: "none", padding: 0, cursor: "pointer",
                      fontFamily: "var(--font-jakarta), sans-serif", fontSize: 14,
                      color: "#16a34a", fontWeight: 700,
                    }}
                  >
                    🏠 {t.distanceFromHome(homeKm)}
                  </ActionButton>
                ) : locationStatus === "loading" ? (
                  <p style={{ margin: "3px 0 0", fontFamily: "var(--font-jakarta), sans-serif", fontSize: 12, color: "#64748b" }}>
                    {t.distanceGeoLoading}
                  </p>
                ) : locationStatus !== "denied" && locationStatus !== "unavailable" ? (
                  // Prompt to share location (idle — works for all users, free or premium)
                  <ActionButton
                    onClick={requestLocation}
                    style={{
                      margin: "3px 0 0", display: "flex", alignItems: "center", gap: 4,
                      background: "none", border: "none", padding: 0, cursor: "pointer",
                      fontFamily: "var(--font-jakarta), sans-serif", fontSize: 14,
                      color: "#16a34a", fontWeight: 700,
                    }}
                  >
                    <MapPin size={12} color="#16a34a" style={{ flexShrink: 0 }} />
                    {t.distanceGeoPrompt}
                  </ActionButton>
                ) : null
              ) : null /* place has no coords in DB → hide the line entirely */}
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                <Clock size={12} style={{ color: "#64748b", flexShrink: 0 }} />
                <span style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 12, color: "#64748b" }}>
                  {place.hours}
                  {place.yearFounded && place.category !== "learning-center" && (
                    <>
                      <span style={{ margin: "0 5px", color: "#cbd5e1" }}>|</span>
                      {t.pdYearFounded}: {place.yearFounded}
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* ── Heart + favorites tooltip ─────────────────────────────────── */}
            <div className="flex flex-col items-end flex-shrink-0 mt-7 gap-2" style={{ position: "relative" }}>
              <ActionButton onClick={toggleSave} ariaLabel="Save to favorites" style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 36, height: 36, borderRadius: 999,
                background: isSaved ? "#FEF2F2" : "#F1F5F9",
                border: `1.5px solid ${isSaved ? "#EF4444" : "#E2E8F0"}`,
              }}>
                <Heart size={16} fill={isSaved ? "#EF4444" : "none"} stroke={isSaved ? "#EF4444" : "#94A3B8"} strokeWidth={2} />
              </ActionButton>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, marginTop: 6 }}>
                <span style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 11, fontWeight: 400, color: "#94a3b8", letterSpacing: 0.3 }}>Google Rating</span>
                <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <Star size={13} fill="#FBBF24" stroke="none" />
                  <span style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 13, fontWeight: 700, color: "#0e1d4f" }}>{place.rating}</span>
                </div>
              </div>
              {favTooltip && (
                <div style={{
                  position: "absolute", right: 0, bottom: "calc(100% + 6px)",
                  background: "#1e293b", borderRadius: 8, padding: "5px 10px",
                  whiteSpace: "nowrap", pointerEvents: "none", zIndex: 20,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.22)",
                  animation: "fadein 0.18s ease",
                }}>
                  <span style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 11, fontWeight: 600, color: "#fff" }}>
                    {favTooltip === "add" ? t.favTooltipAdd : t.favTooltipRemove}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── Direct-contact buttons — always rendered, faded when unavailable ── */}
          {(() => {
            const hasPhone = !!(place.phone && place.phone !== "-");
            const hasWa    = !!(place.whatsapp || hasPhone);
            const hasEmail = !!place.email;
            const waNum    = hasWa ? toWaNumber(place.whatsapp ?? place.phone) : "";
            const naTooltipStyle: React.CSSProperties = {
              position: "absolute", bottom: "calc(100% + 6px)", left: "50%",
              transform: "translateX(-50%)",
              background: "#1e293b", borderRadius: 8, padding: "5px 10px",
              whiteSpace: "nowrap", pointerEvents: "none", zIndex: 20,
              boxShadow: "0 4px 12px rgba(0,0,0,0.22)",
              fontFamily: "var(--font-jakarta), sans-serif", fontSize: 11, fontWeight: 600, color: "#fff",
            };
            return (
              <div style={{ display: "flex", gap: 8, marginTop: 12, marginBottom: -6 }}>
                {/* Phone */}
                <div style={{ flex: 1, position: "relative" }}>
                  <ActionButton
                    onClick={() => hasPhone ? window.location.href = `tel:${place.phone}` : showContactNA("phone")}
                    ariaLabel={t.contactCallBtn}
                    style={{
                      width: "100%", minHeight: 44,
                      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                      borderRadius: 12, fontSize: 13, fontWeight: 700,
                      fontFamily: "var(--font-jakarta),sans-serif",
                      background: "#2e8a5a", color: "#fff", border: "none",
                      opacity: hasPhone ? 1 : 0.35,
                    }}
                    title={hasPhone ? place.phone : undefined}
                  >
                    <Phone size={15} strokeWidth={2} />
                    {t.contactCallBtn}
                  </ActionButton>
                  {contactTooltip === "phone" && <div style={naTooltipStyle}>{t.contactPhoneNA}</div>}
                </div>
                {/* WhatsApp */}
                <div style={{ flex: 1, position: "relative" }}>
                  <ActionButton
                    onClick={() => hasWa ? window.open(`https://wa.me/${waNum}`, "_blank") : showContactNA("wa")}
                    ariaLabel={t.contactWhatsAppBtn}
                    style={{
                      width: "100%", minHeight: 44,
                      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                      borderRadius: 12, fontSize: 13, fontWeight: 700,
                      fontFamily: "var(--font-jakarta),sans-serif",
                      background: "#25D366", color: "#fff", border: "none",
                      opacity: hasWa ? 1 : 0.35,
                    }}
                    title={hasWa ? `WhatsApp ${place.whatsapp ?? place.phone}` : undefined}
                  >
                    <WhatsAppIcon size={15} color="#fff" />
                    {t.contactWhatsAppBtn}
                  </ActionButton>
                  {contactTooltip === "wa" && <div style={naTooltipStyle}>{t.contactWaNA}</div>}
                </div>
                {/* Email */}
                <div style={{ position: "relative" }}>
                  <ActionButton
                    onClick={() => hasEmail ? window.location.href = `mailto:${place.email}` : showContactNA("email")}
                    ariaLabel={t.contactEmailBtn}
                    style={{
                      minHeight: 44, minWidth: 44, padding: "0 14px",
                      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5,
                      borderRadius: 12, fontSize: 13, fontWeight: 600,
                      fontFamily: "var(--font-jakarta),sans-serif",
                      background: "#f1f5f9", color: "#475569",
                      border: "1.5px solid #e2e8f0",
                      opacity: hasEmail ? 1 : 0.35,
                    }}
                    title={hasEmail ? place.email : undefined}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2"/>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                    {t.contactEmailBtn}
                  </ActionButton>
                  {contactTooltip === "email" && <div style={naTooltipStyle}>{t.contactEmailNA}</div>}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Info chips */}
        {(() => {
          const ag = getAreaGroup(place.area);
          const areaLabel = ag === "bsd" ? "BSD" : ag === "both" ? "Bintaro & BSD" : "Bintaro";
          const fmtTicket = (place.priceMin === 0 && place.priceMax === 0)
            ? t.free
            : `Rp ${formatPrice(place.priceMin)} – ${formatPrice(place.priceMax)}`;
          const fmtBulanan = place.priceMax && place.priceMax !== place.priceMin
            ? `Rp ${formatPrice(place.priceMin)} – ${formatPrice(place.priceMax)} ${t.perMonth}`
            : `Rp ${formatPrice(place.priceMin)} ${t.perMonth}`;

          // ── Icon map: label string → icon node
          const ic = (Icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>, heroChip = false) => (
            <Icon size={13} color={heroChip ? "#2e8a5a" : "#94a3b8"} strokeWidth={2} />
          );
          const iconMap: Record<string, React.ReactNode> = {
            [t.pdGrade]:           ic(GraduationCap, true),
            [t.pdChipBahasa]:      ic(Globe, true),
            [t.pdCurriculum]:      ic(BookOpen),
            [t.pdChipUangPangkal]: ic(Banknote),
            [t.pdChipSpp]:         ic(Calendar),
            [t.pdStudentsPerClass]:ic(Users),
            [t.pdComputerLab]:     ic(Monitor),
            [t.pdSchoolPool]:      ic(Droplets),
            [t.pdChipCourseType]:  ic(Layers, true),
            [t.pdChipAgeChild]:    ic(Baby, true),
            [t.pdRegistrationFee]: ic(Banknote),
            [t.pdMonthlyFee]:      ic(Wallet),
            [t.pdFreeTrial]:       ic(Gift),
            [t.pdTeacherRatio]:    ic(Users),
            [t.pdTeachingLanguage]:ic(MessageCircle),
            [t.pdAgeRange]:        ic(Baby, true),
            [t.pdCarerRatio]:      ic(Users),
            [t.pdDaycareMethod]:   ic(BookOpen),
            [t.pdCctv]:            ic(Camera),
            [t.pdAccreditation]:   ic(Award),
            [t.pdType]:            ic(Layers, true),
            [t.pdChipTicket]:      ic(Ticket, true),
            ["Harga"]:             ic(Ticket, true),
            [t.pdChipCost]:        ic(CreditCard, true),
            [t.pdChipServices]:    ic(Activity),
            [t.pdChipBudget]:      ic(Wallet, true),
          };

          // ── Hero chip (large, colored bg, label + value stacked)
          const hero = (label: string, value: string) => (
            <div style={{
              flex: 1, background: "transparent", borderRadius: 12,
              padding: "10px 12px", minWidth: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 5 }}>
                {iconMap[label]}
                <span style={{
                  fontFamily: "var(--font-jakarta), sans-serif",
                  fontSize: 9, fontWeight: 700, color: "#2e8a5a",
                  textTransform: "uppercase" as const, letterSpacing: "0.08em",
                }}>
                  {label}
                </span>
              </div>
              <span style={{
                fontFamily: "var(--font-jakarta), sans-serif",
                fontWeight: 700, fontSize: 17, color: "#0e1d4f",
                lineHeight: 1.3, display: "block",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const,
              }}>
                {value}
              </span>
            </div>
          );

          // ── Free info row (label left, value right)
          const yearTag = place.tahunBiaya
            ? <span style={{ fontSize: "0.7rem", color: "#9ca3af", fontWeight: 400, marginLeft: 4 }}>({place.tahunBiaya})</span>
            : null;
          const schoolYearSuffix: Record<string, React.ReactNode> = {
            ...(place.category === "school" ? {
              [t.pdChipUangPangkal]: yearTag,
              [t.pdChipSpp]:         yearTag,
              [t.pdChipAnnualFee]:   yearTag,
            } : {}),
            ...(place.category === "learning-center" ? {
              [t.pdRegistrationFee]: yearTag,
              [t.pdMonthlyFee]:      yearTag,
            } : {}),
          };
          const row = (label: string, value: React.ReactNode) => (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              gap: 8,
              paddingTop: 7, paddingBottom: 7,
              borderBottom: "1px solid #e9eef4",
            }}>
              <span style={{
                display: "flex", alignItems: "center", gap: 6,
                flexShrink: 0,
              }}>
                {iconMap[label]}
                <span style={{
                  fontFamily: "var(--font-jakarta), sans-serif",
                  fontSize: 14, color: "#6b7280",
                }}>
                  {label}{schoolYearSuffix[label]}
                </span>
              </span>
              <span style={{
                fontFamily: "var(--font-jakarta), sans-serif",
                fontWeight: 600, fontSize: 14, color: "#0e1d4f",
                textAlign: "right" as const, maxWidth: "65%",
              }}>
                {value}
              </span>
            </div>
          );

          const gatedRow = (label: string, value: string) => {
            const val = (
              <span style={{
                fontFamily: "var(--font-jakarta), sans-serif",
                fontWeight: 600, fontSize: 14, color: "#0e1d4f",
              }}>
                {value}
              </span>
            );
            return row(label, val);
          };

          // ── Build per-category arrays
          type StrPair = [string, string];
          let heroItems: StrPair[] = [];
          let freeRows:  StrPair[] = [];
          let gatedRows: StrPair[] = [];

          if (place.category === "school") {
            const fmtUp = place.uangPangkalMin !== undefined
              ? `Rp ${formatPrice(place.uangPangkalMin)}${place.uangPangkalMax && place.uangPangkalMax !== place.uangPangkalMin ? ` – ${formatPrice(place.uangPangkalMax)}` : ""}`
              : "—";
            const fmtSpp = place.priceMin > 0
              ? `Rp ${formatPrice(place.priceMin)}${place.priceMax && place.priceMax !== place.priceMin ? ` – ${formatPrice(place.priceMax)}` : ""} / bln`
              : "—";
            const fmtAnnual = place.annualFeeMin !== undefined
              ? `Rp ${formatPrice(place.annualFeeMin)}${place.annualFeeMax && place.annualFeeMax !== place.annualFeeMin ? ` – ${formatPrice(place.annualFeeMax)}` : ""}`
              : null;
            heroItems = [];
            freeRows = [
              [t.pdGrade,      place.grades?.join(", ") ?? "—"],
              [t.pdChipBahasa, place.teachingLanguageDisplay ?? place.bahasa?.join(", ") ?? "—"],
              [t.pdCurriculum, place.curriculum ?? "—"],
              [t.pdStudentsPerClass, place.studentsPerClass !== undefined ? `${place.studentsPerClass} murid` : "—"],
              [t.pdChipUangPangkal, fmtUp],
              [t.pdChipSpp, fmtSpp],
              [t.pdChipAnnualFee, fmtAnnual ?? "—"],
            ];

          } else if (place.category === "learning-center") {
            const fmtRegFee = place.registrationFeeMin !== undefined
              ? `Rp ${formatPrice(place.registrationFeeMin)}${place.registrationFeeMax && place.registrationFeeMax !== place.registrationFeeMin ? ` – ${formatPrice(place.registrationFeeMax)}` : ""}`
              : "—";
            heroItems = [];
            freeRows = [
              [t.pdChipCourseType, place.courseTypes?.join(", ") ?? place.centerType ?? "—"],
              [t.pdRegistrationFee, fmtRegFee],
              [t.pdMonthlyFee,      fmtBulanan],
              [t.pdChipAgeChild,    place.ageRange],
            ];
            if (place.teachingLanguage !== undefined)
              freeRows.push([t.pdTeachingLanguage, place.teachingLanguage]);
            if (place.teacherStudentRatio !== undefined)
              freeRows.push([t.pdTeacherRatio, place.teacherStudentRatio]);
            if (place.freeTrial !== undefined)
              freeRows.push([t.pdFreeTrial, place.freeTrial ? "Ada" : "Tidak Ada"]);

          } else if (place.category === "daycare") {
            heroItems = [];
            freeRows = [
              [t.pdAgeRange,   place.daycareAgeGroups?.join(", ") ?? place.ageRange],
              [t.pdMonthlyFee, place.priceMin > 0 ? fmtBulanan : "—"],
            ];
            if (place.carerChildRatio !== undefined)
              freeRows.push([t.pdCarerRatio, place.carerChildRatio]);
            if (place.daycareMethod !== undefined)
              freeRows.push([t.pdDaycareMethod, place.daycareMethod]);
            if (place.hasCctv !== undefined)
              freeRows.push([t.pdCctv, place.hasCctv ? "Ada" : "Tidak Ada"]);
            if (place.hasAccreditation !== undefined)
              freeRows.push([t.pdAccreditation, place.hasAccreditation ? "Ada" : "Tidak Ada"]);

          } else if (place.category === "playground") {
            heroItems = [];
            const rawType = place.playgroundTypeRaw ?? (place.playgroundType === "indoor" ? "Indoor" : "Outdoor");
            const typeEmoji = rawType.toLowerCase().includes("outdoor") && !rawType.toLowerCase().includes("indoor")
              ? "🌳" : "🏠";
            freeRows = [
              [t.pdType,  `${typeEmoji} ${rawType}`],
              ["Harga",   fmtTicket],
            ];

          } else if (place.category === "clinic") {
            heroItems = [];
            freeRows = [
              [t.pdChipCost, `Rp ${formatPrice(place.priceMin)} – ${formatPrice(place.priceMax)}`],
            ];
            if (place.clinicServices?.length)
              freeRows.push([t.pdChipServices, place.clinicServices.join(", ")]);

          } else if (place.category === "cafe") {
            heroItems = [];
            freeRows = [];
            if (place.priceCategory) freeRows.push([t.pdChipBudget, place.priceCategory]);

          } else if (place.category === "mini-zoo") {
            heroItems = [];
            freeRows = [
              ["Harga", fmtTicket],
            ];

          } else if (place.category === "swimming-pool") {
            heroItems = [];
            freeRows = [
              ["Harga", fmtTicket],
            ];

          } else if (place.category === "bookstore") {
            heroItems = [];
            freeRows = [];
          }

          return (
            <div style={{
              marginTop: 4,
              background: "#f8fafc",
              borderRadius: 18,
              padding: "6px 14px 4px",
            }}>
              {/* Hero chips */}
              {heroItems.length > 0 && (
                <div style={{ display: "flex", marginBottom: 0, paddingBottom: 12, borderBottom: "1px solid #e9eef4" }}>
                  {heroItems.map(([label, value], i) => (
                    <React.Fragment key={label}>
                      {i > 0 && <div style={{ width: 1, background: "#e9eef4", alignSelf: "stretch", flexShrink: 0 }} />}
                      {hero(label, value)}
                    </React.Fragment>
                  ))}
                </div>
              )}

              {/* Free rows */}
              {freeRows.length > 0 && (
                <div>
                  {freeRows.map(([label, value]) => (
                    <React.Fragment key={label}>{row(label, value)}</React.Fragment>
                  ))}
                </div>
              )}

              {/* Collapsible: fee image (schools, learning-centers & daycares) or gated rows (other categories) */}
              {(place.category === "school" || place.category === "learning-center" || place.category === "daycare" || place.category === "clinic" || gatedRows.length > 0) && (
                <>
                  <ActionButton
                    onClick={() => setDetailOpen((o) => !o)}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      width: "100%", padding: "10px 12px",
                      background: "#d1fae5", border: "none",
                      borderRadius: 10,
                      marginTop: freeRows.length > 0 ? 8 : 0,
                      touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                      cursor: "pointer",
                    } as React.CSSProperties}
                  >
                    <span style={{
                      fontFamily: "var(--font-jakarta), sans-serif",
                      fontSize: 15, fontWeight: 700, color: "#166534",
                    }}>
                      {t.pdSeeDetails}
                    </span>
                    <ChevronDown
                      size={18} color="#166534"
                      style={{ transform: detailOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
                    />
                  </ActionButton>

                  {detailOpen && (
                    <div style={{ borderTop: "1px solid #e9eef4", paddingTop: 10, paddingBottom: 6 }}>
                      {(place.category === "school" || place.category === "learning-center" || place.category === "daycare" || place.category === "clinic") ? (
                        place.feeImageUrl ? (
                          user ? (
                            /* Logged in — full image */
                            <div
                              style={{ position: "relative", borderRadius: 12, overflow: "clip" }}
                              onClick={() => setFeeImageOpen(true)}
                            >
                              <img
                                src={place.feeImageUrl}
                                alt="Detail biaya"
                                style={{ width: "100%", borderRadius: 12, display: "block", cursor: "pointer" }}
                              />
                            </div>
                          ) : (
                            /* Guest — blurred with register prompt */
                            <div style={{ position: "relative", borderRadius: 12, overflow: "clip" }}>
                              <img
                                src={place.feeImageUrl}
                                alt="Detail biaya"
                                style={{ width: "100%", borderRadius: 12, display: "block", filter: "blur(8px)", transform: "scale(1.05)" }}
                              />
                              <div
                                style={{
                                  position: "absolute", inset: 0,
                                  display: "flex", flexDirection: "column",
                                  alignItems: "center", justifyContent: "center", gap: 10,
                                  background: "rgba(14,29,79,0.35)",
                                }}
                              >
                                <div style={{
                                  width: 44, height: 44, borderRadius: 999,
                                  background: "#fff",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                  <Lock size={20} color="#0e1d4f" strokeWidth={2.5} />
                                </div>
                                <ActionButton
                                  onClick={openRegisterSheet}
                                  style={{
                                    padding: "8px 18px", borderRadius: 999,
                                    background: "#2e8a5a", color: "#fff",
                                    fontSize: 12, fontWeight: 700,
                                    fontFamily: "var(--font-jakarta), sans-serif",
                                    touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                                  }}
                                >
                                  {lang === "id" ? "Daftar untuk melihat" : "Register to view"}
                                </ActionButton>
                              </div>
                            </div>
                          )
                        ) : (
                          <div style={{
                            padding: "20px 0", textAlign: "center",
                            color: "#94a3b8", fontSize: 13,
                            fontFamily: "var(--font-jakarta), sans-serif",
                          }}>
                            Data Belum Tersedia
                          </div>
                        )
                      ) : (
                        gatedRows.map(([label, value]) => (
                          <React.Fragment key={label}>{gatedRow(label, value)}</React.Fragment>
                        ))
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })()}

        {/* Detail image — playgrounds, mini-zoos, swimming-pools, free (no gate) */}
        {(place.category === "playground" || place.category === "mini-zoo" || place.category === "swimming-pool") && place.feeImageUrl && (
          <div>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: "#2e8a5a", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {lang === "id" ? "Detail Lengkap" : "Full Details"}
            </h2>
            <div
              style={{ borderRadius: 14, overflow: "clip", cursor: "pointer" }}
              onClick={() => setFeeImageOpen(true)}
            >
              <img
                src={place.feeImageUrl}
                alt="Detail info"
                style={{ width: "100%", borderRadius: 14, display: "block" }}
              />
            </div>
          </div>
        )}

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
            <div className="rounded-2xl p-5 border-2 border-dashed" style={{ background: "#e6f4ed", borderColor: "#a7d4bc" }}>
              <div className="flex items-center gap-2 mb-4">
                <Star size={20} fill="#FBBF24" stroke="none" />
                <h2 className="text-xl font-bold text-[#0e1d4f]" style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}>{t.tkRatingTitle}</h2>
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
                <p className="font-jakarta text-sm font-bold text-[#0e1d4f] mb-1">{t.tkVerdict}</p>
                <p className="font-jakarta text-sm text-gray-600 leading-relaxed">{tkr.verdict}</p>
              </div>
            </div>
          );
        })()}

        {/* About */}
        <div>
          <h2 style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 22, fontWeight: 700, color: "#0e1d4f", marginBottom: 4 }}>{t.pdAbout}</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {((lang === "en" && place.aboutEn ? place.aboutEn : place.description) ?? "").split(/\n+/).filter(Boolean).map((para, i) => (
              <p key={i} className="font-jakarta text-gray-600 text-sm leading-relaxed" style={{ margin: 0 }}>{para}</p>
            ))}
          </div>
        </div>

        {/* Fasilitas */}
        {place.category !== "bookstore" && (place.facilitiesEn || place.facilities) && (() => {
          const raw = lang === "en" && place.facilitiesEn ? place.facilitiesEn : place.facilities;
          const items = (raw ?? "").split(",").map(x => x.trim()).filter(Boolean);
          return (
            <div>
              <h2 style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 22, fontWeight: 700, color: "#0e1d4f", marginBottom: 4 }}>
                {t.pdFacilities}
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 8px" }}>
                {items.map((item) => (
                  <div key={item} style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                    <span style={{ color: "#2e8a5a", fontSize: 14, lineHeight: 1, flexShrink: 0 }}>•</span>
                    <span className="font-jakarta text-gray-600 text-sm leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}


        {/* Ekstrakurikuler */}
        {(place.extracurricularsEn || place.extracurriculars) && (() => {
          const raw = lang === "en" && place.extracurricularsEn ? place.extracurricularsEn : place.extracurriculars;
          const items = (raw ?? "").split(",").map(x => x.trim()).filter(Boolean);
          return (
            <div>
              <h2 style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 22, fontWeight: 700, color: "#0e1d4f", marginBottom: 4 }}>
                {t.pdExtracurriculars}
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 8px" }}>
                {items.map((item) => (
                  <div key={item} style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                    <span style={{ color: "#2e8a5a", fontSize: 14, lineHeight: 1, flexShrink: 0 }}>•</span>
                    <span className="font-jakarta text-gray-600 text-sm leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* ── Personal Notes ───────────────────────────────────────────────── */}
        <div style={{ marginTop: 8, marginBottom: 20 }}>
        {!!user ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {/* Label */}
            <p style={{
              margin: 0,
              fontFamily: "var(--font-jakarta), sans-serif",
              fontSize: 11, fontWeight: 700, color: "#64748b",
              textTransform: "uppercase", letterSpacing: 0.8,
            }}>
              📝 {t.notesLabel}
            </p>

            {noteUpdatedAt && !noteEditing ? (
              /* ── Saved display row ── */
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "9px 12px", borderRadius: 12,
                background: "#fff", border: "1.5px solid #BBF7D0",
              }}>
                <span style={{
                  flex: 1, fontFamily: "var(--font-jakarta), sans-serif",
                  fontSize: 13, color: "#166534",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {noteText}
                </span>
                {/* Edit */}
                <ActionButton
                  onClick={() => setNoteEditing(true)}
                  style={{
                    flexShrink: 0, padding: "4px 6px", borderRadius: 8,
                    background: "#f1f5f9", display: "flex", alignItems: "center",
                    touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                  }}
                >
                  <Pencil size={13} color="#64748b" />
                </ActionButton>
                {/* Delete */}
                <ActionButton
                  onClick={() => {
                    if (saveTimerRef.current) { clearTimeout(saveTimerRef.current); saveTimerRef.current = null; }
                    deleteNote(place?.id ?? slug, user?.id);
                    setNoteText(""); setNoteUpdatedAt(null); setNoteEditing(false);
                  }}
                  style={{
                    flexShrink: 0, padding: "4px 6px", borderRadius: 8,
                    background: "#FEF2F2", display: "flex", alignItems: "center",
                    touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                  }}
                >
                  <X size={13} color="#ef4444" />
                </ActionButton>
              </div>
            ) : (
              /* ── Edit / empty input row ── */
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  type="text"
                  className="note-input"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value.slice(0, NOTE_MAX))}
                  placeholder={t.notesPlaceholder}
                  maxLength={NOTE_MAX}
                  autoFocus={noteEditing}
                  style={{
                    width: "100%", padding: "9px 40px 9px 12px", borderRadius: 12,
                    fontFamily: "var(--font-jakarta), sans-serif", fontSize: 13,
                    border: "1.5px solid #E2E8F0", outline: "none",
                    color: "#1E293B", background: "#fff", boxSizing: "border-box",
                  }}
                />
                {/* Checkmark — only shown when there's text */}
                {noteText.trim() && (
                  <ActionButton
                    onClick={() => {
                      if (saveTimerRef.current) { clearTimeout(saveTimerRef.current); saveTimerRef.current = null; }
                      const now = new Date().toISOString();
                      saveNote({ placeId: place?.id ?? slug, placeName: place.name, placeCategory: place.category, placeIcon: place.icon, noteText, updatedAt: now }, user?.id);
                      setNoteUpdatedAt(now);
                      setNoteEditing(false);
                    }}
                    style={{
                      position: "absolute", right: 6,
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                      background: "#16a34a",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    <Check size={14} color="#fff" strokeWidth={2.5} />
                  </ActionButton>
                )}
              </div>
            )}
          </div>
        ) : (
          /* ── Guest — prompt to login ── */
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <p style={{
              margin: 0,
              fontFamily: "var(--font-jakarta), sans-serif",
              fontSize: 11, fontWeight: 700, color: "#64748b",
              textTransform: "uppercase", letterSpacing: 0.8,
            }}>
              📝 {t.notesLabel}
            </p>
            <ActionButton
              onClick={openLoginSheet}
              style={{
                position: "relative", width: "100%",
                padding: "9px 40px 9px 12px", borderRadius: 12,
                background: "#fff", border: "1.5px solid #E2E8F0",
                textAlign: "left",
                fontFamily: "var(--font-jakarta), sans-serif",
                fontSize: 13, color: "#cbd5e1",
                touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                boxSizing: "border-box",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}
            >
              {t.notesPlaceholder}
              <div style={{
                position: "absolute", right: 6, top: "50%",
                transform: "translateY(-50%)",
                width: 28, height: 28, borderRadius: 8,
                background: "#f1f5f9",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Lock size={13} color="#d97706" strokeWidth={2.5} />
              </div>
            </ActionButton>
          </div>
        )}
        </div>

        {/* Enrollment schedule box — schools only, now below About */}
        {place.category === "school" && (
          <div className="rounded-2xl p-4" style={{ background: "#e6f4ed" }}>
            <p className="text-xs font-jakarta text-[#3aab74] font-semibold uppercase tracking-wide mb-0.5">
              {t.pdEnrollTitle}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {((lang === "en" && place.jadwalPendaftaranEn ? place.jadwalPendaftaranEn : place.jadwalPendaftaran) ?? t.pdEnrollSoon)
                .split(/\n+/)
                .filter(Boolean)
                .map((line, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                    <span style={{ color: "#3aab74", fontSize: 12, flexShrink: 0 }}>•</span>
                    <span className="text-sm font-semibold text-[#0e1d4f]" style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}>
                      {line.replace(/^[\s•\-\*·]+/, "")}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Social Media */}
        <div>
          <h2 style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 22, fontWeight: 700, color: "#0e1d4f", marginBottom: 12 }}>
            Social Media
          </h2>
          <div style={{ display: "flex", gap: 10 }}>
            {([
              { key: "instagram", url: place.instagram, label: "Instagram", color: "#E1306C",  Icon: InstagramIcon },
              { key: "facebook",  url: place.facebook,  label: "Facebook",  color: "#1877F2",  Icon: FacebookIcon  },
              { key: "tiktok",    url: place.tiktok,    label: "TikTok",    color: "#010101",  Icon: TikTokIcon    },
              { key: "youtube",   url: place.youtube,   label: "YouTube",   color: "#FF0000",  Icon: YouTubeIcon   },
              { key: "website",   url: place.website,   label: "Website",   color: "#2e8a5a",
                Icon: ({ size, color }: { size: number; color: string }) => <Globe size={size} color={color} strokeWidth={1.75} /> },
            ] as const).map(({ key, url, label, color, Icon }) => {
              const active = !!url;
              const bubble = (
                <div style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  opacity: active ? 1 : 0.55,
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
          <h2 style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 22, fontWeight: 700, color: "#0e1d4f", marginBottom: 4 }}>
            {t.pdVideosTitle}
          </h2>
          {(place.videos ?? []).length === 0 ? (
            <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 14, color: "#94a3b8" }}>
              Belum ada video terkait.
            </p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {(place.videos ?? []).map((videoId, idx) => (
                <ActionButton
                  key={videoId}
                  onClick={() => setVideoOpen(videoId)}
                  style={{ display: "block", textAlign: "left", padding: 0, borderRadius: 14, overflow: "clip" }}
                >
                  <div style={{ position: "relative", paddingBottom: "56.25%", background: "#000", borderRadius: "14px 14px 0 0", overflow: "clip" }}>
                    <img
                      src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                      alt={`Video ${idx + 1}`}
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.22)" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 999, background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Play size={16} fill="#1f6b43" stroke="none" style={{ marginLeft: 2 }} />
                      </div>
                    </div>
                  </div>
                </ActionButton>
              ))}
            </div>
          )}
        </div>

        {/* Reviews */}
        {(() => {
          const totalCount = publishedReviews.length + (userReview ? 1 : 0);
          const isPending = userReview && userReview.isPublished === false;
          return (
            <div>
              <h2 style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 22, fontWeight: 700, color: "#0e1d4f", marginBottom: 4 }}>
                {t.pdUserReviewsTitle}{totalCount > 0 ? ` (${totalCount})` : ""}
              </h2>
              {totalCount === 0 ? (
                <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 14, color: "#94a3b8" }}>
                  Belum ada review.
                </p>
              ) : (
                <div className="space-y-3">
                  {/* User's own review — shown first */}
                  {userReview && (
                    <div className="rounded-2xl p-4" style={{ background: isPending ? "#FFFBEB" : "#F0F9FF", border: `1.5px solid ${isPending ? "#FDE68A" : "#BAE6FD"}` }}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-jakarta font-semibold text-sm text-gray-800">{userReview.name}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, background: isPending ? "#F59E0B" : "#2e8a5a", color: "#fff", borderRadius: 999, padding: "2px 7px", fontFamily: "var(--font-jakarta), sans-serif" }}>
                            {isPending ? "Menunggu persetujuan" : "Ulasanmu"}
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
                      {isPending && (
                        <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 11, color: "#92400e", marginTop: 8 }}>
                          Ulasanmu sedang ditinjau dan akan ditampilkan setelah disetujui.
                        </p>
                      )}
                    </div>
                  )}
                  {/* Published reviews from other users */}
                  {publishedReviews.map((review, i) => (
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
              )}
            </div>
          );
        })()}

        {/* Write / Edit a Review button */}
        {userReview ? (
          <ActionButton
            onClick={() => router.push(`/write-review/${place.id}`)}
            style={{
              width: "100%", padding: "12px 16px",
              borderRadius: 14, border: "2px solid #D1D5DB",
              background: "#F9FAFB", color: "#6B7280",
              fontFamily: "var(--font-jakarta), sans-serif",
              fontSize: 14, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
            }}
          >
            <Pencil size={15} /> {t.reviewEditBtn}
          </ActionButton>
        ) : (
          <ActionButton
            onClick={() => {
              if (!user) { openLoginSheet(); return; }
              router.push(`/write-review/${place.id}`);
            }}
            style={{
              width: "100%", padding: "12px 16px",
              borderRadius: 14, border: "2px solid #2e8a5a",
              background: "#e6f4ed", color: "#2e8a5a",
              fontFamily: "var(--font-jakarta), sans-serif",
              fontSize: 14, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
            }}
          >
            <Pencil size={15} /> {t.reviewWriteBtn}
          </ActionButton>
        )}

        {/* ── Sekolah Lain Yang Mirip ──────────────────────────────────── */}
        {place.category === "school" && similarSchools.length > 0 && (
          <div style={{
            margin: "28px -20px 0",
            background: "#e8eaed",
            padding: "20px 20px 22px",
          }}>
            <h2 style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 22, fontWeight: 700, color: "#0e1d4f", marginBottom: 12 }}>
              {lang === "id" ? "Sekolah Lain Yang Mirip" : "Similar Schools"}
            </h2>
            <div style={{ position: "relative" }}>
              <div
                ref={similarRailRef}
                onScroll={updateSimilarArrows}
                style={{ display: "flex", gap: 10, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 4 }}
              >
                {similarSchools.map((s) => (
                  <a
                    key={s.id}
                    href={`/place/${s.slug ?? s.id}`}
                    style={{ textDecoration: "none", flexShrink: 0, width: 130 }}
                  >
                    <div style={{ borderRadius: 14, overflow: "clip", border: "1.5px solid #d1ead9", background: "#fff" }}>
                      <img
                        src={s.photo}
                        alt={s.name}
                        style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }}
                      />
                      <div style={{ padding: "8px 9px" }}>
                        <p style={{
                          fontFamily: "var(--font-fraunces), Georgia, serif",
                          fontSize: 14, fontWeight: 700, color: "#0e1d4f",
                          margin: 0, lineHeight: 1.3,
                          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}>
                          {s.name}
                        </p>
                        {s.curriculum && (
                          <p style={{
                            fontFamily: "var(--font-jakarta), sans-serif",
                            fontSize: 12, color: "#64748b",
                            margin: "3px 0 0",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>
                            {s.curriculum}
                          </p>
                        )}
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              {/* Left arrow */}
              <button
                onClick={() => { similarRailRef.current?.scrollBy({ left: -160, behavior: "smooth" }); }}
                onTouchEnd={(e) => { e.preventDefault(); similarRailRef.current?.scrollBy({ left: -160, behavior: "smooth" }); }}
                style={{
                  position: "absolute", left: -8, top: "40%", transform: "translateY(-50%)",
                  width: 30, height: 30, borderRadius: 999,
                  background: "#fff", border: "1px solid #d1ead9",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: similarCanL ? 1 : 0,
                  pointerEvents: similarCanL ? "auto" : "none",
                  transition: "opacity .2s",
                  cursor: "pointer", touchAction: "manipulation",
                  WebkitTapHighlightColor: "transparent", padding: 0,
                }}
              >
                <ChevronLeft size={16} color="#0e1d4f" strokeWidth={2.5} />
              </button>

              {/* Right arrow */}
              <button
                onClick={() => { similarRailRef.current?.scrollBy({ left: 160, behavior: "smooth" }); }}
                onTouchEnd={(e) => { e.preventDefault(); similarRailRef.current?.scrollBy({ left: 160, behavior: "smooth" }); }}
                style={{
                  position: "absolute", right: -8, top: "40%", transform: "translateY(-50%)",
                  width: 30, height: 30, borderRadius: 999,
                  background: "#fff", border: "1px solid #d1ead9",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: similarCanR ? 1 : 0,
                  pointerEvents: similarCanR ? "auto" : "none",
                  transition: "opacity .2s",
                  cursor: "pointer", touchAction: "manipulation",
                  WebkitTapHighlightColor: "transparent", padding: 0,
                }}
              >
                <ChevronRight size={16} color="#0e1d4f" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}

        {/* ── Tempat Kursus Yang Serupa ────────────────────────────────── */}
        {place.category === "learning-center" && similarCenters.length > 0 && (
          <div style={{
            margin: "28px -20px 0",
            background: "#e8eaed",
            padding: "20px 20px 22px",
          }}>
            <h2 style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 22, fontWeight: 700, color: "#0e1d4f", marginBottom: 12 }}>
              {lang === "id" ? "Tempat Kursus Yang Serupa" : "Similar Learning Centers"}
            </h2>
            <div style={{ position: "relative" }}>
              <div
                ref={similarRailRef}
                onScroll={updateSimilarArrows}
                style={{ display: "flex", gap: 10, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 4 }}
              >
                {similarCenters.map((s) => (
                  <a
                    key={s.id}
                    href={`/place/${s.slug ?? s.id}`}
                    style={{ textDecoration: "none", flexShrink: 0, width: 130 }}
                  >
                    <div style={{ borderRadius: 14, overflow: "clip", border: "1.5px solid #d1ead9", background: "#fff" }}>
                      <img
                        src={s.photo}
                        alt={s.name}
                        style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }}
                      />
                      <div style={{ padding: "8px 9px" }}>
                        <p style={{
                          fontFamily: "var(--font-fraunces), Georgia, serif",
                          fontSize: 14, fontWeight: 700, color: "#0e1d4f",
                          margin: 0, lineHeight: 1.3,
                          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}>
                          {s.name}
                        </p>
                        {s.courseTypes && s.courseTypes.length > 0 && (
                          <p style={{
                            fontFamily: "var(--font-jakarta), sans-serif",
                            fontSize: 12, color: "#64748b",
                            margin: "3px 0 0",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>
                            {s.courseTypes.join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              {/* Left arrow */}
              <button
                onClick={() => { similarRailRef.current?.scrollBy({ left: -160, behavior: "smooth" }); }}
                onTouchEnd={(e) => { e.preventDefault(); similarRailRef.current?.scrollBy({ left: -160, behavior: "smooth" }); }}
                style={{
                  position: "absolute", left: -8, top: "40%", transform: "translateY(-50%)",
                  width: 30, height: 30, borderRadius: 999,
                  background: "#fff", border: "1px solid #d1ead9",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: similarCanL ? 1 : 0,
                  pointerEvents: similarCanL ? "auto" : "none",
                  transition: "opacity .2s",
                  cursor: "pointer", touchAction: "manipulation",
                  WebkitTapHighlightColor: "transparent", padding: 0,
                }}
              >
                <ChevronLeft size={16} color="#0e1d4f" strokeWidth={2.5} />
              </button>

              {/* Right arrow */}
              <button
                onClick={() => { similarRailRef.current?.scrollBy({ left: 160, behavior: "smooth" }); }}
                onTouchEnd={(e) => { e.preventDefault(); similarRailRef.current?.scrollBy({ left: 160, behavior: "smooth" }); }}
                style={{
                  position: "absolute", right: -8, top: "40%", transform: "translateY(-50%)",
                  width: 30, height: 30, borderRadius: 999,
                  background: "#fff", border: "1px solid #d1ead9",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: similarCanR ? 1 : 0,
                  pointerEvents: similarCanR ? "auto" : "none",
                  transition: "opacity .2s",
                  cursor: "pointer", touchAction: "manipulation",
                  WebkitTapHighlightColor: "transparent", padding: 0,
                }}
              >
                <ChevronRight size={16} color="#0e1d4f" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}

        {/* ── Daycare Terdekat ─────────────────────────────────────────────── */}
        {place.category === "daycare" && similarDaycares.length > 0 && (
          <div style={{ margin: "28px -20px 0", background: "#e8eaed", padding: "20px 20px 22px" }}>
            <h2 style={{
              fontFamily: "var(--font-fraunces), Georgia, serif",
              fontSize: 22, fontWeight: 700, color: "#0e1d4f", marginBottom: 12,
            }}>
              {lang === "id" ? "Daycare Terdekat" : "Nearby Daycares"}
            </h2>
            <div style={{ position: "relative" }}>
              <div
                ref={similarRailRef}
                onScroll={updateSimilarArrows}
                style={{
                  display: "flex", gap: 10, overflowX: "auto",
                  scrollbarWidth: "none", paddingBottom: 4,
                }}
              >
                {similarDaycares.map((s) => (
                  <a key={s.id} href={`/place/${s.slug ?? s.id}`}
                    style={{ textDecoration: "none", flexShrink: 0, width: 130 }}>
                    <div style={{
                      borderRadius: 14, overflow: "clip",
                      border: "1.5px solid #d1ead9", background: "#fff",
                    }}>
                      <img
                        src={s.photo}
                        alt={s.name}
                        style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }}
                      />
                      <div style={{ padding: "8px 9px" }}>
                        <p style={{
                          fontFamily: "var(--font-fraunces), Georgia, serif",
                          fontSize: 14, fontWeight: 700, color: "#0e1d4f",
                          margin: 0, lineHeight: 1.3,
                          display: "-webkit-box", WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical", overflow: "hidden",
                        }}>
                          {s.name}
                        </p>
                        {s.daycareMethod && (
                          <p style={{
                            fontFamily: "var(--font-jakarta), sans-serif",
                            fontSize: 12, color: "#64748b", margin: "3px 0 0",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>
                            {s.daycareMethod}
                          </p>
                        )}
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              {/* Left arrow */}
              <button
                onClick={() => { similarRailRef.current?.scrollBy({ left: -160, behavior: "smooth" }); }}
                onTouchEnd={(e) => { e.preventDefault(); similarRailRef.current?.scrollBy({ left: -160, behavior: "smooth" }); }}
                style={{
                  position: "absolute", left: -8, top: "40%", transform: "translateY(-50%)",
                  width: 30, height: 30, borderRadius: 999,
                  background: "#fff", border: "1px solid #d1ead9",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: similarCanL ? 1 : 0,
                  pointerEvents: similarCanL ? "auto" : "none",
                  transition: "opacity .2s",
                  cursor: "pointer", touchAction: "manipulation",
                  WebkitTapHighlightColor: "transparent", padding: 0,
                }}
              >
                <ChevronLeft size={16} color="#0e1d4f" strokeWidth={2.5} />
              </button>

              {/* Right arrow */}
              <button
                onClick={() => { similarRailRef.current?.scrollBy({ left: 160, behavior: "smooth" }); }}
                onTouchEnd={(e) => { e.preventDefault(); similarRailRef.current?.scrollBy({ left: 160, behavior: "smooth" }); }}
                style={{
                  position: "absolute", right: -8, top: "40%", transform: "translateY(-50%)",
                  width: 30, height: 30, borderRadius: 999,
                  background: "#fff", border: "1px solid #d1ead9",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: similarCanR ? 1 : 0,
                  pointerEvents: similarCanR ? "auto" : "none",
                  transition: "opacity .2s",
                  cursor: "pointer", touchAction: "manipulation",
                  WebkitTapHighlightColor: "transparent", padding: 0,
                }}
              >
                <ChevronRight size={16} color="#0e1d4f" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}

        {/* Similar Playgrounds */}
        {place.category === "playground" && similarPlaygrounds.length > 0 && (
          <div style={{ margin: "28px -20px 0", background: "#e8eaed", padding: "20px 20px 22px" }}>
            <h2 style={{
              fontFamily: "var(--font-fraunces), Georgia, serif",
              fontSize: 22, fontWeight: 700, color: "#0e1d4f", marginBottom: 12,
            }}>
              {lang === "id" ? "Playground Terdekat" : "Nearby Playgrounds"}
            </h2>
            <div style={{ position: "relative" }}>
              <div
                ref={similarRailRef}
                onScroll={updateSimilarArrows}
                style={{ display: "flex", gap: 10, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 4 }}
              >
                {similarPlaygrounds.map((s) => {
                  const distKm = (place.lat && place.lng && s.lat && s.lng)
                    ? haversineKm(place.lat, place.lng, s.lat, s.lng)
                    : null;
                  const distLabel = distKm !== null
                    ? (distKm < 1 ? `${Math.round(distKm * 1000)} m` : `${distKm.toFixed(1)} km`)
                    : null;
                  return (
                    <a key={s.id} href={`/place/${s.slug ?? s.id}`}
                      style={{ textDecoration: "none", flexShrink: 0, width: 130 }}>
                      <div style={{ borderRadius: 14, overflow: "clip", border: "1.5px solid #d1ead9", background: "#fff" }}>
                        <img
                          src={s.photo}
                          alt={s.name}
                          style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }}
                        />
                        <div style={{ padding: "8px 9px" }}>
                          <p style={{
                            fontFamily: "var(--font-fraunces), Georgia, serif",
                            fontSize: 14, fontWeight: 700, color: "#0e1d4f",
                            margin: 0, lineHeight: 1.3,
                            display: "-webkit-box", WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical", overflow: "hidden",
                          }}>
                            {s.name}
                          </p>
                          {distLabel && (
                            <p style={{
                              fontFamily: "var(--font-jakarta), sans-serif",
                              fontSize: 12, color: "#64748b", margin: "3px 0 0",
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            }}>
                              📍 {distLabel}
                            </p>
                          )}
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>

              <button
                onClick={() => { similarRailRef.current?.scrollBy({ left: -160, behavior: "smooth" }); }}
                onTouchEnd={(e) => { e.preventDefault(); similarRailRef.current?.scrollBy({ left: -160, behavior: "smooth" }); }}
                style={{
                  position: "absolute", left: -8, top: "40%", transform: "translateY(-50%)",
                  width: 30, height: 30, borderRadius: 999,
                  background: "#fff", border: "1px solid #d1ead9",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: similarCanL ? 1 : 0,
                  pointerEvents: similarCanL ? "auto" : "none",
                  transition: "opacity .2s",
                  cursor: "pointer", touchAction: "manipulation",
                  WebkitTapHighlightColor: "transparent", padding: 0,
                }}
              >
                <ChevronLeft size={16} color="#0e1d4f" strokeWidth={2.5} />
              </button>

              <button
                onClick={() => { similarRailRef.current?.scrollBy({ left: 160, behavior: "smooth" }); }}
                onTouchEnd={(e) => { e.preventDefault(); similarRailRef.current?.scrollBy({ left: 160, behavior: "smooth" }); }}
                style={{
                  position: "absolute", right: -8, top: "40%", transform: "translateY(-50%)",
                  width: 30, height: 30, borderRadius: 999,
                  background: "#fff", border: "1px solid #d1ead9",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: similarCanR ? 1 : 0,
                  pointerEvents: similarCanR ? "auto" : "none",
                  transition: "opacity .2s",
                  cursor: "pointer", touchAction: "manipulation",
                  WebkitTapHighlightColor: "transparent", padding: 0,
                }}
              >
                <ChevronRight size={16} color="#0e1d4f" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}

        {/* ── Klinik Tumbuh Kembang Terdekat ──────────────────────────────── */}
        {place.category === "clinic" && similarClinics.length > 0 && (
          <div style={{ margin: "28px -20px 0", background: "#e8eaed", padding: "20px 20px 22px" }}>
            <h2 style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 22, fontWeight: 700, color: "#0e1d4f", marginBottom: 12 }}>
              {lang === "id" ? "Klinik Tumbuh Kembang Terdekat" : "Nearby Clinics"}
            </h2>
            <div style={{ position: "relative" }}>
              <div
                ref={similarRailRef}
                onScroll={updateSimilarArrows}
                style={{ display: "flex", gap: 10, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 4 }}
              >
                {similarClinics.map((s) => {
                  const distKm = (place.lat && place.lng && s.lat && s.lng) ? haversineKm(place.lat, place.lng, s.lat, s.lng) : null;
                  const distLabel = distKm !== null ? (distKm < 1 ? `${Math.round(distKm * 1000)} m` : `${distKm.toFixed(1)} km`) : null;
                  return (
                    <a key={s.id} href={`/place/${s.slug ?? s.id}`} style={{ textDecoration: "none", flexShrink: 0, width: 130 }}>
                      <div style={{ borderRadius: 14, overflow: "clip", border: "1.5px solid #d1ead9", background: "#fff" }}>
                        <img src={s.photo} alt={s.name} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }} />
                        <div style={{ padding: "8px 9px" }}>
                          <p style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 14, fontWeight: 700, color: "#0e1d4f", margin: 0, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{s.name}</p>
                          {distLabel && <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 12, color: "#64748b", margin: "3px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📍 {distLabel}</p>}
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
              <button onClick={() => { similarRailRef.current?.scrollBy({ left: -160, behavior: "smooth" }); }} onTouchEnd={(e) => { e.preventDefault(); similarRailRef.current?.scrollBy({ left: -160, behavior: "smooth" }); }} style={{ position: "absolute", left: -8, top: "40%", transform: "translateY(-50%)", width: 30, height: 30, borderRadius: 999, background: "#fff", border: "1px solid #d1ead9", boxShadow: "0 2px 8px rgba(0,0,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", opacity: similarCanL ? 1 : 0, pointerEvents: similarCanL ? "auto" : "none", transition: "opacity .2s", cursor: "pointer", touchAction: "manipulation", WebkitTapHighlightColor: "transparent", padding: 0 }}>
                <ChevronLeft size={16} color="#0e1d4f" strokeWidth={2.5} />
              </button>
              <button onClick={() => { similarRailRef.current?.scrollBy({ left: 160, behavior: "smooth" }); }} onTouchEnd={(e) => { e.preventDefault(); similarRailRef.current?.scrollBy({ left: 160, behavior: "smooth" }); }} style={{ position: "absolute", right: -8, top: "40%", transform: "translateY(-50%)", width: 30, height: 30, borderRadius: 999, background: "#fff", border: "1px solid #d1ead9", boxShadow: "0 2px 8px rgba(0,0,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", opacity: similarCanR ? 1 : 0, pointerEvents: similarCanR ? "auto" : "none", transition: "opacity .2s", cursor: "pointer", touchAction: "manipulation", WebkitTapHighlightColor: "transparent", padding: 0 }}>
                <ChevronRight size={16} color="#0e1d4f" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}

        {/* ── Kafe Ramah Anak Terdekat ─────────────────────────────────────── */}
        {place.category === "cafe" && similarCafes.length > 0 && (
          <div style={{ margin: "28px -20px 0", background: "#e8eaed", padding: "20px 20px 22px" }}>
            <h2 style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 22, fontWeight: 700, color: "#0e1d4f", marginBottom: 12 }}>
              {lang === "id" ? "Kafe Ramah Anak Terdekat" : "Nearby Kid-Friendly Cafes"}
            </h2>
            <div style={{ position: "relative" }}>
              <div
                ref={similarRailRef}
                onScroll={updateSimilarArrows}
                style={{ display: "flex", gap: 10, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 4 }}
              >
                {similarCafes.map((s) => {
                  const distKm = (place.lat && place.lng && s.lat && s.lng) ? haversineKm(place.lat, place.lng, s.lat, s.lng) : null;
                  const distLabel = distKm !== null ? (distKm < 1 ? `${Math.round(distKm * 1000)} m` : `${distKm.toFixed(1)} km`) : null;
                  return (
                    <a key={s.id} href={`/place/${s.slug ?? s.id}`} style={{ textDecoration: "none", flexShrink: 0, width: 130 }}>
                      <div style={{ borderRadius: 14, overflow: "clip", border: "1.5px solid #d1ead9", background: "#fff" }}>
                        <img src={s.photo} alt={s.name} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }} />
                        <div style={{ padding: "8px 9px" }}>
                          <p style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 14, fontWeight: 700, color: "#0e1d4f", margin: 0, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{s.name}</p>
                          {distLabel && <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 12, color: "#64748b", margin: "3px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📍 {distLabel}</p>}
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
              <button onClick={() => { similarRailRef.current?.scrollBy({ left: -160, behavior: "smooth" }); }} onTouchEnd={(e) => { e.preventDefault(); similarRailRef.current?.scrollBy({ left: -160, behavior: "smooth" }); }} style={{ position: "absolute", left: -8, top: "40%", transform: "translateY(-50%)", width: 30, height: 30, borderRadius: 999, background: "#fff", border: "1px solid #d1ead9", boxShadow: "0 2px 8px rgba(0,0,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", opacity: similarCanL ? 1 : 0, pointerEvents: similarCanL ? "auto" : "none", transition: "opacity .2s", cursor: "pointer", touchAction: "manipulation", WebkitTapHighlightColor: "transparent", padding: 0 }}>
                <ChevronLeft size={16} color="#0e1d4f" strokeWidth={2.5} />
              </button>
              <button onClick={() => { similarRailRef.current?.scrollBy({ left: 160, behavior: "smooth" }); }} onTouchEnd={(e) => { e.preventDefault(); similarRailRef.current?.scrollBy({ left: 160, behavior: "smooth" }); }} style={{ position: "absolute", right: -8, top: "40%", transform: "translateY(-50%)", width: 30, height: 30, borderRadius: 999, background: "#fff", border: "1px solid #d1ead9", boxShadow: "0 2px 8px rgba(0,0,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", opacity: similarCanR ? 1 : 0, pointerEvents: similarCanR ? "auto" : "none", transition: "opacity .2s", cursor: "pointer", touchAction: "manipulation", WebkitTapHighlightColor: "transparent", padding: 0 }}>
                <ChevronRight size={16} color="#0e1d4f" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}

        {/* ── Mini Zoo Terdekat ──────────────────────────────────────────────── */}
        {place.category === "mini-zoo" && similarMiniZoos.length > 0 && (
          <div style={{ margin: "28px -20px 0", background: "#e8eaed", padding: "20px 20px 22px" }}>
            <h2 style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 22, fontWeight: 700, color: "#0e1d4f", marginBottom: 12 }}>
              {lang === "id" ? "Mini Zoo Terdekat" : "Nearby Mini Zoos"}
            </h2>
            <div style={{ position: "relative" }}>
              <div
                ref={similarRailRef}
                onScroll={updateSimilarArrows}
                style={{ display: "flex", gap: 10, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 4 }}
              >
                {similarMiniZoos.map((s) => {
                  const distKm = (place.lat && place.lng && s.lat && s.lng) ? haversineKm(place.lat, place.lng, s.lat, s.lng) : null;
                  const distLabel = distKm !== null ? (distKm < 1 ? `${Math.round(distKm * 1000)} m` : `${distKm.toFixed(1)} km`) : null;
                  return (
                    <a key={s.id} href={`/place/${s.slug ?? s.id}`} style={{ textDecoration: "none", flexShrink: 0, width: 130 }}>
                      <div style={{ borderRadius: 14, overflow: "clip", border: "1.5px solid #d1ead9", background: "#fff" }}>
                        <img src={s.photo} alt={s.name} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }} />
                        <div style={{ padding: "8px 9px" }}>
                          <p style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 14, fontWeight: 700, color: "#0e1d4f", margin: 0, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{s.name}</p>
                          {distLabel && <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 12, color: "#64748b", margin: "3px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📍 {distLabel}</p>}
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
              <button onClick={() => { similarRailRef.current?.scrollBy({ left: -160, behavior: "smooth" }); }} onTouchEnd={(e) => { e.preventDefault(); similarRailRef.current?.scrollBy({ left: -160, behavior: "smooth" }); }} style={{ position: "absolute", left: -8, top: "40%", transform: "translateY(-50%)", width: 30, height: 30, borderRadius: 999, background: "#fff", border: "1px solid #d1ead9", boxShadow: "0 2px 8px rgba(0,0,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", opacity: similarCanL ? 1 : 0, pointerEvents: similarCanL ? "auto" : "none", transition: "opacity .2s", cursor: "pointer", touchAction: "manipulation", WebkitTapHighlightColor: "transparent", padding: 0 }}>
                <ChevronLeft size={16} color="#0e1d4f" strokeWidth={2.5} />
              </button>
              <button onClick={() => { similarRailRef.current?.scrollBy({ left: 160, behavior: "smooth" }); }} onTouchEnd={(e) => { e.preventDefault(); similarRailRef.current?.scrollBy({ left: 160, behavior: "smooth" }); }} style={{ position: "absolute", right: -8, top: "40%", transform: "translateY(-50%)", width: 30, height: 30, borderRadius: 999, background: "#fff", border: "1px solid #d1ead9", boxShadow: "0 2px 8px rgba(0,0,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", opacity: similarCanR ? 1 : 0, pointerEvents: similarCanR ? "auto" : "none", transition: "opacity .2s", cursor: "pointer", touchAction: "manipulation", WebkitTapHighlightColor: "transparent", padding: 0 }}>
                <ChevronRight size={16} color="#0e1d4f" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}

        {/* ── Kolam Renang Terdekat ─────────────────────────────────────────── */}
        {place.category === "swimming-pool" && similarPools.length > 0 && (
          <div style={{ margin: "28px -20px 0", background: "#e8eaed", padding: "20px 20px 22px" }}>
            <h2 style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 22, fontWeight: 700, color: "#0e1d4f", marginBottom: 12 }}>
              {lang === "id" ? "Kolam Renang Terdekat" : "Nearby Swimming Pools"}
            </h2>
            <div style={{ position: "relative" }}>
              <div
                ref={similarRailRef}
                onScroll={updateSimilarArrows}
                style={{ display: "flex", gap: 10, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 4 }}
              >
                {similarPools.map((s) => {
                  const distKm = (place.lat && place.lng && s.lat && s.lng) ? haversineKm(place.lat, place.lng, s.lat, s.lng) : null;
                  const distLabel = distKm !== null ? (distKm < 1 ? `${Math.round(distKm * 1000)} m` : `${distKm.toFixed(1)} km`) : null;
                  return (
                    <a key={s.id} href={`/place/${s.slug ?? s.id}`} style={{ textDecoration: "none", flexShrink: 0, width: 130 }}>
                      <div style={{ borderRadius: 14, overflow: "clip", border: "1.5px solid #d1ead9", background: "#fff" }}>
                        <img src={s.photo} alt={s.name} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }} />
                        <div style={{ padding: "8px 9px" }}>
                          <p style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 14, fontWeight: 700, color: "#0e1d4f", margin: 0, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{s.name}</p>
                          {distLabel && <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 12, color: "#64748b", margin: "3px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📍 {distLabel}</p>}
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
              <button onClick={() => { similarRailRef.current?.scrollBy({ left: -160, behavior: "smooth" }); }} onTouchEnd={(e) => { e.preventDefault(); similarRailRef.current?.scrollBy({ left: -160, behavior: "smooth" }); }} style={{ position: "absolute", left: -8, top: "40%", transform: "translateY(-50%)", width: 30, height: 30, borderRadius: 999, background: "#fff", border: "1px solid #d1ead9", boxShadow: "0 2px 8px rgba(0,0,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", opacity: similarCanL ? 1 : 0, pointerEvents: similarCanL ? "auto" : "none", transition: "opacity .2s", cursor: "pointer", touchAction: "manipulation", WebkitTapHighlightColor: "transparent", padding: 0 }}>
                <ChevronLeft size={16} color="#0e1d4f" strokeWidth={2.5} />
              </button>
              <button onClick={() => { similarRailRef.current?.scrollBy({ left: 160, behavior: "smooth" }); }} onTouchEnd={(e) => { e.preventDefault(); similarRailRef.current?.scrollBy({ left: 160, behavior: "smooth" }); }} style={{ position: "absolute", right: -8, top: "40%", transform: "translateY(-50%)", width: 30, height: 30, borderRadius: 999, background: "#fff", border: "1px solid #d1ead9", boxShadow: "0 2px 8px rgba(0,0,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", opacity: similarCanR ? 1 : 0, pointerEvents: similarCanR ? "auto" : "none", transition: "opacity .2s", cursor: "pointer", touchAction: "manipulation", WebkitTapHighlightColor: "transparent", padding: 0 }}>
                <ChevronRight size={16} color="#0e1d4f" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}

        {/* ── Toko Buku Terdekat ───────────────────────────────────────────── */}
        {place.category === "bookstore" && similarBookstores.length > 0 && (
          <div style={{ margin: "28px -20px 0", background: "#e8eaed", padding: "20px 20px 22px" }}>
            <h2 style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 22, fontWeight: 700, color: "#0e1d4f", marginBottom: 12 }}>
              {lang === "id" ? "Toko Buku & Alat Tulis Terdekat" : "Nearby Bookstores"}
            </h2>
            <div style={{ position: "relative" }}>
              <div
                ref={similarRailRef}
                onScroll={updateSimilarArrows}
                style={{ display: "flex", gap: 10, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 4 }}
              >
                {similarBookstores.map((s) => {
                  const distKm = (place.lat && place.lng && s.lat && s.lng) ? haversineKm(place.lat, place.lng, s.lat, s.lng) : null;
                  const distLabel = distKm !== null ? (distKm < 1 ? `${Math.round(distKm * 1000)} m` : `${distKm.toFixed(1)} km`) : null;
                  return (
                    <a key={s.id} href={`/place/${s.slug ?? s.id}`} style={{ textDecoration: "none", flexShrink: 0, width: 130 }}>
                      <div style={{ borderRadius: 14, overflow: "clip", border: "1.5px solid #d1ead9", background: "#fff" }}>
                        <img src={s.photo} alt={s.name} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }} />
                        <div style={{ padding: "8px 9px" }}>
                          <p style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 14, fontWeight: 700, color: "#0e1d4f", margin: 0, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{s.name}</p>
                          {distLabel && <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 12, color: "#64748b", margin: "3px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📍 {distLabel}</p>}
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
              <button onClick={() => { similarRailRef.current?.scrollBy({ left: -160, behavior: "smooth" }); }} onTouchEnd={(e) => { e.preventDefault(); similarRailRef.current?.scrollBy({ left: -160, behavior: "smooth" }); }} style={{ position: "absolute", left: -8, top: "40%", transform: "translateY(-50%)", width: 30, height: 30, borderRadius: 999, background: "#fff", border: "1px solid #d1ead9", boxShadow: "0 2px 8px rgba(0,0,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", opacity: similarCanL ? 1 : 0, pointerEvents: similarCanL ? "auto" : "none", transition: "opacity .2s", cursor: "pointer", touchAction: "manipulation", WebkitTapHighlightColor: "transparent", padding: 0 }}>
                <ChevronLeft size={16} color="#0e1d4f" strokeWidth={2.5} />
              </button>
              <button onClick={() => { similarRailRef.current?.scrollBy({ left: 160, behavior: "smooth" }); }} onTouchEnd={(e) => { e.preventDefault(); similarRailRef.current?.scrollBy({ left: 160, behavior: "smooth" }); }} style={{ position: "absolute", right: -8, top: "40%", transform: "translateY(-50%)", width: 30, height: 30, borderRadius: 999, background: "#fff", border: "1px solid #d1ead9", boxShadow: "0 2px 8px rgba(0,0,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", opacity: similarCanR ? 1 : 0, pointerEvents: similarCanR ? "auto" : "none", transition: "opacity .2s", cursor: "pointer", touchAction: "manipulation", WebkitTapHighlightColor: "transparent", padding: 0 }}>
                <ChevronRight size={16} color="#0e1d4f" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}

        {/* ── Suggest Edits trigger ──────────────────────────────────────── */}
        <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
          <ActionButton
            onClick={() => { setSuggestSubmitted(false); setShowSuggestSheet(true); }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "7px 14px", borderRadius: 999,
              background: "transparent", border: "1px solid #E2E8F0",
              color: "#64748B", fontSize: 12, fontWeight: 600,
              fontFamily: "var(--font-jakarta), sans-serif",
              touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
            }}
          >
            <Pencil size={12} strokeWidth={2} />
            {t.suggestEditBtn}
          </ActionButton>
        </div>

      </div>

      {/* ── Suggest Edits Bottom Sheet ───────────────────────────────────── */}
      {showSuggestSheet && (
        <>
          <div
            onClick={() => setShowSuggestSheet(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 70,
              background: "rgba(0,0,0,0.45)",
              animation: "sheet-fade-in 0.25s ease both",
            }}
          />
          <div
            style={{
              position: "fixed", bottom: 0, left: 0, right: 0,
              maxWidth: 448, margin: "0 auto",
              background: "#fff", borderRadius: "24px 24px 0 0",
              padding: "20px 20px 40px", zIndex: 71,
              boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
              animation: "sheet-slide-up 0.38s cubic-bezier(0.32, 0.72, 0, 1) both",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div style={{ width: 36, height: 4, borderRadius: 999, background: "#e2e8f0", margin: "0 auto 20px" }} />

            {suggestSubmitted ? (
              /* Success state */
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "8px 0 12px", textAlign: "center" }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 999,
                  background: "#D1FAE5", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Check size={28} color="#16a34a" strokeWidth={2.5} />
                </div>
                <p style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 20, fontWeight: 700, color: "#1E293B", margin: 0 }}>
                  {t.suggestEditSuccess}
                </p>
                <ActionButton
                  onClick={() => setShowSuggestSheet(false)}
                  style={{
                    marginTop: 8, padding: "12px 28px", borderRadius: 999, fontSize: 14, fontWeight: 700,
                    background: "#e6f4ed", color: "#2e8a5a",
                    touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                    fontFamily: "var(--font-jakarta), sans-serif",
                  }}
                >
                  Tutup
                </ActionButton>
              </div>
            ) : (
              /* Form */
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <p style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 20, fontWeight: 700, color: "#1E293B", margin: "0 0 4px" }}>
                    {t.suggestEditTitle}
                  </p>
                  <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 13, color: "#64748B", margin: 0, lineHeight: 1.5 }}>
                    {t.suggestEditSubtitle}
                  </p>
                  <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 12, color: "#94A3B8", margin: "6px 0 0" }}>
                    📍 {place.name}
                  </p>
                </div>

                {/* Field selector */}
                <div>
                  <label style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 8 }}>
                    {t.suggestEditFieldLabel}
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {t.suggestEditFieldOptions.map((opt, i) => (
                      <label key={i} style={{ cursor: "pointer" }}>
                        <input
                          type="radio"
                          name="suggest-field"
                          checked={suggestField === i}
                          onChange={() => setSuggestField(i)}
                          style={{ position: "absolute", opacity: 0, width: 1, height: 1 }}
                        />
                        <span style={{
                          display: "inline-block", padding: "6px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600,
                          fontFamily: "var(--font-jakarta), sans-serif",
                          border: suggestField === i ? "2px solid #2e8a5a" : "1.5px solid #E2E8F0",
                          background: suggestField === i ? "#e6f4ed" : "#f6f1e8",
                          color: suggestField === i ? "#2e8a5a" : "#64748B",
                        }}>
                          {opt}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Details textarea */}
                <div>
                  <label style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>
                    {t.suggestEditDetailsLabel}
                  </label>
                  <textarea
                    value={suggestDetails}
                    onChange={(e) => setSuggestDetails(e.target.value.slice(0, 400))}
                    placeholder={t.suggestEditDetailsPlaceholder}
                    rows={4}
                    style={{
                      width: "100%", padding: "12px 14px", borderRadius: 12,
                      fontFamily: "var(--font-jakarta), sans-serif", fontSize: 13,
                      border: "1.5px solid #E2E8F0", outline: "none", resize: "vertical",
                      color: "#1E293B", background: "#f6f1e8", boxSizing: "border-box",
                      lineHeight: 1.6,
                    }}
                  />
                </div>

                {/* Submit */}
                <a
                  href={suggestDetails.trim()
                    ? `https://wa.me/${SUGGEST_WA_NUMBER}?text=${encodeURIComponent(
                        `[TangselKids — Sarankan Perubahan]\nTempat: ${place.name}\nBidang: ${t.suggestEditFieldOptions[suggestField]}\nDetail: ${suggestDetails.trim()}`
                      )}`
                    : undefined}
                  onClick={(e) => {
                    if (!suggestDetails.trim()) { e.preventDefault(); return; }
                    setSuggestSubmitted(true);
                  }}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    padding: "13px 0", borderRadius: 14, fontSize: 14, fontWeight: 700,
                    fontFamily: "var(--font-jakarta), sans-serif",
                    background: suggestDetails.trim()
                      ? "linear-gradient(135deg, #128C7E 0%, #25D366 100%)"
                      : "#E5E7EB",
                    color: suggestDetails.trim() ? "#fff" : "#9CA3AF",
                    textDecoration: "none",
                    pointerEvents: suggestDetails.trim() ? "auto" : "none",
                    boxShadow: suggestDetails.trim() ? "0 4px 14px rgba(37,211,102,0.30)" : "none",
                  }}
                >
                  <WhatsAppIcon size={16} color={suggestDetails.trim() ? "#fff" : "#9CA3AF"} />
                  {t.suggestEditSubmitBtn}
                </a>
              </div>
            )}
          </div>
        </>
      )}


    </div>
  );
}
