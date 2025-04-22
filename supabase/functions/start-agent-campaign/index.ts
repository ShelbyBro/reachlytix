
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const { agentName, script, voiceStyle, businessType, leadList, agentId } = await req.json()
    const authHeader = req.headers.get('Authorization')
    
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Create a Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get lead list from the agent if we have an agentId and no leadList
    let phoneNumbers = leadList || [];
    
    if (agentId && (!leadList || leadList.length === 0)) {
      // Fetch the lead_list from the agent
      const { data: agentData, error: agentError } = await supabaseAdmin
        .from('ai_agents')
        .select('lead_list')
        .eq('id', agentId)
        .single();
        
      if (agentError) throw agentError;
      
      // Convert the comma-separated string to an array
      if (agentData?.lead_list) {
        phoneNumbers = agentData.lead_list.split(',').map((number: string) => number.trim());
      }
    }

    // Log the campaign start in ai_agent_logs
    const { data: logData, error: logError } = await supabaseAdmin
      .from('ai_agent_logs')
      .insert({
        agent_id: agentId,
        status: 'processing',
        phone: phoneNumbers && phoneNumbers.length > 0 ? phoneNumbers[0] : 'N/A',
        script: script || '',
      })
      .select()
      .single()

    if (logError) throw logError

    return new Response(
      JSON.stringify({ success: true, log: logData, phoneNumbers }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
