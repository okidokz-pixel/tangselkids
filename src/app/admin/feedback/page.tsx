"use client";

import { useState, useEffect, useTransition } from "react";
import { Trash2, Check, RotateCcw } from "lucide-react";
import { getAdminFeedback, deleteFeedback, setFeedbackStatus } from "@/app/admin/actions";

type FeedbackStatus = "new" | "resolved";

type Feedback = {
  id:         string;
  user_id:    string | null;
  topic:      string;
  message:    string;
  status:     FeedbackStatus | null;
  created_at: string;
  user_name:  string | null;
  user_phone: string | null;
  place_name: string | null;
  place_slug: string | null;
};

/** Treat a missing status (pre-migration rows) as "new". */
function statusOf(f: Feedback): FeedbackStatus {
  return f.status === "resolved" ? "resolved" : "new";
}

const SITE_URL = "https://tangselkids.com";

/** Phone → wa.me digits ("0812…" / "812…" → "62812…"). */
function waNumber(phone: string | null): string {
  let d = (phone ?? "").replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith("0")) d = "62" + d.slice(1);
  else if (d.startsWith("8")) d = "62" + d;
  return d;
}

const miniInput: React.CSSProperties = {
  padding: "7px 10px", borderRadius: 8, border: "1.5px solid #e2e8f0",
  fontSize: 13, outline: "none", boxSizing: "border-box", width: "100%",
};

function FeedbackCard({ f, onDelete, onSetStatus, busy }: {
  f: Feedback;
  onDelete: () => void;
  onSetStatus: (status: FeedbackStatus) => void;
  busy: boolean;
}) {
  const [place, setPlace] = useState(f.place_name ?? "");
  const [link, setLink] = useState(f.place_slug ?? "");

  const status = statusOf(f);
  const resolved = status === "resolved";

  const wa = waNumber(f.user_phone);
  const placeName = place.trim() || "[nama tempat]";
  const url = link.trim()
    ? (link.trim().startsWith("http") ? link.trim() : `${SITE_URL}/place/${link.trim()}`)
    : "[link]";
  const msg =
    `[Admin TangselKids] Terima kasih atas masukannya tentang ${placeName}. ` +
    `Info tentang ${placeName} sudah kami update sesuai dengan saran kamu! :) ` +
    `Bisa cek infonya di ${url}`;
  const waHref = wa ? `https://wa.me/${wa}?text=${encodeURIComponent(msg)}` : null;

  return (
    <div style={{
      background: resolved ? "#f8fafc" : "#fff",
      border: "1.5px solid #e2e8f0", borderRadius: 16, padding: 16,
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)", opacity: resolved ? 0.85 : 1,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
        <div>
          <span style={{
            display: "inline-block", fontSize: 11, fontWeight: 700, borderRadius: 999,
            padding: "3px 10px", marginBottom: 6,
            background: resolved ? "#dcfce7" : "#fef3c7",
            color:      resolved ? "#166534" : "#b45309",
          }}>
            {resolved ? "✓ Selesai" : "● Baru"}
          </span>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>
            {new Date(f.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            {f.user_id ? " · Pengguna terdaftar" : " · Anonim"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          {resolved ? (
            <button
              onClick={() => onSetStatus("new")}
              disabled={busy}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", color: "#475569", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
            >
              <RotateCcw size={13} /> Buka lagi
            </button>
          ) : (
            <button
              onClick={() => onSetStatus("resolved")}
              disabled={busy}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, border: "none", background: "#dcfce7", color: "#166534", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
            >
              <Check size={13} /> Tandai Selesai
            </button>
          )}
          <button
            onClick={onDelete}
            disabled={busy}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, border: "none", background: "#fee2e2", color: "#dc2626", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
          >
            <Trash2 size={13} /> Hapus
          </button>
        </div>
      </div>

      {/* Submitter name + WhatsApp number */}
      {(f.user_name || f.user_phone) && (
        <div style={{ fontSize: 13, marginBottom: 10 }}>
          {f.user_name && <span style={{ fontWeight: 700, color: "#0f172a" }}>{f.user_name}</span>}
          {f.user_phone && <span style={{ color: "#64748b" }}>{f.user_name ? " · " : ""}{f.user_phone}</span>}
        </div>
      )}

      <p style={{ fontSize: 14, color: "#1e293b", lineHeight: 1.65, margin: 0, whiteSpace: "pre-wrap" }}>
        {f.message}
      </p>

      {/* WhatsApp reply with auto-message */}
      {wa ? (
        <div style={{ marginTop: 14, borderTop: "1px solid #f1f5f9", paddingTop: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
            <input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="Nama tempat" style={miniInput} />
            <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="Slug atau URL tempat" style={miniInput} />
          </div>
          <a
            href={waHref!}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 16px", borderRadius: 8, background: "#22c55e", color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none" }}
          >
            💬 Chat di WhatsApp (balasan otomatis)
          </a>
          <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>
            Isi nama tempat &amp; slug/URL agar pesan otomatis lengkap. Kosong → terisi placeholder yang bisa kamu edit di WhatsApp.
          </p>
        </div>
      ) : (
        <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 12, fontStyle: "italic" }}>
          Tanpa nomor WhatsApp (anonim / belum ada nomor) — tidak bisa dibalas via chat.
        </p>
      )}
    </div>
  );
}

const TABS: { key: "new" | "resolved" | "all"; label: string }[] = [
  { key: "new",      label: "Baru" },
  { key: "resolved", label: "Selesai" },
  { key: "all",      label: "Semua" },
];

export default function AdminFeedbackPage() {
  const [items,   setItems]   = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState<"new" | "resolved" | "all">("new");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getAdminFeedback()
      .then(data => setItems(data as Feedback[]))
      .finally(() => setLoading(false));
  }, []);

  function handleDelete(id: string) {
    if (!confirm("Hapus feedback ini? Tindakan ini permanen.")) return;
    startTransition(async () => {
      await deleteFeedback(id);
      setItems(prev => prev.filter(f => f.id !== id));
    });
  }

  function handleStatus(id: string, status: FeedbackStatus) {
    setItems(prev => prev.map(f => f.id === id ? { ...f, status } : f));
    startTransition(async () => {
      await setFeedbackStatus(id, status);
    });
  }

  const countNew      = items.filter(f => statusOf(f) === "new").length;
  const countResolved = items.filter(f => statusOf(f) === "resolved").length;
  const counts: Record<"new" | "resolved" | "all", number> = {
    new: countNew, resolved: countResolved, all: items.length,
  };

  const filtered = filter === "all" ? items : items.filter(f => statusOf(f) === filter);

  return (
    <div style={{ padding: "32px 24px", maxWidth: 900 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", margin: 0 }}>Feedback</h1>
        <p style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>
          {countNew} baru · {items.length} total
        </p>
      </div>

      {/* Status tabs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
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
            {t.label} ({counts[t.key]})
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: "#94a3b8", fontSize: 14 }}>Loading…</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 0", color: "#94a3b8" }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>📭</p>
          <p style={{ fontSize: 14 }}>
            {filter === "new" ? "Tidak ada feedback baru." : filter === "resolved" ? "Belum ada yang ditandai selesai." : "Belum ada feedback."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(f => (
            <FeedbackCard
              key={f.id}
              f={f}
              onDelete={() => handleDelete(f.id)}
              onSetStatus={(status) => handleStatus(f.id, status)}
              busy={isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}
