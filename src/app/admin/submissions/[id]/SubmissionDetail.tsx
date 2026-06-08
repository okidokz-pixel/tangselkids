"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { updateSubmissionStatus, deleteSubmission } from "../../actions";

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
              <img src={s.logo_url} alt="Logo" style={{ width: 80, height: 80, objectFit: "contain", borderRadius: 10, border: "1px solid #e5e7eb", background: "#f9fafb", padding: 4 }} />
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
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                    <img src={url} alt={`Photo ${i + 1}`} style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: 8, border: "1px solid #e5e7eb", display: "block" }} />
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
