"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { OptimizedImage } from "@/components/OptimizedImage";
import { updateSubmissionStatus, deleteSubmission, enrichSubmissionFromGoogle, applySubmissionEnrichment } from "../../actions";
import type { GoogleEnrichment } from "@/lib/enrichment";

type Submission = {
  id: string;
  created_at: string;
  status: string;
  submitter_name: string | null;
  submitter_phone: string | null;
  name: string;
  category: string;
  area: string;
  address: string | null;
  phone: string | null;
  whatsapp: string | null;
  description: string | null;
  gmaps_url: string | null;
  hours: string | null;
  year_founded: number | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  youtube: string | null;
  website: string | null;
  logo_url: string | null;
  photos: string[] | null;
  yt_videos: string[] | null;
  category_data: Record<string, unknown> | null;
  admin_notes: string | null;
  reviewed_at: string | null;
};

const CATEGORY_LABELS: Record<string, string> = {
  "school":          "Sekolah",
  "learning-center": "Tempat Kursus",
  "daycare":         "Daycare",
  "playground":      "Playground",
  "clinic":          "Klinik",
  "cafe":            "Kafe",
  "mini-zoo":        "Mini Zoo",
  "swimming-pool":   "Kolam Renang",
  "bookstore":       "Toko Buku",
};

const STATUS_CFG = {
  pending:  { bg: "#fef3c7", color: "#b45309", label: "Pending"  },
  approved: { bg: "#dcfce7", color: "#166534", label: "Approved" },
  rejected: { bg: "#fee2e2", color: "#991b1b", label: "Rejected" },
} as const;

function fmt(d: string) {
  return new Date(d).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
function fmtRp(v: unknown) {
  if (!v) return "—";
  return "Rp " + Number(v).toLocaleString("id-ID");
}

const ROW: React.CSSProperties = { display: "flex", gap: 8, marginBottom: 8, fontSize: 13 };
const KEY: React.CSSProperties = { fontWeight: 600, color: "#374151", minWidth: 160, flexShrink: 0 };
const VAL: React.CSSProperties = { color: "#111827" };

function Field({ k, v }: { k: string; v: unknown }) {
  if (!v && v !== 0) return null;
  const display = Array.isArray(v) ? v.join(", ") : String(v);
  return (
    <div style={ROW}>
      <span style={KEY}>{k}</span>
      <span style={VAL}>{display}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", marginBottom: 20, overflow: "clip" }}>
      <div style={{ padding: "12px 20px", borderBottom: "1px solid #f3f4f6", fontWeight: 700, fontSize: 13, color: "#0e1d4f" }}>
        {title}
      </div>
      <div style={{ padding: "16px 20px" }}>
        {children}
      </div>
    </div>
  );
}

function renderCategoryData(category: string, data: Record<string, unknown>) {
  const rows: React.ReactNode[] = [];

  const push = (k: string, v: unknown) => {
    if (!v && v !== 0) return;
    rows.push(<Field key={k} k={k} v={v} />);
  };

  switch (category) {
    case "school":
      push("Kurikulum", data.curriculum);
      push("Bahasa", Array.isArray(data.bahasa) ? data.bahasa.join(", ") : data.bahasa);
      push("Jenjang", Array.isArray(data.grades) ? data.grades.join(", ") : data.grades);
      push("Siswa / Kelas", data.students_per_class);
      if (data.uang_pangkal_min || data.uang_pangkal_max)
        rows.push(<div key="up" style={ROW}><span style={KEY}>Uang Pangkal</span><span style={VAL}>{fmtRp(data.uang_pangkal_min)} – {fmtRp(data.uang_pangkal_max)}</span></div>);
      if (data.annual_fee_min || data.annual_fee_max)
        rows.push(<div key="af" style={ROW}><span style={KEY}>Annual Fee</span><span style={VAL}>{fmtRp(data.annual_fee_min)} – {fmtRp(data.annual_fee_max)}</span></div>);
      if (data.spp_min || data.spp_max)
        rows.push(<div key="spp" style={ROW}><span style={KEY}>SPP / bulan</span><span style={VAL}>{fmtRp(data.spp_min)} – {fmtRp(data.spp_max)}</span></div>);
      push("Fasilitas", data.facilities);
      push("Ekstrakurikuler", data.extracurriculars);
      break;
    case "learning-center":
      push("Tipe Kursus", Array.isArray(data.course_types) ? data.course_types.join(", ") : data.course_types);
      if (data.age_min || data.age_max)
        rows.push(<div key="age" style={ROW}><span style={KEY}>Usia</span><span style={VAL}>{String(data.age_min ?? "?")} – {String(data.age_max ?? "?")} thn</span></div>);
      push("Rasio Guru:Murid", data.teacher_ratio);
      push("Free Trial", data.free_trial);
      if (data.reg_fee_min || data.reg_fee_max)
        rows.push(<div key="rf" style={ROW}><span style={KEY}>Biaya Daftar</span><span style={VAL}>{fmtRp(data.reg_fee_min)} – {fmtRp(data.reg_fee_max)}</span></div>);
      if (data.price_min || data.price_max)
        rows.push(<div key="pr" style={ROW}><span style={KEY}>Harga / sesi</span><span style={VAL}>{fmtRp(data.price_min)} – {fmtRp(data.price_max)}</span></div>);
      break;
    case "daycare":
      push("Usia Diterima", Array.isArray(data.ages) ? data.ages.join(", ") : data.ages);
      push("Metode", data.method);
      push("Rasio Pengasuh:Anak", data.carer_ratio);
      push("CCTV", data.cctv);
      push("Akreditasi", data.accreditation);
      push("Fasilitas", data.facilities);
      if (data.price_min || data.price_max)
        rows.push(<div key="pr" style={ROW}><span style={KEY}>Harga / bulan</span><span style={VAL}>{fmtRp(data.price_min)} – {fmtRp(data.price_max)}</span></div>);
      break;
    case "playground":
      push("Tipe", Array.isArray(data.types) ? data.types.join(", ") : data.types);
      push("Fasilitas", data.facilities);
      if (data.price_min || data.price_max)
        rows.push(<div key="pr" style={ROW}><span style={KEY}>Tiket</span><span style={VAL}>{fmtRp(data.price_min)} – {fmtRp(data.price_max)}</span></div>);
      break;
    case "clinic":
      push("Layanan", Array.isArray(data.services) ? data.services.join(", ") : data.services);
      push("Fasilitas", data.facilities);
      if (data.biaya_min || data.biaya_max)
        rows.push(<div key="pr" style={ROW}><span style={KEY}>Biaya / sesi</span><span style={VAL}>{fmtRp(data.biaya_min)} – {fmtRp(data.biaya_max)}</span></div>);
      break;
    case "cafe":
      push("Budget Level", data.budget);
      push("Fasilitas", data.facilities);
      if (data.price_min || data.price_max)
        rows.push(<div key="pr" style={ROW}><span style={KEY}>Kisaran Harga</span><span style={VAL}>{fmtRp(data.price_min)} – {fmtRp(data.price_max)}</span></div>);
      break;
    default:
      push("Fasilitas", data.facilities);
      if (data.price_min || data.price_max)
        rows.push(<div key="pr" style={ROW}><span style={KEY}>Harga</span><span style={VAL}>{fmtRp(data.price_min)} – {fmtRp(data.price_max)}</span></div>);
  }

  return rows.length > 0 ? <>{rows}</> : <p style={{ fontSize: 13, color: "#9ca3af" }}>No additional data.</p>;
}

const primaryBtn: React.CSSProperties = {
  padding: "9px 18px", borderRadius: 8, background: "#0e1d4f", color: "#fff",
  fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer",
};

function tag(bg: string, color: string): React.CSSProperties {
  return { marginLeft: 8, fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 10, background: bg, color, verticalAlign: "middle" };
}

function Stat({ label, value, copy }: { label: string; value: string; copy?: string }) {
  return (
    <div
      onClick={copy ? () => navigator.clipboard?.writeText(copy) : undefined}
      title={copy ? "Click to copy" : undefined}
      style={{ background: "#f9fafb", border: "1px solid #f3f4f6", borderRadius: 8, padding: "8px 10px", cursor: copy ? "pointer" : "default" }}
    >
      <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginTop: 2 }}>{value}</div>
    </div>
  );
}

function EnrichRow({ label, current, suggested }: { label: string; current?: string | null; suggested?: string | null }) {
  if (!suggested) return null;
  const isNew = !current;
  const differs = !!current && current.trim() !== suggested.trim();
  return (
    <div style={{ ...ROW, alignItems: "flex-start" }}>
      <span style={KEY}>{label}</span>
      <span style={{ ...VAL, whiteSpace: "pre-wrap" }}>
        {suggested}
        {isNew && <span style={tag("#dcfce7", "#166534")}>NEW</span>}
        {differs && <span style={tag("#fef3c7", "#b45309")}>differs</span>}
      </span>
    </div>
  );
}

function GoogleEnrich({ s }: { s: Submission }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [result, setResult] = useState<GoogleEnrichment | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true); setError(null); setResult(null);
    try {
      const r = await enrichSubmissionFromGoogle(s.id);
      if (r.ok) setResult(r.data);
      else setError(r.error);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Enrichment failed.");
    } finally {
      setLoading(false);
    }
  }

  // Only fields the submitter left blank that Google can fill.
  const gaps: { address?: string; phone?: string; hours?: string; website?: string } = {};
  if (result) {
    if (!s.address && result.formattedAddress) gaps.address = result.formattedAddress;
    if (!s.phone && result.phone) gaps.phone = result.phone;
    if (!s.hours && result.hours) gaps.hours = result.hours;
    if (!s.website && result.website) gaps.website = result.website;
  }
  const gapKeys = Object.keys(gaps);

  async function applyGaps() {
    setApplying(true);
    try {
      await applySubmissionEnrichment(s.id, gaps);
      router.refresh();
    } finally {
      setApplying(false);
    }
  }

  return (
    <Section title="🔍 Auto-fill from Google">
      <p style={{ margin: "0 0 12px", fontSize: 12.5, color: "#6b7280" }}>
        Searches Google Maps for this place and suggests rating, coordinates, address, phone, hours and website.
      </p>
      <button onClick={run} disabled={loading} style={{ ...primaryBtn, opacity: loading ? 0.6 : 1 }}>
        {loading ? "Searching Google…" : result ? "Search again" : "✨ Auto-fill from Google"}
      </button>

      {error && (
        <div style={{ marginTop: 12, padding: "10px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 12.5, color: "#991b1b", whiteSpace: "pre-wrap" }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 16 }}>
            <Stat label="Google Rating" value={result.rating != null ? `⭐ ${result.rating} (${result.userRatingCount ?? 0} reviews)` : "—"} />
            <Stat label="Latitude" value={result.lat != null ? String(result.lat) : "—"} copy={result.lat != null ? String(result.lat) : undefined} />
            <Stat label="Longitude" value={result.lng != null ? String(result.lng) : "—"} copy={result.lng != null ? String(result.lng) : undefined} />
          </div>

          <EnrichRow label="Address" current={s.address} suggested={result.formattedAddress} />
          <EnrichRow label="Phone"   current={s.phone}   suggested={result.phone} />
          <EnrichRow label="Hours"   current={s.hours}   suggested={result.hours} />
          <EnrichRow label="Website" current={s.website} suggested={result.website} />
          {result.googleMapsUri && (
            <div style={{ ...ROW, marginTop: 6 }}>
              <span style={KEY}>Google Maps</span>
              <a href={result.googleMapsUri} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", fontSize: 13 }}>Open ↗</a>
            </div>
          )}

          {gapKeys.length > 0 ? (
            <button onClick={applyGaps} disabled={applying} style={{ ...primaryBtn, marginTop: 14, background: "#16a34a", opacity: applying ? 0.6 : 1 }}>
              {applying ? "Applying…" : `Fill ${gapKeys.length} empty field${gapKeys.length > 1 ? "s" : ""} (${gapKeys.join(", ")})`}
            </button>
          ) : (
            <p style={{ marginTop: 14, fontSize: 12.5, color: "#9ca3af" }}>No empty submission fields to fill — rating &amp; coordinates above are ready to copy into the listing.</p>
          )}
        </div>
      )}
    </Section>
  );
}

// ── Completeness checklist ────────────────────────────────────────────────────

function isFilled(v: unknown): boolean {
  if (v == null) return false;
  if (Array.isArray(v)) return v.filter(Boolean).length > 0;
  if (typeof v === "string") return v.trim() !== "";
  return true;
}

const CORE_FIELDS: { label: string; key: keyof Submission }[] = [
  { label: "Area", key: "area" },
  { label: "Address", key: "address" },
  { label: "Phone", key: "phone" },
  { label: "WhatsApp", key: "whatsapp" },
  { label: "Google Maps link", key: "gmaps_url" },
  { label: "Operating hours", key: "hours" },
  { label: "Year founded", key: "year_founded" },
  { label: "Description", key: "description" },
];
const SOCIAL_FIELDS: { label: string; key: keyof Submission }[] = [
  { label: "Instagram", key: "instagram" },
  { label: "Facebook", key: "facebook" },
  { label: "TikTok", key: "tiktok" },
  { label: "YouTube", key: "youtube" },
  { label: "Website", key: "website" },
];
const MEDIA_FIELDS: { label: string; key: keyof Submission }[] = [
  { label: "Logo", key: "logo_url" },
  { label: "Photos", key: "photos" },
  { label: "YouTube videos", key: "yt_videos" },
];

// Category-specific fields (mirrors renderCategoryData). Present if ANY key is filled.
const CATEGORY_FIELDS: Record<string, { label: string; keys: string[] }[]> = {
  school: [
    { label: "Kurikulum", keys: ["curriculum"] },
    { label: "Bahasa Pengantar", keys: ["bahasa"] },
    { label: "Jenjang / Grades", keys: ["grades"] },
    { label: "Siswa per kelas", keys: ["students_per_class"] },
    { label: "Uang Pangkal", keys: ["uang_pangkal_min", "uang_pangkal_max"] },
    { label: "Annual Fee", keys: ["annual_fee_min", "annual_fee_max"] },
    { label: "SPP / bulan", keys: ["spp_min", "spp_max"] },
    { label: "Fasilitas", keys: ["facilities"] },
    { label: "Ekstrakurikuler", keys: ["extracurriculars"] },
  ],
  "learning-center": [
    { label: "Tipe Kursus", keys: ["course_types"] },
    { label: "Usia", keys: ["age_min", "age_max"] },
    { label: "Rasio Guru:Murid", keys: ["teacher_ratio"] },
    { label: "Free Trial", keys: ["free_trial"] },
    { label: "Biaya Daftar", keys: ["reg_fee_min", "reg_fee_max"] },
    { label: "Harga / sesi", keys: ["price_min", "price_max"] },
  ],
  daycare: [
    { label: "Usia Diterima", keys: ["ages"] },
    { label: "Metode", keys: ["method"] },
    { label: "Rasio Pengasuh:Anak", keys: ["carer_ratio"] },
    { label: "CCTV", keys: ["cctv"] },
    { label: "Akreditasi", keys: ["accreditation"] },
    { label: "Fasilitas", keys: ["facilities"] },
    { label: "Harga / bulan", keys: ["price_min", "price_max"] },
  ],
  playground: [
    { label: "Tipe", keys: ["types"] },
    { label: "Fasilitas", keys: ["facilities"] },
    { label: "Tiket", keys: ["price_min", "price_max"] },
  ],
  clinic: [
    { label: "Layanan", keys: ["services"] },
    { label: "Fasilitas", keys: ["facilities"] },
    { label: "Biaya / sesi", keys: ["biaya_min", "biaya_max"] },
  ],
  cafe: [
    { label: "Budget Level", keys: ["budget"] },
    { label: "Fasilitas", keys: ["facilities"] },
    { label: "Kisaran Harga", keys: ["price_min", "price_max"] },
  ],
};
const CATEGORY_FIELDS_DEFAULT = [
  { label: "Fasilitas", keys: ["facilities"] },
  { label: "Harga", keys: ["price_min", "price_max"] },
];

function ChecklistRow({ label, filled }: { label: string; filled: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 0", fontSize: 13 }}>
      <span style={{ width: 14, textAlign: "center", color: filled ? "#16a34a" : "#ef4444", fontWeight: 800 }}>
        {filled ? "✓" : "✗"}
      </span>
      <span style={{ color: filled ? "#6b7280" : "#b91c1c", fontWeight: filled ? 400 : 600 }}>
        {label}{filled ? "" : " — missing"}
      </span>
    </div>
  );
}

function CompletenessGroup({ title, fields }: { title: string; fields: { label: string; filled: boolean }[] }) {
  const missing = fields.filter((f) => !f.filled).length;
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
        {title}{missing > 0 && <span style={{ color: "#ef4444" }}> ({missing} missing)</span>}
      </div>
      {fields.map((f) => <ChecklistRow key={f.label} label={f.label} filled={f.filled} />)}
    </div>
  );
}

function Completeness({ s }: { s: Submission }) {
  const cd = (s.category_data ?? {}) as Record<string, unknown>;
  const core = CORE_FIELDS.map((f) => ({ label: f.label, filled: isFilled(s[f.key]) }));
  const social = SOCIAL_FIELDS.map((f) => ({ label: f.label, filled: isFilled(s[f.key]) }));
  const media = MEDIA_FIELDS.map((f) => ({ label: f.label, filled: isFilled(s[f.key]) }));
  const catSpec = CATEGORY_FIELDS[s.category] ?? CATEGORY_FIELDS_DEFAULT;
  const cat = catSpec.map((spec) => ({ label: spec.label, filled: spec.keys.some((k) => isFilled(cd[k])) }));

  const all = [...core, ...social, ...media, ...cat];
  const filledCount = all.filter((f) => f.filled).length;
  const missingCount = all.length - filledCount;

  return (
    <Section title="✅ Completeness — what's still missing">
      <div style={{ fontSize: 13, marginBottom: 14, fontWeight: 700, color: missingCount ? "#b45309" : "#166534" }}>
        {missingCount > 0
          ? `${filledCount} of ${all.length} fields filled — ${missingCount} still missing`
          : `All ${all.length} expected fields are filled 🎉`}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "16px 24px" }}>
        <CompletenessGroup title="Contact & Location" fields={core} />
        <CompletenessGroup title="Social Media" fields={social} />
        <CompletenessGroup title="Media" fields={media} />
        <CompletenessGroup title={`${CATEGORY_LABELS[s.category] ?? s.category} details`} fields={cat} />
      </div>
    </Section>
  );
}

export default function SubmissionDetail({ submission: s }: { submission: Submission }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState(s.admin_notes ?? "");
  const [status, setStatus] = useState(s.status);

  const badge = STATUS_CFG[status as keyof typeof STATUS_CFG] ?? STATUS_CFG.pending;

  function handleStatus(newStatus: "pending" | "approved" | "rejected") {
    startTransition(async () => {
      await updateSubmissionStatus(s.id, newStatus, notes);
      setStatus(newStatus);
    });
  }

  const adminCategoryHref: Record<string, string> = {
    "school":          "/admin/schools/new",
    "learning-center": "/admin/learning-centers/new",
    "daycare":         "/admin/daycares/new",
    "playground":      "/admin/playgrounds/new",
    "clinic":          "/admin/clinics/new",
    "cafe":            "/admin/cafes/new",
    "mini-zoo":        "/admin/mini-zoo/new",
    "swimming-pool":   "/admin/swimming-pools/new",
    "bookstore":       "/admin/bookstores/new",
  };

  return (
    <div style={{ maxWidth: 780 }}>
      {/* Back + Delete */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <Link href="/admin/submissions" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6b7280", textDecoration: "none" }}>
          <ChevronLeft size={16} /> Back to Submissions
        </Link>
        <button
          onClick={async () => {
            if (!confirm("Delete this submission? This cannot be undone.")) return;
            await deleteSubmission(s.id);
            router.replace("/admin/submissions");
          }}
          style={{
            fontSize: 13, fontWeight: 600, padding: "6px 14px", borderRadius: 6,
            border: "1.5px solid #fecaca", background: "#fff", color: "#ef4444", cursor: "pointer",
          }}
        >
          Delete
        </button>
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0e1d4f", margin: "0 0 6px" }}>{s.name}</h1>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 6, background: "#f1f5f9", color: "#475569", fontWeight: 600 }}>
              {CATEGORY_LABELS[s.category] ?? s.category}
            </span>
            <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 6, background: "#f1f5f9", color: "#475569", fontWeight: 600 }}>
              {s.area}
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20, background: badge.bg, color: badge.color }}>
              {badge.label}
            </span>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>Submitted {fmt(s.created_at)}</span>
          </div>
        </div>

        {/* Create Listing shortcut */}
        {status === "approved" && adminCategoryHref[s.category] && (
          <Link
            href={adminCategoryHref[s.category]}
            style={{
              padding: "9px 18px", borderRadius: 8, background: "#0e1d4f", color: "#fff",
              fontSize: 13, fontWeight: 600, textDecoration: "none", flexShrink: 0,
            }}
          >
            + Create Listing →
          </Link>
        )}
      </div>

      {/* Completeness checklist */}
      <Completeness s={s} />

      {/* Auto-fill from Google */}
      <GoogleEnrich s={s} />

      {/* Submitter info */}
      {(s.submitter_name || s.submitter_phone) && (
        <Section title="Submitted by">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              {s.submitter_name && (
                <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 4 }}>{s.submitter_name}</div>
              )}
              {s.submitter_phone && (
                <div style={{ fontSize: 13, color: "#6b7280" }}>{s.submitter_phone}</div>
              )}
            </div>
            {s.submitter_phone && (
              <a
                href={`https://wa.me/${s.submitter_phone.replace(/^\+/, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "9px 18px", borderRadius: 8,
                  background: "#22c55e", color: "#fff",
                  fontSize: 13, fontWeight: 700, textDecoration: "none",
                }}
              >
                💬 Chat di WhatsApp
              </a>
            )}
          </div>
        </Section>
      )}

      {/* Core info */}
      <Section title="Core Info">
        <Field k="Address"       v={s.address} />
        <Field k="Phone"         v={s.phone} />
        <Field k="WhatsApp"      v={s.whatsapp} />
        <Field k="Hours"         v={s.hours} />
        <Field k="Year Founded"  v={s.year_founded} />
        {s.gmaps_url && (
          <div style={ROW}>
            <span style={KEY}>Google Maps</span>
            <a href={s.gmaps_url} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", fontSize: 13 }}>Open link</a>
          </div>
        )}
        {s.description && (
          <div style={{ marginTop: 12 }}>
            <div style={{ ...KEY, marginBottom: 4 }}>Description</div>
            <p style={{ margin: 0, fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{s.description}</p>
          </div>
        )}
      </Section>

      {/* Social links */}
      {(s.instagram || s.facebook || s.tiktok || s.youtube || s.website) && (
        <Section title="Social Links">
          <Field k="Instagram" v={s.instagram ? `@${s.instagram}` : null} />
          <Field k="Facebook"  v={s.facebook} />
          <Field k="TikTok"    v={s.tiktok ? `@${s.tiktok}` : null} />
          <Field k="YouTube"   v={s.youtube ? `@${s.youtube}` : null} />
          {s.website && (
            <div style={ROW}>
              <span style={KEY}>Website</span>
              <a href={s.website} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", fontSize: 13 }}>{s.website}</a>
            </div>
          )}
        </Section>
      )}

      {/* Category-specific */}
      {s.category_data && Object.keys(s.category_data).some(k => s.category_data![k] != null) && (
        <Section title={`${CATEGORY_LABELS[s.category] ?? s.category} — Details`}>
          {renderCategoryData(s.category, s.category_data)}
        </Section>
      )}

      {/* Media */}
      {(s.logo_url || (s.photos && s.photos.length > 0) || (s.yt_videos && s.yt_videos.some(Boolean))) && (
        <Section title="Media">
          {/* Logo */}
          {s.logo_url && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>Logo</div>
              <OptimizedImage src={s.logo_url} alt="Logo" width={80} height={80} sizes="80px" style={{ width: 80, height: 80, objectFit: "contain", borderRadius: 10, border: "1px solid #e5e7eb", background: "#f9fafb", padding: 4 }} />
            </div>
          )}

          {/* Photos */}
          {s.photos && s.photos.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>
                Photos ({s.photos.length})
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8 }}>
                {s.photos.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" style={{ display: "block", position: "relative", aspectRatio: "1/1" }}>
                    <OptimizedImage src={url} alt={`Photo ${i + 1}`} fill sizes="(max-width: 480px) 33vw, 160px" style={{ objectFit: "cover", borderRadius: 8, border: "1px solid #e5e7eb", display: "block" }} />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* YouTube videos */}
          {s.yt_videos && s.yt_videos.filter(Boolean).length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>YouTube Videos</div>
              {s.yt_videos.filter(Boolean).map((url, i) => (
                <div key={i} style={{ marginBottom: 4 }}>
                  <a href={url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#2563eb" }}>{url}</a>
                </div>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* Admin review */}
      <Section title="Review">
        {s.reviewed_at && (
          <p style={{ margin: "0 0 12px", fontSize: 12, color: "#9ca3af" }}>Last reviewed {fmt(s.reviewed_at)}</p>
        )}

        {/* Status buttons */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {(["pending", "approved", "rejected"] as const).map(st => {
            const cfg = STATUS_CFG[st];
            const isActive = status === st;
            return (
              <button
                key={st}
                onClick={() => handleStatus(st)}
                disabled={isPending}
                style={{
                  padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: isPending ? "not-allowed" : "pointer",
                  border: isActive ? `2px solid ${cfg.color}` : "2px solid #e5e7eb",
                  background: isActive ? cfg.bg : "#fff",
                  color: isActive ? cfg.color : "#6b7280",
                  opacity: isPending ? 0.6 : 1,
                }}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>

        {/* Admin notes */}
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#6b7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Admin Notes
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            placeholder="Internal notes about this submission…"
            style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }}
          />
          <button
            onClick={() => handleStatus(status as "pending" | "approved" | "rejected")}
            disabled={isPending}
            style={{
              marginTop: 8, padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: isPending ? "not-allowed" : "pointer",
              background: "#0e1d4f", color: "#fff", border: "none", opacity: isPending ? 0.6 : 1,
            }}
          >
            {isPending ? "Saving…" : "Save Notes"}
          </button>
        </div>
      </Section>
    </div>
  );
}
