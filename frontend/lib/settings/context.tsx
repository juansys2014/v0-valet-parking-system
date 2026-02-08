"use client"

import { LS_SETTINGS } from "@/lib/config"
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

export interface AppSettings {
  showCheckin: boolean
  showCheckout: boolean
  showVehicles: boolean
  showAlerts: boolean
  showHistory: boolean
}

const defaultSettings: AppSettings = {
  showCheckin: true,
  showCheckout: true,
  showVehicles: true,
  showAlerts: true,
  showHistory: true,
}

type SettingsKey = keyof AppSettings

interface SettingsContextType {
  settings: AppSettings
  updateSetting: (key: SettingsKey, value: boolean) => void
  resetSettings: () => void
  enabledCount: number
}

const SettingsContext = createContext<SettingsContextType | null>(null)

function countEnabled(s: AppSettings) {
  return Object.values(s).filter(Boolean).length
}

function safeLoadSettings(): AppSettings {
  if (typeof window === "undefined") return defaultSettings

  const raw = window.localStorage.getItem(LS_SETTINGS)
  if (!raw) return defaultSettings

  try {
    const parsed = JSON.parse(raw) as Partial<Record<SettingsKey, unknown>>
    const sanitized: Partial<AppSettings> = {}

    ;(Object.keys(defaultSettings) as SettingsKey[]).forEach((k) => {
      if (typeof parsed?.[k] === "boolean") sanitized[k] = parsed[k] as boolean
    })

    const merged = { ...defaultSettings, ...sanitized }

    // Regla: mínimo 1 activo
    return countEnabled(merged) >= 1 ? merged : defaultSettings
  } catch {
    return defaultSettings
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  // Lazy init: no cambia después de hidratar → evita mismatch
  const [settings, setSettings] = useState<AppSettings>(() => safeLoadSettings())

  const enabledCount = useMemo(() => countEnabled(settings), [settings])

  useEffect(() => {
    window.localStorage.setItem(LS_SETTINGS, JSON.stringify(settings))
  }, [settings])

  const updateSetting = (key: SettingsKey, value: boolean) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value }

      // Regla: mínimo 1 activo
      if (countEnabled(next) < 1) return prev

      return next
    })
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings, enabledCount }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) throw new Error("useSettings must be used within a SettingsProvider")
  return context
}
