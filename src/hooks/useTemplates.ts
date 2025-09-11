import { useState, useEffect } from 'react';
import { apiClient, Template, CreateTemplateData } from '../services/api';

export interface UseTemplatesReturn {
  templates: Template[];
  loading: boolean;
  error: string | null;
  createTemplate: (data: CreateTemplateData) => Promise<Template>;
  updateTemplate: (id: string | number, data: Partial<CreateTemplateData>) => Promise<Template>;
  deleteTemplate: (id: string | number) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useTemplates(): UseTemplatesReturn {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the API client which handles fallback to mock data automatically
      const data = await apiClient.getTemplates();
      setTemplates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch templates');
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (data: CreateTemplateData): Promise<Template> => {
    try {
      setError(null);
      
      // Use API client which handles fallback automatically
      const newTemplate = await apiClient.createTemplate(data);
      setTemplates(prev => [...prev, newTemplate]);
      return newTemplate;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create template';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateTemplate = async (id: string | number, data: Partial<CreateTemplateData>): Promise<Template> => {
    try {
      setError(null);
      
      // Use API client which handles fallback automatically
      const updated = await apiClient.updateTemplate(id, data);
      setTemplates(prev => prev.map(template => 
        template.id === id ? updated : template
      ));
      return updated;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update template';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteTemplate = async (id: string | number): Promise<void> => {
    try {
      setError(null);
      
      // Use API client which handles fallback automatically
      await apiClient.deleteTemplate(id);
      setTemplates(prev => prev.filter(template => template.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete template';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    loading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    refetch: fetchTemplates,
  };
}

// Hook for fetching a single template
export interface UseTemplateReturn {
  template: Template | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTemplate(id: string | number): UseTemplateReturn {
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiClient.getTemplate(id);
      setTemplate(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch template');
      console.error('Error fetching template:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTemplate();
    }
  }, [id]);

  return {
    template,
    loading,
    error,
    refetch: fetchTemplate,
  };
}