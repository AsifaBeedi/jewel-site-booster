import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrackEventRequest {
  type: 'page_visit' | 'click';
  data: {
    page_path: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
    referrer?: string;
    button_id?: string;
    button_text?: string;
    session_id?: string;
  };
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { type, data }: TrackEventRequest = await req.json();
    const userAgent = req.headers.get('user-agent') || '';

    console.log('Tracking event:', { type, data });

    if (type === 'page_visit') {
      const { error } = await supabaseClient
        .from('page_visits')
        .insert({
          page_path: data.page_path,
          utm_source: data.utm_source,
          utm_medium: data.utm_medium,
          utm_campaign: data.utm_campaign,
          utm_term: data.utm_term,
          utm_content: data.utm_content,
          referrer: data.referrer,
          user_agent: userAgent,
          session_id: data.session_id,
        });

      if (error) {
        console.error('Error tracking page visit:', error);
        throw error;
      }

      console.log('Page visit tracked successfully');
    } else if (type === 'click') {
      const { error } = await supabaseClient
        .from('click_events')
        .insert({
          button_id: data.button_id,
          button_text: data.button_text,
          page_path: data.page_path,
          utm_source: data.utm_source,
          utm_medium: data.utm_medium,
          utm_campaign: data.utm_campaign,
          session_id: data.session_id,
          user_agent: userAgent,
        });

      if (error) {
        console.error('Error tracking click event:', error);
        throw error;
      }

      console.log('Click event tracked successfully');
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in track-event function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
