"use client"

import React, { useState } from "react"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { QrCode, Car, Check, ParkingSquare, User } from 'lucide-react'
import { MediaCapture } from '@/components/media-capture'
import { QRScanner } from '@/components/qr-scanner'
import { useVehicleActions } from '@/hooks/use-store'
import type { MediaItem } from '@/lib/types'

interface CheckinFormProps {
  onSuccess?: () => void
}

export function CheckinForm({ onSuccess }: CheckinFormProps) {
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [ticketCode, setTicketCode] = useState('')
  const [licensePlate, setLicensePlate] = useState('')
  const [media, setMedia] = useState<MediaItem[]>([])
  const [notes, setNotes] = useState('')
  const [parkingSpot, setParkingSpot] = useState('')
  const [attendantName, setAttendantName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const { addVehicle, getVehicleByTicket } = useVehicleActions()

  const handleQRScan = (code: string) => {
    setTicketCode(code)
    setShowQRScanner(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!ticketCode || !licensePlate) {
      alert('Por favor completa el código de ticket y la patente')
      return
    }

    const existing = getVehicleByTicket(ticketCode)
    if (existing) {
      alert('Este ticket ya está en uso')
      return
    }

    setIsSubmitting(true)

    try {
      addVehicle({
        ticketCode,
        licensePlate: licensePlate.toUpperCase(),
        media,
        notes,
        parkingSpot,
        attendantName,
      })

      setSuccess(true)
      
      setTimeout(() => {
        setTicketCode('')
        setLicensePlate('')
        setMedia([])
        setNotes('')
        setParkingSpot('')
        setSuccess(false)
        onSuccess?.()
      }, 2000)
    } catch {
      alert('Error al registrar el vehículo')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <Card className="border-accent">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-accent-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Vehículo Registrado</h3>
            <p className="text-muted-foreground">
              Ticket #{ticketCode} - {licensePlate}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {showQRScanner && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => setShowQRScanner(false)}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Registrar Vehículo
          </CardTitle>
          <CardDescription>
            Ingresa los datos del vehículo para registrar la entrada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Ticket Code */}
            <div className="space-y-2">
              <Label htmlFor="ticketCode">Código de Ticket *</Label>
              <div className="flex gap-2">
                <Input
                  id="ticketCode"
                  value={ticketCode}
                  onChange={(e) => setTicketCode(e.target.value)}
                  placeholder="Ej: 001234"
                  className="flex-1 text-lg"
                />
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
            </div>

            {/* License Plate */}
            <div className="space-y-2">
              <Label htmlFor="licensePlate">Patente *</Label>
              <Input
                id="licensePlate"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                placeholder="Ej: ABC 123"
                className="text-lg uppercase"
              />
            </div>

            {/* Parking Spot */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parkingSpot">
                  <ParkingSquare className="h-4 w-4 inline mr-1" />
                  Ubicación
                </Label>
                <Input
                  id="parkingSpot"
                  value={parkingSpot}
                  onChange={(e) => setParkingSpot(e.target.value.toUpperCase())}
                  placeholder="Ej: A1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="attendant">
                  <User className="h-4 w-4 inline mr-1" />
                  Encargado
                </Label>
                <Input
                  id="attendant"
                  value={attendantName}
                  onChange={(e) => setAttendantName(e.target.value)}
                  placeholder="Tu nombre"
                />
              </div>
            </div>

            {/* Media (Photos & Videos) */}
            <MediaCapture media={media} onMediaChange={setMedia} />

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notas / Observaciones</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Daños existentes, objetos de valor, instrucciones especiales..."
                rows={3}
              />
            </div>

            {/* Submit */}
            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={isSubmitting || !ticketCode || !licensePlate}
            >
              {isSubmitting ? 'Registrando...' : 'Registrar Entrada'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  )
}
