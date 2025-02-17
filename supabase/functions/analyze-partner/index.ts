
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
    const googleApiKey = Deno.env.get('GOOGLE_API_KEY');

    if (!googleApiKey) {
      throw new Error('Google API key not configured');
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Prepare context for analysis
    const prompt = `
      Please analyze this business partner information:
      Company Name: ${companyName}
      Website: ${website || 'Not provided'}
      Industry: ${industry || 'Not specified'}
      Current Status: ${status}
      Description: ${description || 'Not provided'}
      
      Provide insights about their potential value as a partner. Focus on their industry presence, growth potential, and alignment with business goals.
    `;

    // Call Google's PaLM API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta3/models/text-bison-001:generateText?key=${googleApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: {
            text: prompt
          },
          temperature: 0.7,
          candidate_count: 1,
        }),
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Google PaLM API error:', data);
      throw new Error(data.error?.message || 'Failed to get AI analysis');
    }

    const analysis = data.candidates[0].output;

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
