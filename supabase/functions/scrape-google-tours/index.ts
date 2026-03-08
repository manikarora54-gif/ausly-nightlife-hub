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
      console.log(`Scraping tours for ${city}...`);

      // Search for tours and experiences
      const searchRes = await fetch('https://api.firecrawl.dev/v1/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${firecrawlKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `best tours experiences activities things to do ${city} Germany 2026`,
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
        console.error(`Failed to search tours for ${city}:`, searchData);
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
              content: `Extract tours, experiences, and activities from search results. Return JSON array with: name (string), description (string, 2-3 sentences), address (string or "City Center"), type (one of: tour, museum, experience, food_tour, walking_tour, boat_tour, attraction), price_estimate (number in EUR or null), website (string url or null). Return ONLY valid JSON array.`
            },
            {
              role: 'user',
              content: `Extract tours and experiences in ${city}, Germany from:\n\n${allContent}`
            }
          ],
          temperature: 0.1,
        }),
      });

      const aiText = await aiRes.text();
      let aiData: any;
      try { aiData = JSON.parse(aiText); } catch { console.error('AI non-JSON:', aiText.substring(0, 200)); continue; }
      const aiContent = aiData?.choices?.[0]?.message?.content || '[]';

      let tours: any[] = [];
      try {
        const cleaned = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        tours = JSON.parse(cleaned);
      } catch (e) {
        console.error(`Failed to parse tours for ${city}:`, e);
        continue;
      }

      for (const tour of tours) {
        if (!tour.name) continue;

        const slug = slugify(`${tour.name}-${city}`);

        const { error } = await supabase.from('venues').upsert({
          name: tour.name,
          slug,
          description: tour.description || tour.name,
          short_description: tour.description?.substring(0, 150) || null,
          type: tour.type || 'experience',
          address: tour.address || `${city} City Center`,
          city,
          website: tour.website || null,
          is_active: true,
          source: 'google_tours',
          source_url: `https://www.google.com/search?q=${encodeURIComponent(tour.name + ' ' + city)}`,
        }, { onConflict: 'slug' });

        if (error) {
          console.error(`Failed to upsert tour ${tour.name}:`, error);
        } else {
          results.push({ name: tour.name, city });
        }
      }
    }

    console.log(`Scraped ${results.length} tours total`);

    return new Response(
      JSON.stringify({ success: true, count: results.length, tours: results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in tours scraper:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
