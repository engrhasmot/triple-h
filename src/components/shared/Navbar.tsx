"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, Globe, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useLanguage } from "@/context/LanguageContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const pathname = usePathname();
  const { locale, toggleLocale, t } = useLanguage();

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
    { name: t("nav.home"), href: "/" },
    { name: t("nav.about"), href: "/about" },
    { name: t("nav.services"), href: "/services" },
    { name: t("nav.portfolio"), href: "/portfolio" },
    { name: t("nav.contact"), href: "/contact" },
  ];

  const secondaryLinks = [
    { name: t("nav.clientPortal"), href: "/client-portal" },
    { name: t("nav.costEstimator"), href: "/cost-estimator" },
    { name: t("nav.trackPlan"), href: "/track-plan" },
    { name: t("nav.verify"), href: "/verify" },
    { name: t("nav.bookAppointment"), href: "/book-appointment" },
    { name: t("nav.blog"), href: "/blog" },
    { name: t("nav.faq"), href: "/faq" },
    { name: t("nav.team"), href: "/team" },
  ];

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-background/80 backdrop-blur-md shadow-sm border-b border-border/50" : "bg-transparent py-2"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          
          {/* Logo + Name */}
          <Link href="/" className="flex-shrink-0 group flex items-center gap-2.5">
            <Image
              src="/images/logo.png"
              alt="TRIPLE H PLANDRAFT & ENGINEERING"
              width={140}
              height={140}
              className="h-10 md:h-14 w-auto object-contain group-hover:opacity-80 transition-opacity"
              priority
            />
            <div className="flex flex-col leading-tight">
              <span className="text-base md:text-xl font-black tracking-tight text-accent group-hover:text-accent/80 transition-colors uppercase">
                Triple H
              </span>
              <span className="text-[9px] md:text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
                Plandraft &amp; Engineering
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
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
                {t("nav.more")} <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-1 group-hover:translate-y-0">
                <div className="bg-background border border-border rounded-xl shadow-xl p-2 min-w-[210px] space-y-1">
                  {secondaryLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      prefetch={true}
                      className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        pathname === link.href ? "text-accent bg-secondary" : "text-foreground hover:bg-secondary"
                      }`}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Language Switcher Toggle */}
            <button
              onClick={toggleLocale}
              className="ml-2 px-2.5 py-1 text-xs font-bold rounded-lg border border-border bg-secondary/60 hover:bg-secondary text-foreground transition-all flex items-center gap-1.5 shadow-xs"
              title="Change Language / ভাষা পরিবর্তন"
            >
              <Globe className="w-3.5 h-3.5 text-accent" />
              <span>{locale === "bn" ? "🇧🇩 বাংলা" : "🇬🇧 English"}</span>
            </button>

            <div className="flex items-center gap-2 pl-3 border-l border-border ml-2">
              <Link href="/contact">
                <Button className="font-bold bg-accent hover:bg-accent/90 text-primary-foreground hidden lg:flex">
                  <Phone className="w-4 h-4 mr-2" />
                  01778-506500
                </Button>
              </Link>
            </div>
          </nav>

          {/* Mobile menu button + Lang toggle */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleLocale}
              className="px-2 py-1 text-xs font-bold rounded-md border border-border bg-secondary/70 text-foreground"
            >
              {locale === "bn" ? "🇧🇩 BN" : "🇬🇧 EN"}
            </button>
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
            <div className="flex justify-between items-center px-3 py-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Main</p>
              <button
                onClick={toggleLocale}
                className="text-xs font-bold text-accent flex items-center gap-1"
              >
                <Globe className="w-3.5 h-3.5" />
                {locale === "bn" ? "Switch to English" : "বাংলায় পরিবর্তন করুন"}
              </button>
            </div>

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                prefetch={true}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2.5 rounded-md text-base font-medium ${
                  pathname === link.href 
                    ? "bg-primary/10 text-accent" 
                    : "text-foreground hover:bg-secondary"
                }`}
              >
                {link.name}
              </Link>
            ))}
            <hr className="my-2 border-border" />
            <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Services &amp; Portal</p>
            {secondaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                prefetch={true}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2.5 rounded-md text-base font-medium ${
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
                  <Phone className="w-4 h-4 mr-2" /> {t("nav.callNow")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
