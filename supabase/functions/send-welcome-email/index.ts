
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { Resend } from "npm:resend@2.0.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface LeadPayload {
  id: string
  name: string | null
  email: string | null
  phone: string | null
}

// Initialize Resend with API key
const resendApiKey = Deno.env.get("RESEND_API_KEY");
if (!resendApiKey) {
  console.error("Missing RESEND_API_KEY environment variable");
}
const resend = new Resend(resendApiKey);

const generateEmailHtml = (name: string | null) => {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #4f46e5; margin-bottom: 16px;">Welcome to Reachlytix, ${name || 'there'}!</h1>
      <p style="font-size: 16px; line-height: 24px;">We're glad you're here and excited to have you on board.</p>
      <p style="font-size: 16px; line-height: 24px; margin-top: 24px;">The Reachlytix Team</p>
    </div>
  `;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("[send-welcome-email] Function invoked");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("[send-welcome-email] Handling OPTIONS request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    let lead: LeadPayload;
    try {
      lead = await req.json();
      console.log("[send-welcome-email] Received lead data:", JSON.stringify(lead));
    } catch (parseError) {
      console.error("[send-welcome-email] Failed to parse request body:", parseError);
      throw new Error(`Invalid JSON payload: ${parseError.message}`);
    }

    // Validate lead data
    if (!lead || typeof lead !== 'object') {
      throw new Error("Invalid lead data: Expected an object");
    }
    
    if (!lead.email) {
      throw new Error("Lead email is required");
    }

    // Generate email HTML from our template function
    const html = generateEmailHtml(lead.name);
    console.log("[send-welcome-email] Generated HTML email template");

    // Send email via Resend
    console.log("[send-welcome-email] Sending email to:", lead.email);
    const emailResponse = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: lead.email,
      subject: "🚀 Welcome to Reachlytix",
      html: html,
    });

    console.log("[send-welcome-email] Email sent response:", JSON.stringify(emailResponse));

    // Log the email send to our database
    const supabaseUrl = 'https://szkhnwedzwvlqlktgvdp.supabase.co';
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseKey) {
      console.error("[send-welcome-email] Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
      throw new Error("SUPABASE_SERVICE_ROLE_KEY is required");
    }

    console.log("[send-welcome-email] Logging email delivery to email_logs table");
    
    // Prepare log data
    const logData = {
      lead_id: lead.id,
      status: 'delivered',
      response: emailResponse
    };
    
    console.log("[send-welcome-email] Log data:", JSON.stringify(logData));
    
    const logResponse = await fetch(`${supabaseUrl}/rest/v1/email_logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      },
      body: JSON.stringify(logData),
    });

    if (!logResponse.ok) {
      const errorText = await logResponse.text();
      console.error(`[send-welcome-email] Failed to log email (${logResponse.status}):`, errorText);
    } else {
      console.log("[send-welcome-email] Successfully logged email delivery");
    }

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    })
  } catch (error: any) {
    console.error("[send-welcome-email] Error in function:", error.message, error.stack);
    
    // Try to log the error
    try {
      const supabaseUrl = 'https://szkhnwedzwvlqlktgvdp.supabase.co';
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      
      if (supabaseKey) {
        console.log("[send-welcome-email] Logging error to email_logs table");
        
        // Extract lead ID if available
        let leadId = null;
        try {
          const payload = await req.clone().json();
          leadId = payload.id;
        } catch (e) {
          console.error("[send-welcome-email] Could not extract lead ID from request:", e);
        }
        
        await fetch(`${supabaseUrl}/rest/v1/email_logs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey
          },
          body: JSON.stringify({
            lead_id: leadId,
            status: 'failed',
            response: { error: error.message },
          }),
        });
      }
    } catch (logError) {
      console.error("[send-welcome-email] Error logging failure:", logError);
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    )
  }
}

console.log("[send-welcome-email] Function initialized");
serve(handler);
