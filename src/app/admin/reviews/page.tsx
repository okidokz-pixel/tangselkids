"use client";

import { useState, useEffect, useTransition } from "react";
import { Star, Check, Trash2, Clock } from "lucide-react";
import { getAdminReviews, approveReview, deleteReview } from "@/app/admin/actions";

type Review = {
  user_id:        string;
  place_id:       string;
  place_name:     string;
  place_icon:     string;
  place_category: string | null;
  reviewer_name:  string;
  rating:         number;
  comment:        string;
  is_published:   boolean;
  created_at:     string;
};

function StarRow({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1,2,3,4,5].map(s => (
        <Star key={s} size={13} fill={s <= rating ? "#FBBF24" : "#D1D5DB"} stroke="none" />
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews]   = useState<Review[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter,  setFilter]    = useState<"all" | "pending" | "approved">("pending");
  const [isPending, startTransition] = useTransition();

  async function load() {
    setLoading(true);
    try {
      const data = await getAdminReviews();
      setReviews(data as Review[]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function handleApprove(userId: string, placeId: string) {
    startTransition(async () => {
      await approveReview(userId, placeId);
      setReviews(prev => prev.map(r =>
        r.user_id === userId && r.place_id === placeId ? { ...r, is_published: true } : r
      ));
    });
  }

  function handleDelete(userId: string, placeId: string) {
    if (!confirm("Hapus ulasan ini? Tindakan ini tidak bisa dibatalkan.")) return;
    startTransition(async () => {
      await deleteReview(userId, placeId);
      setReviews(prev => prev.filter(r => !(r.user_id === userId && r.place_id === placeId)));
    });
  }

  const filtered = reviews.filter(r => {
    if (filter === "pending")  return !r.is_published;
    if (filter === "approved") return r.is_published;
    return true;
  });

  const pendingCount  = reviews.filter(r => !r.is_published).length;
  const approvedCount = reviews.filter(r => r.is_published).length;

  return (
    <div style={{ padding: "32px 24px", maxWidth: 900 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", margin: 0 }}>Reviews</h1>
        <p style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>
          {pendingCount} menunggu persetujuan · {approvedCount} disetujui
        </p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {(["pending", "approved", "all"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "6px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600,
              border: "none", cursor: "pointer",
              background: filter === f ? "#0f172a" : "#f1f5f9",
              color:      filter === f ? "#fff"    : "#475569",
            }}
          >
            {f === "pending" ? `Pending (${pendingCount})` : f === "approved" ? `Approved (${approvedCount})` : "All"}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: "#94a3b8", fontSize: 14 }}>Loading…</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 0", color: "#94a3b8" }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>✅</p>
          <p style={{ fontSize: 14 }}>Tidak ada ulasan {filter === "pending" ? "yang menunggu persetujuan" : ""}.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(r => (
            <div
              key={`${r.user_id}-${r.place_id}`}
              style={{
                background: "#fff",
                border: `1.5px solid ${r.is_published ? "#e2e8f0" : "#FDE68A"}`,
                borderRadius: 16,
                padding: 16,
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              }}
            >
              {/* Top row */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  <span style={{ fontSize: 20 }}>{r.place_icon}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {r.place_name}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>
                      oleh <strong>{r.reviewer_name}</strong> · {new Date(r.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </div>
                </div>

                {/* Status badge */}
                <span style={{
                  flexShrink: 0,
                  fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999,
                  background: r.is_published ? "#dcfce7" : "#FEF3C7",
                  color:      r.is_published ? "#15803d" : "#92400e",
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  {r.is_published
                    ? <><Check size={11} /> Approved</>
                    : <><Clock size={11} /> Pending</>
                  }
                </span>
              </div>

              <StarRow rating={r.rating} />

              <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, margin: "8px 0 12px" }}>
                {r.comment}
              </p>

              {/* Actions */}
              <div style={{ display: "flex", gap: 8 }}>
                {!r.is_published && (
                  <button
                    onClick={() => handleApprove(r.user_id, r.place_id)}
                    disabled={isPending}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "7px 14px", borderRadius: 8, border: "none",
                      background: "#16a34a", color: "#fff",
                      fontSize: 13, fontWeight: 600, cursor: "pointer",
                    }}
                  >
                    <Check size={14} /> Approve
                  </button>
                )}
                <button
                  onClick={() => handleDelete(r.user_id, r.place_id)}
                  disabled={isPending}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "7px 14px", borderRadius: 8, border: "none",
                    background: "#fee2e2", color: "#dc2626",
                    fontSize: 13, fontWeight: 600, cursor: "pointer",
                  }}
                >
                  <Trash2 size={14} /> Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
