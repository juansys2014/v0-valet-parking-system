"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

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

interface SettingsContextType {
  settings: AppSettings
  updateSetting: (key: keyof AppSettings, value: boolean) => void
  resetSettings: () => void
}

const SettingsContext = createContext<SettingsContextType | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('valet-settings')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setSettings({ ...defaultSettings, ...parsed })
      } catch {
        // Invalid JSON, use defaults
      }
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('valet-settings', JSON.stringify(settings))
    }
  }, [settings, mounted])

  const updateSetting = (key: keyof AppSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
