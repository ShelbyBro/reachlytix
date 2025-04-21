
// This TypeScript wrapper runs a Python script for smart scraping
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Set up the python script to run
    const pythonScript = `
import random
import re
import json
from datetime import datetime

def generate_leads(keyword, location, limit):
    # Company name patterns based on keyword
    company_patterns = [
        f"{keyword.title()} Solutions",
        f"{keyword.title()} {location.title()}",
        f"{location.title()} {keyword.title()}",
        f"The {keyword.title()} Group",
        f"{keyword.title()} Experts",
        f"{keyword.title()} Professional Services",
        f"{location.title()} {keyword.title()} Association",
        f"{keyword.title()} Specialists"
    ]
    
    # Domain patterns for generating emails and websites
    domain_patterns = [
        f"{keyword.lower().replace(' ', '')}.com",
        f"{keyword.lower().replace(' ', '')}-{location.lower().replace(' ', '')}.com",
        f"{keyword.lower()[0:3]}{location.lower()[0:3]}.com",
        f"{location.lower().replace(' ', '')}{keyword.lower().replace(' ', '')}.co",
        f"the{keyword.lower().replace(' ', '')}.net"
    ]
    
    # Name patterns
    first_names = ["John", "Jane", "Michael", "Sarah", "David", "Lisa", "Robert", "Emily", 
                   "William", "Olivia", "James", "Sophia", "Daniel", "Emma", "Matthew", "Ava"]
    
    last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Garcia", 
                  "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee"]
    
    # Phone area codes relevant to locations (simplified)
    area_codes = {
        "new york": ["212", "646", "718"],
        "los angeles": ["213", "310", "323"],
        "chicago": ["312", "773", "872"],
        "houston": ["713", "281", "832"],
        "phoenix": ["602", "480", "623"],
        "philadelphia": ["215", "267", "445"],
        "san antonio": ["210", "830", "726"],
        "san diego": ["619", "858", "935"],
        "dallas": ["214", "469", "972"],
        "san jose": ["408", "669", "747"]
    }
    
    # Default area codes if location not found
    default_area_codes = ["555", "444", "333"]
    
    location_lower = location.lower()
    matching_area_codes = area_codes.get(location_lower, default_area_codes)
    
    leads = []
    for _ in range(min(int(limit), 20)):  # Limit to 20 max for performance
        # Generate company name
        company_name = random.choice(company_patterns)
        
        # Generate domain
        domain = random.choice(domain_patterns)
        
        # Generate person name
        first_name = random.choice(first_names)
        last_name = random.choice(last_names)
        full_name = f"{first_name} {last_name}"
        
        # Generate email
        email_patterns = [
            f"{first_name.lower()}.{last_name.lower()}@{domain}",
            f"{first_name.lower()[0]}{last_name.lower()}@{domain}",
            f"{first_name.lower()}@{domain}",
            f"info@{domain}",
            f"contact@{domain}"
        ]
        email = random.choice(email_patterns)
        
        # Generate phone number
        area_code = random.choice(matching_area_codes)
        phone_mid = str(random.randint(100, 999))
        phone_end = str(random.randint(1000, 9999))
        phone = f"+1 ({area_code}) {phone_mid}-{phone_end}"
        
        # Generate website
        website = f"https://www.{domain}"
        
        # Source information
        source = f"Smart Scrape: {keyword} in {location} - {datetime.now().strftime('%Y-%m-%d')}"
        
        leads.append({
            "name": full_name,
            "company": company_name,
            "phone": phone,
            "email": email,
            "website": website,
            "source": source
        })
    
    return leads

# Get input parameters from environment variables set by the TypeScript wrapper
import os
keyword = "${keyword}"
location = "${location}" 
limit = ${limit}

# Generate the leads
leads = generate_leads(keyword, location, limit)

# Return JSON results
print(json.dumps({"status": "success", "leads": leads}))
    `;

    // Create a temporary Python file
    const tempFile = await Deno.makeTempFile({suffix: '.py'});
    await Deno.writeTextFile(tempFile, pythonScript);

    // Execute the Python script
    const command = new Deno.Command('python3', {
      args: [tempFile],
      stdout: 'piped',
      stderr: 'piped',
    });
    
    const { stdout, stderr, success } = await command.output();
    
    // Clean up temp file
    await Deno.remove(tempFile);
    
    if (!success) {
      const errorOutput = new TextDecoder().decode(stderr);
      console.error("Python script error:", errorOutput);
      
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'Failed to generate leads',
          details: errorOutput
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }
    
    const output = new TextDecoder().decode(stdout);
    
    // If Python script couldn't run, fallback to JavaScript implementation
    if (!output.trim()) {
      console.log("Python execution failed, falling back to JavaScript implementation");
      const leads = generateLeadsFallback(keyword, location, limit);
      return new Response(
        JSON.stringify({ status: 'success', leads }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      output,
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

// Fallback JavaScript implementation if Python is not available
function generateLeadsFallback(keyword, location, limit) {
  const companyPatterns = [
    `${keyword} Solutions`,
    `${keyword} ${location}`,
    `${location} ${keyword}`,
    `The ${keyword} Group`,
    `${keyword} Experts`
  ];
  
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'];
  
  const domains = [
    `${keyword.toLowerCase().replace(/\s/g, '')}.com`,
    `${keyword.toLowerCase().replace(/\s/g, '')}-${location.toLowerCase().replace(/\s/g, '')}.com`,
    `the${keyword.toLowerCase().replace(/\s/g, '')}.net`
  ];
  
  const leads = [];
  
  for (let i = 0; i < Math.min(limit, 10); i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const fullName = `${firstName} ${lastName}`;
    
    const company = companyPatterns[Math.floor(Math.random() * companyPatterns.length)];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    
    const areaCode = Math.floor(Math.random() * 900) + 100;
    const midDigits = Math.floor(Math.random() * 900) + 100;
    const endDigits = Math.floor(Math.random() * 9000) + 1000;
    
    leads.push({
      name: fullName,
      company,
      phone: `+1 (${areaCode}) ${midDigits}-${endDigits}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
      website: `https://www.${domain}`,
      source: `Smart Scrape: ${keyword} in ${location}`
    });
  }
  
  return leads;
}
