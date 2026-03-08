"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("App error:", error)
  }, [error])

  const handleClearAndReload = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("valet-token")
      window.localStorage.removeItem("valet-current-user")
      window.location.href = window.location.pathname
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-sm w-full text-center space-y-4">
        <h1 className="text-xl font-semibold text-foreground">Algo salió mal</h1>
        <p className="text-sm text-muted-foreground">
          Se produjo un error al cargar la aplicación. Probá recargar o cerrar sesión para empezar de nuevo.
        </p>
        <div className="flex flex-col gap-2">
          <Button onClick={() => reset()} className="w-full">
            Reintentar
          </Button>
          <Button variant="outline" onClick={handleClearAndReload} className="w-full">
            Cerrar sesión y recargar
          </Button>
        </div>
      </div>
    </div>
  )
}
