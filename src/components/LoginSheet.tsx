"use client";
import { useState, useRef, useEffect } from "react";
import { X, ChevronLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLoginSheet } from "@/context/LoginSheetContext";
import { useRegisterSheet } from "@/context/RegisterSheetContext";
import { useLang } from "@/context/LanguageContext";
import { ActionButton } from "./ActionButton";

type Step = "phone" | "otp" | "notfound" | "done";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "13px 14px", borderRadius: 14, fontSize: 15,
  border: "1.5px solid #e2e8f0", background: "#f8fafc", outline: "none",
  fontFamily: "var(--font-jakarta, sans-serif)", color: "#0f172a", boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, letterSpacing: 1.1, textTransform: "uppercase",
  color: "#94a3b8", marginBottom: 6, display: "block",
};

const errorStyle: React.CSSProperties = {
  fontSize: 12, color: "#ef4444", marginTop: 4, fontFamily: "var(--font-jakarta, sans-serif)",
};

const titleStyle: React.CSSProperties = {
  fontFamily: "var(--font-fraunces), Georgia, serif",
  fontSize: 22, fontWeight: 700, color: "#0f172a", margin: "0 0 4px",
};

const subtitleStyle: React.CSSProperties = {
  fontSize: 13, color: "#64748b", margin: "0 0 24px", lineHeight: 1.5,
};

export function LoginSheet() {
  const { login } = useAuth();
  const { isOpen, closeLoginSheet } = useLoginSheet();
  const { openRegisterSheet } = useRegisterSheet();
  const { t } = useLang();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [otpError, setOtpError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setStep("phone");
        setPhone("");
        setOtp(["", "", "", ""]);
        setOtpError("");
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (step === "otp") {
      const timer = setTimeout(() => otpRefs.current[0]?.focus(), 80);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const phoneDigits = phone.replace(/\D/g, "");
  const phoneReady  = phoneDigits.length >= 7;

  function handleSendOtp() {
    if (!phoneReady) return;
    setStep("otp");
    setOtp(["", "", "", ""]);
    setOtpError("");
  }

  function handleOtpChange(idx: number, val: string) {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    setOtpError("");
    if (val && idx < 3) requestAnimationFrame(() => otpRefs.current[idx + 1]?.focus());
    if (idx === 3 && val) {
      const full = [...next];
      if (full.every(d => d !== "")) {
        setOtpError("");
        verifyLogin(full);
      }
    }
  }

  function handleOtpKeyDown(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  }

  function verifyLogin(digits = otp) {
    if (digits.join("").length < 4) {
      setOtpError(t.loginOtpError);
      return;
    }
    const found = login(phone);
    if (found) {
      setStep("done");
      setTimeout(() => closeLoginSheet(), 2000);
    } else {
      setStep("notfound");
    }
  }

  function handleVerifyOtp() {
    verifyLogin();
  }

  function handleSwitchToRegister() {
    closeLoginSheet();
    setTimeout(() => openRegisterSheet(), 200);
  }

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes ls-fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes ls-popIn   { 0% { opacity:0; transform:scale(0.4); } 65% { transform:scale(1.12); } 85% { transform:scale(0.96); } 100% { opacity:1; transform:scale(1); } }
        @keyframes ls-fadeUp  { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={closeLoginSheet}
        style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.55)",
          animation: "ls-fadeIn 0.25s ease both",
        }}
      />

      {/* Sheet */}
      <div
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          maxWidth: 448, margin: "0 auto",
          background: step === "done" ? "#0a2018" : "#fff",
          borderRadius: "28px 28px 0 0",
          zIndex: 1001,
          boxShadow: "0 -8px 40px rgba(0,0,0,0.30)",
          animation: "sheet-slide-up 0.38s cubic-bezier(0.32, 0.72, 0, 1) both",
          fontFamily: "var(--font-jakarta, sans-serif)",
        }}
      >
        {/* ── DONE step ─────────────────────────────────────────────── */}
        {step === "done" && (
          <div style={{
            padding: "60px 40px 80px",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            minHeight: 260,
          }}>
            <div style={{
              width: 88, height: 88, borderRadius: 999,
              background: "linear-gradient(135deg, #128c7e, #25d366)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 42, lineHeight: 1,
              boxShadow: "0 16px 40px rgba(37,211,102,0.40)",
              animation: "ls-popIn 0.55s cubic-bezier(0.175, 0.885, 0.32, 1.275) both",
            }}>
              👋
            </div>
            <h2 style={{
              fontFamily: "var(--font-fraunces), Georgia, serif",
              fontSize: 26, fontWeight: 700, color: "#fff",
              margin: "22px 0 8px", textAlign: "center", letterSpacing: -0.5,
              animation: "ls-fadeUp 0.5s ease 0.4s both",
            }}>
              {t.loginSuccess}
            </h2>
            <p style={{
              fontSize: 14, color: "rgba(255,255,255,0.65)",
              textAlign: "center", lineHeight: 1.55, margin: 0,
              animation: "ls-fadeUp 0.5s ease 0.55s both",
            }}>
              Selamat datang kembali di TangselKids!
            </p>
          </div>
        )}

        {/* ── All other steps ─────────────────────────────────────── */}
        {step !== "done" && (
          <>
            {/* Drag handle + close */}
            <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 0", position: "relative" }}>
              <div style={{ width: 40, height: 4, borderRadius: 999, background: "#e2e8f0" }} />
              <ActionButton
                onClick={closeLoginSheet}
                style={{
                  position: "absolute", right: 16, top: 10,
                  width: 32, height: 32, borderRadius: 999,
                  background: "#f1f5f9", display: "flex",
                  alignItems: "center", justifyContent: "center",
                }}
              >
                <X size={16} color="#64748b" strokeWidth={2.5} />
              </ActionButton>
            </div>

            {/* ── PHONE STEP ─────────────────────────────────────────── */}
            {step === "phone" && (
              <div style={{ padding: "20px 24px 44px" }}>
                <h2 style={titleStyle}>{t.loginTitle}</h2>
                <p style={subtitleStyle}>{t.loginSubtitle}</p>

                <label style={labelStyle}>{t.loginPhoneLabel}</label>
                <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                  <div style={{
                    padding: "13px 14px", borderRadius: 14, border: "1.5px solid #e2e8f0",
                    background: "#f1f5f9", fontSize: 15, fontWeight: 700, color: "#0f172a",
                    flexShrink: 0, display: "flex", alignItems: "center",
                  }}>
                    🇮🇩 +62
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="8xxxxxxxxxx"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/[^\d-]/g, ""))}
                    onKeyDown={e => e.key === "Enter" && handleSendOtp()}
                    style={{ ...inputStyle, flex: 1 }}
                    autoFocus
                    autoComplete="tel"
                  />
                </div>

                <ActionButton
                  onClick={handleSendOtp}
                  style={{
                    display: "block", width: "100%", textAlign: "center",
                    padding: "16px 20px", borderRadius: 18, marginTop: 20,
                    background: phoneReady
                      ? "linear-gradient(135deg, #128c7e, #25d366)"
                      : "#e2e8f0",
                    color: phoneReady ? "#fff" : "#94a3b8",
                    fontWeight: 700, fontSize: 15,
                    boxShadow: phoneReady ? "0 8px 24px rgba(37,211,102,0.35)" : "none",
                  }}
                >
                  {t.loginSendOtp}
                </ActionButton>

                <p style={{ fontSize: 11, color: "#94a3b8", textAlign: "center", marginTop: 16 }}>
                  {t.loginNoAccount}{" "}
                  <ActionButton
                    onClick={handleSwitchToRegister}
                    style={{ color: "#2e8a5a", fontWeight: 700, textDecoration: "underline", display: "inline" }}
                  >
                    {t.loginCreateAccount}
                  </ActionButton>
                </p>
              </div>
            )}

            {/* ── OTP STEP ───────────────────────────────────────────── */}
            {step === "otp" && (
              <div style={{ padding: "20px 24px 44px", minHeight: 340 }}>
                <ActionButton
                  onClick={() => setStep("phone")}
                  style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 20 }}
                >
                  <ChevronLeft size={16} strokeWidth={2.5} /> {t.loginBack}
                </ActionButton>
                <h2 style={titleStyle}>{t.loginOtpTitle}</h2>
                <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 4px", lineHeight: 1.5 }}>
                  {t.loginOtpSubtitle}{" "}
                  <span style={{ fontWeight: 700, color: "#0f172a" }}>+62{phone}</span>
                </p>
                <p style={{ fontSize: 11.5, color: "#f59e0b", margin: "0 0 24px", fontWeight: 600 }}>
                  Demo: masukkan kode apapun (4 digit)
                </p>

                <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 8 }}>
                  {[0, 1, 2, 3].map((i) => (
                    <input
                      key={i}
                      ref={el => { otpRefs.current[i] = el; }}
                      type="tel"
                      inputMode="numeric"
                      maxLength={1}
                      value={otp[i]}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      style={{
                        width: 54, height: 60, textAlign: "center", fontSize: 26, fontWeight: 700,
                        borderRadius: 14, outline: "none", boxSizing: "border-box",
                        border: otp[i] ? "2px solid var(--tk-accent, #2e8a5a)" : "2px solid #e2e8f0",
                        background: otp[i] ? "var(--tk-accent-pale, #e6f4ed)" : "#f8fafc",
                        color: "#0e1d4f",
                        fontFamily: "var(--font-jakarta, sans-serif)",
                        transition: "border-color 0.15s, background 0.15s",
                      }}
                    />
                  ))}
                </div>

                <p style={{ ...errorStyle, textAlign: "center", marginBottom: 16, visibility: otpError ? "visible" : "hidden" }}>
                  {otpError || "placeholder"}
                </p>

                <ActionButton
                  onClick={handleVerifyOtp}
                  style={{
                    display: "block", width: "100%", textAlign: "center",
                    padding: "16px 20px", borderRadius: 18,
                    background: "linear-gradient(135deg, #1f6b43, #2e8a5a)",
                    color: "#fff", fontWeight: 700, fontSize: 15,
                    boxShadow: "0 8px 24px rgba(30,107,67,0.35)",
                  }}
                >
                  {t.loginOtpBtn}
                </ActionButton>
              </div>
            )}

            {/* ── NOT FOUND STEP ─────────────────────────────────────── */}
            {step === "notfound" && (
              <div style={{ padding: "28px 24px 48px", textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 14 }}>🔍</div>
                <h2 style={{ ...titleStyle, textAlign: "center", marginBottom: 8 }}>
                  {t.loginNotFoundTitle}
                </h2>
                <p style={{ fontSize: 13, color: "#64748b", marginBottom: 28, lineHeight: 1.6 }}>
                  {t.loginNotFoundSubtitle}
                </p>
                <ActionButton
                  onClick={handleSwitchToRegister}
                  style={{
                    display: "block", width: "100%", textAlign: "center",
                    padding: "16px 20px", borderRadius: 18, marginBottom: 12,
                    background: "linear-gradient(135deg, #128c7e, #25d366)",
                    color: "#fff", fontWeight: 700, fontSize: 15,
                    boxShadow: "0 8px 24px rgba(37,211,102,0.35)",
                  }}
                >
                  {t.loginRegisterLink}
                </ActionButton>
                <ActionButton
                  onClick={() => setStep("phone")}
                  style={{
                    display: "block", width: "100%", textAlign: "center",
                    padding: "16px 20px", borderRadius: 18,
                    background: "#f1f5f9", color: "#0f172a",
                    fontWeight: 700, fontSize: 15,
                  }}
                >
                  {t.loginBack}
                </ActionButton>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
