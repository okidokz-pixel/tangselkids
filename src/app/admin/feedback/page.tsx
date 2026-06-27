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
  user_name:  string | null;
  user_phone: string | null;
  place_name: string | null;
  place_slug: string | null;
};

const TOPIC_LABELS: Record<string, string> = {
  suggestion: "💡 Saran / Ide",
  correction: "✏️ Koreksi Info Tempat",
  "new-place": "📍 Usul Tempat Baru",
  bug:        "🐛 Bug / Masalah Teknis",
  other:      "💬 Lainnya",
};

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

function FeedbackCard({ f, onDelete, deleting }: { f: Feedback; onDelete: () => void; deleting: boolean }) {
  const [place, setPlace] = useState(f.place_name ?? "");
  const [link, setLink] = useState(f.place_slug ?? "");

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
    <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 16, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
        <div>
          <span style={{ display: "inline-block", fontSize: 12, fontWeight: 700, background: "#f1f5f9", color: "#475569", borderRadius: 999, padding: "3px 10px", marginBottom: 6 }}>
            {TOPIC_LABELS[f.topic] ?? f.topic}
          </span>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>
            {new Date(f.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            {f.user_id ? " · Pengguna terdaftar" : " · Anonim"}
          </div>
        </div>
        <button
          onClick={onDelete}
          disabled={deleting}
          style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, border: "none", background: "#fee2e2", color: "#dc2626", fontSize: 12, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}
        >
          <Trash2 size={13} /> Hapus
        </button>
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
            <FeedbackCard key={f.id} f={f} onDelete={() => handleDelete(f.id)} deleting={isPending} />
          ))}
        </div>
      )}
    </div>
  );
}
