"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { baseTranslations } from "./translations";
import { fetchTranslations } from "@/action/translation.action";

type Language = "en" | "kh";

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({
  children,
  initialLanguage = "en",
}: {
  children: ReactNode;
  initialLanguage?: Language;
}) {
  // No branching on `window` — server and client start with the same value.
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  const [isLoading, setIsLoading] = useState(false);
  const [translations, setTranslations] = useState<Record<string, string>>(baseTranslations);

  useEffect(() => {
    const loadTranslations = async () => {
      setIsLoading(true);
      try {
        const translatedText = await fetchTranslations(baseTranslations, language);
        setTranslations(translatedText);
      } catch (error) {
        console.error("Failed to fetch translations:", error);
        setTranslations(baseTranslations);
      } finally {
        setIsLoading(false);
      }
    };
    void loadTranslations();
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    // Keep localStorage for convenience/back-compat if you like,
    // but the cookie is now the source of truth for SSR.
    document.cookie = `language=${lang}; path=/; max-age=31536000; SameSite=Lax`;
  };

  const t = (key: string, params?: Record<string, string>): string => {
    const translatedText = translations[key] || baseTranslations[key];
    let finalText = translatedText;
    if (params && finalText) {
      Object.entries(params).forEach(([paramName, paramValue]) => {
        finalText = finalText?.replace(`{{${paramName}}}`, paramValue);
      });
    }
    return finalText || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, isLoading }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}