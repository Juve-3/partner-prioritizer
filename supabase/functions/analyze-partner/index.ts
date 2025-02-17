
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.2.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { partnerId, companyName, website, industry, description, status } = await req.json()

    // Initialize OpenAI
    const openAIConfig = new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    })
    const openai = new OpenAIApi(openAIConfig)

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Prepare context for analysis
    const context = `
      Company Name: ${companyName}
      Website: ${website || 'Not provided'}
      Industry: ${industry || 'Not specified'}
      Current Status: ${status}
      Description: ${description || 'Not provided'}
    `

    // Get AI analysis
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a business analyst. Analyze the following partner information and provide insights about their potential value as a partner. Focus on their industry presence, growth potential, and alignment with business goals."
        },
        {
          role: "user",
          content: context
        }
      ]
    })

    const analysis = completion.data.choices[0].message?.content

    // Update the partner record with the analysis
    const { error: updateError } = await supabaseClient
      .from('partners')
      .update({
        ai_analysis: { analysis },
        last_analysis_date: new Date().toISOString()
      })
      .eq('id', partnerId)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({ 
        success: true,
        analysis 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
