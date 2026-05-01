"use client";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { ActionButton } from "@/components/ActionButton";
import { useLang } from "@/context/LanguageContext";

function SubmittedContent() {
  const { t }        = useLang();
  const searchParams = useSearchParams();
  const router       = useRouter();
  const placeName    = searchParams.get("name") || "";

  return (
    <div style={{
      maxWidth: 448, margin: "0 auto", minHeight: "100vh", background: "#f8fafc",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "40px 28px", textAlign: "center",
    }}>
      {/* Check circle */}
      <div style={{
        width: 96, height: 96, borderRadius: 999,
        background: "linear-gradient(135deg, #22c55e, #16a34a)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 24, boxShadow: "0 8px 28px rgba(34,197,94,0.35)",
      }}>
        <Check size={46} color="white" strokeWidth={2.5} />
      </div>

      <h1 style={{
        margin: "0 0 10px",
        fontFamily: "var(--font-fraunces), Georgia, serif",
        fontSize: 26, fontWeight: 700, color: "#1e3a5f",
      }}>
        {t.submittedTitle}
      </h1>

      {placeName ? (
        <p style={{
          margin: "0 0 8px",
          fontFamily: "var(--font-jakarta), sans-serif",
          fontSize: 14, fontWeight: 700, color: "#1e3a5f",
        }}>
          {placeName}
        </p>
      ) : null}

      <p style={{
        margin: "0 0 32px",
        fontFamily: "var(--font-jakarta), sans-serif",
        fontSize: 13, color: "#64748b", lineHeight: 1.65,
      }}>
        {t.submittedDesc}
      </p>

      <ActionButton
        onClick={() => router.replace("/")}
        style={{
          width: "100%", padding: "15px 0", borderRadius: 16, border: "none",
          background: "linear-gradient(135deg, #1e3a5f, #2563eb)",
          color: "#fff", fontFamily: "var(--font-jakarta), sans-serif",
          fontSize: 15, fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center",
          touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
        } as React.CSSProperties}
      >
        {t.submittedCta}
      </ActionButton>
    </div>
  );
}

export default function SubmittedPage() {
  return (
    <Suspense>
      <SubmittedContent />
    </Suspense>
  );
}
