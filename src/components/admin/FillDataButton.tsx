"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { aiFillPlaceData, type PlaceFillData } from "@/app/admin/actions";

/**
 * "Fill Data" — from the critical fields the admin already typed (name, address,
 * Google Place ID, Instagram, website), pull the rest: factual fields via Google
 * Places, descriptive fields (about, facilities) via Claude. The parent form
 * routes the result onto its own setters and fills ONLY its empty fields, so this
 * never clobbers data you've entered. Review, then Publish.
 */
export function FillDataButton({
  category,
  name,
  address,
  googlePlaceId,
  instagram,
  website,
  onResult,
  disabled,
}: {
  category: string;
  name: string;
  address?: string;
  googlePlaceId?: string;
  instagram?: string;
  website?: string;
  onResult: (data: PlaceFillData) => void;
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function run() {
    setMsg(null);
    if (!name.trim()) {
      setMsg({ ok: false, text: "Isi Nama dulu." });
      return;
    }
    setLoading(true);
    try {
      const r = await aiFillPlaceData({ category, name, address, googlePlaceId, instagram, website });
      if (!r.ok) {
        setMsg({ ok: false, text: r.error });
      } else {
        onResult(r.data);
        const src = r.data.sources.length ? ` (${r.data.sources.join(" + ")})` : "";
        setMsg({ ok: true, text: `Field kosong terisi otomatis${src} ✓ — periksa lalu Publish.` });
      }
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Gagal mengisi data." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <button
        type="button"
        onClick={run}
        disabled={loading || disabled}
        title="Isi otomatis field yang masih kosong (Google Places + Claude)"
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
          border: "1.5px solid #c7d2fe", background: loading ? "#eef2ff" : "#eef2ff",
          color: "#4338ca", cursor: loading || disabled ? "not-allowed" : "pointer",
          opacity: loading || disabled ? 0.7 : 1, whiteSpace: "nowrap",
        }}
      >
        <Sparkles size={15} strokeWidth={2} />
        {loading ? "Mengisi…" : "Fill Data"}
      </button>
      {msg && (
        <span style={{ fontSize: 12, color: msg.ok ? "#047857" : "#dc2626", maxWidth: 320 }}>
          {msg.text}
        </span>
      )}
    </span>
  );
}
