import { supabaseAdmin } from "./supabase-admin";

/**
 * Tiny key-value store layered on the existing `site_flags` table (no new table
 * needed / no DDL). Bot + monitor + pending-edit state live here under namespaced
 * keys (e.g. "bot:owner_chat", "pe:<token>"). The banner uses key "otp_banner";
 * we never collide with it. Values are strings — JSON-encode structured data.
 */

export async function kvGet(key: string): Promise<string | null> {
  try {
    const { data } = await supabaseAdmin.from("site_flags").select("message").eq("key", key).maybeSingle();
    return data?.message ?? null;
  } catch { return null; }
}

export async function kvGetJSON<T>(key: string): Promise<T | null> {
  const raw = await kvGet(key);
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

export async function kvSet(key: string, value: string): Promise<void> {
  await supabaseAdmin
    .from("site_flags")
    .upsert({ key, message: value, updated_at: new Date().toISOString() }, { onConflict: "key" });
}

export async function kvSetJSON(key: string, value: unknown): Promise<void> {
  await kvSet(key, JSON.stringify(value));
}

export async function kvDel(key: string): Promise<void> {
  await supabaseAdmin.from("site_flags").delete().eq("key", key);
}

/** List all rows whose key starts with `prefix` (e.g. "pe:"). */
export async function kvList(prefix: string): Promise<{ key: string; value: string }[]> {
  try {
    const { data } = await supabaseAdmin.from("site_flags").select("key,message").like("key", `${prefix}%`);
    return (data ?? []).map((r) => ({ key: r.key as string, value: (r.message as string) ?? "" }));
  } catch { return []; }
}
