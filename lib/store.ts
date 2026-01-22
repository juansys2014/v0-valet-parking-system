import type { Vehicle, Notification, VehicleStatus } from "./types"

// Simulated in-memory database
let vehicles: Vehicle[] = []
let notifications: Notification[] = []
let listeners: Set<() => void> = new Set()

// Cached snapshots for useSyncExternalStore
let cachedVehicles: Vehicle[] = vehicles
let cachedActiveVehicles: Vehicle[] = []
let cachedVehicleHistory: Vehicle[] = []
let cachedNotifications: Notification[] = notifications
let cachedUnreadNotifications: Notification[] = []

function updateCaches() {
  cachedVehicles = vehicles
  cachedActiveVehicles = vehicles.filter((v) => v.status !== "delivered")
  cachedVehicleHistory = vehicles
    .filter((v) => v.status === "delivered")
    .sort(
      (a, b) =>
        (b.deliveredTime?.getTime() || 0) - (a.deliveredTime?.getTime() || 0)
    )
  cachedNotifications = notifications
  cachedUnreadNotifications = notifications.filter((n) => !n.read)
}

// Subscribe to changes
export function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function notifyListeners() {
  updateCaches()
  listeners.forEach((listener) => listener())
}

// Snapshot getters (return cached values)
export function getVehicles(): Vehicle[] {
  return cachedVehicles
}

export function getActiveVehicles(): Vehicle[] {
  return cachedActiveVehicles
}

export function getVehicleHistory(): Vehicle[] {
  return cachedVehicleHistory
}

export function getNotifications(): Notification[] {
  return cachedNotifications
}

export function getUnreadNotifications(): Notification[] {
  return cachedUnreadNotifications
}

// Vehicle operations
interface AddVehicleInput {
  ticketCode: string
  licensePlate: string
  media?: { id: string; type: 'photo' | 'video'; url: string; timestamp: Date }[]
  notes: string
  parkingSpot?: string
  attendantName?: string
}

export function addVehicle(vehicle: AddVehicleInput): Vehicle {
  const photos = vehicle.media?.filter(m => m.type === 'photo').map(m => m.url) || []
  const videos = vehicle.media?.filter(m => m.type === 'video').map(m => m.url) || []
  
  const newVehicle: Vehicle = {
    id: crypto.randomUUID(),
    ticketCode: vehicle.ticketCode,
    licensePlate: vehicle.licensePlate,
    photos,
    videos,
    media: vehicle.media || [],
    notes: vehicle.notes,
    parkingSpot: vehicle.parkingSpot,
    attendantName: vehicle.attendantName,
    status: "parked",
    checkinTime: new Date(),
  }
  vehicles = [...vehicles, newVehicle]
  notifyListeners()
  return newVehicle
}

export function getVehicleByTicket(ticketCode: string): Vehicle | undefined {
  return vehicles.find(
    (v) => v.ticketCode === ticketCode && v.status !== "delivered"
  )
}

export function getVehicleById(id: string): Vehicle | undefined {
  return vehicles.find((v) => v.id === id)
}

export function updateVehicleStatus(
  id: string,
  status: VehicleStatus,
  attendant?: string
): Vehicle | undefined {
  const index = vehicles.findIndex((v) => v.id === id)
  if (index === -1) return undefined

  const now = new Date()
  const updates: Partial<Vehicle> = { status }

  if (status === "requested") {
    updates.requestedTime = now
    // Create notification for parking attendants
    const vehicle = vehicles[index]
    addNotification({
      vehicleId: id,
      ticketCode: vehicle.ticketCode,
      licensePlate: vehicle.licensePlate,
      message: `Vehículo solicitado - Ticket #${vehicle.ticketCode} - Patente: ${vehicle.licensePlate}`,
    })
  } else if (status === "ready") {
    updates.deliveryAttendant = attendant
  } else if (status === "delivered") {
    updates.deliveredTime = now
    updates.checkoutTime = now
    updates.deliveryAttendant = attendant
  }

  vehicles = vehicles.map((v, i) => (i === index ? { ...v, ...updates } : v))
  notifyListeners()
  return vehicles[index]
}

// Notification operations
export function addNotification(
  notification: Omit<Notification, "id" | "timestamp" | "read">
): Notification {
  const newNotification: Notification = {
    ...notification,
    id: crypto.randomUUID(),
    timestamp: new Date(),
    read: false,
  }
  notifications = [newNotification, ...notifications]
  notifyListeners()

  // Play notification sound
  if (typeof window !== "undefined") {
    try {
      const audio = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQI="
      )
      audio.volume = 0.5
      audio.play().catch(() => {})
    } catch {}
  }

  return newNotification
}

export function markNotificationAsRead(id: string): void {
  notifications = notifications.map((n) =>
    n.id === id ? { ...n, read: true } : n
  )
  notifyListeners()
}

export function markAllNotificationsAsRead(): void {
  notifications = notifications.map((n) => ({ ...n, read: true }))
  notifyListeners()
}

// Demo data for testing
export function addDemoData() {
  if (vehicles.length === 0) {
    addVehicle({
      ticketCode: "001234",
      licensePlate: "ABC 123",
      media: [],
      notes: "SUV color negro, pequeño rayón en puerta trasera derecha",
      parkingSpot: "A1",
      attendantName: "Carlos",
    })
    addVehicle({
      ticketCode: "001235",
      licensePlate: "XYZ 789",
      media: [],
      notes: "",
      parkingSpot: "B3",
      attendantName: "Miguel",
    })
  }
}

// Initialize caches
updateCaches()
