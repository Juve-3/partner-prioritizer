
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

    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiKey) {
      console.error('OpenAI API key is not configured');
      return new Response(
        JSON.stringify({
          error: 'Configuration error',
          details: 'OpenAI API key is not configured'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in business communication and outreach.'
          },
          {
            role: 'user',
            content: `Write a professional ${platform} message. The message should be appropriate for ${platform}'s style and format, maintaining a professional yet conversational tone.

Context and goal for the message: ${prompt}

Important guidelines:
- Keep it concise and platform-appropriate
- Be professional but friendly
- Include a clear call to action
- Maintain a natural conversational flow`
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error response:', errorData);
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
    console.log('OpenAI API Response:', JSON.stringify(data, null, 2));

    if (!data.choices?.[0]?.message?.content) {
      return new Response(
        JSON.stringify({
          error: 'Invalid Response',
          details: 'Unexpected response format from OpenAI API'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const message = data.choices[0].message.content.trim();

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
