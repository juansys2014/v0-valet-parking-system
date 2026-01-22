"use client"

import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { QrCode, Search, Car, Clock, MapPin, ArrowRight, Bell, AlertCircle } from 'lucide-react'
import { QRScanner } from '@/components/qr-scanner'
import { useActiveVehicles, useVehicleActions } from '@/hooks/use-store'
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

function getStatusInfo(status: Vehicle['status']) {
  switch (status) {
    case 'parked':
      return { label: 'Estacionado', color: 'bg-primary/10 text-primary' }
    case 'requested':
      return { label: 'Solicitado', color: 'bg-amber-500/10 text-amber-600' }
    case 'ready':
      return { label: 'Listo', color: 'bg-emerald-500/10 text-emerald-600' }
    default:
      return { label: status, color: 'bg-muted text-muted-foreground' }
  }
}

export function CheckoutForm() {
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [pendingVehicle, setPendingVehicle] = useState<Vehicle | null>(null)
  const [confirmedVehicle, setConfirmedVehicle] = useState<Vehicle | null>(null)

  const activeVehicles = useActiveVehicles()
  const { updateStatus } = useVehicleActions()

  // Auto-cerrar mensaje de confirmación después de 3 segundos
  useEffect(() => {
    if (confirmedVehicle) {
      const timer = setTimeout(() => {
        setConfirmedVehicle(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [confirmedVehicle])

  // Solo mostrar vehículos estacionados (no los ya solicitados o listos)
  const availableVehicles = useMemo(() => {
    return activeVehicles.filter(v => v.status === 'parked')
  }, [activeVehicles])

  // Filtrar vehículos por término de búsqueda
  const filteredVehicles = useMemo(() => {
    if (!searchTerm.trim()) return availableVehicles
    
    const term = searchTerm.toLowerCase().trim()
    return availableVehicles.filter(v => 
      v.ticketCode.toLowerCase().includes(term) ||
      v.licensePlate.toLowerCase().includes(term)
    )
  }, [availableVehicles, searchTerm])

  const handleQRScan = (code: string) => {
    setShowQRScanner(false)
    const found = availableVehicles.find(v => v.ticketCode === code)
    if (found) {
      setPendingVehicle(found)
    } else {
      setSearchTerm(code)
    }
  }

  const handleSelectVehicle = (vehicle: Vehicle) => {
    setPendingVehicle(vehicle)
  }

  const handleConfirmRequest = () => {
    if (!pendingVehicle) return
    updateStatus(pendingVehicle.id, 'requested')
    setConfirmedVehicle(pendingVehicle)
    setPendingVehicle(null)
  }

  const handleCancelPending = () => {
    setPendingVehicle(null)
  }

  const handleReset = () => {
    setConfirmedVehicle(null)
    setPendingVehicle(null)
    setSearchTerm('')
  }

  // Vista de confirmación antes de solicitar
  if (pendingVehicle) {
    return (
      <div className="space-y-4">
        <Button 
          variant="ghost" 
          onClick={handleCancelPending}
          className="gap-2"
        >
          <ArrowRight className="h-4 w-4 rotate-180" />
          Cancelar
        </Button>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Confirmar Solicitud</h2>
                <p className="text-muted-foreground mt-1">Se enviara una alerta al personal</p>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4 text-left space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ticket</span>
                  <span className="font-mono font-bold">#{pendingVehicle.ticketCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Patente</span>
                  <span className="font-bold text-lg">{pendingVehicle.licensePlate}</span>
                </div>
                {pendingVehicle.parkingSpot && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ubicacion</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {pendingVehicle.parkingSpot}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hora entrada</span>
                  <span>{formatTime(pendingVehicle.checkinTime)}</span>
                </div>
              </div>

              {pendingVehicle.notes && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-left">
                  <p className="text-sm text-amber-700 font-medium mb-1">Observaciones:</p>
                  <p className="text-sm text-foreground">{pendingVehicle.notes}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline"
                  onClick={handleCancelPending}
                  className="flex-1 bg-transparent"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleConfirmRequest}
                  className="flex-1 gap-2"
                >
                  <Bell className="h-4 w-4" />
                  Confirmar Solicitud
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Vista principal con lista (y mensaje de confirmacion si hay uno confirmado)
  return (
    <>
      {showQRScanner && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => setShowQRScanner(false)}
        />
      )}

      <div className="space-y-4">
        {/* Mensaje de confirmacion */}
        {confirmedVehicle && (
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bell className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">Solicitud enviada</p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-mono font-bold">#{confirmedVehicle.ticketCode}</span> - {confirmedVehicle.licensePlate}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Aparecera en Alertas para que el personal lo prepare
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Barra de busqueda */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Solicitar Vehiculo
            </CardTitle>
            <CardDescription>
              Busca por ticket o patente, o escanea el codigo QR
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por ticket o patente..."
                  className="pl-9 text-lg"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowQRScanner(true)}
                className="gap-2"
              >
                <QrCode className="h-5 w-5" />
                <span className="hidden sm:inline">Escanear</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de vehiculos disponibles */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <Label className="text-muted-foreground">
              Vehiculos disponibles ({filteredVehicles.length})
            </Label>
            {searchTerm && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSearchTerm('')}
                className="h-auto py-1 px-2 text-xs"
              >
                Limpiar filtro
              </Button>
            )}
          </div>

          {filteredVehicles.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {searchTerm ? (
                  <>
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No se encontraron vehiculos con "{searchTerm}"</p>
                  </>
                ) : (
                  <>
                    <Car className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No hay vehiculos disponibles para solicitar</p>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredVehicles.map((vehicle) => {
                const status = getStatusInfo(vehicle.status)
                return (
                  <Card 
                    key={vehicle.id}
                    className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all"
                    onClick={() => handleSelectVehicle(vehicle)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-lg">
                              #{vehicle.ticketCode}
                            </span>
                            <Badge className={status.color}>
                              {status.label}
                            </Badge>
                          </div>
                          <p className="text-xl font-semibold text-foreground">
                            {vehicle.licensePlate}
                          </p>
                        </div>

                        <div className="text-right space-y-1">
                          <div className="flex items-center justify-end gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{formatTime(vehicle.checkinTime)}</span>
                            <span className="text-xs">({getElapsedTime(vehicle.checkinTime)})</span>
                          </div>
                          {vehicle.parkingSpot && (
                            <div className="flex items-center justify-end gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>{vehicle.parkingSpot}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {vehicle.notes && (
                        <p className="mt-2 text-sm text-warning line-clamp-1 border-t pt-2">
                          {vehicle.notes}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
