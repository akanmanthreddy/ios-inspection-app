import { useState } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import logo from 'figma:asset/a9104ca5d97d973d81bd09faef4cc958aca2b5ac.png';

interface Property {
  id: string;
  address: string;
  propertyType: string;
  status: 'active' | 'under-construction' | 'sold';
  lastInspection: string | null;
  nextInspection: string;
  inspector: string;
  issues: number;
}

type FilterStatus = 'all' | 'active' | 'under-construction' | 'sold';

interface PropertiesPageProps {
  communityId: string;
  onBack: () => void;
  onSelectProperty: (propertyId: string, propertyAddress: string) => void;
  onViewReports?: (propertyId: string, propertyAddress: string) => void;
  onAddUnits?: () => void;
  onStartInspection?: (propertyId: string, propertyAddress: string) => void;
}

export function PropertiesPage({ communityId, onBack, onSelectProperty, onViewReports, onAddUnits, onStartInspection }: PropertiesPageProps) {
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');
  
  // Mock data - in real app this would come from your backend based on communityId
  const communityName = getCommunityName(communityId);
  
  const properties: Property[] = [
    {
      id: '1',
      address: '1234 Oak Street',
      propertyType: 'Single Family',
      status: 'active',
      lastInspection: '2024-01-01',
      nextInspection: '2024-01-20',
      inspector: 'John Smith',
      issues: 0
    },
    {
      id: '2',
      address: '1236 Oak Street',
      propertyType: 'Townhome',
      status: 'active',
      lastInspection: '2024-01-15',
      nextInspection: '2024-02-15',
      inspector: 'Sarah Johnson',
      issues: 2
    },
    {
      id: '3',
      address: '1238 Oak Street',
      propertyType: 'Single Family',
      status: 'under-construction',
      lastInspection: '2023-12-15',
      nextInspection: '2024-01-18',
      inspector: 'Mike Davis',
      issues: 1
    },
    {
      id: '4',
      address: '1240 Oak Street',
      propertyType: 'Duplex',
      status: 'sold',
      lastInspection: '2023-11-20',
      nextInspection: '2024-01-10',
      inspector: 'Lisa Wilson',
      issues: 5
    },
    {
      id: '5',
      address: '1242 Oak Street',
      propertyType: 'Single Family',
      status: 'active',
      lastInspection: '2024-01-05',
      nextInspection: '2024-01-25',
      inspector: 'John Smith',
      issues: 0
    },
    {
      id: '6',
      address: '1244 Oak Street',
      propertyType: 'Townhome',
      status: 'under-construction',
      lastInspection: '2024-01-12',
      nextInspection: '2024-02-12',
      inspector: 'Sarah Johnson',
      issues: 1
    }
  ];

  // Filter properties based on active filter
  const filteredProperties = activeFilter === 'all' 
    ? properties 
    : properties.filter(property => property.status === activeFilter);

  function getCommunityName(id: string): string {
    const communities: Record<string, string> = {
      '1': 'Oakwood Manor',
      '2': 'Riverside Gardens',
      '3': 'Sunset Hills',
      '4': 'Pine Valley Estates',
      '5': 'Meadowbrook Commons',
      '6': 'Crystal Lake'
    };
    return communities[id] || 'Unknown Community';
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#1b365d';
      case 'under-construction':
        return '#4698cb';
      case 'sold':
        return '#768692';
      default:
        return '#768692';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'under-construction':
        return 'Under Construction';
      case 'sold':
        return 'Sold';
      default:
        return status;
    }
  };

  const handleFilterClick = (filter: FilterStatus) => {
    setActiveFilter(filter);
  };

  const getIssuesBadgeColor = (count: number) => {
    if (count === 0) return '#1b365d';
    if (count <= 2) return '#4698cb';
    if (count <= 4) return '#768692';
    return '#dc2626';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <img 
              src={logo} 
              alt="Haven Realty Capital" 
              className="h-12 w-auto"
            />
            <div>
              <h1 style={{ color: '#1b365d', fontSize: '1.5rem', fontWeight: '600' }}>
                {communityName} Properties
              </h1>
              <p style={{ color: '#768692' }}>Select a property to view inspection details</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {onAddUnits && (
              <Button 
                onClick={onAddUnits}
                style={{ backgroundColor: '#4698cb', color: '#ffffff' }}
              >
                + Add Units
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={onBack}
              style={{ color: '#1b365d', borderColor: '#1b365d' }}
            >
              ← Back to Communities
            </Button>
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div 
            className={`text-center p-4 rounded-lg cursor-pointer transition-all ${activeFilter === 'all' ? 'ring-2' : 'hover:shadow-md'}`}
            style={{ 
              backgroundColor: activeFilter === 'all' ? '#e3f2fd' : '#f8f9fa',
              ringColor: activeFilter === 'all' ? '#1b365d' : 'transparent'
            }}
            onClick={() => handleFilterClick('all')}
          >
            <div style={{ color: '#1b365d', fontSize: '1.5rem', fontWeight: '600' }}>
              {properties.length}
            </div>
            <div style={{ color: '#768692', fontSize: '0.875rem' }}>Total Properties</div>
          </div>
          <div 
            className={`text-center p-4 rounded-lg cursor-pointer transition-all ${activeFilter === 'active' ? 'ring-2' : 'hover:shadow-md'}`}
            style={{ 
              backgroundColor: activeFilter === 'active' ? '#e3f2fd' : '#f8f9fa',
              ringColor: activeFilter === 'active' ? '#1b365d' : 'transparent'
            }}
            onClick={() => handleFilterClick('active')}
          >
            <div style={{ color: '#1b365d', fontSize: '1.5rem', fontWeight: '600' }}>
              {properties.filter(p => p.status === 'active').length}
            </div>
            <div style={{ color: '#768692', fontSize: '0.875rem' }}>Active</div>
          </div>
          <div 
            className={`text-center p-4 rounded-lg cursor-pointer transition-all ${activeFilter === 'under-construction' ? 'ring-2' : 'hover:shadow-md'}`}
            style={{ 
              backgroundColor: activeFilter === 'under-construction' ? '#e3f2fd' : '#f8f9fa',
              ringColor: activeFilter === 'under-construction' ? '#4698cb' : 'transparent'
            }}
            onClick={() => handleFilterClick('under-construction')}
          >
            <div style={{ color: '#4698cb', fontSize: '1.5rem', fontWeight: '600' }}>
              {properties.filter(p => p.status === 'under-construction').length}
            </div>
            <div style={{ color: '#768692', fontSize: '0.875rem' }}>Under Construction</div>
          </div>
          <div 
            className={`text-center p-4 rounded-lg cursor-pointer transition-all ${activeFilter === 'sold' ? 'ring-2' : 'hover:shadow-md'}`}
            style={{ 
              backgroundColor: activeFilter === 'sold' ? '#e3f2fd' : '#f8f9fa',
              ringColor: activeFilter === 'sold' ? '#768692' : 'transparent'
            }}
            onClick={() => handleFilterClick('sold')}
          >
            <div style={{ color: '#768692', fontSize: '1.5rem', fontWeight: '600' }}>
              {properties.filter(p => p.status === 'sold').length}
            </div>
            <div style={{ color: '#768692', fontSize: '0.875rem' }}>Sold</div>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <Card 
              key={property.id}
              className="transition-all hover:shadow-lg border-2"
              style={{ borderColor: '#e5e7eb' }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle style={{ color: '#1b365d', marginBottom: '0.5rem' }}>
                      {property.address}
                    </CardTitle>
                    <CardDescription style={{ color: '#768692' }}>
                      {property.propertyType}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Badge 
                      variant="secondary"
                      style={{ 
                        backgroundColor: getStatusColor(property.status),
                        color: '#ffffff',
                        fontSize: '0.75rem'
                      }}
                    >
                      {getStatusLabel(property.status)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onStartInspection) {
                        onStartInspection(property.id, property.address);
                      }
                    }}
                    className="flex items-center justify-center space-x-2 py-2 px-2 rounded-lg border transition-colors hover:bg-opacity-90"
                    style={{ 
                      backgroundColor: '#1b365d', 
                      borderColor: '#1b365d',
                      color: '#ffffff'
                    }}
                  >
                    <span style={{ fontSize: '0.75rem' }}>Start Inspection</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProperty(property.id, property.address);
                    }}
                    className="flex items-center justify-center space-x-2 py-2 px-2 rounded-lg border transition-colors hover:bg-opacity-90"
                    style={{ 
                      backgroundColor: '#4698cb', 
                      borderColor: '#4698cb',
                      color: '#ffffff'
                    }}
                  >
                    <span style={{ fontSize: '0.75rem' }}>View Inspections</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onViewReports) {
                        onViewReports(property.id, property.address);
                      }
                    }}
                    className="flex items-center justify-center space-x-2 py-2 px-2 rounded-lg border transition-colors hover:bg-gray-50"
                    style={{ 
                      backgroundColor: 'transparent', 
                      borderColor: '#4698cb',
                      color: '#4698cb'
                    }}
                  >
                    <span style={{ fontSize: '0.75rem' }}>View Reports</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}