"use client";
import { useState, useRef, useEffect } from "react";
import { X, ChevronLeft, Navigation, Loader, Plus, Camera, User } from "lucide-react";
import { useAuth, type Kid } from "@/context/AuthContext";
import { useRegisterSheet } from "@/context/RegisterSheetContext";
import { useLang } from "@/context/LanguageContext";
import { ActionButton } from "./ActionButton";
import { ImageCropper } from "./ImageCropper";

type Step = "phone" | "otp" | "profile" | "done";

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

const confettiDots = [
  { top: "12%", left: "12%",  size: 10, color: "#fbbf24", dur: 1.2, delay: 0.10 },
  { top: "18%", left: "82%",  size: 7,  color: "#60a5fa", dur: 1.4, delay: 0.20 },
  { top: "8%",  left: "50%",  size: 8,  color: "#f472b6", dur: 1.1, delay: 0.15 },
  { top: "72%", left: "14%",  size: 7,  color: "#34d399", dur: 1.3, delay: 0.30 },
  { top: "68%", left: "82%",  size: 10, color: "#a78bfa", dur: 1.2, delay: 0.25 },
];

const bigConfetti = [
  { top: "8%",  left: "8%",   size: 14, color: "#fbbf24", dur: 1.6, delay: 0.05 },
  { top: "6%",  left: "30%",  size: 10, color: "#f472b6", dur: 1.4, delay: 0.12 },
  { top: "5%",  left: "55%",  size: 12, color: "#60a5fa", dur: 1.5, delay: 0.08 },
  { top: "7%",  left: "78%",  size: 9,  color: "#34d399", dur: 1.3, delay: 0.18 },
  { top: "4%",  left: "92%",  size: 11, color: "#a78bfa", dur: 1.6, delay: 0.22 },
  { top: "20%", left: "3%",   size: 8,  color: "#fb923c", dur: 1.4, delay: 0.30 },
  { top: "22%", left: "94%",  size: 10, color: "#e879f9", dur: 1.5, delay: 0.15 },
  { top: "35%", left: "12%",  size: 7,  color: "#38bdf8", dur: 1.3, delay: 0.25 },
  { top: "38%", left: "86%",  size: 9,  color: "#f87171", dur: 1.4, delay: 0.10 },
  { top: "50%", left: "5%",   size: 11, color: "#4ade80", dur: 1.6, delay: 0.35 },
  { top: "52%", left: "90%",  size: 8,  color: "#fbbf24", dur: 1.3, delay: 0.20 },
  { top: "65%", left: "18%",  size: 13, color: "#60a5fa", dur: 1.5, delay: 0.08 },
  { top: "68%", left: "75%",  size: 10, color: "#f472b6", dur: 1.4, delay: 0.28 },
  { top: "78%", left: "8%",   size: 8,  color: "#a78bfa", dur: 1.6, delay: 0.16 },
  { top: "80%", left: "48%",  size: 12, color: "#34d399", dur: 1.3, delay: 0.32 },
  { top: "82%", left: "88%",  size: 9,  color: "#fb923c", dur: 1.5, delay: 0.12 },
  { top: "90%", left: "25%",  size: 11, color: "#e879f9", dur: 1.4, delay: 0.22 },
  { top: "92%", left: "65%",  size: 7,  color: "#38bdf8", dur: 1.6, delay: 0.18 },
  { top: "15%", left: "42%",  size: 10, color: "#f87171", dur: 1.3, delay: 0.38 },
  { top: "44%", left: "56%",  size: 14, color: "#fbbf24", dur: 1.5, delay: 0.06 },
];

export function RegisterSheet() {
  const { register } = useAuth();
  const { isOpen, options, closeRegisterSheet } = useRegisterSheet();
  const { t } = useLang();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [showExitWarning, setShowExitWarning] = useState(false);

  // OTP
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");

  // Profile
  const [name, setName]             = useState("");
  const [nameError, setNameError]   = useState("");
  const [address, setAddress]       = useState("");
  const [addressError, setAddressError] = useState("");
  const [addressLat, setAddressLat] = useState<number | undefined>();
  const [addressLng, setAddressLng] = useState<number | undefined>();
  const [locLoading, setLocLoading] = useState(false);
  const [geoError, setGeoError]     = useState("");
  const [dob, setDob]               = useState("");
  const [kids, setKids]             = useState<Kid[]>([]);
  const [showReveal, setShowReveal] = useState(false);

  // Photo
  const [profilePhoto, setProfilePhoto] = useState("");
  const [cropperSrc, setCropperSrc]     = useState("");
  const [showCropper, setShowCropper]   = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pendingData = useRef<Parameters<typeof register>[0] | null>(null);
  const onRegisteredRef = useRef(options.onRegistered);
  useEffect(() => { onRegisteredRef.current = options.onRegistered; });

  // Reset state when sheet opens
  useEffect(() => {
    if (isOpen) {
      setStep("phone");
      setPhone("");
      setOtp(["", "", "", "", "", ""]);
      setOtpError("");
      setName(""); setNameError("");
      setAddress(""); setAddressError("");
      setAddressLat(undefined); setAddressLng(undefined);
      setLocLoading(false); setGeoError("");
      setDob(""); setKids([]);
      setShowReveal(false);
      setProfilePhoto(""); setCropperSrc(""); setShowCropper(false);
      setShowExitWarning(false);
      pendingData.current = null;
    }
  }, [isOpen]);

  // Auto-focus first OTP field
  useEffect(() => {
    if (step === "otp") {
      const timer = setTimeout(() => otpRefs.current[0]?.focus(), 80);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Auto-advance done animation → register + close
  useEffect(() => {
    if (step === "done") {
      const revealTimer = setTimeout(() => setShowReveal(true), 350);
      const doneTimer = setTimeout(async () => {
        let data = pendingData.current;
        // Silently geocode typed address if no pin coordinates were set
        if (data && !data.addressLat && !data.addressLng && data.address) {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(data.address)}&limit=1&countrycodes=id`
            );
            const results = await res.json();
            if (results?.[0]) {
              data = { ...data, addressLat: parseFloat(results[0].lat), addressLng: parseFloat(results[0].lon) };
            }
          } catch {}
        }
        if (data) register(data);
        if (profilePhoto) localStorage.setItem("profilePhoto", profilePhoto);
        closeRegisterSheet();
        onRegisteredRef.current?.();
      }, 2800);
      return () => { clearTimeout(revealTimer); clearTimeout(doneTimer); };
    }
  }, [step, register, closeRegisterSheet]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleBackdropClick() {
    if (step === "done") return;
    const inProgress = step !== "phone" || phone.trim().length > 0;
    if (inProgress) { setShowExitWarning(true); return; }
    closeRegisterSheet();
  }

  function handleSendOtp() {
    if (phone.replace(/\D/g, "").length < 7) return;
    setOtp(["", "", "", "", "", ""]);
    setOtpError("");
    setStep("otp");
  }

  function handleOtpChange(i: number, val: string) {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) requestAnimationFrame(() => otpRefs.current[i + 1]?.focus());
    if (i === 5 && val) {
      const full = [...next];
      if (full.every(d => d !== "")) {
        setOtpError("");
        setStep("profile");
      }
    }
  }

  function handleOtpKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  }

  function handleVerifyOtp() {
    if (otp.join("").length !== 6) { setOtpError("Masukkan 6 digit kode"); return; }
    setOtpError("");
    setStep("profile");
  }

  async function handleGetLocation() {
    setGeoError("");
    if (!navigator.geolocation) { setGeoError(t.obGeoError); return; }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setAddressLat(lat); setAddressLng(lng);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await res.json();
          if (data.display_name) setAddress(data.display_name);
        } catch {}
        setLocLoading(false);
      },
      () => { setLocLoading(false); setGeoError(t.obGeoError); },
      { timeout: 10000, enableHighAccuracy: false }
    );
  }

  function addKid() { setKids([...kids, { name: "", dob: "" }]); }
  function removeKid(i: number) { setKids(kids.filter((_, idx) => idx !== i)); }
  function updateKid(i: number, field: keyof Kid, value: string) {
    const next = [...kids];
    next[i] = { ...next[i], [field]: value };
    setKids(next);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCropperSrc(ev.target?.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  async function handleSubmit() {
    let valid = true;
    if (!name.trim()) { setNameError("Nama wajib diisi"); valid = false; } else setNameError("");
    if (!address.trim()) { setAddressError("Alamat wajib diisi"); valid = false; } else setAddressError("");
    if (!valid) return;

    let lat = addressLat;
    let lng = addressLng;

    // For minimal-profile path, geocode now (no done-animation to hide the wait).
    // For standard path the geocoding happens during the 2.8s done animation instead.
    if (options.minimalProfile && !lat && !lng && address.trim()) {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address.trim())}&limit=1&countrycodes=id`
        );
        const results = await res.json();
        if (results?.[0]) {
          lat = parseFloat(results[0].lat);
          lng = parseFloat(results[0].lon);
        }
      } catch {}
    }

    const data = {
      phone: `+62${phone.replace(/^0/, "")}`,
      name: name.trim(),
      address: address.trim(),
      addressLat: lat,
      addressLng: lng,
      dob: dob || undefined,
      kids: kids.filter(k => k.name.trim()),
    };
    if (options.minimalProfile) {
      register(data);
      if (profilePhoto) localStorage.setItem("profilePhoto", profilePhoto);
      closeRegisterSheet();
      onRegisteredRef.current?.();
    } else {
      pendingData.current = data;
      setStep("done");
    }
  }

  const mapSrc = addressLat && addressLng
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${addressLng - 0.005},${addressLat - 0.005},${addressLng + 0.005},${addressLat + 0.005}&layer=mapnik&marker=${addressLat},${addressLng}`
    : null;

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes rs-slideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        @keyframes rs-fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes rs-popIn {
          0%   { opacity: 0; transform: scale(0.4); }
          65%  { transform: scale(1.12); }
          85%  { transform: scale(0.96); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes rs-fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes rs-floatDot {
          0%   { opacity: 0; transform: translateY(0) scale(0); }
          20%  { opacity: 1; transform: translateY(-16px) scale(1); }
          80%  { opacity: 0.8; }
          100% { opacity: 0; transform: translateY(-50px) scale(0.6); }
        }
        @keyframes rs-pulseRingGold {
          0%   { box-shadow: 0 0 0 0 rgba(245,158,11,0.45); }
          70%  { box-shadow: 0 0 0 20px rgba(245,158,11,0); }
          100% { box-shadow: 0 0 0 0 rgba(245,158,11,0); }
        }
        @keyframes rs-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes rs-drawCheck {
          from { stroke-dashoffset: 40; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes rs-revealSlideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={handleBackdropClick}
        style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.55)",
          animation: "sheet-fade-in 0.25s ease both",
        }}
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* Exit confirmation dialog */}
      {showExitWarning && (
        <div
          onClick={() => setShowExitWarning(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 1050,
            background: "rgba(0,0,0,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 32px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff", borderRadius: 24, padding: "28px 24px",
              width: "100%", maxWidth: 360,
              boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
            <p style={{
              fontFamily: "var(--font-fraunces), Georgia, serif",
              fontSize: 17, fontWeight: 700, color: "#0e1d4f",
              margin: "0 0 8px",
            }}>
              Yakin mau keluar?
            </p>
            <p style={{
              fontFamily: "var(--font-jakarta), sans-serif",
              fontSize: 13, color: "#64748b", lineHeight: 1.55,
              margin: "0 0 24px",
            }}>
              Kamu sedang dalam proses pendaftaran. Jika keluar, data yang sudah diisi akan hilang.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <ActionButton
                onClick={() => setShowExitWarning(false)}
                style={{
                  flex: 1, padding: "13px 0", borderRadius: 14,
                  background: "#f1f5f9", color: "#0e1d4f",
                  fontSize: 14, fontWeight: 700,
                  fontFamily: "var(--font-jakarta), sans-serif",
                }}
              >
                Lanjut Daftar
              </ActionButton>
              <ActionButton
                onClick={() => { setShowExitWarning(false); closeRegisterSheet(); }}
                style={{
                  flex: 1, padding: "13px 0", borderRadius: 14,
                  background: "#fee2e2", color: "#dc2626",
                  fontSize: 14, fontWeight: 700,
                  fontFamily: "var(--font-jakarta), sans-serif",
                }}
              >
                Keluar
              </ActionButton>
            </div>
          </div>
        </div>
      )}

      {/* Photo cropper — rendered above the sheet (zIndex 1100) */}
      {showCropper && (
        <ImageCropper
          imageSrc={cropperSrc}
          zIndex={1100}
          onConfirm={(dataUrl) => { setProfilePhoto(dataUrl); setShowCropper(false); }}
          onCancel={() => setShowCropper(false)}
        />
      )}

      {/* Full-screen reveal overlay */}
      {showReveal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1002,
          background: "linear-gradient(160deg, #0a2018 0%, #1f6b43 55%, #2e8a5a 100%)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "0 40px",
          animation: "rs-revealSlideUp 0.55s cubic-bezier(0.32, 0.72, 0, 1) both",
        }}>
          {/* Confetti */}
          {bigConfetti.map((dot, i) => (
            <div key={i} style={{
              position: "absolute",
              top: dot.top, left: dot.left,
              width: dot.size, height: dot.size,
              borderRadius: 999, background: dot.color,
              animation: `rs-floatDot ${dot.dur}s ease-out ${dot.delay}s both`,
              zIndex: 1,
            }} />
          ))}

          {/* 🎉 circle */}
          <div style={{
            position: "relative", zIndex: 2,
            width: 100, height: 100, borderRadius: 999,
            background: "linear-gradient(135deg, #d97706, #f59e0b)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 50, lineHeight: 1,
            boxShadow: "0 16px 48px rgba(245,158,11,0.50)",
            animation: "rs-popIn 0.55s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.1s both, rs-pulseRingGold 1.2s ease-out 0.7s both",
          }}>
            🎉
          </div>

          <h2 style={{
            position: "relative", zIndex: 2,
            fontFamily: "var(--font-fraunces), Georgia, serif",
            fontSize: 30, fontWeight: 700, color: "#fff",
            margin: "26px 0 10px", textAlign: "center", letterSpacing: -0.5,
            animation: "rs-fadeUp 0.5s ease 0.3s both",
          }}>
            {t.obDoneTitle(name.split(" ")[0] || "Kamu")}
          </h2>
          <p style={{
            position: "relative", zIndex: 2,
            fontSize: 15, color: "rgba(255,255,255,0.72)",
            textAlign: "center", lineHeight: 1.6, margin: 0,
            animation: "rs-fadeUp 0.5s ease 0.45s both",
          }}>
            {t.obDoneSub}
          </p>
        </div>
      )}

      {/* Sheet */}
      <div
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          maxWidth: 448, margin: "0 auto",
          background: step === "done" ? "#0a2018" : "#fff",
          borderRadius: "28px 28px 0 0",
          zIndex: 1001,
          boxShadow: "0 -8px 40px rgba(0,0,0,0.30)",
          maxHeight: step === "profile" ? "92dvh" : "auto",
          overflowY: step === "profile" ? "auto" : "visible",
          animation: "sheet-slide-up 0.38s cubic-bezier(0.32, 0.72, 0, 1) both",
        }}
      >
        {/* ── DONE step ─────────────────────────────────────────────── */}
        {step === "done" && (
          <div style={{
            padding: "60px 40px 80px",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            position: "relative", overflow: "clip",
            minHeight: 300,
          }}>
            {confettiDots.map((dot, i) => (
              <div key={i} style={{
                position: "absolute",
                top: dot.top, left: dot.left,
                width: dot.size, height: dot.size,
                borderRadius: 999, background: dot.color,
                animation: `rs-floatDot ${dot.dur}s ease-out ${dot.delay}s both`,
                zIndex: 1,
              }} />
            ))}
            <div style={{
              position: "relative", zIndex: 2,
              width: 88, height: 88, borderRadius: 999,
              background: "linear-gradient(135deg, #d97706, #f59e0b)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 42, lineHeight: 1,
              boxShadow: "0 16px 40px rgba(245,158,11,0.45)",
              animation: "rs-popIn 0.55s cubic-bezier(0.175, 0.885, 0.32, 1.275) both, rs-pulseRingGold 1s ease-out 0.6s both",
            }}>
              🎉
            </div>
            <h2 style={{
              position: "relative", zIndex: 2,
              fontFamily: "var(--font-fraunces), Georgia, serif",
              fontSize: 26, fontWeight: 700, color: "#fff",
              margin: "22px 0 8px", textAlign: "center", letterSpacing: -0.5,
              animation: "rs-fadeUp 0.5s ease 0.4s both",
            }}>
              {t.obDoneTitle(name.split(" ")[0] || "Kamu")}
            </h2>
            <p style={{
              position: "relative", zIndex: 2,
              fontSize: 14, color: "rgba(255,255,255,0.72)",
              textAlign: "center", lineHeight: 1.55, margin: 0,
              animation: "rs-fadeUp 0.5s ease 0.55s both",
            }}>
              {t.obDoneSub}
            </p>
          </div>
        )}

        {/* ── All other steps ──────────────────────────────────────── */}
        {step !== "done" && (
          <>
            {/* Drag handle + close */}
            <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 0", position: "relative" }}>
              <div style={{ width: 40, height: 4, borderRadius: 999, background: "#e2e8f0" }} />
              <ActionButton
                onClick={handleBackdropClick}
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

            {/* ── PHONE STEP ───────────────────────────────────────── */}
            {step === "phone" && (
              <div style={{ padding: "20px 24px 44px" }}>
                {options.title && (
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    background: "#FEF3C7", borderRadius: 999, padding: "4px 12px",
                    marginBottom: 12,
                  }}>
                    <span style={{ fontSize: 13 }}>🔒</span>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: "#92400E", fontFamily: "var(--font-jakarta), sans-serif" }}>
                      Fitur Terkunci
                    </span>
                  </div>
                )}
                <h2 style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 22, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>
                  {options.title ?? t.obPhoneTitle}
                </h2>
                <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 24px", lineHeight: 1.5 }}>
                  {options.subtitle ?? t.obPhoneDesc}
                </p>

                <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                  <div style={{
                    padding: "13px 14px", borderRadius: 14, border: "1.5px solid #e2e8f0",
                    background: "#f1f5f9", fontSize: 15, fontWeight: 700, color: "#0f172a",
                    flexShrink: 0, display: "flex", alignItems: "center",
                  }}>
                    🇮🇩 +62
                  </div>
                  <input
                    type="tel"
                    placeholder={t.obPhonePlaceholder}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^\d-]/g, ""))}
                    style={{ ...inputStyle, flex: 1 }}
                    autoFocus
                  />
                </div>

                <ActionButton
                  onClick={handleSendOtp}
                  style={{
                    display: "block", width: "100%", textAlign: "center",
                    padding: "16px 20px", borderRadius: 18,
                    background: phone.replace(/\D/g, "").length >= 7
                      ? "linear-gradient(135deg, #128c7e, #25d366)"
                      : "#e2e8f0",
                    color: phone.replace(/\D/g, "").length >= 7 ? "#fff" : "#94a3b8",
                    fontWeight: 700, fontSize: 15,
                    boxShadow: phone.replace(/\D/g, "").length >= 7 ? "0 8px 24px rgba(37,211,102,0.35)" : "none",
                  }}
                >
                  {t.obPhoneBtn}
                </ActionButton>

                <p style={{ fontSize: 11, color: "#94a3b8", textAlign: "center", marginTop: 16, fontFamily: "var(--font-jakarta), sans-serif" }}>
                  Gratis selamanya · Tanpa kartu kredit
                </p>
              </div>
            )}

            {/* ── OTP STEP ─────────────────────────────────────────── */}
            {step === "otp" && (
              <div style={{ padding: "20px 24px 44px" }}>
                <ActionButton
                  onClick={() => setStep("phone")}
                  style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 20 }}
                >
                  <ChevronLeft size={16} strokeWidth={2.5} /> {t.obBack}
                </ActionButton>
                <h2 style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 22, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>
                  {t.obOtpTitle}
                </h2>
                <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 4px", lineHeight: 1.5 }}>
                  {t.obOtpDesc(phone)}
                </p>
                <p style={{ fontSize: 11.5, color: "#f59e0b", margin: "0 0 24px", fontWeight: 600 }}>
                  {t.obOtpDemo}
                </p>

                <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 8 }}>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="tel"
                      inputMode="numeric"
                      maxLength={1}
                      value={otp[i]}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      style={{
                        width: 44, height: 54, textAlign: "center", fontSize: 22, fontWeight: 700,
                        borderRadius: 12, outline: "none", boxSizing: "border-box",
                        border: otp[i] ? "2px solid var(--tk-accent, #2e8a5a)" : "2px solid #e2e8f0",
                        background: otp[i] ? "var(--tk-accent-pale, #e6f4ed)" : "#f8fafc", color: "#0e1d4f",
                      }}
                    />
                  ))}
                </div>
                {otpError && <p style={{ ...errorStyle, textAlign: "center", marginBottom: 16 }}>{otpError}</p>}

                <div style={{ marginTop: 20 }}>
                  <ActionButton
                    onClick={handleVerifyOtp}
                    style={{
                      display: "block", width: "100%", textAlign: "center",
                      padding: "16px 20px", borderRadius: 18,
                      background: "linear-gradient(135deg, #1f6b43, #2e8a5a)",
                      color: "#fff", fontWeight: 700, fontSize: 15,
                      boxShadow: "0 8px 24px rgba(30,63,176,0.30)",
                    }}
                  >
                    {t.obOtpBtn}
                  </ActionButton>
                </div>
              </div>
            )}

            {/* ── PROFILE STEP ─────────────────────────────────────── */}
            {step === "profile" && (
              <div style={{ padding: "20px 24px 60px" }}>
                <h2 style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 22, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>
                  {t.obProfileTitle}
                </h2>
                <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 24px", lineHeight: 1.5 }}>
                  {t.obProfileDesc}
                </p>

                {/* Name */}
                <div style={{ marginBottom: 18 }}>
                  <label style={labelStyle}>
                    {t.obNameLabel} <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder={t.obNamePlaceholder}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={inputStyle}
                  />
                  {nameError && <p style={errorStyle}>{t.obNameError}</p>}
                </div>

                {/* Address */}
                <div style={{ marginBottom: 18 }}>
                  <label style={labelStyle}>
                    {t.obAddressLabel} <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <div style={{
                    display: "flex", alignItems: "flex-start", gap: 8,
                    background: "#fffbeb", border: "1.5px solid #f59e0b",
                    borderRadius: 12, padding: "10px 12px", marginBottom: 12,
                  }}>
                    <span style={{ fontSize: 15, flexShrink: 0, lineHeight: 1.4 }}>🔔</span>
                    <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: "#92400e", lineHeight: 1.45, fontFamily: "var(--font-jakarta, sans-serif)" }}>
                      <span style={{ color: "#d97706" }}>PENTING!</span>{" "}
                      Agar kami dapat menemukan tempat terdekat dari rumahmu.
                    </p>
                  </div>
                  {/* Location button — always visible */}
                  <ActionButton
                    onClick={handleGetLocation}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      width: "100%", padding: "14px 20px", borderRadius: 14,
                      background: address.trim()
                        ? "#f1f5f9"
                        : "linear-gradient(135deg, #1f6b43, #2e8a5a)",
                      color: address.trim() ? "#94a3b8" : "#fff",
                      fontSize: 15, fontWeight: 700,
                      boxShadow: address.trim() ? "none" : "0 6px 20px rgba(46,138,90,0.30)",
                    }}
                  >
                    {locLoading
                      ? <><Loader size={16} style={{ animation: "rs-spin 1s linear infinite" }} /> {t.obLocating}</>
                      : <><Navigation size={16} /> {t.obUseLocation}</>
                    }
                  </ActionButton>

                  {/* Detected status chip + editable address — only after location is set */}
                  {address && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        background: "#dcfce7", borderRadius: 999, padding: "3px 10px",
                        marginBottom: 8,
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: "#15803d", fontFamily: "var(--font-jakarta, sans-serif)" }}>
                          Lokasi terdeteksi
                        </span>
                      </div>
                      <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        rows={2}
                        style={{ ...inputStyle, resize: "none", fontSize: 13 }}
                      />
                    </div>
                  )}

                  {addressError && <p style={{ ...errorStyle, marginTop: 6 }}>{t.obAddressError}</p>}
                  {geoError && (
                    <p style={{ fontSize: 11.5, color: "#f59e0b", marginTop: 6, lineHeight: 1.4, fontWeight: 500 }}>
                      ⚠ {geoError}
                    </p>
                  )}
                  {mapSrc && (
                    <div style={{ marginTop: 12, borderRadius: 14, overflow: "clip", border: "1.5px solid #e2e8f0", height: 150 }}>
                      <iframe
                        src={mapSrc}
                        width="100%"
                        height="150"
                        style={{ border: "none", display: "block", pointerEvents: "none" }}
                        title={t.obAddressLabel}
                      />
                    </div>
                  )}
                </div>

                {/* Profile Photo — hidden in minimalProfile (upgrade) flow */}
                {!options.minimalProfile && (
                <div style={{ marginBottom: 18 }}>
                  <label style={labelStyle}>
                    Foto Profil <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>({t.obOptional})</span>
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <ActionButton
                        onClick={() => {
                          if (profilePhoto) { setCropperSrc(profilePhoto); setShowCropper(true); }
                          else fileInputRef.current?.click();
                        }}
                        style={{
                          width: 72, height: 72, borderRadius: 999,
                          background: profilePhoto ? "transparent" : "#e6f4ed",
                          border: "2.5px solid #2e8a5a",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          overflow: "clip", padding: 0,
                        }}
                      >
                        {profilePhoto
                          ? <img src={profilePhoto} alt="" style={{ width: 72, height: 72, objectFit: "cover" }} />
                          : <User size={32} color="#2e8a5a" strokeWidth={1.5} />
                        }
                      </ActionButton>
                      <div style={{
                        position: "absolute", bottom: 2, right: 2,
                        width: 20, height: 20, borderRadius: 999,
                        background: "#2e8a5a", border: "2px solid #fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        pointerEvents: "none",
                      }}>
                        <Camera size={10} color="#fff" />
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 12.5, fontWeight: 600, color: "#0f172a", margin: "0 0 6px", fontFamily: "var(--font-jakarta), sans-serif" }}>
                        {profilePhoto ? "Foto terpilih" : "Tambah foto profil"}
                      </p>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <ActionButton
                          onClick={() => fileInputRef.current?.click()}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 4,
                            padding: "5px 10px", borderRadius: 999,
                            background: "#e6f4ed", color: "#2e8a5a",
                            fontSize: 11, fontWeight: 700,
                            border: "1.5px solid #a7d4bc",
                          }}
                        >
                          <Camera size={11} /> {profilePhoto ? "Ganti" : "Upload"}
                        </ActionButton>
                        {profilePhoto && (
                          <ActionButton
                            onClick={() => setProfilePhoto("")}
                            style={{
                              display: "inline-flex", alignItems: "center", gap: 4,
                              padding: "5px 10px", borderRadius: 999,
                              background: "#fef2f2", color: "#ef4444",
                              fontSize: 11, fontWeight: 700,
                              border: "1.5px solid #fecaca",
                            }}
                          >
                            <X size={11} /> Hapus
                          </ActionButton>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                )}

                {/* Date of birth + Kids — hidden in minimalProfile (upgrade) flow */}
                {!options.minimalProfile && (<>
                <div style={{ marginBottom: 18 }}>
                  <label style={labelStyle}>
                    {t.obDobLabel} <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>({t.obOptional})</span>
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                {/* Kids */}
                <div style={{ marginBottom: 26 }}>
                  <label style={labelStyle}>
                    {t.obKidsLabel} <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>({t.obOptional})</span>
                  </label>

                  {kids.map((kid, i) => (
                    <div key={i} style={{
                      background: "#f8fafc", borderRadius: 14, padding: "12px 14px",
                      marginBottom: 10, border: "1.5px solid #e2e8f0", position: "relative",
                    }}>
                      <ActionButton
                        onClick={() => removeKid(i)}
                        style={{
                          position: "absolute", top: 10, right: 10,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          width: 22, height: 22, borderRadius: 999,
                          background: "#fee2e2", color: "#ef4444",
                        }}
                      >
                        <X size={11} strokeWidth={3} />
                      </ActionButton>
                      <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 8, letterSpacing: 0.8, textTransform: "uppercase" }}>
                        {t.obKidTitle(i + 1)}
                      </p>
                      <input
                        type="text"
                        placeholder={t.obKidNamePlaceholder}
                        value={kid.name}
                        onChange={(e) => updateKid(i, "name", e.target.value)}
                        style={{ ...inputStyle, marginBottom: 8 }}
                      />
                      <input
                        type="date"
                        value={kid.dob}
                        onChange={(e) => updateKid(i, "dob", e.target.value)}
                        style={{ ...inputStyle, marginBottom: 8 }}
                      />
                      <div style={{ display: "flex", gap: 8 }}>
                        {(["male", "female"] as const).map((g) => (
                          <label key={g} style={{ cursor: "pointer", flex: 1 }}>
                            <input
                              type="radio"
                              name={`rs-kid-gender-${i}`}
                              value={g}
                              checked={kid.gender === g}
                              onChange={() => updateKid(i, "gender", g)}
                              style={{ position: "absolute", opacity: 0, width: 1, height: 1 }}
                            />
                            <div style={{
                              textAlign: "center", padding: "7px 4px", borderRadius: 10,
                              fontSize: 12, fontWeight: 700,
                              border: kid.gender === g ? "2px solid var(--tk-accent, #2e8a5a)" : "1.5px solid #e2e8f0",
                              background: kid.gender === g ? "var(--tk-accent-pale, #e6f4ed)" : "#f8fafc",
                              color: kid.gender === g ? "var(--tk-accent, #2e8a5a)" : "#64748b",
                            }}>
                              {g === "male" ? `👦 ${t.obKidGenderMale}` : `👧 ${t.obKidGenderFemale}`}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  <ActionButton
                    onClick={addKid}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "9px 16px", borderRadius: 999,
                      background: "#f1f5f9", color: "#475569",
                      fontSize: 13, fontWeight: 600,
                      border: "1.5px dashed #cbd5e1",
                    }}
                  >
                    <Plus size={14} strokeWidth={2.5} /> {t.obAddKid}
                  </ActionButton>
                </div>
                </>)}

                {/* Submit */}
                <ActionButton
                  onClick={address.trim() ? handleSubmit : () => {}}
                  style={{
                    display: "block", width: "100%", textAlign: "center",
                    padding: "17px 20px", borderRadius: 18,
                    background: address.trim()
                      ? "linear-gradient(135deg, #1f6b43, #2e8a5a)"
                      : "#e2e8f0",
                    color: address.trim() ? "#fff" : "#94a3b8",
                    fontWeight: 700, fontSize: 16,
                    boxShadow: address.trim() ? "0 8px 24px rgba(46,138,90,0.35)" : "none",
                    fontFamily: "var(--font-fraunces), Georgia, serif",
                    letterSpacing: -0.3,
                    cursor: address.trim() ? "pointer" : "default",
                  }}
                >
                  {t.obSubmitBtn}
                </ActionButton>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
