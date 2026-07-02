import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role admin client. Created LAZILY on first use — not at module load —
 * so merely importing this file never instantiates a client. That matters during
 * `next build`'s "collect page data" phase, where route modules are evaluated but
 * env vars may not be inlined yet: an eager `createClient(undefined!, …)` throws
 * "supabaseUrl is required" and hard-fails the whole build. Deferring to runtime
 * (where the env vars exist) keeps the build green.
 *
 * Exposed as a Proxy so every existing call site (`supabaseAdmin.from(…)`,
 * `supabaseAdmin.storage…`) keeps working unchanged.
 */
let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
  }
  return _client;
}

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
