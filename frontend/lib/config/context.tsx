"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import { LS_CONFIG, LS_CURRENT_USER } from "@/lib/config"

export interface AppSettings {
  showCheckin: boolean
  showCheckout: boolean
  showVehicles: boolean
  showAlerts: boolean
  showHistory: boolean
}

export interface UserConfig {
  id: string
  name: string
  isAdmin: boolean
  passwordHash: string
  accessToken: string | null
  showCheckin: boolean
  showCheckout: boolean
  showVehicles: boolean
  showAlerts: boolean
  showHistory: boolean
}

export interface AppConfig {
  companyName: string
  logo: string | null
  users: UserConfig[]
}

const defaultSettings: AppSettings = {
  showCheckin: true,
  showCheckout: true,
  showVehicles: true,
  showAlerts: true,
  showHistory: true,
}

const defaultAdmin: UserConfig = {
  id: "admin",
  name: "Admin",
  isAdmin: true,
  passwordHash: "",
  accessToken: null,
  ...defaultSettings,
}

const DEFAULT_COMPANY_NAME = "Valet Parking"

function loadConfig(): AppConfig {
  if (typeof window === "undefined") {
    return { companyName: DEFAULT_COMPANY_NAME, logo: null, users: [{ ...defaultAdmin }] }
  }
  const raw = window.localStorage.getItem(LS_CONFIG)
  if (!raw) return { companyName: DEFAULT_COMPANY_NAME, logo: null, users: [{ ...defaultAdmin }] }
  try {
    const parsed = JSON.parse(raw) as Partial<AppConfig>
    const users = Array.isArray(parsed.users) && parsed.users.length > 0
      ? parsed.users.map((u) => ({
          id: u.id ?? "",
          name: String(u.name ?? ""),
          isAdmin: Boolean(u.isAdmin),
          passwordHash: typeof u.passwordHash === "string" ? u.passwordHash : "",
          accessToken: typeof u.accessToken === "string" ? u.accessToken : null,
          showCheckin: u.showCheckin !== false,
          showCheckout: u.showCheckout !== false,
          showVehicles: u.showVehicles !== false,
          showAlerts: u.showAlerts !== false,
          showHistory: u.showHistory !== false,
        }))
      : [{ ...defaultAdmin }]
    return {
      companyName: typeof parsed.companyName === "string" && parsed.companyName.trim() ? parsed.companyName.trim() : DEFAULT_COMPANY_NAME,
      logo: typeof parsed.logo === "string" ? parsed.logo : null,
      users,
    }
  } catch {
    return { companyName: DEFAULT_COMPANY_NAME, logo: null, users: [{ ...defaultAdmin }] }
  }
}

function loadCurrentUserId(): string | null {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(LS_CURRENT_USER)
}

type SettingsKey = keyof AppSettings

interface ConfigContextType {
  config: AppConfig
  currentUserId: string | null
  currentUser: UserConfig | null
  effectiveSettings: AppSettings
  isAdmin: boolean
  setCompanyName: (name: string) => void
  setLogo: (dataUrl: string | null) => void
  setCurrentUser: (userId: string | null) => void
  addUser: (user: Omit<UserConfig, "id">) => void
  updateUser: (id: string, updates: Partial<UserConfig>) => void
  removeUser: (id: string) => void
  updateUserSetting: (userId: string, key: SettingsKey, value: boolean) => void
}

const ConfigContext = createContext<ConfigContextType | null>(null)

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<AppConfig>(loadConfig)
  const [currentUserId, setCurrentUserIdState] = useState<string | null>(loadCurrentUserId)

  useEffect(() => {
    window.localStorage.setItem(LS_CONFIG, JSON.stringify(config))
  }, [config])

  useEffect(() => {
    if (currentUserId !== null) {
      window.localStorage.setItem(LS_CURRENT_USER, currentUserId)
    } else {
      window.localStorage.removeItem(LS_CURRENT_USER)
    }
  }, [currentUserId])

  const currentUser = useMemo(
    () => config.users.find((u) => u.id === currentUserId) ?? null,
    [config.users, currentUserId]
  )

  const effectiveSettings = useMemo(
    () =>
      currentUser
        ? {
            showCheckin: currentUser.showCheckin,
            showCheckout: currentUser.showCheckout,
            showVehicles: currentUser.showVehicles,
            showAlerts: currentUser.showAlerts,
            showHistory: currentUser.showHistory,
          }
        : defaultSettings,
    [currentUser]
  )

  const isAdmin = currentUser?.isAdmin ?? false

  const setCompanyName = useCallback((name: string) => {
    setConfigState((prev) => ({ ...prev, companyName: name.trim() || DEFAULT_COMPANY_NAME }))
  }, [])

  const setLogo = useCallback((dataUrl: string | null) => {
    setConfigState((prev) => ({ ...prev, logo: dataUrl }))
  }, [])

  const setCurrentUser = useCallback((userId: string | null) => {
    setCurrentUserIdState(userId)
  }, [])

  const addUser = useCallback((user: Omit<UserConfig, "id">) => {
    const id = `user-${Date.now()}`
    const u: UserConfig = {
      ...user,
      id,
      passwordHash: user.passwordHash ?? "",
      accessToken: user.accessToken ?? null,
    }
    setConfigState((prev) => ({
      ...prev,
      users: [...prev.users, u],
    }))
  }, [])

  const updateUser = useCallback((id: string, updates: Partial<UserConfig>) => {
    setConfigState((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === id ? { ...u, ...updates } : u)),
    }))
  }, [])

  const removeUser = useCallback((id: string) => {
    setConfigState((prev) => ({
      ...prev,
      users: prev.users.filter((u) => u.id !== id),
    }))
    if (currentUserId === id) {
      setCurrentUserIdState(null)
    }
  }, [currentUserId])

  const updateUserSetting = useCallback(
    (userId: string, key: SettingsKey, value: boolean) => {
      const keys: SettingsKey[] = [
        "showCheckin",
        "showCheckout",
        "showVehicles",
        "showAlerts",
        "showHistory",
      ]
      if (!keys.includes(key)) {
        updateUser(userId, { [key]: value })
        return
      }
      setConfigState((prev) => {
        const user = prev.users.find((u) => u.id === userId)
        if (!user) return prev
        const next = { ...user, [key]: value }
        const count = keys.filter((k) => next[k]).length
        if (count < 1) return prev
        return {
          ...prev,
          users: prev.users.map((u) => (u.id === userId ? next : u)),
        }
      })
    },
    [updateUser]
  )

  const value: ConfigContextType = useMemo(
    () => ({
      config,
      currentUserId,
      currentUser,
      effectiveSettings,
      isAdmin,
      setCompanyName,
      setLogo,
      setCurrentUser,
      addUser,
      updateUser,
      removeUser,
      updateUserSetting,
    }),
    [
      config,
      currentUserId,
      currentUser,
      effectiveSettings,
      isAdmin,
      setCompanyName,
      setLogo,
      setCurrentUser,
      addUser,
      updateUser,
      removeUser,
      updateUserSetting,
    ]
  )

  return (
    <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
  )
}

export function useConfig() {
  const ctx = useContext(ConfigContext)
  if (!ctx) throw new Error("useConfig must be used within a ConfigProvider")
  return ctx
}
