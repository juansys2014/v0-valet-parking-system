"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Car, Search, Clock, MapPin, Bell, ArrowRight, Truck } from 'lucide-react'
import { VehicleDetails } from '@/components/vehicle-details'
import { useTranslations } from '@/lib/i18n/context'
import { getActive, getHistory, checkoutRequest, ticketToVehicle } from "@/lib/api/endpoints"
import type { Vehicle } from "@/lib/types"

interface VehiclesListProps {
  showHistory?: boolean
}

function formatTime(date: Date, locale: string) {
  return new Date(date).toLocaleTimeString(locale === 'es' ? 'es-ES' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatDateTime(date: Date, locale: string) {
  return new Date(date).toLocaleString(locale === 'es' ? 'es-ES' : 'en-US', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getDuration(start: Date, end: Date) {
  const diff = new Date(end).getTime() - new Date(start).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  }
  return `${minutes}m`
}

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

export function VehiclesList({ showHistory = false }: VehiclesListProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [search, setSearch] = useState('')
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const t = useTranslations()

  const loadList = useCallback(async () => {
    try {
      if (showHistory) {
        const res = await getHistory(search.trim() || undefined)
        setVehicles(res.tickets.map(ticketToVehicle))
      } else {
        const res = await getActive(search.trim() || undefined)
        setVehicles(res.tickets.map(ticketToVehicle))
      }
    } catch {
      setVehicles([])
    }
  }, [showHistory, search])

  useEffect(() => {
    loadList()
  }, [loadList])

  const filteredVehicles = showHistory
    ? vehicles
    : vehicles.filter(v => v.status === 'parked')
  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    if (showHistory) {
      const aTime = a.deliveredTime ? new Date(a.deliveredTime).getTime() : 0
      const bTime = b.deliveredTime ? new Date(b.deliveredTime).getTime() : 0
      return bTime - aTime
    }
    return new Date(b.checkinTime).getTime() - new Date(a.checkinTime).getTime()
  })

  const handleRequestVehicle = async (e: React.MouseEvent, vehicle: Vehicle) => {
    e.stopPropagation()
    try {
      await checkoutRequest(vehicle.id)
      await loadList()
    } catch {
      // opcional: mostrar error
    }
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
            setSelectedVehicle(v)
            if (v.status === 'delivered') {
              setSelectedVehicle(null)
              loadList()
            }
          }}
        />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {showHistory ? (
                <>
                  <Clock className="h-5 w-5" />
                  {t.vehicles.historyTitle}
                </>
              ) : (
                <>
                  <Car className="h-5 w-5" />
                  {t.vehicles.title}
                  <Badge variant="secondary" className="ml-2">
                    {vehicles.length}
                  </Badge>
                </>
              )}
            </CardTitle>
            <CardDescription className="mt-1">
              {showHistory 
                ? t.vehicles.historySubtitle
                : t.vehicles.subtitle
              }
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.vehicles.searchPlaceholder}
            className="pl-9"
          />
        </div>

        {sortedVehicles.length === 0 ? (
          <div className="text-center py-8">
            <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {search 
                ? t.common.noResults
                : showHistory 
                  ? t.vehicles.noHistory
                  : t.vehicles.noVehiclesParked
              }
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedVehicles.map((vehicle) => (
              <Card 
                key={vehicle.id}
                className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all"
                onClick={() => setSelectedVehicle(vehicle)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-lg">
                          #{vehicle.ticketCode}
                        </span>
                        {showHistory && vehicle.wasRegistered === false && (
                          <Badge variant="outline" className="text-amber-600 border-amber-300 text-xs">
                            {t.vehicles.quickExit}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xl font-semibold text-foreground">
                        {vehicle.licensePlate}
                      </p>
                      {showHistory ? (
                        <div className="mt-2 space-y-1 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            <span>{t.vehicles.entry}: {formatDateTime(vehicle.checkinTime, 'es')}</span>
                          </div>
                          {vehicle.deliveredTime && (
                            <>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Truck className="h-3 w-3 flex-shrink-0" />
                                <span>{t.vehicles.exit}: {formatDateTime(vehicle.deliveredTime, 'es')}</span>
                              </div>
                              <div className="flex items-center gap-2 text-primary font-medium">
                                <span className="ml-5">{t.vehicles.duration}: {getDuration(vehicle.checkinTime, vehicle.deliveredTime)}</span>
                              </div>
                            </>
                          )}
                          {vehicle.parkingSpot && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="h-3 w-3 flex-shrink-0" />
                              <span>{vehicle.parkingSpot}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(vehicle.checkinTime, 'es')}
                            <span className="text-xs">({getElapsedTime(vehicle.checkinTime)})</span>
                          </span>
                          {vehicle.parkingSpot && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {vehicle.parkingSpot}
                            </span>
                          )}
                        </div>
                      )}
                      {vehicle.notes && (
                        <p className="mt-2 text-sm text-warning line-clamp-1">
                          {vehicle.notes}
                        </p>
                      )}
                    </div>

                    {!showHistory && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={(e) => handleRequestVehicle(e, vehicle)}
                        className="gap-2 flex-shrink-0"
                      >
                        <Bell className="h-4 w-4" />
                        {t.vehicles.request}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
