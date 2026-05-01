"use client";
import { useRegisterSheet } from "@/context/RegisterSheetContext";
import { useLang } from "@/context/LanguageContext";
import { ActionButton } from "./ActionButton";

/**
 * GuestGate — blurred paywall rendered ABOVE the hidden results.
 * Content is anchored to the TOP of the overlay so the title, count,
 * bullets and CTA are immediately visible.
 * Gradient fades from solid blue-tint at the top to transparent at the
 * bottom so the blurred cards below show through naturally.
 */
export function GuestGate({
  children,
  hiddenCount,
}: {
  children: React.ReactNode;
  hiddenCount?: number;
}) {
  const { openRegisterSheet } = useRegisterSheet();
  const { t } = useLang();

  // Light blue tint (Tailwind blue-100 = #DBEAFE → rgb 219,234,254)
  const bg = "219,234,254";

  return (
    <div style={{
      position: "relative",
      marginTop: -80,
      marginLeft: -20,
      marginRight: -20,
      minHeight: "70vh",
    }}>
      {/* Blurred content — restore horizontal padding so cards stay aligned */}
      <div style={{
        filter: "blur(6px)",
        pointerEvents: "none",
        userSelect: "none",
        padding: "0 20px",
      }}>
        {children}
      </div>

      {/* Overlay — solid blue-tint at top, fades to transparent at bottom */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingTop: 60,
          background: `linear-gradient(
            to bottom,
            rgba(${bg}, 0)    0%,
            rgba(${bg}, 0.5)  18%,
            rgba(${bg}, 0.92) 36%,
            rgba(${bg}, 1)    50%,
            rgba(${bg}, 1)    100%
          )`,
        }}
      >
        {/* Title */}
        <p style={{
          fontSize: 21,
          fontWeight: 800,
          color: "#1e3a5f",
          margin: "0 0 6px",
          textAlign: "center",
          fontFamily: "var(--font-fraunces), Georgia, serif",
          lineHeight: 1.2,
          padding: "0 20px",
        }}>
          {t.guestGateTitle}
        </p>

        {/* Hidden count */}
        {hiddenCount != null && hiddenCount > 0 && (
          <p style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#2563eb",
            margin: "0 0 16px",
            textAlign: "center",
            fontFamily: "var(--font-jakarta), sans-serif",
          }}>
            {t.guestGateMore(hiddenCount)}
          </p>
        )}

        {/* CTA button */}
        <ActionButton
          onClick={openRegisterSheet}
          style={{
            background: "linear-gradient(135deg, #16a34a, #22c55e)",
            color: "#fff",
            fontWeight: 800,
            fontSize: 17,
            padding: "18px 40px",
            borderRadius: 999,
            touchAction: "manipulation",
            WebkitTapHighlightColor: "transparent",
            fontFamily: "var(--font-jakarta), sans-serif",
            display: "flex",
            alignItems: "center",
            gap: 10,
            boxShadow: "0 4px 16px rgba(22,163,74,0.35)",
          }}
        >
          {t.guestGateCta}
          <span style={{
            display: "inline-block",
            fontSize: 20,
            lineHeight: 1,
            animation: "arrow-slide 1s ease-in-out infinite",
          }}>
            →
          </span>
        </ActionButton>

        {/* Benefit bullets */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: 7,
          marginTop: 20,
          alignSelf: "stretch",
          padding: "0 24px",
        }}>
          {t.guestGateBenefits.map((benefit) => (
            <p key={benefit} style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#1e3a5f",
              margin: 0,
              fontFamily: "var(--font-jakarta), sans-serif",
              lineHeight: 1.4,
            }}>
              {benefit}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
