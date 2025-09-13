import { ChevronLeft, MapPin, Users } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useCommunities } from '../../hooks/useCommunities';

interface MobileCommunitiesPageProps {
  onBack: () => void;
  onSelectCommunity: (communityId: string) => void;
}

export function MobileCommunitiesPage({
  onBack,
  onSelectCommunity
}: MobileCommunitiesPageProps) {
  // Use real API data via the hook
  const { communities, loading, error } = useCommunities();

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading communities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading communities:</p>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-6 pt-12 pb-6">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2 mr-2 hover:bg-primary-foreground/10"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-medium">Communities</h1>
        </div>
        
        <div>
          <p className="text-primary-foreground/80 text-sm">
            {communities.length} communities available
          </p>
        </div>
      </div>

      {/* Communities List */}
      <div className="px-6 py-6">
        <div className="space-y-4">
          {communities.map((community) => (
            <Card
              key={community.id}
              className="p-4 cursor-pointer transition-all duration-200 active:scale-95 border border-border/50 hover:shadow-md"
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

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/30">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Users className="w-4 h-4 text-muted-foreground mr-1" />
                  </div>
                  <div className="text-lg font-medium text-primary">{community.active_units || community.total_units || 0}</div>
                  <div className="text-xs text-muted-foreground">Active Units</div>
                </div>
                
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">Created</div>
                  <div className="text-sm font-medium">
                    {new Date(community.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom Safe Area */}
      <div className="h-8"></div>
    </div>
  );
}