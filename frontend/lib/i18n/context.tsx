"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { COOKIE_LANGUAGE, DEFAULT_LANGUAGE } from "@/lib/config"
import { translations, type Language, type TranslationKeys } from "./translations"

const COOKIE_MAX_AGE = 365 * 24 * 60 * 60 // 1 year

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: TranslationKeys
}

const I18nContext = createContext<I18nContextType | null>(null)

interface I18nProviderProps {
  children: ReactNode
  initialLanguage?: Language
}

export function I18nProvider({ children, initialLanguage = DEFAULT_LANGUAGE }: I18nProviderProps) {
  const [language, setLanguageState] = useState<Language>(initialLanguage)

  const setLanguage = useCallback((lang: Language) => {
    if (!translations[lang]) return
    setLanguageState(lang)
    if (typeof localStorage !== "undefined") localStorage.setItem(COOKIE_LANGUAGE, lang)
    if (typeof document !== "undefined") {
      document.cookie = `${COOKIE_LANGUAGE}=${lang};path=/;max-age=${COOKIE_MAX_AGE};SameSite=Lax`
    }
  }, [])

  const t = translations[language]

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}

export function useTranslations() {
  return useI18n().t
}

export function useLanguage() {
  const { language, setLanguage } = useI18n()
  return { language, setLanguage }
}