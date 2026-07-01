"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { deleteDraft, type DraftRow } from "@/app/admin/actions";
import { ADMIN_CATEGORY_LABEL } from "@/lib/adminCategories";
import { Trash2, ArrowRight } from "lucide-react";

function formatWhen(iso: string): string {
  const d = new Date(iso);
  const diffMin = Math.floor((Date.now() - d.getTime()) / 60000);
  if (diffMin < 1) return "baru saja";
  if (diffMin < 60) return `${diffMin} mnt lalu`;
  const h = Math.floor(diffMin / 60);
  if (h < 24) return `${h} jam lalu`;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export function DraftsList({ drafts }: { drafts: DraftRow[] }) {
  const [isPending, startTransition] = useTransition();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  if (drafts.length === 0) {
    return (
      <div className="card card-pad" style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6 }}>
        Belum ada draf. Draf dibuat saat kamu menekan{" "}
        <b style={{ color: "var(--ink)" }}>“Simpan Draft”</b> di halaman tambah listing.
      </div>
    );
  }

  function remove(id: string) {
    startTransition(async () => {
      try { await deleteDraft(id); } catch {}
      setConfirmId(null);
    });
  }

  return (
    <div className="card" style={{ overflow: "hidden", padding: 0 }}>
      {drafts.map((d, i) => (
        <div
          key={d.id}
          style={{
            display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
            borderTop: i === 0 ? "none" : "1px solid var(--line)", flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {d.name || "(tanpa nama)"}
            </div>
            <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>
              {ADMIN_CATEGORY_LABEL[d.category] ?? d.category} · diperbarui {formatWhen(d.updated_at)}
            </div>
          </div>

          <Link
            href={`/admin/${d.category}/new?draft=${d.id}`}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: "#0e1d4f", color: "#fff", textDecoration: "none",
            }}
          >
            Lanjutkan <ArrowRight size={15} strokeWidth={2} />
          </Link>

          {confirmId === d.id ? (
            <>
              <button
                type="button" onClick={() => remove(d.id)} disabled={isPending}
                style={{ padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, background: "#dc2626", color: "#fff", border: "none", cursor: "pointer" }}
              >
                {isPending ? "Menghapus…" : "Hapus"}
              </button>
              <button
                type="button" onClick={() => setConfirmId(null)}
                style={{ padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, background: "#f3f4f6", color: "#374151", border: "none", cursor: "pointer" }}
              >
                Batal
              </button>
            </>
          ) : (
            <button
              type="button" onClick={() => setConfirmId(d.id)} title="Hapus draf"
              style={{ padding: 8, borderRadius: 8, border: "1.5px solid #fca5a5", background: "#fef2f2", color: "#dc2626", cursor: "pointer", display: "grid", placeItems: "center" }}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
