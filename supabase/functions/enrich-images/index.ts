const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Enriches venues and events that have empty or generic stock images
 * with real images found via Firecrawl search.
 */
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

    const isGenericImage = (url: string) => {
      if (!url) return true;
      // Any unsplash image is considered generic/stock
      if (url.includes('unsplash.com')) return true;
      // Very small thumbnails (e.g. Amazon 90px thumbs)
      if (url.includes('UX90') || url.includes('_QL75_')) return true;
      return false;
    };

    const body = await req.json().catch(() => ({}));
    const batchSize = body.batchSize || 15;
    const tableType = body.table || 'both'; // 'venues', 'events', or 'both'

    const updated: any[] = [];

    // --- Enrich VENUES ---
    if (tableType === 'both' || tableType === 'venues') {
      const { data: venues } = await supabase
        .from('venues')
        .select('id, name, city, type, images')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      const venuesNeedingImages = (venues || []).filter(v => {
        if (!v.images || v.images.length === 0) return true;
        return v.images.every((img: string) => isGenericImage(img));
      }).slice(0, batchSize);

      console.log(`Found ${venuesNeedingImages.length} venues needing images`);

      for (const venue of venuesNeedingImages) {
        try {
          const imageUrl = await findImageForItem(
            `${venue.name} ${venue.city} Germany ${venue.type}`,
            venue.name,
            firecrawlKey,
            lovableApiKey
          );

          if (imageUrl) {
            const { error } = await supabase
              .from('venues')
              .update({ images: [imageUrl] })
              .eq('id', venue.id);

            if (!error) {
              updated.push({ table: 'venues', name: venue.name, image: imageUrl });
              console.log(`✅ Updated venue: ${venue.name}`);
            }
          }
        } catch (e) {
          console.error(`Failed to enrich venue ${venue.name}:`, e);
        }

        // Rate limit
        await sleep(500);
      }
    }

    // --- Enrich EVENTS ---
    if (tableType === 'both' || tableType === 'events') {
      const { data: events } = await supabase
        .from('events')
        .select('id, name, event_type, genre, images')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      const eventsNeedingImages = (events || []).filter(e => {
        if (!e.images || e.images.length === 0) return true;
        return e.images.every((img: string) => isGenericImage(img));
      }).slice(0, batchSize);

      console.log(`Found ${eventsNeedingImages.length} events needing images`);

      for (const event of eventsNeedingImages) {
        try {
          const searchContext = event.event_type === 'movie'
            ? `${event.name} movie poster official`
            : `${event.name} ${event.event_type} event`;

          const imageUrl = await findImageForItem(
            searchContext,
            event.name,
            firecrawlKey,
            lovableApiKey
          );

          if (imageUrl) {
            const { error } = await supabase
              .from('events')
              .update({ images: [imageUrl] })
              .eq('id', event.id);

            if (!error) {
              updated.push({ table: 'events', name: event.name, image: imageUrl });
              console.log(`✅ Updated event: ${event.name}`);
            }
          }
        } catch (e) {
          console.error(`Failed to enrich event ${event.name}:`, e);
        }

        // Rate limit
        await sleep(500);
      }
    }

    console.log(`Enriched ${updated.length} items with real images`);

    return new Response(
      JSON.stringify({ success: true, count: updated.length, updated }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in enrich-images:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Use Firecrawl search + AI to find a high-quality, real image URL for a given item.
 */
async function findImageForItem(
  searchQuery: string,
  itemName: string,
  firecrawlKey: string,
  lovableApiKey: string
): Promise<string | null> {
  // Step 1: Search with Firecrawl for pages about this item
  const searchRes = await fetch('https://api.firecrawl.dev/v1/search', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${firecrawlKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: searchQuery,
      limit: 3,
      scrapeOptions: { formats: ['markdown', 'links'] },
    }),
  });

  const searchText = await searchRes.text();
  let searchData: any;
  try { searchData = JSON.parse(searchText); } catch { return null; }
  if (!searchRes.ok) return null;

  const allContent = (searchData?.data || [])
    .map((r: any) => `URL: ${r.url || ''}\n${r.markdown || r.description || ''}`)
    .join('\n\n')
    .substring(0, 6000);

  if (!allContent) return null;

  // Step 2: Ask AI to extract the best image URL
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
          content: `You find the best high-resolution image URL for a given place, event, or movie. 
Rules:
- Return ONLY a single URL string, nothing else — no JSON, no markdown, no explanation
- The image must be a direct link to a .jpg, .png, .webp, or similar image file
- Prefer images from official sites, Wikipedia, IMDB, TMDB, Google Arts, or major sources
- The image should be high resolution (at least 600px wide)
- For movies: find the official movie poster
- For venues/places: find a photo of the actual place
- For events/DJs/artists: find a photo of the artist or event
- If you find image URLs in the content, prefer those
- If no good image is found in the content, use your knowledge to provide a known image URL from TMDB, Wikipedia Commons, or similar reliable sources
- NEVER return unsplash.com URLs
- NEVER return placeholder or generic images
- If you truly cannot find any image, return the word NULL`
        },
        {
          role: 'user',
          content: `Find the best image URL for: "${itemName}"\n\nSearch results:\n${allContent}`
        }
      ],
      temperature: 0.1,
    }),
  });

  const aiText = await aiRes.text();
  let aiData: any;
  try { aiData = JSON.parse(aiText); } catch { return null; }
  
  const imageUrl = (aiData?.choices?.[0]?.message?.content || '').trim();
  
  // Validate it looks like a real image URL
  if (!imageUrl || imageUrl === 'NULL' || imageUrl.length < 10) return null;
  if (!imageUrl.startsWith('http')) return null;
  if (imageUrl.includes('unsplash.com')) return null;
  
  return imageUrl;
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
