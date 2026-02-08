"use client"

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Car, 
  LogIn, 
  LogOut, 
  List, 
  Clock, 
  Bell
} from 'lucide-react'
import { useNavCounts } from '@/hooks/use-nav-counts'
import { useTranslations } from '@/lib/i18n/context'
import { useSettings } from '@/lib/settings/context'

export type TabType = 'checkin' | 'checkout' | 'vehicles' | 'notifications' | 'history'

interface NavigationProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const { parkedCount, alertsCount } = useNavCounts()
  const t = useTranslations()
  const { settings } = useSettings()

  const allTabs: { id: TabType; label: string; icon: typeof Car; badge?: number; settingKey: keyof typeof settings }[] = [
    { id: 'checkin', label: t.nav.entry, icon: LogIn, settingKey: 'showCheckin' },
    { id: 'checkout', label: t.nav.exit, icon: LogOut, settingKey: 'showCheckout' },
    { id: 'vehicles', label: t.nav.active, icon: List, badge: parkedCount || undefined, settingKey: 'showVehicles' },
    { id: 'notifications', label: t.nav.alerts, icon: Bell, badge: alertsCount || undefined, settingKey: 'showAlerts' },
    { id: 'history', label: t.nav.history, icon: Clock, settingKey: 'showHistory' },
  ]

  // Filtrar solo las pestanas habilitadas
  const tabs = allTabs.filter(tab => settings[tab.settingKey])

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 safe-area-inset-bottom">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          
          return (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center gap-1 h-14 rounded-none relative ${
                isActive 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {tab.badge && tab.badge > 0 && (
                  <Badge 
                    className="absolute -top-2 -right-2 h-4 min-w-4 p-0 flex items-center justify-center text-[10px] bg-destructive text-destructive-foreground"
                  >
                    {tab.badge}
                  </Badge>
                )}
              </div>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Button>
          )
        })}
      </div>
    </nav>
  )
}
