import { useEffect } from "react";

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  /** Open Graph type: website, article, place, event, profile, product */
  type?: string;
  image?: string;
  imageAlt?: string;
  noindex?: boolean;
  keywords?: string;
  /** ISO 639-1 language code, e.g. "en", "de" */
  lang?: string;
  /** og:locale, e.g. en_US, de_DE */
  locale?: string;
  /** Optional JSON-LD object(s) injected as application/ld+json. Replaces page-level schema. */
  jsonLd?: Record<string, any> | Record<string, any>[];
  /** Optional breadcrumb trail [{name, url}] auto-converted to BreadcrumbList JSON-LD */
  breadcrumbs?: Array<{ name: string; url: string }>;
}

const SITE_ORIGIN = "https://ausly.lovable.app";

export default function SEOHead({
  title = "Ausly – Discover Restaurants, Bars, Clubs & Events in Germany",
  description = "Discover the best restaurants, bars, clubs, events and nightlife across Germany's top cities. Curated for expats and locals.",
  canonical,
  type = "website",
  image = `${SITE_ORIGIN}/og-image.png`,
  imageAlt = "Ausly — Deine Stadt, dein Abend",
  noindex = false,
  keywords,
  lang = "en",
  locale = "en_US",
  jsonLd,
  breadcrumbs,
}: SEOHeadProps) {
  useEffect(() => {
    // Title (clamp to ~60 chars for SERP)
    const finalTitle = title.length > 65 ? title.slice(0, 62).trimEnd() + "…" : title;
    document.title = finalTitle;

    // <html lang>
    document.documentElement.lang = lang;

    const url = canonical || window.location.origin + window.location.pathname + window.location.search;

    const setMeta = (name: string, content: string, isProperty = false) => {
      if (!content) return;
      const attr = isProperty ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    // Description (clamp to 160)
    const finalDesc = description.length > 160 ? description.slice(0, 157).trimEnd() + "…" : description;

    setMeta("description", finalDesc);
    if (keywords) setMeta("keywords", keywords);
    setMeta("robots", noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1");

    // Open Graph
    setMeta("og:title", finalTitle, true);
    setMeta("og:description", finalDesc, true);
    setMeta("og:type", type, true);
    setMeta("og:image", image, true);
    setMeta("og:image:alt", imageAlt, true);
    setMeta("og:url", url, true);
    setMeta("og:site_name", "Ausly", true);
    setMeta("og:locale", locale, true);

    // Twitter
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", finalTitle);
    setMeta("twitter:description", finalDesc);
    setMeta("twitter:image", image);
    setMeta("twitter:image:alt", imageAlt);
    setMeta("twitter:site", "@Ausly");

    // Canonical
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = url;

    // Page-level JSON-LD (separate id from baseline org/website schema in index.html)
    const PAGE_LD_ID = "json-ld-page";
    let script = document.getElementById(PAGE_LD_ID) as HTMLScriptElement | null;

    const blocks: Record<string, any>[] = [];
    if (jsonLd) {
      blocks.push(...(Array.isArray(jsonLd) ? jsonLd : [jsonLd]));
    }
    if (breadcrumbs && breadcrumbs.length > 0) {
      blocks.push({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((b, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: b.name,
          item: b.url.startsWith("http") ? b.url : `${SITE_ORIGIN}${b.url}`,
        })),
      });
    }

    if (blocks.length > 0) {
      if (!script) {
        script = document.createElement("script");
        script.id = PAGE_LD_ID;
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(blocks.length === 1 ? blocks[0] : blocks);
    } else if (script) {
      script.remove();
    }
  }, [title, description, canonical, type, image, imageAlt, noindex, keywords, lang, locale, jsonLd, breadcrumbs]);

  return null;
}
