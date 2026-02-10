import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { type Language, getStoredLanguage, setStoredLanguage, t as translate, bilingual as bilingualFn } from "./i18n";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  bilingual: <T extends Record<string, any>>(item: T, field: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(getStoredLanguage);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    setStoredLanguage(newLang);
  }, []);

  const tFn = useCallback((key: string) => translate(key, lang), [lang]);
  const bFn = useCallback(<T extends Record<string, any>>(item: T, field: string) => bilingualFn(item, field, lang), [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: tFn, bilingual: bFn }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
