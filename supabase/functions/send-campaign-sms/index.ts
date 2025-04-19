
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "./utils/cors.ts";
import { CampaignService } from "./services/campaign-service.ts";

// Create a Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  console.log("📱 SMS edge function called");
  
  try {
    const requestBody = await req.json();
    console.log("Request payload:", JSON.stringify({
      ...requestBody,
      content: requestBody.content ? 
        (requestBody.content.substring(0, 20) + (requestBody.content.length > 20 ? '...' : '')) : 
        'No content'
    }, null, 2));

    const {
      campaignId,
      leads = [],
      content = "",
      isTest = false,
      testPhone = null,
      messageType = "sms",
      twilioCredentials = null
    } = requestBody;

    // Validate required parameters
    if (!campaignId) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing campaignId parameter" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if ((!leads?.length && !isTest) || (!testPhone && isTest)) {
      const errorMessage = isTest ? 
        "Missing testPhone parameter for test message" : 
        "No leads provided for campaign";
      
      return new Response(
        JSON.stringify({ success: false, error: errorMessage }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!content) {
      return new Response(
        JSON.stringify({ success: false, error: "No message content provided" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const campaignService = new CampaignService(supabase, twilioCredentials);
    let result;

    if (isTest && testPhone) {
      result = await campaignService.sendTestMessage(campaignId, testPhone, content);
    } else {
      result = await campaignService.sendCampaign(campaignId, leads, content);
    }

    console.log(`SMS operation completed: ${result.totalSent} successful, ${result.totalFailed} failed`);
    
    return new Response(
      JSON.stringify({ success: result.success, results: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error processing SMS request:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error',
        details: error.stack || 'No stack trace available'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
