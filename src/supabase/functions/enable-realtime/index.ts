
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    
    // Execute SQL to enable Realtime for the booking_notifications table
    const { error } = await supabaseClient
      .rpc('supabase_functions.http', {
        method: 'POST',
        url: '/internal/postgres/realtime/subscription',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
        },
        body: {
          publication: 'supabase_realtime',
          tables: [
            {
              name: 'booking_notifications',
              schema: 'public',
              columns: ['*'],
            }
          ]
        },
      })
      
    if (error) throw error

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  } catch (error) {
    console.error('Error enabling realtime:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }
})
