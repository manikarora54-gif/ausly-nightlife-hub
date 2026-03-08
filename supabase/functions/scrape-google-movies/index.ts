const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CITIES = ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne', 'Düsseldorf', 'Stuttgart', 'Leipzig'];

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!firecrawlKey) throw new Error('FIRECRAWL_API_KEY not configured');

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) throw new Error('LOVABLE_API_KEY not configured');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const results: any[] = [];

    for (const city of CITIES) {
      console.log(`Scraping movies for ${city}...`);

      // Use Firecrawl search to find current movies
      const searchRes = await fetch('https://api.firecrawl.dev/v1/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${firecrawlKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `movies showing now ${city} Germany cinema`,
          limit: 5,
          scrapeOptions: { formats: ['markdown'] },
        }),
      });

      const searchText = await searchRes.text();
      let searchData: any;
      try {
        searchData = JSON.parse(searchText);
      } catch {
        console.error(`Non-JSON response for ${city}:`, searchText.substring(0, 200));
        continue;
      }
      
      if (!searchRes.ok) {
        console.error(`Failed to search movies for ${city}:`, searchData);
        continue;
      }

      const allContent = (searchData?.data || [])
        .map((r: any) => r.markdown || r.description || '')
        .join('\n\n')
        .substring(0, 8000);

      if (!allContent) continue;

      // Parse with AI
      const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'system',
              content: `Extract currently showing movies from search results. Return JSON array with: name (string), description (string, 1-2 sentences), genre (string), rating (number 1-10 or null), image_url (string or null). Only real movies currently in theaters. Return ONLY valid JSON array.`
            },
            {
              role: 'user',
              content: `Extract movies currently showing in ${city}, Germany from:\n\n${allContent}`
            }
          ],
          temperature: 0.1,
        }),
      });

      const aiText = await aiRes.text();
      let aiData: any;
      try { aiData = JSON.parse(aiText); } catch { console.error('AI non-JSON:', aiText.substring(0, 200)); continue; }
      const aiContent = aiData?.choices?.[0]?.message?.content || '[]';

      let movies: any[] = [];
      try {
        const cleaned = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        movies = JSON.parse(cleaned);
      } catch (e) {
        console.error(`Failed to parse movies for ${city}:`, e);
        continue;
      }

      for (const movie of movies) {
        if (!movie.name) continue;

        const slug = slugify(`${movie.name}-movie`);

        const { error } = await supabase.from('events').upsert({
          name: movie.name,
          slug,
          description: movie.description || movie.name,
          short_description: movie.description?.substring(0, 150) || null,
          event_type: 'movie',
          start_date: new Date().toISOString(),
          is_active: true,
          images: movie.image_url ? [movie.image_url] : [],
          source: 'google_movies',
          source_url: `https://www.google.com/search?q=${encodeURIComponent(movie.name + ' movie ' + city)}`,
        }, { onConflict: 'slug' });

        if (error) {
          console.error(`Failed to upsert movie ${movie.name}:`, error);
        } else {
          results.push({ name: movie.name, city });
        }
      }
    }

    console.log(`Scraped ${results.length} movies total`);

    return new Response(
      JSON.stringify({ success: true, count: results.length, movies: results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in movies scraper:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
