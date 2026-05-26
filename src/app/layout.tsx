import type { Metadata, Viewport } from "next";
import { Playfair_Display, Plus_Jakarta_Sans, Bricolage_Grotesque, Fraunces } from "next/font/google";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { RegisterSheetProvider } from "@/context/RegisterSheetContext";
import { LoginSheetProvider } from "@/context/LoginSheetContext";
import { AuthGuard } from "@/components/AuthGuard";
import { RegisterSheet } from "@/components/RegisterSheet";
import { LoginSheet } from "@/components/LoginSheet";
import { DragClickGuard } from "@/components/DragClickGuard";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const fraunces = Bricolage_Grotesque({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const frauncesLogo = Fraunces({
  variable: "--font-logo",
  subsets: ["latin"],
  weight: ["700", "800"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: { default: "TangselKids", template: "%s | TangselKids" },
  description: "Direktori hyperlokal untuk orang tua di Tangerang Selatan — temukan sekolah, daycare, tempat bermain, klinik anak, dan lebih banyak lagi.",
  metadataBase: new URL("https://tangselkids.com"),
  openGraph: {
    siteName: "TangselKids",
    locale: "id_ID",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${playfair.variable} ${jakarta.variable} ${fraunces.variable} ${frauncesLogo.variable} h-full`}>
      <head>
        {/*
          Pre-hydration safety net: forces a hard reload on browser back/forward
          and on BFCache restore. Registered in <head> so it runs BEFORE the
          Next.js client router hydrates and registers its own popstate handler,
          guaranteeing our listener wins the race. This fixes a desktop-only bug
          where back-navigation from category/filter pages leaves the homepage
          half-initialized (empty data, frozen timers, modal stuck open and
          silently blocking clicks).
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                // Detect an unhydrated React tree after back/forward navigation
                // and force a reload. This is the actual root cause of the
                // desktop-only homepage-broken-after-back bug: Next.js + Turbopack
                // dev mode sometimes serves a back/forward navigation with
                // un-hydrated SSR HTML. React never attaches event handlers,
                // useEffect never fires, fetches never run — page LOOKS rendered
                // but is dead. We detect the dead state by checking for React's
                // internal __reactFiber/__reactContainer keys and reload if missing.
                var justReloaded = !!sessionStorage.getItem("__tkHydrationReload");
                sessionStorage.removeItem("__tkHydrationReload");

                function isHydrated() {
                  var probes = [document.body, document.body.firstElementChild, document.body.querySelector("nav, main, [data-tk-page]")];
                  for (var i = 0; i < probes.length; i++) {
                    var el = probes[i];
                    if (!el) continue;
                    for (var k in el) {
                      if (k.indexOf("__reactFiber") === 0 || k.indexOf("__reactContainer") === 0 || k.indexOf("__reactProps") === 0) {
                        return true;
                      }
                    }
                  }
                  return false;
                }
                function reloadOnce() {
                  sessionStorage.setItem("__tkHydrationReload", "1");
                  window.location.reload();
                }

                window.addEventListener("pageshow", function (e) {
                  if (e && e.persisted) { reloadOnce(); return; }
                  if (justReloaded) return; // we just reloaded; let this attempt finish
                  // Poll every 40ms; bail out the moment React hydrates, or
                  // reload after 600ms if no fiber ever attaches. Faster than
                  // a fixed 1.2s wait so the broken-state "blink" is minimal.
                  var deadline = Date.now() + 600;
                  function tick() {
                    if (isHydrated()) return; // healthy — done
                    if (Date.now() >= deadline) { reloadOnce(); return; }
                    setTimeout(tick, 40);
                  }
                  setTimeout(tick, 80); // give React a brief head start
                });
              })();
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "TangselKids",
              "url": "https://tangselkids.com",
              "description": "Direktori hyperlokal untuk orang tua di Tangerang Selatan — temukan sekolah, daycare, tempat bermain, klinik anak, dan lebih banyak lagi.",
              "inLanguage": "id-ID",
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://tangselkids.com/explore?q={search_term_string}"
                },
                "query-input": "required name=search_term_string"
              }
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "TangselKids",
              "url": "https://tangselkids.com",
              "logo": "https://tangselkids.com/tangsel-kids-logo.png",
              "description": "Direktori hyperlokal untuk orang tua di Tangerang Selatan.",
              "areaServed": {
                "@type": "City",
                "name": "Tangerang Selatan"
              },
              "sameAs": []
            }),
          }}
        />
        <style>{`
          @keyframes sheet-fade-in {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
          @keyframes sheet-slide-up {
            from { transform: translateY(100%); }
            to   { transform: translateY(0); }
          }
          @keyframes arrow-slide {
            0%, 100% { transform: translateX(0); }
            50%      { transform: translateX(7px); }
          }
          @keyframes filter-pulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(14, 29, 79, 0.55); }
            60%       { box-shadow: 0 0 0 10px rgba(14, 29, 79, 0); }
          }
        `}</style>
      </head>
      <body className="min-h-full font-jakarta text-gray-800 antialiased" suppressHydrationWarning>
        <LanguageProvider>
          <AuthProvider>
            <RegisterSheetProvider>
              <LoginSheetProvider>
                <DragClickGuard />
                <AuthGuard>{children}</AuthGuard>
                <RegisterSheet />
                <LoginSheet />
              </LoginSheetProvider>
            </RegisterSheetProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
