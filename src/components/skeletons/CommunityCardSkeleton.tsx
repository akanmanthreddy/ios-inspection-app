import { Card } from '../ui/card'
import { Skeleton } from '../ui/skeleton'

export function CommunityCardSkeleton() {
  return (
    <Card className="p-4 border border-border/50">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          {/* Community name */}
          <Skeleton className="h-6 w-3/4 mb-2" />
          
          {/* Location */}
          <div className="flex items-center mb-2">
            <Skeleton className="h-4 w-4 mr-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          
          {/* Status badge */}
          <Skeleton className="h-5 w-20" />
        </div>
        
        {/* Stats */}
        <div className="text-right ml-4">
          <Skeleton className="h-6 w-8 mb-1" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
      
      {/* Bottom stats row */}
      <div className="flex justify-between items-center pt-3 border-t border-border/30">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Skeleton className="h-4 w-4 mr-1" />
          </div>
          <Skeleton className="h-6 w-6 mx-auto mb-1" />
          <Skeleton className="h-3 w-10" />
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Skeleton className="h-4 w-4 mr-1" />
          </div>
          <Skeleton className="h-6 w-6 mx-auto mb-1" />
          <Skeleton className="h-3 w-12" />
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Skeleton className="h-4 w-4 mr-1" />
          </div>
          <Skeleton className="h-6 w-6 mx-auto mb-1" />
          <Skeleton className="h-3 w-14" />
        </div>
      </div>
    </Card>
  )
}

export function CommunityListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <CommunityCardSkeleton key={index} />
      ))}
    </div>
  )
}