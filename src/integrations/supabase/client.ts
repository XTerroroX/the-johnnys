
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://jqnzvaifxdrwvaxfxlzm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impxbnp2YWlmeGRyd3ZheGZ4bHptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMTM2MjAsImV4cCI6MjA1ODU4OTYyMH0.mzZ_ZYAnSTMz74R49WmzPiLaFS0xsuTA-FBjdQzQBP4";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true
    },
    global: {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  }
);
