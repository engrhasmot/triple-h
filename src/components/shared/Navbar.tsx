"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isDesktop) setIsOpen(false);
  }, [isDesktop]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Portfolio", href: "/portfolio" },
    { name: "Contact", href: "/contact" },
  ];

  const secondaryLinks = [
    { name: "Cost Estimator", href: "/cost-estimator" },
    { name: "Track Plan", href: "/track-plan" },
    { name: "Book Appointment", href: "/book-appointment" },
    { name: "Blog", href: "/blog" },
    { name: "FAQ", href: "/faq" },
    { name: "Our Team", href: "/team" },
  ];

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-background/80 backdrop-blur-md shadow-sm border-b border-border/50" : "bg-transparent py-2"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 group">
            <Image
              src="/images/logo.png"
              alt="TRIPLE H PLANDRAFT & ENGINEERING"
              width={140}
              height={140}
              className="h-10 md:h-14 w-auto object-contain group-hover:opacity-80 transition-opacity"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                prefetch={true}
                className={`px-3 py-2 text-sm font-semibold transition-colors hover:text-accent rounded-md hover:bg-secondary ${
                  pathname === link.href ? "text-accent" : "text-foreground"
                }`}
              >
                {link.name}
              </Link>
            ))}

            {/* More dropdown */}
            <div className="relative group">
              <button className="px-3 py-2 text-sm font-semibold text-foreground hover:text-accent rounded-md hover:bg-secondary transition-colors flex items-center gap-1">
                More <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-1 group-hover:translate-y-0">
                <div className="bg-background border border-border rounded-xl shadow-xl p-2 min-w-[200px] space-y-1">
                  {secondaryLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      prefetch={true}
                      className={`block px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                        pathname === link.href ? "text-accent bg-secondary" : "text-foreground hover:bg-secondary"
                      }`}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pl-4 border-l border-border ml-2">
              <Link href="/contact">
                <Button className="font-bold bg-accent hover:bg-accent/90 text-primary-foreground hidden lg:flex">
                  <Phone className="w-4 h-4 mr-2" />
                  01778-506500
                </Button>
              </Link>
            </div>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground p-2 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Menu */}
      {isOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-md border-b border-border absolute w-full animate-in slide-in-from-top-2">
          <div className="px-4 pt-2 pb-6 space-y-1 shadow-lg">
            <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Main</p>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                prefetch={true}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-3 rounded-md text-base font-medium ${
                  pathname === link.href 
                    ? "bg-primary/10 text-accent" 
                    : "text-foreground hover:bg-secondary"
                }`}
              >
                {link.name}
              </Link>
            ))}
            <hr className="my-2 border-border" />
            <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">More</p>
            {secondaryLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                prefetch={true}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-3 rounded-md text-base font-medium ${
                  pathname === link.href 
                    ? "bg-primary/10 text-accent" 
                    : "text-foreground hover:bg-secondary"
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4">
              <Link href="/contact" onClick={() => setIsOpen(false)}>
                <Button className="w-full bg-accent hover:bg-accent/90 text-primary-foreground">
                  <Phone className="w-4 h-4 mr-2" /> Call Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
