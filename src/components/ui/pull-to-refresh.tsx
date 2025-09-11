import { useState, useRef, useCallback, ReactNode } from 'react'
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { RefreshCw, ArrowDown } from 'lucide-react'
import { cn } from './utils'

interface PullToRefreshProps {
  children: ReactNode
  onRefresh: () => Promise<void>
  className?: string
  refreshThreshold?: number
  maxPullDistance?: number
  isDisabled?: boolean
}

export function PullToRefresh({
  children,
  onRefresh,
  className,
  refreshThreshold = 80,
  maxPullDistance = 120,
  isDisabled = false
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullProgress, setPullProgress] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const y = useMotionValue(0)
  const refresherOpacity = useTransform(y, [0, refreshThreshold / 2], [0, 1])
  const refresherRotation = useTransform(y, [0, refreshThreshold], [0, 180])
  const refresherScale = useTransform(y, [0, refreshThreshold], [0.8, 1])

  const handleRefresh = useCallback(async () => {
    if (isRefreshing || isDisabled) return

    setIsRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setIsRefreshing(false)
      y.set(0)
      setPullProgress(0)
    }
  }, [onRefresh, isRefreshing, isDisabled, y])

  const handleDragStart = useCallback(() => {
    if (isDisabled) return
    
    // Only allow pull-to-refresh if we're at the top of the scroll container
    const container = containerRef.current
    if (container && container.scrollTop > 0) {
      return false
    }
  }, [isDisabled])

  const handleDrag = useCallback((_: any, info: PanInfo) => {
    if (isDisabled || isRefreshing) return

    const { offset } = info
    const pullDistance = Math.max(0, Math.min(offset.y, maxPullDistance))
    
    y.set(pullDistance)
    setPullProgress(pullDistance / refreshThreshold)
  }, [isDisabled, isRefreshing, maxPullDistance, refreshThreshold, y])

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    if (isDisabled || isRefreshing) return

    const { offset } = info
    
    if (offset.y >= refreshThreshold) {
      handleRefresh()
    } else {
      // Snap back to original position
      y.set(0)
      setPullProgress(0)
    }
  }, [isDisabled, isRefreshing, refreshThreshold, handleRefresh, y])

  const getRefresherIcon = () => {
    if (isRefreshing) {
      return <RefreshCw className="w-5 h-5 animate-spin" />
    }
    
    if (pullProgress >= 1) {
      return <RefreshCw className="w-5 h-5" />
    }
    
    return <ArrowDown className="w-5 h-5" />
  }

  const getRefresherText = () => {
    if (isRefreshing) return 'Refreshing...'
    if (pullProgress >= 1) return 'Release to refresh'
    return 'Pull to refresh'
  }

  return (
    <div ref={containerRef} className={cn('relative overflow-hidden', className)}>
      {/* Pull-to-refresh indicator */}
      <motion.div
        className="absolute top-0 left-0 right-0 flex items-center justify-center py-4 bg-background/90 backdrop-blur-sm border-b border-border/50 z-10"
        style={{
          opacity: refresherOpacity,
          scale: refresherScale,
          y: useTransform(y, [0, refreshThreshold], [-50, 0])
        }}
      >
        <div className="flex flex-col items-center text-muted-foreground">
          <motion.div
            style={{ rotate: refresherRotation }}
            className={cn(
              'mb-2 transition-colors duration-200',
              pullProgress >= 1 ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            {getRefresherIcon()}
          </motion.div>
          
          <span className={cn(
            'text-xs font-medium transition-colors duration-200',
            pullProgress >= 1 ? 'text-primary' : 'text-muted-foreground'
          )}>
            {getRefresherText()}
          </span>
          
          {/* Progress indicator */}
          <div className="w-8 h-1 bg-muted rounded-full mt-2 overflow-hidden">
            <motion.div
              className="h-full bg-primary origin-left"
              style={{
                scaleX: Math.min(pullProgress, 1)
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.3, bottom: 0 }}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ y }}
        className="will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  )
}

// Simpler pull-to-refresh for touch devices
interface SimplePullToRefreshProps {
  children: ReactNode
  onRefresh: () => Promise<void>
  className?: string
}

export function SimplePullToRefresh({
  children,
  onRefresh,
  className
}: SimplePullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    if (isRefreshing) return
    
    setIsRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className={className}>
      {/* Simple refresh button for fallback */}
      {isRefreshing && (
        <div className="flex items-center justify-center py-4 bg-muted/50">
          <RefreshCw className="w-4 h-4 animate-spin mr-2" />
          <span className="text-sm text-muted-foreground">Refreshing...</span>
        </div>
      )}
      
      <PullToRefresh onRefresh={handleRefresh}>
        {children}
      </PullToRefresh>
    </div>
  )
}