import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, Save, X, Copy, Settings, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { useTemplates } from '../hooks/useTemplates';
import { InspectionTemplate, InspectionSection, InspectionItem } from '../services/templatesService';
import { toast } from 'sonner@2.0.3';

interface TemplatesPageProps {
  onBack: () => void;
}

export function TemplatesPage({ onBack }: TemplatesPageProps) {
  const {
    templates,
    loading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate
  } = useTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<InspectionTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<InspectionTemplate | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');
  const [newTemplateType, setNewTemplateType] = useState<InspectionTemplate['type']>('custom');

  const handleCreateTemplate = async () => {
    if (!newTemplateName.trim()) {
      toast.error('Template name is required');
      return;
    }

    try {
      const newTemplate = await createTemplate({
        name: newTemplateName.trim(),
        description: newTemplateDescription.trim(),
        type: newTemplateType,
        sections: [
          {
            id: `section-${Date.now()}`,
            name: 'New Section',
            isExpanded: true,
            items: [
              {
                id: `item-${Date.now()}`,
                name: 'New Item',
                description: 'Add description for this inspection item',
                required: true
              }
            ]
          }
        ],
        isDefault: false
      });

      setSelectedTemplate(newTemplate);
      setEditingTemplate(newTemplate);
      setIsEditing(true);
      setShowCreateDialog(false);
      setNewTemplateName('');
      setNewTemplateDescription('');
      setNewTemplateType('custom');
      toast.success('Template created successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create template');
    }
  };

  const handleDuplicateTemplate = async (template: InspectionTemplate) => {
    try {
      const duplicatedTemplate = await createTemplate({
        name: `${template.name} (Copy)`,
        description: template.description,
        type: template.type,
        sections: template.sections.map(section => ({
          ...section,
          id: `section-${Date.now()}-${Math.random()}`,
          items: section.items.map(item => ({
            ...item,
            id: `item-${Date.now()}-${Math.random()}`
          }))
        })),
        isDefault: false
      });
      toast.success('Template duplicated successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to duplicate template');
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template?.isDefault) {
      toast.error('Cannot delete default templates');
      return;
    }

    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await deleteTemplate(templateId);
        if (selectedTemplate?.id === templateId) {
          setSelectedTemplate(null);
          setIsEditing(false);
          setEditingTemplate(null);
        }
        toast.success('Template deleted successfully');
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to delete template');
      }
    }
  };

  const handleEditTemplate = (template: InspectionTemplate) => {
    setSelectedTemplate(template);
    setEditingTemplate({ ...template });
    setIsEditing(true);
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;

    try {
      const updatedTemplate = await updateTemplate(editingTemplate.id, editingTemplate);
      setSelectedTemplate(updatedTemplate);
      setIsEditing(false);
      toast.success('Template saved successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save template');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingTemplate(null);
  };

  const updateTemplateProperty = (property: keyof InspectionTemplate, value: any) => {
    if (!editingTemplate) return;
    setEditingTemplate({ ...editingTemplate, [property]: value });
  };

  const addSection = () => {
    if (!editingTemplate) return;
    
    const newSection: InspectionSection = {
      id: `section-${Date.now()}`,
      name: 'New Section',
      isExpanded: true,
      items: [
        {
          id: `item-${Date.now()}`,
          name: 'New Item',
          description: 'Add description for this inspection item',
          required: true
        }
      ]
    };

    setEditingTemplate({
      ...editingTemplate,
      sections: [...editingTemplate.sections, newSection]
    });
  };

  const updateSection = (sectionId: string, property: keyof InspectionSection, value: any) => {
    if (!editingTemplate) return;
    
    setEditingTemplate({
      ...editingTemplate,
      sections: editingTemplate.sections.map(section =>
        section.id === sectionId ? { ...section, [property]: value } : section
      )
    });
  };

  const deleteSection = (sectionId: string) => {
    if (!editingTemplate) return;
    
    if (editingTemplate.sections.length <= 1) {
      toast.error('Template must have at least one section');
      return;
    }

    setEditingTemplate({
      ...editingTemplate,
      sections: editingTemplate.sections.filter(section => section.id !== sectionId)
    });
  };

  const addItem = (sectionId: string) => {
    if (!editingTemplate) return;
    
    const newItem: InspectionItem = {
      id: `item-${Date.now()}`,
      name: 'New Item',
      description: 'Add description for this inspection item',
      required: true
    };

    setEditingTemplate({
      ...editingTemplate,
      sections: editingTemplate.sections.map(section =>
        section.id === sectionId
          ? { ...section, items: [...section.items, newItem] }
          : section
      )
    });
  };

  const updateItem = (sectionId: string, itemId: string, property: keyof InspectionItem, value: any) => {
    if (!editingTemplate) return;
    
    setEditingTemplate({
      ...editingTemplate,
      sections: editingTemplate.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map(item =>
                item.id === itemId ? { ...item, [property]: value } : item
              )
            }
          : section
      )
    });
  };

  const deleteItem = (sectionId: string, itemId: string) => {
    if (!editingTemplate) return;
    
    const section = editingTemplate.sections.find(s => s.id === sectionId);
    if (section && section.items.length <= 1) {
      toast.error('Section must have at least one item');
      return;
    }

    setEditingTemplate({
      ...editingTemplate,
      sections: editingTemplate.sections.map(section =>
        section.id === sectionId
          ? { ...section, items: section.items.filter(item => item.id !== itemId) }
          : section
      )
    });
  };

  const getTypeColor = (type: InspectionTemplate['type']) => {
    switch (type) {
      case 'routine': return 'bg-blue-100 text-blue-800';
      case 'move-in': return 'bg-green-100 text-green-800';
      case 'move-out': return 'bg-orange-100 text-orange-800';
      case 'maintenance': return 'bg-purple-100 text-purple-800';
      case 'custom': return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading templates..." />;
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error} 
        onRetry={() => window.location.reload()} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Inspection Templates</h1>
                <p className="text-sm text-gray-600">Create and manage custom inspection templates</p>
              </div>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Template
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Template</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Name
                    </label>
                    <Input
                      value={newTemplateName}
                      onChange={(e) => setNewTemplateName(e.target.value)}
                      placeholder="Enter template name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <Textarea
                      value={newTemplateDescription}
                      onChange={(e) => setNewTemplateDescription(e.target.value)}
                      placeholder="Enter template description"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <select
                      value={newTemplateType}
                      onChange={(e) => setNewTemplateType(e.target.value as InspectionTemplate['type'])}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="custom">Custom</option>
                      <option value="routine">Routine</option>
                      <option value="move-in">Move-In</option>
                      <option value="move-out">Move-Out</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleCreateTemplate} className="flex-1">
                      Create Template
                    </Button>
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Templates List */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h2 className="font-medium text-gray-900 mb-4">All Templates ({templates.length})</h2>
            <div className="space-y-3">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-all ${
                    selectedTemplate?.id === template.id
                      ? 'ring-2 ring-primary bg-primary/5'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    if (!isEditing) {
                      setSelectedTemplate(template);
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{template.name}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
                      </div>
                      {template.isDefault && (
                        <Badge variant="secondary" className="text-xs ml-2">
                          Default
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <Badge className={`text-xs ${getTypeColor(template.type)}`}>
                        {template.type.charAt(0).toUpperCase() + template.type.slice(1)}
                      </Badge>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateTemplate(template);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditTemplate(template);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        {!template.isDefault && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTemplate(template.id);
                            }}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {template.sections.length} sections • Updated {template.updatedAt}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Template Editor */}
        <div className="flex-1 overflow-y-auto">
          {selectedTemplate ? (
            <div className="p-6">
              {isEditing && editingTemplate ? (
                <>
                  {/* Edit Mode Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Edit Template</h2>
                      <p className="text-sm text-gray-600">Customize sections and inspection items</p>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={handleCancelEdit}>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button onClick={handleSaveTemplate}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </div>

                  {/* Template Details */}
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Template Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Template Name
                        </label>
                        <Input
                          value={editingTemplate.name}
                          onChange={(e) => updateTemplateProperty('name', e.target.value)}
                          placeholder="Enter template name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <Textarea
                          value={editingTemplate.description}
                          onChange={(e) => updateTemplateProperty('description', e.target.value)}
                          placeholder="Enter template description"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Type
                        </label>
                        <select
                          value={editingTemplate.type}
                          onChange={(e) => updateTemplateProperty('type', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          disabled={editingTemplate.isDefault}
                        >
                          <option value="custom">Custom</option>
                          <option value="routine">Routine</option>
                          <option value="move-in">Move-In</option>
                          <option value="move-out">Move-Out</option>
                          <option value="maintenance">Maintenance</option>
                        </select>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Sections Editor */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">Sections</h3>
                      <Button onClick={addSection} variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Section
                      </Button>
                    </div>

                    {editingTemplate.sections.map((section, sectionIndex) => (
                      <Card key={section.id}>
                        <Collapsible
                          open={section.isExpanded}
                          onOpenChange={(open) => updateSection(section.id, 'isExpanded', open)}
                        >
                          <CollapsibleTrigger asChild>
                            <CardHeader className="cursor-pointer hover:bg-gray-50">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-2">
                                    {section.isExpanded ? (
                                      <ChevronUp className="w-4 h-4 text-gray-500" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 text-gray-500" />
                                    )}
                                    <Input
                                      value={section.name}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        updateSection(section.id, 'name', e.target.value);
                                      }}
                                      className="font-medium border-none p-0 h-auto bg-transparent"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </div>
                                  <Badge variant="outline">
                                    {section.items.length} items
                                  </Badge>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteSection(section.id);
                                  }}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </CardHeader>
                          </CollapsibleTrigger>

                          <CollapsibleContent>
                            <CardContent>
                              <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                  <h4 className="font-medium text-gray-900">Inspection Items</h4>
                                  <Button
                                    onClick={() => addItem(section.id)}
                                    variant="outline"
                                    size="sm"
                                  >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Add Item
                                  </Button>
                                </div>

                                {section.items.map((item, itemIndex) => (
                                  <div key={item.id}>
                                    {itemIndex > 0 && <Separator className="my-4" />}
                                    <div className="space-y-3">
                                      <div className="flex items-start gap-3">
                                        <div className="flex-1">
                                          <Input
                                            value={item.name}
                                            onChange={(e) => updateItem(section.id, item.id, 'name', e.target.value)}
                                            placeholder="Item name"
                                            className="font-medium mb-2"
                                          />
                                          <Textarea
                                            value={item.description}
                                            onChange={(e) => updateItem(section.id, item.id, 'description', e.target.value)}
                                            placeholder="Item description"
                                            rows={2}
                                          />
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <label className="flex items-center gap-2 text-sm">
                                            <input
                                              type="checkbox"
                                              checked={item.required}
                                              onChange={(e) => updateItem(section.id, item.id, 'required', e.target.checked)}
                                            />
                                            Required
                                          </label>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => deleteItem(section.id, item.id)}
                                            className="text-red-600 hover:text-red-700"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </CollapsibleContent>
                        </Collapsible>
                      </Card>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  {/* View Mode */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{selectedTemplate.name}</h2>
                      <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => handleDuplicateTemplate(selectedTemplate)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </Button>
                      <Button onClick={() => handleEditTemplate(selectedTemplate)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Template
                      </Button>
                    </div>
                  </div>

                  {/* Template Info */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-semibold text-primary">{selectedTemplate.sections.length}</div>
                        <div className="text-sm text-gray-600">Sections</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-semibold text-primary">
                          {selectedTemplate.sections.reduce((sum, section) => sum + section.items.length, 0)}
                        </div>
                        <div className="text-sm text-gray-600">Total Items</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <Badge className={`${getTypeColor(selectedTemplate.type)}`}>
                          {selectedTemplate.type.charAt(0).toUpperCase() + selectedTemplate.type.slice(1)}
                        </Badge>
                        <div className="text-sm text-gray-600 mt-1">Type</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Template Preview */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Template Preview</h3>
                    {selectedTemplate.sections.map((section) => (
                      <Card key={section.id}>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span>{section.name}</span>
                            <Badge variant="outline">{section.items.length} items</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {section.items.map((item) => (
                              <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                                    {item.required && (
                                      <Badge variant="secondary" className="text-xs">Required</Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600">{item.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Template</h3>
                <p className="text-sm text-gray-600">Choose a template from the list to view or edit its details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}