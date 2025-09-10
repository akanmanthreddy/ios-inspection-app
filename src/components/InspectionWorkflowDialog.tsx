import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import { Checkbox } from './ui/checkbox';
import { useInspectionWorkflow } from '../hooks/useBusinessLogic';
import { Inspection, InspectionIssue } from '../services/api';
import { AlertTriangle, CheckCircle2, Clock, Plus, Trash2, Camera } from 'lucide-react';

interface InspectionWorkflowDialogProps {
  open: boolean;
  onClose: () => void;
  inspection: Inspection | null;
  propertyAddress?: string;
}

export function InspectionWorkflowDialog({ 
  open, 
  onClose, 
  inspection,
  propertyAddress 
}: InspectionWorkflowDialogProps) {
  const { workflowState, completeInspectionWorkflow, clearWorkflowState } = useInspectionWorkflow();
  
  const [issues, setIssues] = useState<InspectionIssue[]>([]);
  const [notes, setNotes] = useState('');
  const [newIssue, setNewIssue] = useState({
    category: '',
    description: '',
    severity: 'low' as 'low' | 'medium' | 'high' | 'critical'
  });
  const [isCompleting, setIsCompleting] = useState(false);
  const [showAddIssue, setShowAddIssue] = useState(false);

  useEffect(() => {
    if (inspection) {
      setIssues(inspection.issues || []);
      setNotes(inspection.notes || '');
    }
  }, [inspection]);

  useEffect(() => {
    if (!open) {
      clearWorkflowState();
    }
  }, [open, clearWorkflowState]);

  const handleAddIssue = () => {
    if (!newIssue.category.trim() || !newIssue.description.trim()) return;

    const issue: InspectionIssue = {
      id: Date.now().toString(),
      category: newIssue.category,
      description: newIssue.description,
      severity: newIssue.severity,
      resolved: false,
      photos: []
    };

    setIssues(prev => [...prev, issue]);
    setNewIssue({ category: '', description: '', severity: 'low' });
    setShowAddIssue(false);
  };

  const handleRemoveIssue = (issueId: string) => {
    setIssues(prev => prev.filter(issue => issue.id !== issueId));
  };

  const handleToggleIssueResolved = (issueId: string) => {
    setIssues(prev => prev.map(issue => 
      issue.id === issueId ? { ...issue, resolved: !issue.resolved } : issue
    ));
  };

  const handleCompleteInspection = async () => {
    if (!inspection) return;

    setIsCompleting(true);
    
    try {
      const result = await completeInspectionWorkflow(
        inspection.id,
        inspection,
        issues,
        notes
      );

      if (result.success) {
        // Show success message or handle completion
        setTimeout(() => {
          onClose();
          setIsCompleting(false);
        }, 2000);
      } else {
        setIsCompleting(false);
      }
    } catch (error) {
      setIsCompleting(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#d4183d';
      case 'high': return '#f59e0b';
      case 'medium': return '#4698cb';
      default: return '#10b981';
    }
  };

  const getSeverityBgColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#fef2f2';
      case 'high': return '#fefbf2';
      case 'medium': return '#eff6ff';
      default: return '#f0fdf4';
    }
  };

  if (!inspection) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div>
              <span style={{ color: '#1b365d' }}>Complete Inspection</span>
              <div className="mt-1">
                <p style={{ color: '#768692', fontSize: '0.875rem' }}>
                  {propertyAddress}
                </p>
                <p style={{ color: '#768692', fontSize: '0.75rem' }}>
                  Inspector: {inspection.inspectorName} • {new Date(inspection.date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Badge 
              style={{
                backgroundColor: inspection.status === 'completed' ? '#10b981' : '#4698cb',
                color: '#ffffff'
              }}
            >
              {inspection.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Validation Alerts */}
          {workflowState.validationErrors.length > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription>
                <div className="font-medium text-red-800 mb-1">Validation Errors</div>
                <ul className="text-red-700 text-sm list-disc list-inside">
                  {workflowState.validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {workflowState.validationWarnings.length > 0 && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription>
                <div className="font-medium text-yellow-800 mb-1">Warnings</div>
                <ul className="text-yellow-700 text-sm list-disc list-inside">
                  {workflowState.validationWarnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Issues Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ color: '#1b365d', fontSize: '1.125rem', fontWeight: '500' }}>
                Issues Found ({issues.length})
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddIssue(true)}
                style={{ borderColor: '#4698cb', color: '#4698cb' }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Issue
              </Button>
            </div>

            {issues.length === 0 ? (
              <Card className="p-6 text-center border-dashed">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3" style={{ color: '#10b981' }} />
                <p style={{ color: '#1b365d', fontWeight: '500' }}>No issues found</p>
                <p style={{ color: '#768692', fontSize: '0.875rem' }}>
                  This property is in excellent condition
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {issues.map((issue) => (
                  <Card 
                    key={issue.id} 
                    className="p-4 border"
                    style={{ 
                      borderColor: getSeverityColor(issue.severity),
                      backgroundColor: getSeverityBgColor(issue.severity)
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge 
                            style={{
                              backgroundColor: getSeverityColor(issue.severity),
                              color: '#ffffff'
                            }}
                          >
                            {issue.severity}
                          </Badge>
                          <span style={{ color: '#1b365d', fontWeight: '500', fontSize: '0.875rem' }}>
                            {issue.category}
                          </span>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`resolved-${issue.id}`}
                              checked={issue.resolved}
                              onCheckedChange={() => handleToggleIssueResolved(issue.id)}
                            />
                            <Label 
                              htmlFor={`resolved-${issue.id}`}
                              style={{ fontSize: '0.75rem', color: '#768692' }}
                            >
                              Resolved
                            </Label>
                          </div>
                        </div>
                        <p style={{ color: '#374151', fontSize: '0.875rem' }}>
                          {issue.description}
                        </p>
                        {issue.photos && issue.photos.length > 0 && (
                          <div className="flex items-center mt-2">
                            <Camera className="w-4 h-4 mr-1" style={{ color: '#768692' }} />
                            <span style={{ color: '#768692', fontSize: '0.75rem' }}>
                              {issue.photos.length} photo(s) attached
                            </span>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveIssue(issue.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Add Issue Form */}
            {showAddIssue && (
              <Card className="p-4 mt-4 border" style={{ borderColor: '#4698cb' }}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="issue-category">Category</Label>
                      <Input
                        id="issue-category"
                        value={newIssue.category}
                        onChange={(e) => setNewIssue(prev => ({ ...prev, category: e.target.value }))}
                        placeholder="e.g., Plumbing, Electrical, HVAC"
                      />
                    </div>
                    <div>
                      <Label htmlFor="issue-severity">Severity</Label>
                      <Select value={newIssue.severity} onValueChange={(value: any) => setNewIssue(prev => ({ ...prev, severity: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="issue-description">Description</Label>
                    <Textarea
                      id="issue-description"
                      value={newIssue.description}
                      onChange={(e) => setNewIssue(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the issue in detail..."
                      rows={3}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={handleAddIssue}
                      style={{ backgroundColor: '#4698cb', borderColor: '#4698cb', color: '#ffffff' }}
                      disabled={!newIssue.category.trim() || !newIssue.description.trim()}
                    >
                      Add Issue
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowAddIssue(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>

          <Separator />

          {/* Notes Section */}
          <div>
            <Label htmlFor="inspection-notes" className="mb-2 block">
              <span style={{ color: '#1b365d', fontWeight: '500' }}>Inspection Notes</span>
            </Label>
            <Textarea
              id="inspection-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes about this inspection..."
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Follow-up Actions Preview */}
          {workflowState.followUpActions && (
            <Card className="p-4 border" style={{ borderColor: '#4698cb', backgroundColor: '#f0f9ff' }}>
              <h4 style={{ color: '#1b365d', fontWeight: '500', marginBottom: '1rem' }}>
                Generated Follow-up Actions
              </h4>
              
              {workflowState.followUpActions.immediateActions.length > 0 && (
                <div className="mb-4">
                  <h5 style={{ color: '#d4183d', fontWeight: '500', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    Immediate Actions Required:
                  </h5>
                  <ul className="text-sm list-disc list-inside space-y-1">
                    {workflowState.followUpActions.immediateActions.map((action: string, index: number) => (
                      <li key={index} style={{ color: '#374151' }}>{action}</li>
                    ))}
                  </ul>
                </div>
              )}

              {workflowState.followUpActions.scheduledActions.length > 0 && (
                <div>
                  <h5 style={{ color: '#4698cb', fontWeight: '500', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    Scheduled Follow-ups:
                  </h5>
                  <div className="space-y-2">
                    {workflowState.followUpActions.scheduledActions.map((action: any, index: number) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span style={{ color: '#374151' }}>{action.action}</span>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            style={{
                              backgroundColor: getSeverityColor(action.priority),
                              color: '#ffffff'
                            }}
                          >
                            {action.priority}
                          </Badge>
                          <span style={{ color: '#768692' }}>
                            Due: {new Date(action.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleCompleteInspection}
            disabled={isCompleting || workflowState.validationErrors.length > 0}
            style={{ backgroundColor: '#10b981', borderColor: '#10b981', color: '#ffffff' }}
          >
            {isCompleting ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Completing...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Complete Inspection
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}