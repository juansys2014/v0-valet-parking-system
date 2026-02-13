export const DEFAULT_LANGUAGE = "es"
export const COOKIE_LANGUAGE = "valet-language"
export const LS_SETTINGS = "valet-settings"
// Browser: same-origin (''); Next rewrites /api/* to backend. Server/SSR can use NEXT_PUBLIC_API_URL.
export const API_BASE_URL =
  typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000")
