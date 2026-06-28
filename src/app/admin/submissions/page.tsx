"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { getSubmissions, deleteSubmission } from "../actions";

type Sub = Awaited<ReturnType<typeof getSubmissions>>[number];

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

/** Convert stored phone (+6281234567890) to wa.me URL (6281234567890) */
function waLink(phone: string | null) {
  if (!phone) return null;
  return `https://wa.me/${phone.replace(/^\+/, "")}`;
}

export default function SubmissionsPage() {
  const [items,     setItems]     = useState<Sub[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [tab,       setTab]       = useState("all");
  const [search,    setSearch]    = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setLoading(true);
    getSubmissions(tab).then(data => { setItems(data); setLoading(false); });
  }, [tab]);

  function handleDelete(id: string) {
    if (!confirm("Delete this submission? This cannot be undone.")) return;
    setDeletingId(id);
    startTransition(async () => {
      await deleteSubmission(id);
      setItems(prev => prev.filter(s => s.id !== id));
      setDeletingId(null);
    });
  }

  const filtered = items.filter(s =>
    !search ||
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.submitter_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (s.submitter_phone ?? "").includes(search),
  );

  const counts = { pending: 0, approved: 0, rejected: 0, all: items.length };
  items.forEach(s => { if (s.status in counts) counts[s.status as keyof typeof counts]++; });

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#0e1d4f", margin: 0 }}>Submissions</h1>
        <p style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>
          {loading ? "Loading…" : `${filtered.length} submission${filtered.length !== 1 ? "s" : ""}`}
        </p>
      </div>

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
              <span style={{
                marginLeft: 6, fontSize: 11, fontWeight: 700, padding: "1px 6px", borderRadius: 10,
                background: tab === t.value ? "rgba(255,255,255,0.25)" : "#f3f4f6",
                color: tab === t.value ? "#fff" : "#374151",
              }}>
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
          placeholder="Search by name or phone…"
          style={{ padding: "8px 14px", borderRadius: 8, border: "1.5px solid #d1d5db", fontSize: 13, outline: "none", minWidth: 260 }}
        />
      </div>

      {/* Table */}
      <div className="admin-table-wrap" style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              <th style={thStyle}>Place</th>
              <th style={thStyle}>Category</th>
              <th style={thStyle}>Submitted by</th>
              <th style={thStyle}>Date</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Status</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>No submissions found.</td></tr>
            ) : filtered.map(s => {
              const badge = STATUS_BADGE[s.status] ?? STATUS_BADGE.pending;
              const wa = waLink(s.submitter_phone);
              return (
                <tr key={s.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  {/* Place name + area */}
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{s.area}</div>
                  </td>

                  {/* Category */}
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 6, background: "#f1f5f9", color: "#475569", fontWeight: 600 }}>
                      {CATEGORY_LABELS[s.category] ?? s.category}
                    </span>
                  </td>

                  {/* Submitter name + phone + WA button */}
                  <td style={{ padding: "12px 16px" }}>
                    {s.submitter_name || s.submitter_phone ? (
                      <div>
                        {s.submitter_name && (
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{s.submitter_name}</div>
                        )}
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: s.submitter_name ? 3 : 0 }}>
                          {s.submitter_phone && (
                            <span style={{ fontSize: 12, color: "#6b7280" }}>{s.submitter_phone}</span>
                          )}
                          {wa && (
                            <a
                              href={wa}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Chat on WhatsApp"
                              style={{
                                display: "inline-flex", alignItems: "center", gap: 4,
                                fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                                background: "#dcfce7", color: "#166534", textDecoration: "none",
                              }}
                            >
                              💬 WA
                            </a>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: "#d1d5db" }}>—</span>
                    )}
                  </td>

                  {/* Date */}
                  <td style={{ padding: "12px 16px", fontSize: 12, color: "#9ca3af" }}>{fmt(s.created_at)}</td>

                  {/* Status */}
                  <td style={{ padding: "12px 16px", textAlign: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20, background: badge.bg, color: badge.color }}>
                      {badge.label}
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <Link
                        href={`/admin/submissions/${s.id}`}
                        style={{ fontSize: 13, fontWeight: 600, color: "#0e1d4f", textDecoration: "none", padding: "5px 12px", borderRadius: 6, border: "1.5px solid #e5e7eb" }}
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDelete(s.id)}
                        disabled={deletingId === s.id || isPending}
                        style={{
                          fontSize: 13, fontWeight: 600, padding: "5px 12px", borderRadius: 6,
                          border: "1.5px solid #fecaca", background: "#fff", color: "#ef4444",
                          cursor: "pointer", opacity: deletingId === s.id ? 0.5 : 1,
                        }}
                      >
                        {deletingId === s.id ? "…" : "Delete"}
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
