export type VehicleStatus = 'parked' | 'requested' | 'ready' | 'delivered'

export interface MediaItem {
  id: string
  type: 'photo' | 'video'
  url: string
  thumbnail?: string
  timestamp: Date
}

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
}

export interface Notification {
  id: string
  vehicleId: string
  ticketCode: string
  licensePlate: string
  message: string
  timestamp: Date
  read: boolean
}
