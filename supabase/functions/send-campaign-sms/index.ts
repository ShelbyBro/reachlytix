
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "./utils/cors.ts";
import { initTwilioClient } from "./utils/twilio.ts";
import { sanitizePhoneNumber } from "./utils/phone.ts";
import { logSmsMessage } from "./utils/logs.ts";
import { updateCampaignStatus } from "./utils/campaign.ts";

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
    // Safely parse the JSON body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log("Request payload:", JSON.stringify(requestBody, null, 2));
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid request format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Safely destructure the request body with default values
    const {
      campaignId = null,
      leads = [],
      content = "",
      isTest = false,
      testPhone = null,
      messageType = "sms",
      twilioCredentials = null
    } = requestBody;
    
    console.log(`Processing ${messageType || 'SMS'} request for campaign ${campaignId}, ${leads?.length || 0} leads, isTest: ${isTest}`);
    
    if (isTest && testPhone) {
      console.log(`Test message will be sent to: ${testPhone}`);
    }
    
    // Validate required parameters
    if (!campaignId || (!leads?.length && !isTest) || !content) {
      const missingParams = [];
      if (!campaignId) missingParams.push('campaignId');
      if (!leads?.length && !isTest) missingParams.push('leads');
      if (!content) missingParams.push('content');
      if (isTest && !testPhone) missingParams.push('testPhone');
      
      console.error(`Missing required parameters: ${missingParams.join(', ')}`);
      return new Response(
        JSON.stringify({ success: false, error: `Missing required parameters: ${missingParams.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const messageContent = content || "Thank you for joining Reachlytix. Stay tuned for offers!";
    
    // Initialize Twilio with either provided credentials or env variables
    let twilioClient, twilioPhoneNumber;
    
    try {
      if (twilioCredentials && typeof twilioCredentials === 'object' && 
          twilioCredentials.accountSid && twilioCredentials.authToken && twilioCredentials.phoneNumber) {
        console.log("Using manually provided Twilio credentials");
        const twilioConfig = initTwilioClient(twilioCredentials);
        twilioClient = twilioConfig.client;
        twilioPhoneNumber = twilioConfig.phoneNumber;
      } else {
        console.log("Using environment Twilio credentials");
        const twilioConfig = initTwilioClient();
        twilioClient = twilioConfig.client;
        twilioPhoneNumber = twilioConfig.phoneNumber;
      }
    } catch (error) {
      console.error("Error initializing Twilio:", error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to initialize Twilio client: ${error.message || 'Unknown error'}`
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Results tracking
    const results = {
      success: 0,
      failed: 0,
      messages: [] as any[]
    };
    
    if (isTest && testPhone) {
      try {
        const sanitizedPhone = sanitizePhoneNumber(testPhone);
        console.log(`Sending test ${messageType || 'SMS'} to ${sanitizedPhone} using Twilio number ${twilioPhoneNumber}`);
        
        // Send the test message using Twilio
        let message;
        try {
          message = await twilioClient.messages.create({
            body: messageContent,
            from: twilioPhoneNumber,
            to: sanitizedPhone
          });
          
          console.log(`Test ${messageType || 'SMS'} sent successfully:`, message.sid);
          
          // Log the successful test message
          await logSmsMessage(supabase, {
            campaignId,
            leadId: null,
            phone: sanitizedPhone,
            message: messageContent,
            status: 'sent',
            sid: message.sid
          });
          
          results.success = 1;
          results.messages.push({
            phone: sanitizedPhone,
            status: 'sent',
            sid: message.sid
          });
        } catch (twilioError) {
          console.error(`Failed to send test ${messageType || 'SMS'} via Twilio:`, twilioError);
          
          // Log the failed test message
          await logSmsMessage(supabase, {
            campaignId,
            leadId: null,
            phone: sanitizedPhone,
            message: messageContent,
            status: 'failed',
            error: twilioError.message
          });
          
          results.failed = 1;
          results.messages.push({
            phone: sanitizedPhone,
            status: 'failed',
            error: twilioError.message
          });
        }
      } catch (testError) {
        console.error(`Error in test SMS process:`, testError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Error in test SMS process: ${testError.message || 'Unknown error'}`
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else if (leads && Array.isArray(leads)) {
      // Process bulk campaign messages
      for (const lead of leads) {
        if (!lead.phone) {
          console.log(`Skipping lead ${lead.id}: No phone number`);
          results.failed++;
          continue;
        }
        
        try {
          const sanitizedPhone = sanitizePhoneNumber(lead.phone);
          
          try {
            const message = await twilioClient.messages.create({
              body: messageContent,
              from: twilioPhoneNumber,
              to: sanitizedPhone
            });
            
            await logSmsMessage(supabase, {
              campaignId,
              leadId: lead.id,
              phone: sanitizedPhone,
              message: messageContent,
              status: 'sent',
              sid: message.sid
            });
            
            results.success++;
            results.messages.push({
              leadId: lead.id,
              phone: sanitizedPhone,
              status: 'sent',
              sid: message.sid
            });
          } catch (twilioError) {
            await logSmsMessage(supabase, {
              campaignId,
              leadId: lead.id,
              phone: sanitizedPhone,
              message: messageContent,
              status: 'failed',
              error: twilioError.message
            });
            
            results.failed++;
            results.messages.push({
              leadId: lead.id,
              phone: sanitizedPhone,
              status: 'failed',
              error: twilioError.message
            });
          }
        } catch (leadError) {
          console.error(`Error processing lead ${lead.id}:`, leadError);
          results.failed++;
        }
      }
    }
    
    // Update campaign status in database if not a test
    if (!isTest) {
      try {
        await updateCampaignStatus(supabase, campaignId, results.failed > 0);
      } catch (updateError) {
        console.error('Failed to update campaign status:', updateError);
      }
    }
    
    console.log(`SMS operation completed: ${results.success} successful, ${results.failed} failed`);
    
    // Send the response
    return new Response(
      JSON.stringify({ 
        success: true, 
        results: {
          totalSent: results.success,
          totalFailed: results.failed,
          messages: results.messages
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error) {
    console.error('Error processing SMS request:', error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
