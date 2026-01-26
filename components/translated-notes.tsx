"use client"

import { useTranslate } from '@/hooks/use-translate'

interface TranslatedNotesProps {
  notes: string | undefined | null
  className?: string
}

export function TranslatedNotes({ notes, className = '' }: TranslatedNotesProps) {
  const { text: translatedNotes, isTranslating } = useTranslate(notes)

  if (!notes) return null

  return (
    <span className={`${className} ${isTranslating ? 'animate-pulse' : ''}`}>
      {translatedNotes || notes}
    </span>
  )
}
