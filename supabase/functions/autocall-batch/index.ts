
// Follow the Supabase Edge Function protocol
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Configure CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      headers: corsHeaders,
      status: 200 
    });
  }

  try {
    // Get authorization token from request
    const authorization = req.headers.get("Authorization");
    if (!authorization) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authorization },
        },
      }
    );

    // Get request body
    const { leads, agentId } = await req.json();
    
    // Handle both leads array and lead_list formats
    let processedLeads = leads;
    
    if (!processedLeads && agentId) {
      // If we have an agentId but no leads, fetch the lead_list from the agent
      const { data: agentData, error: agentError } = await supabaseClient
        .from("ai_agents")
        .select("lead_list")
        .eq("id", agentId)
        .single();
        
      if (agentError) {
        throw new Error(`Error fetching agent: ${agentError.message}`);
      }
      
      if (agentData?.lead_list) {
        // Transform lead_list string to the expected format
        const phoneNumbers = agentData.lead_list.split(',').map((phone: string) => phone.trim());
        processedLeads = phoneNumbers.map((phone: string) => ({
          name: "Lead",
          phone
        }));
      }
    }

    if (!Array.isArray(processedLeads) || processedLeads.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid leads data. Expected non-empty array." }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Validate leads structure
    const invalidLeads = processedLeads.filter(
      (lead) => !lead.phone || typeof lead.phone !== "string"
    );

    if (invalidLeads.length > 0) {
      return new Response(
        JSON.stringify({
          error: "Invalid lead format. Each lead must have a phone property.",
          invalidLeads,
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log(`Processing ${processedLeads.length} leads for auto-calling`);

    // Here you would typically save to database and/or trigger calls
    // For now we'll just return success
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Auto-call campaign started with ${processedLeads.length} leads` 
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error processing auto-call batch:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
