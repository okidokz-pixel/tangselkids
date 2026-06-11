import { NextRequest, NextResponse } from "next/server";

/**
 * Simple in-memory rate limiter (fixed window), keyed by client IP.
 *
 * ⚠️ Limitation: state lives in this server instance's memory only. On Vercel,
 * each serverless instance has its own counter and memory resets on cold start,
 * so this stops casual floods but is NOT a hard guarantee across instances.
 * TODO: upgrade to Upstash Redis for a shared, durable limit (see memory note).
 */

type Hit = { count: number; resetAt: number };
const buckets = new Map<string, Hit>();

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/** Drop expired entries so the Map can't grow without bound. */
function sweep(now: number) {
  for (const [k, v] of buckets) {
    if (now > v.resetAt) buckets.delete(k);
  }
}

/**
 * Returns null if the request is allowed, or a ready-to-return 429 response
 * if the caller has exceeded `limit` requests within `windowMs`.
 *
 *   const limited = rateLimit(req, { limit: 6, windowMs: 60_000, key: "submit" });
 *   if (limited) return limited;
 */
export function rateLimit(
  req: NextRequest,
  opts: { limit: number; windowMs: number; key: string },
): NextResponse | null {
  const now = Date.now();
  if (buckets.size > 5000) sweep(now);

  const bucketKey = `${opts.key}:${getClientIp(req)}`;
  const hit = buckets.get(bucketKey);

  if (!hit || now > hit.resetAt) {
    buckets.set(bucketKey, { count: 1, resetAt: now + opts.windowMs });
    return null;
  }

  if (hit.count >= opts.limit) {
    const retryAfter = Math.ceil((hit.resetAt - now) / 1000);
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Coba lagi sebentar." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  hit.count++;
  return null;
}
