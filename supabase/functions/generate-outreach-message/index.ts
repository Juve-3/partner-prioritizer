
import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { platform, prompt } = await req.json();
    console.log('Received request:', { platform, prompt });

    const googleApiKey = Deno.env.get('GOOGLE_API_KEY');
    if (!googleApiKey) {
      console.error('Google API key is not configured');
      return new Response(
        JSON.stringify({
          error: 'Configuration error',
          details: 'Google API key is not configured'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=' + googleApiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `As an expert in business communication and outreach, write a professional ${platform} message. The message should be appropriate for ${platform}'s style and format, maintaining a professional yet conversational tone.

Context and goal for the message: ${prompt}

Important guidelines:
- Keep it concise and platform-appropriate
- Be professional but friendly
- Include a clear call to action
- Maintain a natural conversational flow`
          }]
        }]
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error response:', errorData);
      return new Response(
        JSON.stringify({
          error: 'API Error',
          details: `Failed to generate message: ${response.status} ${response.statusText}`
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const data = await response.json();
    console.log('Gemini API Response:', JSON.stringify(data, null, 2));

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return new Response(
        JSON.stringify({
          error: 'Invalid Response',
          details: 'Unexpected response format from Gemini API'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const message = data.candidates[0].content.parts[0].text.trim();

    return new Response(
      JSON.stringify({ message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Error in generate-outreach-message:', error);
    return new Response(
      JSON.stringify({
        error: 'Server Error',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
