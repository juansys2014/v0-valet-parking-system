"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Menu, LogIn, LogOut, List, Bell, Clock, Globe, RotateCcw } from 'lucide-react'
import { useSettings } from '@/lib/settings/context'
import { useTranslations, useLanguage } from '@/lib/i18n/context'

export function SettingsMenu() {
  const [open, setOpen] = useState(false)
  const { settings, updateSetting, resetSettings } = useSettings()
  const t = useTranslations()
  const { language, setLanguage } = useLanguage()

  const features = [
    { key: 'showCheckin' as const, label: t.settings.showEntry, icon: LogIn },
    { key: 'showCheckout' as const, label: t.settings.showExit, icon: LogOut },
    { key: 'showVehicles' as const, label: t.settings.showActive, icon: List },
    { key: 'showAlerts' as const, label: t.settings.showAlerts, icon: Bell },
    { key: 'showHistory' as const, label: t.settings.showHistory, icon: Clock },
  ]

  // Contar cuantas funciones estan activas
  const activeCount = Object.values(settings).filter(Boolean).length

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Menu className="h-5 w-5" />
          <span className="sr-only">{t.settings.title}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-[100vw] sm:max-w-[340px] p-0 flex flex-col">
        <SheetHeader className="px-4 pt-4 pb-2 border-b">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <Menu className="h-5 w-5" />
            {t.settings.title}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
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
                className={`h-12 text-base ${language === 'es' ? '' : 'bg-transparent'}`}
              >
                Espanol
              </Button>
              <Button
                variant={language === 'en' ? 'default' : 'outline'}
                size="lg"
                onClick={() => setLanguage('en')}
                className={`h-12 text-base ${language === 'en' ? '' : 'bg-transparent'}`}
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
              {features.map(({ key, label, icon: Icon }) => (
                <button
                  type="button"
                  key={key} 
                  className="flex items-center justify-between w-full py-3 px-4 rounded-lg bg-muted/50 active:bg-muted transition-colors touch-manipulation"
                  onClick={() => {
                    if (!(activeCount <= 1 && settings[key])) {
                      updateSetting(key, !settings[key])
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-base">{label}</span>
                  </div>
                  <Switch
                    checked={settings[key]}
                    onCheckedChange={(checked) => updateSetting(key, checked)}
                    disabled={activeCount <= 1 && settings[key]}
                    className="pointer-events-none"
                  />
                </button>
              ))}
            </div>

            {activeCount <= 1 && (
              <p className="text-xs text-muted-foreground text-center">
                Debe haber al menos una funcion activa
              </p>
            )}
          </div>
        </div>

        {/* Footer fijo */}
        <div className="border-t px-4 py-4 mt-auto">
          <Button 
            variant="outline" 
            onClick={resetSettings}
            className="w-full h-12 gap-2 bg-transparent text-base"
          >
            <RotateCcw className="h-5 w-5" />
            {t.settings.reset}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
