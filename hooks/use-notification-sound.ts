"use client"

import { useCallback, useRef } from 'react'

export function useNotificationSound() {
  const audioContextRef = useRef<AudioContext | null>(null)

  const playSound = useCallback((type: 'alert' | 'success' = 'alert') => {
    try {
      // Crear AudioContext si no existe
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      }
      
      const ctx = audioContextRef.current
      
      // Crear oscilador
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      
      if (type === 'alert') {
        // Sonido de alerta: dos tonos rápidos
        oscillator.frequency.setValueAtTime(880, ctx.currentTime) // A5
        oscillator.frequency.setValueAtTime(1100, ctx.currentTime + 0.1) // C#6
        oscillator.frequency.setValueAtTime(880, ctx.currentTime + 0.2) // A5
        
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)
        
        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + 0.4)
      } else {
        // Sonido de éxito: tono ascendente
        oscillator.frequency.setValueAtTime(523, ctx.currentTime) // C5
        oscillator.frequency.setValueAtTime(659, ctx.currentTime + 0.1) // E5
        oscillator.frequency.setValueAtTime(784, ctx.currentTime + 0.2) // G5
        
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35)
        
        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + 0.35)
      }
    } catch (error) {
      // Si falla el audio, no hacer nada (algunos navegadores bloquean audio sin interacción)
      console.warn('Could not play notification sound:', error)
    }
  }, [])

  return { playSound }
}
