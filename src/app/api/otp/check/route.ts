import { NextRequest, NextResponse } from "next/server";
import { verifyOtp, toMsisdn } from "@/lib/otpspace";
import { mintSessionForPhone } from "@/lib/otpAuth";

export const runtime = "nodejs";

/**
 * Public endpoint — verify the OTP the user entered, and on success mint a real
 * Supabase session. Called by AuthContext.verifyOtp. Response:
 *   { access_token, refresh_token, isNewUser }   (client calls setSession)
 * A valid code is the auth proof — no other credential is required.
 */
export async function POST(req: NextRequest) {
  let phone = "", code = "";
  try {
    const b = await req.json();
    phone = String(b?.phone ?? "");
    code  = String(b?.code ?? "").replace(/\D/g, "");
  } catch { /* ignore */ }

  const msisdn = toMsisdn(phone);
  if (msisdn.length < 10 || code.length < 4) {
    return NextResponse.json({ error: "Input tidak valid." }, { status: 400 });
  }

  // 1) Verify the code with OTP Space.
  const v = await verifyOtp(msisdn, code);
  if (!v.ok) {
    return NextResponse.json({ error: v.error }, { status: v.status >= 500 ? 502 : 401 });
  }

  // 2) Turn the proven phone into a Supabase session.
  const m = await mintSessionForPhone(msisdn);
  if (!m.ok) {
    console.error("[otp/check] session mint failed:", m.error);
    return NextResponse.json({ error: "Gagal membuat sesi. Coba lagi." }, { status: 500 });
  }

  return NextResponse.json({
    access_token:  m.accessToken,
    refresh_token: m.refreshToken,
    isNewUser:     m.isNewUser,
  });
}
