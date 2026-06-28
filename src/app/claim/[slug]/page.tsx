"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Check, Upload } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { fetchPlaceBySlug } from "@/lib/db";
import { ActionButton } from "@/components/ActionButton";
import type { Place } from "@/lib/mockData";

const ROLES = [
  "Kepala Sekolah / Direktur",
  "Owner / Pemilik",
  "Manager / Pengelola",
  "Staff / Karyawan",
  "Lainnya",
];

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

export default function ClaimPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();

  const [place, setPlace] = useState<Place | null>(null);
  const [loadingPlace, setLoadingPlace] = useState(true);

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlaceBySlug(slug).then(p => {
      setPlace(p);
      setLoadingPlace(false);
    });
  }, [slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !role || !email.trim() || !whatsapp.trim() || !file || !agreed) {
      setError("Lengkapi semua kolom dan centang pernyataan.");
      return;
    }
    setSubmitting(true);
    try {
      const supabase = getSupabaseBrowserClient();
      // Link this claim to the signed-in account (the claim button is gated to
      // logged-in users, but capture it defensively in case of direct navigation).
      const { data: { user: authUser } } = await supabase.auth.getUser();

      const ext = file.name.split(".").pop() ?? "pdf";
      const path = `${slug}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("claim-documents")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (uploadErr) throw new Error(`Upload gagal: ${uploadErr.message}`);

      const { error: insertErr } = await supabase.from("place_claims").insert({
        place_slug:       slug,
        place_name:       place?.name ?? slug,
        category:         place?.category ?? "other",
        claimant_name:    name.trim(),
        claimant_role:    role,
        claimant_email:   email.trim(),
        claimant_whatsapp: whatsapp.trim(),
        document_url:     path,
        user_id:          authUser?.id ?? null,
      });
      if (insertErr) throw new Error(insertErr.message);

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (loadingPlace) {
    return (
      <div style={{ maxWidth: 448, margin: "0 auto", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 14, color: "#94a3b8" }}>Memuat…</p>
      </div>
    );
  }

  if (!place) {
    return (
      <div style={{ maxWidth: 448, margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: "0 20px" }}>
        <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 14, color: "#94a3b8" }}>Tempat tidak ditemukan.</p>
        <Link href="/" style={{ fontSize: 13, fontWeight: 700, color: "#2e8a5a", textDecoration: "none" }}>Kembali ke Beranda</Link>
      </div>
    );
  }

  // ── Already verified ──────────────────────────────────────────────────────────
  if (place.isVerified) {
    return (
      <div style={{ maxWidth: 448, margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "0 20px" }}>
        <div style={{ width: 64, height: 64, borderRadius: 999, background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Check size={32} color="#16a34a" strokeWidth={2.5} />
        </div>
        <h2 style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 22, fontWeight: 700, color: "#0e1d4f", textAlign: "center", margin: 0 }}>
          Sudah Terverifikasi
        </h2>
        <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 14, color: "#64748b", textAlign: "center", margin: 0, lineHeight: 1.6 }}>
          <strong>{place.name}</strong> sudah memiliki badge terverifikasi.
        </p>
        <Link href={`/place/${slug}`} style={{ marginTop: 8, padding: "12px 28px", borderRadius: 14, fontSize: 14, fontWeight: 700, fontFamily: "var(--font-jakarta), sans-serif", background: "#2e8a5a", color: "#fff", textDecoration: "none" }}>
          Lihat Halaman
        </Link>
      </div>
    );
  }

  // ── Submitted success screen ──────────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={{ maxWidth: 448, margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "0 20px" }}>
        <div style={{ width: 64, height: 64, borderRadius: 999, background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Check size={32} color="#16a34a" strokeWidth={2.5} />
        </div>
        <h2 style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 22, fontWeight: 700, color: "#0e1d4f", textAlign: "center", margin: 0 }}>
          Klaim Diterima
        </h2>
        <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 14, color: "#64748b", textAlign: "center", margin: 0, lineHeight: 1.6 }}>
          Klaim Anda untuk <strong style={{ color: "#0e1d4f" }}>{place.name}</strong> sedang kami tinjau.
          Kami akan menghubungi Anda melalui email atau WhatsApp dalam 2–3 hari kerja.
        </p>
        <Link href={`/place/${slug}`} style={{ marginTop: 8, padding: "12px 28px", borderRadius: 14, fontSize: 14, fontWeight: 700, fontFamily: "var(--font-jakarta), sans-serif", background: "#2e8a5a", color: "#fff", textDecoration: "none" }}>
          Kembali ke Halaman Tempat
        </Link>
      </div>
    );
  }

  // ── Claim form ────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 448, margin: "0 auto", minHeight: "100vh", paddingBottom: 40 }}>

      {/* Top bar */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 52, zIndex: 50,
        background: "linear-gradient(160deg, #0a2018 0%, #1f6b43 60%, #2e8a5a 100%)",
      }}>
        <div style={{ maxWidth: 448, margin: "0 auto", height: "100%", display: "flex", alignItems: "center", padding: "0 12px" }}>
          <ActionButton onClick={() => router.back()} style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "7px 12px", borderRadius: 999,
            background: "rgba(255,255,255,0.18)", color: "#fff",
            fontSize: 13, fontWeight: 700,
            border: "1px solid rgba(255,255,255,0.22)",
          }}>
            <ChevronLeft size={14} strokeWidth={2.5} color="#fff" />
            Kembali
          </ActionButton>
        </div>
      </div>

      <div style={{ padding: "72px 20px 40px" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 26, fontWeight: 700, color: "#0e1d4f", margin: "0 0 8px" }}>
            Klaim Listing Ini
          </h1>
          <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 14, color: "#64748b", margin: 0, lineHeight: 1.6 }}>
            Apakah Anda perwakilan resmi dari{" "}
            <strong style={{ color: "#0e1d4f" }}>{place.name}</strong>?
            Ajukan klaim dan dapatkan badge <strong>Terverifikasi</strong>.
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Name */}
          <div style={FIELD}>
            <label style={LABEL}>Nama Lengkap *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nama Anda"
              style={INPUT}
              required
            />
          </div>

          {/* Role */}
          <div style={FIELD}>
            <label style={LABEL}>Jabatan / Peran *</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              style={{
                ...INPUT,
                appearance: "none",
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 14px center",
              } as React.CSSProperties}
              required
            >
              <option value="">Pilih jabatan…</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Email */}
          <div style={FIELD}>
            <label style={LABEL}>Email *</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@tempat.anda"
              style={INPUT}
              required
            />
          </div>

          {/* WhatsApp */}
          <div style={FIELD}>
            <label style={LABEL}>Nomor WhatsApp *</label>
            <input
              type="tel"
              value={whatsapp}
              onChange={e => setWhatsapp(e.target.value)}
              placeholder="0812 3456 7890"
              style={INPUT}
              required
            />
          </div>

          {/* Document upload */}
          <div style={FIELD}>
            <label style={LABEL}>Dokumen Verifikasi *</label>
            <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 12, color: "#94a3b8", margin: "0 0 10px", lineHeight: 1.5 }}>
              Upload NPSN, izin operasional, surat keterangan berkop surat, atau dokumen resmi lainnya.
              Format: PDF, JPG, PNG — maks 5 MB.
            </p>
            <label style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 8, padding: "20px 16px", borderRadius: 14, cursor: "pointer",
              border: file ? "2px solid #2e8a5a" : "2px dashed #e2e8f0",
              background: file ? "#f0faf4" : "#f8fafc",
              minHeight: 90,
            }}>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                style={{ display: "none" }}
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  if (f.size > 5 * 1024 * 1024) { setError("File terlalu besar. Maks 5 MB."); return; }
                  setFile(f);
                  setError(null);
                }}
              />
              <Upload size={20} color={file ? "#2e8a5a" : "#94a3b8"} />
              <span style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 13, fontWeight: 600, color: file ? "#2e8a5a" : "#64748b", textAlign: "center" }}>
                {file ? file.name : "Pilih atau seret file ke sini"}
              </span>
              {file && (
                <span style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 11, color: "#94a3b8" }}>
                  {(file.size / 1024).toFixed(0)} KB
                </span>
              )}
            </label>
          </div>

          {/* Disclaimer */}
          <label style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 24, cursor: "pointer" }}>
            <div
              onClick={() => setAgreed(v => !v)}
              style={{
                width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 2,
                border: agreed ? "2px solid #2e8a5a" : "2px solid #e2e8f0",
                background: agreed ? "#2e8a5a" : "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
              }}
            >
              {agreed && <Check size={12} color="#fff" strokeWidth={3} />}
            </div>
            <span
              onClick={() => setAgreed(v => !v)}
              style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 13, color: "#475569", lineHeight: 1.6, cursor: "pointer" }}
            >
              Saya menyatakan bahwa informasi ini benar dan saya adalah perwakilan resmi dari tempat ini.
            </span>
          </label>

          {/* Error */}
          {error && (
            <div style={{ marginBottom: 16, padding: "12px 14px", borderRadius: 12, background: "#fee2e2", border: "1px solid #fecaca", fontFamily: "var(--font-jakarta), sans-serif", fontSize: 13, color: "#991b1b" }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%", padding: "15px", borderRadius: 14, border: "none",
              fontFamily: "var(--font-jakarta), sans-serif", fontSize: 15, fontWeight: 700,
              background: submitting ? "#94a3b8" : "#2e8a5a",
              color: "#fff", cursor: submitting ? "not-allowed" : "pointer",
              touchAction: "manipulation",
            }}
          >
            {submitting ? "Mengirim…" : "Kirim Klaim"}
          </button>
        </form>
      </div>
    </div>
  );
}
