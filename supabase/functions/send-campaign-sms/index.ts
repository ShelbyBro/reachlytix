
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
      console.log("Request payload:", JSON.stringify({
        ...requestBody,
        content: requestBody.content ? 
          (requestBody.content.substring(0, 20) + (requestBody.content.length > 20 ? '...' : '')) : 
          'No content'
      }, null, 2));
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
    if (!campaignId) {
      console.error("Missing campaignId parameter");
      return new Response(
        JSON.stringify({ success: false, error: "Missing campaignId parameter" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if ((!leads?.length && !isTest) || (!testPhone && isTest)) {
      const errorMessage = isTest ? 
        "Missing testPhone parameter for test message" : 
        "No leads provided for campaign";
      
      console.error(errorMessage);
      return new Response(
        JSON.stringify({ success: false, error: errorMessage }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!content) {
      console.error("Missing content parameter");
      return new Response(
        JSON.stringify({ success: false, error: "No message content provided" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const messageContent = content;
    
    // Initialize Twilio with either provided credentials or env variables
    let twilioClient, twilioPhoneNumber;
    
    try {
      if (twilioCredentials && typeof twilioCredentials === 'object' && 
          twilioCredentials.accountSid && twilioCredentials.authToken && twilioCredentials.phoneNumber) {
        console.log("Using manually provided Twilio credentials");
        console.log(`Account SID: ${twilioCredentials.accountSid.substring(0, 5)}...`);
        console.log(`From phone number: ${twilioCredentials.phoneNumber}`);
        
        const twilioConfig = initTwilioClient(twilioCredentials);
        twilioClient = twilioConfig.client;
        twilioPhoneNumber = twilioConfig.phoneNumber;
      } else {
        console.log("Using environment Twilio credentials");
        const envAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID') || '';
        const envAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN') || '';
        const envPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER') || '';
        
        console.log(`Env Account SID: ${envAccountSid ? envAccountSid.substring(0, 5) + '...' : 'Not set'}`);
        console.log(`Env Auth Token: ${envAuthToken ? 'Present' : 'Not set'}`);
        console.log(`Env Phone Number: ${envPhoneNumber || 'Not set'}`);
        
        if (!envAccountSid || !envAuthToken || !envPhoneNumber) {
          throw new Error(`Missing Twilio environment variables: ${
            [
              !envAccountSid ? 'TWILIO_ACCOUNT_SID' : '',
              !envAuthToken ? 'TWILIO_AUTH_TOKEN' : '',
              !envPhoneNumber ? 'TWILIO_PHONE_NUMBER' : ''
            ].filter(Boolean).join(', ')
          }`);
        }
        
        const twilioConfig = initTwilioClient();
        twilioClient = twilioConfig.client;
        twilioPhoneNumber = twilioConfig.phoneNumber;
      }
      
      // Validate Twilio client was initialized
      if (!twilioClient) {
        throw new Error('Failed to initialize Twilio client');
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
          // Validate phone number
          if (!sanitizedPhone || !sanitizedPhone.startsWith('+')) {
            throw new Error(`Invalid phone number format: ${sanitizedPhone}. Must start with + and country code.`);
          }
          
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
          console.error(`Twilio error details:`, JSON.stringify(twilioError, null, 2));
          
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
          
          // Return specific error for test message
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `Twilio error: ${twilioError.message}`,
              details: twilioError.code ? `Error code: ${twilioError.code}` : undefined,
              results: {
                totalSent: 0,
                totalFailed: 1,
                messages: [{
                  phone: sanitizedPhone,
                  status: 'failed',
                  error: twilioError.message
                }]
              }
            }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
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
          results.messages.push({
            leadId: lead.id,
            status: 'failed',
            error: 'No phone number provided'
          });
          continue;
        }
        
        try {
          const sanitizedPhone = sanitizePhoneNumber(lead.phone);
          console.log(`Processing lead ${lead.id} with phone ${sanitizedPhone}`);
          
          if (!sanitizedPhone || !sanitizedPhone.startsWith('+')) {
            console.error(`Invalid phone format for lead ${lead.id}: ${sanitizedPhone}`);
            results.failed++;
            results.messages.push({
              leadId: lead.id,
              phone: lead.phone,
              status: 'failed',
              error: 'Invalid phone number format'
            });
            continue;
          }
          
          try {
            const message = await twilioClient.messages.create({
              body: messageContent,
              from: twilioPhoneNumber,
              to: sanitizedPhone
            });
            
            console.log(`SMS sent to lead ${lead.id} with SID: ${message.sid}`);
            
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
            console.error(`Twilio error for lead ${lead.id}:`, twilioError);
            
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
          results.messages.push({
            leadId: lead.id,
            status: 'failed',
            error: leadError.message || 'Unknown error'
          });
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
        success: results.success > 0, 
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
