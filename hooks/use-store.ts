"use client"

import { useSyncExternalStore, useCallback } from 'react'
import * as store from '@/lib/store'
import type { Vehicle, Notification, VehicleStatus } from '@/lib/types'

export function useVehicles() {
  const vehicles = useSyncExternalStore(
    store.subscribe,
    store.getVehicles,
    store.getVehicles
  )
  return vehicles
}

export function useActiveVehicles() {
  const vehicles = useSyncExternalStore(
    store.subscribe,
    store.getActiveVehicles,
    store.getActiveVehicles
  )
  return vehicles
}

export function useVehicleHistory() {
  const vehicles = useSyncExternalStore(
    store.subscribe,
    store.getVehicleHistory,
    store.getVehicleHistory
  )
  return vehicles
}

export function useNotifications() {
  const notifications = useSyncExternalStore(
    store.subscribe,
    store.getNotifications,
    store.getNotifications
  )
  return notifications
}

export function useUnreadNotifications() {
  const notifications = useSyncExternalStore(
    store.subscribe,
    store.getUnreadNotifications,
    store.getUnreadNotifications
  )
  return notifications
}

export function useVehicleActions() {
  const addVehicle = useCallback((vehicle: Omit<Vehicle, 'id' | 'checkinTime' | 'status'>) => {
    return store.addVehicle(vehicle)
  }, [])

  const getVehicleByTicket = useCallback((ticketCode: string) => {
    return store.getVehicleByTicket(ticketCode)
  }, [])

  const getVehicleById = useCallback((id: string) => {
    return store.getVehicleById(id)
  }, [])

  const updateStatus = useCallback((id: string, status: VehicleStatus, attendant?: string) => {
    return store.updateVehicleStatus(id, status, attendant)
  }, [])

  return { addVehicle, getVehicleByTicket, getVehicleById, updateStatus }
}

export function useNotificationActions() {
  const markAsRead = useCallback((id: string) => {
    store.markNotificationAsRead(id)
  }, [])

  const markAllAsRead = useCallback(() => {
    store.markAllNotificationsAsRead()
  }, [])

  return { markAsRead, markAllAsRead }
}

export function useInitDemo() {
  return useCallback(() => {
    store.addDemoData()
  }, [])
}
