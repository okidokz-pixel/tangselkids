"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveBookstore, deleteBookstore } from "@/app/admin/actions";
import { ImageUpload, PhotoGrid } from "./ImageUpload";
import { ImproveButton, TranslateButton } from "./AiButtons";

const AREA_OPTIONS = ["Bintaro", "BSD", "Bintaro/BSD"];

function generateSlug(name: string) {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function BookstoreForm({ initial, id }: { initial?: Record<string, any>; id?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState("general");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saveError, setSaveError] = useState("");

  // General
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [area, setArea] = useState(initial?.area ?? "");
  const [locationDetail, setLocationDetail] = useState(initial?.location_detail ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [latitude, setLatitude] = useState(initial?.latitude ?? "");
  const [longitude, setLongitude] = useState(initial?.longitude ?? "");
  const [yearFounded, setYearFounded] = useState(initial?.year_founded ?? "");
  const [isFeatured, setIsFeatured] = useState(initial?.is_featured ?? false);
  const [about, setAbout] = useState(initial?.about ?? "");
  const [aboutEn, setAboutEn] = useState(initial?.about_en ?? "");
  const [hours, setHours] = useState(initial?.hours ?? "");

  // Contact
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [whatsapp, setWhatsapp] = useState(initial?.whatsapp ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [website, setWebsite] = useState(initial?.website ?? "");
  const [instagram, setInstagram] = useState(initial?.instagram ?? "");
  const [facebook, setFacebook] = useState(initial?.facebook ?? "");
  const [tiktok, setTiktok] = useState(initial?.tiktok ?? "");
  const [youtube, setYoutube] = useState(initial?.youtube ?? "");

  // Store info
  const [googlePlaceId, setGooglePlaceId] = useState(initial?.google_place_id ?? "");
  const [googleRating, setGoogleRating] = useState(initial?.google_rating ?? "");

  // Media
  const [logoUrl, setLogoUrl] = useState(initial?.logo_url ?? "");
  const photoColumns = ["photo_1","photo_2","photo_3","photo_4","photo_5","photo_6","photo_7","photo_8","photo_9","photo_10"];
  const [photos, setPhotos] = useState<string[]>(
    photoColumns.map((c) => initial?.[c]).filter(Boolean),
  );
  const [videos, setVideos] = useState<string[]>(
    ["video_1","video_2","video_3","video_4"].map((c) => initial?.[c]).filter(Boolean),
  );

  function handleNameChange(n: string) {
    setName(n);
    if (!id) setSlug(generateSlug(n));
  }

  async function handleSave() {
    setSaveError("");
    const photoMap: Record<string, string | null> = {};
    photoColumns.forEach((c, i) => { photoMap[c] = photos[i] ?? null; });
    const videoMap: Record<string, string | null> = {};
    ["video_1","video_2","video_3","video_4"].forEach((c, i) => { videoMap[c] = videos[i] ?? null; });

    const payload = {
      name, slug, area: area || null, location_detail: locationDetail || null,
      address: address || null,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      year_founded: yearFounded ? Number(yearFounded) : null,
      is_featured: isFeatured,
      about: about || null, about_en: aboutEn || null, hours: hours || null,
      phone: phone || null, whatsapp: whatsapp || null,
      email: email || null, website: website || null,
      instagram: instagram || null, facebook: facebook || null,
      tiktok: tiktok || null, youtube: youtube || null,
      google_place_id: googlePlaceId || null,
      google_rating: googleRating ? Number(googleRating) : null,
      logo_url: logoUrl || null,
      ...photoMap, ...videoMap,
    };

    startTransition(async () => {
      try {
        await saveBookstore(id ?? null, payload);
      } catch (e: unknown) {
        setSaveError(e instanceof Error ? e.message : "Save failed");
      }
    });
  }

  async function handleDelete() {
    if (!id) return;
    startTransition(async () => {
      try {
        await deleteBookstore(id);
      } catch (e: unknown) {
        setSaveError(e instanceof Error ? e.message : "Delete failed");
      }
    });
  }

  const TABS = ["general", "info", "media"];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <button type="button" onClick={() => router.push("/admin/bookstores")}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", fontSize: 13, padding: 0, marginBottom: 4 }}>
            ← Toko Buku
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0e1d4f", margin: 0 }}>
            {id ? name || "Edit Toko Buku" : "Tambah Toko Buku"}
          </h1>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          {id && (
            <a href={`/place/${slug}`} target="_blank" rel="noopener noreferrer"
              style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "1.5px solid #d1d5db", background: "#fff", color: "#374151", textDecoration: "none" }}>
              Preview ↗
            </a>
          )}
          {id && !confirmDelete && (
            <button type="button" onClick={() => setConfirmDelete(true)}
              style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "1.5px solid #fca5a5", background: "#fef2f2", color: "#dc2626", cursor: "pointer" }}>
              Delete
            </button>
          )}
          {confirmDelete && (
            <>
              <span style={{ fontSize: 13, color: "#dc2626" }}>Sure?</span>
              <button type="button" onClick={handleDelete} disabled={isPending}
                style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, background: "#dc2626", color: "#fff", border: "none", cursor: "pointer" }}>
                Yes, Delete
              </button>
              <button type="button" onClick={() => setConfirmDelete(false)}
                style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, background: "#f3f4f6", color: "#374151", border: "none", cursor: "pointer" }}>
                Cancel
              </button>
            </>
          )}
          <button type="button" onClick={handleSave} disabled={isPending}
            style={{ padding: "8px 24px", borderRadius: 8, fontSize: 13, fontWeight: 600, background: isPending ? "#9ca3af" : "#0e1d4f", color: "#fff", border: "none", cursor: isPending ? "not-allowed" : "pointer" }}>
            {isPending ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {saveError && (
        <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca", fontSize: 13, color: "#dc2626" }}>
          {saveError}
        </div>
      )}

      <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid #e5e7eb" }}>
        {TABS.map((tab) => (
          <button key={tab} type="button" onClick={() => setActiveTab(tab)}
            style={{
              padding: "8px 16px", fontSize: 13, fontWeight: activeTab === tab ? 600 : 400,
              color: activeTab === tab ? "#0e1d4f" : "#6b7280",
              background: "none", border: "none", borderBottom: activeTab === tab ? "2px solid #0e1d4f" : "2px solid transparent",
              cursor: "pointer", textTransform: "capitalize", marginBottom: -1,
            }}>
            {tab === "info" ? "Store Info" : tab}
          </button>
        ))}
      </div>

      {activeTab === "general" && (
        <div style={{ display: "grid", gap: 20, maxWidth: 720 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <label style={labelStyle}>Featured</label>
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} style={{ width: 18, height: 18, cursor: "pointer" }} />
            <span style={{ fontSize: 13, color: "#6b7280" }}>Show at the top of listings</span>
          </div>

          <Field label="Name *">
            <input style={inputStyle} value={name} onChange={(e) => handleNameChange(e.target.value)} />
          </Field>

          <Field label="Slug *">
            <input style={inputStyle} value={slug} onChange={(e) => setSlug(e.target.value)} />
            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>URL: /place/{slug || "…"}</div>
          </Field>

          <Field label="Area">
            <select style={inputStyle} value={area} onChange={(e) => setArea(e.target.value)}>
              <option value="">— Select area —</option>
              {AREA_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </Field>

          <Field label="Location Detail">
            <input style={inputStyle} value={locationDetail} onChange={(e) => setLocationDetail(e.target.value)} placeholder="e.g. Living World Alam Sutera" />
          </Field>

          <Field label="Address">
            <textarea style={{ ...inputStyle, minHeight: 72, resize: "vertical" }} value={address} onChange={(e) => setAddress(e.target.value)} />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Latitude">
              <input style={inputStyle} type="number" step="any" value={latitude} onChange={(e) => setLatitude(e.target.value)} />
            </Field>
            <Field label="Longitude">
              <input style={inputStyle} type="number" step="any" value={longitude} onChange={(e) => setLongitude(e.target.value)} />
            </Field>
          </div>

          <Field label="Jam Buka">
            <input style={inputStyle} value={hours} onChange={(e) => setHours(e.target.value)} placeholder="e.g. Senin–Minggu 10:00–21:00" />
          </Field>

          <Field label="About (ID)">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
              <ImproveButton text={about} name={name} category="bookstore" onResult={setAbout} />
              <TranslateButton
                fields={{ about }}
                onResult={(out) => { if (out.about !== undefined) setAboutEn(out.about); }}
                label="🌐 Translate to English"
              />
            </div>
            <textarea style={{ ...inputStyle, minHeight: 120, resize: "vertical" }} value={about} onChange={(e) => setAbout(e.target.value)} />
          </Field>

          <Field label="About (EN)">
            <textarea style={{ ...inputStyle, minHeight: 120, resize: "vertical" }} value={aboutEn} onChange={(e) => setAboutEn(e.target.value)} />
          </Field>

          <SectionDivider label="Contact" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Telepon"><input style={inputStyle} value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
            <Field label="WhatsApp"><input style={inputStyle} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} /></Field>
            <Field label="Email"><input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
            <Field label="Website"><input style={inputStyle} value={website} onChange={(e) => setWebsite(e.target.value)} /></Field>
          </div>

          <SectionDivider label="Social Media" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Instagram"><input style={inputStyle} value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@handle or URL" /></Field>
            <Field label="Facebook"><input style={inputStyle} value={facebook} onChange={(e) => setFacebook(e.target.value)} /></Field>
            <Field label="TikTok"><input style={inputStyle} value={tiktok} onChange={(e) => setTiktok(e.target.value)} /></Field>
            <Field label="YouTube"><input style={inputStyle} value={youtube} onChange={(e) => setYoutube(e.target.value)} /></Field>
          </div>

          <Field label="Year Founded">
            <input style={inputStyle} type="number" value={yearFounded} onChange={(e) => setYearFounded(e.target.value)} />
          </Field>
        </div>
      )}

      {activeTab === "info" && (
        <div style={{ display: "grid", gap: 20, maxWidth: 720 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Google Rating">
              <input style={inputStyle} type="number" step="0.1" min="1" max="5" value={googleRating} onChange={(e) => setGoogleRating(e.target.value)} placeholder="e.g. 4.6" />
            </Field>
            <Field label="Google Place ID">
              <input style={inputStyle} value={googlePlaceId} onChange={(e) => setGooglePlaceId(e.target.value)} placeholder="ChIJ…" />
            </Field>
          </div>
        </div>
      )}

      {activeTab === "media" && (
        <div style={{ display: "grid", gap: 28 }}>
          <div>
            <SectionDivider label="Logo" />
            <ImageUpload
              value={logoUrl} onChange={setLogoUrl}
              bucket="bookstores-logo"
              path={`bs-${id ?? "new"}/logo_${Date.now()}.jpg`}
              label="" aspectRatio="1/1" width={120} height={120}
            />
          </div>

          <div>
            <SectionDivider label="Photos" />
            <PhotoGrid
              photos={photos} onChange={setPhotos}
              bucket="bookstores-photos"
              entityId={id ?? "new"} maxPhotos={10}
            />
          </div>

          <div>
            <SectionDivider label="Videos (YouTube ID or URL)" />
            {videos.map((v, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#6b7280", width: 60, flexShrink: 0 }}>Video {i + 1}</span>
                <input style={{ ...inputStyle, flex: 1 }} value={v}
                  onChange={(e) => { const arr = [...videos]; arr[i] = e.target.value; setVideos(arr); }}
                  placeholder="YouTube ID or URL" />
                <button type="button" onClick={() => setVideos(videos.filter((_, j) => j !== i))}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 16 }}>✕</button>
              </div>
            ))}
            {videos.length < 4 && (
              <button type="button" onClick={() => setVideos([...videos, ""])}
                style={{ fontSize: 13, color: "#0e1d4f", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                + Add Video
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 };
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: "1.5px solid #d1d5db", fontSize: 14, color: "#111827",
  outline: "none", boxSizing: "border-box", background: "#fff",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
    </div>
  );
}
