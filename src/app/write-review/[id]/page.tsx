"use client";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { ChevronLeft, Pencil, Check, Star } from "lucide-react";
import { places } from "@/lib/mockData";
import { useLang } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { ActionButton } from "@/components/ActionButton";
import { saveReview, getReviewForPlace, type UserReview } from "@/lib/reviewsStorage";
import Link from "next/link";

type Step = "form" | "success";

const MIN_CHARS = 30;
const MAX_CHARS = 500;

// ── Confetti ──────────────────────────────────────────────────────────────────
function Confetti() {
  const COLORS = ["#2e8a5a", "#FBBF24", "#EF4444", "#10B981", "#8B5CF6", "#F97316", "#EC4899"];
  const particles = useMemo(() =>
    Array.from({ length: 90 }, (_, i) => ({
      id: i,
      x:        Math.random() * 100,
      color:    COLORS[i % COLORS.length],
      delay:    Math.random() * 2,
      duration: 2.2 + Math.random() * 2,
      size:     6 + Math.random() * 9,
      aspect:   Math.random() > 0.5 ? 0.4 : 1,
      rotation: Math.random() * 360,
    }))
  , []);

  return (
    <>
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translateY(-20px) rotate(0deg);   opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(105vh) rotate(780deg); opacity: 0; }
        }
      `}</style>
      <div style={{ position: "fixed", inset: 0, zIndex: 200, pointerEvents: "none", overflow: "clip" }}>
        {particles.map(p => (
          <div key={p.id} style={{
            position: "absolute", left: `${p.x}%`, top: -12,
            width: p.size, height: p.size * p.aspect,
            background: p.color, borderRadius: p.aspect === 1 ? 999 : 2,
            animation: `confetti-fall ${p.duration}s ${p.delay}s ease-in forwards`,
            transform: `rotate(${p.rotation}deg)`,
          }} />
        ))}
      </div>
    </>
  );
}

// ── Star row helper ───────────────────────────────────────────────────────────
function StarRow({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {[1,2,3,4,5].map(s => (
        <Star key={s} size={18} fill={s <= rating ? "#FBBF24" : "#D1D5DB"} stroke="none" />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function WriteReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }   = use(params);
  const router   = useRouter();
  const { t }    = useLang();
  const { user, tier, loaded } = useAuth();
  const place    = places.find((p) => p.id === id);

  const [step,               setStep]               = useState<Step>("form");
  const [name,               setName]               = useState(user?.name ?? "");
  const [rating,             setRating]             = useState(0);
  const [hover,              setHover]              = useState(0);
  const [comment,            setComment]            = useState("");
  const [showConfetti,       setShowConfetti]       = useState(false);
  const [showLowRatingPopup, setShowLowRatingPopup] = useState(false);
  const [existingReview,     setExistingReview]     = useState<UserReview | null>(null);
  const [isEditing,          setIsEditing]          = useState(false);

  useEffect(() => {
    const found = getReviewForPlace(id);
    if (found) setExistingReview(found);
  }, [id]);

  function startEdit() {
    if (!existingReview) return;
    setName(existingReview.name);
    setRating(existingReview.rating);
    setComment(existingReview.comment);
    setIsEditing(true);
  }

  // Only premium users can write reviews
  useEffect(() => {
    if (loaded && tier !== "premium") {
      router.replace(`/place/${id}`);
    }
  }, [loaded, tier, router, id]);

  if (!place) {
    return (
      <div className="max-w-md mx-auto flex flex-col items-center justify-center min-h-screen gap-4 px-8 text-center">
        <p className="text-4xl">😕</p>
        <p className="font-jakarta text-gray-500 text-sm">{t.pdNotFound}</p>
        <button onClick={() => router.back()} className="px-6 py-2 rounded-full text-white text-sm font-jakarta font-semibold" style={{ background: "#2e8a5a" }}>
          {t.pdGoBack}
        </button>
      </div>
    );
  }

  function formatDate(): string {
    const now = new Date();
    return `${now.toLocaleString("id-ID", { month: "short" })} ${now.getFullYear()}`;
  }

  function goToSuccess() {
    if (!place) return;
    const review: UserReview = {
      placeId:   place.id,
      placeName: place.name,
      placeIcon: place.icon ?? "📍",
      name:      name.trim(),
      rating,
      comment:   comment.trim(),
      date:      formatDate(),
    };
    saveReview(review);
    setExistingReview(review);
    setShowLowRatingPopup(false);
    setShowConfetti(true);
    setStep("success");
  }

  function submitReview() {
    if (!name.trim() || rating === 0 || !comment.trim()) return;
    if (rating <= 3) {
      setShowLowRatingPopup(true);
    } else {
      goToSuccess();
    }
  }

  const canSubmit = name.trim().length > 0 && rating > 0 && comment.trim().length >= MIN_CHARS;
  const ratingLabel = ["", "Sangat Buruk 😞", "Buruk 😕", "Cukup 😐", "Bagus 😊", "Sangat Bagus 🤩"][rating] ?? "";

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col pb-10" style={{ background: "#fff" }}>

      {/* ── Confetti overlay ── */}
      {showConfetti && <Confetti />}

      {/* ── Low-rating confirmation popup ── */}
      {showLowRatingPopup && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.50)" }}
          onClick={() => setShowLowRatingPopup(false)}
        >
          <div
            style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              background: "#fff", borderRadius: "24px 24px 0 0",
              padding: "20px 20px 40px", maxWidth: 448, margin: "0 auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ width: 36, height: 4, borderRadius: 999, background: "#e2e8f0", margin: "0 auto 20px" }} />
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
              <div style={{ width: 56, height: 56, borderRadius: 999, background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Star size={28} fill="#FBBF24" stroke="none" />
              </div>
            </div>
            <p style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 17, fontWeight: 700, color: "#0e1d4f", textAlign: "center", margin: "0 0 12px" }}>
              Yakin dengan rating ini?
            </p>
            <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 13.5, color: "#4B5563", lineHeight: 1.6, textAlign: "center", margin: "0 0 24px" }}>
              Kamu akan memberikan rating yang kurang bagus untuk tempat ini ({rating} bintang ⭐), apakah kamu yakin?{" "}
              Tim kami akan memverifikasi ulasan ini terlebih dahulu.
            </p>
            <ActionButton
              onClick={goToSuccess}
              style={{
                width: "100%", padding: "15px 0", borderRadius: 16, border: "none",
                background: "linear-gradient(135deg, #1f6b43, #2e8a5a)", color: "#fff",
                fontFamily: "var(--font-jakarta), sans-serif", fontSize: 15, fontWeight: 700,
                cursor: "pointer", marginBottom: 10, textAlign: "center",
                touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
              } as React.CSSProperties}
            >
              Ya, Kirim Ulasan
            </ActionButton>
            <ActionButton
              onClick={() => setShowLowRatingPopup(false)}
              style={{
                width: "100%", padding: "14px 0", borderRadius: 16,
                background: "#F1F5F9", color: "#374151",
                fontFamily: "var(--font-jakarta), sans-serif", fontSize: 15, fontWeight: 600,
                cursor: "pointer", textAlign: "center", border: "none",
                touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
              } as React.CSSProperties}
            >
              Tidak, Edit Ulasan
            </ActionButton>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div
        className="px-5 pt-12 pb-6"
        style={{ background: "linear-gradient(135deg, #1f6b43 0%, #2e8a5a 100%)", borderRadius: "0 0 32px 32px" }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            onTouchEnd={(e) => { e.preventDefault(); router.back(); }}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.18)", touchAction: "manipulation", WebkitTapHighlightColor: "transparent" } as React.CSSProperties}
          >
            <ChevronLeft size={20} color="white" />
          </button>
          <div>
            <h1 className="text-white text-xl font-bold flex items-center gap-2" style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}>
              <Pencil size={18} /> {t.reviewWriteBtn}
            </h1>
            <p className="text-white/70 text-xs font-jakarta mt-0.5 truncate">{place.name}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-5 py-6 space-y-5">

        {/* ── Already reviewed (read-only view) ── */}
        {existingReview && !isEditing && step === "form" && (
          <div className="space-y-5">
            <div>
              <p className="font-jakarta text-sm font-semibold text-gray-400 mb-1">Ulasanmu untuk</p>
              <h2 className="text-2xl font-bold text-[#0e1d4f] leading-tight" style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}>
                {place.name}
              </h2>
            </div>

            <div className="rounded-2xl p-4 space-y-3" style={{ background: "#e6f4ed", border: "1.5px solid #a7d4bc" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="font-jakarta font-semibold text-sm text-gray-800">{existingReview.name}</span>
                <span className="font-jakarta text-xs text-gray-400">{existingReview.date}</span>
              </div>
              <StarRow rating={existingReview.rating} />
              <p className="font-jakarta text-sm text-gray-600 leading-relaxed">{existingReview.comment}</p>
            </div>

            <div style={{ background: "#ECFDF5", borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <Check size={18} style={{ color: "#10B981", flexShrink: 0 }} strokeWidth={2.5} />
              <p className="font-jakarta text-sm font-semibold" style={{ color: "#065F46" }}>
                Ulasanmu sudah ditampilkan di halaman tempat ini.
              </p>
            </div>

            <ActionButton
              onClick={startEdit}
              style={{
                width: "100%", padding: "14px 0", borderRadius: 16,
                background: "linear-gradient(135deg, #1f6b43, #2e8a5a)", color: "#fff",
                fontFamily: "var(--font-jakarta), sans-serif", fontSize: 15, fontWeight: 700,
                cursor: "pointer", textAlign: "center", border: "none",
                touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
              } as React.CSSProperties}
            >
              <Pencil size={15} style={{ display: "inline", marginRight: 7, verticalAlign: "middle" }} />
              {t.reviewEditBtn}
            </ActionButton>

            <ActionButton
              onClick={() => router.back()}
              style={{
                width: "100%", marginTop: 10, padding: "13px 0", borderRadius: 16,
                background: "#f1f5f9", color: "#64748b",
                fontFamily: "var(--font-jakarta), sans-serif", fontSize: 14, fontWeight: 600,
                cursor: "pointer", textAlign: "center", border: "none",
                touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
              } as React.CSSProperties}
            >
              {t.reviewBackToPlace}
            </ActionButton>
          </div>
        )}

        {/* ── Review form (new or edit) ── */}
        {(!existingReview || isEditing) && step === "form" && (
          <div className="space-y-5">
            <div>
              <p className="font-jakarta text-sm font-semibold text-gray-400 mb-1">
                {isEditing ? t.reviewEditTitle : t.reviewFormTitle}
              </p>
              <h2 className="text-2xl font-bold text-[#0e1d4f] leading-tight" style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}>
                {place.name}
              </h2>
            </div>

            {/* Name */}
            <div>
              <label className="font-jakarta text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                {t.reviewYourName}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama kamu"
                className="w-full px-4 py-3 rounded-2xl border-2 font-jakarta text-sm text-gray-800 outline-none"
                style={{ borderColor: name ? "#2e8a5a" : "#E5E7EB" }}
              />
            </div>

            {/* Star rating */}
            <div>
              <label className="font-jakarta text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                {t.reviewOverallRating}
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseEnter={() => setHover(s)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(s)}
                    onTouchEnd={(e) => { e.preventDefault(); setRating(s); }}
                    style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent", background: "none", border: "none", padding: 2, cursor: "pointer" } as React.CSSProperties}
                  >
                    <Star size={32} fill={s <= (hover || rating) ? "#FBBF24" : "#D1D5DB"} stroke="none" />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="font-jakarta text-xs text-gray-400 mt-1">{ratingLabel}</p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label className="font-jakarta text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                {t.reviewCommentLabel}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t.reviewCommentPlaceholder}
                rows={6}
                maxLength={MAX_CHARS}
                className="w-full px-4 py-3 rounded-2xl border-2 font-jakarta text-sm text-gray-800 outline-none resize-none"
                style={{ borderColor: comment.length > 0 ? "#2e8a5a" : "#E5E7EB" }}
              />
              <div className="flex items-center justify-between mt-1">
                <p className="font-jakarta text-xs" style={{
                  color: comment.length > 0 && comment.trim().length < MIN_CHARS ? "#F59E0B" : "transparent",
                  transition: "color 0.2s",
                }}>
                  Minimal {MIN_CHARS} karakter
                </p>
                <p className="font-jakarta text-xs font-semibold" style={{
                  color: comment.length >= MAX_CHARS ? "#EF4444"
                       : comment.trim().length < MIN_CHARS && comment.length > 0 ? "#F59E0B"
                       : "#9CA3AF",
                }}>
                  {comment.length} / {MAX_CHARS}
                </p>
              </div>
            </div>

            {/* Submit */}
            <button
              type="button"
              onClick={submitReview}
              onTouchEnd={(e) => { e.preventDefault(); submitReview(); }}
              disabled={!canSubmit}
              className="w-full py-3.5 rounded-2xl text-white font-jakarta font-bold text-sm transition-opacity"
              style={{
                background: "linear-gradient(135deg, #1f6b43, #2e8a5a)",
                opacity: canSubmit ? 1 : 0.4,
                touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
              } as React.CSSProperties}
            >
              {isEditing ? t.reviewUpdateSubmit : t.reviewSubmit}
            </button>

            <div style={{ textAlign: "center", paddingTop: 8, paddingBottom: 8 }}>
              <p className="font-jakarta text-xs text-gray-400 mb-1.5">
                Punya informasi tambahan tentang tempat ini?
              </p>
              <Link
                href="/feedback"
                className="font-jakarta text-xs font-semibold"
                style={{ color: "#2e8a5a", textDecoration: "underline", textUnderlineOffset: 3 }}
              >
                Beritahu kami →
              </Link>
            </div>
          </div>
        )}

        {/* ── Success ── */}
        {step === "success" && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-16">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-2" style={{ background: "#e6f4ed" }}>
              <Check size={40} style={{ color: "#2e8a5a" }} strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl font-bold text-[#0e1d4f]" style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}>
              {isEditing ? t.reviewUpdateSuccess : t.reviewSuccess}
            </h2>
            <p className="font-jakarta text-gray-500 text-sm leading-relaxed max-w-xs">{t.reviewSuccessDesc}</p>
            <ActionButton
              onClick={() => router.back()}
              style={{
                marginTop: 16, padding: "12px 24px", borderRadius: 999,
                background: "linear-gradient(135deg, #1f6b43, #2e8a5a)",
                color: "#fff", fontFamily: "var(--font-jakarta), sans-serif",
                fontSize: 14, fontWeight: 700,
                touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
              } as React.CSSProperties}
            >
              {t.reviewBackToPlace}
            </ActionButton>
          </div>
        )}
      </div>
    </div>
  );
}
