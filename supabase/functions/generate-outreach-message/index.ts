
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { platform, prompt } = await req.json();

    const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('GOOGLE_API_KEY')}`,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an expert in business communication and outreach. Generate a professional ${platform} message that is appropriate for the platform's style and format. Keep the tone professional but conversational.

Generate a ${platform} outreach message with the following context: ${prompt}`
          }]
        }]
      }),
    });

    const data = await response.json();
    console.log('Gemini API Response:', data); // For debugging
    
    const message = data.candidates[0].content.parts[0].text;

    return new Response(
      JSON.stringify({ message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Error in generate-outreach-message:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
