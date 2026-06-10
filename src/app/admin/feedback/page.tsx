"use client";

import { useState, useEffect, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { getAdminFeedback, deleteFeedback } from "@/app/admin/actions";

type Feedback = {
  id:         string;
  user_id:    string | null;
  topic:      string;
  message:    string;
  created_at: string;
};

const TOPIC_LABELS: Record<string, string> = {
  suggestion: "💡 Saran / Ide",
  correction: "✏️ Koreksi Info Tempat",
  "new-place": "📍 Usul Tempat Baru",
  bug:        "🐛 Bug / Masalah Teknis",
  other:      "💬 Lainnya",
};

export default function AdminFeedbackPage() {
  const [items,   setItems]   = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("all");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getAdminFeedback()
      .then(data => setItems(data as Feedback[]))
      .finally(() => setLoading(false));
  }, []);

  function handleDelete(id: string) {
    if (!confirm("Hapus feedback ini?")) return;
    startTransition(async () => {
      await deleteFeedback(id);
      setItems(prev => prev.filter(f => f.id !== id));
    });
  }

  const topics = Array.from(new Set(items.map(f => f.topic)));
  const filtered = filter === "all" ? items : items.filter(f => f.topic === filter);

  return (
    <div style={{ padding: "32px 24px", maxWidth: 900 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", margin: 0 }}>Feedback</h1>
        <p style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>{items.length} masukan diterima</p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        <button
          onClick={() => setFilter("all")}
          style={{
            padding: "6px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600,
            border: "none", cursor: "pointer",
            background: filter === "all" ? "#0f172a" : "#f1f5f9",
            color:      filter === "all" ? "#fff"    : "#475569",
          }}
        >
          Semua ({items.length})
        </button>
        {topics.map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            style={{
              padding: "6px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600,
              border: "none", cursor: "pointer",
              background: filter === t ? "#0f172a" : "#f1f5f9",
              color:      filter === t ? "#fff"    : "#475569",
            }}
          >
            {TOPIC_LABELS[t] ?? t} ({items.filter(f => f.topic === t).length})
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: "#94a3b8", fontSize: 14 }}>Loading…</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 0", color: "#94a3b8" }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>📭</p>
          <p style={{ fontSize: 14 }}>Belum ada feedback.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(f => (
            <div
              key={f.id}
              style={{
                background: "#fff", border: "1.5px solid #e2e8f0",
                borderRadius: 16, padding: 16,
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                <div>
                  <span style={{
                    display: "inline-block", fontSize: 12, fontWeight: 700,
                    background: "#f1f5f9", color: "#475569",
                    borderRadius: 999, padding: "3px 10px", marginBottom: 6,
                  }}>
                    {TOPIC_LABELS[f.topic] ?? f.topic}
                  </span>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>
                    {new Date(f.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    {f.user_id ? " · Pengguna terdaftar" : " · Anonim"}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(f.id)}
                  disabled={isPending}
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "6px 12px", borderRadius: 8, border: "none",
                    background: "#fee2e2", color: "#dc2626",
                    fontSize: 12, fontWeight: 600, cursor: "pointer", flexShrink: 0,
                  }}
                >
                  <Trash2 size={13} /> Hapus
                </button>
              </div>
              <p style={{ fontSize: 14, color: "#1e293b", lineHeight: 1.65, margin: 0, whiteSpace: "pre-wrap" }}>
                {f.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
