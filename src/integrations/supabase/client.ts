
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://jqnzvaifxdrwvaxfxlzm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impxbnp2YWlmeGRyd3ZheGZ4bHptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMTM2MjAsImV4cCI6MjA1ODU4OTYyMH0.mzZ_ZYAnSTMz74R49WmzPiLaFS0xsuTA-FBjdQzQBP4";

// Create a client with improved session handling
export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false, // Prevent infinite redirects
      storageKey: 'supabase.auth.token', // Consistent storage key
    },
    global: {
      headers: {
        'Content-Type': 'application/json'
      }
    },
    realtime: {
      params: {
        eventsPerSecond: 10 // Limit realtime events to prevent flooding
      }
    }
  }
);

// Add a listener for auth state changes to properly handle session issues
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    // Clear local storage to prevent stale data
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('supabase.auth')) {
        localStorage.removeItem(key);
      }
    }
  }
});
