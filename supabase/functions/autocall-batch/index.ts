
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
    const leads = await req.json();
    if (!Array.isArray(leads) || leads.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid leads data. Expected non-empty array." }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Validate leads structure
    const invalidLeads = leads.filter(
      (lead) => !lead.name || !lead.phone || typeof lead.name !== "string" || typeof lead.phone !== "string"
    );

    if (invalidLeads.length > 0) {
      return new Response(
        JSON.stringify({
          error: "Invalid lead format. Each lead must have name and phone properties.",
          invalidLeads,
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log(`Processing ${leads.length} leads for auto-calling`);

    // Here you would typically save to database and/or trigger calls
    // For now we'll just return success
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Auto-call campaign started with ${leads.length} leads` 
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
