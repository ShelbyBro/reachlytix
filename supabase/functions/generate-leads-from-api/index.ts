
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Mock data generator
function generateMockLeads(keyword: string, location: string, platform: string) {
  const companies = ['Tech Corp', 'Digital Solutions', 'Innovation Labs', 'Future Systems']
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'company.com']
  
  return Array.from({ length: 5 }, (_, i) => ({
    name: `Contact ${i + 1} (${keyword})`,
    email: `contact${i + 1}${keyword.toLowerCase().replace(/\s/g, '')}@${domains[i % domains.length]}`,
    phone: `+1${Math.floor(Math.random() * 1000000000).toString().padStart(10, '0')}`,
    source: `${platform} - ${location}`,
    status: 'valid'
  }))
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { keyword, location, platform } = await req.json()
    console.log('Received request with filters:', { keyword, location, platform })

    // Generate mock leads
    const leads = generateMockLeads(keyword, location, platform)

    return new Response(
      JSON.stringify({
        success: true,
        leads,
        message: "Generated mock leads successfully. Real API integration coming soon!"
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error generating leads:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to generate leads'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
