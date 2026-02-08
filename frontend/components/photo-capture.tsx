"use client"

import { useRef, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, X, RotateCcw, Check, Trash2, ImagePlus } from 'lucide-react'

interface PhotoCaptureProps {
  photos: string[]
  onPhotosChange: (photos: string[]) => void
  maxPhotos?: number
}

export function PhotoCapture({ photos, onPhotosChange, maxPhotos = 6 }: PhotoCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setIsCapturing(true)
    } catch {
      alert('No se pudo acceder a la cámara')
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsCapturing(false)
    setPreview(null)
  }, [])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(video, 0, 0)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
      setPreview(dataUrl)
    }
  }, [])

  const confirmPhoto = useCallback(() => {
    if (preview) {
      onPhotosChange([...photos, preview])
      setPreview(null)
    }
  }, [preview, photos, onPhotosChange])

  const retakePhoto = useCallback(() => {
    setPreview(null)
  }, [])

  const removePhoto = useCallback((index: number) => {
    onPhotosChange(photos.filter((_, i) => i !== index))
  }, [photos, onPhotosChange])

  if (isCapturing) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Tomar Foto</h2>
          <Button type="button" variant="ghost" size="icon" onClick={stopCamera}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 relative bg-foreground/5">
          {preview ? (
            <img src={preview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-contain" />
          ) : (
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              playsInline
              muted
            />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="p-4 flex justify-center gap-4">
          {preview ? (
            <>
              <Button type="button" variant="outline" size="lg" onClick={retakePhoto} className="gap-2 bg-transparent">
                <RotateCcw className="h-5 w-5" />
                Repetir
              </Button>
              <Button type="button" size="lg" onClick={confirmPhoto} className="gap-2">
                <Check className="h-5 w-5" />
                Usar Foto
              </Button>
            </>
          ) : (
            <Button
              type="button"
              size="lg"
              onClick={capturePhoto}
              className="w-16 h-16 rounded-full p-0"
            >
              <Camera className="h-8 w-8" />
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          Fotos del Vehículo ({photos.length}/{maxPhotos})
        </label>
        {photos.length < maxPhotos && (
          <Button type="button" variant="outline" size="sm" onClick={startCamera} className="gap-2 bg-transparent">
            <ImagePlus className="h-4 w-4" />
            Agregar Foto
          </Button>
        )}
      </div>

      {photos.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
              <img src={photo || "/placeholder.svg"} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute top-1 right-1 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div 
          onClick={startCamera}
          className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
        >
          <Camera className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Toca para tomar fotos del vehículo
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Registra daños existentes o estado general
          </p>
        </div>
      )}
    </div>
  )
}
