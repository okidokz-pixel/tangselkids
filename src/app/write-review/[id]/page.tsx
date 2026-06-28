"use client";
import { useState, useEffect, useMemo, use } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Check, Clock, Star, X } from "lucide-react";
import { type Place } from "@/lib/mockData";
import { fetchPlaceById } from "@/lib/db";
import { useAuth } from "@/context/AuthContext";
import { ActionButton } from "@/components/ActionButton";
import {
  saveReview, fetchMyReviewForPlace,
  type UserReview, type ReviewRelationship,
} from "@/lib/reviewsStorage";

type Step = "form" | "success";

// Relationship dropdown only applies to schools & tempat kursus.
type RelOption = { label: string; value: ReviewRelationship };
function relConfig(category?: string): { label: string; options: RelOption[] } | null {
  if (category === "school") {
    return {
      label: "Anak kamu di sini sebagai...",
      options: [
        { label: "Murid sekarang", value: "murid_sekarang" },
        { label: "Alumni", value: "alumni" },
        { label: "Orang tua calon murid (pernah survey ke sini)", value: "ortu_calon_murid" },
      ],
    };
  }
  if (category === "learning-center") {
    return {
      label: "Hubungan kamu dengan tempat ini...",
      options: [
        { label: "Murid sekarang", value: "murid_sekarang" },
        { label: "Pernah ikut kelas di sini", value: "pernah_ikut" },
        { label: "Orang tua calon murid (pernah tanya-tanya ke sini)", value: "ortu_calon_murid" },
      ],
    };
  }
  return null;
}

const labelCls = "font-jakarta text-sm font-bold text-[#0e1d4f] mb-1.5 block";
const helpCls = "font-jakarta text-xs text-gray-400 mb-2 leading-relaxed";
const taCls = "w-full px-4 py-3 rounded-2xl border-2 font-jakarta text-sm text-gray-800 outline-none resize-none";

// Falling confetti for the success screen.
function Confetti() {
  const COLORS = ["#2e8a5a", "#FBBF24", "#EF4444", "#10B981", "#8B5CF6", "#F97316", "#EC4899"];
  const particles = useMemo(() =>
    Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x:        Math.random() * 100,
      color:    COLORS[i % COLORS.length],
      delay:    Math.random() * 1.5,
      duration: 2.2 + Math.random() * 2,
      size:     6 + Math.random() * 9,
      aspect:   Math.random() > 0.5 ? 0.4 : 1,
      rotation: Math.random() * 360,
    }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  , []);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, pointerEvents: "none", overflow: "clip" }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: "absolute", left: `${p.x}%`, top: -12,
          width: p.size, height: p.size * p.aspect,
          background: p.color, borderRadius: p.aspect === 1 ? 999 : 2,
          animation: `wr-confetti-fall ${p.duration}s ${p.delay}s ease-in forwards`,
          transform: `rotate(${p.rotation}deg)`,
        }} />
      ))}
    </div>
  );
}

export default function WriteReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }   = use(params);
  const router   = useRouter();
  const { user, loaded } = useAuth();

  const [place, setPlace] = useState<Place | null>(null);
  const [placeLoaded, setPlaceLoaded] = useState(false);
  useEffect(() => { fetchPlaceById(id).then((p) => { setPlace(p); setPlaceLoaded(true); }); }, [id]);

  const [step, setStep]             = useState<Step>("form");
  const [rating, setRating]         = useState(0);
  const [hover, setHover]           = useState(0);
  const [relationship, setRelationship] = useState<ReviewRelationship | "">("");
  const [liked, setLiked]           = useState("");
  const [improve, setImprove]       = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [anonymous, setAnonymous]   = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [error, setError]           = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [existing, setExisting]     = useState<UserReview | null>(null);

  // Authoritative "already reviewed?" check — straight from the DB, so a
  // failed previous submit (cached locally but not saved) never blocks a retry.
  useEffect(() => {
    if (!user) return;
    fetchMyReviewForPlace(id).then(r => { if (r) setExisting(r); });
  }, [id, user]);

  // Login is required to review.
  useEffect(() => {
    if (loaded && !user) router.replace(`/place/${id}`);
  }, [loaded, user, router, id]);

  if (!placeLoaded) {
    return <div className="max-w-md mx-auto min-h-screen" style={{ background: "#fff" }} />;
  }

  if (!place) {
    return (
      <div className="max-w-md mx-auto flex flex-col items-center justify-center min-h-screen gap-4 px-8 text-center">
        <p className="text-4xl">😕</p>
        <p className="font-jakarta text-gray-500 text-sm">Tempat tidak ditemukan.</p>
        <button onClick={() => router.back()} className="px-6 py-2 rounded-full text-white text-sm font-jakarta font-semibold" style={{ background: "#2e8a5a" }}>
          Kembali
        </button>
      </div>
    );
  }

  const firstName = (user?.name ?? "").trim().split(/\s+/)[0] || "Kamu";
  const rel = relConfig(place.category);

  async function submitReview() {
    if (!place) return;
    if (rating === 0) { setError("Pilih rating bintang dulu ya ⭐"); return; }
    if (!liked.trim()) { setError("Ceritain sedikit yang kamu suka ya 🙂"); return; }
    setError("");
    setSubmitting(true);
    const review: UserReview = {
      placeId:      place.id,
      placeName:    place.name,
      placeIcon:    place.icon ?? "📍",
      placeCategory: place.category,
      name:         firstName,
      rating,
      relationship: relationship || null,
      liked:        liked.trim(),
      improve:      improve.trim() || undefined,
      suggestion:   suggestion.trim() || undefined,
      isAnonymous:  anonymous,
      date:         `${new Date().toLocaleString("id-ID", { month: "short" })} ${new Date().getFullYear()}`,
    };
    const { error: err } = await saveReview(review);
    setSubmitting(false);
    if (err) { setError(`Gagal mengirim review: ${err}`); return; }
    setExisting({ ...review, status: "pending" });
    setShowConfetti(true);
    setStep("success");
  }

  const ratingLabel = ["", "Sangat Buruk 😞", "Buruk 😕", "Cukup 😐", "Bagus 😊", "Sangat Bagus 🤩"][rating] ?? "";

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col pb-10" style={{ background: "#fff" }}>
      <style>{`
        @keyframes wr-slide-up { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes wr-pop { 0% { opacity: 0; transform: scale(0.5); } 60% { transform: scale(1.12); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes wr-confetti-fall { 0% { transform: translateY(-20px) rotate(0deg); opacity: 1; } 80% { opacity: 1; } 100% { transform: translateY(105vh) rotate(780deg); opacity: 0; } }
      `}</style>

      {step === "success" && showConfetti && <Confetti />}

      {/* Header */}
      <div className="px-5 pt-12 pb-6" style={{ background: "linear-gradient(135deg, #1f6b43 0%, #2e8a5a 100%)", borderRadius: "0 0 32px 32px" }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            onTouchEnd={(e) => { e.preventDefault(); router.back(); }}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.18)", touchAction: "manipulation", WebkitTapHighlightColor: "transparent" } as React.CSSProperties}
          >
            <ChevronLeft size={20} color="white" />
          </button>
          <div style={{ minWidth: 0 }}>
            <h1 className="text-white text-2xl font-bold" style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}>
              Tulis Review
            </h1>
            <p className="text-white/80 text-base font-jakarta mt-0.5 truncate">{place.name}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-5 py-6">

        {/* ── Already reviewed (read-only) ── */}
        {existing && step === "form" ? (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-[#0e1d4f] leading-snug" style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}>
              Kamu sudah review tempat ini 🙌
            </h2>
            <div className="rounded-2xl p-4 space-y-2" style={{ background: "#e6f4ed", border: "1.5px solid #a7d4bc" }}>
              <div style={{ display: "flex", gap: 3 }}>
                {[1,2,3,4,5].map(s => <Star key={s} size={16} fill={s <= existing.rating ? "#FBBF24" : "#D1D5DB"} stroke="none" />)}
              </div>
              <p className="font-jakarta text-sm text-gray-700 leading-relaxed">{existing.liked}</p>
            </div>
            {existing.status === "approved" ? (
              <div style={{ background: "#ECFDF5", borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                <Check size={18} style={{ color: "#10B981", flexShrink: 0 }} strokeWidth={2.5} />
                <p className="font-jakarta text-sm font-semibold" style={{ color: "#065F46" }}>Review kamu sudah tampil di halaman ini.</p>
              </div>
            ) : existing.status === "rejected" ? (
              <div style={{ background: "#FEF2F2", borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                <X size={18} style={{ color: "#EF4444", flexShrink: 0 }} strokeWidth={2.5} />
                <p className="font-jakarta text-sm font-semibold" style={{ color: "#991B1B" }}>Review kamu tidak dapat kami tampilkan.</p>
              </div>
            ) : (
              <div style={{ background: "#FFFBEB", borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                <Clock size={18} style={{ color: "#F59E0B", flexShrink: 0 }} strokeWidth={2.5} />
                <p className="font-jakarta text-sm font-semibold" style={{ color: "#92400e" }}>Review kamu lagi kami cek dulu, dan bakal tampil setelah disetujui. 💙</p>
              </div>
            )}
            <ActionButton
              onClick={() => router.back()}
              style={{ width: "100%", padding: "13px 0", borderRadius: 16, background: "#f1f5f9", color: "#64748b", fontFamily: "var(--font-jakarta), sans-serif", fontSize: 14, fontWeight: 600, textAlign: "center", border: "none", touchAction: "manipulation" } as React.CSSProperties}
            >
              Kembali ke Halaman Tempat
            </ActionButton>
          </div>
        ) : step === "success" ? (
          /* ── Success ── */
          <div className="flex flex-col items-center justify-center text-center gap-4 py-16" style={{ animation: "wr-slide-up 0.55s cubic-bezier(0.22,1,0.36,1) both" }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-2" style={{ background: "#e6f4ed", animation: "wr-pop 0.5s cubic-bezier(0.175,0.885,0.32,1.275) 0.15s both" }}>
              <Check size={40} style={{ color: "#2e8a5a" }} strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl font-bold text-[#0e1d4f]" style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}>
              Makasih ya! 🙏
            </h2>
            <p className="font-jakarta text-gray-500 text-sm leading-relaxed max-w-xs">
              Review kamu lagi kami cek dulu, dan bakal tampil setelah disetujui. 💙
            </p>
            <ActionButton
              onClick={() => router.back()}
              style={{ marginTop: 16, padding: "12px 24px", borderRadius: 999, background: "linear-gradient(135deg, #1f6b43, #2e8a5a)", color: "#fff", fontFamily: "var(--font-jakarta), sans-serif", fontSize: 14, fontWeight: 700, touchAction: "manipulation" } as React.CSSProperties}
            >
              Kembali ke Halaman Tempat
            </ActionButton>
          </div>
        ) : (
          /* ── Form ── */
          <div className="space-y-6">
            <div>
              <p className="font-jakarta text-base font-semibold text-gray-700 leading-relaxed">
                Pengalaman jujurmu bantu orang tua lain milih tempat yang tepat buat anaknya 💙
              </p>
              <hr style={{ border: "none", borderTop: "1px solid #E5E7EB", marginTop: 16 }} />
            </div>

            {/* 1. Star rating */}
            <div>
              <label className={labelCls}>Secara keseluruhan, seberapa puas kamu?</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseEnter={() => setHover(s)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => { setRating(s); setError(""); }}
                    onTouchEnd={(e) => { e.preventDefault(); setRating(s); setError(""); }}
                    style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent", background: "none", border: "none", padding: 2, cursor: "pointer" } as React.CSSProperties}
                  >
                    <Star size={36} fill={s <= (hover || rating) ? "#FBBF24" : "#D1D5DB"} stroke="none" />
                  </button>
                ))}
              </div>
              {rating > 0 && <p className="font-jakarta text-xs text-gray-400 mt-1">{ratingLabel}</p>}
            </div>

            {/* 2. Relationship (schools & tempat kursus only) */}
            {rel && (
              <div>
                <label className={labelCls}>{rel.label}</label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value as ReviewRelationship | "")}
                  className="w-full px-4 py-3 rounded-2xl border-2 font-jakarta text-sm text-gray-800 outline-none"
                  style={{
                    borderColor: relationship ? "#2e8a5a" : "#E5E7EB", appearance: "none",
                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
                    backgroundRepeat: "no-repeat", backgroundPosition: "right 16px center",
                  } as React.CSSProperties}
                >
                  <option value="">Pilih (opsional)…</option>
                  {rel.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            )}

            {/* 3. Liked (required) */}
            <div>
              <label className={labelCls}>Yang paling kamu suka? 👍</label>
              <textarea
                value={liked}
                onChange={(e) => { setLiked(e.target.value); if (error) setError(""); }}
                placeholder="Misalnya: pelayanan, fasilitas, suasana, kebersihan, harga, lokasi..."
                rows={4}
                className={taCls}
                style={{ borderColor: liked.length > 0 ? "#2e8a5a" : "#E5E7EB" }}
              />
            </div>

            {/* 4. Improve (encouraged, not hard-required) */}
            <div>
              <label className={labelCls}>Yang menurut kamu masih bisa diperbaiki? 🤔</label>
              <p className={helpCls}>Nggak ada tempat yang sempurna. Hal kecil pun ngebantu orang tua lain punya gambaran realistis.</p>
              <textarea
                value={improve}
                onChange={(e) => setImprove(e.target.value)}
                rows={3}
                className={taCls}
                style={{ borderColor: improve.length > 0 ? "#2e8a5a" : "#E5E7EB" }}
              />
            </div>

            {/* 5. Suggestion (optional) */}
            <div>
              <label className={labelCls}>Satu saran buat orang tua yang lagi mempertimbangkan tempat ini (opsional)</label>
              <textarea
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                placeholder="Kalau ada satu hal yang pengen kamu kasih tau ke mereka, apa itu?"
                rows={3}
                className={taCls}
                style={{ borderColor: suggestion.length > 0 ? "#2e8a5a" : "#E5E7EB" }}
              />
            </div>

            {/* Anonymous */}
            <label style={{ display: "flex", gap: 10, alignItems: "center", cursor: "pointer" }}>
              <div
                onClick={() => setAnonymous(v => !v)}
                style={{
                  width: 22, height: 22, borderRadius: 7, flexShrink: 0,
                  border: anonymous ? "2px solid #2e8a5a" : "2px solid #E5E7EB",
                  background: anonymous ? "#2e8a5a" : "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                {anonymous && <Check size={13} color="#fff" strokeWidth={3} />}
              </div>
              <span className="font-jakarta text-xs text-gray-600">Sembunyikan identitas saya</span>
            </label>

            {/* Error */}
            {error && (
              <div style={{ padding: "11px 14px", borderRadius: 12, background: "#FEF2F2", border: "1px solid #FECACA" }}>
                <p className="font-jakarta text-sm font-semibold" style={{ color: "#991B1B" }}>{error}</p>
              </div>
            )}

            {/* Submit */}
            <div>
              <button
                type="button"
                onClick={submitReview}
                onTouchEnd={(e) => { e.preventDefault(); submitReview(); }}
                disabled={submitting}
                className="w-full py-3.5 rounded-2xl text-white font-jakarta font-bold text-sm"
                style={{ background: "linear-gradient(135deg, #1f6b43, #2e8a5a)", opacity: submitting ? 0.6 : 1, touchAction: "manipulation", WebkitTapHighlightColor: "transparent" } as React.CSSProperties}
              >
                {submitting ? "Mengirim…" : "Kirim Review"}
              </button>
              <p className="font-jakarta text-xs text-gray-400 mt-3 leading-relaxed text-center">
                Kami nggak terima review berbayar atau titipan. 🙏
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
