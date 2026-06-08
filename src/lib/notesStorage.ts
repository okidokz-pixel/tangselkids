import { getSupabaseBrowserClient } from "./supabase-browser";

export type FacilityNote = {
  placeId:       string;
  placeName:     string;
  placeCategory: string;
  placeIcon:     string;
  noteText:      string;
  updatedAt:     string;  // ISO string
};

const LS_KEY = "facilityNotes";

// ── localStorage helpers ──────────────────────────────────────────────────────

function lsLoad(): FacilityNote[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; }
}

function lsSave(notes: FacilityNote[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify(notes));
}

// ── Public API ────────────────────────────────────────────────────────────────

export function getNote(placeId: string): FacilityNote | undefined {
  return lsLoad().find(n => n.placeId === placeId);
}

export function getAllNotes(): FacilityNote[] {
  return lsLoad().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

/**
 * Save a note.
 * Writes to localStorage immediately; also upserts to Supabase when userId supplied.
 */
export async function saveNote(note: FacilityNote, userId?: string): Promise<void> {
  // Local cache
  const existing = lsLoad().filter(n => n.placeId !== note.placeId);
  lsSave([...existing, note]);

  // Supabase persistence
  if (userId) {
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.from("notes").upsert(
        {
          user_id:        userId,
          place_id:       note.placeId,
          place_name:     note.placeName,
          place_category: note.placeCategory,
          place_icon:     note.placeIcon,
          note_text:      note.noteText,
          updated_at:     note.updatedAt,
        },
        { onConflict: "user_id,place_id" }
      );
    } catch (e) {
      console.error("[notesStorage] Supabase upsert failed:", e);
    }
  }
}

/**
 * Delete a note.
 * Removes from localStorage immediately; also deletes from Supabase when userId supplied.
 */
export async function deleteNote(placeId: string, userId?: string): Promise<void> {
  lsSave(lsLoad().filter(n => n.placeId !== placeId));
  if (userId) {
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.from("notes")
        .delete()
        .eq("user_id", userId)
        .eq("place_id", placeId);
    } catch {}
  }
}

/**
 * Sync notes from Supabase into localStorage on login.
 * Remote wins for any place that appears in both.
 */
export async function syncNotesFromRemote(userId: string): Promise<void> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", userId);
    if (!data?.length) return;

    const remote: FacilityNote[] = data.map((r: Record<string, unknown>) => ({
      placeId:       r.place_id,
      placeName:     r.place_name     ?? "",
      placeCategory: r.place_category ?? "",
      placeIcon:     r.place_icon     ?? "📍",
      noteText:      r.note_text,
      updatedAt:     r.updated_at,
    }));

    const local = lsLoad().filter(l => !remote.find(r => r.placeId === l.placeId));
    lsSave([...remote, ...local]);
  } catch {}
}
