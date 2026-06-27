"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, X } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { ActionButton } from "@/components/ActionButton";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/context/AuthContext";
import { useLoginSheet } from "@/context/LoginSheetContext";
import { useRegisterSheet } from "@/context/RegisterSheetContext";
import { compressImage } from "@/lib/compressImage";


// ── Category-specific options ─────────────────────────────────────────────────
const CURRICULA       = ["Nasional","Cambridge","International Baccalaureate (IB)","Islamic","Montessori","Lainnya"];
const BAHASA          = ["Indonesia","Inggris","Arab","Mandarin","Jerman","Jepang"];
const GRADES          = ["Preschool","TK","SD","SMP","SMA"];
const COURSE_TYPES    = ["Bahasa Inggris","Matematika","Seni Rupa","Musik & Vokal","Coding / Robotik","Tari & Balet","Gimnastik","Bahasa Mandarin"];
const DAYCARE_AGES    = ["Bayi (0–1 thn)","Toddler (1–2 thn)","Balita (2–4 thn)","Usia 4+ thn"];
const PLAYGROUND_TYPES = ["Indoor","Outdoor","Arcade","Trampoline"];
const CLINIC_SVC      = ["Terapi Wicara","Terapi Okupasi","Sensori Integrasi","Fisioterapi","Terapi Perilaku (ABA)","Psikologi Anak","Terapi Bermain","Terapi Kognitif","Snoezel / Stimulasi Multisensori","Terapi Renang"];
const BUDGET_LEVELS   = ["Murah Sekali","Murah","Normal","Agak Mahal","Mahal"];

// ── Shared input styles ───────────────────────────────────────────────────────
const INPUT: React.CSSProperties = {
  width: "100%", padding: "12px 14px", borderRadius: 14, fontSize: 14,
  fontFamily: "var(--font-jakarta), sans-serif",
  outline: "none", border: "1.5px solid #e2e8f0",
  color: "#0f172a", background: "#fff",
  boxSizing: "border-box",
};
const LABEL: React.CSSProperties = {
  display: "block", fontFamily: "var(--font-jakarta), sans-serif",
  fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
  color: "#94a3b8", textTransform: "uppercase", marginBottom: 6,
};
const FIELD: React.CSSProperties = { marginBottom: 18 };

// ── Hidden radio/checkbox input ───────────────────────────────────────────────
const HI: React.CSSProperties = {
  position: "absolute", width: 1, height: 1, opacity: 0,
  margin: -1, padding: 0, overflow: "hidden", clip: "rect(0,0,0,0)", border: 0,
};

// ── Small checkbox-style chip ─────────────────────────────────────────────────
function CheckChip({
  label, checked, onChange,
}: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label style={{ cursor: "pointer", userSelect: "none", WebkitUserSelect: "none" } as React.CSSProperties}>
      <input type="checkbox" checked={checked} onChange={onChange} style={HI} />
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "7px 12px", borderRadius: 999, fontSize: 12.5, fontWeight: 600,
        border: checked ? "2px solid #2e8a5a" : "2px solid #e2e8f0",
        background: checked ? "#e6f4ed" : "#fff",
        color: checked ? "#2e8a5a" : "#374151",
        transition: "all 0.15s",
        whiteSpace: "nowrap",
      }}>
        {checked && <span style={{ fontSize: 10, fontWeight: 900 }}>✓</span>}
        {label}
      </span>
    </label>
  );
}

// ── Radio chip (single-select) ────────────────────────────────────────────────
function RadioChip({
  name, value, label, checked, onChange,
}: { name: string; value: string; label: string; checked: boolean; onChange: () => void }) {
  return (
    <label style={{ cursor: "pointer", userSelect: "none", WebkitUserSelect: "none" } as React.CSSProperties}>
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} style={HI} />
      <span style={{
        display: "inline-block", padding: "7px 14px", borderRadius: 999,
        fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap",
        border: checked ? "2px solid #2e8a5a" : "2px solid #e2e8f0",
        background: checked ? "#2e8a5a" : "#fff",
        color: checked ? "#fff" : "#374151",
        transition: "all 0.15s",
      }}>
        {label}
      </span>
    </label>
  );
}

// ── Select dropdown ───────────────────────────────────────────────────────────
function FieldSelect({
  value, onChange, options, placeholder,
}: { value: string; onChange: (v: string) => void; options: string[]; placeholder: string }) {
  const active = value !== "";
  return (
    <div style={{ position: "relative" }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          ...INPUT,
          padding: "12px 40px 12px 14px",
          color: active ? "#1f6b43" : "#94a3b8",
          border: `1.5px solid ${active ? "#2e8a5a" : "#e2e8f0"}`,
          background: active ? "#e6f4ed" : "#fff",
          appearance: "none", WebkitAppearance: "none", cursor: "pointer",
        } as React.CSSProperties}
      >
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <div style={{ position: "absolute", right: 12, top: 0, bottom: 0, display: "flex", alignItems: "center", pointerEvents: "none" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke={active ? "#2e8a5a" : "#94a3b8"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>
  );
}

// ── Number / price input ──────────────────────────────────────────────────────
function PriceInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div style={{ position: "relative" }}>
      <span style={{
        position: "absolute", left: 14, top: 0, bottom: 0,
        display: "flex", alignItems: "center",
        fontSize: 13, fontWeight: 700, color: "#94a3b8",
        pointerEvents: "none",
      }}>Rp</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ ...INPUT, paddingLeft: 40 }}
      />
    </div>
  );
}

// ── Social icon SVGs (inline, no extra deps) ──────────────────────────────────
function IgIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E1306C" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="#E1306C" stroke="none" />
    </svg>
  );
}
function FbIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}
function TtIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#010101">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.56a8.16 8.16 0 0 0 4.77 1.52V7.65a4.85 4.85 0 0 1-1-.96z" />
    </svg>
  );
}
function YtIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#FF0000">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8z"/>
      <polygon fill="white" points="9.75,15.5 15.5,12 9.75,8.5"/>
    </svg>
  );
}
function WebIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2e8a5a" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

// ── Social link row ───────────────────────────────────────────────────────────
function SocialRow({
  icon, value, onChange, placeholder, prefix, type = "text",
}: { icon: React.ReactNode; value: string; onChange: (v: string) => void; placeholder: string; prefix?: string; type?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
        background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center" }}>
        {prefix && (
          <span style={{
            position: "absolute", left: 14, fontSize: 14, color: "#94a3b8",
            pointerEvents: "none", fontFamily: "var(--font-jakarta), sans-serif",
          }}>{prefix}</span>
        )}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ ...INPUT, marginBottom: 0, paddingLeft: prefix ? 32 : 14 }}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function ListYourPlacePage() {
  const { t } = useLang();
  const router = useRouter();
  const { user, loaded } = useAuth();
  const { openLoginSheet } = useLoginSheet();
  const { openRegisterSheet } = useRegisterSheet();

  // Build category list from translations (matches home page labels)
  const CATEGORIES = [
    { value: "school",         label: t.exploreSchools       },
    { value: "learning-center",label: t.exploreLCs           },
    { value: "daycare",        label: t.exploreDaycare       },
    { value: "playground",     label: t.explorePlaygrounds   },
    { value: "clinic",         label: t.exploreClinics       },
    { value: "cafe",           label: t.exploreCafes         },
    { value: "mini-zoo",       label: t.exploreMiniZoo       },
    { value: "swimming-pool",  label: t.exploreSwimmingPools },
    { value: "bookstore",      label: t.exploreBookstores    },
  ];

  // ── Base fields ──────────────────────────────────────────────────────────────
  const [name,        setName]        = useState("");
  const [area,        setArea]        = useState("");
  const [address,     setAddress]     = useState("");
  const [phone,       setPhone]       = useState("");
  const [whatsapp,    setWhatsapp]    = useState("");
  const [category,    setCategory]    = useState("");
  const [description, setDescription] = useState("");

  // ── School extras ────────────────────────────────────────────────────────────
  const [curriculum,       setCurriculum]       = useState("");
  const [bahasa,           setBahasa]           = useState<string[]>([]);
  const [grades,           setGrades]           = useState<string[]>([]);
  const [studentsPerClass, setStudentsPerClass] = useState("");
  const [uangPangkalMin,   setUangPangkalMin]   = useState("");
  const [uangPangkalMax,   setUangPangkalMax]   = useState("");
  const [annualFeeMin,     setAnnualFeeMin]     = useState("");
  const [annualFeeMax,     setAnnualFeeMax]     = useState("");
  const [sppMin,           setSppMin]           = useState("");
  const [sppMax,           setSppMax]           = useState("");
  const [schoolFacilities, setSchoolFacilities] = useState("");
  const [extracurriculars, setExtracurriculars] = useState("");

  // ── Learning center extras ───────────────────────────────────────────────────
  const [courseTypes,        setCourseTypes]        = useState<string[]>([]);
  const [lcAgeMin,           setLcAgeMin]           = useState("");
  const [lcAgeMax,           setLcAgeMax]           = useState("");
  const [lcTeacherRatio,     setLcTeacherRatio]     = useState("");
  const [lcFreeTrial,        setLcFreeTrial]        = useState("");
  const [lcRegFeeMin,        setLcRegFeeMin]        = useState("");
  const [lcRegFeeMax,        setLcRegFeeMax]        = useState("");
  const [lcPriceMin,         setLcPriceMin]         = useState("");
  const [lcPriceMax,         setLcPriceMax]         = useState("");

  // ── Daycare extras ───────────────────────────────────────────────────────────
  const [daycareAges,       setDaycareAges]       = useState<string[]>([]);
  const [daycareMethod,     setDaycareMethod]     = useState("");
  const [daycareCarerRatio, setDaycareCarerRatio] = useState("");
  const [daycareCctv,       setDaycareCctv]       = useState("");
  const [daycareAccred,     setDaycareAccred]     = useState("");
  const [daycareFacilities, setDaycareFacilities] = useState("");
  const [daycarePriceMin,   setDaycarePriceMin]   = useState("");
  const [daycarePriceMax,   setDaycarePriceMax]   = useState("");

  // ── Playground extras ────────────────────────────────────────────────────────
  const [pgTypes,       setPgTypes]       = useState<string[]>([]);
  const [pgFacilities,  setPgFacilities]  = useState("");
  const [pgPriceMin,    setPgPriceMin]    = useState("");
  const [pgPriceMax,    setPgPriceMax]    = useState("");

  // ── Clinic extras ────────────────────────────────────────────────────────────
  const [clinicServices,   setClinicServices]   = useState<string[]>([]);
  const [clinicFacilities, setClinicFacilities] = useState("");
  const [clinicBiayaMin,   setClinicBiayaMin]   = useState("");
  const [clinicBiayaMax,   setClinicBiayaMax]   = useState("");

  // ── Cafe extras ──────────────────────────────────────────────────────────────
  const [cafeBudget,     setCafeBudget]     = useState("");
  const [cafeFacilities, setCafeFacilities] = useState("");
  const [cafePriceMin,   setCafePriceMin]   = useState("");
  const [cafePriceMax,   setCafePriceMax]   = useState("");

  // ── Swimming pool extras ─────────────────────────────────────────────────────
  const [poolFacilities, setPoolFacilities] = useState("");
  const [poolPriceMin,   setPoolPriceMin]   = useState("");
  const [poolPriceMax,   setPoolPriceMax]   = useState("");

  // ── Mini-zoo extras ──────────────────────────────────────────────────────────
  const [miniZooFacilities, setMiniZooFacilities] = useState("");
  const [miniZooPriceMin,   setMiniZooPriceMin]   = useState("");
  const [miniZooPriceMax,   setMiniZooPriceMax]   = useState("");

  // ── Hours, year & social ─────────────────────────────────────────────────────
  const [hours,        setHours]        = useState("");
  const [yearFounded,  setYearFounded]  = useState("");
  const [instagram,    setInstagram]    = useState("");
  const [facebook,     setFacebook]     = useState("");
  const [tiktok,       setTiktok]       = useState("");
  const [youtube,      setYoutube]      = useState("");
  const [website,      setWebsite]      = useState("");

  // ── Logo ─────────────────────────────────────────────────────────────────────
  const [logo, setLogo] = useState("");
  const logoInputRef = useRef<HTMLInputElement>(null);

  async function handleLogoAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setLogoUploading(true);
    const { blob, filename } = await compressImage(file);
    const fd = new FormData();
    fd.append("file", blob, filename);
    try {
      const res = await fetch("/api/upload-place-photo", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      setLogo(json.url);
    } catch {
      alert("Gagal upload logo. Coba lagi.");
    } finally {
      setLogoUploading(false);
    }
  }

  // ── Photos (up to 10) ────────────────────────────────────────────────────────
  const [photos, setPhotos] = useState<string[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);

  async function handlePhotoAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || photos.length >= 10) return;
    e.target.value = "";
    setUploadingCount(n => n + 1);
    const { blob, filename } = await compressImage(file);
    const fd = new FormData();
    fd.append("file", blob, filename);
    try {
      const res = await fetch("/api/upload-place-photo", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      setPhotos(prev => [...prev, json.url]);
    } catch {
      alert("Gagal upload foto. Coba lagi.");
    } finally {
      setUploadingCount(n => n - 1);
    }
  }

  // ── Related YouTube videos ────────────────────────────────────────────────────
  const [ytVideos, setYtVideos] = useState(["", "", "", ""]);

  // ── Google Maps location ──────────────────────────────────────────────────────
  const [gmapsUrl, setGmapsUrl] = useState("");

  // ── Upload / submit state ─────────────────────────────────────────────────────
  const [logoUploading,  setLogoUploading]  = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [submitting,     setSubmitting]     = useState(false);

  // ── Errors ───────────────────────────────────────────────────────────────────
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  function toggleMulti(list: string[], setList: (v: string[]) => void, val: string) {
    setList(list.includes(val) ? list.filter(x => x !== val) : [...list, val]);
  }

  function validate() {
    const e: Record<string, boolean> = {};
    if (!name.trim())       e.name      = true;
    if (!area)              e.area      = true;
    if (!address.trim())    e.address   = true;
    if (!phone.trim())      e.phone     = true;
    if (!whatsapp.trim())   e.whatsapp  = true;
    if (!category)          e.category  = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function buildCategoryData(): Record<string, unknown> | null {
    switch (category) {
      case "school": return {
        curriculum: curriculum || null,
        bahasa: bahasa.length ? bahasa : null,
        grades: grades.length ? grades : null,
        students_per_class: studentsPerClass ? Number(studentsPerClass) : null,
        uang_pangkal_min: uangPangkalMin ? Number(uangPangkalMin) : null,
        uang_pangkal_max: uangPangkalMax ? Number(uangPangkalMax) : null,
        annual_fee_min: annualFeeMin ? Number(annualFeeMin) : null,
        annual_fee_max: annualFeeMax ? Number(annualFeeMax) : null,
        spp_min: sppMin ? Number(sppMin) : null,
        spp_max: sppMax ? Number(sppMax) : null,
        facilities: schoolFacilities || null,
        extracurriculars: extracurriculars || null,
      };
      case "learning-center": return {
        course_types: courseTypes.length ? courseTypes : null,
        age_min: lcAgeMin ? Number(lcAgeMin) : null,
        age_max: lcAgeMax ? Number(lcAgeMax) : null,
        teacher_ratio: lcTeacherRatio || null,
        free_trial: lcFreeTrial || null,
        reg_fee_min: lcRegFeeMin ? Number(lcRegFeeMin) : null,
        reg_fee_max: lcRegFeeMax ? Number(lcRegFeeMax) : null,
        price_min: lcPriceMin ? Number(lcPriceMin) : null,
        price_max: lcPriceMax ? Number(lcPriceMax) : null,
      };
      case "daycare": return {
        ages: daycareAges.length ? daycareAges : null,
        method: daycareMethod || null,
        carer_ratio: daycareCarerRatio || null,
        cctv: daycareCctv || null,
        accreditation: daycareAccred || null,
        facilities: daycareFacilities || null,
        price_min: daycarePriceMin ? Number(daycarePriceMin) : null,
        price_max: daycarePriceMax ? Number(daycarePriceMax) : null,
      };
      case "playground": return {
        types: pgTypes.length ? pgTypes : null,
        facilities: pgFacilities || null,
        price_min: pgPriceMin ? Number(pgPriceMin) : null,
        price_max: pgPriceMax ? Number(pgPriceMax) : null,
      };
      case "clinic": return {
        services: clinicServices.length ? clinicServices : null,
        facilities: clinicFacilities || null,
        biaya_min: clinicBiayaMin ? Number(clinicBiayaMin) : null,
        biaya_max: clinicBiayaMax ? Number(clinicBiayaMax) : null,
      };
      case "cafe": return {
        budget: cafeBudget || null,
        facilities: cafeFacilities || null,
        price_min: cafePriceMin ? Number(cafePriceMin) : null,
        price_max: cafePriceMax ? Number(cafePriceMax) : null,
      };
      case "mini-zoo": return {
        facilities: miniZooFacilities || null,
        price_min: miniZooPriceMin ? Number(miniZooPriceMin) : null,
        price_max: miniZooPriceMax ? Number(miniZooPriceMax) : null,
      };
      case "swimming-pool": return {
        facilities: poolFacilities || null,
        price_min: poolPriceMin ? Number(poolPriceMin) : null,
        price_max: poolPriceMax ? Number(poolPriceMax) : null,
      };
      default: return null;
    }
  }

  async function handleSubmit() {
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/submit-place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:          name.trim(),
          category,
          area,
          address:       address.trim()       || null,
          phone:         phone.trim()         || null,
          whatsapp:      whatsapp.trim()      || null,
          description:   description.trim()   || null,
          gmaps_url:     gmapsUrl.trim()      || null,
          hours:         hours.trim()         || null,
          year_founded:  yearFounded          ? Number(yearFounded)  : null,
          instagram:     instagram.trim()     || null,
          facebook:      facebook.trim()      || null,
          tiktok:        tiktok.trim()        || null,
          youtube:       youtube.trim()       || null,
          website:       website.trim()       || null,
          logo_url:        logo               || null,
          photos:          photos.filter(Boolean),
          yt_videos:       ytVideos.filter(Boolean),
          category_data:   buildCategoryData(),
          submitter_name:  user?.name         || null,
          submitter_phone: user?.phone        || null,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Submission failed");
      router.push(`/list-your-place/submitted?name=${encodeURIComponent(name.trim())}`);
    } catch {
      alert("Gagal mengirim formulir. Silakan coba lagi.");
      setSubmitting(false);
    }
  }

  // ── Shared section divider ───────────────────────────────────────────────────
  const SectionDivider = ({ label }: { label: string }) => (
    <div style={{
      margin: "8px 0 14px",
      display: "flex", alignItems: "center", gap: 10,
    }}>
      <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
      <span style={{
        fontSize: 10, fontWeight: 800, letterSpacing: 1.4,
        color: "#2e8a5a", textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
    </div>
  );

  // ── Auth gate ─────────────────────────────────────────────────────────────────
  if (!loaded) {
    return (
      <div style={{ maxWidth: 448, margin: "0 auto", minHeight: "100vh", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid #e2e8f0", borderTopColor: "#2e8a5a", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ maxWidth: 448, margin: "0 auto", minHeight: "100vh", background: "#fff", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ padding: "52px 20px 28px", background: "linear-gradient(135deg, #1f6b43 0%, #2e8a5a 100%)", borderRadius: "0 0 32px 32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ActionButton onClick={() => router.back()} style={{ width: 36, height: 36, borderRadius: 999, flexShrink: 0, background: "rgba(255,255,255,0.18)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <ChevronLeft size={20} color="white" />
            </ActionButton>
            <h1 style={{ margin: 0, fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 24, fontWeight: 700, color: "#fff" }}>
              {t.listTitle}
            </h1>
          </div>
        </div>

        {/* Gate body */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 28px", textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>🏠</div>
          <h2 style={{ margin: "0 0 12px", fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 22, fontWeight: 700, color: "#0e1d4f" }}>
            Buat akun dulu, yuk!
          </h2>
          <p style={{ margin: "0 0 32px", fontFamily: "var(--font-jakarta), sans-serif", fontSize: 14, color: "#64748b", lineHeight: 1.65 }}>
            Untuk mendaftarkan tempatmu, kamu perlu buat akun terlebih dahulu.
            Kami akan menghubungi kamu melalui <strong>nomor HP yang terdaftar</strong> setelah listing kamu diverifikasi.
          </p>

          <ActionButton
            onClick={() => openRegisterSheet({ onRegistered: () => {} })}
            style={{
              width: "100%", padding: "15px 0", borderRadius: 16, border: "none",
              background: "linear-gradient(135deg, #1f6b43, #2e8a5a)",
              color: "#fff", fontFamily: "var(--font-jakarta), sans-serif",
              fontSize: 15, fontWeight: 800, cursor: "pointer",
              touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
              marginBottom: 12,
            } as React.CSSProperties}
          >
            Daftar Sekarang
          </ActionButton>

          <ActionButton
            onClick={() => openLoginSheet()}
            style={{
              width: "100%", padding: "15px 0", borderRadius: 16,
              border: "1.5px solid #e2e8f0", background: "#fff",
              color: "#374151", fontFamily: "var(--font-jakarta), sans-serif",
              fontSize: 15, fontWeight: 700, cursor: "pointer",
              touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
            } as React.CSSProperties}
          >
            Sudah punya akun? Masuk
          </ActionButton>
        </div>

        <BottomNav active="profile" />
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 448, margin: "0 auto", minHeight: "100vh", paddingBottom: 100, background: "#fff" }}>

      {/* Hidden logo file input */}
      <input
        ref={logoInputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleLogoAdd}
        style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
        tabIndex={-1}
      />

      {/* Hidden photo file input */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handlePhotoAdd}
        style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
        tabIndex={-1}
      />

      {/* Header */}
      <div
        style={{
          padding: "52px 20px 24px",
          background: "linear-gradient(135deg, #1f6b43 0%, #2e8a5a 100%)",
          borderRadius: "0 0 32px 32px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <ActionButton
            onClick={() => router.back()}
            style={{
              width: 36, height: 36, borderRadius: 999, flexShrink: 0,
              background: "rgba(255,255,255,0.18)",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <ChevronLeft size={20} color="white" />
          </ActionButton>
          <div>
            <h1 style={{ margin: 0, fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 24, fontWeight: 700, color: "#fff" }}>
              {t.listTitle}
            </h1>
            <p style={{ margin: "2px 0 0", color: "rgba(255,255,255,0.65)", fontSize: 12, fontFamily: "var(--font-jakarta), sans-serif" }}>
              {t.listSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Form body */}
      <div className="lyp-form" style={{ padding: "24px 20px" }}>

        {/* ── 1. Place Name ───────────────────────────────────────────────────── */}
        <div style={FIELD}>
          <label style={LABEL}>{t.listLabelName} <span style={{ color: "#ef4444" }}>*</span></label>
          <input
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setErrors(prev => ({ ...prev, name: false })); }}
            placeholder="mis. Happy Kids Cafe, Sekolah Bintaro Jaya..."
            style={{ ...INPUT, border: `1.5px solid ${errors.name ? "#ef4444" : "#e2e8f0"}`, background: errors.name ? "#fff5f5" : "#fff" }}
          />
          {errors.name && <p style={{ fontSize: 11, color: "#ef4444", marginTop: 4, fontFamily: "var(--font-jakarta), sans-serif" }}>{t.listErrName}</p>}
        </div>

        {/* ── 2. Category ─────────────────────────────────────────────────────── */}
        <div style={FIELD}>
          <label style={LABEL}>{t.listLabelCategory} <span style={{ color: "#ef4444" }}>*</span></label>
          <div style={{ position: "relative" }}>
            <select
              value={category}
              onChange={e => { setCategory(e.target.value); setErrors(prev => ({ ...prev, category: false })); }}
              style={{
                ...INPUT,
                padding: "12px 40px 12px 14px",
                color: category ? "#1f6b43" : "#94a3b8",
                border: `1.5px solid ${errors.category ? "#ef4444" : category ? "#2e8a5a" : "#e2e8f0"}`,
                background: category ? "#e6f4ed" : errors.category ? "#fff5f5" : "#fff",
                appearance: "none", WebkitAppearance: "none", cursor: "pointer",
              } as React.CSSProperties}
            >
              <option value="">{t.listCategoryPlaceholder}</option>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <div style={{ position: "absolute", right: 12, top: 0, bottom: 0, display: "flex", alignItems: "center", pointerEvents: "none" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke={category ? "#2e8a5a" : "#94a3b8"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
          {errors.category && <p style={{ fontSize: 11, color: "#ef4444", marginTop: 4, fontFamily: "var(--font-jakarta), sans-serif" }}>{t.listErrCategory}</p>}
        </div>

        {/* ── 3. Category-specific fields ─────────────────────────────────────── */}

        {/* SCHOOL */}
        {category === "school" && (
          <div style={{ background: "#fff", borderRadius: 16, padding: "16px", border: "1.5px solid #a7d4bc", marginBottom: 18 }}>
            <SectionDivider label={`+ ${t.exploreSchools}`} />
            <div style={FIELD}>
              <label style={LABEL}>{t.listLabelCurriculum}</label>
              <FieldSelect value={curriculum} onChange={setCurriculum} options={CURRICULA} placeholder="—" />
            </div>
            <div style={FIELD}>
              <label style={LABEL}>{t.listLabelBahasa}</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                {BAHASA.map(b => (
                  <CheckChip key={b} label={b} checked={bahasa.includes(b)} onChange={() => toggleMulti(bahasa, setBahasa, b)} />
                ))}
              </div>
            </div>
            <div style={FIELD}>
              <label style={LABEL}>{t.listLabelGrades}</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                {GRADES.map(g => (
                  <CheckChip key={g} label={g} checked={grades.includes(g)} onChange={() => toggleMulti(grades, setGrades, g)} />
                ))}
              </div>
            </div>
            <div style={FIELD}>
              <label style={LABEL}>Siswa per Kelas <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opsional)</span></label>
              <input type="number" value={studentsPerClass} onChange={e => setStudentsPerClass(e.target.value)} placeholder="mis. 25" style={INPUT} />
            </div>
            <div style={FIELD}>
              <label style={LABEL}>{t.listLabelUangPangkal}</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <PriceInput value={uangPangkalMin} onChange={setUangPangkalMin} placeholder="Min" />
                <PriceInput value={uangPangkalMax} onChange={setUangPangkalMax} placeholder="Max" />
              </div>
            </div>
            <div style={FIELD}>
              <label style={LABEL}>Annual Fee</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <PriceInput value={annualFeeMin} onChange={setAnnualFeeMin} placeholder="Min" />
                <PriceInput value={annualFeeMax} onChange={setAnnualFeeMax} placeholder="Max" />
              </div>
            </div>
            <div style={FIELD}>
              <label style={LABEL}>{t.listLabelSpp}</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <PriceInput value={sppMin} onChange={setSppMin} placeholder="Min" />
                <PriceInput value={sppMax} onChange={setSppMax} placeholder="Max" />
              </div>
            </div>
            <div style={FIELD}>
              <label style={LABEL}>Fasilitas <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opsional)</span></label>
              <textarea value={schoolFacilities} onChange={e => setSchoolFacilities(e.target.value)} rows={3} placeholder="mis. Lab Komputer, Kolam Renang, Lapangan Olahraga..." style={{ ...INPUT, resize: "none" }} />
            </div>
            <div style={{ ...FIELD, marginBottom: 0 }}>
              <label style={LABEL}>Ekstrakurikuler <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opsional)</span></label>
              <textarea value={extracurriculars} onChange={e => setExtracurriculars(e.target.value)} rows={3} placeholder="mis. Basket, Pramuka, Paduan Suara, Robotik..." style={{ ...INPUT, resize: "none" }} />
            </div>
          </div>
        )}

        {/* LEARNING CENTER */}
        {category === "learning-center" && (
          <div style={{ background: "#fff", borderRadius: 16, padding: "16px", border: "1.5px solid #a7d4bc", marginBottom: 18 }}>
            <SectionDivider label={`+ ${t.exploreLCs}`} />
            <div style={FIELD}>
              <label style={LABEL}>{t.listLabelCourseType}</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                {COURSE_TYPES.map(c => (
                  <CheckChip key={c} label={c} checked={courseTypes.includes(c)} onChange={() => toggleMulti(courseTypes, setCourseTypes, c)} />
                ))}
              </div>
            </div>
            <div style={FIELD}>
              <label style={LABEL}>Rentang Usia <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opsional)</span></label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="number" value={lcAgeMin} onChange={e => setLcAgeMin(e.target.value)} placeholder="Min" style={{ ...INPUT, flex: 1 }} />
                <span style={{ color: "#94a3b8", fontSize: 13, flexShrink: 0 }}>–</span>
                <input type="number" value={lcAgeMax} onChange={e => setLcAgeMax(e.target.value)} placeholder="Max" style={{ ...INPUT, flex: 1 }} />
                <span style={{ color: "#64748b", fontSize: 13, flexShrink: 0 }}>thn</span>
              </div>
            </div>
            <div style={FIELD}>
              <label style={LABEL}>Rasio Guru:Murid <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opsional)</span></label>
              <input type="text" value={lcTeacherRatio} onChange={e => setLcTeacherRatio(e.target.value)} placeholder="mis. 1:6" style={INPUT} />
            </div>
            <div style={FIELD}>
              <label style={LABEL}>Free Trial <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opsional)</span></label>
              <div style={{ display: "flex", gap: 8 }}>
                {(["Ada", "Tidak Ada"] as const).map(v => (
                  <RadioChip key={v} name="lc-free-trial" value={v} label={v} checked={lcFreeTrial === v} onChange={() => setLcFreeTrial(v)} />
                ))}
              </div>
            </div>
            <div style={FIELD}>
              <label style={LABEL}>Biaya Pendaftaran <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opsional)</span></label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <PriceInput value={lcRegFeeMin} onChange={setLcRegFeeMin} placeholder="Min" />
                <PriceInput value={lcRegFeeMax} onChange={setLcRegFeeMax} placeholder="Max" />
              </div>
            </div>
            <div style={{ ...FIELD, marginBottom: 0 }}>
              <label style={LABEL}>{t.listLabelPriceSession}</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <PriceInput value={lcPriceMin} onChange={setLcPriceMin} placeholder="Min" />
                <PriceInput value={lcPriceMax} onChange={setLcPriceMax} placeholder="Max" />
              </div>
            </div>
          </div>
        )}

        {/* DAYCARE */}
        {category === "daycare" && (
          <div style={{ background: "#fff", borderRadius: 16, padding: "16px", border: "1.5px solid #a7d4bc", marginBottom: 18 }}>
            <SectionDivider label={`+ ${t.exploreDaycare}`} />
            <div style={FIELD}>
              <label style={LABEL}>{t.listLabelAgeServed}</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                {DAYCARE_AGES.map(a => (
                  <CheckChip key={a} label={a} checked={daycareAges.includes(a)} onChange={() => toggleMulti(daycareAges, setDaycareAges, a)} />
                ))}
              </div>
            </div>
            <div style={FIELD}>
              <label style={LABEL}>Metode / Kurikulum <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opsional)</span></label>
              <FieldSelect value={daycareMethod} onChange={setDaycareMethod} options={["Montessori","Play-based","Structured","Waldorf","Reggio Emilia"]} placeholder="—" />
            </div>
            <div style={FIELD}>
              <label style={LABEL}>Rasio Pengasuh:Anak <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opsional)</span></label>
              <input type="text" value={daycareCarerRatio} onChange={e => setDaycareCarerRatio(e.target.value)} placeholder="mis. 1:4" style={INPUT} />
            </div>
            <div style={FIELD}>
              <label style={LABEL}>CCTV <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opsional)</span></label>
              <div style={{ display: "flex", gap: 8 }}>
                {(["Ada", "Tidak Ada"] as const).map(v => (
                  <RadioChip key={v} name="dc-cctv" value={v} label={v} checked={daycareCctv === v} onChange={() => setDaycareCctv(v)} />
                ))}
              </div>
            </div>
            <div style={FIELD}>
              <label style={LABEL}>Akreditasi <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opsional)</span></label>
              <div style={{ display: "flex", gap: 8 }}>
                {(["Ada", "Tidak Ada"] as const).map(v => (
                  <RadioChip key={v} name="dc-accred" value={v} label={v} checked={daycareAccred === v} onChange={() => setDaycareAccred(v)} />
                ))}
              </div>
            </div>
            <div style={FIELD}>
              <label style={LABEL}>Fasilitas <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opsional)</span></label>
              <textarea value={daycareFacilities} onChange={e => setDaycareFacilities(e.target.value)} rows={3} placeholder="mis. Ruang bermain, CCTV, Makan siang, Antar jemput..." style={{ ...INPUT, resize: "none" }} />
            </div>
            <div style={{ ...FIELD, marginBottom: 0 }}>
              <label style={LABEL}>{t.listLabelMonthlyPrice}</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <PriceInput value={daycarePriceMin} onChange={setDaycarePriceMin} placeholder="Min" />
                <PriceInput value={daycarePriceMax} onChange={setDaycarePriceMax} placeholder="Max" />
              </div>
            </div>
          </div>
        )}

        {/* PLAYGROUND */}
        {category === "playground" && (
          <div style={{ background: "#fff", borderRadius: 16, padding: "16px", border: "1.5px solid #a7d4bc", marginBottom: 18 }}>
            <SectionDivider label={`+ ${t.explorePlaygrounds}`} />
            <div style={FIELD}>
              <label style={LABEL}>{t.listLabelPgType}</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                {PLAYGROUND_TYPES.map(p => (
                  <CheckChip key={p} label={p} checked={pgTypes.includes(p)} onChange={() => toggleMulti(pgTypes, setPgTypes, p)} />
                ))}
              </div>
            </div>
            <div style={FIELD}>
              <label style={LABEL}>Fasilitas <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opsional)</span></label>
              <textarea value={pgFacilities} onChange={e => setPgFacilities(e.target.value)} rows={3} placeholder="mis. Trampolin, Climbing wall, Kolam bola, Kafetaria..." style={{ ...INPUT, resize: "none" }} />
            </div>
            <div style={{ ...FIELD, marginBottom: 0 }}>
              <label style={LABEL}>{t.listLabelTicket}</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <PriceInput value={pgPriceMin} onChange={setPgPriceMin} placeholder="Min" />
                <PriceInput value={pgPriceMax} onChange={setPgPriceMax} placeholder="Max" />
              </div>
            </div>
          </div>
        )}

        {/* CLINIC */}
        {category === "clinic" && (
          <div style={{ background: "#fff", borderRadius: 16, padding: "16px", border: "1.5px solid #a7d4bc", marginBottom: 18 }}>
            <SectionDivider label={`+ ${t.exploreClinics}`} />
            <div style={FIELD}>
              <label style={LABEL}>{t.listLabelServices}</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                {CLINIC_SVC.map(s => (
                  <CheckChip key={s} label={s} checked={clinicServices.includes(s)} onChange={() => toggleMulti(clinicServices, setClinicServices, s)} />
                ))}
              </div>
            </div>
            <div style={FIELD}>
              <label style={LABEL}>Fasilitas <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opsional)</span></label>
              <textarea value={clinicFacilities} onChange={e => setClinicFacilities(e.target.value)} rows={3} placeholder="mis. Ruang terapi individual, Area tunggu anak, Parkir..." style={{ ...INPUT, resize: "none" }} />
            </div>
            <div style={{ ...FIELD, marginBottom: 0 }}>
              <label style={LABEL}>{t.listLabelBiaya}</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <PriceInput value={clinicBiayaMin} onChange={setClinicBiayaMin} placeholder="Min" />
                <PriceInput value={clinicBiayaMax} onChange={setClinicBiayaMax} placeholder="Max" />
              </div>
            </div>
          </div>
        )}

        {/* CAFE */}
        {category === "cafe" && (
          <div style={{ background: "#fff", borderRadius: 16, padding: "16px", border: "1.5px solid #a7d4bc", marginBottom: 18 }}>
            <SectionDivider label={`+ ${t.exploreCafes}`} />
            <div style={FIELD}>
              <label style={LABEL}>{t.listLabelBudget}</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                {BUDGET_LEVELS.map(b => (
                  <RadioChip key={b} name="cafe-budget" value={b} label={b} checked={cafeBudget === b} onChange={() => setCafeBudget(b)} />
                ))}
              </div>
            </div>
            <div style={FIELD}>
              <label style={LABEL}>Kisaran Harga <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opsional)</span></label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <PriceInput value={cafePriceMin} onChange={setCafePriceMin} placeholder="Min" />
                <PriceInput value={cafePriceMax} onChange={setCafePriceMax} placeholder="Max" />
              </div>
            </div>
            <div style={{ ...FIELD, marginBottom: 0 }}>
              <label style={LABEL}>Fasilitas <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opsional)</span></label>
              <textarea value={cafeFacilities} onChange={e => setCafeFacilities(e.target.value)} rows={3} placeholder="mis. Play area, Nursing room, Stroller-friendly, Parkir..." style={{ ...INPUT, resize: "none" }} />
            </div>
          </div>
        )}

        {/* MINI ZOO */}
        {category === "mini-zoo" && (
          <div style={{ background: "#fff", borderRadius: 16, padding: "16px", border: "1.5px solid #a7d4bc", marginBottom: 18 }}>
            <SectionDivider label={`+ ${t.exploreMiniZoo}`} />
            <div style={FIELD}>
              <label style={LABEL}>Fasilitas <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opsional)</span></label>
              <textarea value={miniZooFacilities} onChange={e => setMiniZooFacilities(e.target.value)} rows={3} placeholder="mis. Feeding session, Kandang interaktif, Area bermain, Kafetaria..." style={{ ...INPUT, resize: "none" }} />
            </div>
            <div style={{ ...FIELD, marginBottom: 0 }}>
              <label style={LABEL}>{t.listLabelMiniZooTicket}</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <PriceInput value={miniZooPriceMin} onChange={setMiniZooPriceMin} placeholder="Min" />
                <PriceInput value={miniZooPriceMax} onChange={setMiniZooPriceMax} placeholder="Max" />
              </div>
            </div>
          </div>
        )}

        {/* SWIMMING POOL */}
        {category === "swimming-pool" && (
          <div style={{ background: "#fff", borderRadius: 16, padding: "16px", border: "1.5px solid #a7d4bc", marginBottom: 18 }}>
            <SectionDivider label={`+ ${t.exploreSwimmingPools}`} />
            <div style={FIELD}>
              <label style={LABEL}>Fasilitas <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opsional)</span></label>
              <textarea value={poolFacilities} onChange={e => setPoolFacilities(e.target.value)} rows={3} placeholder="mis. Kolam anak, Kolam dewasa, Loker, Kantin..." style={{ ...INPUT, resize: "none" }} />
            </div>
            <div style={{ ...FIELD, marginBottom: 0 }}>
              <label style={LABEL}>{t.listLabelPoolPrice}</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <PriceInput value={poolPriceMin} onChange={setPoolPriceMin} placeholder="Min" />
                <PriceInput value={poolPriceMax} onChange={setPoolPriceMax} placeholder="Max" />
              </div>
            </div>
          </div>
        )}

        {/* ── 4. Area & Contact ───────────────────────────────────────────────── */}
        <div style={FIELD}>
          <label style={LABEL}>{t.listLabelArea} <span style={{ color: "#ef4444" }}>*</span></label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(["Bintaro", "BSD"] as const).map(v => (
              <RadioChip
                key={v} name="list-area" value={v} label={v}
                checked={area === v} onChange={() => { setArea(v); setErrors(prev => ({ ...prev, area: false })); }}
              />
            ))}
          </div>
          {errors.area && <p style={{ fontSize: 11, color: "#ef4444", marginTop: 6, fontFamily: "var(--font-jakarta), sans-serif" }}>{t.listErrArea}</p>}
        </div>

        {/* ── 3. Full Address ──────────────────────────────────────────────────── */}
        <div style={FIELD}>
          <label style={LABEL}>{t.listLabelAddress} <span style={{ color: "#ef4444" }}>*</span></label>
          <textarea
            value={address}
            onChange={e => { setAddress(e.target.value); setErrors(prev => ({ ...prev, address: false })); }}
            rows={3}
            placeholder="Jl. Contoh No. 123, Bintaro Sektor 7..."
            style={{ ...INPUT, resize: "none", border: `1.5px solid ${errors.address ? "#ef4444" : "#e2e8f0"}`, background: errors.address ? "#fff5f5" : "#fff" }}
          />
          {errors.address && <p style={{ fontSize: 11, color: "#ef4444", marginTop: 4, fontFamily: "var(--font-jakarta), sans-serif" }}>{t.listErrAddress}</p>}
        </div>

        {/* ── Google Maps Location ─────────────────────────────────────────────── */}
        <div style={{ ...FIELD, background: "#f8fafc", borderRadius: 16, padding: "14px 14px 14px", border: "1.5px solid #e2e8f0" }}>
          <label style={{ ...LABEL, marginBottom: 4 }}>
            Google Maps Location{" "}
            <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional but recommended)</span>
          </label>
          <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 12px", fontFamily: "var(--font-jakarta), sans-serif", lineHeight: 1.5 }}>
            Open Google Maps → search your place → tap <strong>Share</strong> → <strong>Copy link</strong> → paste below.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: "#fff", border: "1.5px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EA4335"/>
                <circle cx="12" cy="9" r="2.5" fill="#fff"/>
              </svg>
            </div>
            <input
              type="url"
              value={gmapsUrl}
              onChange={e => setGmapsUrl(e.target.value)}
              placeholder="https://maps.app.goo.gl/..."
              style={INPUT}
            />
          </div>
        </div>

        {/* ── 4. Phone & WhatsApp ─────────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
          <div>
            <label style={LABEL}>Phone <span style={{ color: "#ef4444" }}>*</span></label>
            <input
              type="tel"
              value={phone}
              onChange={e => { setPhone(e.target.value); setErrors(prev => ({ ...prev, phone: false })); }}
              placeholder="021-7654321"
              style={{ ...INPUT, border: `1.5px solid ${errors.phone ? "#ef4444" : "#e2e8f0"}`, background: errors.phone ? "#fff5f5" : "#fff" }}
            />
            {errors.phone && <p style={{ fontSize: 11, color: "#ef4444", marginTop: 4, fontFamily: "var(--font-jakarta), sans-serif" }}>{t.listErrPhone}</p>}
          </div>
          <div>
            <label style={LABEL}>WhatsApp <span style={{ color: "#ef4444" }}>*</span></label>
            <input
              type="tel"
              value={whatsapp}
              onChange={e => { setWhatsapp(e.target.value); setErrors(prev => ({ ...prev, whatsapp: false })); }}
              placeholder="0812-3456-7890"
              style={{ ...INPUT, border: `1.5px solid ${errors.whatsapp ? "#ef4444" : "#e2e8f0"}`, background: errors.whatsapp ? "#fff5f5" : "#fff" }}
            />
            {errors.whatsapp && <p style={{ fontSize: 11, color: "#ef4444", marginTop: 4, fontFamily: "var(--font-jakarta), sans-serif" }}>Wajib diisi</p>}
          </div>
        </div>


        {/* ── 7. Operating Hours & Year Established ───────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, marginBottom: 18 }}>
          <div>
            <label style={LABEL}>
              {t.listLabelHours}{" "}
              <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>{t.listLabelOptional}</span>
            </label>
            <input
              type="text"
              value={hours}
              onChange={e => setHours(e.target.value)}
              placeholder={t.listHoursPlaceholder}
              style={INPUT}
            />
          </div>
          <div style={{ minWidth: 110 }}>
            <label style={LABEL}>
              Tahun Berdiri{" "}
              <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>{t.listLabelOptional}</span>
            </label>
            <input
              type="number"
              value={yearFounded}
              onChange={e => setYearFounded(e.target.value)}
              placeholder="2015"
              style={{ ...INPUT, minWidth: 0 }}
            />
          </div>
        </div>

        {/* ── 8. Social Media ─────────────────────────────────────────────────── */}
        <div style={{ ...FIELD, background: "#f8fafc", borderRadius: 16, padding: "14px", border: "1.5px solid #e2e8f0" }}>
          <label style={{ ...LABEL, marginBottom: 12 }}>
            {t.listLabelSocial}{" "}
            <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>{t.listLabelOptional}</span>
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <SocialRow
              icon={<IgIcon />}
              value={instagram}
              onChange={setInstagram}
              prefix="@"
              placeholder="namatempatmu"
            />
            <SocialRow
              icon={<FbIcon />}
              value={facebook}
              onChange={setFacebook}
              placeholder="namatempatmu"
            />
            <SocialRow
              icon={<TtIcon />}
              value={tiktok}
              onChange={setTiktok}
              prefix="@"
              placeholder="namatempatmu"
            />
            <SocialRow
              icon={<YtIcon />}
              value={youtube}
              onChange={setYoutube}
              prefix="@"
              placeholder="NamaChannel"
            />
            <SocialRow
              icon={<WebIcon />}
              value={website}
              onChange={setWebsite}
              placeholder="https://www.namatempatmu.com"
              type="url"
            />
          </div>
        </div>

        {/* ── 9. Logo ─────────────────────────────────────────────────────────── */}
        <div style={FIELD}>
          <label style={LABEL}>
            Logo{" "}
            <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional, JPG or PNG)</span>
          </label>
          {logo ? (
            <div style={{ position: "relative", width: 96, height: 96, borderRadius: 16, overflow: "clip", background: "#f1f5f9", border: "1.5px solid #e2e8f0" }}>
              <img
                src={logo}
                alt="Logo"
                style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", padding: 8, boxSizing: "border-box" }}
              />
              <ActionButton
                onClick={() => setLogo("")}
                style={{
                  position: "absolute", top: 4, right: 4,
                  width: 22, height: 22, borderRadius: 999,
                  background: "rgba(0,0,0,0.60)", border: "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                }}
              >
                <X size={11} color="#fff" strokeWidth={3} />
              </ActionButton>
            </div>
          ) : logoUploading ? (
            <div style={{
              width: 96, height: 96, borderRadius: 16,
              border: "2px dashed #cbd5e1", background: "#f8fafc",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "var(--font-jakarta), sans-serif" }}>Uploading…</span>
            </div>
          ) : (
            <ActionButton
              onClick={() => logoInputRef.current?.click()}
              style={{
                width: 96, height: 96, borderRadius: 16,
                border: "2px dashed #cbd5e1", background: "#f8fafc",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 4,
                touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
              }}
            >
              <span style={{ fontSize: 28, lineHeight: 1, color: "#94a3b8" }}>+</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", fontFamily: "var(--font-jakarta), sans-serif", letterSpacing: 0.3 }}>Logo</span>
            </ActionButton>
          )}
        </div>

        {/* ── 10. Photos ──────────────────────────────────────────────────────── */}
        <div style={FIELD}>
          <label style={LABEL}>
            Place Photos{" "}
            <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional, up to 10 photos, JPG or PNG only)</span>
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {/* Existing photo thumbnails */}
            {photos.map((src, i) => (
              <div key={i} style={{ position: "relative", aspectRatio: "1 / 1", borderRadius: 12, overflow: "clip", background: "#f1f5f9" }}>
                <img
                  src={src}
                  alt={`Photo ${i + 1}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
                <ActionButton
                  onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
                  style={{
                    position: "absolute", top: 5, right: 5,
                    width: 22, height: 22, borderRadius: 999,
                    background: "rgba(0,0,0,0.60)",
                    border: "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                  }}
                >
                  <X size={11} color="#fff" strokeWidth={3} />
                </ActionButton>
              </div>
            ))}

            {/* Uploading tiles */}
            {Array.from({ length: uploadingCount }).map((_, i) => (
              <div key={`uploading-${i}`} style={{
                aspectRatio: "1 / 1", borderRadius: 12,
                background: "#f1f5f9", border: "2px dashed #cbd5e1",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontSize: 11, color: "#94a3b8", fontFamily: "var(--font-jakarta), sans-serif" }}>Uploading…</span>
              </div>
            ))}

            {/* Add photo tile — shown while count < 10 */}
            {photos.length + uploadingCount < 10 && (
              <ActionButton
                onClick={() => photoInputRef.current?.click()}
                style={{
                  aspectRatio: "1 / 1", borderRadius: 12,
                  border: "2px dashed #cbd5e1", background: "#f8fafc",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 4,
                  touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                }}
              >
                <span style={{ fontSize: 24, lineHeight: 1, color: "#94a3b8" }}>+</span>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: "#94a3b8",
                  fontFamily: "var(--font-jakarta), sans-serif", letterSpacing: 0.3,
                }}>{t.listPhotosAdd}</span>
              </ActionButton>
            )}
          </div>

        </div>

        {/* ── 11. Related YouTube Videos ──────────────────────────────────────── */}
        <div style={FIELD}>
          <label style={LABEL}>
            Related YouTube Videos{" "}
            <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
          </label>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <YtIcon />
              </div>
              <input
                type="url"
                value={ytVideos[i]}
                onChange={e => {
                  const v = [...ytVideos];
                  v[i] = e.target.value;
                  setYtVideos(v);
                }}
                placeholder="www.youtube.com/watch?v=..."
                style={INPUT}
              />
            </div>
          ))}
        </div>

        {/* ── 13. Description ─────────────────────────────────────────────────── */}
        <div style={FIELD}>
          <label style={LABEL}>
            {t.listLabelDesc}{" "}
            <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>{t.listLabelOptional}</span>
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={6}
            placeholder={t.listDescPlaceholder}
            style={{ ...INPUT, resize: "none" }}
          />
        </div>

        {/* ── Submit ──────────────────────────────────────────────────────────── */}
        <ActionButton
          onClick={handleSubmit}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            width: "100%", padding: "16px 0", borderRadius: 16, marginTop: 8,
            background: "linear-gradient(135deg, #1f6b43, #2e8a5a)",
            color: "#fff", fontFamily: "var(--font-jakarta), sans-serif",
            fontSize: 15, fontWeight: 800, border: "none", cursor: "pointer",
            touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
            boxShadow: "0 4px 16px rgba(37,99,235,0.35)",
            opacity: (submitting || logoUploading || uploadingCount > 0) ? 0.65 : 1,
            pointerEvents: (submitting || logoUploading || uploadingCount > 0) ? "none" : "auto",
          } as React.CSSProperties}
        >
          {submitting ? "Mengirim…" : t.listSubmit}
          {!submitting && <span style={{ display: "inline-block", fontSize: 18, animation: "arrow-slide 1s ease-in-out infinite" }}>→</span>}
        </ActionButton>

        <p style={{
          textAlign: "center", marginTop: 12,
          fontSize: 11.5, color: "#94a3b8",
          fontFamily: "var(--font-jakarta), sans-serif", lineHeight: 1.5,
        }}>
          {t.listSubmitNote}
        </p>
      </div>

      <BottomNav active="profile" />
    </div>
  );
}
