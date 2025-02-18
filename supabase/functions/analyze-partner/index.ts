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
    const body = await req.json();
    const googleApiKey = Deno.env.get('GOOGLE_API_KEY');

    if (!googleApiKey) {
      throw new Error('Google API key not configured');
    }

    if (body.action === 'compare') {
      console.log('Comparing partners:', body.partners.map((p: any) => p.companyName));

      const prompt = `
        Please analyze and compare these potential business partners, ranking them from most suitable to least suitable for partnership. Consider their industry presence, growth potential, and overall partnership value.
        
        Partners to compare:
        ${body.partners.map((p: any) => `
        Company: ${p.companyName}
        Industry: ${p.industry || 'Not specified'}
        Status: ${p.status}
        Description: ${p.description || 'Not provided'}
        Previous Analysis: ${p.analysis || 'None available'}
        `).join('\n')}
        
        Please provide:
        1. A ranked list from most to least suitable partner
        2. Brief justification for each ranking
        3. Key strengths and potential concerns for each
        4. Overall recommendation
      `.trim());

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${googleApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          }),
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Google AI API error:', data);
        throw new Error(data.error?.message || 'Failed to get comparison analysis');
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          analysis: data.candidates[0].content.parts[0].text
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    } else {
      const { partnerId, companyName, website, industry, description, status } = await req.json();
      console.log('Analyzing partner:', { partnerId, companyName });

      // Create Supabase client
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Prepare context for analysis
      const prompt = `
        Please analyze this business partner information and provide a concise analysis:
        Company Name: ${companyName}
        Website: ${website || 'Not provided'}
        Industry: ${industry || 'Not specified'}
        Current Status: ${status}
        Description: ${description || 'Not provided'}
        
        Focus on: 1) Industry presence 2) Growth potential 3) Partnership value
      `.trim();

      console.log('Calling PaLM API with prompt');

      // Call Google's PaLM API with the updated endpoint and model
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${googleApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          }),
        }
      );

      const data = await response.json();
      console.log('PaLM API response status:', response.status);
      
      if (!response.ok) {
        console.error('Google AI API error:', data);
        throw new Error(data.error?.message || 'Failed to get AI analysis');
      }

      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.error('Unexpected API response format:', data);
        throw new Error('Invalid response from AI service');
      }

      const analysis = data.candidates[0].content.parts[0].text;
      console.log('Analysis generated successfully');

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

      console.log('Partner record updated successfully');

      return new Response(
        JSON.stringify({ 
          success: true,
          analysis 
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          status: 200
        }
      );
    }
  } catch (error) {
    console.error('Edge function error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        details: error.toString()
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      }
    );
  }
});
