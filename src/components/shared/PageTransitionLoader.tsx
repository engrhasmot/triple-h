"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function PageTransitionLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // When pathname or search parameters change, it means the navigation is complete
    setLoading(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleStart = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      
      if (!anchor) return;
      
      const href = anchor.getAttribute("href");
      // Skip for anchor links on same page, external links, or new tabs
      if (
        !href || 
        href.startsWith("#") || 
        href.startsWith("http") || 
        href.startsWith("tel:") ||
        href.startsWith("mailto:") ||
        anchor.target === "_blank" ||
        href === pathname
      ) {
        return;
      }
      
      // Starting navigation to another local route
      setLoading(true);
    };

    document.addEventListener("click", handleStart);
    
    return () => {
      document.removeEventListener("click", handleStart);
    };
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-[100]">
      <div className="h-full bg-accent shadow-[0_0_10px_#d4a017] origin-left animate-loading-bar" />
    </div>
  );
}
