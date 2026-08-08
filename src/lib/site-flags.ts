import { unstable_cache } from "next/cache";
import { supabaseAdmin } from "./supabase-admin";

/**
 * DB-backed site banner (the OTP announcement / kill-switch).
 * Lives in the `site_flags` table so it can be toggled WITHOUT a deploy — the
 * health monitor raises/clears it automatically, and you can set it by hand too.
 *
 *   tone   'ok'   → green  (all-clear / info)
 *          'warn' → amber  (outage / maintenance)
 *   source 'manual' → set by a human    (monitor won't auto-clear it)
 *          'auto'   → set by the monitor (monitor owns it end-to-end)
 */

export type Banner = {
  on: boolean;
  message: string;
  tone: "ok" | "warn";
  source: "manual" | "auto";
};

const FALLBACK: Banner = { on: false, message: "", tone: "ok", source: "manual" };

async function readOtpBanner(): Promise<Banner> {
  try {
    const { data, error } = await supabaseAdmin
      .from("site_flags")
      .select("bool_value,message,tone,source")
      .eq("key", "otp_banner")
      .single();
    if (error || !data) return FALLBACK;
    return {
      on: !!data.bool_value,
      message: data.message ?? "",
      tone: data.tone === "warn" ? "warn" : "ok",
      source: data.source === "auto" ? "auto" : "manual",
    };
  } catch {
    return FALLBACK;
  }
}

/**
 * Cached read for the root layout — at most one DB hit per 60s across all
 * traffic, and if the table/env isn't there yet it safely returns "no banner"
 * rather than breaking the page.
 */
export const getOtpBanner = unstable_cache(readOtpBanner, ["otp-banner"], {
  revalidate: 60,
  tags: ["otp-banner"],
});

/** Uncached read — the monitor needs the live value to decide. */
export async function getOtpBannerFresh(): Promise<Banner> {
  return readOtpBanner();
}

/**
 * Update the banner. The root layout re-reads it within its 60s cache window,
 * so a monitor flip becomes visible to users in at most a minute.
 */
export async function setOtpBanner(patch: {
  on: boolean;
  message?: string;
  tone?: "ok" | "warn";
  source: "manual" | "auto";
}): Promise<void> {
  await supabaseAdmin
    .from("site_flags")
    .update({
      bool_value: patch.on,
      ...(patch.message !== undefined ? { message: patch.message } : {}),
      ...(patch.tone !== undefined ? { tone: patch.tone } : {}),
      source: patch.source,
      updated_at: new Date().toISOString(),
    })
    .eq("key", "otp_banner");
}
