"use client";
import { createBrowserClient } from "@supabase/ssr";

/** @deprecated Use getSupabaseBrowserClient() singleton instead */
export function createAdminClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!,
  );
}

let _client: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Singleton browser Supabase client.
 * Use this everywhere in client components — single instance avoids
 * duplicate session listeners and is required for correct auth state.
 */
export function getSupabaseBrowserClient() {
  if (!_client) {
    _client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_KEY!,
    );
  }
  return _client;
}
