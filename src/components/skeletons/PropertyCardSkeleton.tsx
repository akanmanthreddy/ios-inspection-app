import { Card } from '../ui/card'
import { Skeleton } from '../ui/skeleton'

export function PropertyCardSkeleton() {
  return (
    <Card className="p-4 border border-border/50">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          {/* Property address */}
          <Skeleton className="h-5 w-5/6 mb-2" />
          
          {/* Property type and status */}
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-12" />
          </div>
          
          {/* Inspector */}
          <div className="flex items-center">
            <Skeleton className="h-4 w-4 mr-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        
        {/* Issues count */}
        <div className="text-right">
          <Skeleton className="h-6 w-6 mb-1" />
          <Skeleton className="h-3 w-10" />
        </div>
      </div>
      
      {/* Bottom inspection info */}
      <div className="flex justify-between items-center pt-3 border-t border-border/30">
        <div>
          <Skeleton className="h-3 w-20 mb-1" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="text-right">
          <Skeleton className="h-3 w-24 mb-1" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </Card>
  )
}

export function PropertyListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <PropertyCardSkeleton key={index} />
      ))}
    </div>
  )
}