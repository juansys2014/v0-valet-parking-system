"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, Car, Clock, MapPin, User, CheckCircle2, Truck, 
  AlertTriangle, ArrowRight
} from 'lucide-react'
import { useActiveVehicles, useVehicleActions } from '@/hooks/use-store'
import { VehicleDetails } from '@/components/vehicle-details'
import type { Vehicle } from '@/lib/types'

function formatTime(date: Date) {
  return new Date(date).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit'
  })
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

export function NotificationsPanel() {
  const activeVehicles = useActiveVehicles()
  const { updateStatus } = useVehicleActions()
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [attendantNames, setAttendantNames] = useState<Record<string, string>>({})

  // Filtrar vehículos solicitados y listos
  const requestedVehicles = activeVehicles.filter(v => v.status === 'requested')
  const readyVehicles = activeVehicles.filter(v => v.status === 'ready')
  const alertVehicles = [...requestedVehicles, ...readyVehicles]

  const handleMarkReady = (vehicleId: string) => {
    const name = attendantNames[vehicleId] || undefined
    updateStatus(vehicleId, 'ready', name)
  }

  const handleMarkDelivered = (vehicleId: string) => {
    const name = attendantNames[vehicleId] || undefined
    updateStatus(vehicleId, 'delivered', name)
  }

  const updateAttendantName = (vehicleId: string, name: string) => {
    setAttendantNames(prev => ({ ...prev, [vehicleId]: name }))
  }

  if (selectedVehicle) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setSelectedVehicle(null)} className="gap-2">
          <ArrowRight className="h-4 w-4 rotate-180" />
          Volver a alertas
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
            <p className="text-lg font-medium text-foreground">No hay alertas pendientes</p>
            <p className="text-muted-foreground mt-1">
              Los vehículos solicitados aparecerán aquí
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Vehículos Solicitados (pendientes de preparar) */}
      {requestedVehicles.length > 0 && (
        <Card className="border-warning/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-warning">
              <Bell className="h-5 w-5" />
              Vehículos Solicitados
              <Badge className="bg-warning text-warning-foreground ml-2">
                {requestedVehicles.length}
              </Badge>
            </CardTitle>
            <CardDescription>
              Clientes esperando - preparar estos vehículos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {requestedVehicles.map((vehicle) => (
              <Card key={vehicle.id} className="bg-warning/5 border-warning/30">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Info del vehículo */}
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
                            Solicitado
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
                            Solicitado hace {getElapsedTime(vehicle.requestedTime || vehicle.checkinTime)}
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

                    {/* Acciones */}
                    <div className="flex items-center gap-2 pt-2 border-t border-warning/30">
                      <div className="flex-1">
                        <Input
                          value={attendantNames[vehicle.id] || ''}
                          onChange={(e) => updateAttendantName(vehicle.id, e.target.value)}
                          placeholder="Tu nombre (opcional)"
                          className="h-9 text-sm"
                        />
                      </div>
                      <Button
                        onClick={() => handleMarkReady(vehicle.id)}
                        className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Listo
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Vehículos Listos (pendientes de entregar) */}
      {readyVehicles.length > 0 && (
        <Card className="border-accent/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-accent">
              <CheckCircle2 className="h-5 w-5" />
              Vehículos Listos
              <Badge className="bg-accent text-accent-foreground ml-2">
                {readyVehicles.length}
              </Badge>
            </CardTitle>
            <CardDescription>
              Listos para entregar al cliente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {readyVehicles.map((vehicle) => (
              <Card key={vehicle.id} className="bg-accent/5 border-accent/30">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Info del vehículo */}
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
                            Listo
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
                              Preparado por {vehicle.deliveryAttendant}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2 pt-2 border-t border-accent/30">
                      <div className="flex-1">
                        <Input
                          value={attendantNames[vehicle.id] || ''}
                          onChange={(e) => updateAttendantName(vehicle.id, e.target.value)}
                          placeholder="Tu nombre (opcional)"
                          className="h-9 text-sm"
                        />
                      </div>
                      <Button
                        onClick={() => handleMarkDelivered(vehicle.id)}
                        className="gap-2"
                      >
                        <Truck className="h-4 w-4" />
                        Entregado
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
