"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Car, LogIn } from "lucide-react"
import { Navigation, type TabType } from "@/components/navigation"
import { CheckinForm } from "@/components/checkin-form"
import { CheckoutForm } from "@/components/checkout-form"
import { VehiclesList } from "@/components/vehicles-list"
import { NotificationsPanel } from "@/components/notifications-panel"
import { SettingsMenu } from "@/components/settings-menu"
import { useNavCounts } from "@/hooks/use-nav-counts"
import { useTranslations } from "@/lib/i18n/context"
import { useConfig } from "@/lib/config/context"
import { verifyPassword } from "@/lib/utils/auth"

export default function ValetParkingApp() {
  const [activeTab, setActiveTab] = useState<TabType>("checkin")
  const [mounted, setMounted] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const { parkedCount } = useNavCounts()
  const t = useTranslations()
  const {
    effectiveSettings,
    currentUser,
    currentUserId,
    config,
    setCurrentUser,
  } = useConfig()

  // Login por URL (?user=id&token=xxx): acceso directo con QR, no se usa el formulario
  useEffect(() => {
    if (typeof window === "undefined" || !mounted) return
    const params = new URLSearchParams(window.location.search)
    const userId = params.get("user")
    const token = params.get("token")
    if (userId && token) {
      const user = config.users.find((u) => u.id === userId)
      if (user && user.accessToken === token) {
        setCurrentUser(userId)
        window.history.replaceState({}, "", window.location.pathname)
      }
    }
  }, [mounted, config.users, setCurrentUser])

  useEffect(() => {
    const tabSettings: Record<TabType, boolean> = {
      checkin: effectiveSettings.showCheckin,
      checkout: effectiveSettings.showCheckout,
      vehicles: effectiveSettings.showVehicles,
      notifications: effectiveSettings.showAlerts,
      history: effectiveSettings.showHistory,
    }

    if (!tabSettings[activeTab]) {
      const firstActive = (Object.keys(tabSettings) as TabType[]).find(
        (tab) => tabSettings[tab]
      )
      if (firstActive) setActiveTab(firstActive)
    }
  }, [effectiveSettings, activeTab])

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const name = username.trim()
      if (!name) return
      setLoginError("")
      setSubmitting(true)
      try {
        const user = config.users.find(
          (u) => u.name.trim().toLowerCase() === name.toLowerCase()
        )
        if (!user) {
          setLoginError(t.auth.userNotFound)
          return
        }
        if (user.passwordHash) {
          const ok = await verifyPassword(password, user.passwordHash)
          if (!ok) {
            setLoginError(t.auth.invalidPassword)
            return
          }
        }
        setCurrentUser(user.id)
        setUsername("")
        setPassword("")
      } finally {
        setSubmitting(false)
      }
    },
    [username, password, config.users, setCurrentUser, t.auth.userNotFound, t.auth.invalidPassword]
  )

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Car className="h-12 w-12 mx-auto text-primary animate-pulse mb-4" />
          <p className="text-muted-foreground">{t.common.loading}</p>
        </div>
      </div>
    )
  }

  // Sin usuario: pantalla de login (usuario + contraseña). El acceso por QR no pasa por aquí.
  if (!currentUserId && config.users.length > 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold text-center mb-4 flex items-center justify-center gap-2">
              <LogIn className="h-5 w-5" />
              {t.auth.loginTitle}
            </h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-username">{t.auth.username}</Label>
                <Input
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    setLoginError("")
                  }}
                  placeholder={t.auth.usernamePlaceholder}
                  autoComplete="username"
                  className="h-11"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">{t.auth.password}</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setLoginError("")
                  }}
                  placeholder={t.auth.passwordPlaceholder}
                  autoComplete="current-password"
                  className="h-11"
                />
              </div>
              {loginError && (
                <p className="text-sm text-destructive">{loginError}</p>
              )}
              <Button
                type="submit"
                className="w-full h-11"
                disabled={submitting || !username.trim()}
              >
                {submitting ? t.common.loading : t.auth.enter}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-30 bg-card border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {config.logo ? (
                <img
                  src={config.logo}
                  alt="Logo"
                  className="h-12 w-12 object-contain rounded-lg bg-muted"
                />
              ) : (
                <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center">
                  <Car className="h-7 w-7 text-primary-foreground" />
                </div>
              )}
              <div>
                <h1 className="font-bold text-foreground text-lg leading-tight">
                  {config.companyName || t.header.title}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {parkedCount} {t.header.subtitle.toLowerCase()}
                  {currentUser && (
                    <span className="ml-1"> · {currentUser.name}</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <SettingsMenu />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {activeTab === "checkin" && effectiveSettings.showCheckin && <CheckinForm />}
        {activeTab === "checkout" && effectiveSettings.showCheckout && <CheckoutForm />}
        {activeTab === "vehicles" && effectiveSettings.showVehicles && <VehiclesList />}
        {activeTab === "notifications" && effectiveSettings.showAlerts && (
          <NotificationsPanel />
        )}
        {activeTab === "history" && effectiveSettings.showHistory && (
          <VehiclesList showHistory />
        )}
      </main>

      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
