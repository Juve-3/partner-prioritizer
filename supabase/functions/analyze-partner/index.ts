
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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const openAiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Request received:', JSON.stringify(body, null, 2));

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

      console.log('Sending prompt to OpenAI API:', prompt);

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      console.log('OpenAI API status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('OpenAI API error response:', errorData);
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('OpenAI API response structure:', Object.keys(data));
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('Unexpected OpenAI API response structure:', JSON.stringify(data, null, 2));
        throw new Error('Invalid response format from OpenAI API');
      }

      const rawAnalysis = data.choices[0].message.content;
      const formattedAnalysis = formatAnalysisText(rawAnalysis);

      console.log('Analysis generated successfully');

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

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('OpenAI API error response:', errorData);
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('OpenAI API Response:', JSON.stringify(data, null, 2));

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('Unexpected OpenAI API response structure:', JSON.stringify(data, null, 2));
        throw new Error('Invalid response format from OpenAI API');
      }

      const rawAnalysis = data.choices[0].message.content;
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
