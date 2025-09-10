// Environment configuration
// This file provides a simple way to access environment variables
// Replace the values below with your actual credentials

export const ENV = {
  SUPABASE_URL: 'YOUR_SUPABASE_URL',
  SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY',
  API_BASE_URL: 'http://localhost:3001/api',
  NODE_ENV: 'development'
};

// Helper to check if environment is configured
export const isSupabaseConfigured = () => {
  return ENV.SUPABASE_URL !== 'YOUR_SUPABASE_URL' && 
         ENV.SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';
};