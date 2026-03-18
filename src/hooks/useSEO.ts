import { useEffect } from 'react';

const useSEO = ({ title, description, keywords, ogTitle, ogDescription, ogImage, ogUrl, canonical }) => {
    useEffect(() => {
        document.title = title;
        const metaDescription = document.querySelector('meta[name="description"]');
        const metaKeywords = document.querySelector('meta[name="keywords"]');
        const metaOgTitle = document.querySelector('meta[property="og:title"]');
        const metaOgDescription = document.querySelector('meta[property="og:description"]');
        const metaOgImage = document.querySelector('meta[property="og:image"]');
        const metaOgUrl = document.querySelector('meta[property="og:url"]');
        const linkCanonical = document.querySelector('link[rel="canonical"]');

        if (metaDescription) metaDescription.setAttribute('content', description);
        if (metaKeywords) metaKeywords.setAttribute('content', keywords);
        if (metaOgTitle) metaOgTitle.setAttribute('content', ogTitle);
        if (metaOgDescription) metaOgDescription.setAttribute('content', ogDescription);
        if (metaOgImage) metaOgImage.setAttribute('content', ogImage);
        if (metaOgUrl) metaOgUrl.setAttribute('content', ogUrl);
        if (linkCanonical) linkCanonical.setAttribute('href', canonical);
    }, [title, description, keywords, ogTitle, ogDescription, ogImage, ogUrl, canonical]);

    return null; // This hook does not return any value.
};

export default useSEO;