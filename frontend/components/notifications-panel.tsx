"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, Car, Clock, MapPin, User, CheckCircle2, Truck, 
  AlertTriangle, ArrowRight
} from 'lucide-react'
import { VehicleDetails } from '@/components/vehicle-details'
import { useTranslations } from '@/lib/i18n/context'
import { useNotificationSound } from '@/hooks/use-notification-sound'
import { getAlerts, markReady, markDelivered, ticketToVehicle } from "@/lib/api/endpoints"
import type { Vehicle } from "@/lib/types"

const ALERTS_POLL_INTERVAL_MS = 5000

function getElapsedTime(date: Date) {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  }
  return `${minutes}m`
}

export function NotificationsPanel() {
  const [requestedVehicles, setRequestedVehicles] = useState<Vehicle[]>([])
  const [readyVehicles, setReadyVehicles] = useState<Vehicle[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [attendantNames, setAttendantNames] = useState<Record<string, string>>({})
  const seenAlertIdsRef = useRef<Set<string>>(new Set())
  const t = useTranslations()
  const { playSound } = useNotificationSound()

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await getAlerts()
      const requested = res.requested.map(ticketToVehicle)
      const ready = res.ready.map(ticketToVehicle)
      const allIds = new Set([...requested.map(v => v.id), ...ready.map(v => v.id)])
      const seen = seenAlertIdsRef.current
      const hasNew = [...allIds].some(id => !seen.has(id))
      if (hasNew && seen.size > 0) {
        playSound('alert')
      }
      allIds.forEach(id => seen.add(id))
      setRequestedVehicles(requested)
      setReadyVehicles(ready)
    } catch {
      setRequestedVehicles([])
      setReadyVehicles([])
    }
  }, [playSound])

  useEffect(() => {
    fetchAlerts()
    const interval = setInterval(fetchAlerts, ALERTS_POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [fetchAlerts])

  const alertVehicles = [...requestedVehicles, ...readyVehicles]

  const handleMarkReady = async (vehicleId: string) => {
    const name = attendantNames[vehicleId] || undefined
    try {
      const res = await markReady(vehicleId, name)
      const updated = ticketToVehicle(res.ticket)
      if (selectedVehicle?.id === vehicleId) setSelectedVehicle(updated)
      await fetchAlerts()
    } catch {
      // opcional: mostrar error
    }
  }

  const handleMarkDelivered = async (vehicleId: string) => {
    const name = attendantNames[vehicleId] || undefined
    try {
      const res = await markDelivered(vehicleId, name)
      const updated = ticketToVehicle(res.ticket)
      if (selectedVehicle?.id === vehicleId) setSelectedVehicle(null)
      await fetchAlerts()
    } catch {
      // opcional: mostrar error
    }
  }

  const updateAttendantName = (vehicleId: string, name: string) => {
    setAttendantNames(prev => ({ ...prev, [vehicleId]: name }))
  }

  if (selectedVehicle) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setSelectedVehicle(null)} className="gap-2">
          <ArrowRight className="h-4 w-4 rotate-180" />
          {t.common.back}
        </Button>
        <VehicleDetails 
          vehicle={selectedVehicle} 
          onStatusChange={(v) => {
            if (v.status === 'delivered') {
              setSelectedVehicle(null)
            } else {
              setSelectedVehicle(v)
            }
          }}
        />
      </div>
    )
  }

  if (alertVehicles.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground">{t.alerts.noAlerts}</p>
            <p className="text-muted-foreground mt-1">
              {t.alerts.allClear}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {requestedVehicles.length > 0 && (
        <Card className="border-warning/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-warning">
              <Bell className="h-5 w-5" />
              {t.alerts.requested}
              <Badge className="bg-warning text-warning-foreground ml-2">
                {requestedVehicles.length}
              </Badge>
            </CardTitle>
            <CardDescription>
              {t.alerts.requestedDesc}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {requestedVehicles.map((vehicle) => (
              <Card key={vehicle.id} className="bg-warning/5 border-warning/30">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div 
                      className="flex items-start justify-between cursor-pointer"
                      onClick={() => setSelectedVehicle(vehicle)}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-lg">
                            #{vehicle.ticketCode}
                          </span>
                          <Badge className="bg-warning text-warning-foreground">
                            {t.status.requested}
                          </Badge>
                        </div>
                        <p className="text-xl font-semibold text-foreground">
                          {vehicle.licensePlate}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          {vehicle.parkingSpot && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {vehicle.parkingSpot}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {t.alerts.waitingTime} {getElapsedTime(vehicle.requestedTime || vehicle.checkinTime)}
                          </span>
                        </div>
                        {vehicle.notes && (
                          <p className="text-sm text-warning flex items-center gap-1 mt-1">
                            <AlertTriangle className="h-3 w-3" />
                            {vehicle.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-warning/30">
                      <div className="flex-1">
                        <Input
                          value={attendantNames[vehicle.id] || ''}
                          onChange={(e) => updateAttendantName(vehicle.id, e.target.value)}
                          placeholder={`${t.alerts.yourName} (${t.common.optional})`}
                          className="h-9 text-sm"
                        />
                      </div>
                      <Button
                        onClick={() => handleMarkReady(vehicle.id)}
                        className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {t.alerts.markReady}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {readyVehicles.length > 0 && (
        <Card className="border-accent/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-accent">
              <CheckCircle2 className="h-5 w-5" />
              {t.alerts.ready}
              <Badge className="bg-accent text-accent-foreground ml-2">
                {readyVehicles.length}
              </Badge>
            </CardTitle>
            <CardDescription>
              {t.alerts.readyDesc}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {readyVehicles.map((vehicle) => (
              <Card key={vehicle.id} className="bg-accent/5 border-accent/30">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div 
                      className="flex items-start justify-between cursor-pointer"
                      onClick={() => setSelectedVehicle(vehicle)}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-lg">
                            #{vehicle.ticketCode}
                          </span>
                          <Badge className="bg-accent text-accent-foreground">
                            {t.status.ready}
                          </Badge>
                        </div>
                        <p className="text-xl font-semibold text-foreground">
                          {vehicle.licensePlate}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          {vehicle.parkingSpot && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {vehicle.parkingSpot}
                            </span>
                          )}
                          {vehicle.deliveryAttendant && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {vehicle.deliveryAttendant}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-accent/30">
                      <div className="flex-1">
                        <Input
                          value={attendantNames[vehicle.id] || ''}
                          onChange={(e) => updateAttendantName(vehicle.id, e.target.value)}
                          placeholder={`${t.alerts.yourName} (${t.common.optional})`}
                          className="h-9 text-sm"
                        />
                      </div>
                      <Button
                        onClick={() => handleMarkDelivered(vehicle.id)}
                        className="gap-2"
                      >
                        <Truck className="h-4 w-4" />
                        {t.alerts.confirmDelivery}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
