import { API_BASE_URL } from "@/lib/config"

/**
 * Petición al backend con Content-Type: application/json.
 * La URL se construye con API_BASE_URL si path no es absoluta.
 */
export function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  })
}

/**
 * apiFetch + parse JSON + lanzar Error si !res.ok.
 * El mensaje de error usa body.error si existe.
 */
export async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await apiFetch(path, options)
  const data = (await res.json().catch(() => ({}))) as T & { error?: string }
  if (!res.ok) {
    const msg =
      typeof (data as { error?: string })?.error === "string"
        ? (data as { error: string }).error
        : `Error ${res.status}`
    throw new Error(msg)
  }
  return data as T
}
