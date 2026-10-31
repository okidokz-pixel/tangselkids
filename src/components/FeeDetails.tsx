import type { FeeDetails, FeeRow } from "@/lib/mockData";

/** Constant footer shown under every school's fee breakdown. */
const DISCLAIMER =
  "Data ini dikumpulkan melalui riset TangselKids dan tidak dijamin akurat 100%. Silakan hubungi pihak sekolah untuk data yang lebih akurat.";

const F = "var(--font-jakarta), sans-serif";

/** Section header color + sort priority, keyed on the section label's keywords. */
type SecMeta = { priority: number; bg: string; fg: string; border: string };
function sectionMeta(label: string): SecMeta {
  const l = label.toLowerCase();
  if (/spp|bulan|\/ ?bln|per term|\bterm\b|tuition|rutin/.test(l))
    return { priority: 2, bg: "#dcfce7", fg: "#166534", border: "#a7e3c0" }; // recurring — green
  if (/tahun|\/ ?thn|buku|materi|kegiatan|activity|co-?curricular|book/.test(l))
    return { priority: 3, bg: "#fdf3d7", fg: "#8a6410", border: "#f0e0a8" }; // yearly — amber
  if (/awal|satu kali|pangkal|enroll|registration|pendaftaran|formulir|deposit|development|gedung|masuk|admission/.test(l))
    return { priority: 1, bg: "#e8f0fb", fg: "#1d4e89", border: "#c7dcf3" }; // upfront — blue
  return { priority: 4, bg: "#f1f5f9", fg: "#475569", border: "#e2e8f0" };   // other — gray
}

/** For estimate cards, strip "Est./Sekitar" and collapse a range to "± midpoint". */
function compactAmount(amount: string, estimasi: boolean): string {
  let a = (amount ?? "").trim();
  if (!estimasi) return a;
  a = a.replace(/^(est\.?|sekitar|kurang lebih|±)\s+/i, "");
  const m = a.match(/^(.*?)(\d[\d.]*)\s*[–-]\s*(?:rp\s*)?(\d[\d.]*)(.*)$/i);
  if (m) {
    const n1 = parseInt(m[2].replace(/\./g, ""), 10);
    const n2 = parseInt(m[3].replace(/\./g, ""), 10);
    if (n1 && n2) {
      const mid = Math.round((n1 + n2) / 2);
      const unit = m[4].trim();
      return `± ${/rp/i.test(a) ? "Rp " : ""}${mid.toLocaleString("id-ID")}${unit ? " " + unit : ""}`;
    }
  }
  return a;
}

function Row({ r, indent, first, estimasi }: { r: FeeRow; indent?: boolean; first?: boolean; estimasi?: boolean }) {
  const amt = compactAmount(r.amount, !!estimasi);
  // A long, number-less "amount" is really a note — relocate it so it can't break the layout.
  const relocate = amt.length > 24 && !/\d/.test(amt);
  const notes = [r.note, relocate ? amt : null].filter(Boolean) as string[];
  return (
    <div
      style={{
        display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        gap: 12, padding: indent ? "6px 12px 6px 22px" : "9px 12px",
        borderTop: first ? "none" : "1px solid #eef2f6",
      }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: indent ? 13 : 13.5, color: indent ? "#52606d" : "#1f2a44", wordBreak: "break-word" }}>{r.label}</div>
        {notes.map((n, i) => (
          <div key={i} style={{ fontSize: 11.5, fontStyle: "italic", color: "#94a3b8", marginTop: 2 }}>{n}</div>
        ))}
      </div>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: "#15803d", textAlign: "right", whiteSpace: "normal", maxWidth: "52%", flexShrink: 0 }}>
        {relocate ? "—" : amt}
      </div>
    </div>
  );
}

/** Render one section's rows, sub-grouping consecutive rows that share a `group`. */
function SectionBody({ rows, estimasi }: { rows: FeeRow[]; estimasi?: boolean }) {
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
          {bucket.map((r, j) => <Row key={j} r={r} indent estimasi={estimasi} />)}
        </div>,
      );
    } else {
      out.push(<Row key={`r${i}`} r={rows[i]} estimasi={estimasi} />);
      i++;
    }
  }
  return <>{out}</>;
}

/**
 * Structured, editable fee breakdown. Rows with `section` labels are grouped into
 * colored, scannable blocks (with optional indented `group` sub-headers); otherwise
 * one flat list. Estimate cards (`estimasi`) get a red notice, a short intro, and
 * ranges collapsed to "± midpoint"; official cards stay crisp with no intro.
 */
export function FeeDetailsView({ details, tahun }: { details: FeeDetails; tahun?: string }) {
  const rows = details.rows ?? [];
  const estimasi = !!details.estimasi;
  const hasSections = rows.some((r) => r.section);

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
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: "#166534" }}>Rincian Biaya</span>
        {tahun && <span style={{ fontSize: 11.5, color: "#9ca3af", fontWeight: 500, marginLeft: "auto" }}>{tahun}</span>}
      </div>

      {estimasi && (
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "8px 11px", marginBottom: 10 }}>
          <span style={{ fontSize: 10.5, fontWeight: 800, color: "#b91c1c", background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 999, padding: "1px 8px", flexShrink: 0, whiteSpace: "nowrap", letterSpacing: "0.03em" }}>ESTIMASI</span>
          <span style={{ fontSize: 12, color: "#b91c1c", lineHeight: 1.45 }}>Angka perkiraan hasil riset TangselKids, bukan data resmi sekolah.</span>
        </div>
      )}

      {estimasi && details.intro && (
        <p style={{ fontSize: 13, lineHeight: 1.55, color: "#64748b", margin: "0 0 12px" }}>{details.intro}</p>
      )}

      {hasSections ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {sections.map((s, i) => (
            <div key={i} style={{ border: `1px solid ${s.meta.border}`, borderRadius: 12, overflow: "clip" }}>
              <div style={{ background: s.meta.bg, color: s.meta.fg, fontSize: 12.5, fontWeight: 800, padding: "7px 12px", letterSpacing: "0.01em" }}>
                {s.label}
              </div>
              <div style={{ background: "#fff" }}>
                <SectionBody rows={s.rows} estimasi={estimasi} />
              </div>
            </div>
          ))}
        </div>
      ) : rows.length > 0 ? (
        <div style={{ border: "1px solid #e9eef4", borderRadius: 12, overflow: "clip" }}>
          {rows.map((r, i) => <Row key={i} r={r} first={i === 0} estimasi={estimasi} />)}
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
