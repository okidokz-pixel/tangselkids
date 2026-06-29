"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { OptimizedImage } from "@/components/OptimizedImage";
import { updateSubmissionStatus, deleteSubmission, enrichSubmissionFromGoogle, applySubmissionEnrichment, updateSubmissionFields } from "../../actions";
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
const ROW: React.CSSProperties = { display: "flex", gap: 8, marginBottom: 8, fontSize: 13 };
const KEY: React.CSSProperties = { fontWeight: 600, color: "#374151", minWidth: 160, flexShrink: 0 };
const VAL: React.CSSProperties = { color: "#111827" };

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

function GoogleEnrich({
  s,
  current,
  onFill,
}: {
  s: Submission;
  current?: { address: string; phone: string; hours: string; website: string };
  onFill?: (patch: Record<string, string>) => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [result, setResult] = useState<GoogleEnrichment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filled, setFilled] = useState(false);

  async function run() {
    setLoading(true); setError(null); setResult(null); setFilled(false);
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

  // Compare against the live form values (when wired) so already-typed fields aren't "gaps".
  const base = current ?? { address: s.address ?? "", phone: s.phone ?? "", hours: s.hours ?? "", website: s.website ?? "" };

  const gaps: Record<string, string> = {};
  if (result) {
    if (!base.address.trim() && result.formattedAddress) gaps.address = result.formattedAddress;
    if (!base.phone.trim() && result.phone) gaps.phone = result.phone;
    if (!base.hours.trim() && result.hours) gaps.hours = result.hours;
    if (!base.website.trim() && result.website) gaps.website = result.website;
  }
  const gapKeys = Object.keys(gaps);

  async function applyGaps() {
    if (onFill) { onFill(gaps); setFilled(true); return; }
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
          <p style={{ margin: "0 0 12px", fontSize: 12, color: "#b45309", fontWeight: 600 }}>
            ⚠️ Found: <b>{result.name}</b> — verify this is the right place before filling (Google returns its best guess).
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 16 }}>
            <Stat label="Google Rating" value={result.rating != null ? `⭐ ${result.rating} (${result.userRatingCount ?? 0} reviews)` : "—"} />
            <Stat label="Latitude" value={result.lat != null ? String(result.lat) : "—"} copy={result.lat != null ? String(result.lat) : undefined} />
            <Stat label="Longitude" value={result.lng != null ? String(result.lng) : "—"} copy={result.lng != null ? String(result.lng) : undefined} />
          </div>

          <EnrichRow label="Address" current={base.address} suggested={result.formattedAddress} />
          <EnrichRow label="Phone"   current={base.phone}   suggested={result.phone} />
          <EnrichRow label="Hours"   current={base.hours}   suggested={result.hours} />
          <EnrichRow label="Website" current={base.website} suggested={result.website} />
          {result.googleMapsUri && (
            <div style={{ ...ROW, marginTop: 6 }}>
              <span style={KEY}>Google Maps</span>
              <a href={result.googleMapsUri} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", fontSize: 13 }}>Open ↗</a>
            </div>
          )}

          {gapKeys.length > 0 ? (
            <button onClick={applyGaps} disabled={applying} style={{ ...primaryBtn, marginTop: 14, background: "#16a34a", opacity: applying ? 0.6 : 1 }}>
              {applying ? "Applying…" : `Fill ${gapKeys.length} empty field${gapKeys.length > 1 ? "s" : ""}${onFill ? " below" : ""} (${gapKeys.join(", ")})`}
            </button>
          ) : (
            <p style={{ marginTop: 14, fontSize: 12.5, color: "#9ca3af" }}>No empty fields to fill — rating &amp; coordinates above are ready to copy into the listing.</p>
          )}
          {filled && <p style={{ marginTop: 10, fontSize: 12.5, color: "#16a34a", fontWeight: 600 }}>✓ Filled into the form below — review and click “Save changes”.</p>}
        </div>
      )}
    </Section>
  );
}

// ── Editable fields ───────────────────────────────────────────────────────────

const AREA_OPTIONS = ["Bintaro", "BSD", "Bintaro/BSD"];
const GRADE_OPTIONS = ["Preschool", "TK", "SD", "SMP", "SMA"];
const BAHASA_OPTIONS = ["Indonesia", "Inggris", "Arab", "Mandarin", "Jerman", "Jepang"];
const CURRICULUM_CATEGORY_OPTIONS = ["Nasional", "Cambridge", "International Baccalaureate (IB)", "Islamic", "Montessori", "Lainnya"];

/** "100000" → "100.000" (Indonesian thousands). Non-digits stripped. */
function formatThousands(s: string): string {
  const digits = (s ?? "").replace(/\D/g, "");
  return digits ? Number(digits).toLocaleString("id-ID") : "";
}
function parseThousands(s: string): number | null {
  const digits = (s ?? "").replace(/\D/g, "");
  return digits ? Number(digits) : null;
}

/** Social handle → "@handle" (extracts from a profile URL if one is pasted). */
function normalizeHandle(s: string): string {
  let v = (s ?? "").trim();
  if (!v) return "";
  const m = v.match(/(?:instagram\.com|tiktok\.com|youtube\.com|facebook\.com|t\.me)\/+@?([A-Za-z0-9._-]+)/i);
  if (m) v = m[1];
  v = v.replace(/^@+/, "");
  return v ? "@" + v : "";
}

/** Phone → "628xxxxxxxx" (leading 0 → 62, bare 8 → 62, strips +/spaces/dashes). */
function normalizePhone62(s: string): string {
  let d = (s ?? "").replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith("0")) d = "62" + d.slice(1);
  else if (d.startsWith("8")) d = "62" + d;
  return d;
}

function FieldLabel({ label, empty }: { label: string; empty: boolean }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: empty ? "#b45309" : "#374151", marginBottom: 4 }}>
      {empty ? <span title="Missing">⚠️</span> : null}{label}{empty ? <span style={{ fontWeight: 600, color: "#d97706", fontSize: 11 }}>— missing</span> : null}
    </label>
  );
}

function editInput(empty: boolean): React.CSSProperties {
  return {
    width: "100%", padding: "8px 10px", borderRadius: 7,
    border: `1.5px solid ${empty ? "#fcd34d" : "#e5e7eb"}`,
    background: empty ? "#fffbeb" : "#fff",
    fontSize: 13, outline: "none", resize: "vertical",
    fontFamily: "inherit", boxSizing: "border-box",
  };
}

type FieldType = "text" | "textarea" | "number" | "select" | "handle" | "phone";

function EditField({ label, value, onChange, type = "text", placeholder, options }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: FieldType;
  placeholder?: string;
  options?: string[];
}) {
  const empty = !value.trim();
  let control: React.ReactNode;
  if (type === "select") {
    const opts = options ?? [];
    const all = value && !opts.includes(value) ? [value, ...opts] : opts;
    control = (
      <select value={value} onChange={(e) => onChange(e.target.value)} style={editInput(empty)}>
        <option value="">— pilih —</option>
        {all.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  } else if (type === "textarea") {
    control = <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} style={{ ...editInput(empty), minHeight: 64 }} />;
  } else {
    const onBlur =
      type === "handle" ? () => onChange(normalizeHandle(value))
      : type === "phone" ? () => onChange(normalizePhone62(value))
      : undefined;
    const ph = placeholder ?? (type === "handle" ? "@handle" : type === "phone" ? "628xxxxxxxxxx" : undefined);
    control = (
      <input
        type={type === "number" ? "number" : "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={ph}
        style={editInput(empty)}
      />
    );
  }
  return (
    <div style={{ marginBottom: 12 }}>
      <FieldLabel label={label} empty={empty} />
      {control}
    </div>
  );
}

const EDIT_FIELDS: { key: string; label: string; type?: FieldType; group: "contact" | "social"; options?: string[] }[] = [
  { key: "name", label: "Name", group: "contact" },
  { key: "area", label: "Area", type: "select", options: AREA_OPTIONS, group: "contact" },
  { key: "address", label: "Address", type: "textarea", group: "contact" },
  { key: "phone", label: "Phone", group: "contact" },
  { key: "whatsapp", label: "WhatsApp", type: "phone", group: "contact" },
  { key: "gmaps_url", label: "Google Maps link", group: "contact" },
  { key: "hours", label: "Operating hours", group: "contact" },
  { key: "year_founded", label: "Year founded", type: "number", group: "contact" },
  { key: "description", label: "Description", type: "textarea", group: "contact" },
  { key: "instagram", label: "Instagram", type: "handle", group: "social" },
  { key: "facebook", label: "Facebook", group: "social" },
  { key: "tiktok", label: "TikTok", type: "handle", group: "social" },
  { key: "youtube", label: "YouTube", group: "social" },
  { key: "website", label: "Website", group: "social" },
];

// ── Category-specific editable fields ─────────────────────────────────────────

type CatField =
  | { kind: "text" | "textarea" | "list"; key: string; label: string }
  | { kind: "select"; key: string; label: string; options: string[] }
  | { kind: "checkboxes"; key: string; label: string; options: string[] }
  | { kind: "range"; minKey: string; maxKey: string; label: string };

const CATEGORY_EDIT_FIELDS: Record<string, CatField[]> = {
  school: [
    { kind: "checkboxes", key: "grades", label: "Jenjang Lengkap", options: GRADE_OPTIONS },
    { kind: "text", key: "curriculum", label: "Kurikulum" },
    { kind: "select", key: "curriculum_category", label: "Kategori Kurikulum", options: CURRICULUM_CATEGORY_OPTIONS },
    { kind: "checkboxes", key: "bahasa", label: "Bahasa Pengantar", options: BAHASA_OPTIONS },
    { kind: "text", key: "teaching_language", label: "Bahasa Pengantar (deskripsi)" },
    { kind: "text", key: "students_per_class", label: "Siswa per kelas" },
    { kind: "range", minKey: "uang_pangkal_min", maxKey: "uang_pangkal_max", label: "Uang Pangkal (Rp)" },
    { kind: "range", minKey: "annual_fee_min", maxKey: "annual_fee_max", label: "Annual Fee (Rp)" },
    { kind: "range", minKey: "spp_min", maxKey: "spp_max", label: "SPP / bulan (Rp)" },
    { kind: "text", key: "tahun_biaya", label: "Tahun Biaya (mis. 2024/2025)" },
    { kind: "textarea", key: "jadwal_pendaftaran", label: "Jadwal Pendaftaran" },
    { kind: "list", key: "facilities", label: "Fasilitas" },
    { kind: "list", key: "extracurriculars", label: "Ekstrakurikuler" },
  ],
  "learning-center": [
    { kind: "list", key: "course_types", label: "Tipe Kursus" },
    { kind: "range", minKey: "age_min", maxKey: "age_max", label: "Usia (tahun)" },
    { kind: "text", key: "teacher_ratio", label: "Rasio Guru:Murid" },
    { kind: "text", key: "free_trial", label: "Free Trial" },
    { kind: "range", minKey: "reg_fee_min", maxKey: "reg_fee_max", label: "Biaya Daftar (Rp)" },
    { kind: "range", minKey: "price_min", maxKey: "price_max", label: "Harga / sesi (Rp)" },
  ],
  daycare: [
    { kind: "list", key: "ages", label: "Usia Diterima" },
    { kind: "text", key: "method", label: "Metode" },
    { kind: "text", key: "carer_ratio", label: "Rasio Pengasuh:Anak" },
    { kind: "text", key: "cctv", label: "CCTV" },
    { kind: "text", key: "accreditation", label: "Akreditasi" },
    { kind: "list", key: "facilities", label: "Fasilitas" },
    { kind: "range", minKey: "price_min", maxKey: "price_max", label: "Harga / bulan (Rp)" },
  ],
  playground: [
    { kind: "list", key: "types", label: "Tipe" },
    { kind: "list", key: "facilities", label: "Fasilitas" },
    { kind: "range", minKey: "price_min", maxKey: "price_max", label: "Tiket (Rp)" },
  ],
  clinic: [
    { kind: "list", key: "services", label: "Layanan" },
    { kind: "list", key: "facilities", label: "Fasilitas" },
    { kind: "range", minKey: "biaya_min", maxKey: "biaya_max", label: "Biaya / sesi (Rp)" },
  ],
  cafe: [
    { kind: "text", key: "budget", label: "Budget Level" },
    { kind: "list", key: "facilities", label: "Fasilitas" },
    { kind: "range", minKey: "price_min", maxKey: "price_max", label: "Kisaran Harga (Rp)" },
  ],
};
const CATEGORY_EDIT_DEFAULT: CatField[] = [
  { kind: "list", key: "facilities", label: "Fasilitas" },
  { kind: "range", minKey: "price_min", maxKey: "price_max", label: "Harga (Rp)" },
];
// Place-page fields with no dedicated submission column — stashed in category_data
// for every category so they're captured at review time (no schema migration).
const UNIVERSAL_CAT_FIELDS: CatField[] = [
  { kind: "text", key: "location_detail", label: "Lokasi Spesifik" },
  { kind: "text", key: "email", label: "Email" },
  { kind: "text", key: "slug", label: "Slug (URL)" },
  { kind: "text", key: "fee_image_url", label: "Detil Biaya (URL gambar infografis)" },
];

function flattenCat(spec: CatField[], data: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of spec) {
    if (f.kind === "range") {
      out[f.minKey] = data[f.minKey] != null ? formatThousands(String(data[f.minKey])) : "";
      out[f.maxKey] = data[f.maxKey] != null ? formatThousands(String(data[f.maxKey])) : "";
    } else {
      const v = data[f.key];
      out[f.key] = v == null ? "" : Array.isArray(v) ? v.join(", ") : String(v);
    }
  }
  return out;
}

function buildCat(spec: CatField[], base: Record<string, unknown>, cat: Record<string, string>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...base };
  for (const f of spec) {
    if (f.kind === "range") {
      out[f.minKey] = parseThousands(cat[f.minKey] ?? "");
      out[f.maxKey] = parseThousands(cat[f.maxKey] ?? "");
    } else if (f.kind === "list" || f.kind === "checkboxes") {
      const arr = (cat[f.key] ?? "").split(",").map((x) => x.trim()).filter(Boolean);
      out[f.key] = arr.length ? arr : null;
    } else {
      out[f.key] = cat[f.key]?.trim() ? cat[f.key].trim() : null;
    }
  }
  return out;
}

function CatFieldEditor({ field, cat, set }: { field: CatField; cat: Record<string, string>; set: (k: string, v: string) => void }) {
  if (field.kind === "range") {
    const minV = cat[field.minKey] ?? "";
    const maxV = cat[field.maxKey] ?? "";
    const empty = !minV.trim() && !maxV.trim();
    return (
      <div style={{ marginBottom: 12 }}>
        <FieldLabel label={field.label} empty={empty} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input inputMode="numeric" placeholder="min" value={minV} onChange={(e) => set(field.minKey, formatThousands(e.target.value))} style={editInput(empty)} />
          <span style={{ color: "#9ca3af" }}>–</span>
          <input inputMode="numeric" placeholder="max" value={maxV} onChange={(e) => set(field.maxKey, formatThousands(e.target.value))} style={editInput(empty)} />
        </div>
      </div>
    );
  }
  if (field.kind === "checkboxes") {
    const selected = (cat[field.key] ?? "").split(",").map((x) => x.trim()).filter(Boolean);
    const empty = selected.length === 0;
    const all = [...field.options, ...selected.filter((v) => !field.options.includes(v))];
    const toggle = (opt: string) => {
      const next = selected.includes(opt) ? selected.filter((x) => x !== opt) : [...selected, opt];
      set(field.key, next.join(", "));
    };
    return (
      <div style={{ marginBottom: 12 }}>
        <FieldLabel label={field.label} empty={empty} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {all.map((opt) => {
            const on = selected.includes(opt);
            return (
              <label key={opt} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 7, border: `1.5px solid ${on ? "#16a34a" : "#e5e7eb"}`, background: on ? "#f0fdf4" : "#fff", fontSize: 12.5, cursor: "pointer" }}>
                <input type="checkbox" checked={on} onChange={() => toggle(opt)} /> {opt}
              </label>
            );
          })}
        </div>
      </div>
    );
  }
  if (field.kind === "select") {
    return <EditField label={field.label} value={cat[field.key] ?? ""} onChange={(v) => set(field.key, v)} type="select" options={field.options} />;
  }
  return (
    <EditField
      label={field.label}
      value={cat[field.key] ?? ""}
      onChange={(v) => set(field.key, v)}
      type={field.kind === "textarea" ? "textarea" : "text"}
      placeholder={field.kind === "list" ? "Comma-separated" : undefined}
    />
  );
}

export default function SubmissionDetail({ submission: s }: { submission: Submission }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState(s.admin_notes ?? "");
  const [status, setStatus] = useState(s.status);
  const [form, setForm] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const f of EDIT_FIELDS) {
      const v = (s as unknown as Record<string, unknown>)[f.key];
      init[f.key] = v == null ? "" : String(v);
    }
    return init;
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const setField = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const baseCat = CATEGORY_EDIT_FIELDS[s.category] ?? CATEGORY_EDIT_DEFAULT;
  const catSpec = [...baseCat, ...UNIVERSAL_CAT_FIELDS];
  const [cat, setCat] = useState<Record<string, string>>(() => flattenCat(catSpec, (s.category_data ?? {}) as Record<string, unknown>));
  const [videos, setVideos] = useState((s.yt_videos ?? []).filter(Boolean).join("\n"));
  const setCatField = (k: string, v: string) => setCat((p) => ({ ...p, [k]: v }));

  async function saveFields() {
    setSaving(true); setSaved(false);
    try {
      const normForm = {
        ...form,
        instagram: normalizeHandle(form.instagram ?? ""),
        tiktok: normalizeHandle(form.tiktok ?? ""),
        whatsapp: normalizePhone62(form.whatsapp ?? ""),
      };
      setForm(normForm);
      const category_data = buildCat(catSpec, (s.category_data ?? {}) as Record<string, unknown>, cat);
      const yt_videos = videos.split("\n").map((t) => t.trim()).filter(Boolean);
      await updateSubmissionFields(s.id, { ...normForm, category_data, yt_videos });
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  // WhatsApp templates. Button 2 includes the live place URL, built from the
  // editable slug field (category_data.slug) — paste a full URL there too if you prefer.
  const SITE_URL = "https://tangselkids.com";
  const liveSlug = (cat.slug ?? "").trim();
  const livePlaceUrl = liveSlug
    ? (liveSlug.startsWith("http") ? liveSlug : `${SITE_URL}/place/${liveSlug.replace(/^\/+/, "")}`)
    : "";

  const waReceivedMsg =
    `[Dari: Admin TangselKids] Halo, ${s.submitter_name ?? ""}!  Kami sudah menerima pendaftaran untuk *${s.name}* di *TangselKids*. ` +
    `Mohon menunggu 1-2 hari untuk proses verifikasi dan akan kami kabarkan lagi jika sudah diterima.`;

  const waApprovedMsg =
    `[Dari: Admin TangselKids] Halo, ${s.submitter_name ?? ""}! Pendaftaran *${s.name}* di *TangselKids* sudah kami approve! :) ` +
    `Silahkan lihat link-nya disini:\n${livePlaceUrl || "[link halaman tempat]"}\n` +
    `Terima kasih sudah menggunakan TangselKids! ^_^`;

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

      {/* Copyable place URL (after approval) */}
      {status === "approved" && (
        <div style={{ marginBottom: 20, padding: "12px 14px", borderRadius: 10, background: "#f0faf4", border: "1px solid #bbf7d0" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#15803d", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
            URL Halaman Tempat
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              readOnly
              value={liveSlug ? livePlaceUrl : `${SITE_URL}/place/(isi Slug dulu)`}
              onFocus={(e) => e.currentTarget.select()}
              style={{ flex: 1, padding: "8px 10px", borderRadius: 7, border: "1.5px solid #bbf7d0", fontSize: 13, color: "#0f172a", background: "#fff", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
            />
            <button
              type="button"
              disabled={!liveSlug}
              onClick={() => { navigator.clipboard?.writeText(livePlaceUrl); setCopiedUrl(true); setTimeout(() => setCopiedUrl(false), 1800); }}
              style={{ padding: "8px 16px", borderRadius: 7, border: "none", background: copiedUrl ? "#16a34a" : "#0e1d4f", color: "#fff", fontSize: 13, fontWeight: 700, cursor: liveSlug ? "pointer" : "not-allowed", opacity: liveSlug ? 1 : 0.5, whiteSpace: "nowrap" }}
            >
              {copiedUrl ? "✓ Tersalin" : "Salin"}
            </button>
          </div>
          <p style={{ fontSize: 11, color: "#15803d", margin: "6px 0 0", lineHeight: 1.5 }}>
            Catatan: link baru aktif <b>setelah listing dibuat</b> — klik &ldquo;+ Create Listing&rdquo;, isi form, lalu simpan dengan slug yang sama. Approve saja belum membuat halaman.
          </p>
        </div>
      )}

      {/* Auto-fill from Google */}
      <GoogleEnrich
        s={s}
        current={{ address: form.address, phone: form.phone, hours: form.hours, website: form.website }}
        onFill={(patch) => setForm((f) => ({ ...f, ...patch }))}
      />

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
              <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                <a
                  href={`https://wa.me/${normalizePhone62(s.submitter_phone)}?text=${encodeURIComponent(waReceivedMsg)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "9px 18px", borderRadius: 8,
                    background: "#22c55e", color: "#fff",
                    fontSize: 13, fontWeight: 700, textDecoration: "none",
                  }}
                >
                  📥 Konfirmasi diterima
                </a>
                <a
                  href={`https://wa.me/${normalizePhone62(s.submitter_phone)}?text=${encodeURIComponent(waApprovedMsg)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "9px 18px", borderRadius: 8,
                    background: "#0e1d4f", color: "#fff",
                    fontSize: 13, fontWeight: 700, textDecoration: "none",
                  }}
                >
                  ✅ Beritahu sudah live
                </a>
                <span style={{ fontSize: 11, color: liveSlug ? "#16a34a" : "#d97706", textAlign: "right", maxWidth: 220 }}>
                  {liveSlug
                    ? `Link: ${livePlaceUrl}`
                    : "⚠️ Isi field Slug (URL) di bawah agar link terisi otomatis di pesan ke-2."}
                </span>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Editable details */}
      <Section title="✏️ Details — edit &amp; fill missing fields">
        <p style={{ margin: "0 0 14px", fontSize: 12.5, color: "#6b7280" }}>
          Fields marked <span style={{ color: "#b45309", fontWeight: 700 }}>⚠️ missing</span> are empty. Edit any field by hand (or use Auto-fill above), then click Save.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 18px" }}>
          {EDIT_FIELDS.filter((f) => f.group === "contact").map((f) => (
            <div key={f.key} style={{ gridColumn: f.type === "textarea" ? "1 / -1" : undefined }}>
              <EditField label={f.label} value={form[f.key] ?? ""} onChange={(v) => setField(f.key, v)} type={f.type} options={f.options} />
            </div>
          ))}
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", margin: "10px 0 10px" }}>Social Media</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 18px" }}>
          {EDIT_FIELDS.filter((f) => f.group === "social").map((f) => (
            <EditField
              key={f.key}
              label={f.label}
              value={form[f.key] ?? ""}
              onChange={(v) => setField(f.key, v)}
              type={f.type}
              options={f.options}
            />
          ))}
        </div>

      </Section>

      {/* Category details (editable) */}
      <Section title={`✏️ ${CATEGORY_LABELS[s.category] ?? s.category} — details`}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 18px" }}>
          {baseCat.map((f) => (
            <CatFieldEditor key={"minKey" in f ? f.minKey : f.key} field={f} cat={cat} set={setCatField} />
          ))}
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", margin: "12px 0 8px" }}>Other details (slug, lokasi spesifik, email)</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 18px" }}>
          {UNIVERSAL_CAT_FIELDS.map((f) => (
            <CatFieldEditor key={"minKey" in f ? f.minKey : f.key} field={f} cat={cat} set={setCatField} />
          ))}
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", margin: "12px 0 8px" }}>Media — Videos</div>
        <EditField
          label="YouTube video links"
          value={videos}
          onChange={setVideos}
          type="textarea"
          placeholder="One YouTube URL per line (up to 4)"
        />

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6 }}>
          <button onClick={saveFields} disabled={saving} style={{ ...primaryBtn, background: "#16a34a", opacity: saving ? 0.6 : 1 }}>
            {saving ? "Saving…" : "Save all changes"}
          </button>
          {saved && <span style={{ fontSize: 13, color: "#16a34a", fontWeight: 700 }}>✓ Saved</span>}
        </div>
      </Section>

      {/* Media (logo + photos — read-only; videos are editable above) */}
      {(s.logo_url || (s.photos && s.photos.length > 0)) && (
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
