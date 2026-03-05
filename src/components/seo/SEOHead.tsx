import { useEffect } from "react";

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  type?: string;
  image?: string;
  noindex?: boolean;
}

export default function SEOHead({
  title = "Ausly – Discover Restaurants, Events & Nightlife in Germany",
  description = "Find the best restaurants, bars, clubs, and events in Berlin, Hamburg, München, and more. Plan your perfect night out with Ausly.",
  canonical,
  type = "website",
  image = "https://ausly.lovable.app/lovable-uploads/543a5916-7c50-45ff-aca7-9c29e172bd58.png",
  noindex = false,
}: SEOHeadProps) {
  useEffect(() => {
    document.title = title;

    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    setMeta("description", description);
    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    setMeta("og:type", type, true);
    setMeta("og:image", image, true);
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    setMeta("twitter:image", image);
    setMeta("twitter:card", "summary_large_image");

    if (noindex) {
      setMeta("robots", "noindex, nofollow");
    }

    // Canonical
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    const url = canonical || window.location.origin + window.location.pathname;
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = url;

    // JSON-LD
    let script = document.getElementById("json-ld") as HTMLScriptElement;
    if (!script) {
      script = document.createElement("script");
      script.id = "json-ld";
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Ausly",
      url: "https://ausly.lovable.app",
      description: "Discover restaurants, bars, events, and nightlife across Germany.",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://ausly.lovable.app/discover?search={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    });

    return () => {
      // cleanup canonical and jsonld on unmount handled by next page
    };
  }, [title, description, canonical, type, image, noindex]);

  return null;
}
