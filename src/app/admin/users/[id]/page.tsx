"use client";

import { useState, useEffect, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getAppUser, updateAppUser, deleteAppUser, getUserActivity } from "../../actions";

type AppUser = Awaited<ReturnType<typeof getAppUser>>;
type Activity = Awaited<ReturnType<typeof getUserActivity>>;
type Kid = { name: string; dob: string; gender?: string };

const REVIEW_STATUS_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  pending:  { bg: "#FEF3C7", color: "#92400e", label: "Pending"  },
  approved: { bg: "#dcfce7", color: "#15803d", label: "Approved" },
  rejected: { bg: "#fee2e2", color: "#991b1b", label: "Rejected" },
};

function fmt(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
}

function waLink(phone: string | null) {
  if (!phone) return null;
  return `https://wa.me/${phone.replace(/^\+/, "")}`;
}

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [user,      setUser]      = useState<AppUser | null>(null);
  const [activity,  setActivity]  = useState<Activity | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [isPending, startTransition] = useTransition();

  // Editable fields
  const [name,              setName]             = useState("");
  const [address,           setAddress]          = useState("");
  const [dob,               setDob]              = useState("");
  const [tier,              setTier]             = useState<"free" | "premium">("free");
  const [lifetime,          setLifetime]         = useState(false);
  const [premiumExpiresAt,  setPremiumExpiresAt] = useState("");

  useEffect(() => {
    getAppUser(id).then(data => {
      setUser(data);
      setName(data.name ?? "");
      setAddress(data.address ?? "");
      setDob(data.dob ?? "");
      setTier((data.tier as "free" | "premium") ?? "free");
      setLifetime(data.lifetime ?? false);
      setPremiumExpiresAt(
        data.premium_expires_at
          ? new Date(data.premium_expires_at).toISOString().slice(0, 10)
          : ""
      );
      setLoading(false);
    });
    getUserActivity(id).then(setActivity).catch(() => setActivity(null));
  }, [id]);

  async function handleSave() {
    setSaving(true);
    await updateAppUser(id, {
      name:               name || undefined,
      address:            address || null,
      dob:                dob || null,
      tier,
      lifetime,
      premium_expires_at: premiumExpiresAt ? new Date(premiumExpiresAt).toISOString() : null,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleDelete() {
    if (!confirm(`Hapus user "${user?.name || user?.phone}"? Semua data (reviews, notes, saved) akan ikut terhapus.`)) return;
    startTransition(async () => {
      await deleteAppUser(id);
      router.push("/admin/users");
    });
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", borderRadius: 8,
    border: "1.5px solid #d1d5db", fontSize: 14, outline: "none",
    background: "#fff", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, color: "#374151",
    display: "block", marginBottom: 6,
  };

  if (loading) {
    return <div style={{ padding: 40, color: "#9ca3af" }}>Loading…</div>;
  }
  if (!user) {
    return <div style={{ padding: 40, color: "#ef4444" }}>User tidak ditemukan.</div>;
  }

  const kids: Kid[] = Array.isArray(user.kids) ? (user.kids as Kid[]) : [];
  const wa = waLink(user.phone);

  return (
    <div style={{ maxWidth: 720 }}>
      {/* Back + header */}
      <div style={{ marginBottom: 28 }}>
        <Link
          href="/admin/users"
          style={{ fontSize: 13, color: "#6b7280", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 12 }}
        >
          ← Kembali ke Users
        </Link>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0e1d4f", margin: 0 }}>
              {user.name || <span style={{ color: "#9ca3af", fontStyle: "italic" }}>Belum daftar</span>}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
              <span style={{ fontSize: 14, color: "#6b7280" }}>{user.phone}</span>
              {wa && (
                <a href={wa} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 6,
                    background: "#dcfce7", color: "#166534", textDecoration: "none" }}
                >
                  WhatsApp
                </a>
              )}
              <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20,
                background: user.tier === "premium" ? "#fef3c7" : "#f1f5f9",
                color: user.tier === "premium" ? "#b45309" : "#64748b" }}
              >
                {user.tier === "premium" ? (user.lifetime ? "⭐ Lifetime" : "Premium") : "Free"}
              </span>
            </div>
            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
              Bergabung {fmt(user.created_at)} · ID: <code style={{ fontSize: 11 }}>{user.id}</code>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>

        {/* Left: profile fields */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "#0e1d4f", margin: "0 0 16px" }}>Profil</h2>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Nama</label>
            <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} placeholder="Belum diisi" />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Tanggal Lahir</label>
            <input type="date" value={dob} onChange={e => setDob(e.target.value)} style={inputStyle} />
          </div>

          <div style={{ marginBottom: 0 }}>
            <label style={labelStyle}>Alamat</label>
            <textarea
              value={address}
              onChange={e => setAddress(e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
              placeholder="Belum diisi"
            />
          </div>
        </div>

        {/* Right: tier + kids */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Tier */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 20 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "#0e1d4f", margin: "0 0 16px" }}>Tier</h2>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Tier</label>
              <select
                value={tier}
                onChange={e => setTier(e.target.value as "free" | "premium")}
                style={{ ...inputStyle }}
              >
                <option value="free">Free</option>
                <option value="premium">Premium</option>
              </select>
            </div>

            {tier === "premium" && (
              <>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ ...labelStyle, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={lifetime}
                      onChange={e => setLifetime(e.target.checked)}
                      style={{ width: 16, height: 16, cursor: "pointer" }}
                    />
                    Lifetime (tidak ada tanggal kadaluarsa)
                  </label>
                </div>

                {!lifetime && (
                  <div>
                    <label style={labelStyle}>Premium Sampai</label>
                    <input
                      type="date"
                      value={premiumExpiresAt}
                      onChange={e => setPremiumExpiresAt(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Kids (read-only) */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 20, flex: 1 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "#0e1d4f", margin: "0 0 12px" }}>
              Data Anak ({kids.length})
            </h2>
            {kids.length === 0 ? (
              <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>Belum ada data anak.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {kids.map((kid, i) => (
                  <div key={i} style={{ padding: "8px 12px", borderRadius: 8, background: "#f9fafb", border: "1px solid #f3f4f6" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{kid.name || `Anak ${i + 1}`}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                      {kid.dob ? fmt(kid.dob) : "—"}
                      {kid.gender ? ` · ${kid.gender === "male" ? "Laki-laki" : "Perempuan"}` : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity: favorites, reviews, notes */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 20, marginBottom: 20 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: "#0e1d4f", margin: "0 0 16px" }}>Aktivitas</h2>
        {!activity ? (
          <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>Memuat aktivitas…</p>
        ) : (
          <>
            {/* Counts */}
            <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
              {[
                { label: "Favorit", value: activity.favorites.length, color: "#0e1d4f" },
                { label: "Review",  value: activity.reviews.length,   color: "#2e8a5a" },
                { label: "Catatan", value: activity.notesCount,       color: "#b45309" },
              ].map(s => (
                <div key={s.label} style={{ flex: "1 1 100px", minWidth: 100, background: "#f9fafb", border: "1px solid #f3f4f6", borderRadius: 10, padding: "12px 16px" }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Favorites */}
              <div>
                <h3 style={{ fontSize: 12, fontWeight: 700, color: "#374151", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Tempat Favorit</h3>
                {activity.favorites.length === 0 ? (
                  <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>Belum ada favorit.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {activity.favorites.map(f => {
                      const inner = (
                        <>
                          <span style={{ fontSize: 13, color: "#111827", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                          <span style={{ fontSize: 10.5, color: "#64748b", flexShrink: 0 }}>{f.category}</span>
                        </>
                      );
                      const boxStyle: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "8px 12px", borderRadius: 8, background: "#f9fafb", border: "1px solid #f3f4f6", textDecoration: "none" };
                      return f.slug
                        ? <a key={f.place_id} href={`/place/${f.slug}`} target="_blank" rel="noopener noreferrer" style={boxStyle}>{inner}</a>
                        : <div key={f.place_id} style={boxStyle}>{inner}</div>;
                    })}
                  </div>
                )}
              </div>

              {/* Reviews */}
              <div>
                <h3 style={{ fontSize: 12, fontWeight: 700, color: "#374151", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Review</h3>
                {activity.reviews.length === 0 ? (
                  <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>Belum ada review.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {activity.reviews.map((r, i) => {
                      const badge = REVIEW_STATUS_BADGE[r.status as string] ?? REVIEW_STATUS_BADGE.pending;
                      return (
                        <div key={i} style={{ padding: "10px 12px", borderRadius: 8, background: "#f9fafb", border: "1px solid #f3f4f6" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 12.5, fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.place_name}</span>
                            <span style={{ flexShrink: 0, fontSize: 10, fontWeight: 700, padding: "1px 8px", borderRadius: 999, background: badge.bg, color: badge.color }}>{badge.label}</span>
                          </div>
                          <div style={{ marginBottom: 4, color: "#FBBF24", fontSize: 12, letterSpacing: 1 }}>
                            {"★".repeat(r.rating)}<span style={{ color: "#D1D5DB" }}>{"★".repeat(5 - r.rating)}</span>
                          </div>
                          <p style={{ fontSize: 12, color: "#475569", lineHeight: 1.5, margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" } as React.CSSProperties}>{r.liked}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Save + Delete row */}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button
          onClick={handleSave}
          disabled={saving || isPending}
          style={{
            padding: "10px 28px", borderRadius: 8, fontSize: 14, fontWeight: 700,
            background: saved ? "#166534" : "#0e1d4f", color: "#fff", border: "none",
            cursor: "pointer", opacity: saving ? 0.7 : 1, transition: "background 0.2s",
          }}
        >
          {saving ? "Menyimpan…" : saved ? "✓ Tersimpan" : "Simpan Perubahan"}
        </button>

        <button
          onClick={handleDelete}
          disabled={isPending}
          style={{
            padding: "10px 20px", borderRadius: 8, fontSize: 14, fontWeight: 600,
            background: "#fff", color: "#ef4444", border: "1.5px solid #fecaca",
            cursor: "pointer", marginLeft: "auto",
          }}
        >
          Hapus User
        </button>
      </div>
    </div>
  );
}
