import React from 'react';
import { ChevronLeft, Calendar, User, CheckCircle, XCircle, Star, AlertTriangle, Camera } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Inspection, DetailedInspection } from '../../services/api';

interface MobileInspectionDetailPageProps {
  inspection: Inspection | DetailedInspection;
  onBack: () => void;
}

export function MobileInspectionDetailPage({
  inspection,
  onBack
}: MobileInspectionDetailPageProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'in-progress':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'scheduled':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'requires-follow-up':
        return 'bg-red-500/10 text-red-700 border-red-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in-progress':
        return <Star className="w-5 h-5 text-yellow-600" />;
      case 'scheduled':
        return <Calendar className="w-5 h-5 text-blue-600" />;
      case 'requires-follow-up':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Star className="w-5 h-5 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/10 text-red-700 border-red-300';
      case 'high':
        return 'bg-orange-500/10 text-orange-700 border-orange-300';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-300';
      case 'low':
        return 'bg-blue-500/10 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-300';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return null;
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
            <h1 className="text-xl font-medium">Inspection Details</h1>
            <p className="text-primary-foreground/80 text-sm">
              {inspection.type.charAt(0).toUpperCase() + inspection.type.slice(1)} Inspection
            </p>
          </div>
          <Badge className={getStatusColor(inspection.status)}>
            {inspection.status.charAt(0).toUpperCase() + inspection.status.slice(1).replace('-', ' ')}
          </Badge>
        </div>
      </div>

      {/* Inspection Overview */}
      <div className="px-6 py-6">
        <Card className="p-6 mb-6">
          <div className="flex items-center mb-4">
            {getStatusIcon(inspection.status)}
            <div className="ml-3">
              <h2 className="text-lg font-semibold">
                {inspection.type.charAt(0).toUpperCase() + inspection.type.slice(1)} Inspection
              </h2>
              <div className="flex items-center text-sm text-slate-600 mt-1">
                <Calendar className="w-4 h-4 mr-1" />
                {inspection.date ? new Date(inspection.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'N/A'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/30">
            <div>
              <div className="text-sm text-slate-600 font-medium">Inspector</div>
              <div className="flex items-center mt-1">
                <User className="w-4 h-4 mr-2 text-slate-500" />
                <span className="text-sm font-medium">{inspection.inspectorName}</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-600 font-medium">Issues Found</div>
              <div className="text-2xl font-bold text-red-600 mt-1">
                {inspection.issues?.length || 0}
              </div>
            </div>
          </div>

          {inspection.notes && (
            <div className="mt-4 pt-4 border-t border-border/30">
              <div className="text-sm text-slate-600 font-medium mb-2">General Notes</div>
              <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">
                {inspection.notes}
              </p>
            </div>
          )}
        </Card>

        {/* Issues Section */}
        {inspection.issues && inspection.issues.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Issues Found ({inspection.issues.length})</h3>
            <div className="space-y-4">
              {inspection.issues.map((issue, index) => (
                <Card key={issue.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        {getSeverityIcon(issue.severity)}
                        <h4 className="font-medium text-sm ml-2">{issue.category}</h4>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{issue.description}</p>
                    </div>
                    <Badge className={getSeverityColor(issue.severity)}>
                      {issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/30">
                    <div className="flex items-center">
                      {issue.resolved ? (
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600 mr-2" />
                      )}
                      <span className="text-xs text-slate-600 font-medium">
                        {issue.resolved ? 'Resolved' : 'Unresolved'}
                      </span>
                    </div>
                    
                    {issue.photos && issue.photos.length > 0 && (
                      <div className="flex items-center text-xs text-slate-600">
                        <Camera className="w-3 h-3 mr-1" />
                        {issue.photos.length} photo{issue.photos.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>

                  {/* Photo thumbnails */}
                  {issue.photos && issue.photos.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/30">
                      <div className="text-xs text-slate-600 font-medium mb-2">Photos</div>
                      <div className="flex space-x-2 overflow-x-auto pb-2">
                        {issue.photos.map((photo, photoIndex) => (
                          <div 
                            key={photoIndex} 
                            className="flex-shrink-0 w-16 h-16 bg-slate-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-300 transition-colors"
                            onClick={() => {
                              // TODO: Implement photo viewer
                              console.log('View photo:', photo);
                            }}
                          >
                            <Camera className="w-6 h-6 text-slate-500" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No Issues State */}
        {(!inspection.issues || inspection.issues.length === 0) && (
          <Card className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-700 mb-2">No Issues Found</h3>
            <p className="text-sm text-slate-600">
              This inspection was completed with no issues identified.
            </p>
          </Card>
        )}

        {/* Inspection Sections and Items */}
        {(inspection as DetailedInspection).template && (inspection as DetailedInspection).template.sections && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Inspection Details</h3>
            <div className="space-y-6">
              {(inspection as DetailedInspection).template.sections
                .sort((a, b) => a.order_index - b.order_index)
                .map((section) => (
                  <Card key={section.id} className="p-4">
                    <div className="mb-4">
                      <h4 className="font-semibold text-base mb-1">{section.name}</h4>
                      {section.description && (
                        <p className="text-sm text-slate-600">{section.description}</p>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      {section.items
                        .sort((a, b) => a.order_index - b.order_index)
                        .map((item) => {
                          const response = (inspection as DetailedInspection).itemResponses?.find(
                            r => r.templateItemId === item.id
                          );
                          
                          return (
                            <div key={item.id} className="border-l-2 border-slate-200 pl-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h5 className="font-medium text-sm mb-1">{item.name}</h5>
                                  {item.required && (
                                    <Badge variant="outline" className="text-xs">Required</Badge>
                                  )}
                                </div>
                                
                                {response?.value && (
                                  <div className="ml-3">
                                    {item.type === 'select' && item.options ? (
                                      <Badge className="bg-blue-500/10 text-blue-700 border-blue-200">
                                        {response.value}
                                      </Badge>
                                    ) : item.type === 'number' ? (
                                      <Badge className="bg-green-500/10 text-green-700 border-green-200">
                                        {response.value}
                                      </Badge>
                                    ) : item.type === 'checkbox' ? (
                                      <Badge className={
                                        response.value === 'true' 
                                          ? "bg-green-500/10 text-green-700 border-green-200"
                                          : "bg-red-500/10 text-red-700 border-red-200"
                                      }>
                                        {response.value === 'true' ? 'Yes' : 'No'}
                                      </Badge>
                                    ) : (
                                      <Badge className="bg-slate-500/10 text-slate-700 border-slate-200">
                                        Response provided
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>

                              {response?.value && item.type === 'text' && (
                                <div className="mb-2">
                                  <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded">
                                    {response.value}
                                  </p>
                                </div>
                              )}

                              {response?.notes && (
                                <div className="mb-2">
                                  <div className="text-xs text-slate-600 font-medium mb-1">Notes:</div>
                                  <p className="text-sm text-slate-700 bg-amber-50 p-2 rounded border border-amber-200">
                                    {response.notes}
                                  </p>
                                </div>
                              )}

                              {response?.photos && response.photos.length > 0 && (
                                <div>
                                  <div className="flex items-center text-xs text-slate-600 font-medium mb-2">
                                    <Camera className="w-3 h-3 mr-1" />
                                    {response.photos.length} photo{response.photos.length !== 1 ? 's' : ''}
                                  </div>
                                  <div className="flex space-x-2 overflow-x-auto pb-2">
                                    {response.photos.map((photo, photoIndex) => (
                                      <div 
                                        key={photoIndex} 
                                        className="flex-shrink-0 w-12 h-12 bg-slate-200 rounded flex items-center justify-center cursor-pointer hover:bg-slate-300 transition-colors"
                                        onClick={() => {
                                          // TODO: Implement photo viewer
                                          console.log('View photo:', photo);
                                        }}
                                      >
                                        <Camera className="w-4 h-4 text-slate-500" />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {!response && (
                                <div className="text-xs text-slate-500 italic">
                                  No response recorded
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* Fallback for inspections without template data */}
        {!(inspection as DetailedInspection).template && (
          <div className="mt-6 pt-6 border-t border-border/50">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-amber-800 mb-2">Limited Detail View</h4>
              <p className="text-xs text-amber-700">
                This inspection's detailed template data is not available. Only basic inspection information and issues are shown above.
              </p>
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="mt-6 pt-6 border-t border-border/50">
          <div className="grid grid-cols-2 gap-4 text-xs text-slate-500">
            <div>
              <span className="font-medium">Created:</span>
              <div className="mt-1">
                {inspection.createdAt ? new Date(inspection.createdAt).toLocaleString() : 'N/A'}
              </div>
            </div>
            <div>
              <span className="font-medium">Last Updated:</span>
              <div className="mt-1">
                {inspection.updatedAt ? new Date(inspection.updatedAt).toLocaleString() : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Safe Area */}
      <div className="h-8"></div>
    </div>
  );
}