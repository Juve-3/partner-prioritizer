
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to clean and format the analysis text
const formatAnalysisText = (text: string) => {
  // Remove asterisks used for bold formatting
  let cleanText = text.replace(/\*\*/g, '');
  
  // Split into paragraphs and clean up
  const paragraphs = cleanText
    .split('\n')
    .map(p => p.trim())
    .filter(p => p.length > 0);
  
  // Join paragraphs with proper spacing
  return paragraphs.join('\n\n');
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
      console.log('Business context:', body.businessContext);

      // Build a more detailed prompt that includes business context
      const businessContext = body.businessContext || {};
      const prompt = `
        Please analyze and compare these potential business partners, ranking them from most suitable to least suitable for partnership with my business. Consider their industry presence, growth potential, and overall partnership value.
        
        My business context:
        ${businessContext.name ? `Business Name: ${businessContext.name}` : ''}
        ${businessContext.field ? `Business Field: ${businessContext.field}` : ''}
        ${businessContext.description ? `Business Description: ${businessContext.description}` : ''}
        
        Comparison criteria focus: ${body.criteria || 'balanced'}
        
        Partners to compare:
        ${body.partners.map((p: any) => `
        Company: ${p.companyName}
        Industry: ${p.industry || 'Not specified'}
        Status: ${p.status}
        Description: ${p.description || 'Not provided'}
        Previous Analysis: ${p.analysis || 'None available'}
        `).join('\n')}
        
        Please provide:
        1. A ranked list from most to least suitable partner specifically for my business
        2. Brief justification for each ranking, focusing on compatibility with my business
        3. Key strengths, potential concerns, and strategic fit for each partner in relation to my business
        4. Overall recommendation for which partner would be most beneficial to establish or strengthen a relationship with
        
        Format the response in clear paragraphs with proper spacing. Do not use any special formatting characters.
      `;

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
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            }
          }),
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Google AI API error:', data);
        throw new Error(data.error?.message || 'Failed to get comparison analysis');
      }

      const rawAnalysis = data.candidates[0].content.parts[0].text;
      const formattedAnalysis = formatAnalysisText(rawAnalysis);

      return new Response(
        JSON.stringify({ 
          success: true,
          analysis: formattedAnalysis
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    } else {
      const { partnerId, companyName, website, industry, description, status } = body;
      console.log('Analyzing partner:', { partnerId, companyName });

      const prompt = `
        Analyze this business partner and provide a clear, professional assessment:
        
        Company Name: ${companyName}
        Website: ${website || 'Not provided'}
        Industry: ${industry || 'Not specified'}
        Current Status: ${status}
        Description: ${description || 'Not provided'}
        
        Please provide a comprehensive analysis covering:
        1. Industry presence and market position
        2. Growth potential and opportunities
        3. Partnership value and strategic fit
        
        Format the response in clear paragraphs with proper spacing. Focus on being concise and insightful.
        Do not use any special formatting characters or symbols.
      `;

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
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            }
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Gemini API error response:', errorData);
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Gemini API Response:', JSON.stringify(data, null, 2));

      const rawAnalysis = data.candidates[0].content.parts[0].text;
      const formattedAnalysis = formatAnalysisText(rawAnalysis);

      // Create Supabase client
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Update the partner record with the analysis
      const { error: updateError } = await supabaseClient
        .from('partners')
        .update({
          ai_analysis: { analysis: formattedAnalysis },
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
          analysis: formattedAnalysis 
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
