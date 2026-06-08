import { createHmac } from "crypto";
import { NextRequest, NextResponse } from "next/server";

/**
 * Supabase Auth Hook — "Send SMS"
 *
 * Wire this up in Supabase Dashboard:
 *   Authentication → Hooks → Send SMS
 *   URL:    https://tangselkids.com/api/auth/send-otp
 *   Secret: value of SUPABASE_HOOK_SECRET in .env.local
 *
 * Supabase POSTs: { user: { phone: "+628xxx", ... }, sms: { otp: "123456" } }
 * We forward the OTP to the user via Fazpass WhatsApp (client-created OTP mode).
 *
 * For local dev: add test phone numbers in Supabase Dashboard →
 *   Authentication → Phone → Test OTP numbers (they bypass this hook).
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  // ── 1. Verify Supabase HMAC signature ─────────────────────────────────────
  const hookSecret = process.env.SUPABASE_HOOK_SECRET;
  if (hookSecret) {
    const sig = (request.headers.get("x-supabase-signature") ?? "")
      .replace(/^sha256=/, "");
    const expected = createHmac("sha256", hookSecret)
      .update(rawBody)
      .digest("hex");
    if (sig !== expected) {
      console.warn("[send-otp] Invalid HMAC — possible spoofed request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else {
    console.warn("[send-otp] SUPABASE_HOOK_SECRET not set — skipping signature check");
  }

  // ── 2. Parse payload ───────────────────────────────────────────────────────
  let phone: string;
  let otp: string;
  try {
    const payload = JSON.parse(rawBody);
    phone = payload.user?.phone ?? "";
    otp   = payload.sms?.otp ?? "";
    if (!phone || !otp) throw new Error("Missing phone or otp in payload");
  } catch (e) {
    console.error("[send-otp] Bad payload:", e);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // ── 3. Deliver via Fazpass WhatsApp ────────────────────────────────────────
  const apiKey     = process.env.FAZPASS_API_KEY;
  const gatewayKey = process.env.FAZPASS_GATEWAY_KEY;

  if (!apiKey || !gatewayKey) {
    console.error("[send-otp] Missing FAZPASS_API_KEY or FAZPASS_GATEWAY_KEY env vars");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  try {
    const res = await fetch("https://api.fazpass.com/v1/otp/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone, otp, gateway_key: gatewayKey }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("[send-otp] Fazpass error:", res.status, err);
      return NextResponse.json({ error: "Failed to deliver OTP" }, { status: 502 });
    }

    const data = await res.json().catch(() => ({}));
    console.log("[send-otp] OTP sent via WhatsApp to", phone, "| ref:", data?.data?.id ?? "n/a");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[send-otp] Network error calling Fazpass:", err);
    return NextResponse.json({ error: "Network error" }, { status: 502 });
  }
}
