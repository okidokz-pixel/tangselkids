"use client";

import { useState } from "react";
import { aiImproveDescription, aiTranslateFields } from "@/app/admin/actions";

const btn: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 6,
  padding: "5px 12px", borderRadius: 6, border: "1px solid #c7d2fe",
  background: "#eef2ff", color: "#4338ca", fontSize: 12, fontWeight: 600,
  cursor: "pointer",
};
const errStyle: React.CSSProperties = { fontSize: 11.5, color: "#b91c1c", marginLeft: 8 };

/** "✨ Improve" — rewrites/expands an Indonesian description in place. */
export function ImproveButton({
  text,
  name,
  category,
  paragraphs = 4,
  onResult,
}: {
  text: string;
  name?: string;
  category?: string;
  paragraphs?: number;
  onResult: (improved: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true); setError(null);
    try {
      const r = await aiImproveDescription({ text, name, category, paragraphs });
      if (r.ok) onResult(r.text);
      else setError(r.error);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <span style={{ display: "inline-flex", alignItems: "center" }}>
      <button type="button" onClick={run} disabled={loading} style={{ ...btn, opacity: loading ? 0.6 : 1 }}>
        {loading ? "Improving…" : `✨ Improve (${paragraphs} paragraphs)`}
      </button>
      {error && <span style={errStyle}>{error}</span>}
    </span>
  );
}

/**
 * "🌐 Translate to English" — sends the given Indonesian fields and passes the
 * English results back via onResult, keyed identically so the caller can route
 * each value to the right setter.
 */
export function TranslateButton({
  fields,
  onResult,
  label = "🌐 Translate to English",
}: {
  fields: Record<string, string>;
  onResult: (out: Record<string, string>) => void;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true); setError(null);
    try {
      const r = await aiTranslateFields(fields);
      if (r.ok) onResult(r.data);
      else setError(r.error);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <span style={{ display: "inline-flex", alignItems: "center" }}>
      <button type="button" onClick={run} disabled={loading} style={{ ...btn, opacity: loading ? 0.6 : 1 }}>
        {loading ? "Translating…" : label}
      </button>
      {error && <span style={errStyle}>{error}</span>}
    </span>
  );
}
