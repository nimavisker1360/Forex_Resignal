"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "fa";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const [translations, setTranslations] = useState<Record<string, any>>({});

  useEffect(() => {
    // Load translations based on selected language
    fetch(`/locales/${language}/common.json`)
      .then((response) => response.json())
      .then((data) => {
        setTranslations(data);
        // Update document direction and language
        document.documentElement.dir =
          data.direction || (language === "fa" ? "rtl" : "ltr");
        document.documentElement.lang = language;
      })
      .catch((error) => console.error("Failed to load translations:", error));
  }, [language]);

  // Translation function that handles nested keys
  const t = (key: string): string => {
    const keys = key.split(".");
    let result = translations;

    for (const k of keys) {
      if (result && typeof result === "object" && k in result) {
        result = result[k];
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
