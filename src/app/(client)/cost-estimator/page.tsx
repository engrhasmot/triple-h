"use client";

import { motion } from "framer-motion";
import { CheckCircle2, BarChart3, Headset, ShieldCheck } from "lucide-react";
import WhatsAppIcon from "@/components/shared/WhatsAppIcon";
import dynamic from "next/dynamic";

const CostEstimator = dynamic(() => import("@/components/estimator/CostEstimator"), {
  loading: () => (
    <div className="flex justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  ),
});

const trustBadges = [
  { icon: BarChart3, label: "100% Accuracy Range" },
  { icon: Headset, label: "Free Technical Guidance" },
  { icon: ShieldCheck, label: "Instant Estimate" },
];

export default function CostEstimatorPage() {
  return (
    <div className="w-full">
      {/* Hero */}
      <section className="bg-primary pt-32 pb-20 text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-bold font-heading text-primary-foreground mb-6 leading-tight"
          >
            Online Building Construction Cost Calculator
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-base md:text-xl text-primary-foreground/80 max-w-3xl mx-auto"
          >
            Enter your land area and number of floors to get an instant estimated construction cost and budget breakdown in seconds.
          </motion.p>
          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="flex flex-wrap justify-center gap-4 mt-8"
          >
            {trustBadges.map((badge, i) => (
              <div key={i} className="flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm px-4 py-2 rounded-full border border-primary-foreground/20">
                <badge.icon className="w-4 h-4 text-accent" />
                <span className="text-xs md:text-sm font-semibold text-primary-foreground">{badge.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold font-heading mb-4">
              Enter Your Project Details
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Fill in the form below and get a detailed estimated cost breakdown for your project in seconds.
            </p>
          </div>
          <CostEstimator />
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-muted/30 border-t border-border">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold font-heading">
            Ready to Start Building Your Dream Project?
          </h2>
          <p className="text-muted-foreground">
            Our engineers are ready for a free site visit and consultation. Contact us today.
          </p>
          <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "8801778506500"}?text=${encodeURIComponent("Hello TRIPLE H Engineering, I need a construction cost estimate and consultation for my project.")}`}
            target="_blank" rel="noopener noreferrer">
            <button className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold px-8 py-4 rounded-xl text-lg transition-all hover:shadow-lg hover:scale-105">
              <WhatsAppIcon className="w-6 h-6" />
              Talk to an Engineer on WhatsApp
            </button>
          </a>
        </div>
      </section>
    </div>
  );
}
