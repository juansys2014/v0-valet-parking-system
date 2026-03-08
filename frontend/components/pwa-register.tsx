"use client"

import { useEffect } from "react"

/** Registra el service worker para que Chrome ofrezca "Instalar como app" y abra en pantalla completa */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return
    navigator.serviceWorker.register("/sw.js").catch(() => {})
  }, [])
  return null
}
