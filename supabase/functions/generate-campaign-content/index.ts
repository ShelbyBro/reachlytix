
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

    if (!openAIApiKey) {
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
        model: 'gpt-3.5-turbo',
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
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    console.log('OpenAI API response received');
    
    // Validate the response structure before returning
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid response structure from OpenAI:', data);
      throw new Error('Invalid response from OpenAI');
    }

    return new Response(JSON.stringify({ 
      success: true,
      content: data.choices[0].message.content,
      data: data  // Include full data for debugging if needed
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Campaign content generation error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        content: null
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
