"use client";

import WhatsAppIcon from "@/components/shared/WhatsAppIcon";
import { SITE_CONFIG } from "@/lib/constants";

export default function FloatingWhatsApp() {
  const phoneNumber = SITE_CONFIG.whatsapp;
  const message = "Hello TRIPLE H Engineering, I have an inquiry about a project.";
  
  const waLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-[5.5rem] right-6 z-50 flex items-center justify-center w-12 h-12 bg-[#25D366] text-white rounded-full shadow-lg hover:shadow-2xl hover:scale-110 hover:-translate-y-1 transition-all duration-300 animate-in fade-in slide-in-from-bottom-10 group"
      aria-label="Chat on WhatsApp"
    >
      <WhatsAppIcon className="w-6 h-6" />
      <span className="absolute right-16 bg-card text-card-foreground text-xs font-semibold px-3 py-1.5 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-border">
        Chat with an Engineer
      </span>
      {/* Pulsing ring effect */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20 -z-10"></span>
    </a>
  );
}
