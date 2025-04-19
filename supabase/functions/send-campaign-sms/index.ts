
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import twilio from "https://esm.sh/twilio@4.19.3";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Set up Twilio client
const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID') || '';
const authToken = Deno.env.get('TWILIO_AUTH_TOKEN') || '';
const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER') || '';
const twilioClient = twilio(accountSid, authToken);

// Helper function to sanitize phone numbers
function sanitizePhoneNumber(phoneNumber: string): string {
  // Remove any non-digit characters
  let sanitized = phoneNumber.replace(/\D/g, '');
  
  // Ensure it starts with + if it doesn't have one and has a country code
  if (!sanitized.startsWith('+') && sanitized.length > 10) {
    sanitized = '+' + sanitized;
  } else if (sanitized.length === 10) {
    // Assume US number if only 10 digits
    sanitized = '+1' + sanitized;
  }
  
  return sanitized;
}

// Log the SMS to the database
async function logSmsMessage(
  campaignId: string,
  leadId: string | null,
  phone: string,
  message: string,
  status: string,
  sid?: string,
  error?: string
) {
  try {
    const { error: insertError } = await supabase
      .from('sms_logs')
      .insert({
        campaign_id: campaignId,
        lead_id: leadId,
        phone,
        message,
        status,
        sid,
        error
      });
    
    if (insertError) {
      console.error('Error logging SMS:', insertError);
    }
  } catch (err) {
    console.error('Failed to log SMS:', err);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { campaignId, leads, content, isTest, testPhone } = await req.json();
    console.log(`Processing SMS request for campaign ${campaignId}, ${leads?.length || 0} leads`);
    
    // Validate required parameters
    if (!campaignId || (!leads && !isTest) || !content) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get message content or use fallback
    const messageContent = content || 
      "Thank you for joining Reachlytix. Stay tuned for offers!";
    
    // Results tracking
    const results = {
      success: 0,
      failed: 0,
      messages: [] as any[]
    };
    
    // If it's a test message, just send to the test phone number
    if (isTest && testPhone) {
      console.log(`Sending test SMS to ${testPhone}`);
      const sanitizedPhone = sanitizePhoneNumber(testPhone);
      
      try {
        // Send the SMS using Twilio
        const message = await twilioClient.messages.create({
          body: messageContent,
          from: twilioPhoneNumber,
          to: sanitizedPhone
        });
        
        // Log the test message
        await logSmsMessage(
          campaignId,
          null, // No lead ID for test messages
          sanitizedPhone,
          messageContent,
          'sent',
          message.sid
        );
        
        results.success = 1;
        results.messages.push({
          phone: sanitizedPhone,
          status: 'sent',
          sid: message.sid
        });
        
        console.log(`Test SMS sent successfully to ${sanitizedPhone}`);
      } catch (error) {
        console.error(`Error sending test SMS: ${error.message}`);
        
        // Log the failed message
        await logSmsMessage(
          campaignId,
          null, // No lead ID for test messages
          sanitizedPhone,
          messageContent,
          'failed',
          undefined,
          error.message
        );
        
        results.failed = 1;
        results.messages.push({
          phone: sanitizedPhone,
          status: 'failed',
          error: error.message
        });
      }
    } else {
      // Regular campaign - process all leads
      for (const lead of leads) {
        if (!lead.phone) {
          console.log(`Skipping lead ${lead.id}: No phone number`);
          results.failed++;
          continue;
        }
        
        const sanitizedPhone = sanitizePhoneNumber(lead.phone);
        console.log(`Processing SMS for lead ${lead.id} to phone ${sanitizedPhone}`);
        
        try {
          // Send the SMS using Twilio
          const message = await twilioClient.messages.create({
            body: messageContent,
            from: twilioPhoneNumber,
            to: sanitizedPhone
          });
          
          // Log the successful message
          await logSmsMessage(
            campaignId,
            lead.id,
            sanitizedPhone,
            messageContent,
            'sent',
            message.sid
          );
          
          results.success++;
          results.messages.push({
            leadId: lead.id,
            phone: sanitizedPhone,
            status: 'sent',
            sid: message.sid
          });
          
          console.log(`SMS sent successfully to ${sanitizedPhone} for lead ${lead.id}`);
        } catch (error) {
          console.error(`Error sending SMS to ${sanitizedPhone}: ${error.message}`);
          
          // Log the failed message
          await logSmsMessage(
            campaignId,
            lead.id,
            sanitizedPhone,
            messageContent,
            'failed',
            undefined,
            error.message
          );
          
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
    
    // Update campaign status in database
    if (!isTest) {
      await supabase
        .from('campaigns')
        .update({ 
          status: 'sent',
          schedule_status: results.failed === 0 ? 'completed' : 'completed_with_errors' 
        })
        .eq('id', campaignId);
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
