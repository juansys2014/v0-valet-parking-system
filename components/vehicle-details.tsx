"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Car, Clock, MapPin, User, Camera, Video, Play, X,
  CheckCircle2, AlertTriangle, Bell, Truck
} from 'lucide-react'
import { useVehicleActions } from '@/hooks/use-store'
import type { Vehicle, VehicleStatus } from '@/lib/types'

interface VehicleDetailsProps {
  vehicle: Vehicle
  onStatusChange?: (vehicle: Vehicle) => void
  compact?: boolean
}

const statusConfig: Record<VehicleStatus, { label: string; color: string; icon: typeof Car }> = {
  parked: { label: 'Estacionado', color: 'bg-muted text-muted-foreground', icon: Car },
  requested: { label: 'Solicitado', color: 'bg-warning text-warning-foreground', icon: Bell },
  ready: { label: 'Listo', color: 'bg-accent text-accent-foreground', icon: CheckCircle2 },
  delivered: { label: 'Entregado', color: 'bg-primary text-primary-foreground', icon: Truck },
}

const getElapsedTimeBetween = (startDate: Date, endDate: Date) => {
  const diff = new Date(endDate).getTime() - new Date(startDate).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  }
  return `${minutes}m`
}

export function VehicleDetails({ vehicle, onStatusChange, compact = false }: VehicleDetailsProps) {
  const [attendantName, setAttendantName] = useState('')
  const [showMedia, setShowMedia] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const { updateStatus } = useVehicleActions()

  const photoCount = vehicle.media?.filter(m => m.type === 'photo').length || vehicle.photos?.length || 0
  const videoCount = vehicle.media?.filter(m => m.type === 'video').length || vehicle.videos?.length || 0
  const totalMediaCount = photoCount + videoCount

  const status = statusConfig[vehicle.status]
  const StatusIcon = status.icon

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('es-AR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-AR', { 
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getElapsedTime = (startDate: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(startDate).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    }
    return `${minutes}m`
  }

  const handleMarkReady = () => {
    const updated = updateStatus(vehicle.id, 'ready', attendantName || undefined)
    if (updated) onStatusChange?.(updated)
  }

  const handleMarkDelivered = () => {
    const updated = updateStatus(vehicle.id, 'delivered', attendantName || undefined)
    if (updated) onStatusChange?.(updated)
  }

  // Get all media items (photos and videos)
  const getAllMedia = () => {
    if (vehicle.media && vehicle.media.length > 0) {
      return vehicle.media
    }
    // Fallback to legacy photos/videos arrays
    const items: { id: string; type: 'photo' | 'video'; url: string }[] = []
    vehicle.photos?.forEach((url, i) => items.push({ id: `photo-${i}`, type: 'photo', url }))
    vehicle.videos?.forEach((url, i) => items.push({ id: `video-${i}`, type: 'video', url }))
    return items
  }

  if (compact) {
    const isDelivered = vehicle.status === 'delivered'
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-foreground">#{vehicle.ticketCode}</span>
                <Badge className={status.color}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {status.label}
                </Badge>
              </div>
              <p className="text-lg font-semibold text-foreground">{vehicle.licensePlate}</p>
              
              {/* Fecha y hora de entrada */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Entrada: {formatDate(vehicle.checkinTime)}
                </span>
                {vehicle.parkingSpot && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {vehicle.parkingSpot}
                  </span>
                )}
              </div>

              {/* Fecha y hora de salida (solo si fue entregado) */}
              {isDelivered && vehicle.deliveredTime && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                  <span className="flex items-center gap-1 text-primary">
                    <Truck className="h-3 w-3" />
                    Salida: {formatDate(vehicle.deliveredTime)}
                  </span>
                  <span className="text-muted-foreground">
                    (Duración: {getElapsedTimeBetween(vehicle.checkinTime, vehicle.deliveredTime)})
                  </span>
                </div>
              )}

              {/* Tiempo transcurrido (si no fue entregado) */}
              {!isDelivered && (
                <div className="text-sm text-muted-foreground">
                  Hace {getElapsedTime(vehicle.checkinTime)}
                </div>
              )}

              {/* Notas si existen */}
              {vehicle.notes && (
                <div className="flex items-start gap-1 text-sm text-warning">
                  <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-1">{vehicle.notes}</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-col items-end gap-2">
              {totalMediaCount > 0 && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  {photoCount > 0 && (
                    <span className="flex items-center gap-1">
                      <Camera className="h-4 w-4" />
                      <span className="text-xs">{photoCount}</span>
                    </span>
                  )}
                  {videoCount > 0 && (
                    <span className="flex items-center gap-1">
                      <Video className="h-4 w-4" />
                      <span className="text-xs">{videoCount}</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const allMedia = getAllMedia()

  return (
    <>
      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute -top-12 right-0"
              onClick={() => setSelectedVideo(null)}
            >
              <X className="h-6 w-6" />
            </Button>
            <video
              src={selectedVideo}
              controls
              autoPlay
              className="w-full rounded-lg"
            />
          </div>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <span className="font-mono">#{vehicle.ticketCode}</span>
            </CardTitle>
            <Badge className={`${status.color} px-3 py-1`}>
              <StatusIcon className="h-4 w-4 mr-1" />
              {status.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Patente</p>
              <p className="text-2xl font-bold text-foreground">{vehicle.licensePlate}</p>
            </div>
            {vehicle.parkingSpot && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Ubicación</p>
                <p className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {vehicle.parkingSpot}
                </p>
              </div>
            )}
          </div>

          {/* Time Info */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Entrada
              </span>
              <span className="font-medium text-foreground">{formatTime(vehicle.checkinTime)}</span>
            </div>
            {vehicle.requestedTime && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Solicitado
                </span>
                <span className="font-medium text-foreground">{formatTime(vehicle.requestedTime)}</span>
              </div>
            )}
            {vehicle.deliveredTime && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Entregado
                </span>
                <span className="font-medium text-foreground">{formatDate(vehicle.deliveredTime)}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
              <span className="text-muted-foreground">Tiempo total</span>
              <span className="font-bold text-foreground">{getElapsedTime(vehicle.checkinTime)}</span>
            </div>
          </div>

          {/* Attendant Info */}
          {vehicle.attendantName && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Recibido por:</span>
              <span className="font-medium text-foreground">{vehicle.attendantName}</span>
            </div>
          )}

          {vehicle.deliveryAttendant && (
            <div className="flex items-center gap-2 text-sm">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Entregado por:</span>
              <span className="font-medium text-foreground">{vehicle.deliveryAttendant}</span>
            </div>
          )}

          {/* Notes */}
          {vehicle.notes && (
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-warning uppercase tracking-wide mb-1">
                    Observaciones
                  </p>
                  <p className="text-sm text-foreground">{vehicle.notes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Media (Photos & Videos) */}
          {totalMediaCount > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setShowMedia(!showMedia)}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Camera className="h-4 w-4" />
                Ver {photoCount > 0 && `${photoCount} foto${photoCount > 1 ? 's' : ''}`}
                {photoCount > 0 && videoCount > 0 && ' y '}
                {videoCount > 0 && `${videoCount} video${videoCount > 1 ? 's' : ''}`}
              </button>
              
              {showMedia && (
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {allMedia.map((item) => (
                    <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                      {item.type === 'photo' ? (
                        <img 
                          src={item.url || "/placeholder.svg"} 
                          alt="Foto del vehículo" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedVideo(item.url)}
                          className="w-full h-full relative"
                        >
                          <video 
                            src={item.url}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-foreground/30">
                            <Play className="h-8 w-8 text-background fill-background" />
                          </div>
                          <div className="absolute top-1 left-1 bg-foreground/70 text-background text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Video className="h-2.5 w-2.5" />
                            Video
                          </div>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          {(vehicle.status === 'requested' || vehicle.status === 'ready') && (
            <div className="border-t border-border pt-4 space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Tu nombre (opcional)
                </label>
                <Input
                  value={attendantName}
                  onChange={(e) => setAttendantName(e.target.value)}
                  placeholder="Ingresa tu nombre"
                />
              </div>

              {vehicle.status === 'requested' && (
                <Button 
                  onClick={handleMarkReady} 
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                  size="lg"
                >
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Marcar como Listo
                </Button>
              )}

              {vehicle.status === 'ready' && (
                <Button 
                  onClick={handleMarkDelivered} 
                  className="w-full"
                  size="lg"
                >
                  <Truck className="h-5 w-5 mr-2" />
                  Confirmar Entrega
                </Button>
              )}
            </div>
          )}

          {vehicle.status === 'delivered' && (
            <div className="bg-primary/10 rounded-lg p-4 text-center">
              <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="font-medium text-foreground">Vehículo Entregado</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(vehicle.deliveredTime!)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
