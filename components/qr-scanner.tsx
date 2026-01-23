"use client"

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, X } from 'lucide-react'
import { useTranslations } from '@/lib/i18n/context'
import { BarcodeDetector } from 'barcode-detector'

interface QRScannerProps {
  onScan: (code: string) => void
  onClose: () => void
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState<string>('')
  const [scanning, setScanning] = useState(false)
  const t = useTranslations()

  useEffect(() => {
    let stream: MediaStream | null = null
    let animationId: number

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        })
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          setScanning(true)
          scanQRCode()
        }
      } catch {
        setError(t.qr.error)
      }
    }

    async function scanQRCode() {
      if (!videoRef.current || !canvasRef.current) return

      const video = videoRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')

      if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
        animationId = requestAnimationFrame(scanQRCode)
        return
      }

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      try {
        if ('BarcodeDetector' in window) {
          const barcodeDetector = new BarcodeDetector({ formats: ['qr_code'] })
          const barcodes = await barcodeDetector.detect(canvas)
          
          if (barcodes.length > 0) {
            const code = barcodes[0].rawValue
            onScan(code)
            return
          }
        }
      } catch {}

      animationId = requestAnimationFrame(scanQRCode)
    }

    startCamera()

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [onScan, t.qr.error])

  return (
    <div className="fixed inset-0 bg-background/95 z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">{t.qr.title}</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        {error ? (
          <div className="text-center">
            <Camera className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={onClose}>{t.common.close}</Button>
          </div>
        ) : (
          <div className="relative w-full max-w-sm aspect-square">
            <video
              ref={videoRef}
              className="w-full h-full object-cover rounded-lg"
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 border-2 border-primary rounded-lg relative">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-primary rounded-tl" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-primary rounded-tr" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-primary rounded-bl" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-primary rounded-br" />
                
                {scanning && (
                  <div className="absolute inset-x-0 top-1/2 h-0.5 bg-primary animate-pulse" />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 text-center text-muted-foreground text-sm">
        {t.qr.instructions}
      </div>
    </div>
  )
}
