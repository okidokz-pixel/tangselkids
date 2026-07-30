/**
 * OTP Space client (server-only) — WhatsApp OTP delivery + verification.
 *
 * Replaces the old Supabase Send-SMS hook → Fazpass path. OTP Space owns the
 * OTP lifecycle: it generates the code, sends it over WhatsApp, and verifies it.
 * We never see the code. Docs: https://otpspace.com  (POST /v1/otp/send, /verify)
 *
 * The app's phone auth is unchanged from the user's POV — see src/lib/otpAuth.ts
 * for how a verified phone is turned into a real Supabase session.
 */

const BASE = "https://api.otpspace.com/v1";

/** Normalise any phone form (081…, +6281…, 8123…) to bare MSISDN "6281…". */
export function toMsisdn(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (d.startsWith("62")) return d;
  if (d.startsWith("0"))  return "62" + d.slice(1);
  if (d.startsWith("8"))  return "62" + d;
  return d;
}

type SendResult   = { ok: true; otpId: string } | { ok: false; status: number; error: string };
type VerifyResult = { ok: true } | { ok: false; status: number; error: string };

async function call(path: string, body: Record<string, unknown>) {
  const key = (process.env.OTPSPACE_API_KEY ?? "").trim();
  if (!key) {
    console.error("[otpspace] OTPSPACE_API_KEY is missing/empty at runtime");
    return { keyMissing: true as const };
  }
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return { res, data } as { res: Response; data: Record<string, unknown> & { data?: Record<string, unknown> } };
  } catch (e) {
    console.error("[otpspace] network error calling", path, ":", e);
    return { networkError: true as const };
  }
}

/** Map an OTP Space error status to a user-facing Indonesian message. */
function sendErrorMessage(status: number): string {
  switch (status) {
    case 422: return "Nomor ini tidak terdaftar di WhatsApp.";
    case 429: return "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.";
    case 402: return "Layanan OTP sedang bermasalah. Coba lagi nanti.";
    default:  return "Gagal mengirim kode. Coba lagi.";
  }
}

function verifyErrorMessage(status: number): string {
  switch (status) {
    case 410: return "Kode sudah kedaluwarsa. Minta kode baru.";
    case 429: return "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.";
    default:  return "Kode salah atau sudah kedaluwarsa.";
  }
}

/** Send an OTP over WhatsApp to `phone` (any format — normalised internally). */
export async function sendOtp(phone: string): Promise<SendResult> {
  const r = await call("/otp/send", { phone: toMsisdn(phone) });
  if ("keyMissing" in r)    return { ok: false, status: 503, error: "Layanan OTP belum dikonfigurasi." };
  if ("networkError" in r)  return { ok: false, status: 502, error: "Gagal mengirim kode. Coba lagi." };
  const { res, data } = r;
  if (!res.ok) {
    console.error("[otpspace] send failed:", res.status, JSON.stringify(data));
    return { ok: false, status: res.status, error: sendErrorMessage(res.status) };
  }
  const otpId = (data.data?.otp_id as string) ?? "";
  return { ok: true, otpId };
}

/** Verify the code the user entered. */
export async function verifyOtp(phone: string, code: string): Promise<VerifyResult> {
  const r = await call("/otp/verify", { phone: toMsisdn(phone), code });
  if ("keyMissing" in r)    return { ok: false, status: 503, error: "Layanan OTP belum dikonfigurasi." };
  if ("networkError" in r)  return { ok: false, status: 502, error: "Gagal memverifikasi kode. Coba lagi." };
  const { res, data } = r;
  if (!res.ok) {
    // 400/422 = wrong code, 410 = expired — all "try again" from the UI's view.
    return { ok: false, status: res.status, error: verifyErrorMessage(res.status) };
  }
  const verified = data.data?.status === "verified" || data.success === true;
  return verified ? { ok: true } : { ok: false, status: 422, error: verifyErrorMessage(422) };
}
