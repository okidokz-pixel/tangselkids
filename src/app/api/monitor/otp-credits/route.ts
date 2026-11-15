import { NextRequest, NextResponse } from "next/server";
import { otpWindow } from "@/lib/otp-events";
import { notifyOwner } from "@/lib/notify";
import { kvGet, kvSet } from "@/lib/kv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * OTP delivery / credit guard (Vercel Cron, every 6h).
 * Fazpass (current provider) has no public balance endpoint, so we watch actual
 * delivery health from otp_events over the last 24h — a spike in send-failures is
 * the real "OTP is breaking" signal (and the symptom of running out of credits).
 * If OTP Space is in use, we also read its /account/balance and warn when low.
 */

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

async function otpSpaceBalance(): Promise<number | null> {
  const key = process.env.OTPSPACE_API_KEY;
  if (!key || !/^sk_/.test(key)) return null;
  try {
    const res = await fetch("https://api.otpspace.com/v1/account/balance", {
      headers: { Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const j = await res.json().catch(() => ({}));
    const b = (j as Record<string, unknown>).balance ?? (j as Record<string, unknown>).credit ?? (j as Record<string, unknown>).amount;
    return typeof b === "number" ? b : null;
  } catch { return null; }
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const w = await otpWindow(24 * 60); // last 24h
  const failRate = w.sends > 0 ? w.sendErrors / w.sends : 0;
  const spaceBalance = await otpSpaceBalance();

  const problems: string[] = [];
  if (w.sends >= 5 && failRate > 0.4)
    problems.push(`Pengiriman OTP banyak gagal: ${w.sendErrors}/${w.sends} gagal (24 jam).`);
  if (spaceBalance !== null && spaceBalance < 10000)
    problems.push(`Saldo OTP Space rendah: ${spaceBalance}.`);

  const stateKey = problems.join(" | ");
  const prev = (await kvGet("monitor:otp_credits")) ?? "";
  let action = "none";

  if (problems.length && stateKey !== prev) {
    action = "alerted";
    await notifyOwner(
      "🟠 TangselKids: cek OTP (registrasi)",
      problems.join("\n") +
        `\n\nPengiriman 24 jam: ${w.sends} kirim, ${w.sendErrors} gagal, ${w.verifies} terverifikasi.` +
        `\nProvider aktif: Fazpass (tidak ada API saldo — dipantau lewat keberhasilan kirim).`,
    );
  } else if (!problems.length && prev) {
    action = "recovered";
    await notifyOwner("🟢 TangselKids: OTP normal kembali", "Pengiriman OTP sudah normal.");
  }

  await kvSet("monitor:otp_credits", stateKey);

  return NextResponse.json({ ...w, failRate: Number(failRate.toFixed(2)), spaceBalance, problems, action });
}
