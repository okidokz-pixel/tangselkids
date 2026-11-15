import { supabaseAdmin } from "./supabase-admin";

/**
 * Tiny key-value store backed by a private Supabase Storage bucket ("bot-kv").
 * We use Storage (not a table) because we can't run DDL to create a table — the
 * service role CAN read/write Storage objects. Bot + monitor + pending-edit state
 * live here under namespaced keys (e.g. "bot:owner_chat", "pe:<token>").
 */

const BUCKET = "bot-kv";
const path = (key: string) => `${key.replace(/[^a-zA-Z0-9._-]/g, "_")}.txt`;

export async function kvGet(key: string): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin.storage.from(BUCKET).download(path(key));
    if (error || !data) return null;
    return await data.text();
  } catch { return null; }
}

export async function kvGetJSON<T>(key: string): Promise<T | null> {
  const raw = await kvGet(key);
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

export async function kvSet(key: string, value: string): Promise<void> {
  try {
    await supabaseAdmin.storage.from(BUCKET).upload(path(key), new Blob([value], { type: "text/plain" }), {
      upsert: true, contentType: "text/plain",
    });
  } catch (e) { console.warn("[kv] set failed:", e); }
}

export async function kvSetJSON(key: string, value: unknown): Promise<void> {
  await kvSet(key, JSON.stringify(value));
}

export async function kvDel(key: string): Promise<void> {
  try { await supabaseAdmin.storage.from(BUCKET).remove([path(key)]); } catch { /* ignore */ }
}

/** List keys under a prefix (best-effort; used rarely). */
export async function kvList(prefix: string): Promise<{ key: string; value: string }[]> {
  try {
    const { data } = await supabaseAdmin.storage.from(BUCKET).list("", { limit: 1000 });
    const safe = prefix.replace(/[^a-zA-Z0-9._-]/g, "_");
    const files = (data ?? []).filter((f) => f.name.startsWith(safe));
    const out: { key: string; value: string }[] = [];
    for (const f of files) {
      const { data: blob } = await supabaseAdmin.storage.from(BUCKET).download(f.name);
      out.push({ key: f.name.replace(/\.txt$/, ""), value: blob ? await blob.text() : "" });
    }
    return out;
  } catch { return []; }
}
