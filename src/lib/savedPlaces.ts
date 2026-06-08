"use client";
import { getSupabaseBrowserClient } from "./supabase-browser";

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

/** Returns the current saved IDs from localStorage (instant, no network) */
export function getSavedIds(): string[] {
  return lsGet();
}

/**
 * Add a place to favorites.
 * Writes to localStorage immediately; syncs to Supabase in the background.
 */
export async function addSaved(placeId: string, userId?: string): Promise<void> {
  const ids = lsGet();
  if (!ids.includes(placeId)) {
    lsSet([...ids, placeId]);
  }
  if (userId) {
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.from("saved_places").upsert(
        { user_id: userId, place_id: placeId },
        { onConflict: "user_id,place_id" }
      );
    } catch {}
  }
}

/**
 * Remove a place from favorites.
 * Writes to localStorage immediately; syncs removal to Supabase in the background.
 */
export async function removeSaved(placeId: string, userId?: string): Promise<void> {
  lsSet(lsGet().filter(x => x !== placeId));
  if (userId) {
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.from("saved_places")
        .delete()
        .eq("user_id", userId)
        .eq("place_id", placeId);
    } catch {}
  }
}

/**
 * Sync saved places from Supabase into localStorage on login.
 * Merges remote → local so any offline-saved items aren't lost.
 */
export async function syncSavedFromRemote(userId: string): Promise<void> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data } = await supabase
      .from("saved_places")
      .select("place_id")
      .eq("user_id", userId);
    if (!data) return;
    const remoteIds = data.map((r: { place_id: string }) => r.place_id);
    const merged = Array.from(new Set([...lsGet(), ...remoteIds]));
    lsSet(merged);
  } catch {}
}
