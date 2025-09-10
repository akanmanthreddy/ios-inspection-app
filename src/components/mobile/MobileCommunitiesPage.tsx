import { useState } from 'react';
import { ChevronLeft, Plus, MapPin, Calendar, Users } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface MobileCommunitiesPageProps {
  onBack: () => void;
  onSelectCommunity: (communityId: string) => void;
}

export function MobileCommunitiesPage({
  onBack,
  onSelectCommunity
}: MobileCommunitiesPageProps) {
  // Mock data - in production this would come from props or hooks
  const communities = [
    {
      id: '1',
      name: 'Sunset Ridge',
      location: 'North Austin',
      status: 'Active' as const,
      units: 45,
      lastInspection: '2024-01-15',
      totalInspections: 128
    },
    {
      id: '2',
      name: 'Oak Valley',
      location: 'South Austin',
      status: 'Under Construction' as const,
      units: 32,
      lastInspection: '2024-01-12',
      totalInspections: 89
    },
    {
      id: '3',
      name: 'Pine Harbor',
      location: 'West Austin',
      status: 'Active' as const,
      units: 28,
      lastInspection: '2024-01-10',
      totalInspections: 156
    },
    {
      id: '4',
      name: 'Maple Heights',
      location: 'East Austin',
      status: 'Sold' as const,
      units: 18,
      lastInspection: '2024-01-08',
      totalInspections: 67
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'Under Construction':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'Sold':
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

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
                  <div className="flex items-center text-muted text-sm mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    {community.location}
                  </div>
                </div>
                <Badge className={getStatusColor(community.status)}>
                  {community.status}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-3 border-t border-border/30">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Users className="w-4 h-4 text-muted mr-1" />
                  </div>
                  <div className="text-lg font-medium text-primary">{community.units}</div>
                  <div className="text-xs text-muted">Units</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Calendar className="w-4 h-4 text-muted mr-1" />
                  </div>
                  <div className="text-lg font-medium text-secondary">{community.totalInspections}</div>
                  <div className="text-xs text-muted">Inspections</div>
                </div>
                
                <div className="text-center">
                  <div className="text-xs text-muted mb-1">Last Inspection</div>
                  <div className="text-sm font-medium">
                    {new Date(community.lastInspection).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
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