"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Menu,
  LogIn,
  LogOut,
  List,
  Bell,
  Clock,
  Globe,
  X,
  Upload,
  User,
  UserPlus,
  Trash2,
  LogOut as SwitchUserIcon,
  QrCode,
  Settings2,
} from "lucide-react"
import QRCode from "qrcode"
import { useTranslations, useLanguage } from "@/lib/i18n/context"
import { useConfig, type UserConfig } from "@/lib/config/context"
import { configApi } from "@/lib/api/config"

const FEATURE_KEYS = [
  { key: "showCheckin" as const, labelKey: "showEntry" as const, icon: LogIn },
  { key: "showCheckout" as const, labelKey: "showExit" as const, icon: LogOut },
  { key: "showVehicles" as const, labelKey: "showActive" as const, icon: List },
  { key: "showAlerts" as const, labelKey: "showAlerts" as const, icon: Bell },
  { key: "showHistory" as const, labelKey: "showHistory" as const, icon: Clock },
] as const

export function SettingsMenu() {
  const [open, setOpen] = useState(false)
  const [configSection, setConfigSection] = useState<"main" | "users">("main")
  const [newUserName, setNewUserName] = useState("")
  const [newUserPassword, setNewUserPassword] = useState("")
  const [newUserAdmin, setNewUserAdmin] = useState(false)
  const [newUserScreens, setNewUserScreens] = useState({
    showCheckin: true,
    showCheckout: true,
    showVehicles: true,
    showAlerts: true,
    showHistory: true,
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const t = useTranslations()
  const { language, setLanguage } = useLanguage()
  const {
    config,
    isAdmin,
    setCompanyName,
    setLogo,
    setCurrentUser,
    addUser,
    updateUser,
    removeUser,
    updateUserSetting,
  } = useConfig()
  const [qrModal, setQrModal] = useState<{ dataUrl: string; userName: string } | null>(null)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith("image/")) return
    const reader = new FileReader()
    reader.onload = () => setLogo(reader.result as string)
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  const handleAddUser = useCallback(async () => {
    const name = newUserName.trim() || t.config.userName
    try {
      await addUser({
        name,
        isAdmin: newUserAdmin,
        password: newUserPassword.trim() || undefined,
        ...newUserScreens,
      })
      setNewUserName("")
      setNewUserPassword("")
      setNewUserAdmin(false)
      setNewUserScreens({
        showCheckin: true,
        showCheckout: true,
        showVehicles: true,
        showAlerts: true,
        showHistory: true,
      })
      setConfigSection("main")
    } catch (_e) {
      // error ya manejado en context
    }
  }, [newUserName, newUserPassword, newUserAdmin, newUserScreens, addUser, t.config.userName])

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">{t.settings.title}</span>
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setOpen(false)
              setConfigSection("main")
            }}
          />

          <Card className="relative z-10 w-full max-w-sm mx-4 mt-16 max-h-[85vh] flex flex-col shadow-xl animate-in fade-in slide-in-from-top-4 duration-200">
            <CardHeader className="pb-2 flex-shrink-0">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-lg min-w-0">
                  <Menu className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{configSection === "users" && isAdmin ? t.config.users : t.settings.title}</span>
                </CardTitle>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 h-9 text-xs"
                    onClick={() => {
                      setCurrentUser(null)
                      setOpen(false)
                      setConfigSection("main")
                    }}
                  >
                    <SwitchUserIcon className="h-3.5 w-3.5" />
                    {t.auth.logout}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => {
                      setOpen(false)
                      setConfigSection("main")
                    }}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-5 pb-6 overflow-y-auto flex-1">
              {(configSection === "main" || (configSection === "users" && !isAdmin)) && (
                <>
                  {/* Idioma: todos los usuarios */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      {t.settings.language}
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={language === "es" ? "default" : "outline"}
                        size="lg"
                        onClick={() => setLanguage("es")}
                        className={`h-11 ${language === "es" ? "" : "bg-transparent"}`}
                      >
                        Espanol
                      </Button>
                      <Button
                        variant={language === "en" ? "default" : "outline"}
                        size="lg"
                        onClick={() => setLanguage("en")}
                        className={`h-11 ${language === "en" ? "" : "bg-transparent"}`}
                      >
                        English
                      </Button>
                    </div>
                  </div>

                  {/* Cerrar sesión: todos los usuarios (visible siempre) */}
                  <Separator />
                  <Button
                    variant="outline"
                    className="w-full h-11 gap-2"
                    onClick={() => {
                      setCurrentUser(null)
                      setOpen(false)
                    }}
                  >
                    <SwitchUserIcon className="h-4 w-4" />
                    {t.auth.logout}
                  </Button>

                  {/* Logo, usuarios: solo admin */}
                  {isAdmin && (
                    <>
                      <Separator />

                      <div className="space-y-3">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          {t.config.title}
                        </Label>

                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm text-muted-foreground block mb-1">
                              {t.config.companyName}
                            </Label>
                            <Input
                              value={config.companyName}
                              onChange={(e) => setCompanyName(e.target.value)}
                              placeholder={t.config.companyNamePlaceholder}
                              className="h-9"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-sm text-muted-foreground flex-1">
                              {t.config.logo}
                            </Label>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleLogoChange}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <Upload className="h-4 w-4" />
                              {t.config.uploadLogo}
                            </Button>
                            {config.logo && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setLogo(null)}
                              >
                                {t.config.removeLogo}
                              </Button>
                            )}
                          </div>
                          {config.logo && (
                            <div className="rounded-lg overflow-hidden bg-muted border border-border">
                              <img
                                src={config.logo}
                                alt="Logo"
                                className="h-16 w-full object-contain"
                              />
                            </div>
                          )}

                          <Separator />

                          <div className="flex items-center justify-between">
                            <span className="text-sm">{t.config.users}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1"
                              onClick={() => setConfigSection("users")}
                            >
                              <UserPlus className="h-4 w-4" />
                              {t.config.addUser}
                            </Button>
                          </div>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            {config.users.map((u) => (
                              <li
                                key={u.id}
                                className="flex items-center gap-2 group"
                              >
                                <User className="h-4 w-4 flex-shrink-0" />
                                <span className="flex-1 min-w-0 truncate">
                                  {u.name}
                                  {u.isAdmin && (
                                    <span className="ml-1.5 text-xs bg-primary/20 text-primary px-1.5 rounded">
                                      {t.config.admin}
                                    </span>
                                  )}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-foreground"
                                  onClick={() => setEditingUserId(u.id)}
                                  aria-label={t.common.edit}
                                >
                                  <Settings2 className="h-4 w-4" />
                                </Button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <Separator />
                    </>
                  )}
                </>
              )}

              {configSection === "users" && isAdmin && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mb-2 -mt-2"
                    onClick={() => setConfigSection("main")}
                  >
                    ← {t.common.back}
                  </Button>

                  {config.users.map((user) => (
                    <UserCard
                      key={user.id}
                      user={user}
                      t={t}
                      onUpdate={(updates) => updateUser(user.id, updates)}
                      onRemove={() => config.users.length > 1 && removeUser(user.id)}
                      canRemove={config.users.length > 1}
                      featureKeys={FEATURE_KEYS}
                      onToggle={(key, value) => updateUserSetting(user.id, key, value)}
                      onGenerateQR={async () => {
                        try {
                          const { token } = await configApi.regenerateToken(user.id)
                          const url =
                            typeof window !== "undefined"
                              ? `${window.location.origin}${window.location.pathname}?user=${user.id}&token=${token}`
                              : ""
                          const dataUrl = await QRCode.toDataURL(url, { width: 256 })
                          setQrModal({ dataUrl, userName: user.name })
                        } catch (_e) {}
                      }}
                    />
                  ))}

                  <Separator />
                  <Label className="text-sm font-medium">{t.config.addUser}</Label>
                  <div className="space-y-2 rounded-lg border border-border p-3 bg-muted/30">
                    <div className="flex gap-2">
                      <Input
                        placeholder={t.config.userName}
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        {t.config.password}
                      </Label>
                      <Input
                        type="password"
                        placeholder={t.config.passwordPlaceholder}
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        className="h-9 mt-0.5"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="new-admin"
                        checked={newUserAdmin}
                        onCheckedChange={setNewUserAdmin}
                      />
                      <Label htmlFor="new-admin" className="text-sm">
                        {t.config.admin}
                      </Label>
                    </div>
                    <div className="space-y-1.5">
                      {FEATURE_KEYS.map(({ key, labelKey, icon: Icon }) => (
                        <div
                          key={key}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            {t.settings[labelKey]}
                          </span>
                          <Switch
                            checked={newUserScreens[key]}
                            onCheckedChange={(v) =>
                              setNewUserScreens((s) => ({ ...s, [key]: v }))
                            }
                          />
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full gap-1"
                      onClick={handleAddUser}
                    >
                      <UserPlus className="h-4 w-4" />
                      {t.config.addUser}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Modal editar un solo usuario */}
          {editingUserId && (() => {
            const editingUser = config.users.find((u) => u.id === editingUserId)
            if (!editingUser) return null
            return (
              <div
                className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60"
                onClick={() => setEditingUserId(null)}
              >
                <div
                  className="w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-lg bg-card border border-border shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between p-3 border-b border-border sticky top-0 bg-card">
                    <span className="font-semibold text-sm">{editingUser.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEditingUserId(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="p-3">
                    <UserCard
                      user={editingUser}
                      t={t}
                      onUpdate={(updates) => updateUser(editingUser.id, updates)}
                      onRemove={() => {
                        if (config.users.length > 1) {
                          removeUser(editingUser.id)
                          setEditingUserId(null)
                        }
                      }}
                      canRemove={config.users.length > 1}
                      featureKeys={FEATURE_KEYS}
                      onToggle={(key, value) =>
                        updateUserSetting(editingUser.id, key, value)
                      }
                      onGenerateQR={async () => {
                        try {
                          const { token } = await configApi.regenerateToken(editingUser.id)
                          const url =
                            typeof window !== "undefined"
                              ? `${window.location.origin}${window.location.pathname}?user=${editingUser.id}&token=${token}`
                              : ""
                          const dataUrl = await QRCode.toDataURL(url, { width: 256 })
                          setQrModal({ dataUrl, userName: editingUser.name })
                        } catch (_e) {}
                      }}
                    />
                  </div>
                </div>
              </div>
            )
          })()}

          {/* Modal QR */}
          {qrModal && (
            <div
              className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60"
              onClick={() => setQrModal(null)}
            >
              <Card
                className="max-w-xs w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <QrCode className="h-5 w-5" />
                      {t.config.generateQR}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQrModal(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {qrModal.userName}
                  </p>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-3 pb-6">
                  <img
                    src={qrModal.dataUrl}
                    alt="QR de acceso"
                    className="w-64 h-64 rounded border border-border"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    {t.config.qrHelp}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </>
  )
}

function UserCard({
  user,
  t,
  onUpdate,
  onRemove,
  canRemove,
  featureKeys,
  onToggle,
  onGenerateQR,
}: {
  user: UserConfig
  t: ReturnType<typeof useTranslations>
  onUpdate: (updates: Partial<UserConfig> & { password?: string }) => void | Promise<void>
  onRemove: () => void
  canRemove: boolean
  featureKeys: typeof FEATURE_KEYS
  onToggle: (key: keyof UserConfig, value: boolean) => void
  onGenerateQR: () => void | Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user.name)
  const [passwordInput, setPasswordInput] = useState("")
  const [settingPassword, setSettingPassword] = useState(false)
  useEffect(() => {
    setName(user.name)
  }, [user.name])

  const handleSetPassword = async () => {
    if (!passwordInput.trim()) return
    setSettingPassword(true)
    try {
      await onUpdate({ password: passwordInput.trim() })
      setPasswordInput("")
    } finally {
      setSettingPassword(false)
    }
  }

  return (
    <Card className="border-border">
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          {editing ? (
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => {
                if (name.trim()) onUpdate({ name: name.trim() })
                setEditing(false)
              }}
              className="h-8 flex-1"
              autoFocus
            />
          ) : (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-medium truncate">{user.name}</span>
              {user.isAdmin && (
                <span className="text-xs bg-primary/20 text-primary px-1.5 rounded flex-shrink-0">
                  {t.config.admin}
                </span>
              )}
            </div>
          )}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setEditing(true)}
            >
              {t.common.edit}
            </Button>
            {canRemove && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={onRemove}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t.config.admin}</span>
          <Switch
            checked={user.isAdmin}
            onCheckedChange={(v) => onUpdate({ isAdmin: v })}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">
            {t.config.password}
          </Label>
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder={t.config.passwordPlaceholder}
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="h-8 flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              disabled={!passwordInput.trim() || settingPassword}
              onClick={handleSetPassword}
            >
              {t.config.setPassword}
            </Button>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2"
          onClick={() => onGenerateQR()}
        >
          <QrCode className="h-4 w-4" />
          {t.config.generateQR}
        </Button>
        <div className="space-y-1.5">
          {featureKeys.map(({ key, labelKey, icon: Icon }) => (
            <div
              key={key}
              className="flex items-center justify-between text-sm"
            >
              <span className="flex items-center gap-2 text-muted-foreground">
                <Icon className="h-4 w-4" />
                {t.settings[labelKey]}
              </span>
              <Switch
                checked={user[key]}
                onCheckedChange={(v) => onToggle(key, v)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
