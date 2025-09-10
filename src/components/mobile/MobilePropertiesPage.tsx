import { useState, useMemo } from 'react';
import { ChevronLeft, Plus, Home, Calendar, FileText, PlayCircle, Search, X, BarChart3 } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';

interface MobilePropertiesPageProps {
  communityId: string;
  onBack: () => void;
  onSelectProperty: (propertyId: string, address: string) => void;
  onViewReports: (propertyId: string, address: string) => void;
  onStartInspection: (propertyId: string, address: string) => void;
}

export function MobilePropertiesPage({
  communityId,
  onBack,
  onSelectProperty,
  onViewReports,
  onStartInspection
}: MobilePropertiesPageProps) {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - in production this would come from props or hooks
  const communityName = 'Sunset Ridge';
  const allProperties = [
    {
      id: '1',
      address: '1234 Oak Street, Unit A',
      unit: 'A-101',
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1200,
      lastInspection: '2024-01-15',
      inspectionCount: 5,
      status: 'Ready' as const
    },
    {
      id: '2',
      address: '1234 Oak Street, Unit B',
      unit: 'A-102',
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1450,
      lastInspection: '2024-01-12',
      inspectionCount: 3,
      status: 'Needs Inspection' as const
    },
    {
      id: '3',
      address: '1234 Oak Street, Unit C',
      unit: 'A-103',
      bedrooms: 1,
      bathrooms: 1,
      sqft: 850,
      lastInspection: '2024-01-10',
      inspectionCount: 7,
      status: 'In Progress' as const
    },
    {
      id: '4',
      address: '1234 Oak Street, Unit D',
      unit: 'A-104',
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1200,
      lastInspection: '2024-01-08',
      inspectionCount: 2,
      status: 'Ready' as const
    },
    {
      id: '5',
      address: '1234 Oak Street, Unit E',
      unit: 'B-201',
      bedrooms: 3,
      bathrooms: 2.5,
      sqft: 1650,
      lastInspection: '2024-01-05',
      inspectionCount: 4,
      status: 'Ready' as const
    },
    {
      id: '6',
      address: '1234 Oak Street, Unit F',
      unit: 'B-202',
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1200,
      lastInspection: '2024-01-03',
      inspectionCount: 6,
      status: 'Needs Inspection' as const
    }
  ];

  // Filter properties based on search query
  const filteredProperties = useMemo(() => {
    if (!searchQuery.trim()) {
      return allProperties;
    }
    
    const query = searchQuery.toLowerCase().trim();
    return allProperties.filter(property =>
      property.unit.toLowerCase().includes(query) ||
      property.address.toLowerCase().includes(query) ||
      property.status.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const clearSearch = () => {
    setSearchQuery('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ready':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'Needs Inspection':
        return 'bg-red-500/10 text-red-700 border-red-200';
      case 'In Progress':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const handlePropertyAction = (propertyId: string, address: string, action: 'inspections' | 'reports' | 'start') => {
    switch (action) {
      case 'inspections':
        onSelectProperty(propertyId, address);
        break;
      case 'reports':
        onViewReports(propertyId, address);
        break;
      case 'start':
        onStartInspection(propertyId, address);
        break;
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
          <div className="flex-1">
            <h1 className="text-xl font-medium">{communityName}</h1>
            <p className="text-primary-foreground/80 text-sm">Properties</p>
          </div>
        </div>
        
        <div>
          <p className="text-primary-foreground/80 text-sm">
            {allProperties.length} units available
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className="px-6 py-4 bg-background border-b border-border/30">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
          <Input
            type="text"
            placeholder="Search by unit number, address, or status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 bg-input-background border-border/50 focus:border-primary"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted/20"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        {searchQuery && (
          <p className="text-sm text-muted mt-2">
            {filteredProperties.length} of {allProperties.length} units match "{searchQuery}"
          </p>
        )}
      </div>

      {/* Properties List */}
      <div className="px-6 py-6">
        {filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-muted mx-auto mb-4" />
            <h3 className="font-medium text-foreground mb-2">No units found</h3>
            <p className="text-sm text-muted mb-4">
              Try adjusting your search terms or browse all units.
            </p>
            <Button onClick={clearSearch} variant="outline" size="sm">
              Clear Search
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProperties.map((property) => (
            <Card
              key={property.id}
              className="p-4 border border-border/50"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <Home className="w-4 h-4 text-muted mr-2" />
                    <span className="font-medium text-sm text-muted">Unit {property.unit}</span>
                  </div>
                  <h3 className="font-medium text-base mb-2">{property.address}</h3>
                  <div className="flex items-center text-sm text-muted mb-2">
                    <span>{property.bedrooms} bed • {property.bathrooms} bath • {property.sqft} sqft</span>
                  </div>
                </div>
                <Badge className={getStatusColor(property.status)}>
                  {property.status}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-sm text-muted mb-4">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Last: {new Date(property.lastInspection).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
                <div>{property.inspectionCount} inspections</div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="default"
                  className="flex-1"
                  onClick={() => handlePropertyAction(property.id, property.address, 'start')}
                >
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Start Inspection
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePropertyAction(property.id, property.address, 'inspections')}
                  className="px-3"
                >
                  <FileText className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePropertyAction(property.id, property.address, 'reports')}
                  className="px-3"
                >
                  <BarChart3 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Safe Area */}
      <div className="h-8"></div>
    </div>
  );
}