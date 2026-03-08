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
import { LS_CURRENT_USER, LS_TOKEN } from "@/lib/config"
import { configApi, type PublicUser, type FieldVisibility } from "@/lib/api/config"

const defaultFieldVisibility: FieldVisibility = {
  showLicensePlate: true,
  showParkingSpot: true,
  showAttendantName: true,
  showMedia: true,
  showNotes: true,
}

export interface AppSettings {
  showCheckin: boolean
  showCheckout: boolean
  showVehicles: boolean
  showAlerts: boolean
  showHistory: boolean
}

export type UserConfig = PublicUser

export interface AppConfig {
  companyName: string
  logo: string | null
  users: UserConfig[]
  fieldVisibility: FieldVisibility
}

const defaultSettings: AppSettings = {
  showCheckin: true,
  showCheckout: true,
  showVehicles: true,
  showAlerts: true,
  showHistory: true,
}

const DEFAULT_COMPANY_NAME = "Valet Parking"

type SettingsKey = keyof AppSettings

interface ConfigContextType {
  config: AppConfig
  currentUserId: string | null
  currentUser: UserConfig | null
  effectiveSettings: AppSettings
  isAdmin: boolean
  loading: boolean
  setCompanyName: (name: string) => void
  setLogo: (dataUrl: string | null) => void
  setFieldVisibility: (key: keyof FieldVisibility, value: boolean) => void
  setCurrentUser: (userId: string | null) => void
  setAuth: (token: string, user: PublicUser) => void
  addUser: (user: Omit<UserConfig, "id"> & { password?: string }) => void
  updateUser: (id: string, updates: Partial<UserConfig> & { password?: string }) => void
  removeUser: (id: string) => void
  updateUserSetting: (userId: string, key: SettingsKey, value: boolean) => void
  refreshUsers: () => Promise<void>
}

const ConfigContext = createContext<ConfigContextType | null>(null)

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [companyName, setCompanyNameState] = useState(DEFAULT_COMPANY_NAME)
  const [logo, setLogoState] = useState<string | null>(null)
  const [fieldVisibility, setFieldVisibilityState] = useState<FieldVisibility>(defaultFieldVisibility)
  const [users, setUsersState] = useState<UserConfig[]>([])
  const [currentUserId, setCurrentUserIdState] = useState<string | null>(() =>
    typeof window !== "undefined" ? window.localStorage.getItem(LS_CURRENT_USER) : null
  )
  const [currentUserData, setCurrentUserData] = useState<PublicUser | null>(null)
  const [loading, setLoading] = useState(true)

  const config: AppConfig = useMemo(
    () => ({ companyName, logo, users, fieldVisibility }),
    [companyName, logo, users, fieldVisibility]
  )

  const currentUser = useMemo(
    () => currentUserData ?? users.find((u) => u.id === currentUserId) ?? null,
    [currentUserData, users, currentUserId]
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

  const isAdmin = (currentUser?.isAdmin ?? false) || currentUser?.name === "Admin"

  const refreshUsers = useCallback(async () => {
    try {
      const { users: list } = await configApi.getUsers()
      setUsersState(list)
    } catch {
      setUsersState([])
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const TIMEOUT_MS = 6000

    async function load() {
      try {
        const settingsPromise = configApi.getSettings()
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), TIMEOUT_MS)
        )
        const settings = await Promise.race([settingsPromise, timeoutPromise])
        if (!cancelled && settings) {
          setCompanyNameState(settings.companyName || DEFAULT_COMPANY_NAME)
          setLogoState(settings.logo ?? null)
          setFieldVisibilityState({
            showLicensePlate: settings.showLicensePlate ?? true,
            showParkingSpot: settings.showParkingSpot ?? true,
            showAttendantName: settings.showAttendantName ?? true,
            showMedia: settings.showMedia ?? true,
            showNotes: settings.showNotes ?? true,
          })
        }
      } catch {
        if (!cancelled) {
          setCompanyNameState(DEFAULT_COMPANY_NAME)
          setLogoState(null)
          setFieldVisibilityState(defaultFieldVisibility)
        }
      }

      try {
        const token = typeof window !== "undefined" ? window.localStorage.getItem(LS_TOKEN) : null
        if (token && !cancelled) {
          try {
            const { user } = await configApi.me()
            if (!cancelled && user) {
              setCurrentUserIdState(user.id)
              setCurrentUserData(user)
              if (user.isAdmin) {
                const { users: list } = await configApi.getUsers()
                if (!cancelled && list) setUsersState(list)
              }
            }
          } catch {
            if (!cancelled && typeof window !== "undefined") {
              window.localStorage.removeItem(LS_TOKEN)
              window.localStorage.removeItem(LS_CURRENT_USER)
              setCurrentUserIdState(null)
              setCurrentUserData(null)
              setUsersState([])
            }
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (currentUserId !== null && typeof window !== "undefined") {
      window.localStorage.setItem(LS_CURRENT_USER, currentUserId)
    } else if (typeof window !== "undefined") {
      window.localStorage.removeItem(LS_CURRENT_USER)
    }
  }, [currentUserId])

  const setAuth = useCallback((token: string, user: PublicUser) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LS_TOKEN, token)
      window.localStorage.setItem(LS_CURRENT_USER, user.id)
    }
    setCurrentUserIdState(user.id)
    setCurrentUserData(user)
    if (user.isAdmin) {
      configApi.getUsers().then(({ users: list }) => setUsersState(list)).catch(() => {})
    }
  }, [])

  const setCurrentUser = useCallback((userId: string | null) => {
    if (userId === null && typeof window !== "undefined") {
      window.localStorage.removeItem(LS_TOKEN)
      window.localStorage.removeItem(LS_CURRENT_USER)
    }
    setCurrentUserIdState(userId)
    if (userId === null) setCurrentUserData(null)
  }, [])

  const setCompanyName = useCallback(async (name: string) => {
    const value = name.trim() || DEFAULT_COMPANY_NAME
    try {
      await configApi.updateSettings({ companyName: value })
      setCompanyNameState(value)
    } catch (e) {
      console.error("setCompanyName", e)
    }
  }, [])

  const setLogo = useCallback(async (dataUrl: string | null) => {
    try {
      await configApi.updateSettings({ logo: dataUrl })
      setLogoState(dataUrl)
    } catch (e) {
      console.error("setLogo", e)
    }
  }, [])

  const setFieldVisibility = useCallback(async (key: keyof FieldVisibility, value: boolean) => {
    try {
      await configApi.updateSettings({ [key]: value })
      setFieldVisibilityState((prev) => ({ ...prev, [key]: value }))
    } catch (e) {
      console.error("setFieldVisibility", e)
    }
  }, [])

  const addUser = useCallback(
    async (user: Omit<UserConfig, "id"> & { password?: string }) => {
      try {
        const { user: created } = await configApi.addUser({
          name: user.name,
          password: user.password,
          isAdmin: user.isAdmin,
          showCheckin: user.showCheckin,
          showCheckout: user.showCheckout,
          showVehicles: user.showVehicles,
          showAlerts: user.showAlerts,
          showHistory: user.showHistory,
        })
        setUsersState((prev) => [...prev, created])
      } catch (e) {
        console.error("addUser", e)
        throw e
      }
    },
    []
  )

  const updateUser = useCallback(
    async (id: string, updates: Partial<UserConfig> & { password?: string }) => {
      try {
        const { user: updated } = await configApi.updateUser(id, {
          name: updates.name,
          password: updates.password,
          isAdmin: updates.isAdmin,
          showCheckin: updates.showCheckin,
          showCheckout: updates.showCheckout,
          showVehicles: updates.showVehicles,
          showAlerts: updates.showAlerts,
          showHistory: updates.showHistory,
        })
        setUsersState((prev) => prev.map((u) => (u.id === id ? updated : u)))
        if (currentUserData?.id === id) setCurrentUserData(updated)
      } catch (e) {
        console.error("updateUser", e)
        throw e
      }
    },
    [currentUserData?.id]
  )

  const removeUser = useCallback(async (id: string) => {
    try {
      await configApi.removeUser(id)
      setUsersState((prev) => prev.filter((u) => u.id !== id))
      if (currentUserId === id) {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(LS_TOKEN)
          window.localStorage.removeItem(LS_CURRENT_USER)
        }
        setCurrentUserIdState(null)
        setCurrentUserData(null)
      }
    } catch (e) {
      console.error("removeUser", e)
      throw e
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
      if (!keys.includes(key)) return
      updateUser(userId, { [key]: value })
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
      loading,
      setCompanyName,
      setLogo,
      setFieldVisibility,
      setCurrentUser,
      setAuth,
      addUser,
      updateUser,
      removeUser,
      updateUserSetting,
      refreshUsers,
    }),
    [
      config,
      currentUserId,
      currentUser,
      effectiveSettings,
      isAdmin,
      loading,
      setCompanyName,
      setLogo,
      setFieldVisibility,
      setCurrentUser,
      setAuth,
      addUser,
      updateUser,
      removeUser,
      updateUserSetting,
      refreshUsers,
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
