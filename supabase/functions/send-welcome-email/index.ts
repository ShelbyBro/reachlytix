
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
  source: string | null
  client_id: string | null
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"))

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

    const emailResponse = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: lead.email,
      subject: "🚀 Welcome to Reachlytix",
      html: `<p>Welcome to Reachlytix CRM, ${lead.name || "there"}!<br>We're excited to have you on board.</p>`,
    })

    console.log("Email sent successfully:", emailResponse)

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    })
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error)
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
