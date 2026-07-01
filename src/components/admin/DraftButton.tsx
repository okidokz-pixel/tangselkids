"use client";

import { useState } from "react";
import { saveDraft } from "@/app/admin/actions";

/**
 * Draft state for a create form. `category` is the /admin/<route> segment.
 * `save(name, payload)` upserts and remembers the returned id, so repeated
 * saves update the same draft row. Expose `draftId` so the form can pass it to
 * its publish action (which deletes the draft on a successful insert).
 */
export function useDraft(category: string, initialDraftId?: string) {
  const [draftId, setDraftId] = useState<string | null>(initialDraftId ?? null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function save(name: string, payload: Record<string, unknown>) {
    setError("");
    setSaving(true);
    try {
      const id = await saveDraft({ id: draftId, category, name, payload });
      setDraftId(id);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan draft");
    } finally {
      setSaving(false);
    }
  }

  return { draftId, saving, saved, error, save };
}

export type DraftState = ReturnType<typeof useDraft>;

/** Secondary "Simpan Draft" button, styled to match the form header actions. */
export function DraftButton({
  draft,
  name,
  buildPayload,
  disabled,
}: {
  draft: DraftState;
  name: string;
  buildPayload: () => Record<string, unknown>;
  disabled?: boolean;
}) {
  return (
    <>
      <button
        type="button"
        onClick={() => draft.save(name, buildPayload())}
        disabled={disabled || draft.saving}
        style={{
          padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
          border: "1.5px solid #d1d5db",
          background: draft.saved ? "#ecfdf5" : "#fff",
          color: draft.saved ? "#047857" : "#374151",
          cursor: disabled || draft.saving ? "not-allowed" : "pointer",
        }}
      >
        {draft.saving ? "Menyimpan…" : draft.saved ? "Draft tersimpan ✓" : "Simpan Draft"}
      </button>
      {draft.error && (
        <span style={{ fontSize: 12, color: "#dc2626", alignSelf: "center" }}>{draft.error}</span>
      )}
    </>
  );
}
