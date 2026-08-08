import { supabaseAdmin } from "./supabase-admin";

/**
 * OTP telemetry — a tiny append-only log the health monitor reads.
 * `send`  rows are written server-side (the Fazpass hook / OTP Space start route),
 * `verify` rows are written from the client after a code is entered.
 * Every function here swallows its own errors: monitoring must NEVER break OTP.
 */

export type OtpKind = "send" | "verify";

/** Record one OTP attempt. Fire-and-forget — never throws. */
export async function logOtpEvent(
  kind: OtpKind,
  ok: boolean,
  provider?: string,
  detail?: string,
): Promise<void> {
  try {
    await supabaseAdmin.from("otp_events").insert({
      kind,
      ok,
      provider: provider ?? null,
      detail: detail ?? null,
    });
  } catch (e) {
    console.warn("[otp-events] log failed:", e);
  }
}

export type OtpWindow = { sends: number; sendErrors: number; verifies: number };

/** Aggregate OTP events over the last `minutes`. Never throws (returns zeros). */
export async function otpWindow(minutes: number): Promise<OtpWindow> {
  const since = new Date(Date.now() - minutes * 60_000).toISOString();
  try {
    const { data, error } = await supabaseAdmin
      .from("otp_events")
      .select("kind,ok")
      .gte("ts", since);
    if (error) throw error;
    const rows = data ?? [];
    return {
      sends: rows.filter((r) => r.kind === "send").length,
      sendErrors: rows.filter((r) => r.kind === "send" && !r.ok).length,
      verifies: rows.filter((r) => r.kind === "verify" && r.ok).length,
    };
  } catch (e) {
    console.warn("[otp-events] window query failed:", e);
    return { sends: 0, sendErrors: 0, verifies: 0 };
  }
}
