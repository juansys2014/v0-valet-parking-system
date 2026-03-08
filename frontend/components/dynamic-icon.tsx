"use client"

import { useEffect } from "react"
import { useConfig } from "@/lib/config/context"

/** Actualiza favicon y apple-touch-icon con el logo de la empresa cuando esté cargado (evita que se quede el icono por defecto v0). */
export function DynamicIcon() {
  const { config } = useConfig()

  useEffect(() => {
    if (!config?.logo || typeof document === "undefined") return

    const setLink = (rel: string, href: string) => {
      const existing = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
      if (existing) {
        existing.href = href
      } else {
        const link = document.createElement("link")
        link.rel = rel
        link.href = href
        document.head.appendChild(link)
      }
    }

    setLink("icon", config.logo)
    setLink("apple-touch-icon", config.logo)
  }, [config?.logo])

  return null
}
