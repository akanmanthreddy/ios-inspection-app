import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, Package, ChevronDown, Calculator } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Card } from '../../../../components/ui/card';
import { useCommunities } from '../../../../hooks/useCommunities';
import { useProperties } from '../../../../hooks/useProperties';
import { createDefaultUnitTurnTemplate, UnitTurnTemplateItem, UnitTurnTemplate } from '../../constants/templates';
import { useUnitTurnCalculations, useFieldUpdate } from '../../hooks/useUnitTurnCalculations';
import { useUnitTurn } from '../../contexts/UnitTurnContext';
import { unitTurnApi } from '../../services/unitTurnApi';
import CollapsibleSection from '../ui/CollapsibleSection';

interface MobileUnitTurnLandingPageProps {
  onBack: () => void;
}

export const MobileUnitTurnLandingPage = React.memo(function MobileUnitTurnLandingPage({
  onBack
}: MobileUnitTurnLandingPageProps) {
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>('');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('standard');
  const [unitNumber, setUnitNumber] = useState<string>('');
  const [moveOutDate, setMoveOutDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [template, setTemplate] = useState<UnitTurnTemplate | null>(null);
  const [showTemplate, setShowTemplate] = useState<boolean>(false);
  const [unitTurnInstanceId, setUnitTurnInstanceId] = useState<string | null>(null);
  const [itemPhotos, setItemPhotos] = useState<Record<string, any[]>>({});
  const [isCreatingInstance, setIsCreatingInstance] = useState<boolean>(false);
  const [isSavingUnitTurn, setIsSavingUnitTurn] = useState<boolean>(false);

  // Load communities and properties
  const { communities, loading: communitiesLoading, error: communitiesError } = useCommunities();
  const { properties: availableProperties, loading: propertiesLoading, error: propertiesError } = useProperties(selectedCommunityId);

  // Unit turn context for backend operations
  const { createInstance, updateInstance, createLineItem, state: unitTurnState } = useUnitTurn();

  // Get all items from template sections for calculations - make it reactive to template changes
  const allTemplateItems = useMemo(() => {
    return template ? template.sections.flatMap(section => section.items) : [];
  }, [template]);

  // Calculation and field update hooks
  const calculations = useUnitTurnCalculations(allTemplateItems);
  const { updateField } = useFieldUpdate();

  // Reset property selection when community changes
  useEffect(() => {
    setSelectedPropertyId('');
  }, [selectedCommunityId]);

  const selectedCommunity = communities.find(c => c.id === selectedCommunityId);
  const selectedProperty = availableProperties.find(p => p.id === selectedPropertyId);

  const isFormEnabled = selectedCommunityId && selectedPropertyId;

  // Initialize template when selected
  useEffect(() => {
    if (selectedTemplate && isFormEnabled) {
      const defaultTemplate = createDefaultUnitTurnTemplate();
      setTemplate(defaultTemplate);
      // Expand first few sections by default
      const defaultExpanded = new Set(defaultTemplate.sections.slice(0, 3).map(s => s.name));
      setExpandedSections(defaultExpanded);
    }
  }, [selectedTemplate, selectedCommunityId, selectedPropertyId]);

  // Unit number is only required for apartments
  const isUnitNumberRequired = selectedProperty?.property_type === 'apartment';
  const canShowTemplate = isFormEnabled && selectedTemplate && (isUnitNumberRequired ? unitNumber : true);

  const handleItemUpdate = (itemId: string, field: keyof UnitTurnTemplateItem, value: string | number) => {
    if (!template) return;

    const updatedTemplate = { ...template };
    updatedTemplate.sections = template.sections.map(section => ({
      ...section,
      items: updateField(section.items, itemId, field, value)
    }));

    setTemplate(updatedTemplate);
  };

  const toggleSection = (sectionName: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionName)) {
      newExpanded.delete(sectionName);
    } else {
      newExpanded.add(sectionName);
    }
    setExpandedSections(newExpanded);
  };

  const handleCreateUnitTurn = async () => {
    if (!canShowTemplate) {
      console.warn('⚠️ Cannot show template, canShowTemplate is false');
      return;
    }
    // Validate required fields before proceeding
    if (isUnitNumberRequired && !unitNumber.trim()) {
      console.warn('⚠️ Unit number is required but not provided');
      return; // Could add user feedback here
    }

    setIsCreatingInstance(true);
    try {
      // Create a real unit turn instance in the backend
      const instanceData = {
        property_id: selectedPropertyId,
        community_id: selectedCommunityId,
        template_name: selectedTemplate,
        notes: notes || null
      };

      const newInstance = await createInstance(instanceData);

      setUnitTurnInstanceId(newInstance.id);
      setShowTemplate(true);
    } catch (error) {
      // You could add user feedback here (toast notification, error message, etc.)
    } finally {
      setIsCreatingInstance(false);
    }
  };

  const handlePhotoUpdate = (itemId: string, photos: any[]) => {
    setItemPhotos(prev => ({
      ...prev,
      [itemId]: photos
    }));
  };

  const handleSaveUnitTurn = async () => {
    if (!unitTurnInstanceId || !template) {
      return;
    }

    setIsSavingUnitTurn(true);
    try {
      // 1. Update the unit turn instance with final totals
      await updateInstance(unitTurnInstanceId, {
        total_project_cost: calculations.totalProjectCost,
        total_damage_charges: calculations.totalDamageCharges,
        status: 'completed'
      });

      // 2. Create line items for all template items with values
      const lineItemMapping = new Map<string, string>();
      let lineItemsCreated = 0;

      for (const section of template.sections) {
        for (const item of section.items) {

          // Only create line items for items that have values (quantity > 0 or damages > 0)
          if (item.quantity > 0 || item.damages > 0) {
            try {
              const lineItemData = {
                unit_turn_instance_id: unitTurnInstanceId,
                cost_code: item.costCode,
                section_name: section.name,
                description: item.description,
                quantity: item.quantity,
                units: item.units,
                cost_per_unit: item.costPerUnit,
                damage_amount: item.damages,
                ...(item.notes ? { item_notes: item.notes } : {}),
                order_index: lineItemsCreated
              };

              const lineItem = await createLineItem(lineItemData);

              if (lineItem?.id) {
                lineItemMapping.set(item.id, lineItem.id);
                lineItemsCreated++;
              } else {
                throw new Error(`Failed to create line item for ${item.id} - no ID returned`);
              }
            } catch (error) {
              throw error;
            }
          }
        }
      }

      // 3. Upload photos for each line item
      let photosUploaded = 0;
      const totalPhotos = Object.values(itemPhotos).reduce((sum, photos) => sum + photos.length, 0);

      if (totalPhotos > 0) {

        for (const [templateItemId, photos] of Object.entries(itemPhotos)) {
          const lineItemId = lineItemMapping.get(templateItemId);

          if (lineItemId && photos.length > 0) {
            for (const photo of photos) {
              try {
                // Convert photo URI to blob for upload
                const blob = await fetch(photo.uri).then(r => r.blob());

                // Create a proper File object with extension based on MIME type
                const extension = blob.type === 'image/jpeg' ? '.jpg' :
                                blob.type === 'image/png' ? '.png' : '.jpg';
                const filename = `photo_${Date.now()}${extension}`;
                const file = new File([blob], filename, { type: blob.type });

                const uploadResult = await unitTurnApi.uploadLineItemPhoto(
                  unitTurnInstanceId,
                  lineItemId,
                  file
                );

                if (uploadResult.success) {
                  photosUploaded++;
                } else {
                  throw new Error(uploadResult.errors?.[0] || 'Photo upload failed');
                }
              } catch (error) {
                throw error;
              }
            }
          }
        }
      } else {
      }

      // 4. Success - show confirmation and navigate
      alert(`Unit turn saved successfully!\n\n- ${lineItemsCreated} line items created\n- ${photosUploaded} photos uploaded`);

      // TODO: Navigate to success page or unit turn list
      // onComplete?.({ instanceId: unitTurnInstanceId });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save unit turn';
      alert(`Failed to save unit turn: ${errorMessage}`);
    } finally {
      setIsSavingUnitTurn(false);
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
          <div className="flex items-center">
            <Package className="w-6 h-6 mr-2" />
            <h1 className="text-xl font-medium">Unit Turns</h1>
          </div>
        </div>

        <div>
          <p className="text-primary-foreground/80 text-sm">
            Create and manage unit turn inspections
          </p>
        </div>
      </div>

      {/* Selection Dropdowns */}
      <div className="px-6 py-6 space-y-4">
        {/* Community Selection */}
        <Card className="p-4">
          <div className="space-y-3">
            <label className="text-sm font-medium">Select Community</label>
            <Select
              value={selectedCommunityId}
              onValueChange={setSelectedCommunityId}
              disabled={communitiesLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={
                  communitiesLoading
                    ? "Loading communities..."
                    : communitiesError
                    ? "Error loading communities"
                    : "Choose a community"
                } />
                <ChevronDown className="h-4 w-4 opacity-50" />
              </SelectTrigger>
              <SelectContent>
                {communities.map((community) => (
                  <SelectItem key={community.id} value={community.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{community.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {community.location}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedCommunity && (
              <div className="text-xs text-muted-foreground">
                Selected: {selectedCommunity.name} • {selectedCommunity.location}
              </div>
            )}
          </div>
        </Card>

        {/* Property Selection */}
        <Card className="p-4">
          <div className="space-y-3">
            <label className="text-sm font-medium">Select Property</label>
            <Select
              value={selectedPropertyId}
              onValueChange={setSelectedPropertyId}
              disabled={!selectedCommunityId || propertiesLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={
                  !selectedCommunityId
                    ? "Select a community first"
                    : propertiesLoading
                    ? "Loading properties..."
                    : propertiesError
                    ? "Error loading properties"
                    : availableProperties.length === 0
                    ? "No properties available"
                    : "Choose a property"
                } />
                <ChevronDown className="h-4 w-4 opacity-50" />
              </SelectTrigger>
              <SelectContent>
                {availableProperties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{property.address}</span>
                      <span className="text-xs text-muted-foreground ml-2 capitalize">
                        {property.status}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedProperty && (
              <div className="text-xs text-muted-foreground">
                Selected: {selectedProperty.address} • {selectedProperty.status}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Unit Turn Form */}
      <div className="px-6">
        <Card className={`p-6 transition-opacity ${isFormEnabled ? 'opacity-100' : 'opacity-50'}`}>
          <div className="space-y-6">
            <div className="text-center pb-4 border-b border-border">
              <h2 className="text-lg font-semibold mb-2">Unit Turn Details</h2>
              <p className="text-sm text-muted-foreground">
                {isFormEnabled
                  ? "Fill out the unit turn information below"
                  : "Select a community and property to begin"
                }
              </p>
            </div>

            {isFormEnabled ? (
              <div className="space-y-4">
                {/* Template Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Unit Turn Template</label>
                  <Select
                    value={selectedTemplate}
                    onValueChange={setSelectedTemplate}
                    disabled={!isFormEnabled}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a template" />
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard Unit Turn Template</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Unit Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Unit Number
                      {isUnitNumberRequired && <span className="text-red-500 ml-1">*</span>}
                      {!isUnitNumberRequired && <span className="text-muted-foreground ml-1">(optional)</span>}
                    </label>
                    <input
                      type="text"
                      value={unitNumber}
                      onChange={(e) => setUnitNumber(e.target.value)}
                      placeholder={isUnitNumberRequired ? "e.g., 101" : "e.g., 101 (optional)"}
                      className="w-full px-3 py-2 border border-border rounded-md text-sm"
                      disabled={!isFormEnabled}
                    />
                    {selectedProperty && !isUnitNumberRequired && (
                      <p className="text-xs text-muted-foreground">
                        Unit number is optional for {selectedProperty.property_type} properties
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Move-out Date</label>
                    <input
                      type="date"
                      value={moveOutDate}
                      onChange={(e) => setMoveOutDate(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md text-sm"
                      disabled={!isFormEnabled}
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any special notes or instructions..."
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-md text-sm resize-none"
                    disabled={!isFormEnabled}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <Button
                    className="flex-1"
                    onClick={handleCreateUnitTurn}
                    disabled={!canShowTemplate || isCreatingInstance}
                  >
                    {isCreatingInstance ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Calculator className="w-4 h-4 mr-2" />
                        Create Unit Turn
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    disabled={!canShowTemplate}
                  >
                    Save Draft
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">
                  Please select a community and property above to continue
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Unit Turn Template Form */}
      {showTemplate && (
        <div className="px-6 py-6">
          {/* Summary Card */}
          <Card className="p-6 mb-6 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Unit Turn Summary</h3>
              <p className="text-sm text-gray-600">
                {selectedCommunity?.name} • {selectedProperty?.address}
                {unitNumber && ` • Unit ${unitNumber}`}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-lg font-bold text-blue-600 break-words">
                  ${calculations.totalProjectCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-lg font-bold text-red-600 break-words">
                  ${calculations.totalDamageCharges.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-sm text-gray-600">Damage Charges</div>
                <div className="text-xs text-red-500 mt-1">Tracked Separately</div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <div className="text-sm text-gray-600">
                {calculations.totalLineItems} items across {calculations.sectionSummaries.filter(s => s.itemCount > 0).length} sections
              </div>
            </div>
          </Card>

          {/* Template Sections */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Template Sections</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const allSections = template?.sections.map(s => s.name) || [];
                  const allExpanded = allSections.length === expandedSections.size;
                  setExpandedSections(allExpanded ? new Set() : new Set(allSections));
                }}
              >
                {template && expandedSections.size === template.sections.length ? 'Collapse All' : 'Expand All'}
              </Button>
            </div>

            {template?.sections.map(section => {
              const calculatedSummary = calculations.sectionSummaries.find(s => s.sectionName === section.name);
              const fallbackSummary = {
                sectionName: section.name,
                itemCount: section.items.filter(item => item.quantity > 0 || item.damages > 0).length,
                projectTotal: section.items.reduce((sum, item) => sum + (item.quantity * item.costPerUnit), 0),
                damageTotal: section.items.reduce((sum, item) => sum + item.damages, 0)
              };

              const sectionSummary = calculatedSummary || fallbackSummary;

              return (
                <CollapsibleSection
                  key={section.id}
                  sectionName={section.name}
                  items={section.items}
                  summary={sectionSummary}
                  isExpanded={expandedSections.has(section.name)}
                  onToggle={() => toggleSection(section.name)}
                  onItemUpdate={handleItemUpdate}
                  existingPhotos={itemPhotos}
                  onPhotoUpdate={handlePhotoUpdate}
                />
              );
            })}
          </div>

          {/* Final Actions */}
          <div className="mt-8 space-y-4">
            <Card className="p-4 bg-gray-50">
              <div className="text-center">
                <div className="text-lg font-semibold mb-2">Ready to finalize?</div>
                <div className="text-sm text-gray-600 mb-4">
                  Review all sections and calculations before saving
                </div>
                <div className="flex space-x-3">
                  <Button
                    className="flex-1"
                    onClick={handleSaveUnitTurn}
                    disabled={isSavingUnitTurn}
                  >
                    {isSavingUnitTurn ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Unit Turn'
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    disabled={isSavingUnitTurn}
                  >
                    Export Report
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Bottom Safe Area */}
      <div className="h-8"></div>
    </div>
  );
});