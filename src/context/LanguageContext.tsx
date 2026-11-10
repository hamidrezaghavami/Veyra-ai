import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { translate } from '../i18n/translate'
export type Language = 'en' | 'tr'
const storageKey = 'veyra-language'
export function initialLanguage(): Language {
  try { const saved = localStorage.getItem(storageKey); if (saved === 'en' || saved === 'tr') return saved } catch {}
  return typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('tr') ? 'tr' : 'en'
}
const LanguageContext = createContext({ language: 'en' as Language, locale: 'en-US', setLanguage: (_value: Language) => {}, t: (text: string | null | undefined, _values?: Record<string,string|number>) => text || '' })
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(initialLanguage)
  useEffect(() => {
    document.documentElement.lang = language
    document.title = language === 'tr' ? 'Veyra AI — Fatura ve Gider Kontrolü' : 'Veyra AI — Invoice & Expense Auditing'
    document.querySelector('meta[name="description"]')?.setAttribute('content', language === 'tr' ? 'Faturalarınızı yükleyin, olası hataları inceleyin ve harcamalarınızı Veyra AI ile takip edin.' : 'Upload invoices, review potential errors, and track your expenses with Veyra AI.')
    try { localStorage.setItem(storageKey, language) } catch {}
  }, [language])
  const t = useCallback((text: string | null | undefined, values?: Record<string,string|number>) => translate(text || '', language, values), [language])
  const value = useMemo(() => ({ language, locale: language === 'tr' ? 'tr-TR' : 'en-US', setLanguage, t }), [language,t])
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
export const useLanguage = () => useContext(LanguageContext)
