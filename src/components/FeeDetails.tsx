import type { FeeDetails, FeeRow } from "@/lib/mockData";

/** Constant footer shown under every school's fee breakdown. */
const DISCLAIMER =
  "Data ini dikumpulkan melalui riset TangselKids dan tidak dijamin akurat 100%. Silakan hubungi pihak sekolah untuk data yang lebih akurat.";

const F = "var(--font-jakarta), sans-serif";

/** Section header color + sort priority, keyed on the section label's keywords. */
type SecMeta = { priority: number; bg: string; fg: string; border: string };
function sectionMeta(label: string): SecMeta {
  const l = label.toLowerCase();
  if (/spp|bulan|\/ ?bln|term|tuition|rutin/.test(l))
    return { priority: 2, bg: "#dcfce7", fg: "#166534", border: "#a7e3c0" }; // tuition — green
  if (/tahun|\/ ?thn|buku|materi|kegiatan|activity|co-?curricular|book/.test(l))
    return { priority: 3, bg: "#fdf3d7", fg: "#8a6410", border: "#f0e0a8" }; // yearly — amber
  if (/satu kali|pangkal|enroll|registration|pendaftaran|formulir|deposit|development|gedung|masuk/.test(l))
    return { priority: 1, bg: "#e8f0fb", fg: "#1d4e89", border: "#c7dcf3" }; // one-time — blue
  return { priority: 4, bg: "#f1f5f9", fg: "#475569", border: "#e2e8f0" };   // other — gray
}

function Row({ r, indent, first }: { r: FeeRow; indent?: boolean; first?: boolean }) {
  return (
    <div
      style={{
        display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        gap: 12, padding: indent ? "6px 12px 6px 22px" : "9px 12px",
        borderTop: first ? "none" : "1px solid #eef2f6",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: indent ? 13 : 13.5, color: indent ? "#52606d" : "#1f2a44" }}>{r.label}</div>
        {r.note && (
          <div style={{ fontSize: 11.5, fontStyle: "italic", color: "#94a3b8", marginTop: 2 }}>{r.note}</div>
        )}
      </div>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: "#15803d", textAlign: "right", whiteSpace: "nowrap", flexShrink: 0 }}>
        {r.amount}
      </div>
    </div>
  );
}

/** Render one section's rows, sub-grouping consecutive rows that share a `group`. */
function SectionBody({ rows }: { rows: FeeRow[] }) {
  const out: React.ReactNode[] = [];
  let i = 0;
  while (i < rows.length) {
    const g = rows[i].group;
    if (g) {
      const bucket: FeeRow[] = [];
      while (i < rows.length && rows[i].group === g) { bucket.push(rows[i]); i++; }
      out.push(
        <div key={`g${i}`}>
          <div style={{ fontSize: 13.5, color: "#1f2a44", padding: "9px 12px 2px", borderTop: "1px solid #eef2f6" }}>{g}</div>
          {bucket.map((r, j) => <Row key={j} r={r} indent />)}
        </div>,
      );
    } else {
      out.push(<Row key={`r${i}`} r={rows[i]} />);
      i++;
    }
  }
  return <>{out}</>;
}

/**
 * Structured, editable fee breakdown. When rows carry `section` labels they're
 * grouped into colored, scannable blocks; otherwise they render as one flat list.
 * `tahun` is the fee reference year, shown by the heading when available.
 */
export function FeeDetailsView({ details, tahun }: { details: FeeDetails; tahun?: string }) {
  const rows = details.rows ?? [];
  const hasSections = rows.some((r) => r.section);

  // Build ordered groups: by section priority (one-time → tuition → yearly → other),
  // then first-appearance as a tiebreak. Rows keep their relative order within a group.
  const sections: { label: string; meta: SecMeta; rows: FeeRow[] }[] = [];
  if (hasSections) {
    const order: string[] = [];
    const map = new Map<string, FeeRow[]>();
    for (const r of rows) {
      const key = r.section || "Biaya Lain";
      if (!map.has(key)) { map.set(key, []); order.push(key); }
      map.get(key)!.push(r);
    }
    for (const label of order) sections.push({ label, meta: sectionMeta(label), rows: map.get(label)! });
    sections.sort((a, b) => a.meta.priority - b.meta.priority || order.indexOf(a.label) - order.indexOf(b.label));
  }

  return (
    <div style={{ fontFamily: F }}>
      {details.intro && (
        <p style={{ fontSize: 13.5, lineHeight: 1.55, color: "#475569", margin: "0 0 12px" }}>{details.intro}</p>
      )}

      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: "#166534" }}>Rincian Biaya</span>
        {details.estimasi && (
          <span style={{ fontSize: 11, fontWeight: 700, color: "#92834b", background: "#fef7e0", border: "1px solid #f2e3ab", borderRadius: 999, padding: "1px 8px" }}>
            Estimasi
          </span>
        )}
        {tahun && <span style={{ fontSize: 11.5, color: "#9ca3af", fontWeight: 500, marginLeft: "auto" }}>{tahun}</span>}
      </div>

      {hasSections ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {sections.map((s, i) => (
            <div key={i} style={{ border: `1px solid ${s.meta.border}`, borderRadius: 12, overflow: "clip" }}>
              <div style={{ background: s.meta.bg, color: s.meta.fg, fontSize: 12.5, fontWeight: 800, padding: "7px 12px", letterSpacing: "0.01em" }}>
                {s.label}
              </div>
              <div style={{ background: "#fff" }}>
                <SectionBody rows={s.rows} />
              </div>
            </div>
          ))}
        </div>
      ) : rows.length > 0 ? (
        <div style={{ border: "1px solid #e9eef4", borderRadius: 12, overflow: "clip" }}>
          {rows.map((r, i) => <Row key={i} r={r} first={i === 0} />)}
        </div>
      ) : null}

      {details.rowsNote && (
        <p style={{ fontSize: 11.5, fontStyle: "italic", lineHeight: 1.5, color: "#94a3b8", margin: "8px 2px 0" }}>{details.rowsNote}</p>
      )}

      {details.catatan && (
        <div style={{ marginTop: 12, background: "#f0fdf4", border: "1px solid #dcfce7", borderRadius: 10, padding: "10px 12px" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#166534", marginBottom: 3 }}>Catatan</div>
          <p style={{ fontSize: 12.5, lineHeight: 1.5, color: "#3f6b52", margin: 0 }}>{details.catatan}</p>
        </div>
      )}

      <p style={{ fontSize: 11, lineHeight: 1.5, color: "#a2acb8", margin: "12px 2px 0" }}>{DISCLAIMER}</p>
    </div>
  );
}
