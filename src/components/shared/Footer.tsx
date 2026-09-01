"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground pt-16 pb-8 border-t border-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex flex-col">
              <Image
                src="/images/logo.png"
                alt="TRIPLE H PLANDRAFT & ENGINEERING"
                width={160}
                height={160}
                className="h-14 md:h-16 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-primary-foreground/80 leading-relaxed mt-4">
              পরিকল্পিত নকশা, নিরাপদ নির্মাণ। We provide state-of-the-art civil engineering, architectural drafting, and site supervision services across Bangladesh.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 font-heading text-accent">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { label: 'Home', href: '/' },
                { label: 'About', href: '/about' },
                { label: 'Services', href: '/services' },
                { label: 'Portfolio', href: '/portfolio' },
                { label: 'Cost Estimator', href: '/cost-estimator' },
                { label: 'Track Plan', href: '/track-plan' },
                { label: 'Book Appointment', href: '/book-appointment' },
                { label: 'Blog', href: '/blog' },
                { label: 'FAQ', href: '/faq' },
                { label: 'Our Team', href: '/team' },
                { label: 'Contact', href: '/contact' },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} prefetch={true} className="text-sm text-primary-foreground/80 hover:text-accent transition-colors flex items-center group">
                    <ArrowRight className="w-4 h-4 mr-2 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all text-accent" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-bold mb-6 font-heading text-accent">Our Services</h3>
            <ul className="space-y-3">
              {[
                { label: '2D Architectural Plan', hash: '#2d-plan' },
                { label: '3D Exterior & Interior', hash: '#3d-design' },
                { label: 'Structural Design', hash: '#2d-plan' },
                { label: 'BOQ Estimation', hash: '#boq' },
                { label: 'Municipal Plan Passing', hash: '#plan-passing' },
                { label: 'Site Supervision', hash: '#supervision' },
              ].map((service) => (
                <li key={service.label}>
                  <Link href={`/services${service.hash}`} prefetch={true} className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
                    {service.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-6 font-heading text-accent">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 text-accent mr-3 mt-0.5 shrink-0" />
                <span className="text-sm text-primary-foreground/80">
                  Aysha Monjil, House 14/05, Ward No 1<br />Noyabari, Savar Radio Colony, Dhaka
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 text-accent mr-3 shrink-0" />
                <div className="flex flex-col">
                  <a href="tel:+8801631186218" className="text-sm text-primary-foreground/80 hover:text-white transition-colors">+880 1631-186218</a>
                  <a href="tel:+8801778506500" className="text-sm text-primary-foreground/80 hover:text-white transition-colors">+880 1778-506500</a>
                </div>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 text-accent mr-3 shrink-0" />
                <a href="mailto:info@tripleh.com.bd" className="text-sm text-primary-foreground/80 hover:text-white transition-colors">info@tripleh.com.bd</a>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-primary-foreground/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-primary-foreground/60 text-center md:text-left">
            &copy; {currentYear} TRIPLE H Plandraft &amp; Engineering. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
