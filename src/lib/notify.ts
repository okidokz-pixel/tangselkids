/**
 * Alerting — send an email via Resend (https://resend.com).
 * No-ops with a log line if RESEND_API_KEY isn't set, and never throws, so a
 * mail hiccup can't take down the monitor route that calls it.
 */
export async function sendAlertEmail(subject: string, body: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.ALERT_EMAIL_TO || "minisite911@gmail.com";
  const from = process.env.ALERT_EMAIL_FROM || "TangselKids Monitor <onboarding@resend.dev>";

  if (!key) {
    console.warn("[notify] RESEND_API_KEY not set — skipping email:", subject);
    return;
  }

  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        text: body,
        html: `<div style="font-family:system-ui,sans-serif;font-size:14px;line-height:1.55;white-space:pre-wrap">${esc(body)}</div>`,
      }),
    });
    if (!res.ok) {
      console.error("[notify] Resend error:", res.status, await res.text().catch(() => ""));
    }
  } catch (e) {
    console.error("[notify] email failed:", e);
  }
}
