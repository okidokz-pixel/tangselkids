"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Sparkles } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

export default function OthersPage() {
  const { t } = useLang();
  const router = useRouter();
  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col pb-10">
      <div className="px-5 pt-12 pb-6" style={{ background: "linear-gradient(135deg, #1E3A5F 0%, #1D4ED8 100%)", borderRadius: "0 0 32px 32px" }}>
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <ChevronLeft size={20} color="white" />
          </button>
          <div>
            <h1 className="text-white text-2xl font-bold flex items-center gap-2" style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}>
              <Sparkles size={22} strokeWidth={1.75} /> {t.homeOthers}
            </h1>
            <p className="text-white/70 text-xs font-jakarta mt-0.5">Bintaro · Tangsel</p>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4">
        <Sparkles size={64} style={{ color: "#BFDBFE" }} strokeWidth={1} />
        <h2 className="text-xl font-semibold text-[#0F1E3C]" style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}>{t.catComingSoon}</h2>
        <p className="font-jakarta text-gray-400 text-sm leading-relaxed">{t.catComingSoonDesc}</p>
        <Link href="/list-your-place" className="px-6 py-3 rounded-full text-white font-jakarta font-bold text-sm shadow-md" style={{ background: "linear-gradient(135deg, #1A3A6C, #2563EB)" }}>
          {t.catListYours}
        </Link>
      </div>
    </div>
  );
}
