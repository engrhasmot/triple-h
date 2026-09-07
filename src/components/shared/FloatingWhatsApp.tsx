"use client";

import { useState, useRef, useEffect } from "react";
import WhatsAppIcon from "@/components/shared/WhatsAppIcon";
import { SITE_CONFIG } from "@/lib/constants";
import { X, Send, Compass, CreditCard, FileText, PhoneCall, CheckCircle2 } from "lucide-react";

interface QuickAction {
  id: string;
  icon: any;
  labelBn: string;
  labelEn: string;
  message: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "pricing",
    icon: Compass,
    labelBn: "প্ল্যান ড্রাফটিং ও নকশার খরচ",
    labelEn: "Plan Drafting & Design Cost",
    message: "আসসালামু আলাইকুম, আমি আমার বাড়ির আর্কিটেকচারাল ২D/৩D প্ল্যান ও ড্রাফটিংয়ের খরচ সম্পর্কে বিস্তারিত জানতে চাই।",
  },
  {
    id: "site-visit",
    icon: PhoneCall,
    labelBn: "সাইট ভিজিট ও ইঞ্জিনিয়ার কনসালটেন্সি",
    labelEn: "Site Visit & Engineering Advice",
    message: "আসসালামু আলাইকুম, আমি সাইট পরিদর্শন ও কনসালটেন্সির জন্য ইঞ্জিনিয়ার হাসমত আলীর অ্যাপয়েন্টমেন্ট নিতে চাই।",
  },
  {
    id: "payment",
    icon: CreditCard,
    labelBn: "অনলাইনে বিকাশ/নগদে ফি পরিশোধ",
    labelEn: "Online Fee Payment (bKash/Nagad)",
    message: "আসসালামু আলাইকুম, আমি ট্রিপল এইচ কনসালটেন্সির বিকাশ/নগদ (০১৬৩১১৮৬২১৮) পেমেন্ট সংক্রান্ত তথ্য জানতে চাই।",
  },
  {
    id: "tracking",
    icon: FileText,
    labelBn: "প্রজেক্ট ফাইল ও ড্রয়িং স্ট্যাটাস",
    labelEn: "Track Project & Drawing Status",
    message: "আসসালামু আলাইকুম, আমি আমার প্রজেক্ট ফাইলের কাজের অগ্রগতি ও ড্রয়িং অনুমোদনের সর্বশেষ অবস্থা জানতে চাই।",
  },
];

export default function FloatingWhatsApp() {
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);

  const phoneNumber = SITE_CONFIG.whatsapp || "8801778506500";

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const sendWhatsAppMessage = (text: string) => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setIsOpen(false);
    setCustomMsg("");
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMsg.trim()) return;
    sendWhatsAppMessage(customMsg.trim());
  };

  return (
    <div ref={popoverRef} className="fixed z-50 bottom-24 right-4 sm:bottom-28 sm:right-6">
      {/* Popover Card */}
      {isOpen && (
        <div className="mb-3 w-[320px] sm:w-[360px] bg-card text-card-foreground rounded-2xl shadow-2xl border border-border overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-[#075E54] text-white p-4 relative">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center font-bold text-lg border-2 border-white/40">
                  HH
                </div>
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#075E54]"></span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  Engr. Md. Hasmot Ali
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                </h4>
                <p className="text-[11px] text-white/80 leading-tight">Triple H Plandraft &amp; Engineering</p>
                <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                  সক্রিয় আছেন (Online)
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-3.5 space-y-2.5 bg-secondary/20">
            <p className="text-xs font-medium text-muted-foreground">
              কীভাবে সাহায্য করতে পারি? নিচের যেকোনো অপশনে ১-ক্লিক করুন:
            </p>

            {/* Quick Action Buttons */}
            <div className="space-y-2">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => sendWhatsAppMessage(action.message)}
                    className="w-full text-left p-2.5 rounded-xl bg-card hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-border/80 hover:border-[#25D366]/50 transition-all flex items-center gap-3 group shadow-xs cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:bg-[#25D366] group-hover:text-white transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-foreground group-hover:text-[#075E54] dark:group-hover:text-emerald-300 transition-colors">
                        {action.labelBn}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate">{action.labelEn}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Input Form */}
            <form onSubmit={handleCustomSubmit} className="pt-2 border-t border-border flex items-center gap-2">
              <input
                type="text"
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                placeholder="নির্দিষ্ট কিছু জানতে এখানে লিখুন..."
                className="flex-1 px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-[#25D366]"
              />
              <button
                type="submit"
                disabled={!customMsg.trim()}
                className="px-3 py-2 bg-[#25D366] hover:bg-[#1EBE5D] disabled:opacity-50 text-white rounded-lg transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                title="Send"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Footer note */}
          <div className="px-4 py-1.5 bg-muted/40 border-t border-border/50 text-center">
            <span className="text-[10px] text-muted-foreground">
              সাধারণত ৫-১০ মিনিটের মধ্যে রিপ্লাই দেওয়া হয় ⚡
            </span>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 relative group cursor-pointer"
        aria-label="Chat on WhatsApp"
      >
        {isOpen ? (
          <X className="w-6 h-6 animate-in spin-in-180 duration-200" />
        ) : (
          <WhatsAppIcon className="w-7 h-7" />
        )}
        {/* Pulsing indicator */}
        {!isOpen && (
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
          </span>
        )}
        {!isOpen && (
          <span className="absolute right-16 bg-card text-card-foreground text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-border pointer-events-none">
            💬 দ্রুত পরামর্শ নিন (WhatsApp)
          </span>
        )}
      </button>
    </div>
  );
}
