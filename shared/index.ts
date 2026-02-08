/**
 * Tipos compartidos entre frontend y backend (UI + contrato API).
 */

export type VehicleStatus = "parked" | "requested" | "ready" | "delivered"

/** Item de media (foto/video) para la UI */
export interface MediaItem {
  id: string
  type: "photo" | "video"
  url: string
  thumbnail?: string
  timestamp: Date
}

/** Item de media tal como viene del API (ISO strings) */
export interface MediaItemDTO {
  id: string
  type: "photo" | "video"
  url: string
  createdAt?: string
}

/** Ticket tal como lo devuelve el API */
export interface TicketDTO {
  id: string
  ticketCode: string | null
  licensePlate: string
  parkingSpot: string | null
  notes: string | null
  checkinAttendantName: string | null
  deliveryAttendantName: string | null
  status: VehicleStatus
  checkinTime: string
  requestedTime: string | null
  readyTime: string | null
  deliveredTime: string | null
  checkoutTime: string | null
  wasRegistered: boolean
  createdAt: string
  updatedAt: string
  mediaItems?: MediaItemDTO[]
}

/** Vehículo en la UI (derivado de TicketDTO) */
export interface Vehicle {
  id: string
  ticketCode: string
  licensePlate: string
  photos: string[]
  videos: string[]
  media: MediaItem[]
  notes: string
  status: VehicleStatus
  parkingSpot?: string
  checkinTime: Date
  checkoutTime?: Date
  requestedTime?: Date
  deliveredTime?: Date
  attendantName?: string
  deliveryAttendant?: string
  wasRegistered?: boolean
}

/** Notificación en la UI */
export interface Notification {
  id: string
  vehicleId: string
  ticketCode: string
  licensePlate: string
  message: string
  timestamp: Date
  read: boolean
}
