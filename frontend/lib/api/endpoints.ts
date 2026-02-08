import type { Vehicle, TicketDTO, MediaItemDTO } from "shared"
import { fetchJson } from "./client"

const API = {
  entry: "/api/entry",
  active: "/api/active",
  history: "/api/history",
  alerts: "/api/alerts",
  checkoutRequest: "/api/checkout/request",
  checkoutQuickExit: "/api/checkout/quick-exit",
  ticketReady: (id: string) => `/api/tickets/${id}/ready`,
  ticketDelivered: (id: string) => `/api/tickets/${id}/delivered`,
}

/** Map API ticket to UI Vehicle */
export function ticketToVehicle(t: TicketDTO): Vehicle {
  const mediaItems = t.mediaItems ?? []
  const photos = mediaItems.filter((m) => m.type === "photo").map((m) => m.url)
  const videos = mediaItems.filter((m) => m.type === "video").map((m) => m.url)
  const media = mediaItems.map((m: MediaItemDTO) => ({
    id: m.id,
    type: m.type,
    url: m.url,
    timestamp: m.createdAt ? new Date(m.createdAt) : new Date(),
  }))

  return {
    id: t.id,
    ticketCode: t.ticketCode ?? "",
    licensePlate: t.licensePlate,
    photos,
    videos,
    media,
    notes: t.notes ?? "",
    status: t.status,
    parkingSpot: t.parkingSpot ?? undefined,
    checkinTime: new Date(t.checkinTime),
    requestedTime: t.requestedTime ? new Date(t.requestedTime) : undefined,
    deliveredTime: t.deliveredTime ? new Date(t.deliveredTime) : undefined,
    checkoutTime: t.checkoutTime ? new Date(t.checkoutTime) : undefined,
    attendantName: t.checkinAttendantName ?? undefined,
    deliveryAttendant: t.deliveryAttendantName ?? undefined,
    wasRegistered: t.wasRegistered,
  }
}

// --- Payloads / Responses (tipos del contrato API) ---

export interface EntryPayload {
  ticketCode: string
  licensePlate: string
  parkingSpot?: string
  attendantName?: string
  notes?: string
  media?: { type: "photo" | "video"; url: string }[]
}

export interface EntryResponse {
  ok: true
  duplicate: boolean
  ticket: TicketDTO
}

export interface ActiveResponse {
  ok: true
  tickets: TicketDTO[]
}

export interface HistoryResponse {
  ok: true
  tickets: TicketDTO[]
}

export interface CheckoutRequestResponse {
  ok: true
  ticket: TicketDTO
}

export interface QuickExitPayload {
  ticketCode: string
  licensePlate?: string
}

export interface QuickExitResponse {
  ok: true
  ticket: TicketDTO
}

export interface MarkReadyResponse {
  ok: true
  ticket: TicketDTO
}

export interface MarkDeliveredResponse {
  ok: true
  ticket: TicketDTO
}

export interface AlertsResponse {
  ok: true
  requested: TicketDTO[]
  ready: TicketDTO[]
}

// --- Endpoints ---

export async function entryCreate(payload: EntryPayload): Promise<EntryResponse> {
  const body = {
    ticketCode: payload.ticketCode.trim(),
    licensePlate: payload.licensePlate.toUpperCase().trim(),
    parkingSpot: payload.parkingSpot?.toUpperCase().trim(),
    attendantName: payload.attendantName?.trim(),
    notes: payload.notes?.trim(),
    media: (payload.media ?? []).slice(0, 10).map((m) => ({ type: m.type, url: m.url })),
  }
  return fetchJson<EntryResponse>(API.entry, {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export async function getActive(search?: string): Promise<ActiveResponse> {
  const q = search?.trim() ? `?search=${encodeURIComponent(search.trim())}` : ""
  return fetchJson<ActiveResponse>(`${API.active}${q}`)
}

export async function getHistory(search?: string): Promise<HistoryResponse> {
  const q = search?.trim() ? `?search=${encodeURIComponent(search.trim())}` : ""
  return fetchJson<HistoryResponse>(`${API.history}${q}`)
}

export async function checkoutRequest(ticketId: string): Promise<CheckoutRequestResponse> {
  return fetchJson<CheckoutRequestResponse>(API.checkoutRequest, {
    method: "POST",
    body: JSON.stringify({ ticketId }),
  })
}

export async function checkoutQuickExit(
  payload: QuickExitPayload
): Promise<QuickExitResponse> {
  return fetchJson<QuickExitResponse>(API.checkoutQuickExit, {
    method: "POST",
    body: JSON.stringify({
      ticketCode: payload.ticketCode.trim(),
      licensePlate: payload.licensePlate?.trim(),
    }),
  })
}

export async function markReady(
  id: string,
  attendantName?: string
): Promise<MarkReadyResponse> {
  return fetchJson<MarkReadyResponse>(API.ticketReady(id), {
    method: "POST",
    body: JSON.stringify({ attendantName: attendantName?.trim() || undefined }),
  })
}

export async function markDelivered(
  id: string,
  attendantName?: string
): Promise<MarkDeliveredResponse> {
  return fetchJson<MarkDeliveredResponse>(API.ticketDelivered(id), {
    method: "POST",
    body: JSON.stringify({ attendantName: attendantName?.trim() || undefined }),
  })
}

export async function getAlerts(): Promise<AlertsResponse> {
  return fetchJson<AlertsResponse>(API.alerts)
}
