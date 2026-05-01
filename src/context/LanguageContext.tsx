"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations, Lang, Translations } from "@/lib/translations";

type LanguageContextType = {
  lang: Lang;
  toggleLang: () => void;
  t: Translations;
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "id",
  toggleLang: () => {},
  t: translations.id,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("id");

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved === "id" || saved === "en") setLang(saved);
  }, []);

  function toggleLang() {
    const next: Lang = lang === "id" ? "en" : "id";
    setLang(next);
    localStorage.setItem("lang", next);
  }

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t: translations[lang] as Translations }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
