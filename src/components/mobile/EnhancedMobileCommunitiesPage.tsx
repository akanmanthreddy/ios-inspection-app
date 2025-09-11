import { useState } from 'react';
import { ChevronLeft, Plus, MapPin, Calendar, Users } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useCommunities } from '../../hooks/useCommunities';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

// New UX components
import { CommunityListSkeleton } from '../skeletons/CommunityCardSkeleton';
import { NoCommunities, ErrorState, OfflineState } from '../ui/empty-state';
import { NetworkStatusIndicator, OfflineFallback } from '../ui/network-status';
import { PullToRefresh } from '../ui/pull-to-refresh';
import { AnimatedList, FadeIn, SlideIn } from '../ui/animated-list';

interface EnhancedMobileCommunitiesPageProps {
  onBack: () => void;
  onSelectCommunity: (communityId: string) => void;
}

export function EnhancedMobileCommunitiesPage({
  onBack,
  onSelectCommunity
}: EnhancedMobileCommunitiesPageProps) {
  const { communities, loading, error, refetch } = useCommunities();
  const { isOnline } = useNetworkStatus();
  const [refreshing, setRefreshing] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'under-construction':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'sold':
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const handleRetry = () => {
    refetch();
  };

  // Show skeleton loading state
  if (loading && !refreshing) {
    return (
      <div className="min-h-screen bg-background">
        {/* Animated header skeleton */}
        <FadeIn className="bg-primary text-primary-foreground px-6 pt-12 pb-6">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-primary-foreground/20 rounded-lg mr-3 animate-pulse" />
            <div className="h-6 w-32 bg-primary-foreground/20 rounded animate-pulse" />
          </div>
          <div className="h-8 w-48 bg-primary-foreground/20 rounded mb-2 animate-pulse" />
          <div className="h-4 w-64 bg-primary-foreground/20 rounded animate-pulse" />
        </FadeIn>
        
        <div className="p-6 pb-20">
          <CommunityListSkeleton count={4} />
        </div>
      </div>
    );
  }

  // Show offline state when not connected
  if (!isOnline && !communities.length) {
    return (
      <div className="min-h-screen bg-background">
        <NetworkStatusIndicator />
        <div className="min-h-screen flex items-center justify-center">
          <OfflineState />
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !communities.length) {
    return (
      <div className="min-h-screen bg-background">
        <NetworkStatusIndicator />
        <div className="min-h-screen flex items-center justify-center">
          <ErrorState 
            description={error}
            onRetry={handleRetry}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Network status indicator */}
      <NetworkStatusIndicator showWhenOnline={false} />
      
      {/* Animated Header */}
      <SlideIn direction="down" className="bg-primary text-primary-foreground px-6 pt-12 pb-6">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-primary-foreground hover:bg-primary-foreground/20 mr-3"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold">Communities</h1>
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Property Communities</h2>
          <p className="text-primary-foreground/80">
            Select a community to view its properties and schedule inspections
          </p>
        </div>
      </SlideIn>

      <PullToRefresh
        onRefresh={handleRefresh}
        className="flex-1"
      >
        <div className="p-6">
          <OfflineFallback
            fallback={
              <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-orange-800 text-sm">
                  You're viewing cached data. Some information may be outdated.
                </p>
              </div>
            }
          >
            {/* Show empty state when no communities */}
            {communities.length === 0 ? (
              <FadeIn delay={0.2}>
                <NoCommunities />
              </FadeIn>
            ) : (
              /* Animated communities list */
              <AnimatedList staggerDelay={0.1}>
                {communities.map((community) => (
                  <Card 
                    key={community.id} 
                    className="p-4 border border-border/50 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-border active:scale-[0.98]"
                    onClick={() => onSelectCommunity(community.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-lg mb-1">{community.name}</h3>
                        <div className="flex items-center text-muted-foreground text-sm mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          {community.location}
                        </div>
                      </div>
                      <Badge className={getStatusColor(community.status)}>
                        {formatStatus(community.status)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-3 border-t border-border/30">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Users className="w-4 h-4 text-muted-foreground mr-1" />
                        </div>
                        <div className="text-lg font-medium text-primary">
                          {(community as any).active_units || (community as any).total_units || community.totalUnits}
                        </div>
                        <div className="text-xs text-muted-foreground">Units</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Calendar className="w-4 h-4 text-muted-foreground mr-1" />
                        </div>
                        <div className="text-lg font-medium text-secondary">
                          {(community as any).totalInspections || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">Inspections</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Calendar className="w-4 h-4 text-muted-foreground mr-1" />
                        </div>
                        <div className="text-lg font-medium text-secondary">
                          {(community as any).completedInspections || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">Completed</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </AnimatedList>
            )}
          </OfflineFallback>

          {/* Add Community Button - only show when online */}
          {isOnline && (
            <FadeIn delay={0.5} className="mt-6">
              <Button 
                className="w-full gap-2"
                onClick={() => {/* Handle add community */}}
              >
                <Plus className="w-4 h-4" />
                Add New Community
              </Button>
            </FadeIn>
          )}
        </div>
      </PullToRefresh>
    </div>
  );
}