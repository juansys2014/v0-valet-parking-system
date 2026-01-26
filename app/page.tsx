"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Car, Database } from 'lucide-react'
import { Navigation, type TabType } from '@/components/navigation'
import { CheckinForm } from '@/components/checkin-form'
import { CheckoutForm } from '@/components/checkout-form'
import { VehiclesList } from '@/components/vehicles-list'
import { NotificationsPanel } from '@/components/notifications-panel'
import { SettingsMenu } from '@/components/settings-menu'
import { useInitDemo, useActiveVehicles } from '@/hooks/use-store'
import { useTranslations } from '@/lib/i18n/context'
import { useSettings } from '@/lib/settings/context'

export default function ValetParkingApp() {
  const [activeTab, setActiveTab] = useState<TabType>('checkin')
  const [mounted, setMounted] = useState(false)
  const initDemo = useInitDemo()
  const activeVehicles = useActiveVehicles()
  const t = useTranslations()
  const { settings } = useSettings()

  // Encontrar la primera pestana activa si la actual esta deshabilitada
  useEffect(() => {
    const tabSettings: Record<TabType, boolean> = {
      checkin: settings.showCheckin,
      checkout: settings.showCheckout,
      vehicles: settings.showVehicles,
      notifications: settings.showAlerts,
      history: settings.showHistory,
    }

    if (!tabSettings[activeTab]) {
      const firstActive = (Object.keys(tabSettings) as TabType[]).find(tab => tabSettings[tab])
      if (firstActive) {
        setActiveTab(firstActive)
      }
    }
  }, [settings, activeTab])

  useEffect(() => {
    setMounted(true)
  }, [])

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

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-card border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Car className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-foreground text-lg leading-tight">{t.header.title}</h1>
                <p className="text-xs text-muted-foreground">
                  {activeVehicles.length} {t.header.subtitle.toLowerCase()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              {activeVehicles.length === 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={initDemo}
                  className="text-xs gap-1"
                >
                  <Database className="h-3 w-3" />
                  Demo
                </Button>
              )}
              <SettingsMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-6">
        {activeTab === 'checkin' && settings.showCheckin && <CheckinForm />}
        {activeTab === 'checkout' && settings.showCheckout && <CheckoutForm />}
        {activeTab === 'vehicles' && settings.showVehicles && <VehiclesList />}
        {activeTab === 'notifications' && settings.showAlerts && <NotificationsPanel />}
        {activeTab === 'history' && settings.showHistory && <VehiclesList showHistory />}
      </main>

      {/* Bottom Navigation */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
