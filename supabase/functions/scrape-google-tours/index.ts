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

      // Search for tours and experiences — request links for image discovery
      const searchRes = await fetch('https://api.firecrawl.dev/v1/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${firecrawlKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `best tours experiences activities things to do ${city} Germany 2026`,
          limit: 8,
          scrapeOptions: { formats: ['markdown', 'links'] },
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
        .substring(0, 10000);

      if (!allContent) continue;

      // Parse with AI — enhanced for mandatory images, full descriptions, and addresses
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
              content: `Extract tours, experiences, and activities from search results. Return JSON array with these fields:
- name (string, required)
- description (string, required, 3-5 sentences) — a rich, detailed description of the tour/experience. NEVER leave empty or use just the name. Include what visitors will see/do, highlights, and what makes it special.
- address (string, required) — full street address if available. If exact address not found, use a known landmark address or "City Center, [City]". NEVER leave empty.
- type (one of: tour, museum, experience, food_tour, walking_tour, boat_tour, attraction)
- price_estimate (number in EUR or null)
- website (string url or null)
- image_url (string, MANDATORY) — a high-resolution photo URL of the place/tour. Look for image URLs in the content. If not found, use a well-known stock image URL or a Google Maps/Places photo URL. Try to find real images. NEVER return null.

Return ONLY valid JSON array.`
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
          images: tour.image_url ? [tour.image_url] : [],
          is_active: true,
          source: 'google_tours',
          source_url: `https://www.google.com/search?q=${encodeURIComponent(tour.name + ' ' + city)}`,
        }, { onConflict: 'slug' });

        if (error) {
          console.error(`Failed to upsert tour ${tour.name}:`, error);
        } else {
          results.push({ name: tour.name, city, hasImage: !!tour.image_url });
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
