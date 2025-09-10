// Environment configuration
export const ENV = {
  SUPABASE_URL: (import.meta as any).env?.VITE_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '',
  API_BASE_URL: (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001/api'
};

export const isSupabaseConfigured = (): boolean => {
  return !!(ENV.SUPABASE_URL && ENV.SUPABASE_ANON_KEY);
};