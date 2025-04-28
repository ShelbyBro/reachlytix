
// This function connects to the Serper.dev API to fetch business data
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SERPER_API_KEY = "006679789670d44fd81d635f4a8999b30666fab4";
const SERPER_API_URL = "https://google.serper.dev/places";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const { keyword, location, limit = 5 } = await req.json();
    
    // Validate inputs
    if (!keyword || !location) {
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'keyword and location are required parameters'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    console.log(`Searching for ${keyword} in ${location}, limit: ${limit}`);

    // Make request to Serper.dev API
    const searchResponse = await fetch(SERPER_API_URL, {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: `${keyword} ${location}`,
        gl: "us",
        hl: "en",
        num: parseInt(limit)
      })
    });

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error("Error from Serper API:", errorText);
      throw new Error(`Serper API error: ${searchResponse.status} ${errorText}`);
    }

    const serperData = await searchResponse.json();
    console.log("Serper API response received");

    // Process and transform the results
    let leads = [];
    
    if (serperData.places && Array.isArray(serperData.places)) {
      leads = serperData.places.map(place => {
        // Generate a business email based on business name and website
        let email = "";
        if (place.website) {
          const domain = place.website.replace(/^https?:\/\//i, "").replace(/^www\./i, "").split("/")[0];
          email = `info@${domain}`;
        }
        
        return {
          name: place.title || "Unknown Business",
          company: place.title || "Unknown Business",
          phone: place.phone || "",
          email: email,
          website: place.website || "",
          address: place.address || "",
          source: `Smart Scrape: ${keyword} in ${location}`,
        };
      });
    }

    console.log(`Processed ${leads.length} leads`);
    
    return new Response(
      JSON.stringify({
        status: 'success',
        leads: leads
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({
        status: 'error',
        message: error.message || 'Internal server error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
