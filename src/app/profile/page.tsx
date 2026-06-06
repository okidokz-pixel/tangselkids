"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  User, Globe, Bell, Info, MessageSquare, HelpCircle,
  ChevronRight, Heart, Pencil, LogOut, MapPin,
  Calendar, Baby, Plus, Trash2, Check, X, FileText, Camera, Crown,
} from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { LangToggle } from "@/components/LangToggle";
import { BottomNav } from "@/components/BottomNav";
import { ActionButton } from "@/components/ActionButton";
import { useAuth, type Kid } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useRegisterSheet } from "@/context/RegisterSheetContext";
import { useLoginSheet } from "@/context/LoginSheetContext";
import { getReviews } from "@/lib/reviewsStorage";
import { getAllNotes, type FacilityNote } from "@/lib/notesStorage";
import { MapPicker } from "@/components/MapPicker";
import { ImageCropper } from "@/components/ImageCropper";
import { PremiumBadge } from "@/components/PremiumBadge";

// ── Support WhatsApp number ───────────────────────────────────────────────────
const SUPPORT_WA_NUMBER = "6281234567890"; // TODO: replace with real support number

function WhatsAppIcon({ size = 18, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

export default function ProfilePage() {
  const { t, lang } = useLang();
  const { user, register, logout, tier } = useAuth();
  const router = useRouter();
  const { openRegisterSheet } = useRegisterSheet();
  const { openLoginSheet } = useLoginSheet();
  const [savedCount,    setSavedCount]    = useState(0);
  const [reviewsCount,  setReviewsCount]  = useState(0);
  const [myNotes,       setMyNotes]       = useState<FacilityNote[]>([]);
  const [profilePhoto, setProfilePhoto] = useState("");
  const [cropperSrc, setCropperSrc] = useState("");
  const [showCropper, setShowCropper] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit mode state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editAddressLat, setEditAddressLat] = useState<number | undefined>(undefined);
  const [editAddressLng, setEditAddressLng] = useState<number | undefined>(undefined);
  const [editDob, setEditDob] = useState("");
  const [editKids, setEditKids] = useState<Kid[]>([]);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState("");
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [addressError, setAddressError] = useState(false);

  useEffect(() => {
    const ids: string[] = JSON.parse(localStorage.getItem("savedIds") || "[]");
    setSavedCount(ids.length);
    setReviewsCount(getReviews().length);
    setMyNotes(getAllNotes());
    const photo = localStorage.getItem("profilePhoto");
    if (photo) setProfilePhoto(photo);
  }, []);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("edit") === "1" && user) {
      openEdit();
      router.replace("/profile", { scroll: false });
    }
  }, [user]);

  function openEdit() {
    if (!user) return;
    setEditName(user.name);
    setEditAddress(user.address);
    setEditAddressLat(user.addressLat);
    setEditAddressLng(user.addressLng);
    setEditDob(user.dob || "");
    setEditKids((user.kids ?? []).map((k) => ({ ...k })));
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
          const res = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`);
          const data = await res.json();
          const addr = data.results?.[0]?.formatted_address;
          setEditAddress(addr || `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
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

  async function saveEdit() {
    let valid = true;
    if (!editName.trim()) { setNameError(true); valid = false; }
    if (!editAddress.trim()) { setAddressError(true); valid = false; }
    if (!valid) return;

    // If no pin coordinates, silently geocode the typed address via Nominatim
    let lat = editAddressLat;
    let lng = editAddressLng;
    if (!lat || !lng) {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(editAddress.trim())}&limit=1&countrycodes=id`
        );
        const results = await res.json();
        if (results?.[0]) {
          lat = parseFloat(results[0].lat);
          lng = parseFloat(results[0].lon);
        }
      } catch {}
    }

    register({
      phone: user!.phone,
      name: editName.trim(),
      address: editAddress.trim(),
      addressLat: lat,
      addressLng: lng,
      dob: editDob || undefined,
      kids: editKids.filter((k) => k.name.trim()),
    });
    setEditing(false);
  }

  function doLogout() {
    logout();
    window.location.href = "/";
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
        @keyframes upgrade-arrow {
          0%, 100% { transform: translateX(0); }
          50%       { transform: translateX(4px); }
        }
        @keyframes upgrade-pulse {
          0%, 100% { box-shadow: 0 4px 12px rgba(217,119,6,0.35); }
          50%       { box-shadow: 0 4px 20px rgba(217,119,6,0.75), 0 0 0 6px rgba(245,158,11,0.18); }
        }
        @keyframes edit-modal-backdrop {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes edit-modal-in {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);   }
        }
      `}</style>

      {/* Header */}
      <div
        className="px-5 pt-7 pb-8"
        style={{
          background: "linear-gradient(160deg, #0a2018 0%, #1f6b43 60%, #2e8a5a 100%)",
          borderRadius: "0 0 32px 32px",
        }}
      >
        <div className="mb-5">
          <p className="text-[#a8d5ba] text-xs font-jakarta font-semibold tracking-widest uppercase">TangselKids</p>
          <h1 className="text-white text-3xl font-bold leading-tight mt-0.5"
              style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}>
            {t.profileTitle}
          </h1>
        </div>

        {/* Profile card */}
        <div className="rounded-2xl p-4 flex items-center gap-4" style={{ background: "rgba(255,255,255,0.12)" }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: (profilePhoto && user) ? "transparent" : (user ? "#0e1d4f" : "rgba(255,255,255,0.2)"),
              border: "2px solid rgba(255,255,255,0.3)",
              fontSize: 24, fontWeight: 700, color: "#fff",
              fontFamily: "var(--font-jakarta), sans-serif",
              overflow: "clip",
            }}>
            {profilePhoto && user
              ? <img src={profilePhoto} alt="" style={{ width: 56, height: 56, objectFit: "cover" }} />
              : user ? (user.name?.charAt(0).toUpperCase() || "?") : <User size={28} color="white" strokeWidth={1.5} />
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-lg font-semibold leading-tight truncate"
               style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}>
              {user?.name || t.profileGuest}
            </p>
            <p className="font-jakarta text-white/60 text-xs mt-0.5 leading-snug">
              {user?.phone || t.profileGuestDesc}
            </p>
            {!user && (
              <ActionButton
                onClick={openLoginSheet}
                style={{
                  marginTop: 6, display: "inline-flex", alignItems: "center", gap: 3,
                  fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)",
                  background: "transparent",
                  fontFamily: "var(--font-jakarta), sans-serif",
                  touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                }}
              >
                Sudah punya akun? Masuk &rsaquo;
              </ActionButton>
            )}
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
          {!!user && !editing && (
            <ActionButton
              onClick={openEdit}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "7px 12px", borderRadius: 999, flexShrink: 0,
                background: "rgba(246,181,69,1)", color: "#3a2304",
                fontSize: 12, fontWeight: 700,
              }}
            >
              <Pencil size={13} />
              Edit Profil
            </ActionButton>
          )}
          {!user && (
            <ActionButton
              onClick={() => openRegisterSheet()}
              style={{
                display: "inline-flex", alignItems: "center",
                padding: "7px 14px", borderRadius: 999, flexShrink: 0,
                background: "rgba(255,255,255,0.20)", color: "#fff",
                fontSize: 12, fontWeight: 700,
                fontFamily: "var(--font-jakarta), sans-serif",
              }}
            >
              Daftar Gratis &rsaquo;
            </ActionButton>
          )}
        </div>
      </div>

      <div className="px-5 py-5 space-y-5">


        {/* ── EDIT FORM (centered modal) ───────────────────────────────────── */}
        {editing && (
          <div
            style={{
              position: "fixed", inset: 0, zIndex: 300,
              background: "rgba(10,32,24,0.55)",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "20px 16px",
              animation: "edit-modal-backdrop 0.22s ease both",
            }}
          >
            <div
              style={{
                background: "#fff", borderRadius: 20,
                width: "100%", maxWidth: 480,
                maxHeight: "85vh", overflowY: "auto",
                boxShadow: "0 24px 64px rgba(10,32,24,0.22)",
                animation: "edit-modal-in 0.26s cubic-bezier(0.32,0.72,0,1) both",
              }}
            >
              {/* Modal header */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "16px 20px 12px",
                borderBottom: "1px solid var(--tk-line)",
                position: "sticky", top: 0, background: "#fff", zIndex: 1,
                borderRadius: "20px 20px 0 0",
              }}>
                <p className="font-jakarta font-bold" style={{ fontSize: 16, color: "var(--tk-ink)" }}>
                  Edit My Info
                </p>
                <ActionButton
                  onClick={cancelEdit}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: 32, height: 32, borderRadius: 999,
                    background: "#f1f5f9", color: "#64748b",
                  }}
                >
                  <X size={16} />
                </ActionButton>
              </div>

            <div className="space-y-4" style={{ padding: "16px 20px 20px" }}>

              {/* Profile Photo */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 4 }}>
                <div style={{ position: "relative" }}>
                  <ActionButton
                    onClick={() => {
                      if (profilePhoto) {
                        setCropperSrc(profilePhoto);
                        setShowCropper(true);
                      } else {
                        fileInputRef.current?.click();
                      }
                    }}
                    style={{
                      width: 80, height: 80, borderRadius: 999,
                      background: profilePhoto ? "transparent" : "#e6f4ed",
                      border: "2.5px solid #2e8a5a",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      overflow: "clip", padding: 0,
                    }}
                  >
                    {profilePhoto
                      ? <img src={profilePhoto} alt="" style={{ width: 80, height: 80, objectFit: "cover" }} />
                      : <User size={36} color="#2e8a5a" strokeWidth={1.5} />
                    }
                  </ActionButton>
                  <div style={{
                    position: "absolute", bottom: 2, right: 2,
                    width: 22, height: 22, borderRadius: 999,
                    background: "#2e8a5a", border: "2px solid #fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    pointerEvents: "none",
                  }}>
                    <Camera size={11} color="#fff" />
                  </div>
                </div>
                <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 8, fontWeight: 600, fontFamily: "var(--font-jakarta), sans-serif" }}>
                  {profilePhoto ? "Tap to re-crop" : "Tap to add photo"}
                </p>
                {/* Upload new / Delete */}
                <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                  {profilePhoto && (
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
                      <Camera size={11} /> Change photo
                    </ActionButton>
                  )}
                  {profilePhoto && (
                    <ActionButton
                      onClick={() => {
                        localStorage.removeItem("profilePhoto");
                        setProfilePhoto("");
                      }}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        padding: "5px 10px", borderRadius: 999,
                        background: "#fef2f2", color: "#ef4444",
                        fontSize: 11, fontWeight: 700,
                        border: "1.5px solid #fecaca",
                      }}
                    >
                      <Trash2 size={11} /> Remove photo
                    </ActionButton>
                  )}
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
                    color: "var(--tk-ink)", background: nameError ? "#fff5f5" : "#f6f1e8",
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
                    color: "var(--tk-ink)", background: addressError ? "#fff5f5" : "#f6f1e8",
                    boxSizing: "border-box",
                  }}
                />
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <ActionButton
                    onClick={useMyLocation}
                    style={{
                      flex: 1,
                      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                      padding: "8px 10px", borderRadius: 10, fontSize: 12, fontWeight: 700,
                      background: "#e6f4ed", color: "#2e8a5a", touchAction: "manipulation",
                      border: "1.5px solid #a7d4bc",
                    }}
                  >
                    <MapPin size={14} />
                    {geoLoading ? t.obLocating : t.obUseLocation}
                  </ActionButton>
                  <ActionButton
                    onClick={() => setShowMapPicker(true)}
                    style={{
                      flex: 1,
                      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                      padding: "8px 10px", borderRadius: 10, fontSize: 12, fontWeight: 700,
                      background: "#f0fdf4", color: "#16a34a", touchAction: "manipulation",
                      border: "1.5px solid #bbf7d0",
                    }}
                  >
                    <MapPin size={14} /> {t.obSearchOnMap}
                  </ActionButton>
                </div>
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
                    border: "1.5px solid #e2e8f0", color: "var(--tk-ink)", background: "#f6f1e8",
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
                  <div key={i} style={{ marginBottom: 12, background: "#f6f1e8", borderRadius: 12, padding: "10px 12px", border: "1.5px solid #e2e8f0", position: "relative" }}>
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
                              border: kid.gender === g ? "2px solid #2e8a5a" : "1.5px solid #e2e8f0",
                              background: kid.gender === g ? "#e6f4ed" : "#fff",
                              color: kid.gender === g ? "#2e8a5a" : "#64748b",
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
                  background: "linear-gradient(135deg, #2e8a5a 0%, #2e8a5a 100%)",
                  color: "#fff", fontSize: 15, fontWeight: 700,
                }}
              >
                <Check size={17} /> Save Changes
              </ActionButton>
            </div>
            </div>
          </div>
        )}

        {/* Activity stats — 3-column row */}
        <section>
          <p className="text-xs font-jakarta font-semibold uppercase tracking-widest mb-2 px-1" style={{ color: "var(--tk-muted)" }}>
            {t.profileSectionStats}
          </p>
          <div className="rounded-2xl overflow-hidden"
               style={{ background: "#fff", border: "1px solid var(--tk-line)", boxShadow: "0 1px 0 rgba(15,23,42,0.04), 0 6px 16px rgba(15,23,42,0.06)", display: "flex" }}>

            {/* Saved — all users can save (up to 5 for free) */}
            <Link href="/saved" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, padding: "12px 6px", textDecoration: "none", borderRight: "1px solid var(--tk-line)" }}>
              <Heart size={14} strokeWidth={1.75} style={{ color: "var(--tk-blue-700)" }} />
              <span style={{ color: "var(--tk-ink)", fontFamily: "var(--font-fraunces), Georgia, serif", lineHeight: 1, fontSize: 15, fontWeight: 700 }}>{user ? savedCount : "—"}</span>
              <span className="font-jakarta font-semibold" style={{ color: "var(--tk-muted)", fontSize: 12 }}>{t.profileStatSaved}</span>
            </Link>

            <Link href="/my-reviews" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, padding: "12px 6px", textDecoration: "none", borderRight: "1px solid var(--tk-line)" }}>
              <Pencil size={14} strokeWidth={1.75} style={{ color: "var(--tk-blue-700)" }} />
              <span style={{ color: "var(--tk-ink)", fontFamily: "var(--font-fraunces), Georgia, serif", lineHeight: 1, fontSize: 15, fontWeight: 700 }}>{reviewsCount}</span>
              <span className="font-jakarta font-semibold" style={{ color: "var(--tk-muted)", fontSize: 12 }}>{t.profileStatReviews}</span>
            </Link>

            <Link href="/my-notes" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, padding: "12px 6px", textDecoration: "none" }}>
              <FileText size={14} strokeWidth={1.75} style={{ color: "var(--tk-blue-700)" }} />
              <span style={{ color: "var(--tk-ink)", fontFamily: "var(--font-fraunces), Georgia, serif", lineHeight: 1, fontSize: 15, fontWeight: 700 }}>{myNotes.length}</span>
              <span className="font-jakarta font-semibold" style={{ color: "var(--tk-muted)", fontSize: 12 }}>{t.profileStatNotes}</span>
            </Link>
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
            {appRows.map((row, idx) => {
              const divider = idx > 0 ? { borderTop: "1px solid var(--tk-line)" } : {};

              const inner = (
                <>
                  <row.Icon size={20} strokeWidth={1.75} style={{ color: "var(--tk-muted)" }} className="w-7 flex-shrink-0" />
                  <span className="flex-1 font-jakarta text-sm font-semibold" style={{ color: "var(--tk-ink)" }}>{row.label}</span>
                  {row.value && <span className="font-jakarta text-xs" style={{ color: "var(--tk-muted)" }}>{row.value}</span>}
                  <ChevronRight size={16} style={{ color: "var(--tk-line)" }} />
                </>
              );

              return row.href ? (
                <Link key={row.label} href={row.href} className="flex items-center gap-3 px-4 py-3.5" style={divider}>
                  {inner}
                </Link>
              ) : (
                <div key={row.label} className="flex items-center gap-3 px-4 py-3.5" style={divider}>
                  {inner}
                </div>
              );
            })}
          </div>
        </section>

        {/* Logout */}
        <section>
          <ActionButton
            onClick={user ? doLogout : () => {}}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              width: "100%", padding: "13px 0", borderRadius: 14,
              background: user ? "#0e1d4f" : "#94a3b8", color: "#fff", fontSize: 14, fontWeight: 700,
              opacity: user ? 1 : 0.45,
              cursor: user ? "pointer" : "not-allowed",
              pointerEvents: user ? "auto" : "none",
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

      {/* ── Profile photo file input + cropper ───────────────────────────── */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      {showCropper && (
        <ImageCropper
          imageSrc={cropperSrc}
          zIndex={400}
          onConfirm={(dataUrl) => {
            localStorage.setItem("profilePhoto", dataUrl);
            setProfilePhoto(dataUrl);
            setShowCropper(false);
          }}
          onCancel={() => setShowCropper(false)}
        />
      )}

      {/* ── Map picker sheet ───────────────────────────────────────────────── */}
      {showMapPicker && (
        <MapPicker
          initialAddress={editAddress}
          onConfirm={(addr, lat, lng) => {
            setEditAddress(addr);
            setEditAddressLat(lat);
            setEditAddressLng(lng);
            setShowMapPicker(false);
          }}
          onClose={() => setShowMapPicker(false)}
        />
      )}
    </div>
  );
}
