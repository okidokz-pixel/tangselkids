"use client";

import { useState, useEffect, useCallback } from "react";
import { ActionButton } from "./ActionButton";
import { useLang } from "@/context/LanguageContext";

/**
 * OTP resend control: shows a countdown ("Kirim ulang kode dalam 0:30"),
 * then a tappable "Kirim ulang kode" button once it reaches zero.
 *
 * `onResend` should re-trigger the OTP send (and typically clear the inputs).
 * The countdown restarts after each successful resend.
 *
 * `resetKey` — bump/change this value to restart the countdown from the parent
 * (e.g. when the OTP step is first shown). Optional.
 */
export function OtpResend({
  seconds = 30,
  onResend,
  resetKey,
}: {
  seconds?: number;
  onResend: () => Promise<unknown> | unknown;
  resetKey?: string | number;
}) {
  const { lang } = useLang();
  const [remaining, setRemaining] = useState(seconds);
  const [sending, setSending] = useState(false);

  // Restart the countdown whenever resetKey changes
  useEffect(() => {
    setRemaining(seconds);
  }, [resetKey, seconds]);

  // Tick down once per second
  useEffect(() => {
    if (remaining <= 0) return;
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining]);

  const handleResend = useCallback(async () => {
    if (remaining > 0 || sending) return;
    setSending(true);
    try {
      await onResend();
      setRemaining(seconds);
    } finally {
      setSending(false);
    }
  }, [remaining, sending, onResend, seconds]);

  const mmss = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`;

  const txt =
    lang === "en"
      ? { waiting: `Resend code in ${mmss}`, ready: "Resend code", sending: "Sending…" }
      : { waiting: `Kirim ulang kode dalam ${mmss}`, ready: "Kirim ulang kode", sending: "Mengirim…" };

  return (
    <div style={{ textAlign: "center", marginTop: 16 }}>
      {remaining > 0 ? (
        <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>{txt.waiting}</span>
      ) : (
        <ActionButton
          onClick={() => { void handleResend(); }}
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: sending ? "#94a3b8" : "#1f6b43",
          }}
        >
          {sending ? txt.sending : txt.ready}
        </ActionButton>
      )}
    </div>
  );
}
