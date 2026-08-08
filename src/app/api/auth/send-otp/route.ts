import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { logOtpEvent } from "@/lib/otp-events";

/**
 * Supabase Auth Hook — "Send SMS"
 *
 * Wire this up in Supabase Dashboard:
 *   Authentication → Hooks → Send SMS
 *   URL:    https://tangselkids.com/api/auth/send-otp
 *   Secret: value of SUPABASE_HOOK_SECRET in .env.local
 *           Format: v1,whsec_<base64_encoded_secret>
 *
 * Supabase POSTs: { user: { phone: "+628xxx", ... }, sms: { otp: "123456" } }
 * We forward the OTP to the user via Fazpass WhatsApp (client-created OTP mode).
 *
 * Signature follows Standard Webhooks spec:
 *   Header:  webhook-signature: v1,<base64_hmac>
 *   Signed:  <webhook-id>.<webhook-timestamp>.<body>
 *   Key:     base64-decoded bytes from whsec_ value
 */

/** Normalise any phone form (081…, 6281…, +6281…) to E.164 "+6281…". */
function toE164(raw: string): string {
  const digits = raw.replace(/\D/g, "");        // strip + and non-digits
  if (digits.startsWith("62")) return "+" + digits;
  if (digits.startsWith("0"))  return "+62" + digits.slice(1);
  if (digits.startsWith("8"))  return "+62" + digits;
  return "+" + digits;
}

function verifyStandardWebhookSignature(
  rawBody: string,
  headers: Headers,
  secret: string,
): boolean {
  // Parse the secret: strip optional "v1,whsec_" prefix, base64-decode to bytes
  const whsecValue = secret.replace(/^v1,whsec_/, "");
  const keyBytes = Buffer.from(whsecValue, "base64");

  const msgId        = headers.get("webhook-id") ?? "";
  const msgTimestamp = headers.get("webhook-timestamp") ?? "";
  const msgSig       = headers.get("webhook-signature") ?? "";

  if (!msgId || !msgTimestamp || !msgSig) return false;

  // Reject timestamps older than 5 minutes (replay protection)
  const ts = parseInt(msgTimestamp, 10);
  if (isNaN(ts) || Math.abs(Date.now() / 1000 - ts) > 300) return false;

  // Compute expected HMAC
  const signedContent = `${msgId}.${msgTimestamp}.${rawBody}`;
  const hmac = createHmac("sha256", keyBytes).update(signedContent).digest("base64");

  // webhook-signature may contain multiple space-separated "v1,<base64>" sigs
  const receivedSigs = msgSig.split(" ").map(s => s.replace(/^v1,/, ""));
  const expectedBuf  = Buffer.from(hmac, "base64");

  return receivedSigs.some(sig => {
    try {
      const sigBuf = Buffer.from(sig, "base64");
      return sigBuf.length === expectedBuf.length &&
             timingSafeEqual(sigBuf, expectedBuf);
    } catch { return false; }
  });
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  // ── 1. Verify Supabase Standard Webhooks signature ────────────────────────
  const hookSecret = process.env.SUPABASE_HOOK_SECRET;
  if (hookSecret) {
    const valid = verifyStandardWebhookSignature(rawBody, request.headers, hookSecret);
    if (!valid) {
      console.warn("[send-otp] Invalid webhook signature — possible spoofed request");
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

  // Send E.164 (+62…). Supabase gives "62818358700" (no +); Fazpass accepts +62.
  const fazpassPhone = toE164(phone);

  try {
    const res = await fetch("https://api.fazpass.com/v1/otp/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone: fazpassPhone, otp, gateway_key: gatewayKey }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error("[send-otp] Fazpass error:", res.status, JSON.stringify(data));
      await logOtpEvent("send", false, "fazpass", String(res.status));
      return NextResponse.json({ error: "Failed to deliver OTP" }, { status: 502 });
    }

    await logOtpEvent("send", true, "fazpass");

    // Never log the OTP code or full phone number. Keep only delivery diagnostics.
    const maskedPhone = fazpassPhone.replace(/^(\+?\d{2})\d+(\d{4})$/, "$1****$2");
    console.log(
      "[send-otp] Fazpass accepted | phone:", maskedPhone,
      "| status:", data?.status,
      "| provider:", data?.data?.provider ?? "n/a",
      "| purpose:", data?.data?.purpose ?? "n/a",
      "| ref:", data?.data?.id ?? "n/a",
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[send-otp] Network error calling Fazpass:", err);
    await logOtpEvent("send", false, "fazpass", "network");
    return NextResponse.json({ error: "Network error" }, { status: 502 });
  }
}
