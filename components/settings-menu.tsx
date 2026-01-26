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
      <SheetContent side="right" className="w-[300px] sm:w-[340px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Menu className="h-5 w-5" />
            {t.settings.title}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Idioma */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4" />
              {t.settings.language}
            </Label>
            <div className="flex gap-2">
              <Button
                variant={language === 'es' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLanguage('es')}
                className={language === 'es' ? '' : 'bg-transparent'}
              >
                Espanol
              </Button>
              <Button
                variant={language === 'en' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLanguage('en')}
                className={language === 'en' ? '' : 'bg-transparent'}
              >
                English
              </Button>
            </div>
          </div>

          <Separator />

          {/* Funciones visibles */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">
              {t.settings.visibleFeatures}
            </Label>
            
            <div className="space-y-3">
              {features.map(({ key, label, icon: Icon }) => (
                <div 
                  key={key} 
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{label}</span>
                  </div>
                  <Switch
                    checked={settings[key]}
                    onCheckedChange={(checked) => updateSetting(key, checked)}
                    disabled={activeCount <= 1 && settings[key]}
                  />
                </div>
              ))}
            </div>

            {activeCount <= 1 && (
              <p className="text-xs text-muted-foreground">
                Debe haber al menos una funcion activa
              </p>
            )}
          </div>

          <Separator />

          {/* Restaurar */}
          <Button 
            variant="outline" 
            onClick={resetSettings}
            className="w-full gap-2 bg-transparent"
          >
            <RotateCcw className="h-4 w-4" />
            {t.settings.reset}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
