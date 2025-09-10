import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ENV, isSupabaseConfigured } from '../config/env';

// Create a mock Supabase client for development
const createMockSupabaseClient = (): any => {
  const mockResponse = { data: null, error: new Error('Supabase not configured - using mock data') };
  
  return {
    from: () => ({
      select: () => Promise.resolve(mockResponse),
      insert: () => Promise.resolve(mockResponse),
      update: () => Promise.resolve(mockResponse),
      delete: () => Promise.resolve(mockResponse),
      single: () => Promise.resolve(mockResponse),
      order: () => Promise.resolve(mockResponse),
    }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () => Promise.resolve(mockResponse),
      signUp: () => Promise.resolve(mockResponse),
      signOut: () => Promise.resolve(mockResponse),
    },
    storage: {
      from: () => ({
        upload: () => Promise.resolve(mockResponse),
        download: () => Promise.resolve(mockResponse),
      }),
    },
  };
};

// Supabase configuration - only create real client if properly configured
export const supabase: SupabaseClient = isSupabaseConfigured() 
  ? createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY)
  : createMockSupabaseClient();

// Database types (based on your schema)
export interface Database {
  public: {
    Tables: {
      communities: {
        Row: {
          id: string;
          name: string;
          status: 'active' | 'under-construction' | 'sold';
          location: string;
          total_units: number;
          description: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          status: 'active' | 'under-construction' | 'sold';
          location: string;
          total_units?: number;
          description?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          status?: 'active' | 'under-construction' | 'sold';
          location?: string;
          total_units?: number;
          description?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      properties: {
        Row: {
          id: string;
          community_id: string;
          address: string;
          property_type: string;
          status: 'active' | 'under-construction' | 'sold';
          last_inspection: string | null;
          next_inspection: string;
          assigned_inspector: string;
          issues_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          community_id: string;
          address: string;
          property_type: string;
          status?: 'active' | 'under-construction' | 'sold';
          last_inspection?: string | null;
          next_inspection: string;
          assigned_inspector: string;
          issues_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          community_id?: string;
          address?: string;
          property_type?: string;
          status?: 'active' | 'under-construction' | 'sold';
          last_inspection?: string | null;
          next_inspection?: string;
          assigned_inspector?: string;
          issues_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      inspections: {
        Row: {
          id: string;
          property_id: string;
          template_id: string | null;
          inspector_id: string;
          scheduled_date: string;
          started_at: string | null;
          completed_at: string | null;
          status: 'scheduled' | 'in-progress' | 'completed' | 'requires-follow-up';
          type: 'routine' | 'move-in' | 'move-out' | 'maintenance';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          template_id?: string | null;
          inspector_id: string;
          scheduled_date: string;
          started_at?: string | null;
          completed_at?: string | null;
          status?: 'scheduled' | 'in-progress' | 'completed' | 'requires-follow-up';
          type: 'routine' | 'move-in' | 'move-out' | 'maintenance';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          template_id?: string | null;
          inspector_id?: string;
          scheduled_date?: string;
          started_at?: string | null;
          completed_at?: string | null;
          status?: 'scheduled' | 'in-progress' | 'completed' | 'requires-follow-up';
          type?: 'routine' | 'move-in' | 'move-out' | 'maintenance';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          role: 'admin' | 'property_manager' | 'inspector' | 'viewer';
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          first_name: string;
          last_name: string;
          role?: 'admin' | 'property_manager' | 'inspector' | 'viewer';
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          role?: 'admin' | 'property_manager' | 'inspector' | 'viewer';
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}