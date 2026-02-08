"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Menu, LogIn, LogOut, List, Bell, Clock, Globe, RotateCcw, X } from 'lucide-react'
import { useSettings } from '@/lib/settings/context'
import { useTranslations, useLanguage } from '@/lib/i18n/context'

export function SettingsMenu() {
  const [open, setOpen] = useState(false)
  const { settings, updateSetting, resetSettings, enabledCount } = useSettings()
  const t = useTranslations()
  const { language, setLanguage } = useLanguage()

  const features = [
    { key: 'showCheckin' as const, label: t.settings.showEntry, icon: LogIn },
    { key: 'showCheckout' as const, label: t.settings.showExit, icon: LogOut },
    { key: 'showVehicles' as const, label: t.settings.showActive, icon: List },
    { key: 'showAlerts' as const, label: t.settings.showAlerts, icon: Bell },
    { key: 'showHistory' as const, label: t.settings.showHistory, icon: Clock },
  ]

  const activeCount = enabledCount

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">{t.settings.title}</span>
      </Button>

      {/* Overlay y Menu */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          
          {/* Menu Card */}
          <Card className="relative z-10 w-full max-w-sm mx-4 mt-16 shadow-xl animate-in fade-in slide-in-from-top-4 duration-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Menu className="h-5 w-5" />
                  {t.settings.title}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-5 pb-6">
              {/* Idioma */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  {t.settings.language}
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={language === 'es' ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => setLanguage('es')}
                    className={`h-11 ${language === 'es' ? '' : 'bg-transparent'}`}
                  >
                    Espanol
                  </Button>
                  <Button
                    variant={language === 'en' ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => setLanguage('en')}
                    className={`h-11 ${language === 'en' ? '' : 'bg-transparent'}`}
                  >
                    English
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Funciones visibles */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  {t.settings.visibleFeatures}
                </Label>
                
                <div className="space-y-2">
                  {features.map(({ key, label, icon: Icon }) => {
                    const disabled = activeCount <= 1 && settings[key]
                    const handleActivate = () => {
                      if (disabled) return
                      updateSetting(key, !settings[key])
                    }
                    const stopPropagation = (e: React.MouseEvent | React.PointerEvent) => e.stopPropagation()
                    return (
                      <div
                        key={key}
                        role="button"
                        aria-disabled={disabled}
                        tabIndex={disabled ? -1 : 0}
                        className={`flex items-center justify-between w-full py-3 px-3 rounded-lg bg-muted/50 transition-colors touch-manipulation outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-muted active:bg-muted'}`}
                        onClick={handleActivate}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            handleActivate()
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                          <span className="text-sm">{label}</span>
                        </div>
                        <Switch
                          checked={settings[key]}
                          onCheckedChange={(checked) => updateSetting(key, checked)}
                          disabled={disabled}
                          onClick={stopPropagation}
                          onPointerDown={stopPropagation}
                        />
                      </div>
                    )
                  })}
                </div>

                {activeCount <= 1 && (
                  <p className="text-xs text-muted-foreground text-center">
                    Debe haber al menos una funcion activa
                  </p>
                )}
              </div>

              <Separator />

              {/* Restaurar */}
              <Button 
                variant="outline" 
                onClick={() => {
                  resetSettings()
                }}
                className="w-full h-11 gap-2 bg-transparent"
              >
                <RotateCcw className="h-4 w-4" />
                {t.settings.reset}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
