"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { getClaims, approveClaim, rejectClaim, deleteClaim, getClaimDocumentUrl } from "../actions";

type Claim = Awaited<ReturnType<typeof getClaims>>[number];

const STATUS_TABS = [
  { value: "all",      label: "All"      },
  { value: "pending",  label: "Pending"  },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const CATEGORY_LABELS: Record<string, string> = {
  "school":          "Sekolah",
  "learning-center": "Tempat Kursus",
  "daycare":         "Daycare",
  "playground":      "Playground",
  "clinic":          "Klinik",
  "cafe":            "Kafe",
  "mini-zoo":        "Mini Zoo",
  "swimming-pool":   "Kolam Renang",
  "bookstore":       "Toko Buku",
  "other":           "Lainnya",
};

const STATUS_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  pending:  { bg: "#fef3c7", color: "#b45309", label: "Pending"  },
  approved: { bg: "#dcfce7", color: "#166534", label: "Approved" },
  rejected: { bg: "#fee2e2", color: "#991b1b", label: "Rejected" },
};

const thStyle: React.CSSProperties = {
  padding: "10px 16px", textAlign: "left", fontSize: 11,
  fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em",
};

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ClaimsPage() {
  const [items,     setItems]     = useState<Claim[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [tab,       setTab]       = useState("all");
  const [search,    setSearch]    = useState("");
  const [rejectId,  setRejectId]  = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setLoading(true);
    getClaims(tab).then(data => { setItems(data); setLoading(false); });
  }, [tab]);

  function handleApprove(id: string) {
    if (!confirm("Setujui klaim ini? Ini akan menambahkan badge Terverifikasi ke tempat tersebut.")) return;
    startTransition(async () => {
      await approveClaim(id);
      setItems(prev => prev.map(c => c.id === id ? { ...c, status: "approved" } : c));
    });
  }

  function handleRejectConfirm() {
    if (!rejectId) return;
    const id = rejectId;
    const notes = rejectNotes.trim() || undefined;
    setRejectId(null);
    setRejectNotes("");
    startTransition(async () => {
      await rejectClaim(id, notes);
      setItems(prev => prev.map(c => c.id === id ? { ...c, status: "rejected", admin_notes: notes ?? null } : c));
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Hapus klaim ini permanen? Dokumen verifikasinya ikut dihapus. Jika klaim ini sudah di-approve, badge Terverifikasi pada tempat akan dilepas (kecuali ada klaim approved lain untuk tempat yang sama).")) return;
    startTransition(async () => {
      await deleteClaim(id);
      setItems(prev => prev.filter(c => c.id !== id));
    });
  }

  async function handleViewDoc(path: string) {
    try {
      const url = await getClaimDocumentUrl(path);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      alert("Tidak dapat memuat dokumen. Coba lagi.");
    }
  }

  const filtered = items.filter(c =>
    !search ||
    c.place_name.toLowerCase().includes(search.toLowerCase()) ||
    c.claimant_name.toLowerCase().includes(search.toLowerCase()) ||
    c.claimant_email.toLowerCase().includes(search.toLowerCase()),
  );

  const counts = { pending: 0, approved: 0, rejected: 0, all: items.length };
  items.forEach(c => { if (c.status in counts) counts[c.status as keyof typeof counts]++; });

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#0e1d4f", margin: 0 }}>Claims</h1>
        <p style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>
          {loading ? "Loading…" : `${filtered.length} klaim`}
        </p>
      </div>

      {/* Reject modal */}
      {rejectId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, width: "100%", maxWidth: 400, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0e1d4f", margin: "0 0 12px" }}>Tolak Klaim</h3>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 16px" }}>Opsional: tambahkan catatan untuk claimant (tidak dikirim otomatis).</p>
            <textarea
              value={rejectNotes}
              onChange={e => setRejectNotes(e.target.value)}
              placeholder="Alasan penolakan (opsional)…"
              rows={3}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 13, resize: "vertical", boxSizing: "border-box", outline: "none" }}
            />
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button
                onClick={() => { setRejectId(null); setRejectNotes(""); }}
                style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1.5px solid #e5e7eb", background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#374151" }}
              >
                Batal
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={isPending}
                style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: "#ef4444", fontSize: 13, fontWeight: 700, cursor: "pointer", color: "#fff" }}
              >
                Tolak
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {STATUS_TABS.map(t => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            style={{
              padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
              border: tab === t.value ? "1.5px solid #0e1d4f" : "1.5px solid #e5e7eb",
              background: tab === t.value ? "#0e1d4f" : "#fff",
              color: tab === t.value ? "#fff" : "#374151",
            }}
          >
            {t.label}
            {t.value !== "all" && counts[t.value as keyof typeof counts] > 0 && (
              <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700, padding: "1px 6px", borderRadius: 10, background: tab === t.value ? "rgba(255,255,255,0.25)" : "#f3f4f6", color: tab === t.value ? "#fff" : "#374151" }}>
                {counts[t.value as keyof typeof counts]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari nama tempat, claimant, atau email…"
          style={{ padding: "8px 14px", borderRadius: 8, border: "1.5px solid #d1d5db", fontSize: 13, outline: "none", minWidth: 280 }}
        />
      </div>

      {/* Table */}
      <div className="admin-table-wrap" style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              <th style={thStyle}>Tempat</th>
              <th style={thStyle}>Claimant</th>
              <th style={thStyle}>Kontak</th>
              <th style={thStyle}>Tanggal</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Status</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>Tidak ada klaim.</td></tr>
            ) : filtered.map(c => {
              const badge = STATUS_BADGE[c.status] ?? STATUS_BADGE.pending;
              const isPending = c.status === "pending";
              return (
                <tr key={c.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  {/* Place */}
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{c.place_name}</div>
                    <span style={{ fontSize: 11, padding: "1px 7px", borderRadius: 5, background: "#f1f5f9", color: "#475569", fontWeight: 600 }}>
                      {CATEGORY_LABELS[c.category] ?? c.category}
                    </span>
                  </td>

                  {/* Claimant */}
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{c.claimant_name}</div>
                    <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{c.claimant_role}</div>
                    {c.user_id ? (
                      <Link
                        href={`/admin/users/${c.user_id}`}
                        style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 5, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: "#eef2ff", color: "#3730a3", textDecoration: "none" }}
                        title={c.account_name ? `Akun: ${c.account_name}` : "Lihat akun terhubung"}
                      >
                        👤 {c.account_name || "Akun terhubung"}
                      </Link>
                    ) : (
                      <div style={{ fontSize: 11, color: "#cbd5e1", marginTop: 5, fontStyle: "italic" }}>Tanpa akun (form publik)</div>
                    )}
                  </td>

                  {/* Contact */}
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontSize: 12, color: "#374151" }}>{c.claimant_email}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                      <span style={{ fontSize: 12, color: "#6b7280" }}>{c.claimant_whatsapp}</span>
                      <a
                        href={`https://wa.me/${c.claimant_whatsapp.replace(/[^0-9]/g, "").replace(/^0/, "62")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: 11, fontWeight: 700, padding: "1px 7px", borderRadius: 6, background: "#dcfce7", color: "#166534", textDecoration: "none" }}
                      >
                        💬 WA
                      </a>
                    </div>
                  </td>

                  {/* Date */}
                  <td style={{ padding: "12px 16px", fontSize: 12, color: "#9ca3af" }}>{fmt(c.created_at)}</td>

                  {/* Status */}
                  <td style={{ padding: "12px 16px", textAlign: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20, background: badge.bg, color: badge.color }}>
                      {badge.label}
                    </span>
                    {c.admin_notes && (
                      <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4, maxWidth: 120 }} title={c.admin_notes}>
                        {c.admin_notes.slice(0, 40)}{c.admin_notes.length > 40 ? "…" : ""}
                      </div>
                    )}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                      <button
                        onClick={() => handleViewDoc(c.document_url)}
                        style={{ fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 6, border: "1.5px solid #e5e7eb", background: "#fff", color: "#374151", cursor: "pointer", whiteSpace: "nowrap" }}
                      >
                        📄 Lihat Dok.
                      </button>
                      {isPending && (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => handleApprove(c.id)}
                            style={{ fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 6, border: "none", background: "#dcfce7", color: "#166534", cursor: "pointer", whiteSpace: "nowrap" }}
                          >
                            ✓ Setujui
                          </button>
                          <button
                            onClick={() => { setRejectId(c.id); setRejectNotes(""); }}
                            style={{ fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 6, border: "none", background: "#fee2e2", color: "#991b1b", cursor: "pointer", whiteSpace: "nowrap" }}
                          >
                            ✕ Tolak
                          </button>
                        </div>
                      )}
                      <button
                        onClick={() => handleDelete(c.id)}
                        style={{ fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 6, border: "1.5px solid #fecaca", background: "#fff", color: "#dc2626", cursor: "pointer", whiteSpace: "nowrap" }}
                      >
                        🗑 Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
