import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import logo from 'figma:asset/a9104ca5d97d973d81bd09faef4cc958aca2b5ac.png';

interface Inspection {
  id: string;
  date: string;
  inspector: string;
  status: 'completed' | 'in-progress' | 'scheduled' | 'cancelled';
  issuesFound: number;
  conditionScore: number;
  notes: string;
  duration: string;
}

interface InspectionsPageProps {
  propertyId: string;
  propertyAddress: string;
  onBack: () => void;
}

export function InspectionsPage({ propertyId, propertyAddress, onBack }: InspectionsPageProps) {
  // Mock data - in real app this would come from your backend based on propertyId
  const inspections: Inspection[] = [
    {
      id: '1',
      date: '2024-01-15',
      inspector: 'Sarah Johnson',
      status: 'completed',
      issuesFound: 2,
      conditionScore: 85,
      notes: 'Minor plumbing leak in kitchen sink, loose cabinet door handle. Overall excellent condition.',
      duration: '2.5 hours'
    },
    {
      id: '2',
      date: '2023-12-10',
      inspector: 'Mike Davis',
      status: 'completed',
      issuesFound: 1,
      conditionScore: 90,
      notes: 'Small crack in bathroom tile grout. Property well maintained.',
      duration: '2 hours'
    },
    {
      id: '3',
      date: '2023-11-05',
      inspector: 'John Smith',
      status: 'completed',
      issuesFound: 0,
      conditionScore: 95,
      notes: 'Property in excellent condition. No issues found during routine inspection.',
      duration: '1.5 hours'
    },
    {
      id: '4',
      date: '2023-10-01',
      inspector: 'Lisa Wilson',
      status: 'completed',
      issuesFound: 3,
      conditionScore: 78,
      notes: 'HVAC filter needs replacement, minor paint touch-ups needed, garden maintenance required.',
      duration: '3 hours'
    },
    {
      id: '5',
      date: '2024-01-25',
      inspector: 'Sarah Johnson',
      status: 'scheduled',
      issuesFound: 0,
      conditionScore: 0,
      notes: 'Scheduled quarterly inspection',
      duration: 'Est. 2 hours'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#1b365d';
      case 'in-progress':
        return '#4698cb';
      case 'scheduled':
        return '#768692';
      case 'cancelled':
        return '#dc2626';
      default:
        return '#768692';
    }
  };

  const getConditionColor = (score: number) => {
    if (score >= 90) return '#1b365d';
    if (score >= 80) return '#4698cb';
    if (score >= 70) return '#768692';
    return '#dc2626';
  };

  const getIssuesColor = (count: number) => {
    if (count === 0) return '#1b365d';
    if (count <= 2) return '#4698cb';
    if (count <= 4) return '#768692';
    return '#dc2626';
  };

  // Sort inspections by date (most recent first)
  const sortedInspections = inspections.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const completedInspections = inspections.filter(i => i.status === 'completed');
  const averageCondition = completedInspections.length > 0 
    ? Math.round(completedInspections.reduce((sum, i) => sum + i.conditionScore, 0) / completedInspections.length)
    : 0;

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
                Inspection History
              </h1>
              <p style={{ color: '#768692' }}>{propertyAddress}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={onBack}
            style={{ color: '#1b365d', borderColor: '#1b365d' }}
          >
            ← Back to Properties
          </Button>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#f8f9fa' }}>
            <div style={{ color: '#1b365d', fontSize: '1.5rem', fontWeight: '600' }}>
              {inspections.length}
            </div>
            <div style={{ color: '#768692', fontSize: '0.875rem' }}>Total Inspections</div>
          </div>
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#f8f9fa' }}>
            <div style={{ color: '#1b365d', fontSize: '1.5rem', fontWeight: '600' }}>
              {completedInspections.length}
            </div>
            <div style={{ color: '#768692', fontSize: '0.875rem' }}>Completed</div>
          </div>
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#f8f9fa' }}>
            <div style={{ color: getConditionColor(averageCondition), fontSize: '1.5rem', fontWeight: '600' }}>
              {averageCondition}%
            </div>
            <div style={{ color: '#768692', fontSize: '0.875rem' }}>Avg Condition</div>
          </div>
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#f8f9fa' }}>
            <div style={{ color: '#4698cb', fontSize: '1.5rem', fontWeight: '600' }}>
              {inspections.filter(i => i.status === 'scheduled').length}
            </div>
            <div style={{ color: '#768692', fontSize: '0.875rem' }}>Scheduled</div>
          </div>
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#f8f9fa' }}>
            <div style={{ color: '#768692', fontSize: '1.5rem', fontWeight: '600' }}>
              {completedInspections.reduce((sum, i) => sum + i.issuesFound, 0)}
            </div>
            <div style={{ color: '#768692', fontSize: '0.875rem' }}>Total Issues</div>
          </div>
        </div>

        {/* Inspections List */}
        <div className="space-y-4">
          {sortedInspections.map((inspection) => (
            <Card 
              key={inspection.id}
              className="border-2"
              style={{ borderColor: '#e5e7eb' }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle style={{ color: '#1b365d', marginBottom: '0.5rem' }}>
                      Inspection - {new Date(inspection.date).toLocaleDateString()}
                    </CardTitle>
                    <CardDescription style={{ color: '#768692' }}>
                      Inspector: {inspection.inspector} • Duration: {inspection.duration}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Badge 
                      variant="secondary"
                      style={{ 
                        backgroundColor: getStatusColor(inspection.status),
                        color: '#ffffff',
                        textTransform: 'capitalize'
                      }}
                    >
                      {inspection.status.replace('-', ' ')}
                    </Badge>
                    {inspection.status === 'completed' && (
                      <Badge 
                        variant="outline"
                        style={{ 
                          borderColor: getConditionColor(inspection.conditionScore),
                          color: getConditionColor(inspection.conditionScore)
                        }}
                      >
                        {inspection.conditionScore}% condition
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span style={{ color: '#768692', fontSize: '0.875rem' }}>Issues Found:</span>
                    <Badge 
                      variant="outline"
                      style={{ 
                        borderColor: getIssuesColor(inspection.issuesFound),
                        color: getIssuesColor(inspection.issuesFound)
                      }}
                    >
                      {inspection.issuesFound} issues
                    </Badge>
                  </div>
                  {inspection.notes && (
                    <div>
                      <span style={{ color: '#768692', fontSize: '0.875rem' }}>Notes:</span>
                      <p style={{ color: '#1b365d', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        {inspection.notes}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}