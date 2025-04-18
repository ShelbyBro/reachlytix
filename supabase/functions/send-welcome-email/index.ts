
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

const resend = new Resend(Deno.env.get("RESEND_API_KEY"))

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
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const lead: LeadPayload = await req.json()
    console.log("Received lead:", lead)

    if (!lead.email) {
      throw new Error("Lead email is required")
    }

    // Generate email HTML from our template function
    const html = generateEmailHtml(lead.name)

    const emailResponse = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: lead.email,
      subject: "🚀 Welcome to Reachlytix",
      html: html,
    })

    console.log("Email sent successfully:", emailResponse)

    // Log the email send to our database
    const supabaseUrl = 'https://szkhnwedzwvlqlktgvdp.supabase.co';
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseKey) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY is required");
    }

    const logResponse = await fetch(`${supabaseUrl}/rest/v1/email_logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      },
      body: JSON.stringify({
        lead_id: lead.id,
        status: 'delivered',
        response: emailResponse,
      }),
    });

    if (!logResponse.ok) {
      console.error("Failed to log email:", await logResponse.text());
    }

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    })
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error)
    
    // Try to log the error
    try {
      const supabaseUrl = 'https://szkhnwedzwvlqlktgvdp.supabase.co';
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      
      if (supabaseKey) {
        await fetch(`${supabaseUrl}/rest/v1/email_logs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey
          },
          body: JSON.stringify({
            lead_id: (req.json as any)?.id,
            status: 'failed',
            response: { error: error.message },
          }),
        });
      }
    } catch (logError) {
      console.error("Error logging failure:", logError);
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

serve(handler)
