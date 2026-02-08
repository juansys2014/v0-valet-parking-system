"use client"

import { useRef, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, Video, X, RotateCcw, Check, Trash2, ImagePlus, VideoIcon, Square, Play } from 'lucide-react'
import { useTranslations } from '@/lib/i18n/context'
import type { MediaItem } from "@/lib/types"

interface MediaCaptureProps {
  media: MediaItem[]
  onMediaChange: (media: MediaItem[]) => void
  maxItems?: number
}

export function MediaCapture({ media, onMediaChange, maxItems = 10 }: MediaCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [captureMode, setCaptureMode] = useState<'photo' | 'video'>('photo')
  const [preview, setPreview] = useState<{ type: 'photo' | 'video'; url: string } | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const t = useTranslations()

  const startCamera = useCallback(async (mode: 'photo' | 'video') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: mode === 'video'
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCaptureMode(mode)
      setIsCapturing(true)
    } catch {
      // Camera access error
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsCapturing(false)
    setIsRecording(false)
    setRecordingTime(0)
    setPreview(null)
    chunksRef.current = []
  }, [isRecording])

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
      setPreview({ type: 'photo', url: dataUrl })
    }
  }, [])

  const startRecording = useCallback(() => {
    if (!streamRef.current) return

    chunksRef.current = []
    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: 'video/webm;codecs=vp9'
    })
    
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data)
      }
    }
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' })
      const url = URL.createObjectURL(blob)
      setPreview({ type: 'video', url })
    }
    
    mediaRecorderRef.current = mediaRecorder
    mediaRecorder.start(100)
    setIsRecording(true)
    setRecordingTime(0)
    
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= 30) {
          stopRecording()
          return prev
        }
        return prev + 1
      })
    }, 1000)
  }, [])

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
  }, [])

  const confirmMedia = useCallback(() => {
    if (preview) {
      const newItem: MediaItem = {
        id: Date.now().toString(),
        type: preview.type,
        url: preview.url,
        timestamp: new Date()
      }
      onMediaChange([...media, newItem])
      setPreview(null)
    }
  }, [preview, media, onMediaChange])

  const retakeMedia = useCallback(() => {
    if (preview?.type === 'video') {
      URL.revokeObjectURL(preview.url)
    }
    setPreview(null)
    chunksRef.current = []
  }, [preview])

  const removeMedia = useCallback((id: string) => {
    const item = media.find(m => m.id === id)
    if (item?.type === 'video') {
      URL.revokeObjectURL(item.url)
    }
    onMediaChange(media.filter((m) => m.id !== id))
  }, [media, onMediaChange])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const photoCount = media.filter(m => m.type === 'photo').length
  const videoCount = media.filter(m => m.type === 'video').length

  if (isCapturing) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">
              {captureMode === 'photo' ? t.media.takePhoto : t.media.recordVideo}
            </h2>
            {isRecording && (
              <div className="flex items-center gap-2 text-destructive">
                <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
                <span className="font-mono text-sm">{formatTime(recordingTime)}/0:30</span>
              </div>
            )}
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={stopCamera}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 relative bg-foreground/5">
          {preview ? (
            preview.type === 'photo' ? (
              <img src={preview.url || "/placeholder.svg"} alt="Preview" className="w-full h-full object-contain" />
            ) : (
              <video
                src={preview.url}
                className="w-full h-full object-contain"
                controls
                autoPlay
                loop
              />
            )
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

        <div className="p-4 space-y-4">
          {!preview && !isRecording && (
            <div className="flex justify-center gap-4">
              <Button
                type="button"
                variant={captureMode === 'photo' ? 'default' : 'outline'}
                size="sm"
                onClick={() => startCamera('photo')}
                className="gap-2"
              >
                <Camera className="h-4 w-4" />
                {t.vehicle.photos}
              </Button>
              <Button
                type="button"
                variant={captureMode === 'video' ? 'default' : 'outline'}
                size="sm"
                onClick={() => startCamera('video')}
                className="gap-2"
              >
                <Video className="h-4 w-4" />
                {t.vehicle.videos}
              </Button>
            </div>
          )}

          <div className="flex justify-center gap-4">
            {preview ? (
              <>
                <Button type="button" variant="outline" size="lg" onClick={retakeMedia} className="gap-2 bg-transparent">
                  <RotateCcw className="h-5 w-5" />
                  {t.media.retake}
                </Button>
                <Button type="button" size="lg" onClick={confirmMedia} className="gap-2">
                  <Check className="h-5 w-5" />
                  {preview.type === 'photo' ? t.media.usePhoto : t.media.useVideo}
                </Button>
              </>
            ) : captureMode === 'photo' ? (
              <Button
                type="button"
                size="lg"
                onClick={capturePhoto}
                className="w-16 h-16 rounded-full p-0"
              >
                <Camera className="h-8 w-8" />
              </Button>
            ) : isRecording ? (
              <Button
                type="button"
                size="lg"
                variant="destructive"
                onClick={stopRecording}
                className="w-16 h-16 rounded-full p-0"
              >
                <Square className="h-6 w-6 fill-current" />
              </Button>
            ) : (
              <Button
                type="button"
                size="lg"
                variant="destructive"
                onClick={startRecording}
                className="w-16 h-16 rounded-full p-0"
              >
                <div className="w-6 h-6 bg-destructive-foreground rounded-full" />
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          {t.vehicle.media} ({media.length}/{maxItems})
        </label>
        {media.length < maxItems && (
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => startCamera('photo')} className="gap-1 bg-transparent">
              <ImagePlus className="h-4 w-4" />
              {t.media.addPhoto}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => startCamera('video')} className="gap-1 bg-transparent">
              <VideoIcon className="h-4 w-4" />
              {t.media.addVideo}
            </Button>
          </div>
        )}
      </div>

      {media.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {media.map((item) => (
            <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden group bg-muted">
              {item.type === 'photo' ? (
                <img src={item.url || "/placeholder.svg"} alt="Photo" className="w-full h-full object-cover" />
              ) : (
                <div className="relative w-full h-full">
                  <video src={item.url} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-foreground/20">
                    <Play className="h-8 w-8 text-background fill-background" />
                  </div>
                </div>
              )}
              <div className="absolute top-1 left-1">
                {item.type === 'video' && (
                  <div className="bg-foreground/70 text-background text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                    <Video className="h-2.5 w-2.5" />
                    Video
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeMedia(item.id)}
                className="absolute top-1 right-1 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div 
          onClick={() => startCamera('photo')}
          className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
        >
          <div className="flex justify-center gap-2 mb-2">
            <Camera className="h-8 w-8 text-muted-foreground" />
            <Video className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            {t.media.takePhoto} {t.common.or} {t.media.recordVideo}
          </p>
        </div>
      )}

      {(photoCount > 0 || videoCount > 0) && (
        <p className="text-xs text-muted-foreground text-center">
          {photoCount} {t.media.photos} · {videoCount} {t.media.videos}
        </p>
      )}
    </div>
  )
}
