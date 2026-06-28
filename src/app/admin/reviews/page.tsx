"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { Star, Check, X, Clock, RotateCcw } from "lucide-react";
import { getAdminReviews, setReviewStatus } from "@/app/admin/actions";

type Review = Awaited<ReturnType<typeof getAdminReviews>>[number];
type Status = "pending" | "approved" | "rejected";

const CATEGORY_LABELS: Record<string, string> = {
  "school": "Sekolah", "learning-center": "Tempat Kursus", "daycare": "Daycare",
  "playground": "Playground", "clinic": "Klinik", "cafe": "Kafe",
  "mini-zoo": "Mini Zoo", "swimming-pool": "Kolam Renang", "bookstore": "Toko Buku",
};

const REL_LABELS: Record<string, string> = {
  murid_sekarang: "Murid sekarang", alumni: "Alumni",
  pernah_ikut: "Pernah ikut kelas", ortu_calon_murid: "Ortu calon murid",
};

const CATEGORY_HREF: Record<string, string> = {
  "school": "/admin/schools", "learning-center": "/admin/learning-centers", "daycare": "/admin/daycares",
  "playground": "/admin/playgrounds", "clinic": "/admin/clinics", "cafe": "/admin/cafes",
  "mini-zoo": "/admin/mini-zoo", "swimming-pool": "/admin/swimming-pools", "bookstore": "/admin/bookstores",
};

const STATUS_BADGE: Record<Status, { bg: string; color: string; label: string }> = {
  pending:  { bg: "#FEF3C7", color: "#92400e", label: "Pending"  },
  approved: { bg: "#dcfce7", color: "#15803d", label: "Approved" },
  rejected: { bg: "#fee2e2", color: "#991b1b", label: "Rejected" },
};

/** local phone → wa.me 62xx digits */
function waNumber(phone: string | null): string {
  let d = (phone ?? "").replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith("0")) d = "62" + d.slice(1);
  else if (d.startsWith("8")) d = "62" + d;
  return d;
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s <= rating ? "#FBBF24" : "#D1D5DB"} stroke="none" />)}
    </div>
  );
}

function statusOf(r: Review): Status {
  return (r.status === "approved" || r.status === "rejected") ? r.status : "pending";
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState<Status | "all">("pending");
  const [isPending, startTransition] = useTransition();

  async function load() {
    setLoading(true);
    try { setReviews(await getAdminReviews()); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function changeStatus(r: Review, status: Status) {
    setReviews(prev => prev.map(x => (x.user_id === r.user_id && x.place_id === r.place_id) ? { ...x, status } : x));
    startTransition(async () => { await setReviewStatus(r.user_id, r.place_id, status); });
  }

  const counts = {
    pending:  reviews.filter(r => statusOf(r) === "pending").length,
    approved: reviews.filter(r => statusOf(r) === "approved").length,
    rejected: reviews.filter(r => statusOf(r) === "rejected").length,
    all: reviews.length,
  };
  const filtered = filter === "all" ? reviews : reviews.filter(r => statusOf(r) === filter);

  const TABS: { key: Status | "all"; label: string }[] = [
    { key: "pending", label: `Pending (${counts.pending})` },
    { key: "approved", label: `Approved (${counts.approved})` },
    { key: "rejected", label: `Rejected (${counts.rejected})` },
    { key: "all", label: `All (${counts.all})` },
  ];

  return (
    <div style={{ padding: "32px 24px", maxWidth: 920 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", margin: 0 }}>Reviews</h1>
        <p style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>
          {counts.pending} menunggu persetujuan · {counts.approved} disetujui
        </p>
      </div>

      {/* Status tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            style={{
              padding: "6px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600,
              border: "none", cursor: "pointer",
              background: filter === t.key ? "#0f172a" : "#f1f5f9",
              color:      filter === t.key ? "#fff"    : "#475569",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: "#94a3b8", fontSize: 14 }}>Loading…</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 0", color: "#94a3b8" }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>✅</p>
          <p style={{ fontSize: 14 }}>Tidak ada review {filter !== "all" ? `(${filter})` : ""}.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(r => {
            const st = statusOf(r);
            const badge = STATUS_BADGE[st];
            const wa = waNumber(r.real_phone);
            const catHref = CATEGORY_HREF[r.place_category ?? ""];
            return (
              <div key={`${r.user_id}-${r.place_id}`} style={{ background: "#fff", border: `1.5px solid ${st === "pending" ? "#FDE68A" : "#e2e8f0"}`, borderRadius: 16, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>

                {/* Top: place + status */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    <span style={{ fontSize: 20 }}>{r.place_icon}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>
                        {catHref ? (
                          <Link href={catHref} style={{ color: "#0f172a", textDecoration: "none" }}>{r.place_name}</Link>
                        ) : r.place_name}
                      </div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>
                        {CATEGORY_LABELS[r.place_category ?? ""] ?? r.place_category} · {new Date(r.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>
                  </div>
                  <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: badge.bg, color: badge.color, display: "inline-flex", alignItems: "center", gap: 4 }}>
                    {st === "approved" ? <Check size={11} /> : st === "rejected" ? <X size={11} /> : <Clock size={11} />}
                    {badge.label}
                  </span>
                </div>

                {/* Rating + relationship */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <StarRow rating={r.rating} />
                  {r.reviewer_relationship && (
                    <span style={{ fontSize: 11, fontWeight: 700, background: "#EEF2FF", color: "#3730A3", borderRadius: 999, padding: "2px 8px" }}>
                      {REL_LABELS[r.reviewer_relationship] ?? r.reviewer_relationship}
                    </span>
                  )}
                </div>

                {/* Full review — exactly as submitted */}
                <div style={{ background: "#f8fafc", borderRadius: 12, padding: "12px 14px", marginBottom: 12 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>Yang disukai</div>
                  <p style={{ fontSize: 13.5, color: "#1e293b", lineHeight: 1.6, margin: "0 0 8px", whiteSpace: "pre-wrap" }}>{r.liked}</p>
                  {r.improve && (<>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>Bisa diperbaiki</div>
                    <p style={{ fontSize: 13.5, color: "#334155", lineHeight: 1.6, margin: "0 0 8px", whiteSpace: "pre-wrap" }}>{r.improve}</p>
                  </>)}
                  {r.suggestion && (<>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>Saran</div>
                    <p style={{ fontSize: 13.5, color: "#334155", lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>{r.suggestion}</p>
                  </>)}
                </div>

                {/* Identity (admin-only) */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
                  <div style={{ fontSize: 13 }}>
                    <span style={{ fontWeight: 700, color: "#0f172a" }}>{r.real_name || "(nama tidak ada)"}</span>
                    {r.real_phone && <span style={{ color: "#64748b" }}> · {r.real_phone}</span>}
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                      Akan tampil sebagai: <strong>{r.is_anonymous ? "Anonim" : (r.reviewer_name || "Anonim")}</strong>
                    </div>
                  </div>
                  {wa && (
                    <a
                      href={`https://wa.me/${wa}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, background: "#22c55e", color: "#fff", fontSize: 12.5, fontWeight: 700, textDecoration: "none" }}
                    >
                      💬 Chat di WhatsApp
                    </a>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8 }}>
                  {st !== "approved" && (
                    <button onClick={() => changeStatus(r, "approved")} disabled={isPending}
                      style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "none", background: "#16a34a", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                      <Check size={14} /> Approve
                    </button>
                  )}
                  {st !== "rejected" && (
                    <button onClick={() => changeStatus(r, "rejected")} disabled={isPending}
                      style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "none", background: "#fee2e2", color: "#dc2626", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                      <X size={14} /> Reject
                    </button>
                  )}
                  {st !== "pending" && (
                    <button onClick={() => changeStatus(r, "pending")} disabled={isPending}
                      style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", color: "#475569", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                      <RotateCcw size={14} /> Set Pending
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
