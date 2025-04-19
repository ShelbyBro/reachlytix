
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
  
  try {
    const { campaignId, leads, content, isTest, testPhone, twilioCredentials } = await req.json();
    console.log(`Processing SMS request for campaign ${campaignId}, ${leads?.length || 0} leads, isTest: ${isTest}`);
    
    // Validate required parameters
    if (!campaignId || (!leads && !isTest) || !content) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const messageContent = content || "Thank you for joining Reachlytix. Stay tuned for offers!";
    
    // Initialize Twilio with either provided credentials or env variables
    let twilioClient, twilioPhoneNumber;
    
    try {
      if (twilioCredentials && twilioCredentials.accountSid && twilioCredentials.authToken && twilioCredentials.phoneNumber) {
        console.log("Using manually provided Twilio credentials");
        const twilio = await import("https://esm.sh/twilio@4.19.3");
        twilioClient = twilio.default(twilioCredentials.accountSid, twilioCredentials.authToken);
        twilioPhoneNumber = twilioCredentials.phoneNumber;
      } else {
        console.log("Using environment Twilio credentials");
        const twilioConfig = initTwilioClient();
        twilioClient = twilioConfig.client;
        twilioPhoneNumber = twilioConfig.phoneNumber;
      }
      
      // Test Twilio credentials with a simple verification
      if (!twilioClient) {
        throw new Error("Failed to initialize Twilio client");
      }
    } catch (error) {
      console.error("Error initializing Twilio:", error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Failed to initialize Twilio client. Please check your credentials."
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Results tracking
    const results = {
      success: 0,
      failed: 0,
      messages: [] as any[]
    };
    
    if (isTest && testPhone) {
      const sanitizedPhone = sanitizePhoneNumber(testPhone);
      console.log(`Sending test SMS to ${sanitizedPhone} using Twilio number ${twilioPhoneNumber}`);
      
      try {
        const message = await twilioClient.messages.create({
          body: messageContent,
          from: twilioPhoneNumber,
          to: sanitizedPhone
        });
        
        console.log("Test SMS sent successfully:", message.sid);
        
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
      } catch (error) {
        console.error("Failed to send test SMS:", error);
        
        await logSmsMessage(supabase, {
          campaignId,
          leadId: null,
          phone: sanitizedPhone,
          message: messageContent,
          status: 'failed',
          error: error.message
        });
        
        results.failed = 1;
        results.messages.push({
          phone: sanitizedPhone,
          status: 'failed',
          error: error.message
        });
      }
    } else {
      for (const lead of leads) {
        if (!lead.phone) {
          console.log(`Skipping lead ${lead.id}: No phone number`);
          results.failed++;
          continue;
        }
        
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
        } catch (error) {
          await logSmsMessage(supabase, {
            campaignId,
            leadId: lead.id,
            phone: sanitizedPhone,
            message: messageContent,
            status: 'failed',
            error: error.message
          });
          
          results.failed++;
          results.messages.push({
            leadId: lead.id,
            phone: sanitizedPhone,
            status: 'failed',
            error: error.message
          });
        }
      }
    }
    
    // Update campaign status in database if not a test
    if (!isTest) {
      await updateCampaignStatus(supabase, campaignId, results.failed > 0);
    }
    
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
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
