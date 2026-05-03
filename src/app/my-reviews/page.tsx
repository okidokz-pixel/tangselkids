"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Pencil, Star, ChevronRight } from "lucide-react";
import { getReviews, type UserReview } from "@/lib/reviewsStorage";
import { ActionButton } from "@/components/ActionButton";
import { useLang } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { PremiumBadge } from "@/components/PremiumBadge";
import Link from "next/link";

export default function MyReviewsPage() {
  const router = useRouter();
  const { t } = useLang();
  useAuth(); // needed for PremiumBadge
  const [reviews, setReviews] = useState<UserReview[]>([]);

  useEffect(() => {
    setReviews(getReviews());
  }, []);

  return (
    <div style={{ maxWidth: 448, margin: "0 auto", minHeight: "100vh", background: "#f6f1e8" }}>

      {/* Header */}
      <div style={{
        background: "linear-gradient(160deg, #0a2018 0%, #1f6b43 60%, #2e8a5a 100%)",
        borderRadius: "0 0 28px 28px", padding: "44px 20px 22px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ActionButton
              onClick={() => router.back()}
              style={{
                width: 36, height: 36, borderRadius: 999, flexShrink: 0,
                background: "rgba(255,255,255,0.18)", display: "inline-flex",
                alignItems: "center", justifyContent: "center",
              }}
            >
              <ChevronLeft size={20} color="white" />
            </ActionButton>
            <div>
              <h1 style={{
                margin: 0, fontFamily: "var(--font-fraunces),Georgia,serif",
                fontSize: 26, fontWeight: 600, letterSpacing: -0.5, lineHeight: 1, color: "#fff",
              }}>
                Ulasan Saya
              </h1>
              {reviews.length > 0 && (
                <p style={{ margin: "3px 0 0", color: "rgba(255,255,255,0.6)", fontSize: 12, fontFamily: "var(--font-jakarta),sans-serif" }}>
                  {reviews.length} ulasan ditulis
                </p>
              )}
            </div>
          </div>
          <PremiumBadge />
        </div>
      </div>

      <div style={{ padding: "20px 16px 40px" }}>

        {/* Empty state */}
        {reviews.length === 0 && (
          <div style={{ textAlign: "center", padding: "64px 0" }}>
            <p style={{ fontSize: 48, marginBottom: 12 }}>✍️</p>
            <p style={{
              fontFamily: "var(--font-fraunces),Georgia,serif",
              fontSize: 18, fontWeight: 700, color: "#0e1d4f", marginBottom: 8,
            }}>
              Belum Ada Ulasan
            </p>
            <p style={{
              fontFamily: "var(--font-jakarta),sans-serif",
              fontSize: 13, color: "#94a3b8", lineHeight: 1.6,
            }}>
              Ulasan yang kamu tulis akan muncul di sini.
            </p>
          </div>
        )}

        {/* Review cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {reviews.map((review) => (
            <div
              key={review.placeId}
              style={{
                background: "#fff", borderRadius: 20,
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 0 rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.06)",
                overflow: "clip",
              }}
            >
              {/* Tappable review body → goes to place detail */}
              <Link
                href={`/place/${review.placeId}`}
                style={{ textDecoration: "none", display: "block", padding: 16 }}
              >
                {/* Place name + date */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{review.placeIcon}</span>
                    <span style={{
                      fontFamily: "var(--font-jakarta),sans-serif",
                      fontWeight: 700, fontSize: 14, color: "#0e1d4f",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {review.placeName}
                    </span>
                  </div>
                  <span style={{
                    fontFamily: "var(--font-jakarta),sans-serif",
                    fontSize: 11, color: "#94a3b8", flexShrink: 0, marginLeft: 8,
                  }}>
                    {review.date}
                  </span>
                </div>

                {/* Stars */}
                <div style={{ display: "flex", gap: 2, marginBottom: 8 }}>
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} size={14} fill={s < review.rating ? "#FBBF24" : "#D1D5DB"} stroke="none" />
                  ))}
                </div>

                {/* Comment */}
                <p style={{
                  fontFamily: "var(--font-jakarta),sans-serif",
                  fontSize: 13, color: "#4b5563", lineHeight: 1.55,
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                } as React.CSSProperties}>
                  {review.comment}
                </p>

                {/* Reviewer name */}
                <p style={{
                  fontFamily: "var(--font-jakarta),sans-serif",
                  fontSize: 11, color: "#94a3b8", marginTop: 8, fontWeight: 600,
                }}>
                  — {review.name}
                </p>
              </Link>

              {/* Edit button — separated by a divider */}
              <div style={{ borderTop: "1px solid #f1f5f9" }}>
                <ActionButton
                  onClick={() => router.push(`/write-review/${review.placeId}`)}
                  style={{
                    display: "flex", alignItems: "center", gap: 7,
                    width: "100%", padding: "11px 16px",
                    background: "transparent", border: "none",
                    color: "#2e8a5a",
                    fontFamily: "var(--font-jakarta),sans-serif",
                    fontSize: 13, fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <Pencil size={14} strokeWidth={2.5} />
                  {t.reviewEditBtn}
                  <ChevronRight size={14} style={{ marginLeft: "auto", color: "#94a3b8" }} />
                </ActionButton>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
