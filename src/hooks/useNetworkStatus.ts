import { useState, useEffect, useCallback } from 'react'

export interface NetworkStatus {
  isOnline: boolean
  isSlowConnection: boolean
  connectionType?: string
  lastOnlineTime?: Date
}

export function useNetworkStatus(): NetworkStatus & {
  ping: () => Promise<boolean>
} {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSlowConnection: false,
    lastOnlineTime: new Date()
  })

  // Ping function to test actual connectivity
  const ping = useCallback(async (): Promise<boolean> => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
      
      const response = await fetch('/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      return response.ok
    } catch {
      return false
    }
  }, [])

  // Test connection speed
  const testConnectionSpeed = useCallback(async (): Promise<boolean> => {
    const startTime = Date.now()
    const isConnected = await ping()
    const endTime = Date.now()
    
    // Consider connection slow if ping takes more than 2 seconds
    return isConnected && (endTime - startTime) > 2000
  }, [ping])

  // Handle online/offline events
  const handleOnline = useCallback(async () => {
    const isActuallyOnline = await ping()
    const isSlowConnection = await testConnectionSpeed()
    
    setNetworkStatus(prev => ({
      ...prev,
      isOnline: isActuallyOnline,
      isSlowConnection,
      lastOnlineTime: isActuallyOnline ? new Date() : prev.lastOnlineTime
    }))
  }, [ping, testConnectionSpeed])

  const handleOffline = useCallback(() => {
    setNetworkStatus(prev => ({
      ...prev,
      isOnline: false,
      isSlowConnection: false
    }))
  }, [])

  useEffect(() => {
    // Initial connection test
    handleOnline()

    // Listen for network changes
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Periodic connectivity check (every 30 seconds)
    const intervalId = setInterval(async () => {
      if (navigator.onLine) {
        await handleOnline()
      }
    }, 30000)

    // Connection type detection (if available)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      setNetworkStatus(prev => ({
        ...prev,
        connectionType: connection?.effectiveType || 'unknown'
      }))

      const handleConnectionChange = () => {
        setNetworkStatus(prev => ({
          ...prev,
          connectionType: connection?.effectiveType || 'unknown',
          isSlowConnection: ['slow-2g', '2g'].includes(connection?.effectiveType)
        }))
      }

      connection?.addEventListener('change', handleConnectionChange)

      return () => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
        connection?.removeEventListener('change', handleConnectionChange)
        clearInterval(intervalId)
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(intervalId)
    }
  }, [handleOnline, handleOffline])

  return {
    ...networkStatus,
    ping
  }
}