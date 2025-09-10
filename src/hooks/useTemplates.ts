import { useState, useEffect } from 'react';
import { TemplatesService, InspectionTemplate } from '../services/templatesService';

export function useTemplates() {
  const [templates, setTemplates] = useState<InspectionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const templatesData = await TemplatesService.getAllTemplates();
      setTemplates(templatesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const createTemplate = async (templateData: Omit<InspectionTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTemplate = await TemplatesService.createTemplate(templateData);
      setTemplates(prev => [...prev, newTemplate]);
      return newTemplate;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create template');
    }
  };

  const updateTemplate = async (id: string, updates: Partial<InspectionTemplate>) => {
    try {
      const updatedTemplate = await TemplatesService.updateTemplate(id, updates);
      setTemplates(prev => prev.map(template => 
        template.id === id ? updatedTemplate : template
      ));
      return updatedTemplate;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update template');
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      await TemplatesService.deleteTemplate(id);
      setTemplates(prev => prev.filter(template => template.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete template');
    }
  };

  return {
    templates,
    loading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    refetch: loadTemplates
  };
}

export function useTemplate(id: string | null) {
  const [template, setTemplate] = useState<InspectionTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTemplate = async () => {
      if (!id) {
        try {
          setLoading(true);
          setError(null);
          const defaultTemplate = await TemplatesService.getDefaultTemplate();
          setTemplate(defaultTemplate);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load default template');
        } finally {
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const templateData = await TemplatesService.getTemplate(id);
        setTemplate(templateData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load template');
      } finally {
        setLoading(false);
      }
    };

    loadTemplate();
  }, [id]);

  return { template, loading, error };
}