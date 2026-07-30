import { NextRequest, NextResponse } from "next/server";
import { sendOtp, toMsisdn } from "@/lib/otpspace";

export const runtime = "nodejs";

/**
 * Public endpoint — send a WhatsApp OTP via OTP Space. Called by the register /
 * login sheets (AuthContext.sendOtp). Returns 200 on success; the error message
 * is already localised for the UI.
 */
export async function POST(req: NextRequest) {
  let phone = "";
  try { const b = await req.json(); phone = typeof b?.phone === "string" ? b.phone : ""; } catch { /* ignore */ }

  const msisdn = toMsisdn(phone);
  if (msisdn.length < 10) {
    return NextResponse.json({ error: "Nomor tidak valid." }, { status: 400 });
  }

  const r = await sendOtp(msisdn);
  if (!r.ok) {
    // `detail` is a temporary diagnostic for the OTP Space connectivity issue.
    return NextResponse.json({ error: r.error, detail: r.detail }, { status: r.status });
  }
  return NextResponse.json({ ok: true });
}
