"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { translations, type Language, type TranslationKeys } from './translations'

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: TranslationKeys
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('es')

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    // Guardar preferencia en localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('valet-language', lang)
    }
  }, [])

  // Cargar preferencia guardada al iniciar
  useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('valet-language') as Language
      if (saved && translations[saved]) {
        setLanguageState(saved)
      }
    }
  })

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
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

export function useTranslations() {
  const { t } = useI18n()
  return t
}

export function useLanguage() {
  const { language, setLanguage } = useI18n()
  return { language, setLanguage }
}
