"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLang } from "@/context/LanguageContext";

const categories = [
  "Sekolah / School",
  "Tempat Kursus / Learning Center",
  "Daycare",
  "Playgrounds",
  "Klinik Kebutuhan Khusus / Special Needs Clinic",
  "Kafe Ramah Anak / Kid-Friendly Cafe",
  "Bermain Dengan Binatang / Animal Encounters",
  "Kolam Renang & Water Parks / Swimming Pools & Water Parks",
  "Toko Buku & Alat Tulis / Bookstores & Stationery",
  "Lainnya / Other",
];

export default function ListYourPlacePage() {
  const { t } = useLang();
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "", category: "", area: "", address: "", phone: "", description: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 font-jakarta text-sm text-gray-800 outline-none focus:border-[#2563EB] transition-colors bg-white";
  const labelClass = "block font-jakarta text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5";

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col pb-10">

      {/* Header */}
      <div
        className="px-5 pt-12 pb-6"
        style={{ background: "linear-gradient(160deg, #0F1E3C 0%, #1A3A6C 60%, #2563EB 100%)", borderRadius: "0 0 32px 32px" }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div>
            <h1 className="text-white text-2xl font-bold leading-tight" style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}>{t.listTitle}</h1>
            <p className="text-white/70 text-xs font-jakarta mt-0.5">{t.listSubtitle}</p>
          </div>
        </div>
      </div>

      {submitted ? (
        /* Success state */
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-5">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl" style={{ background: "#EFF6FF" }}>
            ✅
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[#0F1E3C]" style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}>{t.listSuccess}</h2>
          </div>
          <Link
            href="/"
            className="px-8 py-3 rounded-full text-white font-jakarta font-bold text-sm shadow-md"
            style={{ background: "linear-gradient(135deg, #1A3A6C, #2563EB)" }}
          >
            {t.listSuccessBtn}
          </Link>
        </div>
      ) : (
        /* Form */
        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">

          <div>
            <label className={labelClass}>{t.listName}</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="e.g. Happy Kids Cafe"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>{t.listCategory}</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className={inputClass}
            >
              <option value="">— Pilih kategori —</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>{t.listArea}</label>
            <select
              name="area"
              value={form.area}
              onChange={handleChange}
              required
              className={inputClass}
            >
              <option value="">— Pilih area —</option>
              <option value="Bintaro">Bintaro</option>
              <option value="BSD">BSD City</option>
              <option value="Lainnya">Lainnya / Other</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>{t.listAddress}</label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              required
              placeholder="Jl. Contoh No. 123, Bintaro Sektor 7"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>{t.listPhone}</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              placeholder="0812-3456-7890"
              className={inputClass}
              type="tel"
            />
          </div>

          <div>
            <label className={labelClass}>{t.listDescription}</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Ceritakan sedikit tentang tempat kamu..."
              className={`${inputClass} resize-none`}
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl text-white font-jakarta font-bold text-sm shadow-md mt-2"
            style={{ background: "linear-gradient(135deg, #1A3A6C, #2563EB)" }}
          >
            {t.listSubmit}
          </button>
        </form>
      )}
    </div>
  );
}
