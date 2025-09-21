import { useState, useMemo } from 'react';
import { Calendar, CheckCircle, Clock, AlertTriangle, Search, ArrowLeft, Plus } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { useAllInspections } from '../../hooks/useAllInspections';
import { LoadingSpinner } from '../LoadingSpinner';
import { ErrorMessage } from '../ErrorMessage';
import { formatInspectorName } from '../../utils/displayFormatters';

interface MobileInspectionsOverviewPageProps {
  onViewInspection: (inspectionId: string, propertyAddress: string) => void;
  onBack: () => void;
  onStartNewInspection: () => void;
}

export function MobileInspectionsOverviewPage({
  onViewInspection,
  onBack,
  onStartNewInspection
}: MobileInspectionsOverviewPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'in-progress'>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Use live API data via the useAllInspections hook
  const { inspections: allInspections, loading, error, refetch } = useAllInspections();

  // Handle loading state
  if (loading) {
    return <LoadingSpinner message="Loading inspections..." />;
  }

  // Handle error state
  if (error) {
    return <ErrorMessage message={error} onRetry={refetch} />;
  }


  const filteredInspections = allInspections.filter(inspection => {
    const matchesSearch = !searchQuery || 
      inspection.propertyAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inspection.community.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inspection.inspector.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inspection.inspectionType.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || inspection.status === filterStatus;
    const matchesType = filterType === 'all' || inspection.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'in-progress':
        return <Clock className="w-4 h-4" />;
      case 'pending':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'in-progress':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const statusCounts = useMemo(() => ({
    all: allInspections.length,
    completed: allInspections.filter(i => i.status === 'completed').length,
    'in-progress': allInspections.filter(i => i.status === 'in-progress').length,
    pending: allInspections.filter(i => i.status === 'pending').length
  }), [allInspections]);

  // Dynamically generate type filters from inspection data
  const typeFilters = useMemo(() => {
    const uniqueTypes = Array.from(
      new Set(allInspections.map(i => i.type).filter(Boolean))
    );
    
    return [
      { key: 'all', label: 'All Types' },
      ...uniqueTypes.map(type => ({
        key: type,
        label: type.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')
      }))
    ];
  }, [allInspections]);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-6 pt-12 pb-6">
        <div className="flex items-center mb-4">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-medium">All Inspections</h1>
        </div>
        <div className="text-center">
          <p className="text-primary-foreground/80 text-sm">
            {allInspections.length} total inspections
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-6 py-4 bg-background border-b border-border/30">
        <div className="grid grid-cols-4 gap-2">
          <Card 
            className={`p-3 text-center cursor-pointer transition-colors ${
              filterStatus === 'all' ? 'bg-primary/10 border-primary/20' : ''
            }`}
            onClick={() => setFilterStatus('all')}
          >
            <div className="text-lg font-medium text-primary mb-1">{statusCounts.all}</div>
            <div className="text-xs text-slate-600">All</div>
          </Card>
          <Card 
            className={`p-3 text-center cursor-pointer transition-colors ${
              filterStatus === 'completed' ? 'bg-green-50 border-green-200' : ''
            }`}
            onClick={() => setFilterStatus('completed')}
          >
            <div className="text-lg font-medium text-green-600 mb-1">{statusCounts.completed}</div>
            <div className="text-xs text-slate-600">Done</div>
          </Card>
          <Card 
            className={`p-3 text-center cursor-pointer transition-colors ${
              filterStatus === 'in-progress' ? 'bg-blue-50 border-blue-200' : ''
            }`}
            onClick={() => setFilterStatus('in-progress')}
          >
            <div className="text-lg font-medium text-blue-600 mb-1">{statusCounts['in-progress']}</div>
            <div className="text-xs text-slate-600">Active</div>
          </Card>
          <Card 
            className={`p-3 text-center cursor-pointer transition-colors ${
              filterStatus === 'pending' ? 'bg-yellow-50 border-yellow-200' : ''
            }`}
            onClick={() => setFilterStatus('pending')}
          >
            <div className="text-lg font-medium text-yellow-600 mb-1">{statusCounts.pending}</div>
            <div className="text-xs text-slate-600">Pending</div>
          </Card>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 py-4 bg-background border-b border-border/30">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            type="text"
            placeholder="Search inspections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-input-background border-border/50 focus:border-primary"
          />
        </div>

        {/* Type Filter */}
        <div>
          <p className="text-slate-600 text-sm mb-2">Filter by Type</p>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {typeFilters.map((filter) => (
              <Button
                key={filter.key}
                size="sm"
                variant={filterType === filter.key ? "default" : "outline"}
                onClick={() => setFilterType(filter.key)}
                className="whitespace-nowrap"
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Inspections List */}
      <div className="px-6 py-6">
        {filteredInspections.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="font-medium text-foreground mb-2">No inspections found</h3>
            <p className="text-sm text-slate-600 mb-4">
              Try adjusting your search or filter criteria.
            </p>
            <Button 
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('all');
                setFilterType('all');
              }} 
              variant="outline" 
              size="sm"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInspections.map((inspection) => (
              <Card
                key={inspection.id}
                className="p-4 border border-border/50 cursor-pointer transition-all duration-200 active:scale-95"
                onClick={() => onViewInspection(inspection.id, inspection.propertyAddress)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-base mb-1">{inspection.propertyAddress}</h3>
                    <p className="text-sm text-slate-600 mb-1">{inspection.community}</p>
                    <p className="text-xs text-slate-700 font-medium">{inspection.inspectionType}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <Badge className={getStatusColor(inspection.status)}>
                      <div className="flex items-center">
                        {getStatusIcon(inspection.status)}
                        <span className="ml-1 capitalize">{inspection.status.replace('-', ' ')}</span>
                      </div>
                    </Badge>
                    {inspection.status === 'completed' && (
                      <div className="mt-2 text-sm">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full ${
                          (inspection.issues || 0) > 0 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {inspection.issues || 0} Repair Item{(inspection.issues || 0) !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-slate-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(inspection.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                  <div>Inspector: {formatInspectorName(inspection.inspector)}</div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={onStartNewInspection}
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center transition-all duration-200 active:scale-95 hover:shadow-xl z-50"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}