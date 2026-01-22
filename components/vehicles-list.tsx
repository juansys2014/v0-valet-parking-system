"use client"

import React from "react"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Car, Search, Clock, MapPin, Bell, ArrowRight, Truck } from 'lucide-react'
import { useActiveVehicles, useVehicleHistory, useVehicleActions } from '@/hooks/use-store'
import { VehicleDetails } from '@/components/vehicle-details'
import type { Vehicle } from '@/lib/types'

interface VehiclesListProps {
  showHistory?: boolean
}

function formatTime(date: Date) {
  return new Date(date).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatDateTime(date: Date) {
  return new Date(date).toLocaleString('es-AR', {
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
  const activeVehicles = useActiveVehicles()
  const historyVehicles = useVehicleHistory()
  const { updateStatus } = useVehicleActions()
  const [search, setSearch] = useState('')
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)

  // Para activos: solo mostrar estacionados
  // Para historial: mostrar todos los entregados
  const vehicles = showHistory 
    ? historyVehicles 
    : activeVehicles.filter(v => v.status === 'parked')

  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = 
      v.ticketCode.toLowerCase().includes(search.toLowerCase()) ||
      v.licensePlate.toLowerCase().includes(search.toLowerCase())
    
    return matchesSearch
  })

  // Sort by check-in time (most recent first) for active, by delivery time for history
  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    if (showHistory) {
      const aTime = a.deliveredTime ? new Date(a.deliveredTime).getTime() : 0
      const bTime = b.deliveredTime ? new Date(b.deliveredTime).getTime() : 0
      return bTime - aTime
    }
    return new Date(b.checkinTime).getTime() - new Date(a.checkinTime).getTime()
  })

  const handleRequestVehicle = (e: React.MouseEvent, vehicle: Vehicle) => {
    e.stopPropagation()
    updateStatus(vehicle.id, 'requested')
  }

  if (selectedVehicle) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setSelectedVehicle(null)} className="gap-2">
          <ArrowRight className="h-4 w-4 rotate-180" />
          Volver a la lista
        </Button>
        <VehicleDetails 
          vehicle={selectedVehicle} 
          onStatusChange={(v) => {
            setSelectedVehicle(v)
            if (v.status === 'delivered') {
              setSelectedVehicle(null)
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
                  Historial de Entregas
                </>
              ) : (
                <>
                  <Car className="h-5 w-5" />
                  Vehículos Estacionados
                  <Badge variant="secondary" className="ml-2">
                    {vehicles.length}
                  </Badge>
                </>
              )}
            </CardTitle>
            <CardDescription className="mt-1">
              {showHistory 
                ? 'Registro de todos los vehículos entregados'
                : 'Lista de vehículos actualmente en el valet parking'
              }
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por ticket o patente..."
            className="pl-9"
          />
        </div>

        {/* Vehicle List */}
        {sortedVehicles.length === 0 ? (
          <div className="text-center py-8">
            <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {search 
                ? 'No se encontraron vehículos' 
                : showHistory 
                  ? 'No hay historial aún'
                  : 'No hay vehículos estacionados'
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
                      </div>
                      <p className="text-xl font-semibold text-foreground">
                        {vehicle.licensePlate}
                      </p>
                      {showHistory ? (
                        /* Vista para historial con fechas completas */
                        <div className="mt-2 space-y-1 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            <span>Entrada: {formatDateTime(vehicle.checkinTime)}</span>
                          </div>
                          {vehicle.deliveredTime && (
                            <>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Truck className="h-3 w-3 flex-shrink-0" />
                                <span>Salida: {formatDateTime(vehicle.deliveredTime)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-primary font-medium">
                                <span className="ml-5">Duración: {getDuration(vehicle.checkinTime, vehicle.deliveredTime)}</span>
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
                        /* Vista para activos */
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(vehicle.checkinTime)}
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

                    {/* Botón de solicitar (solo para activos, no historial) */}
                    {!showHistory && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={(e) => handleRequestVehicle(e, vehicle)}
                        className="gap-2 flex-shrink-0"
                      >
                        <Bell className="h-4 w-4" />
                        Solicitar
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
