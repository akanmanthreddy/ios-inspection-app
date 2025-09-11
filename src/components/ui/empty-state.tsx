import { LucideIcon, Plus, Search, AlertCircle, Wifi } from 'lucide-react'
import { Button } from './button'
import { cn } from './utils'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
  variant?: 'default' | 'error' | 'offline'
}

export function EmptyState({
  icon: Icon = Search,
  title,
  description,
  action,
  className,
  variant = 'default'
}: EmptyStateProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'error':
        return {
          iconColor: 'text-red-500',
          bgColor: 'bg-red-500/10',
          titleColor: 'text-red-900 dark:text-red-100'
        }
      case 'offline':
        return {
          iconColor: 'text-orange-500',
          bgColor: 'bg-orange-500/10',
          titleColor: 'text-orange-900 dark:text-orange-100'
        }
      default:
        return {
          iconColor: 'text-muted-foreground',
          bgColor: 'bg-muted/50',
          titleColor: 'text-foreground'
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center py-12 px-6',
      className
    )}>
      {/* Icon */}
      <div className={cn(
        'w-16 h-16 rounded-full flex items-center justify-center mb-4',
        styles.bgColor
      )}>
        <Icon className={cn('w-8 h-8', styles.iconColor)} />
      </div>
      
      {/* Title */}
      <h3 className={cn('text-lg font-semibold mb-2', styles.titleColor)}>
        {title}
      </h3>
      
      {/* Description */}
      <p className="text-muted-foreground max-w-sm mb-6">
        {description}
      </p>
      
      {/* Action Button */}
      {action && (
        <Button onClick={action.onClick} className="gap-2">
          <Plus className="w-4 h-4" />
          {action.label}
        </Button>
      )}
    </div>
  )
}

// Specific empty states for common scenarios
export function NoCommunities({ onAddCommunity }: { onAddCommunity?: () => void }) {
  return (
    <EmptyState
      title="No communities found"
      description="You haven't added any communities yet. Create your first community to get started with property inspections."
      action={onAddCommunity ? {
        label: 'Add Community',
        onClick: onAddCommunity
      } : undefined}
    />
  )
}

export function NoProperties({ onAddProperty }: { onAddProperty?: () => void }) {
  return (
    <EmptyState
      title="No properties found"
      description="This community doesn't have any properties yet. Add properties to start scheduling inspections."
      action={onAddProperty ? {
        label: 'Add Property',
        onClick: onAddProperty
      } : undefined}
    />
  )
}

export function NoInspections({ onScheduleInspection }: { onScheduleInspection?: () => void }) {
  return (
    <EmptyState
      title="No inspections scheduled"
      description="There are no inspections scheduled for this property. Schedule an inspection to get started."
      action={onScheduleInspection ? {
        label: 'Schedule Inspection',
        onClick: onScheduleInspection
      } : undefined}
    />
  )
}

export function SearchNoResults({ searchTerm }: { searchTerm: string }) {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description={`We couldn't find anything matching "${searchTerm}". Try searching with different keywords.`}
    />
  )
}

export function ErrorState({ 
  title = 'Something went wrong',
  description = 'An error occurred while loading data. Please try again.',
  onRetry
}: {
  title?: string
  description?: string
  onRetry?: () => void
}) {
  return (
    <EmptyState
      icon={AlertCircle}
      title={title}
      description={description}
      variant="error"
      action={onRetry ? {
        label: 'Try Again',
        onClick: onRetry
      } : undefined}
    />
  )
}

export function OfflineState({
  title = 'You\'re offline',
  description = 'Some features may not be available. Check your internet connection and try again.'
}: {
  title?: string
  description?: string
}) {
  return (
    <EmptyState
      icon={Wifi}
      title={title}
      description={description}
      variant="offline"
    />
  )
}