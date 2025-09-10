import { useState, useMemo } from 'react';
import { ChevronLeft, Plus, Home, Calendar, FileText, PlayCircle, Search, X, BarChart3 } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { useProperties } from '../../hooks/useProperties';

interface MobilePropertiesPageProps {
  communityId: string;
  communityName?: string;
  onBack: () => void;
  onSelectProperty: (propertyId: string, address: string) => void;
  onViewReports: (propertyId: string, address: string) => void;
  onStartInspection: (propertyId: string, address: string) => void;
}

export function MobilePropertiesPage({
  communityId,
  communityName = "Properties",
  onBack,
  onSelectProperty,
  onViewReports,
  onStartInspection
}: MobilePropertiesPageProps) {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Use real API data via the hook
  const { properties: allProperties, loading, error } = useProperties(communityId);

  // Helper functions to map backend data to display format
  const getPropertyStatus = (property: any) => {
    if (!property.last_inspection) return 'Needs Inspection';
    if (property.next_inspection && new Date(property.next_inspection) < new Date()) return 'Needs Inspection';
    return 'Ready';
  };

  const formatPropertyType = (type: string | null) => {
    if (!type) return 'Unknown';
    return type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Filter properties based on search query - moved before early returns
  const filteredProperties = useMemo(() => {
    if (!searchQuery.trim()) {
      return allProperties;
    }
    
    const query = searchQuery.toLowerCase().trim();
    return allProperties.filter(property =>
      property.address.toLowerCase().includes(query) ||
      formatPropertyType(property.property_type).toLowerCase().includes(query) ||
      getPropertyStatus(property).toLowerCase().includes(query)
    );
  }, [searchQuery, allProperties]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading properties...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading properties:</p>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

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
        return 'bg-gray-500/10 text-muted-foreground border-gray-200';
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
          <p className="text-sm text-muted-foreground mt-2">
            {filteredProperties.length} of {allProperties.length} units match "{searchQuery}"
          </p>
        )}
      </div>

      {/* Properties List */}
      <div className="px-6 py-6">
        {filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-foreground mb-2">No units found</h3>
            <p className="text-sm text-muted-foreground mb-4">
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
                    <Home className="w-4 h-4 text-muted-foreground mr-2" />
                    <span className="font-medium text-sm text-muted-foreground">{formatPropertyType(property.property_type)}</span>
                  </div>
                  <h3 className="font-medium text-base mb-2">{property.address}</h3>
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <span>Issues: {property.issues_count}</span>
                  </div>
                </div>
                <Badge className={getStatusColor(getPropertyStatus(property))}>
                  {getPropertyStatus(property)}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Last: {property.last_inspection 
                    ? new Date(property.last_inspection).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })
                    : 'Never'
                  }
                </div>
                <div>Created: {new Date(property.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })}</div>
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