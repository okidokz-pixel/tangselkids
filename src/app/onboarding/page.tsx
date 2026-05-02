"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, ArrowRight, ChevronLeft, Plus, X, Navigation, Loader } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { LangToggle } from "@/components/LangToggle";
import { ActionButton } from "@/components/ActionButton";
import { useAuth } from "@/context/AuthContext";
import type { Kid } from "@/context/AuthContext";
import { MapPicker } from "@/components/MapPicker";

const SPLASH_PHOTOS = ["/splash.jpg", "/splash2.jpg", "/splash3.jpg"];

type Step = "splash" | "phone" | "otp" | "verified" | "profile" | "done";

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
  { top: "12%", left: "12%",  size: 12, color: "#fbbf24", dur: 1.2, delay: 0.10 },
  { top: "18%", left: "82%",  size: 8,  color: "#60a5fa", dur: 1.4, delay: 0.20 },
  { top: "8%",  left: "50%",  size: 10, color: "#f472b6", dur: 1.1, delay: 0.15 },
  { top: "72%", left: "14%",  size: 8,  color: "#34d399", dur: 1.3, delay: 0.30 },
  { top: "68%", left: "82%",  size: 12, color: "#a78bfa", dur: 1.2, delay: 0.25 },
  { top: "82%", left: "46%",  size: 10, color: "#fb923c", dur: 1.4, delay: 0.10 },
  { top: "28%", left: "4%",   size: 6,  color: "#e879f9", dur: 1.1, delay: 0.35 },
  { top: "32%", left: "90%",  size: 8,  color: "#38bdf8", dur: 1.3, delay: 0.20 },
  { top: "55%", left: "6%",   size: 7,  color: "#f87171", dur: 1.2, delay: 0.28 },
  { top: "50%", left: "88%",  size: 7,  color: "#4ade80", dur: 1.3, delay: 0.18 },
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

export default function OnboardingPage() {
  const { t } = useLang();
  const { register } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>("splash");

  // Slideshow
  const [slideIdx, setSlideIdx] = useState(0);

  // Phone step
  const [phone, setPhone] = useState("");

  // OTP step
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");

  // Profile step
  const [name, setName]               = useState("");
  const [nameError, setNameError]     = useState("");
  const [address, setAddress]         = useState("");
  const [addressError, setAddressError] = useState("");
  const [addressLat, setAddressLat]   = useState<number | undefined>();
  const [addressLng, setAddressLng]   = useState<number | undefined>();
  const [locLoading, setLocLoading]   = useState(false);
  const [geoError, setGeoError]       = useState("");
  const [dob, setDob]                 = useState("");
  const [kids, setKids]               = useState<Kid[]>([]);
  const [showReveal, setShowReveal]   = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);

  // Holds submitted data until the "done" animation finishes
  const pendingData = useRef<Parameters<typeof register>[0] | null>(null);

  // ── Slideshow interval (only on splash) ─────────────────────────────────────
  useEffect(() => {
    if (step !== "splash") return;
    const id = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % SPLASH_PHOTOS.length);
    }, 3000);
    return () => clearInterval(id);
  }, [step]);

  // ── Auto-focus first OTP field when step becomes "otp" ──────────────────────
  useEffect(() => {
    if (step === "otp") {
      const t = setTimeout(() => otpRefs.current[0]?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [step]);

  // ── Auto-advance for animation steps ────────────────────────────────────────
  useEffect(() => {
    if (step === "verified") {
      const timer = setTimeout(() => setStep("profile"), 2200);
      return () => clearTimeout(timer);
    }
    if (step === "done") {
      const revealTimer = setTimeout(() => setShowReveal(true), 350);
      const navTimer = setTimeout(() => {
        if (pendingData.current) register(pendingData.current);
        sessionStorage.setItem("justRegistered", "1");
        router.replace("/");
      }, 2800);
      return () => { clearTimeout(revealTimer); clearTimeout(navTimer); };
    }
  }, [step, router]);

  // ── Handlers ──────────────────────────────────────────────────────────────

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
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
    // Auto-verify when last digit is entered
    if (i === 5 && val) {
      const full = [...next];
      if (full.every(d => d !== "")) {
        setOtpError("");
        setStep("verified");
      }
    }
  }

  function handleOtpKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  }

  function handleVerifyOtp() {
    if (otp.join("").length !== 6) { setOtpError("Masukkan 6 digit kode"); return; }
    setOtpError("");
    setStep("verified");
  }

  async function handleGetLocation() {
    setGeoError("");
    if (!navigator.geolocation) {
      setGeoError(t.obGeoError);
      return;
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setAddressLat(lat);
        setAddressLng(lng);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await res.json();
          if (data.display_name) setAddress(data.display_name);
        } catch {}
        setLocLoading(false);
      },
      () => {
        setLocLoading(false);
        setGeoError(t.obGeoError);
      },
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

  function handleSubmit() {
    let valid = true;
    if (!name.trim()) { setNameError("Nama wajib diisi"); valid = false; } else setNameError("");
    if (!address.trim()) { setAddressError("Alamat wajib diisi"); valid = false; } else setAddressError("");
    if (!valid) return;
    // Store data in ref — register() is called after the animation finishes
    // (calling it now would flip isRegistered → AuthGuard redirects before animation shows)
    pendingData.current = {
      phone: `+62${phone.replace(/^0/, "")}`,
      name: name.trim(),
      address: address.trim(),
      addressLat,
      addressLng,
      dob: dob || undefined,
      kids: kids.filter(k => k.name.trim()),
    };
    setStep("done");
  }

  const mapSrc = addressLat && addressLng
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${addressLng - 0.005},${addressLat - 0.005},${addressLng + 0.005},${addressLat + 0.005}&layer=mapnik&marker=${addressLat},${addressLng}`
    : null;

  const firstName = name.split(" ")[0] || "Kamu";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{
      position: "relative", width: "100%", maxWidth: 448, margin: "0 auto",
      height: "100dvh", minHeight: "100vh", overflow: "hidden", background: "#0a1628",
    }}>

      {/* CSS keyframe animations */}
      <style>{`
        @keyframes popIn {
          0%   { opacity: 0; transform: scale(0.4); }
          65%  { transform: scale(1.12); }
          85%  { transform: scale(0.96); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatDot {
          0%   { opacity: 0; transform: translateY(0) scale(0); }
          20%  { opacity: 1; transform: translateY(-18px) scale(1); }
          80%  { opacity: 0.8; }
          100% { opacity: 0; transform: translateY(-60px) scale(0.6); }
        }
        @keyframes pulseRing {
          0%   { box-shadow: 0 0 0 0 rgba(34,197,94,0.45); }
          70%  { box-shadow: 0 0 0 22px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }
        @keyframes pulseRingGold {
          0%   { box-shadow: 0 0 0 0 rgba(245,158,11,0.45); }
          70%  { box-shadow: 0 0 0 22px rgba(245,158,11,0); }
          100% { box-shadow: 0 0 0 0 rgba(245,158,11,0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes drawCheck {
          from { stroke-dashoffset: 40; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes shimmer {
          0%   { opacity: 0.7; }
          50%  { opacity: 1; }
          100% { opacity: 0.7; }
        }
        @keyframes kenBurns0 {
          0%   { transform: scale(1)    translateX(0%)    translateY(0%); }
          100% { transform: scale(1.10) translateX(-1.5%) translateY(-1%); }
        }
        @keyframes kenBurns1 {
          0%   { transform: scale(1.08) translateX(1.5%)  translateY(0%); }
          100% { transform: scale(1)    translateX(0%)    translateY(-1.5%); }
        }
        @keyframes kenBurns2 {
          0%   { transform: scale(1)    translateX(0%)    translateY(-1%); }
          100% { transform: scale(1.10) translateX(1%)    translateY(0%); }
        }
        @keyframes slideFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes revealSlideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>

      {/* Slideshow background photos */}
      {SPLASH_PHOTOS.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center 30%",
            opacity: slideIdx === i ? 1 : 0,
            transition: "opacity 1.2s ease-in-out",
            animation: `kenBurns${i} 9s ease-in-out infinite alternate`,
            transformOrigin: "center center",
            willChange: "opacity",
          }}
        />
      ))}

      {/* Gradient overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to bottom, rgba(10,22,40,0.52) 0%, rgba(10,22,40,0.08) 38%, rgba(10,22,40,0.55) 62%, rgba(10,22,40,0.88) 100%)",
      }} />

      {/* Top bar — hidden during animation steps */}
      {step !== "verified" && step !== "done" && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          padding: "54px 24px 0", display: "flex", alignItems: "center",
          justifyContent: "space-between", zIndex: 2,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: "linear-gradient(135deg, #1e3fb0, #3a64ee)",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "1.5px solid rgba(255,255,255,0.25)",
            }}>
              <MapPin size={16} color="#fff" strokeWidth={2} />
            </div>
            <span style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 18, fontWeight: 600, color: "#fff", letterSpacing: -0.4 }}>
              TangselKids
            </span>
          </div>
          <LangToggle />
        </div>
      )}

      {/* ── SPLASH step ───────────────────────────────────────────────────── */}
      {step === "splash" && (
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 28px 52px", zIndex: 2 }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
            {SPLASH_PHOTOS.map((_, i) => (
              <div key={i} style={{
                height: 4, borderRadius: 999,
                width: slideIdx === i ? 28 : 8,
                background: slideIdx === i ? "#fff" : "rgba(255,255,255,0.35)",
                transition: "width 0.4s ease, background 0.4s ease",
              }} />
            ))}
          </div>
          <h1 style={{
            fontFamily: "var(--font-fraunces), Georgia, serif",
            fontSize: 38, fontWeight: 600, letterSpacing: -1,
            lineHeight: 1.08, color: "#fff", margin: "0 0 14px",
          }}>
            {t.onboardingTitle}
          </h1>
          <p style={{ fontSize: 14.5, color: "rgba(255,255,255,0.78)", lineHeight: 1.58, margin: "0 0 32px", maxWidth: 320, fontWeight: 500 }}>
            {t.onboardingDesc}
          </p>
          <ActionButton onClick={() => setStep("phone")} style={{
            display: "flex", alignItems: "center", gap: 12,
            background: "linear-gradient(135deg, #16a34a, #22c55e)", borderRadius: 999, padding: "6px 20px 6px 6px",
            boxShadow: "0 12px 30px rgba(22,163,74,0.45)", width: "100%",
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 999,
              background: "rgba(0,0,0,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <MapPin size={22} color="#fff" strokeWidth={1.75} />
            </div>
            <span style={{ flex: 1, fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 16, fontWeight: 600, color: "#fff", letterSpacing: -0.2 }}>
              {t.onboardingCta}
            </span>
            <ArrowRight size={18} color="#fff" strokeWidth={2.5} />
          </ActionButton>
        </div>
      )}

      {/* ── VERIFIED step ─────────────────────────────────────────────────── */}
      {step === "verified" && (
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          flexDirection: "column", alignItems: "center", justifyContent: "center",
          zIndex: 10, padding: "0 40px",
        }}>
          {/* Dark overlay so text is readable */}
          <div style={{ position: "absolute", inset: 0, background: "rgba(10,22,40,0.72)" }} />

          {/* Confetti dots */}
          {confettiDots.map((dot, i) => (
            <div key={i} style={{
              position: "absolute",
              top: dot.top, left: dot.left,
              width: dot.size, height: dot.size,
              borderRadius: 999,
              background: dot.color,
              animation: `floatDot ${dot.dur}s ease-out ${dot.delay}s both`,
              zIndex: 1,
            }} />
          ))}

          {/* Check circle */}
          <div style={{
            position: "relative", zIndex: 2,
            width: 96, height: 96, borderRadius: 999,
            background: "linear-gradient(135deg, #16a34a, #22c55e)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 16px 40px rgba(34,197,94,0.45)",
            animation: "popIn 0.55s cubic-bezier(0.175, 0.885, 0.32, 1.275) both, pulseRing 1s ease-out 0.6s both",
          }}>
            <svg width="46" height="46" viewBox="0 0 46 46" fill="none">
              <path
                d="M11 23l9 9 15-15"
                stroke="#fff" strokeWidth="3.5"
                strokeLinecap="round" strokeLinejoin="round"
                style={{
                  strokeDasharray: 42, strokeDashoffset: 42,
                  animation: "drawCheck 0.4s ease 0.45s forwards",
                }}
              />
            </svg>
          </div>

          <h2 style={{
            position: "relative", zIndex: 2,
            fontFamily: "var(--font-fraunces), Georgia, serif",
            fontSize: 28, fontWeight: 700, color: "#fff",
            margin: "24px 0 8px", textAlign: "center", letterSpacing: -0.5,
            animation: "fadeUp 0.5s ease 0.4s both",
          }}>
            {t.obVerifiedTitle}
          </h2>
          <p style={{
            position: "relative", zIndex: 2,
            fontSize: 15, color: "rgba(255,255,255,0.72)",
            textAlign: "center", lineHeight: 1.55, margin: 0,
            animation: "fadeUp 0.5s ease 0.55s both",
          }}>
            {t.obVerifiedSub}
          </p>
        </div>
      )}

      {/* ── DONE step ─────────────────────────────────────────────────────── */}
      {step === "done" && (
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          flexDirection: "column", alignItems: "center", justifyContent: "center",
          zIndex: 10, padding: "0 40px",
        }}>
          {/* Dark overlay */}
          <div style={{ position: "absolute", inset: 0, background: "rgba(10,22,40,0.72)" }} />

          {/* Sparkle dots (same confetti, different palette) */}
          {confettiDots.map((dot, i) => (
            <div key={i} style={{
              position: "absolute",
              top: dot.top, left: dot.left,
              width: dot.size, height: dot.size,
              borderRadius: 999,
              background: dot.color,
              animation: `floatDot ${dot.dur * 1.1}s ease-out ${dot.delay * 0.8}s both`,
              zIndex: 1,
            }} />
          ))}

          {/* Celebration circle */}
          <div style={{
            position: "relative", zIndex: 2,
            width: 96, height: 96, borderRadius: 999,
            background: "linear-gradient(135deg, #d97706, #f59e0b)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 46, lineHeight: 1,
            boxShadow: "0 16px 40px rgba(245,158,11,0.45)",
            animation: "popIn 0.55s cubic-bezier(0.175, 0.885, 0.32, 1.275) both, pulseRingGold 1s ease-out 0.6s both",
          }}>
            🎉
          </div>

          <h2 style={{
            position: "relative", zIndex: 2,
            fontFamily: "var(--font-fraunces), Georgia, serif",
            fontSize: 28, fontWeight: 700, color: "#fff",
            margin: "24px 0 8px", textAlign: "center", letterSpacing: -0.5,
            animation: "fadeUp 0.5s ease 0.4s both",
          }}>
            {t.obDoneTitle(firstName)}
          </h2>
          <p style={{
            position: "relative", zIndex: 2,
            fontSize: 15, color: "rgba(255,255,255,0.72)",
            textAlign: "center", lineHeight: 1.55, margin: 0,
            animation: "fadeUp 0.5s ease 0.55s both",
          }}>
            {t.obDoneSub}
          </p>
        </div>
      )}

      {/* ── REVEAL overlay (slides up after done popup) ───────────────────── */}
      {showReveal && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 15,
          background: "linear-gradient(160deg, #0a1628 0%, #1e3a5f 55%, #1d4ed8 100%)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "0 40px",
          animation: "revealSlideUp 0.55s cubic-bezier(0.32, 0.72, 0, 1) both",
        }}>
          {/* Confetti */}
          {bigConfetti.map((dot, i) => (
            <div key={i} style={{
              position: "absolute",
              top: dot.top, left: dot.left,
              width: dot.size, height: dot.size,
              borderRadius: 999, background: dot.color,
              animation: `floatDot ${dot.dur}s ease-out ${dot.delay}s both`,
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
            animation: "popIn 0.55s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.1s both, pulseRingGold 1.2s ease-out 0.7s both",
          }}>
            🎉
          </div>

          <h2 style={{
            position: "relative", zIndex: 2,
            fontFamily: "var(--font-fraunces), Georgia, serif",
            fontSize: 30, fontWeight: 700, color: "#fff",
            margin: "26px 0 10px", textAlign: "center", letterSpacing: -0.5,
            animation: "fadeUp 0.5s ease 0.3s both",
          }}>
            {t.obDoneTitle(firstName)}
          </h2>
          <p style={{
            position: "relative", zIndex: 2,
            fontSize: 15, color: "rgba(255,255,255,0.72)",
            textAlign: "center", lineHeight: 1.6, margin: 0,
            animation: "fadeUp 0.5s ease 0.45s both",
          }}>
            {t.obDoneSub}
          </p>
        </div>
      )}

      {/* ── Map picker sheet ──────────────────────────────────────────────── */}
      {showMapPicker && (
        <MapPicker
          initialAddress={address}
          onConfirm={(addr, lat, lng) => {
            setAddress(addr);
            setAddressLat(lat);
            setAddressLng(lng);
            setShowMapPicker(false);
          }}
          onClose={() => setShowMapPicker(false)}
        />
      )}

      {/* ── PANEL (phone / otp / profile steps) ──────────────────────────── */}
      {step !== "splash" && step !== "verified" && step !== "done" && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, maxWidth: 448, margin: "0 auto",
          background: "#fff", borderRadius: "28px 28px 0 0",
          maxHeight: step === "profile" ? "92dvh" : "auto",
          overflowY: step === "profile" ? "auto" : "visible",
          zIndex: 20, boxShadow: "0 -8px 40px rgba(0,0,0,0.30)",
          animation: "sheet-slide-up 0.38s cubic-bezier(0.32, 0.72, 0, 1) both",
        }}>
          {/* Drag handle */}
          <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 0" }}>
            <div style={{ width: 40, height: 4, borderRadius: 999, background: "#e2e8f0" }} />
          </div>

          {/* ── PHONE STEP ───────────────────────────────────────────── */}
          {step === "phone" && (
            <div style={{ padding: "20px 24px 44px" }}>
              <ActionButton onClick={() => setStep("splash")} style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 20,
              }}>
                <ChevronLeft size={16} strokeWidth={2.5} /> {t.obBack}
              </ActionButton>
              <h2 style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 24, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>
                {t.obPhoneTitle}
              </h2>
              <p style={{ fontSize: 13.5, color: "#64748b", margin: "0 0 24px", lineHeight: 1.5 }}>
                {t.obPhoneDesc}
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

              <ActionButton onClick={handleSendOtp} style={{
                display: "block", width: "100%", textAlign: "center",
                padding: "16px 20px", borderRadius: 18,
                background: phone.replace(/\D/g, "").length >= 7
                  ? "linear-gradient(135deg, #128c7e, #25d366)"
                  : "#e2e8f0",
                color: phone.replace(/\D/g, "").length >= 7 ? "#fff" : "#94a3b8",
                fontWeight: 700, fontSize: 15,
                boxShadow: phone.replace(/\D/g, "").length >= 7 ? "0 8px 24px rgba(37,211,102,0.35)" : "none",
              }}>
                {t.obPhoneBtn}
              </ActionButton>
            </div>
          )}

          {/* ── OTP STEP ─────────────────────────────────────────────── */}
          {step === "otp" && (
            <div style={{ padding: "20px 24px 44px" }}>
              <ActionButton onClick={() => setStep("phone")} style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 20,
              }}>
                <ChevronLeft size={16} strokeWidth={2.5} /> {t.obBack}
              </ActionButton>
              <h2 style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 24, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>
                {t.obOtpTitle}
              </h2>
              <p style={{ fontSize: 13.5, color: "#64748b", margin: "0 0 4px", lineHeight: 1.5 }}>
                {t.obOtpDesc(phone)}
              </p>
              <p style={{ fontSize: 12, color: "#f59e0b", margin: "0 0 24px", fontWeight: 600 }}>
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
                    onTouchEnd={(e) => { e.currentTarget.focus(); }}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    style={{
                      width: 44, height: 54, textAlign: "center", fontSize: 22, fontWeight: 700,
                      borderRadius: 12, outline: "none", boxSizing: "border-box",
                      border: otp[i] ? "2px solid #1d4ed8" : "2px solid #e2e8f0",
                      background: otp[i] ? "#eff6ff" : "#f8fafc", color: "#0f172a",
                    }}
                  />
                ))}
              </div>
              {otpError && <p style={{ ...errorStyle, textAlign: "center", marginBottom: 16 }}>{otpError}</p>}

              <div style={{ marginTop: 20 }}>
                <ActionButton onClick={handleVerifyOtp} style={{
                  display: "block", width: "100%", textAlign: "center",
                  padding: "16px 20px", borderRadius: 18,
                  background: "linear-gradient(135deg, #1e3a5f, #1d4ed8)",
                  color: "#fff", fontWeight: 700, fontSize: 15,
                  boxShadow: "0 8px 24px rgba(30,63,176,0.30)",
                }}>
                  {t.obOtpBtn}
                </ActionButton>
              </div>
            </div>
          )}

          {/* ── PROFILE STEP ─────────────────────────────────────────── */}
          {step === "profile" && (
            <div style={{ padding: "20px 24px 52px" }}>
              <h2 style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 24, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>
                {t.obProfileTitle}
              </h2>
              <p style={{ fontSize: 13.5, color: "#64748b", margin: "0 0 24px", lineHeight: 1.5 }}>
                {t.obProfileDesc}
              </p>

              {/* Name */}
              <div style={{ marginBottom: 20 }}>
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
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>
                  {t.obAddressLabel} <span style={{ color: "#ef4444" }}>*</span>
                </label>

                {/* Location helper buttons — flex:1 on each so they always share the
                    row equally on any screen width (no wrapping, no hidden second button) */}
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <ActionButton
                    onClick={handleGetLocation}
                    style={{
                      flex: 1,
                      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                      padding: "8px 10px", borderRadius: 999,
                      background: "#eff6ff", color: "#1d4ed8",
                      fontSize: 12.5, fontWeight: 700,
                      border: "1.5px solid #bfdbfe",
                    }}
                  >
                    {locLoading
                      ? <><Loader size={13} style={{ animation: "spin 1s linear infinite" }} /> {t.obLocating}</>
                      : <><Navigation size={13} /> {t.obUseLocation}</>
                    }
                  </ActionButton>
                  <ActionButton
                    onClick={() => setShowMapPicker(true)}
                    style={{
                      flex: 1,
                      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                      padding: "8px 10px", borderRadius: 999,
                      background: "#f0fdf4", color: "#16a34a",
                      fontSize: 12.5, fontWeight: 700,
                      border: "1.5px solid #bbf7d0",
                    }}
                  >
                    <MapPin size={13} /> {t.obSearchOnMap}
                  </ActionButton>
                </div>
                {geoError && (
                  <p style={{ fontSize: 12, color: "#f59e0b", marginBottom: 8, lineHeight: 1.4, fontWeight: 500 }}>
                    ⚠ {geoError}
                  </p>
                )}

                {/* Prominent hint */}
                <div style={{
                  display: "flex", alignItems: "flex-start", gap: 8,
                  background: "#fffbeb", border: "1.5px solid #f59e0b",
                  borderRadius: 12, padding: "10px 12px", marginBottom: 10,
                }}>
                  <span style={{ fontSize: 15, flexShrink: 0, lineHeight: 1.4 }}>🔔</span>
                  <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: "#92400e", lineHeight: 1.45, fontFamily: "var(--font-jakarta, sans-serif)" }}>
                    <span style={{ color: "#d97706" }}>PENTING!</span>{" "}
                    Agar kami dapat menemukan tempat terdekat dari rumahmu.
                  </p>
                </div>
                <textarea
                  placeholder={t.obAddressPlaceholder}
                  value={address}
                  onChange={(e) => { setAddress(e.target.value); setGeoError(""); }}
                  rows={2}
                  style={{ ...inputStyle, resize: "none" }}
                />
                {addressError && <p style={errorStyle}>{t.obAddressError}</p>}

                {mapSrc && (
                  <div style={{ marginTop: 12, borderRadius: 16, overflow: "clip", border: "1.5px solid #e2e8f0", height: 180 }}>
                    <iframe
                      src={mapSrc}
                      width="100%"
                      height="180"
                      style={{ border: "none", display: "block", pointerEvents: "none" }}
                      title={t.obAddressLabel}
                    />
                  </div>
                )}
              </div>

              {/* Date of birth */}
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>{t.obDobLabel} <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>({t.obOptional})</span></label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  style={inputStyle}
                />
              </div>

              {/* Kids */}
              <div style={{ marginBottom: 28 }}>
                <label style={labelStyle}>{t.obKidsLabel} <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>({t.obOptional})</span></label>

                {kids.map((kid, i) => (
                  <div key={i} style={{
                    background: "#f8fafc", borderRadius: 14, padding: "12px 14px",
                    marginBottom: 10, border: "1.5px solid #e2e8f0", position: "relative",
                  }}>
                    <ActionButton
                      onClick={() => removeKid(i)}
                      ariaLabel={t.obKidRemoveLabel}
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
                    {/* Gender */}
                    <div style={{ display: "flex", gap: 8 }}>
                      {(["male", "female"] as const).map((g) => (
                        <label key={g} style={{ cursor: "pointer", flex: 1 }}>
                          <input
                            type="radio"
                            name={`kid-gender-${i}`}
                            value={g}
                            checked={kid.gender === g}
                            onChange={() => updateKid(i, "gender", g)}
                            style={{ position: "absolute", opacity: 0, width: 1, height: 1 }}
                          />
                          <div style={{
                            textAlign: "center", padding: "7px 4px", borderRadius: 10,
                            fontSize: 12, fontWeight: 700,
                            border: kid.gender === g ? "2px solid #1d4ed8" : "1.5px solid #e2e8f0",
                            background: kid.gender === g ? "#eff6ff" : "#f8fafc",
                            color: kid.gender === g ? "#1d4ed8" : "#64748b",
                          }}>
                            {g === "male" ? `👦 ${t.obKidGenderMale}` : `👧 ${t.obKidGenderFemale}`}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <ActionButton onClick={addKid} style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "9px 16px", borderRadius: 999,
                  background: "#f1f5f9", color: "#475569",
                  fontSize: 13, fontWeight: 600,
                  border: "1.5px dashed #cbd5e1",
                }}>
                  <Plus size={14} strokeWidth={2.5} /> {t.obAddKid}
                </ActionButton>
              </div>

              {/* Submit */}
              <ActionButton onClick={handleSubmit} style={{
                display: "block", width: "100%", textAlign: "center",
                padding: "17px 20px", borderRadius: 18,
                background: "linear-gradient(135deg, #1e3a5f, #1d4ed8)",
                color: "#fff", fontWeight: 700, fontSize: 16,
                boxShadow: "0 8px 24px rgba(30,63,176,0.35)",
                fontFamily: "var(--font-fraunces), Georgia, serif",
                letterSpacing: -0.3,
              }}>
                {t.obSubmitBtn}
              </ActionButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
