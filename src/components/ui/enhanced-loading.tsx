import { Loader2, Wifi, WifiOff } from 'lucide-react'
import { cn } from './utils'

interface EnhancedLoadingProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  showSpinner?: boolean
  className?: string
  isOffline?: boolean
}

export function EnhancedLoading({
  size = 'md',
  text = 'Loading...',
  showSpinner = true,
  className,
  isOffline = false
}: EnhancedLoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  return (
    <div className={cn('flex flex-col items-center justify-center p-8', className)}>
      <div className="flex items-center mb-4">
        {showSpinner && (
          <Loader2 className={cn('animate-spin mr-2', sizeClasses[size])} />
        )}
        {isOffline && (
          <WifiOff className={cn('mr-2 text-orange-500', sizeClasses[size])} />
        )}
      </div>
      
      <p className={cn('text-muted-foreground', textSizeClasses[size])}>
        {isOffline ? 'Working offline...' : text}
      </p>
      
      {isOffline && (
        <p className="text-xs text-orange-600 mt-2">
          Some features may be limited
        </p>
      )}
    </div>
  )
}

interface PageLoadingProps {
  title?: string
  description?: string
  isOffline?: boolean
}

export function PageLoading({ 
  title = 'Loading', 
  description,
  isOffline = false 
}: PageLoadingProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center max-w-sm mx-auto px-4">
        {/* Header placeholder */}
        <div className="h-12 bg-primary/10 rounded-lg mb-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
        
        {/* Content */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">{title}</h2>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        
        {/* Status indicator */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {isOffline ? (
            <>
              <WifiOff className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-orange-600">Working offline</span>
            </>
          ) : (
            <>
              <Wifi className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600">Connected</span>
            </>
          )}
        </div>
        
        {/* Loading dots animation */}
        <div className="mt-8 flex justify-center space-x-1">
          <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
          <div className="h-2 w-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="h-2 w-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  )
}