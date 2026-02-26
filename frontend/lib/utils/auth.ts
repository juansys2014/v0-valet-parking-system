/**
 * Hash de contraseña con SHA-256 (solo para uso en frontend/localStorage).
 * No sustituye autenticación server-side.
 */
export async function hashPassword(plain: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)
  const hash = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  if (!hash) return false
  const h = await hashPassword(plain)
  return h === hash
}

export function generateToken(): string {
  const arr = new Uint8Array(32)
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(arr)
  }
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("")
}
