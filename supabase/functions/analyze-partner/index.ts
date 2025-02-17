
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { partnerId, companyName, website, industry, description, status } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Prepare context for analysis
    const context = `
      Company Name: ${companyName}
      Website: ${website || 'Not provided'}
      Industry: ${industry || 'Not specified'}
      Current Status: ${status}
      Description: ${description || 'Not provided'}
    `;

    // Get AI analysis using fetch directly
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a business analyst. Analyze the following partner information and provide insights about their potential value as a partner. Focus on their industry presence, growth potential, and alignment with business goals.'
          },
          {
            role: 'user',
            content: context
          }
        ],
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      throw new Error(data.error?.message || 'Failed to get AI analysis');
    }

    const analysis = data.choices[0].message.content;

    // Update the partner record with the analysis
    const { error: updateError } = await supabaseClient
      .from('partners')
      .update({
        ai_analysis: { analysis },
        last_analysis_date: new Date().toISOString()
      })
      .eq('id', partnerId);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        analysis 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
