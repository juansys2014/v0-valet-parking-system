/**
 * Duración = deliveredTime - checkinTime (en ms).
 * No usar Date.now() ni requestedTime.
 */

const FALLBACK = "—"

/**
 * Convierte milisegundos a texto "Xh Ym" o "Xm".
 * Si ms es null/undefined o < 0, devuelve "—".
 */
export function formatDurationMs(
  ms: number | null | undefined
): string {
  if (ms == null || typeof ms !== "number" || ms < 0) return FALLBACK
  const totalMinutes = Math.floor(ms / 60_000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

/**
 * Calcula duración en ms como deliveredTime - checkinTime.
 * Acepta Date o string ISO; parsea con new Date(value).
 * Devuelve null si falta alguna fecha o si el resultado es < 0.
 */
export function durationMs(
  checkinTime: Date | string | null | undefined,
  deliveredTime: Date | string | null | undefined
): number | null {
  const start =
    checkinTime != null ? new Date(checkinTime).getTime() : NaN
  const end =
    deliveredTime != null ? new Date(deliveredTime).getTime() : NaN
  if (Number.isNaN(start) || Number.isNaN(end)) return null
  const ms = end - start
  return ms < 0 ? null : ms
}

/**
 * Helper único para mostrar duración en UI.
 * Uso: formatDuration(checkinTime, deliveredTime)
 */
export function formatDuration(
  checkinTime: Date | string | null | undefined,
  deliveredTime: Date | string | null | undefined
): string {
  return formatDurationMs(durationMs(checkinTime, deliveredTime))
}
