"use client";
import { supabase } from "./supabase";

const LS_KEY = "savedIds";

// ── Local helpers ─────────────────────────────────────────────────────────────

function lsGet(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; }
}

function lsSet(ids: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify(ids));
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Returns the current saved IDs for the user (local-first). */
export function getSavedIds(): string[] {
  return lsGet();
}

/**
 * Add a place to favorites.
 * Writes to localStorage immediately; also writes to Supabase when available.
 */
export async function addSaved(placeId: string, phone?: string): Promise<void> {
  const ids = lsGet();
  if (!ids.includes(placeId)) {
    lsSet([...ids, placeId]);
  }
  if (supabase && phone) {
    try {
      await supabase.from("saved_places").upsert(
        { user_phone: phone, place_id: placeId },
        { onConflict: "user_phone,place_id" }
      );
    } catch {}
  }
}

/**
 * Remove a place from favorites.
 * Writes to localStorage immediately; also removes from Supabase when available.
 */
export async function removeSaved(placeId: string, phone?: string): Promise<void> {
  const ids = lsGet();
  lsSet(ids.filter((x) => x !== placeId));
  if (supabase && phone) {
    try {
      await supabase.from("saved_places")
        .delete()
        .eq("user_phone", phone)
        .eq("place_id", placeId);
    } catch {}
  }
}

/**
 * Sync saved places from Supabase into localStorage (call once on login).
 * Merges remote into local so offline-added items aren't lost.
 */
export async function syncSavedFromRemote(phone: string): Promise<void> {
  if (!supabase) return;
  try {
    const { data } = await supabase
      .from("saved_places")
      .select("place_id")
      .eq("user_phone", phone);
    if (!data) return;
    const remoteIds = data.map((r: { place_id: string }) => r.place_id);
    const local = lsGet();
    const merged = Array.from(new Set([...local, ...remoteIds]));
    lsSet(merged);
  } catch {}
}
