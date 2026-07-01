"use client";

import { useState } from "react";
import { resolveGoogleMapsLink } from "@/app/admin/actions";

/**
 * "Link Google Maps" field + an auto-fill button. Paste a Maps link, click, and
 * it resolves the Place ID + coordinates via the Google Places API and hands
 * them back through onResult so the parent form can set its own fields.
 */
export function GoogleMapsFill({
  onResult,
}: {
  onResult: (r: { placeId?: string; lat?: string; lng?: string; name?: string }) => void;
}) {
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function fill() {
    setMsg(null);
    if (!link.trim()) {
      setMsg({ ok: false, text: "Tempel link Google Maps dulu." });
      return;
    }
    setLoading(true);
    try {
      const r = await resolveGoogleMapsLink(link.trim());
      if (!r.ok) {
        setMsg({ ok: false, text: r.error ?? "Gagal membaca link." });
      } else {
        onResult({
          placeId: r.placeId,
          lat: r.lat != null ? String(r.lat) : undefined,
          lng: r.lng != null ? String(r.lng) : undefined,
          name: r.name,
        });
        setMsg({ ok: true, text: `Terisi otomatis${r.name ? ` — ${r.name}` : ""} ✓` });
      }
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Gagal membaca link." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
        Link Google Maps
      </label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="Tempel link Google Maps (Share → Copy link)"
          style={{
            flex: 1, minWidth: 220, padding: "9px 12px", borderRadius: 8,
            border: "1.5px solid #d1d5db", fontSize: 14, color: "#111827",
            outline: "none", boxSizing: "border-box", background: "#fff",
          }}
        />
        <button
          type="button"
          onClick={fill}
          disabled={loading}
          style={{
            padding: "9px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
            border: "none", whiteSpace: "nowrap",
            background: loading ? "#9ca3af" : "#0e1d4f", color: "#fff",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Mengisi…" : "Isi Place ID + Koordinat"}
        </button>
      </div>
      {msg && (
        <div style={{ fontSize: 12.5, marginTop: 6, color: msg.ok ? "#047857" : "#dc2626" }}>
          {msg.text}
        </div>
      )}
      <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
        Mengisi Google Place ID, Latitude & Longitude otomatis.
      </div>
    </div>
  );
}
