
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessType, campaignGoal, messageType } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    // Validate input parameters
    if (!businessType || !campaignGoal || !messageType) {
      console.error('Missing required parameters:', { businessType, campaignGoal, messageType });
      throw new Error('Missing required parameters: businessType, campaignGoal, or messageType');
    }

    if (!openAIApiKey) {
      console.error('OpenAI API key not found');
      throw new Error('OpenAI API key not found');
    }

    console.log(`Generating ${messageType} content for ${businessType} business with goal: ${campaignGoal}`);

    const systemPrompt = `You are a professional marketing content writer. Generate ${messageType} content for a ${businessType} business with the goal of ${campaignGoal}. 
    If generating email content, include a subject line prefixed with 'Subject:'.
    If generating SMS content, keep it concise and under 160 characters.
    If generating WhatsApp content, make it conversational and include emojis where appropriate.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using an updated model that's available
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Generate a ${messageType} message for a ${businessType} business focusing on ${campaignGoal}.`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || JSON.stringify(errorData) || 'Unknown error'}`);
    }

    const data = await response.json();
    
    console.log('OpenAI API response received:', JSON.stringify(data).substring(0, 200) + '...');
    
    // Detailed validation of the response structure
    if (!data) {
      throw new Error('Empty response from OpenAI');
    }
    
    if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
      console.error('Invalid response structure from OpenAI (no choices array):', data);
      throw new Error('Invalid response from OpenAI: No choices returned');
    }
    
    if (!data.choices[0] || !data.choices[0].message) {
      console.error('Invalid response structure from OpenAI (no message in first choice):', data.choices);
      throw new Error('Invalid response from OpenAI: No message in response');
    }
    
    if (!data.choices[0].message.content) {
      console.error('Invalid response structure from OpenAI (no content in message):', data.choices[0].message);
      throw new Error('Invalid response from OpenAI: No content in message');
    }

    const content = data.choices[0].message.content.trim();
    console.log(`Generated content (first 100 chars): ${content.substring(0, 100)}...`);

    return new Response(JSON.stringify({ 
      success: true,
      content: content
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Campaign content generation error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error occurred',
        content: null
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
