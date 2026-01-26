"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { useLanguage } from '@/lib/i18n/context'

// Cache de traducciones para evitar llamadas repetidas
const translationCache = new Map<string, string>()

function getCacheKey(text: string, lang: string): string {
  return `${lang}:${text}`
}

export function useTranslate(originalText: string | undefined | null): {
  text: string
  isTranslating: boolean
} {
  const { language } = useLanguage()
  const [translatedText, setTranslatedText] = useState(originalText || '')
  const [isTranslating, setIsTranslating] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const translate = useCallback(async (text: string, targetLang: string) => {
    if (!text || text.trim().length < 3) {
      setTranslatedText(text || '')
      return
    }

    const cacheKey = getCacheKey(text, targetLang)
    
    // Verificar cache
    if (translationCache.has(cacheKey)) {
      setTranslatedText(translationCache.get(cacheKey)!)
      return
    }

    // Cancelar peticion anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    setIsTranslating(true)

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLanguage: targetLang }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error('Translation failed')
      }

      const data = await response.json()
      const translated = data.translatedText || text

      // Guardar en cache
      translationCache.set(cacheKey, translated)
      setTranslatedText(translated)
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Translation error:', error)
        setTranslatedText(text)
      }
    } finally {
      setIsTranslating(false)
    }
  }, [])

  useEffect(() => {
    if (originalText) {
      translate(originalText, language)
    } else {
      setTranslatedText('')
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [originalText, language, translate])

  return { text: translatedText, isTranslating }
}

// Componente wrapper para mostrar texto traducido
export function TranslatedText({ 
  children, 
  className = '' 
}: { 
  children: string | undefined | null
  className?: string 
}) {
  const { text, isTranslating } = useTranslate(children)

  if (isTranslating) {
    return <span className={`${className} animate-pulse`}>{children}</span>
  }

  return <span className={className}>{text}</span>
}
