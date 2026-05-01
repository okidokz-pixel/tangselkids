import type { Metadata, Viewport } from "next";
import { Playfair_Display, Plus_Jakarta_Sans, Fraunces } from "next/font/google";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { RegisterSheetProvider } from "@/context/RegisterSheetContext";
import { AuthGuard } from "@/components/AuthGuard";
import { RegisterSheet } from "@/components/RegisterSheet";
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

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "TangselKids",
  description: "Hyperlocal directory for parents in Tangerang Selatan, Indonesia",
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
    <html lang="id" className={`${playfair.variable} ${jakarta.variable} ${fraunces.variable} h-full`}>
      <head>
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
        `}</style>
      </head>
      <body className="min-h-full font-jakarta text-gray-800 antialiased" suppressHydrationWarning>
        <LanguageProvider>
          <AuthProvider>
            <RegisterSheetProvider>
              <AuthGuard>{children}</AuthGuard>
              <RegisterSheet />
            </RegisterSheetProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
