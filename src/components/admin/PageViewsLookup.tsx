"use client";
import { useState } from "react";

type Metric = { views: number; users: number };
type Res = { needle: string; last7: Metric; last30: Metric; last90: Metric };

export function PageViewsLookup() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<Res | null>(null);
  const [err, setErr] = useState("");

  async function lookup() {
    const v = q.trim();
    if (!v || loading) return;
    setLoading(true); setErr(""); setRes(null);
    try {
      const r = await fetch("/api/admin/page-views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: v }),
      });
      const d = await r.json();
      if (!r.ok) setErr(d.error || "Gagal memuat data.");
      else setRes(d);
    } catch {
      setErr("Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  }

  const cards: [string, Metric][] = res
    ? [["7 hari", res.last7], ["30 hari", res.last30], ["90 hari", res.last90]]
    : [];
  const fmt = (n: number) => n.toLocaleString("id-ID");

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: "18px 20px", marginBottom: 20, boxShadow: "var(--shadow-sm)" }}>
      <p className="eyebrow" style={{ marginBottom: 4 }}>Cek Views Halaman</p>
      <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 12px" }}>
        Tempel URL atau slug halaman apa pun (mis. <code>/place/nama-sekolah</code>) untuk lihat jumlah views.
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") lookup(); }}
          placeholder="URL atau slug halaman…"
          style={{ flex: 1, minWidth: 220, padding: "10px 14px", borderRadius: 10, border: "1.5px solid var(--line)", fontSize: 13, outline: "none", background: "var(--paper-2)", color: "var(--ink)", fontFamily: "var(--font-jakarta), sans-serif" }}
        />
        <button
          onClick={lookup}
          onTouchEnd={(e) => { e.preventDefault(); lookup(); }}
          disabled={loading}
          style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "var(--primary)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: loading ? "wait" : "pointer", touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
        >
          {loading ? "Memuat…" : "Cek"}
        </button>
      </div>

      {err && <p style={{ fontSize: 12, color: "#ef4444", marginTop: 10 }}>{err}</p>}

      {res && (
        <div style={{ marginTop: 14 }}>
          <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 8px", wordBreak: "break-all" }}>
            Cocok dengan: <b style={{ color: "var(--ink)" }}>{res.needle}</b>
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {cards.map(([label, m]) => (
              <div key={label} style={{ flex: 1, minWidth: 130, background: "var(--paper-2)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{label} terakhir</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.02em" }}>{fmt(m.views)}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>views · {fmt(m.users)} pengunjung</div>
              </div>
            ))}
          </div>
          {res.last90.views === 0 && (
            <p style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 8 }}>
              Belum ada views tercatat — halaman baru, atau slug/URL tidak cocok.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
