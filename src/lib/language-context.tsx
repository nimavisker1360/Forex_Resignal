"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
} from "react";

export type Language = "en" | "fa";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

const LANGUAGE_STORAGE_KEY = "signal-forex-language";
const LANGUAGE_COOKIE_KEY = "signal_forex_language";

function applyDocumentLanguage(lang: Language, direction?: string) {
  document.documentElement.dir = direction || (lang === "fa" ? "rtl" : "ltr");
  document.documentElement.lang = lang;
}

function persistLanguage(lang: Language) {
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  document.cookie = `${LANGUAGE_COOKIE_KEY}=${lang}; path=/; max-age=31536000; SameSite=Lax`;
}

function asTranslationRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

export function LanguageProvider({
  children,
  initialLanguage = "en",
}: {
  children: React.ReactNode;
  initialLanguage?: Language;
}) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);
  const [translations, setTranslations] = useState<Record<string, unknown>>({});

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    persistLanguage(lang);
    applyDocumentLanguage(lang);
  }, []);

  useEffect(() => {
    // Load translations based on selected language
    fetch(`/locales/${language}/common.json`, { cache: "no-store" })
      .then((response) => response.json())
      .then((data: unknown) => {
        const translationData = asTranslationRecord(data);
        const direction =
          typeof translationData.direction === "string"
            ? translationData.direction
            : undefined;

        setTranslations(translationData);
        // Update document direction and language
        applyDocumentLanguage(language, direction);
      })
      .catch((error) => console.error("Failed to load translations:", error));
  }, [language]);

  // Translation function that handles nested keys
  const t = (key: string): string => {
    if (typeof key !== "string" || key.length === 0) {
      return "";
    }

    const keys = key.split(".");
    let result: unknown = translations;

    for (const k of keys) {
      if (result && typeof result === "object" && k in result) {
        result = (result as Record<string, unknown>)[k];
      } else {
        return key; // Return the key if translation is not found
      }
    }

    return typeof result === "string" ? result : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
