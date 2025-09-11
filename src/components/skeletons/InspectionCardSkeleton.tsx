import { Card } from '../ui/card'
import { Skeleton } from '../ui/skeleton'

export function InspectionCardSkeleton() {
  return (
    <Card className="p-4 border border-border/50">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          {/* Property address */}
          <Skeleton className="h-5 w-4/5 mb-2" />
          
          {/* Inspector and date */}
          <div className="flex items-center gap-4 mb-2">
            <div className="flex items-center">
              <Skeleton className="h-4 w-4 mr-2" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex items-center">
              <Skeleton className="h-4 w-4 mr-2" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          
          {/* Type and status */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-14" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
        
        {/* Action button */}
        <Skeleton className="h-8 w-16" />
      </div>
      
      {/* Issues count (if any) */}
      <div className="pt-3 border-t border-border/30">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </Card>
  )
}

export function InspectionListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <InspectionCardSkeleton key={index} />
      ))}
    </div>
  )
}