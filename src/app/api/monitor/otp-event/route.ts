import { NextRequest, NextResponse } from "next/server";
import { logOtpEvent } from "@/lib/otp-events";

export const runtime = "nodejs";

/**
 * Public, fire-and-forget endpoint the client calls to record an OTP *verify*
 * outcome (send outcomes are logged server-side in the delivery routes). It only
 * ever writes a `verify` row, so the worst a bad actor could do is add noise to
 * the health funnel — no data is exposed or mutated.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ok = !!body?.ok;
    const provider = typeof body?.provider === "string" ? body.provider : undefined;
    await logOtpEvent("verify", ok, provider);
  } catch {
    /* ignore — never let telemetry surface an error to the user */
  }
  return NextResponse.json({ ok: true });
}
