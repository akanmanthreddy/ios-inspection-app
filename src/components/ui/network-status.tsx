import { motion, AnimatePresence } from 'framer-motion'
import { Wifi, WifiOff, AlertTriangle, CheckCircle } from 'lucide-react'
import { useNetworkStatus } from '../../hooks/useNetworkStatus'
import { cn } from './utils'

interface NetworkStatusIndicatorProps {
  className?: string
  showWhenOnline?: boolean
  position?: 'top' | 'bottom'
}

export function NetworkStatusIndicator({ 
  className,
  showWhenOnline = false,
  position = 'top'
}: NetworkStatusIndicatorProps) {
  const { isOnline, isSlowConnection } = useNetworkStatus()

  const shouldShow = !isOnline || (showWhenOnline && isOnline) || isSlowConnection

  if (!shouldShow) return null

  const getStatusContent = () => {
    if (!isOnline) {
      return {
        icon: WifiOff,
        text: 'No internet connection',
        bgColor: 'bg-red-500',
        textColor: 'text-white'
      }
    }
    
    if (isSlowConnection) {
      return {
        icon: AlertTriangle,
        text: 'Slow connection detected',
        bgColor: 'bg-orange-500',
        textColor: 'text-white'
      }
    }
    
    return {
      icon: CheckCircle,
      text: 'Connected',
      bgColor: 'bg-green-500',
      textColor: 'text-white'
    }
  }

  const { icon: Icon, text, bgColor, textColor } = getStatusContent()

  return (
    <AnimatePresence>
      <motion.div
        initial={{ 
          y: position === 'top' ? -50 : 50, 
          opacity: 0 
        }}
        animate={{ 
          y: 0, 
          opacity: 1 
        }}
        exit={{ 
          y: position === 'top' ? -50 : 50, 
          opacity: 0 
        }}
        transition={{ 
          duration: 0.3,
          ease: "easeInOut"
        }}
        className={cn(
          'fixed left-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg',
          bgColor,
          textColor,
          position === 'top' ? 'top-4' : 'bottom-4',
          className
        )}
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" />
          <span className="text-sm font-medium">{text}</span>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

interface NetworkStatusBadgeProps {
  className?: string
  size?: 'sm' | 'md'
}

export function NetworkStatusBadge({ 
  className,
  size = 'sm'
}: NetworkStatusBadgeProps) {
  const { isOnline, isSlowConnection, connectionType } = useNetworkStatus()

  const getStatusIcon = () => {
    if (!isOnline) return WifiOff
    if (isSlowConnection) return AlertTriangle
    return Wifi
  }

  const getStatusColor = () => {
    if (!isOnline) return 'text-red-500'
    if (isSlowConnection) return 'text-orange-500'
    return 'text-green-500'
  }

  const Icon = getStatusIcon()
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Icon className={cn(iconSize, getStatusColor())} />
      {size === 'md' && (
        <span className={cn('text-xs', getStatusColor())}>
          {!isOnline ? 'Offline' : isSlowConnection ? 'Slow' : connectionType || 'Online'}
        </span>
      )}
    </div>
  )
}

interface OfflineFallbackProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  className?: string
}

export function OfflineFallback({ 
  children, 
  fallback,
  className 
}: OfflineFallbackProps) {
  const { isOnline } = useNetworkStatus()

  if (!isOnline && fallback) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={className}
      >
        {fallback}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Hook to trigger actions when connection status changes
export function useOfflineActions() {
  const { isOnline } = useNetworkStatus()
  
  const showOfflineMessage = () => {
    // You can integrate with toast libraries here
    console.log('You are now offline')
  }

  const showOnlineMessage = () => {
    // You can integrate with toast libraries here
    console.log('You are back online')
  }

  // You could add useEffect here to trigger these actions
  // when status changes

  return {
    isOnline,
    showOfflineMessage,
    showOnlineMessage
  }
}