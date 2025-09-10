// Supabase client placeholder
// This will be replaced with actual Supabase integration when backend is ready

import { ENV } from '../config/env';

// Mock Supabase client for now
export const supabase = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Not configured') }),
    signUp: () => Promise.resolve({ data: null, error: new Error('Not configured') }),
    signOut: () => Promise.resolve({ error: new Error('Not configured') })
  },
  from: () => ({
    insert: () => Promise.resolve({ data: null, error: new Error('Not configured') })
  })
};

// Real Supabase client will be initialized here when backend is ready
// import { createClient } from '@supabase/supabase-js'
// export const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY);