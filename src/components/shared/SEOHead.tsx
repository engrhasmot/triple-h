"use client";

import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description?: string;
  ogImage?: string;
}

export default function SEOHead({ title, description, ogImage }: SEOHeadProps) {
  useEffect(() => {
    const siteName = "TRIPLE H PLANDRAFT & ENGINEERING";
    const fullTitle = `${title} | ${siteName}`;

    document.title = fullTitle;

    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (el) {
        el.content = content;
      } else {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        el.content = content;
        document.head.appendChild(el);
      }
    };

    if (description) {
      setMeta("name", "description", description);
      setMeta("property", "og:description", description);
    }

    setMeta("property", "og:title", fullTitle);

    if (ogImage) {
      setMeta("property", "og:image", ogImage);
    }
  }, [title, description, ogImage]);

  return null;
}
