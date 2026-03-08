const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const baseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const scrapers = ['scrape-ra-events', 'scrape-google-movies', 'scrape-google-tours'];
    const results: Record<string, any> = {};

    for (const scraper of scrapers) {
      console.log(`Running ${scraper}...`);
      try {
        const res = await fetch(`${baseUrl}/functions/v1/${scraper}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${anonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });
        results[scraper] = await res.json();
        console.log(`${scraper} completed:`, results[scraper]?.count || 0, 'items');
      } catch (e) {
        console.error(`${scraper} failed:`, e);
        results[scraper] = { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
      }
    }

    return new Response(
      JSON.stringify({ success: true, results, timestamp: new Date().toISOString() }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in scrape-all:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
