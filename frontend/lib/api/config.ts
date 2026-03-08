import { API_BASE_URL, LS_TOKEN } from "@/lib/config"

export interface PublicUser {
  id: string
  name: string
  isAdmin: boolean
  showCheckin: boolean
  showCheckout: boolean
  showVehicles: boolean
  showAlerts: boolean
  showHistory: boolean
}

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {}
  const token = window.localStorage.getItem(LS_TOKEN)
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}

async function fetchApi<T>(
  path: string,
  options: RequestInit & { skipAuth?: boolean } = {}
): Promise<T> {
  const { skipAuth, ...init } = options
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  }
  if (!skipAuth) Object.assign(headers, getAuthHeaders())
  const skipCache = path.startsWith("/config/settings") && (init.method === undefined || init.method === "GET")
  const res = await fetch(`${API_BASE_URL}/api${path}`, {
    ...init,
    headers,
    ...(skipCache ? { cache: "no-store" as RequestCache } : {}),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as { error?: string }).error ?? "Error de red")
  return data as T
}

export const configApi = {
  async getSettings(): Promise<{ companyName: string; logo: string | null }> {
    return fetchApi("/config/settings", { skipAuth: true })
  },

  async updateSettings(body: { companyName?: string; logo?: string | null }): Promise<{ companyName: string; logo: string | null }> {
    return fetchApi("/config/settings", { method: "PUT", body: JSON.stringify(body) })
  },

  async login(name: string, password: string): Promise<{ ok: boolean; token: string; user: PublicUser }> {
    return fetchApi("/auth/login", {
      method: "POST",
      body: JSON.stringify({ name, password }),
      skipAuth: true,
    })
  },

  async validate(userId: string, token: string): Promise<{ ok: boolean; user: PublicUser }> {
    const params = new URLSearchParams({ userId, token })
    return fetchApi(`/auth/validate?${params}`, { skipAuth: true })
  },

  async me(): Promise<{ ok: boolean; user: PublicUser }> {
    return fetchApi("/auth/me")
  },

  async getUsers(): Promise<{ users: PublicUser[] }> {
    return fetchApi("/config/users")
  },

  async addUser(body: {
    name: string
    password?: string
    isAdmin?: boolean
    showCheckin?: boolean
    showCheckout?: boolean
    showVehicles?: boolean
    showAlerts?: boolean
    showHistory?: boolean
  }): Promise<{ ok: boolean; user: PublicUser }> {
    return fetchApi("/config/users", { method: "POST", body: JSON.stringify(body) })
  },

  async updateUser(
    id: string,
    body: Partial<{
      name: string
      password: string
      isAdmin: boolean
      showCheckin: boolean
      showCheckout: boolean
      showVehicles: boolean
      showAlerts: boolean
      showHistory: boolean
    }>
  ): Promise<{ ok: boolean; user: PublicUser }> {
    return fetchApi(`/config/users/${id}`, { method: "PATCH", body: JSON.stringify(body) })
  },

  async removeUser(id: string): Promise<{ ok: boolean }> {
    return fetchApi(`/config/users/${id}`, { method: "DELETE" })
  },

  async regenerateToken(id: string): Promise<{ ok: boolean; token: string }> {
    return fetchApi(`/config/users/${id}/regenerate-token`, { method: "POST" })
  },
}
