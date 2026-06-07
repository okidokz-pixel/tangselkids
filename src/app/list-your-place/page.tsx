"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, X } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { ActionButton } from "@/components/ActionButton";
import { BottomNav } from "@/components/BottomNav";


// ── Category-specific options ─────────────────────────────────────────────────
const CURRICULA    = ["Nasional","Nasional Plus","Merdeka","Cambridge","IB","Montessori","Islam Terpadu","Blended Learning","Lainnya"];
const BAHASA       = ["Indonesian","English","Bilingual (ID+EN)","Bilingual (ID+MND)","Bilingual (ID+ARB)","Japanese","German"];
const GRADES       = ["Preschool","TK","SD","SMP","SMA"];
const COURSE_TYPES = ["Bahasa Inggris","Matematika","Seni","Musik","Coding/Robotik","Tari & Balet","Gimnastik","Lainnya"];
const AGE_GROUPS   = ["Toddler","Kids","Tween","Teen"];
const DAYCARE_AGES = ["Bayi (0–1 thn)","Toddler (1–2 thn)","Balita (2–4 thn)","Usia 4+ thn"];
const CLINIC_SVC   = ["Terapi Wicara","Terapi Okupasi","Fisioterapi","Sensori Integrasi (SI)","Psikologi Anak","Perilaku / ABA"];
const BUDGET_LEVELS= ["Murah Sekali","Murah","Normal","Agak Mahal","Mahal"];

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
  icon, value, onChange, placeholder,
}: { icon: React.ReactNode; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
        background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {icon}
      </div>
      <input
        type="url"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ ...INPUT, marginBottom: 0 }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function ListYourPlacePage() {
  const { t } = useLang();
  const router = useRouter();

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
    { value: "other",          label: t.homeOthers           },
  ];

  // ── Base fields ──────────────────────────────────────────────────────────────
  const [name,        setName]        = useState("");
  const [area,        setArea]        = useState("");
  const [address,     setAddress]     = useState("");
  const [phone,       setPhone]       = useState("");
  const [category,    setCategory]    = useState("");
  const [description, setDescription] = useState("");

  // ── School extras ────────────────────────────────────────────────────────────
  const [curriculum, setCurriculum] = useState("");
  const [bahasa,     setBahasa]     = useState("");
  const [grades,     setGrades]     = useState<string[]>([]);
  const [uangPangkal,setUangPangkal] = useState("");
  const [spp,        setSpp]        = useState("");

  // ── Learning center extras ───────────────────────────────────────────────────
  const [courseType,     setCourseType]     = useState("");
  const [lcAgeGroups,    setLcAgeGroups]    = useState<string[]>([]);
  const [lcPriceSession, setLcPriceSession] = useState("");

  // ── Daycare extras ───────────────────────────────────────────────────────────
  const [daycareAges,  setDaycareAges]  = useState<string[]>([]);
  const [daycarePrice, setDaycarePrice] = useState("");

  // ── Playground extras ────────────────────────────────────────────────────────
  const [pgTicket, setPgTicket] = useState("");
  const [pgType,   setPgType]   = useState("");

  // ── Clinic extras ────────────────────────────────────────────────────────────
  const [clinicServices, setClinicServices] = useState<string[]>([]);
  const [clinicBiaya,    setClinicBiaya]    = useState("");

  // ── Cafe extras ──────────────────────────────────────────────────────────────
  const [cafeBudget, setCafeBudget] = useState("");

  // ── Swimming pool / mini-zoo extras ─────────────────────────────────────────
  const [poolTicket,    setPoolTicket]    = useState("");
  const [miniZooTicket, setMiniZooTicket] = useState("");

  // ── Hours & social ───────────────────────────────────────────────────────────
  const [hours,     setHours]     = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook,  setFacebook]  = useState("");
  const [tiktok,    setTiktok]    = useState("");
  const [website,   setWebsite]   = useState("");

  // ── Photos (up to 5) ─────────────────────────────────────────────────────────
  const [photos, setPhotos] = useState<string[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);

  function handlePhotoAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || photos.length >= 5) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setPhotos(prev => [...prev, result]);
    };
    reader.readAsDataURL(file);
    // Reset so the same file can be re-selected if removed
    e.target.value = "";
  }

  // ── Errors ───────────────────────────────────────────────────────────────────
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  function toggleMulti(list: string[], setList: (v: string[]) => void, val: string) {
    setList(list.includes(val) ? list.filter(x => x !== val) : [...list, val]);
  }

  function validate() {
    const e: Record<string, boolean> = {};
    if (!name.trim())    e.name    = true;
    if (!area)           e.area    = true;
    if (!address.trim()) e.address = true;
    if (!phone.trim())   e.phone   = true;
    if (!category)       e.category = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const encoded = encodeURIComponent(name.trim());
    router.push(`/list-your-place/upsell?name=${encoded}`);
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

  // ── Form ─────────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 448, margin: "0 auto", minHeight: "100vh", paddingBottom: 100, background: "#fff" }}>

      {/* Hidden photo file input */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
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
      <div style={{ padding: "24px 20px" }}>

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

        {/* ── 2. Area ─────────────────────────────────────────────────────────── */}
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

        {/* ── 4. Phone ────────────────────────────────────────────────────────── */}
        <div style={FIELD}>
          <label style={LABEL}>{t.listLabelPhone} <span style={{ color: "#ef4444" }}>*</span></label>
          <input
            type="tel"
            value={phone}
            onChange={e => { setPhone(e.target.value); setErrors(prev => ({ ...prev, phone: false })); }}
            placeholder="0812-3456-7890"
            style={{ ...INPUT, border: `1.5px solid ${errors.phone ? "#ef4444" : "#e2e8f0"}`, background: errors.phone ? "#fff5f5" : "#fff" }}
          />
          {errors.phone && <p style={{ fontSize: 11, color: "#ef4444", marginTop: 4, fontFamily: "var(--font-jakarta), sans-serif" }}>{t.listErrPhone}</p>}
        </div>

        {/* ── 5. Category ─────────────────────────────────────────────────────── */}
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

        {/* ── 6. Category-specific fields ─────────────────────────────────────── */}

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
              <FieldSelect value={bahasa} onChange={setBahasa} options={BAHASA} placeholder="—" />
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
              <label style={LABEL}>{t.listLabelUangPangkal}</label>
              <PriceInput value={uangPangkal} onChange={setUangPangkal} placeholder="mis. 15000000" />
            </div>
            <div style={{ ...FIELD, marginBottom: 0 }}>
              <label style={LABEL}>{t.listLabelSpp}</label>
              <PriceInput value={spp} onChange={setSpp} placeholder="mis. 3000000" />
            </div>
          </div>
        )}

        {/* LEARNING CENTER */}
        {category === "learning-center" && (
          <div style={{ background: "#fff", borderRadius: 16, padding: "16px", border: "1.5px solid #a7d4bc", marginBottom: 18 }}>
            <SectionDivider label={`+ ${t.exploreLCs}`} />
            <div style={FIELD}>
              <label style={LABEL}>{t.listLabelCourseType}</label>
              <FieldSelect value={courseType} onChange={setCourseType} options={COURSE_TYPES} placeholder="—" />
            </div>
            <div style={FIELD}>
              <label style={LABEL}>{t.listLabelAgeGroup}</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                {AGE_GROUPS.map(g => (
                  <CheckChip key={g} label={g} checked={lcAgeGroups.includes(g)} onChange={() => toggleMulti(lcAgeGroups, setLcAgeGroups, g)} />
                ))}
              </div>
            </div>
            <div style={{ ...FIELD, marginBottom: 0 }}>
              <label style={LABEL}>{t.listLabelPriceSession}</label>
              <PriceInput value={lcPriceSession} onChange={setLcPriceSession} placeholder="mis. 150000" />
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
            <div style={{ ...FIELD, marginBottom: 0 }}>
              <label style={LABEL}>{t.listLabelMonthlyPrice}</label>
              <PriceInput value={daycarePrice} onChange={setDaycarePrice} placeholder="mis. 3500000" />
            </div>
          </div>
        )}

        {/* PLAYGROUND */}
        {category === "playground" && (
          <div style={{ background: "#fff", borderRadius: 16, padding: "16px", border: "1.5px solid #a7d4bc", marginBottom: 18 }}>
            <SectionDivider label={`+ ${t.explorePlaygrounds}`} />
            <div style={FIELD}>
              <label style={LABEL}>{t.listLabelPgType}</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                {([
                  { value: "indoor",  label: t.listPgIndoor  },
                  { value: "outdoor", label: t.listPgOutdoor },
                  { value: "both",    label: t.listPgBoth    },
                ] as const).map(o => (
                  <RadioChip key={o.value} name="pg-type" value={o.value} label={o.label}
                    checked={pgType === o.value} onChange={() => setPgType(o.value)} />
                ))}
              </div>
            </div>
            <div style={{ ...FIELD, marginBottom: 0 }}>
              <label style={LABEL}>{t.listLabelTicket}</label>
              <PriceInput value={pgTicket} onChange={setPgTicket} placeholder="mis. 75000" />
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
            <div style={{ ...FIELD, marginBottom: 0 }}>
              <label style={LABEL}>{t.listLabelBiaya}</label>
              <PriceInput value={clinicBiaya} onChange={setClinicBiaya} placeholder="mis. 350000" />
            </div>
          </div>
        )}

        {/* CAFE */}
        {category === "cafe" && (
          <div style={{ background: "#fff", borderRadius: 16, padding: "16px", border: "1.5px solid #a7d4bc", marginBottom: 18 }}>
            <SectionDivider label={`+ ${t.exploreCafes}`} />
            <div style={{ ...FIELD, marginBottom: 0 }}>
              <label style={LABEL}>{t.listLabelBudget}</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                {BUDGET_LEVELS.map(b => (
                  <RadioChip key={b} name="cafe-budget" value={b} label={b} checked={cafeBudget === b} onChange={() => setCafeBudget(b)} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MINI ZOO */}
        {category === "mini-zoo" && (
          <div style={{ background: "#fff", borderRadius: 16, padding: "16px", border: "1.5px solid #a7d4bc", marginBottom: 18 }}>
            <SectionDivider label={`+ ${t.exploreMiniZoo}`} />
            <div style={{ ...FIELD, marginBottom: 0 }}>
              <label style={LABEL}>{t.listLabelMiniZooTicket}</label>
              <PriceInput value={miniZooTicket} onChange={setMiniZooTicket} placeholder="mis. 50000" />
            </div>
          </div>
        )}

        {/* SWIMMING POOL */}
        {category === "swimming-pool" && (
          <div style={{ background: "#fff", borderRadius: 16, padding: "16px", border: "1.5px solid #a7d4bc", marginBottom: 18 }}>
            <SectionDivider label={`+ ${t.exploreSwimmingPools}`} />
            <div style={{ ...FIELD, marginBottom: 0 }}>
              <label style={LABEL}>{t.listLabelPoolPrice}</label>
              <PriceInput value={poolTicket} onChange={setPoolTicket} placeholder="mis. 40000" />
            </div>
          </div>
        )}

        {/* ── 7. Operating Hours ──────────────────────────────────────────────── */}
        <div style={FIELD}>
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

        {/* ── 8. Social Media ─────────────────────────────────────────────────── */}
        <div style={{ ...FIELD, background: "#f8fafc", borderRadius: 16, padding: "14px 14px 4px", border: "1.5px solid #e2e8f0" }}>
          <label style={{ ...LABEL, marginBottom: 12 }}>
            {t.listLabelSocial}{" "}
            <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>{t.listLabelOptional}</span>
          </label>
          <SocialRow
            icon={<IgIcon />}
            value={instagram}
            onChange={setInstagram}
            placeholder="instagram.com/namatempatmu"
          />
          <SocialRow
            icon={<FbIcon />}
            value={facebook}
            onChange={setFacebook}
            placeholder="facebook.com/namatempatmu"
          />
          <SocialRow
            icon={<TtIcon />}
            value={tiktok}
            onChange={setTiktok}
            placeholder="tiktok.com/@namatempatmu"
          />
          <SocialRow
            icon={<WebIcon />}
            value={website}
            onChange={setWebsite}
            placeholder="www.namatempatmu.com"
          />
        </div>

        {/* ── 9. Photos ───────────────────────────────────────────────────────── */}
        <div style={FIELD}>
          <label style={LABEL}>
            {t.listLabelPhotos}{" "}
            <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>{t.listLabelOptional}</span>
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

            {/* Add photo tile — shown while count < 5 */}
            {photos.length < 5 && (
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

          {/* Hint */}
          <p style={{
            marginTop: 8, fontSize: 11, color: "#94a3b8",
            fontFamily: "var(--font-jakarta), sans-serif", lineHeight: 1.4,
          }}>
            {t.listPhotosHint}
          </p>
        </div>

        {/* ── 10. Description ─────────────────────────────────────────────────── */}
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
          } as React.CSSProperties}
        >
          {t.listSubmit}
          <span style={{ display: "inline-block", fontSize: 18, animation: "arrow-slide 1s ease-in-out infinite" }}>→</span>
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
