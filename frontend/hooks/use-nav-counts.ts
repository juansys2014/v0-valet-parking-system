"use client"

import { useState, useEffect, useCallback } from 'react'
import { getActive, getAlerts } from "@/lib/api/endpoints"

const POLL_INTERVAL_MS = 10000

export function useNavCounts() {
  const [parkedCount, setParkedCount] = useState(0)
  const [alertsCount, setAlertsCount] = useState(0)

  const fetchCounts = useCallback(async () => {
    try {
      const [activeRes, alertsRes] = await Promise.all([
        getActive(),
        getAlerts(),
      ])
      setParkedCount(activeRes.tickets.length)
      setAlertsCount(alertsRes.requested.length + alertsRes.ready.length)
    } catch {
      setParkedCount(0)
      setAlertsCount(0)
    }
  }, [])

  useEffect(() => {
    fetchCounts()
    const interval = setInterval(fetchCounts, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [fetchCounts])

  return { parkedCount, alertsCount }
}
