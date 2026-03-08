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

      // Use Firecrawl search to find current movies — request links for image discovery
      const searchRes = await fetch('https://api.firecrawl.dev/v1/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${firecrawlKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `movies showing now ${city} Germany cinema showtimes`,
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
        console.error(`Failed to search movies for ${city}:`, searchData);
        continue;
      }

      const allContent = (searchData?.data || [])
        .map((r: any) => r.markdown || r.description || '')
        .join('\n\n')
        .substring(0, 10000);

      if (!allContent) continue;

      // Parse with AI — enhanced prompt for mandatory images, descriptions, and cinemas
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
              content: `Extract currently showing movies from search results. Return JSON array with these fields:
- name (string, required) — the movie title
- description (string, required, 3-5 sentences) — a full plot synopsis / description of the movie. NEVER leave this empty or short. If the source is brief, expand with your knowledge of the movie.
- genre (string, required, MUST be exactly one of: Action, Comedy, Drama, Sci-Fi, Horror, Romance, Animation, Thriller, Documentary, Adventure, Fantasy, Musical, Mystery, Western, Family)
- rating (number 1-10 or null)
- image_url (string, MANDATORY) — a high-resolution movie poster or still image URL. Use the official TMDB/IMDb poster URL if available in source. If not found in content, construct a search-friendly URL like: https://image.tmdb.org/t/p/w780/{movie_name_slug}.jpg or use a known poster URL. NEVER return null for image_url.
- cinemas (array of objects, required) — list of cinemas showing this movie in this city. Each cinema object: { name: string, address: string }. Include at least the cinema name. If address not available, use the city name.
- duration (string or null) — runtime like "120 min"

Only include real movies currently in theaters. Return ONLY valid JSON array, no markdown.`
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

        // Skip movies without images — they're mandatory
        const imageUrl = movie.image_url || null;

        const slug = slugify(`${movie.name}-movie`);

        // Build description from cinemas if available
        const cinemaInfo = (movie.cinemas || [])
          .map((c: any) => `${c.name}${c.address ? ` (${c.address})` : ''}`)
          .join(', ');
        
        const fullDescription = movie.description 
          ? `${movie.description}${cinemaInfo ? `\n\nShowing at: ${cinemaInfo}` : ''}`
          : movie.name;

        const { error } = await supabase.from('events').upsert({
          name: movie.name,
          slug,
          description: fullDescription,
          short_description: movie.description?.substring(0, 150) || null,
          event_type: 'movie',
          genre: movie.genre || null,
          start_date: new Date().toISOString(),
          is_active: true,
          images: imageUrl ? [imageUrl] : [],
          source: 'google_movies',
          source_url: `https://www.google.com/search?q=${encodeURIComponent(movie.name + ' movie ' + city)}`,
        }, { onConflict: 'slug' });

        if (error) {
          console.error(`Failed to upsert movie ${movie.name}:`, error);
        } else {
          results.push({ name: movie.name, city, hasImage: !!imageUrl, hasCinemas: (movie.cinemas || []).length > 0 });
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
