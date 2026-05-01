"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  User, Globe, Bell, Info, MessageSquare, HelpCircle,
  ChevronRight, Heart, Pencil, LogOut, MapPin,
  Calendar, Baby, Plus, Trash2, Check, X, Camera,
} from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { LangToggle } from "@/components/LangToggle";
import { BottomNav } from "@/components/BottomNav";
import { ActionButton } from "@/components/ActionButton";
import { useAuth, type Kid, type Tier } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useRegisterSheet } from "@/context/RegisterSheetContext";
import { FilterGateSheet } from "@/components/FilterGateSheet";
import { PremiumGuestSheet } from "@/components/PremiumGuestSheet";
import { PREMADE_AVATARS, getAvatarMeta, resizeImageToDataUrl } from "@/lib/avatars";
import { getReviews } from "@/lib/reviewsStorage";

export default function ProfilePage() {
  const { t, lang } = useLang();
  const { user, register, logout, tier } = useAuth();
  const router = useRouter();
  const { openRegisterSheet } = useRegisterSheet();
  const [savedCount,    setSavedCount]    = useState(0);
  const [reviewsCount,  setReviewsCount]  = useState(0);
  const [showGuestGate,    setShowGuestGate]    = useState(false);
  const [showPremiumSheet, setShowPremiumSheet] = useState(false);
  const [showUpgradeSheet, setShowUpgradeSheet] = useState(false);

  // Edit mode state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editAddressLat, setEditAddressLat] = useState<number | undefined>(undefined);
  const [editAddressLng, setEditAddressLng] = useState<number | undefined>(undefined);
  const [editDob, setEditDob] = useState("");
  const [editKids, setEditKids] = useState<Kid[]>([]);
  const [editAvatar, setEditAvatar] = useState("");
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState("");
  const [nameError, setNameError] = useState(false);
  const [addressError, setAddressError] = useState(false);

  useEffect(() => {
    const ids: string[] = JSON.parse(localStorage.getItem("savedIds") || "[]");
    setSavedCount(ids.length);
    setReviewsCount(getReviews().length);
  }, []);

  function openEdit() {
    if (!user) return;
    setEditName(user.name);
    setEditAddress(user.address);
    setEditAddressLat(user.addressLat);
    setEditAddressLng(user.addressLng);
    setEditDob(user.dob || "");
    setEditKids(user.kids.map((k) => ({ ...k })));
    setEditAvatar(user.avatar || "");
    setNameError(false);
    setAddressError(false);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
  }

  async function useMyLocation() {
    setGeoError("");
    if (!navigator.geolocation) {
      setGeoError("Location unavailable. Please type your address manually.");
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setEditAddressLat(lat);
        setEditAddressLng(lng);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
            { headers: { "Accept-Language": "id" } }
          );
          const data = await res.json();
          setEditAddress(data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        } catch {
          setEditAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        }
        setGeoLoading(false);
      },
      () => {
        setGeoLoading(false);
        setGeoError("Location unavailable. Please type your address manually.");
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  }

  function addKid() {
    setEditKids((prev) => [...prev, { name: "", dob: "" }]);
  }

  function removeKid(i: number) {
    setEditKids((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateKid(i: number, field: "name" | "dob" | "gender", val: string) {
    setEditKids((prev) => prev.map((k, idx) => idx === i ? { ...k, [field]: val } : k));
  }

  function saveEdit() {
    let valid = true;
    if (!editName.trim()) { setNameError(true); valid = false; }
    if (!editAddress.trim()) { setAddressError(true); valid = false; }
    if (!valid) return;

    register({
      phone: user!.phone,
      name: editName.trim(),
      address: editAddress.trim(),
      addressLat: editAddressLat,
      addressLng: editAddressLng,
      dob: editDob || undefined,
      kids: editKids.filter((k) => k.name.trim()),
      avatar: editAvatar || undefined,
    });
    setEditing(false);
  }

  function doLogout() {
    logout();
    window.location.href = "/";
  }

  const mapSrc = (lat?: number, lng?: number) => {
    if (!lat || !lng) return null;
    const d = 0.005;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - d}%2C${lat - d}%2C${lng + d}%2C${lat + d}&layer=mapnik&marker=${lat}%2C${lng}`;
  };

  const appRows: { Icon: React.ElementType; label: string; value: string; href?: string }[] = [
    { Icon: Info,          label: t.profileAbout,    value: "", href: "/about" },
    { Icon: MessageSquare, label: t.profileFeedback, value: "", href: "/feedback" },
    { Icon: HelpCircle,    label: t.profileHelp,     value: "", href: "/help" },
  ];

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col pb-28">
      <style>{`
        @keyframes gold-shimmer {
          0%        { transform: translateX(-150%); }
          60%, 100% { transform: translateX(150%);  }
        }
      `}</style>

      {/* Header */}
      <div
        className="px-5 pt-12 pb-8"
        style={{
          background: "linear-gradient(160deg, #0F1E3C 0%, #1A3A6C 60%, #2563EB 100%)",
          borderRadius: "0 0 32px 32px",
        }}
      >
        <div className="mb-5">
          <p className="text-[#93C5FD] text-xs font-jakarta font-semibold tracking-widest uppercase">TangselKids</p>
          <h1 className="text-white text-3xl font-bold leading-tight mt-0.5"
              style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}>
            {t.profileTitle}
          </h1>
        </div>

        {/* Avatar card */}
        <div className="rounded-2xl p-4 flex items-center gap-4" style={{ background: "rgba(255,255,255,0.12)" }}>
          {(() => {
            const meta = getAvatarMeta(user?.avatar);
            return (
              <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: meta
                    ? (meta.type === "emoji" ? meta.bg : "transparent")
                    : "rgba(255,255,255,0.2)",
                  overflow: "clip",
                  border: meta ? "2px solid rgba(255,255,255,0.3)" : "none",
                }}>
                {meta?.type === "photo" ? (
                  <img src={meta.src} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="avatar" />
                ) : meta?.type === "emoji" ? (
                  <span style={{ fontSize: 28 }}>{meta.emoji}</span>
                ) : (
                  <User size={28} color="white" strokeWidth={1.5} />
                )}
              </div>
            );
          })()}
          <div className="flex-1 min-w-0">
            <p className="text-white text-lg font-semibold leading-tight truncate"
               style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}>
              {user?.name || t.profileGuest}
            </p>
            <p className="font-jakarta text-white/60 text-xs mt-0.5 leading-snug">
              {user?.phone || t.profileGuestDesc}
            </p>
            {tier === "premium" && (
              <div style={{
                marginTop: 6, display: "inline-flex", alignItems: "center", gap: 4,
                position: "relative", overflow: "hidden",
                background: "linear-gradient(135deg, #78350f 0%, #b45309 25%, #d97706 50%, #fbbf24 68%, #b45309 85%, #78350f 100%)",
                borderRadius: 999, padding: "2px 9px",
                boxShadow: "0 2px 8px rgba(217,119,6,0.5)",
              }}>
                <span style={{
                  fontSize: 10, fontWeight: 800, color: "#fff",
                  letterSpacing: 1.1, fontFamily: "var(--font-jakarta), sans-serif",
                  position: "relative",
                }}>
                  {user?.lifetime ? t.profileLifetimeBadge : "👑 PREMIUM"}
                </span>
                {/* Shimmer */}
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.32) 50%, transparent 65%)",
                  animation: "gold-shimmer 2.8s ease-in-out infinite",
                  pointerEvents: "none",
                }} />
              </div>
            )}
          </div>
          {!editing && (
            <ActionButton
              onClick={tier === "guest" ? () => setShowGuestGate(true) : openEdit}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "7px 12px", borderRadius: 999, flexShrink: 0,
                background: "rgba(246,181,69,1)", color: "#3a2304",
                fontSize: 12, fontWeight: 700,
              }}
            >
              <Pencil size={13} />
              Profile
            </ActionButton>
          )}
        </div>
      </div>

      <div className="px-5 py-5 space-y-5">

        {/* ── TIER CARD ───────────────────────────────────────────────────── */}
        {tier === "premium" ? (
          <div className="rounded-2xl p-4 flex items-center gap-3"
               style={{
                 position: "relative", overflow: "hidden",
                 background: "linear-gradient(135deg, #78350f 0%, #b45309 25%, #d97706 50%, #fbbf24 68%, #b45309 85%, #78350f 100%)",
                 color: "#fff",
                 boxShadow: "0 4px 20px rgba(217,119,6,0.45)",
               }}>
            {/* Shimmer sweep */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.28) 50%, transparent 65%)",
              animation: "gold-shimmer 2.8s ease-in-out infinite",
              pointerEvents: "none",
            }} />
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                 style={{ background: "rgba(0,0,0,0.18)", fontSize: 22, position: "relative" }}>
              {user?.lifetime ? "👑" : "⭐"}
            </div>
            <div className="flex-1" style={{ position: "relative" }}>
              <p className="font-jakarta font-bold text-sm">
                {user?.lifetime ? t.profileLifetimeStatus : t.profilePremiumStatus}
              </p>
              <p className="font-jakarta text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.75)" }}>
                {user?.lifetime
                  ? t.profileLifetimeDesc
                  : <>
                      {t.profilePremiumDesc}{" "}
                      {user?.premiumExpiresAt
                        ? new Date(user.premiumExpiresAt).toLocaleDateString(lang === "en" ? "en-GB" : "id-ID", { day: "numeric", month: "long", year: "numeric" })
                        : "—"}
                    </>}
              </p>
            </div>
            <span className="font-jakarta text-xs font-bold px-2 py-1 rounded-full"
                  style={{ background: "rgba(0,0,0,0.20)", color: "#fef9c3", position: "relative" }}>
              {user?.lifetime ? "LIFETIME" : "PREMIUM"}
            </span>
          </div>
        ) : tier === "guest" ? (
          <div className="rounded-2xl p-4 border-2"
               style={{ borderColor: "#f59e0b", background: "#fffbeb" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                   style={{ background: "#fef3c7", fontSize: 22 }}>🔓</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="font-jakarta font-bold text-sm text-amber-900">{t.profileGuestStatus}</p>
                <p className="font-jakarta text-xs text-amber-700 mt-1" style={{ lineHeight: 1.5 }}>
                  {t.profileGuestStatusDesc}
                </p>
              </div>
              <ActionButton
                onClick={openRegisterSheet}
                style={{
                  padding: "7px 12px", borderRadius: 999, flexShrink: 0,
                  background: "linear-gradient(135deg, #16a34a, #22c55e)",
                  color: "#fff", fontSize: 11, fontWeight: 800,
                  touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                  fontFamily: "var(--font-jakarta), sans-serif",
                  whiteSpace: "nowrap",
                }}
              >
                {t.profileGuestRegister}
              </ActionButton>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl p-4 flex items-center gap-3 border-2"
               style={{ borderColor: "#f59e0b", background: "#fffbeb" }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                 style={{ background: "#fef3c7", fontSize: 22 }}>🔓</div>
            <div className="flex-1">
              <p className="font-jakarta font-bold text-sm text-amber-900">{t.profileFreeStatus}</p>
              <p className="font-jakarta text-xs text-amber-700 mt-0.5">
                {t.profileFreeStatusDesc}
              </p>
            </div>
            <ActionButton
              onClick={() => router.push("/upgrade")}
              style={{
                padding: "7px 12px", borderRadius: 999, flexShrink: 0,
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                color: "#fff", fontSize: 11, fontWeight: 800,
                touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                fontFamily: "var(--font-jakarta), sans-serif",
              }}
            >
              {t.profileFreeUpgradeBtn}
            </ActionButton>
          </div>
        )}

        {/* ── EDIT FORM ───────────────────────────────────────────────────── */}
        {editing && (
          <section>
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-xs font-jakarta font-semibold uppercase tracking-widest" style={{ color: "var(--tk-muted)" }}>
                Edit My Info
              </p>
              <ActionButton
                onClick={cancelEdit}
                style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px",
                  borderRadius: 999, background: "#f1f5f9", color: "#64748b", fontSize: 12, fontWeight: 600 }}
              >
                <X size={13} /> Cancel
              </ActionButton>
            </div>

            <div className="rounded-2xl p-4 space-y-4"
                 style={{ background: "#fff", border: "1px solid var(--tk-line)", boxShadow: "0 1px 0 rgba(15,23,42,0.04), 0 6px 16px rgba(15,23,42,0.06)" }}>

              {/* Avatar */}
              <div>
                <label className="block font-jakarta text-xs font-semibold mb-2" style={{ color: "var(--tk-muted)" }}>
                  Photo / Avatar <span style={{ color: "var(--tk-muted)", fontWeight: 400 }}>(optional)</span>
                </label>
                {/* Preview + upload button */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 999, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    overflow: "clip",
                    background: editAvatar
                      ? (editAvatar.startsWith("data:")
                          ? "transparent"
                          : (PREMADE_AVATARS.find(a => a.id === editAvatar)?.bg ?? "#f1f5f9"))
                      : "#f1f5f9",
                    border: "2px solid #e2e8f0",
                  }}>
                    {editAvatar && editAvatar.startsWith("data:") ? (
                      <img src={editAvatar} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="avatar" />
                    ) : editAvatar ? (
                      <span style={{ fontSize: 26 }}>{PREMADE_AVATARS.find(a => a.id === editAvatar)?.emoji}</span>
                    ) : (
                      <Camera size={20} color="#94a3b8" strokeWidth={1.75} />
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <ActionButton
                      onClick={() => photoInputRef.current?.click()}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        padding: "7px 14px", borderRadius: 10,
                        background: "#f1f5f9", color: "#475569",
                        fontSize: 12, fontWeight: 700,
                        border: "1.5px solid #e2e8f0",
                      }}
                    >
                      <Camera size={13} /> Upload Photo
                    </ActionButton>
                    {editAvatar && (
                      <ActionButton
                        onClick={() => setEditAvatar("")}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 5,
                          padding: "5px 12px", borderRadius: 10,
                          background: "#fee2e2", color: "#ef4444",
                          fontSize: 11, fontWeight: 700,
                        }}
                      >
                        <X size={11} strokeWidth={3} /> Remove
                      </ActionButton>
                    )}
                  </div>
                </div>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const dataUrl = await resizeImageToDataUrl(file);
                    setEditAvatar(dataUrl);
                    e.target.value = "";
                  }}
                />
                {/* Premade row — 6 avatars, single row */}
                <div style={{ display: "flex", gap: 8 }}>
                  {PREMADE_AVATARS.slice(0, 6).map((a) => (
                    <label key={a.id} style={{ cursor: "pointer", flex: 1 }}>
                      <input
                        type="radio"
                        name="profile-avatar"
                        value={a.id}
                        checked={editAvatar === a.id}
                        onChange={() => setEditAvatar(a.id)}
                        style={{ position: "absolute", opacity: 0, width: 1, height: 1 }}
                      />
                      <div style={{
                        width: "100%", aspectRatio: "1", borderRadius: 12,
                        background: a.bg, display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: 20,
                        border: editAvatar === a.id ? "2.5px solid #1d4ed8" : "2px solid transparent",
                        boxShadow: editAvatar === a.id ? "0 0 0 3px #bfdbfe" : "none",
                      }}>
                        {a.emoji}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block font-jakarta text-xs font-semibold mb-1.5" style={{ color: "var(--tk-muted)" }}>
                  Name <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => { setEditName(e.target.value); setNameError(false); }}
                  placeholder="Full name"
                  style={{
                    width: "100%", padding: "11px 14px", borderRadius: 12, fontSize: 14,
                    fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 600, outline: "none",
                    border: `1.5px solid ${nameError ? "#ef4444" : "#e2e8f0"}`,
                    color: "var(--tk-ink)", background: nameError ? "#fff5f5" : "#f8fafc",
                    boxSizing: "border-box",
                  }}
                />
                {nameError && <p style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>Name is required</p>}
              </div>

              {/* Address */}
              <div>
                <label className="block font-jakarta text-xs font-semibold mb-1.5" style={{ color: "var(--tk-muted)" }}>
                  Home Address <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <textarea
                  value={editAddress}
                  onChange={(e) => { setEditAddress(e.target.value); setAddressError(false);
                    setEditAddressLat(undefined); setEditAddressLng(undefined); }}
                  rows={3}
                  placeholder="Jl. Contoh No. 1, Bintaro Sektor 7..."
                  style={{
                    width: "100%", padding: "11px 14px", borderRadius: 12, fontSize: 13,
                    fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 500, outline: "none", resize: "none",
                    border: `1.5px solid ${addressError ? "#ef4444" : "#e2e8f0"}`,
                    color: "var(--tk-ink)", background: addressError ? "#fff5f5" : "#f8fafc",
                    boxSizing: "border-box",
                  }}
                />
                <ActionButton
                  onClick={useMyLocation}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8,
                    padding: "8px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700,
                    background: "#EFF6FF", color: "#1d4ed8", touchAction: "manipulation",
                  }}
                >
                  <MapPin size={14} />
                  {geoLoading ? "Detecting…" : "Use my location"}
                </ActionButton>
                {geoError && (
                  <p style={{ fontSize: 12, color: "#f59e0b", marginTop: 6, lineHeight: 1.4, fontWeight: 500 }}>
                    ⚠ {geoError}
                  </p>
                )}
                {addressError && <p style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>Address is required</p>}

                {/* Map preview */}
                {editAddressLat && editAddressLng && (
                  <div style={{ marginTop: 10, borderRadius: 12, overflow: "clip", height: 160 }}>
                    <iframe
                      src={mapSrc(editAddressLat, editAddressLng)!}
                      style={{ width: "100%", height: "100%", border: "none" }}
                      title="Selected location"
                    />
                  </div>
                )}
              </div>

              {/* DOB */}
              <div>
                <label className="block font-jakarta text-xs font-semibold mb-1.5" style={{ color: "var(--tk-muted)" }}>
                  Date of Birth <span style={{ color: "var(--tk-muted)", fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  type="date"
                  value={editDob}
                  onChange={(e) => setEditDob(e.target.value)}
                  style={{
                    width: "100%", padding: "11px 14px", borderRadius: 12, fontSize: 14,
                    fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 500, outline: "none",
                    border: "1.5px solid #e2e8f0", color: "var(--tk-ink)", background: "#f8fafc",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Kids */}
              <div>
                <label className="block font-jakarta text-xs font-semibold mb-2" style={{ color: "var(--tk-muted)" }}>
                  Kids <span style={{ color: "var(--tk-muted)", fontWeight: 400 }}>(optional)</span>
                </label>
                {editKids.map((kid, i) => (
                  <div key={i} style={{ marginBottom: 12, background: "#f8fafc", borderRadius: 12, padding: "10px 12px", border: "1.5px solid #e2e8f0", position: "relative" }}>
                    <ActionButton
                      onClick={() => removeKid(i)}
                      style={{
                        position: "absolute", top: 10, right: 10,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        width: 28, height: 28, borderRadius: 999, flexShrink: 0,
                        background: "#FEE2E2", color: "#ef4444",
                      }}
                    >
                      <Trash2 size={13} />
                    </ActionButton>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingRight: 36 }}>
                      <input
                        type="text"
                        value={kid.name}
                        onChange={(e) => updateKid(i, "name", e.target.value)}
                        placeholder="Kid's name"
                        style={{
                          width: "100%", padding: "9px 12px", borderRadius: 10, fontSize: 13,
                          fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 600, outline: "none",
                          border: "1.5px solid #e2e8f0", color: "var(--tk-ink)", background: "#fff",
                          boxSizing: "border-box",
                        }}
                      />
                      <input
                        type="date"
                        value={kid.dob}
                        onChange={(e) => updateKid(i, "dob", e.target.value)}
                        style={{
                          width: "100%", padding: "9px 12px", borderRadius: 10, fontSize: 13,
                          fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 500, outline: "none",
                          border: "1.5px solid #e2e8f0", color: "var(--tk-ink)", background: "#fff",
                          boxSizing: "border-box",
                        }}
                      />
                      {/* Gender */}
                      <div style={{ display: "flex", gap: 8 }}>
                        {(["male", "female"] as const).map((g) => (
                          <label key={g} style={{ cursor: "pointer", flex: 1 }}>
                            <input
                              type="radio"
                              name={`profile-kid-gender-${i}`}
                              value={g}
                              checked={kid.gender === g}
                              onChange={() => updateKid(i, "gender", g)}
                              style={{ position: "absolute", opacity: 0, width: 1, height: 1 }}
                            />
                            <div style={{
                              textAlign: "center", padding: "6px 4px", borderRadius: 8,
                              fontSize: 12, fontWeight: 700,
                              border: kid.gender === g ? "2px solid #1d4ed8" : "1.5px solid #e2e8f0",
                              background: kid.gender === g ? "#eff6ff" : "#fff",
                              color: kid.gender === g ? "#1d4ed8" : "#64748b",
                            }}>
                              {g === "male" ? "👦 Boy" : "👧 Girl"}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                <ActionButton
                  onClick={addKid}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "8px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700,
                    background: "#F0FDF4", color: "#16a34a",
                  }}
                >
                  <Plus size={14} /> Add Kid
                </ActionButton>
              </div>

              {/* Save button */}
              <ActionButton
                onClick={saveEdit}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  width: "100%", padding: "14px 0", borderRadius: 14, marginTop: 4,
                  background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)",
                  color: "#fff", fontSize: 15, fontWeight: 700,
                }}
              >
                <Check size={17} /> Save Changes
              </ActionButton>
            </div>
          </section>
        )}

        {/* Activity stats — compact single row */}
        <section>
          <p className="text-xs font-jakarta font-semibold uppercase tracking-widest mb-2 px-1" style={{ color: "var(--tk-muted)" }}>
            {t.profileSectionStats}
          </p>
          <div className="rounded-2xl flex overflow-hidden divide-x"
               style={{ background: "#fff", border: "1px solid var(--tk-line)", boxShadow: "0 1px 0 rgba(15,23,42,0.04), 0 6px 16px rgba(15,23,42,0.06)", borderColor: "var(--tk-line)" }}>
            {tier === "guest" ? (
              <ActionButton onClick={() => setShowGuestGate(true)} style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "transparent" }}>
                <Heart size={18} strokeWidth={1.75} style={{ color: "var(--tk-blue-700)", flexShrink: 0 }} />
                <span className="font-jakarta text-sm font-semibold" style={{ color: "var(--tk-ink)" }}>{t.profileStatSaved}</span>
                <span className="ml-auto font-bold text-base" style={{ color: "var(--tk-ink)", fontFamily: "var(--font-fraunces), Georgia, serif" }}>—</span>
              </ActionButton>
            ) : (
              <Link href="/saved" className="flex-1 flex items-center gap-3 px-4 py-3">
                <Heart size={18} strokeWidth={1.75} style={{ color: "var(--tk-blue-700)", flexShrink: 0 }} />
                <span className="font-jakarta text-sm font-semibold" style={{ color: "var(--tk-ink)" }}>{t.profileStatSaved}</span>
                <span className="ml-auto font-bold text-base" style={{ color: "var(--tk-ink)", fontFamily: "var(--font-fraunces), Georgia, serif" }}>{savedCount}</span>
              </Link>
            )}
            {tier === "guest" ? (
              <ActionButton onClick={() => setShowPremiumSheet(true)} style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "transparent" }}>
                <Pencil size={18} strokeWidth={1.75} style={{ color: "var(--tk-blue-700)", flexShrink: 0 }} />
                <span className="font-jakarta text-sm font-semibold" style={{ color: "var(--tk-ink)" }}>{t.profileStatReviews}</span>
                <span className="ml-auto font-bold text-base" style={{ color: "var(--tk-ink)", fontFamily: "var(--font-fraunces), Georgia, serif" }}>—</span>
              </ActionButton>
            ) : tier === "free" ? (
              <ActionButton onClick={() => setShowUpgradeSheet(true)} style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "transparent" }}>
                <Pencil size={18} strokeWidth={1.75} style={{ color: "var(--tk-blue-700)", flexShrink: 0 }} />
                <span className="font-jakarta text-sm font-semibold" style={{ color: "var(--tk-ink)" }}>{t.profileStatReviews}</span>
                <span className="ml-auto font-bold text-base" style={{ color: "var(--tk-ink)", fontFamily: "var(--font-fraunces), Georgia, serif" }}>—</span>
              </ActionButton>
            ) : (
              <Link href="/my-reviews" className="flex-1 flex items-center gap-3 px-4 py-3">
                <Pencil size={18} strokeWidth={1.75} style={{ color: "var(--tk-blue-700)", flexShrink: 0 }} />
                <span className="font-jakarta text-sm font-semibold" style={{ color: "var(--tk-ink)" }}>{t.profileStatReviews}</span>
                <span className="ml-auto font-bold text-base" style={{ color: "var(--tk-ink)", fontFamily: "var(--font-fraunces), Georgia, serif" }}>{reviewsCount}</span>
              </Link>
            )}
          </div>
        </section>

        {/* Preferences */}
        <section>
          <p className="text-xs font-jakarta font-semibold uppercase tracking-widest mb-2 px-1" style={{ color: "var(--tk-muted)" }}>
            {t.profileSectionPref}
          </p>
          <div className="rounded-2xl"
               style={{ background: "#fff", border: "1px solid var(--tk-line)", boxShadow: "0 1px 0 rgba(15,23,42,0.04), 0 6px 16px rgba(15,23,42,0.06)", borderColor: "var(--tk-line)", overflow: "clip" }}>
            <div className="flex items-center gap-3 px-4 py-3">
              <Globe size={20} strokeWidth={1.75} style={{ color: "var(--tk-muted)" }} className="w-7 flex-shrink-0" />
              <span className="flex-1 font-jakarta text-sm font-semibold" style={{ color: "var(--tk-ink)" }}>{t.profileLang}</span>
              <LangToggle variant="dark" />
            </div>
          </div>
        </section>

        {/* App */}
        <section>
          <p className="text-xs font-jakarta font-semibold uppercase tracking-widest mb-2 px-1" style={{ color: "var(--tk-muted)" }}>
            {t.profileSectionApp}
          </p>
          <div className="rounded-2xl overflow-hidden divide-y"
               style={{ background: "#fff", border: "1px solid var(--tk-line)", boxShadow: "0 1px 0 rgba(15,23,42,0.04), 0 6px 16px rgba(15,23,42,0.06)", borderColor: "var(--tk-line)" }}>
            {appRows.map((row) => {
              const inner = (
                <>
                  <row.Icon size={20} strokeWidth={1.75} style={{ color: "var(--tk-muted)" }} className="w-7 flex-shrink-0" />
                  <span className="flex-1 font-jakarta text-sm font-semibold" style={{ color: "var(--tk-ink)" }}>{row.label}</span>
                  {row.value && <span className="font-jakarta text-xs" style={{ color: "var(--tk-muted)" }}>{row.value}</span>}
                  <ChevronRight size={16} style={{ color: "var(--tk-line)" }} />
                </>
              );
              return row.href ? (
                <Link key={row.label} href={row.href} className="flex items-center gap-3 px-4 py-3.5">
                  {inner}
                </Link>
              ) : (
                <div key={row.label} className="flex items-center gap-3 px-4 py-3.5">
                  {inner}
                </div>
              );
            })}
          </div>
        </section>

        {/* Logout */}
        <section>
          <ActionButton
            onClick={doLogout}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              width: "100%", padding: "13px 0", borderRadius: 14,
              background: "#FEF2F2", color: "#ef4444", fontSize: 14, fontWeight: 700,
            }}
          >
            <LogOut size={17} /> Log Out
          </ActionButton>
        </section>

        {/* Footer */}
        <div className="text-center pt-4 pb-2">
          <p className="text-lg font-bold" style={{ color: "var(--tk-ink)", fontFamily: "var(--font-fraunces), Georgia, serif" }}>TangselKids</p>
          <p className="font-jakarta text-xs mt-1" style={{ color: "var(--tk-muted)" }}>Bintaro · Tangerang Selatan</p>
          <p className="font-jakarta text-[10px] mt-3" style={{ color: "var(--tk-line)" }}>Made with ♥ for parents in Tangsel</p>
        </div>
      </div>

      <BottomNav active="profile" />
      <FilterGateSheet isOpen={showGuestGate} onClose={() => setShowGuestGate(false)} />
      <PremiumGuestSheet isOpen={showPremiumSheet} onClose={() => setShowPremiumSheet(false)} />

      {/* Upgrade sheet — registered → premium */}
      {showUpgradeSheet && (
        <>
          <style>{`
            @keyframes pu-fade-in  { from { opacity: 0; } to { opacity: 1; } }
            @keyframes pu-slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
          `}</style>
          <div
            onClick={() => setShowUpgradeSheet(false)}
            style={{ position: "fixed", inset: 0, zIndex: 1000,
              background: "rgba(0,0,0,0.45)", animation: "pu-fade-in 0.25s ease both" }}
          />
          <div
            style={{ position: "fixed", bottom: 0, left: 0, right: 0,
              maxWidth: 448, margin: "0 auto",
              background: "#fff", borderRadius: "24px 24px 0 0",
              padding: "20px 20px 40px", zIndex: 1001,
              boxShadow: "0 -8px 40px rgba(0,0,0,0.20)",
              animation: "pu-slide-up 0.38s cubic-bezier(0.32,0.72,0,1) both" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ width: 36, height: 4, borderRadius: 999, background: "#e2e8f0", margin: "0 auto 24px" }} />
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: 999,
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30 }}>
                ⭐
              </div>
            </div>
            <p style={{ fontFamily: "var(--font-fraunces), Georgia, serif",
              fontSize: 20, fontWeight: 700, color: "#1E3A5F",
              textAlign: "center", margin: "0 0 8px" }}>
              {t.premiumGateTitle}
            </p>
            <p style={{ fontFamily: "var(--font-jakarta), sans-serif",
              fontSize: 13, color: "#64748b", lineHeight: 1.6,
              textAlign: "center", margin: "0 0 24px" }}>
              {t.premiumGateDesc}
            </p>
            <ActionButton
              onClick={() => { setShowUpgradeSheet(false); router.push("/upgrade"); }}
              style={{ width: "100%", padding: "15px 0", borderRadius: 16, border: "none",
                background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#fff",
                fontFamily: "var(--font-jakarta), sans-serif",
                fontSize: 15, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                touchAction: "manipulation", WebkitTapHighlightColor: "transparent" } as React.CSSProperties}
            >
              {t.premiumGateCta}
            </ActionButton>
            <ActionButton
              onClick={() => setShowUpgradeSheet(false)}
              style={{ width: "100%", marginTop: 10, padding: "13px 0", borderRadius: 16, border: "none",
                background: "#f1f5f9", color: "#64748b",
                fontFamily: "var(--font-jakarta), sans-serif",
                fontSize: 14, fontWeight: 600,
                display: "flex", alignItems: "center", justifyContent: "center",
                touchAction: "manipulation", WebkitTapHighlightColor: "transparent" } as React.CSSProperties}
            >
              {t.premiumGateCancel}
            </ActionButton>
          </div>
        </>
      )}
    </div>
  );
}
