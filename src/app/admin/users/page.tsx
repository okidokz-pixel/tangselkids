"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { getAppUsers, deleteAppUser } from "../actions";

type AppUser = Awaited<ReturnType<typeof getAppUsers>>[number];

const thStyle: React.CSSProperties = {
  padding: "10px 16px", textAlign: "left", fontSize: 11,
  fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em",
};

function fmt(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function waLink(phone: string | null) {
  if (!phone) return null;
  return `https://wa.me/${phone.replace(/^\+/, "")}`;
}

export default function UsersPage() {
  const [users,      setUsers]      = useState<AppUser[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [tierFilter, setTierFilter] = useState<"all" | "free" | "premium">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending,  startTransition] = useTransition();

  useEffect(() => {
    getAppUsers().then(data => { setUsers(data); setLoading(false); });
  }, []);

  function handleDelete(id: string, name: string) {
    if (!confirm(`Hapus user "${name || "ini"}"? Aksi ini tidak bisa dibatalkan dan akan menghapus semua data user.`)) return;
    setDeletingId(id);
    startTransition(async () => {
      await deleteAppUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      setDeletingId(null);
    });
  }

  const filtered = users.filter(u => {
    const matchTier = tierFilter === "all" || (u.tier ?? "free") === tierFilter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (u.name ?? "").toLowerCase().includes(q) ||
      (u.phone ?? "").includes(q);
    return matchTier && matchSearch;
  });

  const premiumCount = users.filter(u => u.tier === "premium").length;
  const registeredCount = users.filter(u => u.name).length;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#0e1d4f", margin: 0 }}>App Users</h1>
        <p style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>
          {loading ? "Loading…" : `${users.length} total · ${registeredCount} terdaftar · ${premiumCount} premium`}
        </p>
      </div>

      {/* Filters row */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        {/* Tier tabs */}
        {(["all", "free", "premium"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTierFilter(t)}
            style={{
              padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
              border: tierFilter === t ? "1.5px solid #0e1d4f" : "1.5px solid #e5e7eb",
              background: tierFilter === t ? "#0e1d4f" : "#fff",
              color: tierFilter === t ? "#fff" : "#374151",
            }}
          >
            {t === "all" ? "Semua" : t === "free" ? "Free" : "Premium"}
          </button>
        ))}

        {/* Search */}
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari nama atau nomor HP…"
          style={{ padding: "8px 14px", borderRadius: 8, border: "1.5px solid #d1d5db", fontSize: 13, outline: "none", marginLeft: "auto", minWidth: 220 }}
        />
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "clip" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              <th style={thStyle}>User</th>
              <th style={thStyle}>No. HP</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Tier</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Anak</th>
              <th style={thStyle}>Bergabung</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>Tidak ada user ditemukan.</td></tr>
            ) : filtered.map(u => {
              const wa = waLink(u.phone);
              const kids = Array.isArray(u.kids) ? u.kids : [];
              const isPremium = u.tier === "premium";
              return (
                <tr key={u.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  {/* Name + registered status */}
                  <td style={{ padding: "12px 16px" }}>
                    {u.name ? (
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{u.name}</div>
                    ) : (
                      <div style={{ fontSize: 12, color: "#9ca3af", fontStyle: "italic" }}>Belum daftar</div>
                    )}
                    {u.address && (
                      <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}
                        title={u.address}>
                        {u.address.length > 40 ? u.address.slice(0, 40) + "…" : u.address}
                      </div>
                    )}
                  </td>

                  {/* Phone + WA */}
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13, color: "#374151" }}>{u.phone ?? "—"}</span>
                      {wa && (
                        <a
                          href={wa} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                            background: "#dcfce7", color: "#166534", textDecoration: "none" }}
                        >
                          WA
                        </a>
                      )}
                    </div>
                  </td>

                  {/* Tier badge */}
                  <td style={{ padding: "12px 16px", textAlign: "center" }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20,
                      background: isPremium ? "#fef3c7" : "#f1f5f9",
                      color: isPremium ? "#b45309" : "#64748b",
                    }}>
                      {isPremium ? (u.lifetime ? "⭐ Lifetime" : "Premium") : "Free"}
                    </span>
                  </td>

                  {/* Kids count */}
                  <td style={{ padding: "12px 16px", textAlign: "center", fontSize: 13, color: "#374151" }}>
                    {kids.length > 0 ? kids.length : <span style={{ color: "#d1d5db" }}>—</span>}
                  </td>

                  {/* Joined date */}
                  <td style={{ padding: "12px 16px", fontSize: 12, color: "#9ca3af" }}>
                    {fmt(u.created_at)}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <Link
                        href={`/admin/users/${u.id}`}
                        style={{ fontSize: 13, fontWeight: 600, color: "#0e1d4f", textDecoration: "none",
                          padding: "5px 12px", borderRadius: 6, border: "1.5px solid #e5e7eb" }}
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(u.id, u.name ?? "")}
                        disabled={deletingId === u.id || isPending}
                        style={{
                          fontSize: 13, fontWeight: 600, padding: "5px 12px", borderRadius: 6,
                          border: "1.5px solid #fecaca", background: "#fff", color: "#ef4444",
                          cursor: "pointer", opacity: deletingId === u.id ? 0.5 : 1,
                        }}
                      >
                        {deletingId === u.id ? "…" : "Hapus"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
