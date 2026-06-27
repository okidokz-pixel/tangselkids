"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveSchool, deleteSchool } from "@/app/admin/actions";
import { ImageUpload, PhotoGrid } from "./ImageUpload";
import { TagInput } from "./TagInput";
import { ImproveButton, TranslateButton } from "./AiButtons";

const JENJANG_OPTIONS = ["Preschool", "TK", "SD", "SMP", "SMA"];
const AREA_OPTIONS = ["Bintaro", "BSD", "Bintaro/BSD"];
const CURRICULUM_CATEGORY_OPTIONS = ["Nasional", "Cambridge", "International Baccalaureate (IB)", "Islamic", "Montessori", "Lainnya"];
const BAHASA_OPTIONS = ["Indonesia", "Inggris", "Arab", "Mandarin", "Jerman", "Jepang"];
const GRADE_OPTIONS = ["Preschool", "TK", "SD", "SMP", "SMA"];

const JENJANG_BUCKET: Record<string, string> = {
  "Preschool": "school-image-preschool",
  "TK": "school-image-tk",
  "SD": "school-image-sd",
  "SMP": "school-image-smp",
  "SMA": "school-image-sma",
};

function generateSlug(name: string) {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SchoolForm({ initial, id }: { initial?: Record<string, any>; id?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState("general");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Form state
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
  const [hours, setHours] = useState(initial?.hours ?? "");
  const [facilities, setFacilities] = useState<string[]>(
    initial?.facilities ? initial.facilities.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
  );
  const [extracurriculars, setExtracurriculars] = useState<string[]>(
    initial?.extracurriculars ? initial.extracurriculars.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
  );
  // English (bilingual) versions — filled via AI Translate, then reviewed.
  const [aboutEn, setAboutEn] = useState(initial?.about_en ?? "");
  const [facilitiesEn, setFacilitiesEn] = useState(initial?.facilities_en ?? "");
  const [extracurricularsEn, setExtracurricularsEn] = useState(initial?.extracurriculars_en ?? "");

  // Contact
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [whatsapp, setWhatsapp] = useState(initial?.whatsapp ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [website, setWebsite] = useState(initial?.website ?? "");
  const [instagram, setInstagram] = useState(initial?.instagram ?? "");
  const [facebook, setFacebook] = useState(initial?.facebook ?? "");
  const [tiktok, setTiktok] = useState(initial?.tiktok ?? "");
  const [youtube, setYoutube] = useState(initial?.youtube ?? "");

  // Academic
  const [jenjang, setJenjang] = useState(initial?.jenjang ?? "");
  const [curriculum, setCurriculum] = useState(initial?.curriculum ?? "");
  const [curriculumCategory, setCurriculumCategory] = useState(initial?.curriculum_category ?? "");
  const [grades, setGrades] = useState<string[]>(initial?.grades ?? []);
  const [kategoriBahasa, setKategoriBahasa] = useState<string[]>(initial?.kategori_bahasa ?? []);
  const [teachingLanguage, setTeachingLanguage] = useState(initial?.teaching_language ?? "");
  const [studentsPerClass, setStudentsPerClass] = useState(initial?.students_per_class ?? "");
  const [jadwalPendaftaran, setJadwalPendaftaran] = useState(initial?.jadwal_pendaftaran ?? "");

  // Fees
  const [uangPangkalMin, setUangPangkalMin] = useState(initial?.uang_pangkal_min ?? "");
  const [uangPangkalMax, setUangPangkalMax] = useState(initial?.uang_pangkal_max ?? "");
  const [annualFeeMin, setAnnualFeeMin] = useState(initial?.annual_fee_min ?? "");
  const [annualFeeMax, setAnnualFeeMax] = useState(initial?.annual_fee_max ?? "");
  const [priceMin, setPriceMin] = useState(initial?.price_min ?? "");
  const [priceMax, setPriceMax] = useState(initial?.price_max ?? "");
  const [tahunBiaya, setTahunBiaya] = useState(initial?.tahun_biaya ?? "");

  // Media
  const [logoUrl, setLogoUrl] = useState(initial?.logo_url ?? "");
  const [feeImageUrl, setFeeImageUrl] = useState(initial?.fee_image_url ?? "");
  const photoColumns = ["photo_1","photo_2","photo_3","photo_4","photo_5","photo_6","photo_7","photo_8","photo_9","photo_10"];
  const [photos, setPhotos] = useState<string[]>(
    photoColumns.map((c) => initial?.[c]).filter(Boolean),
  );
  const [videos, setVideos] = useState<string[]>(
    ["video_1","video_2","video_3","video_4"].map((c) => initial?.[c]).filter(Boolean),
  );

  const photoBucket = JENJANG_BUCKET[jenjang] ?? "school-image-tk";

  function handleNameChange(n: string) {
    setName(n);
    if (!id) setSlug(generateSlug(n));
  }

  function toggleGrade(g: string) {
    setGrades((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]);
  }
  function toggleBahasa(b: string) {
    setKategoriBahasa((prev) => prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]);
  }

  async function handleSave() {
    setSaveError("");
    const photoMap: Record<string, string | null> = {};
    photoColumns.forEach((c, i) => { photoMap[c] = photos[i] ?? null; });

    const videoMap: Record<string, string | null> = {};
    ["video_1","video_2","video_3","video_4"].forEach((c, i) => { videoMap[c] = videos[i] ?? null; });

    const payload = {
      name, slug, area, location_detail: locationDetail, address,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      year_founded: yearFounded ? Number(yearFounded) : null,
      is_featured: isFeatured,
      about, hours,
      facilities: facilities.join(", ") || null,
      extracurriculars: extracurriculars.join(", ") || null,
      about_en: aboutEn || null,
      facilities_en: facilitiesEn || null,
      extracurriculars_en: extracurricularsEn || null,
      phone, whatsapp: whatsapp || null, email: email || null,
      website: website || null, instagram: instagram || null,
      facebook: facebook || null, tiktok: tiktok || null, youtube: youtube || null,
      jenjang: jenjang || null, curriculum: curriculum || null,
      curriculum_category: curriculumCategory || null,
      grades: grades.length ? grades : null,
      kategori_bahasa: kategoriBahasa.length ? kategoriBahasa : null,
      teaching_language: teachingLanguage || null,
      students_per_class: studentsPerClass ? Number(studentsPerClass) : null,
      jadwal_pendaftaran: jadwalPendaftaran || null,
      uang_pangkal_min: uangPangkalMin ? Number(uangPangkalMin) : null,
      uang_pangkal_max: uangPangkalMax ? Number(uangPangkalMax) : null,
      annual_fee_min: annualFeeMin ? Number(annualFeeMin) : null,
      annual_fee_max: annualFeeMax ? Number(annualFeeMax) : null,
      price_min: priceMin ? Number(priceMin) : null,
      price_max: priceMax ? Number(priceMax) : null,
      tahun_biaya: tahunBiaya || null,
      logo_url: logoUrl || null,
      fee_image_url: feeImageUrl || null,
      ...photoMap, ...videoMap,
    };

    startTransition(async () => {
      try {
        await saveSchool(id ?? null, payload);
      } catch (e: unknown) {
        setSaveError(e instanceof Error ? e.message : "Save failed");
      }
    });
  }

  async function handleDelete() {
    if (!id) return;
    startTransition(async () => {
      try {
        await deleteSchool(id);
      } catch (e: unknown) {
        setSaveError(e instanceof Error ? e.message : "Delete failed");
      }
    });
  }

  const TABS = ["general", "academic", "fees", "media", "extras"];

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <button
            type="button"
            onClick={() => router.push("/admin/schools")}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", fontSize: 13, padding: 0, marginBottom: 4 }}
          >
            ← Schools
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0e1d4f", margin: 0 }}>
            {id ? name || "Edit School" : "New School"}
          </h1>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          {id && (
            <a
              href={`/place/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                border: "1.5px solid #d1d5db", background: "#fff", color: "#374151",
                textDecoration: "none", display: "inline-block",
              }}
            >
              Preview ↗
            </a>
          )}
          {id && !confirmDelete && (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              style={{
                padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                border: "1.5px solid #fca5a5", background: "#fef2f2", color: "#dc2626", cursor: "pointer",
              }}
            >
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
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            style={{
              padding: "8px 24px", borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: isPending ? "#9ca3af" : "#0e1d4f", color: "#fff",
              border: "none", cursor: isPending ? "not-allowed" : "pointer",
            }}
          >
            {isPending ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {saveError && (
        <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca", fontSize: 13, color: "#dc2626" }}>
          {saveError}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid #e5e7eb", paddingBottom: 0 }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "8px 16px", fontSize: 13, fontWeight: activeTab === tab ? 600 : 400,
              color: activeTab === tab ? "#0e1d4f" : "#6b7280",
              background: "none", border: "none", borderBottom: activeTab === tab ? "2px solid #0e1d4f" : "2px solid transparent",
              cursor: "pointer", textTransform: "capitalize", marginBottom: -1,
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab: General */}
      {activeTab === "general" && (
        <div style={{ display: "grid", gap: 20, maxWidth: 720 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <label style={labelStyle}>Featured</label>
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)}
              style={{ width: 18, height: 18, cursor: "pointer" }} />
            <span style={{ fontSize: 13, color: "#6b7280" }}>Show at the top of listings</span>
          </div>

          <Field label="School Name *">
            <input style={inputStyle} value={name} onChange={(e) => handleNameChange(e.target.value)} />
          </Field>

          <Field label="Slug *">
            <input style={inputStyle} value={slug} onChange={(e) => setSlug(e.target.value)} />
            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
              Auto-generated from name. URL: /place/{slug || "…"}
            </div>
          </Field>

          <Field label="Area">
            <select style={inputStyle} value={area} onChange={(e) => setArea(e.target.value)}>
              <option value="">— Select area —</option>
              {AREA_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </Field>

          <Field label="Location Detail">
            <input style={inputStyle} value={locationDetail} onChange={(e) => setLocationDetail(e.target.value)} placeholder="e.g. Sektor 7" />
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

          <Field label="Year Founded">
            <input style={inputStyle} type="number" value={yearFounded} onChange={(e) => setYearFounded(e.target.value)} />
          </Field>

          <Field label="Operating Hours">
            <input style={inputStyle} value={hours} onChange={(e) => setHours(e.target.value)} placeholder="e.g. Mon–Fri 07:00–16:00" />
          </Field>

          <Field label="About">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
              <ImproveButton text={about} name={name} category="school" onResult={setAbout} />
              <TranslateButton
                fields={{ about, facilities: facilities.join(", "), extracurriculars: extracurriculars.join(", ") }}
                onResult={(out) => {
                  if (out.about !== undefined) setAboutEn(out.about);
                  if (out.facilities !== undefined) setFacilitiesEn(out.facilities);
                  if (out.extracurriculars !== undefined) setExtracurricularsEn(out.extracurriculars);
                }}
                label="🌐 Translate all to English"
              />
            </div>
            <textarea style={{ ...inputStyle, minHeight: 120, resize: "vertical" }} value={about} onChange={(e) => setAbout(e.target.value)} />
          </Field>

          <Field label="About (English)">
            <textarea style={{ ...inputStyle, minHeight: 120, resize: "vertical" }} value={aboutEn} onChange={(e) => setAboutEn(e.target.value)} placeholder="English translation — use 🌐 Translate above, then review" />
          </Field>

          <SectionDivider label="Contact" />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Phone"><input style={inputStyle} value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
            <Field label="WhatsApp"><input style={inputStyle} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} /></Field>
            <Field label="Email"><input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
            <Field label="Website"><input style={inputStyle} value={website} onChange={(e) => setWebsite(e.target.value)} /></Field>
          </div>

          <SectionDivider label="Social Media" />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Instagram"><input style={inputStyle} value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@handle or URL" /></Field>
            <Field label="Facebook"><input style={inputStyle} value={facebook} onChange={(e) => setFacebook(e.target.value)} /></Field>
            <Field label="TikTok"><input style={inputStyle} value={tiktok} onChange={(e) => setTiktok(e.target.value)} /></Field>
            <Field label="YouTube"><input style={inputStyle} value={youtube} onChange={(e) => setYoutube(e.target.value)} placeholder="Channel URL or @handle" /></Field>
          </div>
        </div>
      )}

      {/* Tab: Academic */}
      {activeTab === "academic" && (
        <div style={{ display: "grid", gap: 20, maxWidth: 720 }}>
          <Field label="Jenjang">
            <select style={inputStyle} value={jenjang} onChange={(e) => setJenjang(e.target.value)}>
              <option value="">— Select —</option>
              {JENJANG_OPTIONS.map((j) => <option key={j} value={j}>{j}</option>)}
            </select>
          </Field>

          <Field label="Curriculum">
            <input style={inputStyle} value={curriculum} onChange={(e) => setCurriculum(e.target.value)} placeholder="e.g. Kurikulum Merdeka + Cambridge" />
          </Field>

          <Field label="Curriculum Category">
            <select style={inputStyle} value={curriculumCategory} onChange={(e) => setCurriculumCategory(e.target.value)}>
              <option value="">— Select —</option>
              {CURRICULUM_CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>

          <Field label="Grades Offered">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {GRADE_OPTIONS.map((g) => (
                <label key={g} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13 }}>
                  <input type="checkbox" checked={grades.includes(g)} onChange={() => toggleGrade(g)} />
                  {g}
                </label>
              ))}
            </div>
          </Field>

          <Field label="Kategori Bahasa">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {BAHASA_OPTIONS.map((b) => (
                <label key={b} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13 }}>
                  <input type="checkbox" checked={kategoriBahasa.includes(b)} onChange={() => toggleBahasa(b)} />
                  {b}
                </label>
              ))}
            </div>
          </Field>

          <Field label="Teaching Language (display text)">
            <input style={inputStyle} value={teachingLanguage} onChange={(e) => setTeachingLanguage(e.target.value)} placeholder="e.g. Bilingual Indonesia–Inggris" />
          </Field>

          <Field label="Students per Class">
            <input style={inputStyle} type="number" value={studentsPerClass} onChange={(e) => setStudentsPerClass(e.target.value)} />
          </Field>

          <Field label="Jadwal Pendaftaran">
            <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={jadwalPendaftaran} onChange={(e) => setJadwalPendaftaran(e.target.value)} placeholder="e.g. Open registration Feb–Apr" />
          </Field>
        </div>
      )}

      {/* Tab: Fees */}
      {activeTab === "fees" && (
        <div style={{ display: "grid", gap: 20, maxWidth: 720 }}>
          <SectionDivider label="Uang Pangkal (One-time enrollment)" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Min (Rp)"><input style={inputStyle} type="number" value={uangPangkalMin} onChange={(e) => setUangPangkalMin(e.target.value)} /></Field>
            <Field label="Max (Rp)"><input style={inputStyle} type="number" value={uangPangkalMax} onChange={(e) => setUangPangkalMax(e.target.value)} /></Field>
          </div>

          <SectionDivider label="Annual Fee" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Min (Rp)"><input style={inputStyle} type="number" value={annualFeeMin} onChange={(e) => setAnnualFeeMin(e.target.value)} /></Field>
            <Field label="Max (Rp)"><input style={inputStyle} type="number" value={annualFeeMax} onChange={(e) => setAnnualFeeMax(e.target.value)} /></Field>
          </div>

          <SectionDivider label="SPP (Monthly)" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Min (Rp)"><input style={inputStyle} type="number" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} /></Field>
            <Field label="Max (Rp)"><input style={inputStyle} type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} /></Field>
          </div>

          <Field label="Tahun Biaya">
            <input style={inputStyle} value={tahunBiaya} onChange={(e) => setTahunBiaya(e.target.value)} placeholder="e.g. 2024/2025" />
          </Field>
        </div>
      )}

      {/* Tab: Media */}
      {activeTab === "media" && (
        <div style={{ display: "grid", gap: 28 }}>
          <div>
            <SectionDivider label="Logo" />
            <ImageUpload
              value={logoUrl}
              onChange={setLogoUrl}
              bucket="school-logo"
              path={`${id ?? "new"}/logo_${Date.now()}.jpg`}
              label=""
              aspectRatio="1/1"
              width={120}
              height={120}
            />
          </div>

          <div>
            <SectionDivider label={`Photos (bucket: ${photoBucket})`} />
            {!jenjang && (
              <div style={{ fontSize: 13, color: "#f59e0b", marginBottom: 12 }}>
                ⚠ Set a Jenjang in the Academic tab first — photos upload to the jenjang-specific bucket.
              </div>
            )}
            <PhotoGrid
              photos={photos}
              onChange={setPhotos}
              bucket={photoBucket}
              entityId={id ?? "new"}
              maxPhotos={10}
            />
          </div>

          <div>
            <SectionDivider label="Fee Detail Image (price-detail bucket)" />
            <ImageUpload
              value={feeImageUrl}
              onChange={setFeeImageUrl}
              bucket="price-detail"
              path={`${id ?? "new"}/fee_${Date.now()}.jpg`}
              label=""
              aspectRatio="16/9"
              width={320}
              height={180}
            />
          </div>

          <div>
            <SectionDivider label="Videos (YouTube ID or URL)" />
            {videos.map((v, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#6b7280", width: 60, flexShrink: 0 }}>Video {i + 1}</span>
                <input
                  style={{ ...inputStyle, flex: 1 }}
                  value={v}
                  onChange={(e) => {
                    const arr = [...videos];
                    arr[i] = e.target.value;
                    setVideos(arr);
                  }}
                  placeholder="YouTube ID or URL"
                />
                <button type="button" onClick={() => setVideos(videos.filter((_, j) => j !== i))}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 16 }}>
                  ✕
                </button>
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

      {/* Tab: Extras */}
      {activeTab === "extras" && (
        <div style={{ display: "grid", gap: 20, maxWidth: 720 }}>
          <Field label="Facilities">
            <TagInput value={facilities} onChange={setFacilities} placeholder="Type a facility and press Enter…" />
          </Field>
          <Field label="Facilities (English)">
            <textarea style={{ ...inputStyle, minHeight: 72, resize: "vertical" }} value={facilitiesEn} onChange={(e) => setFacilitiesEn(e.target.value)} placeholder="Comma-separated English list — use 🌐 Translate on the General tab" />
          </Field>
          <Field label="Extracurriculars">
            <TagInput value={extracurriculars} onChange={setExtracurriculars} placeholder="Type an extracurricular and press Enter…" />
          </Field>
          <Field label="Extracurriculars (English)">
            <textarea style={{ ...inputStyle, minHeight: 72, resize: "vertical" }} value={extracurricularsEn} onChange={(e) => setExtracurricularsEn(e.target.value)} placeholder="Comma-separated English list — use 🌐 Translate on the General tab" />
          </Field>
        </div>
      )}
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

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
