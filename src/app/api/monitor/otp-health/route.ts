import { NextRequest, NextResponse } from "next/server";
import { otpWindow } from "@/lib/otp-events";
import { getOtpBannerFresh, setOtpBanner } from "@/lib/site-flags";
import { sendAlertEmail } from "@/lib/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Hourly OTP health check (Vercel Cron → GET this route).
 * Two independent triggers over the trailing 60 minutes:
 *   • hard-down  — ≥3 sends and >50% of them errored (fast provider outage)
 *   • silent     — ≥8 sends but <25% got verified (delivery silently failing)
 * On trouble it raises the amber maintenance banner and emails you; when things
 * recover it clears its own banner and emails an all-clear.
 */

const MAINT_MSG =
  "⚠️ Sistem OTP sedang bermasalah. Pendaftaran/login mungkin terganggu sementara 🙏🏻";

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // no secret configured (e.g. local dev) → allow
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const w = await otpWindow(60);
  const hardDown = w.sends >= 3 && w.sendErrors / w.sends > 0.5;
  const verifyRate = w.sends > 0 ? w.verifies / w.sends : 1;
  const silent = w.sends >= 8 && verifyRate < 0.25;
  const unhealthy = hardDown || silent;

  const flag = await getOtpBannerFresh();
  // A human-set *warning* banner is left untouched (you're driving). A human-set
  // green "all-clear", though, must not stop us flagging a real outage.
  const manualWarnLock = flag.on && flag.source === "manual" && flag.tone === "warn";
  let action = "none";

  if (unhealthy && !manualWarnLock) {
    const alreadyRaised = flag.on && flag.source === "auto";
    if (!alreadyRaised) {
      await setOtpBanner({ on: true, message: MAINT_MSG, tone: "warn", source: "auto" });
      action = "raised";
      await sendAlertEmail(
        "🔴 TangselKids OTP outage detected",
        `The OTP monitor found a problem in the last 60 minutes.\n\n` +
          `Sends:        ${w.sends}\n` +
          `Send errors:  ${w.sendErrors}\n` +
          `Verified:     ${w.verifies}\n` +
          `Verify rate:  ${(verifyRate * 100).toFixed(0)}%\n` +
          `Trigger:      ${hardDown ? "hard errors > 50%" : "verify rate < 25%"}\n\n` +
          `The maintenance banner was raised automatically. Check Fazpass (and OTP Space). ` +
          `It will clear itself and email you again once OTP recovers.`,
      );
    }
  } else if (!unhealthy) {
    if (flag.on && flag.source === "auto") {
      await setOtpBanner({ on: false, source: "auto" });
      action = "cleared";
      await sendAlertEmail(
        "🟢 TangselKids OTP recovered",
        `OTP looks healthy again — verify rate ${(verifyRate * 100).toFixed(0)}% across ` +
          `${w.sends} send(s) in the last 60 minutes. The maintenance banner was removed automatically.`,
      );
    }
  }

  return NextResponse.json({
    ...w,
    verifyRate: Number(verifyRate.toFixed(2)),
    unhealthy,
    hardDown,
    silent,
    action,
    bannerSource: flag.source,
  });
}
