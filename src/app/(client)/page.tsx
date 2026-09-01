"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Calculator, ShieldCheck, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, Suspense } from "react";
import { SITE_CONFIG } from "@/lib/constants";
import SEOHead from "@/components/shared/SEOHead";
import dynamic from "next/dynamic";

const TestimonialCarousel = dynamic(() => import("@/components/testimonials/TestimonialCarousel"), {
  loading: () => (
    <div className="flex justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  ),
});

function AnimatedCounter({ value, suffix = "" }: { value: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);
  const target = parseInt(value.replace(/[^0-9]/g, ""), 10) || 0;
  const isText = isNaN(parseInt(value, 10));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || isText) return;
    let start = 0;
    const duration = 1500;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, isText]);

  if (isText) return <>{value}</>;
  return <span ref={ref}>{count}{suffix}</span>;
}

export default function HomePage() {
  const router = useRouter();
  const [trackQuery, setTrackQuery] = useState("");

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackQuery.trim()) {
      router.push(`/track-plan?query=${encodeURIComponent(trackQuery)}`);
    }
  };

  const services = [
    { title: "2D Architectural & Structural Plan", icon: "📐", desc: "Precision AutoCAD drafting ensuring optimal space utilization and structural integrity." },
    { title: "3D Exterior & Interior Renderings", icon: "🏛️", desc: "Photorealistic Revit/SketchUp models bringing your vision to life before construction." },
    { title: "BOQ Construction Cost Estimation", icon: "📊", desc: "Accurate Bill of Quantities so you can plan your budget without hidden surprises." },
    { title: "Municipal Plan Passing Approvals", icon: "📝", desc: "Hassle-free Rajuk, Paurashava, and Union Parishad approvals." },
    { title: "On-site Technical Supervision", icon: "👷", desc: "Expert engineers overseeing every concrete pour and rod binding." },
  ];

  return (
    <main className="flex flex-col w-full">
      <SEOHead
        title="TRIPLE H PLANDRAFT & ENGINEERING"
        description="2D/3D Plan Drafting, Architectural Design, Rajuk Approval & Engineering Services in Bangladesh. Free cost estimator & plan tracking."
      />
      {/* --- HERO SECTION --- */}
      <section className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden bg-primary">
        {/* Blueprint Grid Background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-12 md:mt-0">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-extrabold text-primary-foreground font-heading tracking-tight mb-4 bengali-text"
          >
            পরিকল্পিত নকশা, <span className="text-accent">নিরাপদ নির্মাণ</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-2xl text-primary-foreground/80 mb-10 max-w-3xl mx-auto"
          >
            Expert 2D/3D Design, BOQ Estimation, Plan Passing Files, & Comprehensive Site Supervision in Bangladesh.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/cost-estimator" prefetch={true}>
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-primary-foreground font-bold h-14 px-8 text-lg w-full sm:w-auto shadow-lg shadow-accent/20 transition-transform hover:-translate-y-1">
                <Calculator className="mr-2 h-5 w-5" /> Calculate Cost
              </Button>
            </Link>
            <Link href="/portfolio" prefetch={true}>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold border-2 border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground hover:text-primary w-full sm:w-auto transition-transform hover:-translate-y-1 bg-transparent">
                <ArrowRight className="mr-2 h-5 w-5" /> View Portfolio
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Diagonal cut at bottom */}
        <div className="absolute bottom-0 w-full h-16 bg-background" style={{ clipPath: 'polygon(0 100%, 100% 0, 100% 100%)' }}></div>
      </section>

      {/* --- STAT METRICS SECTION --- */}
      <section className="py-12 bg-background relative z-20 -mt-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-panel rounded-2xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center shadow-xl">
              {[
                { num: "100+", label: "Approved Plans", animNum: "100", suffix: "+" },
                { num: "50+", label: "3D Elevations", animNum: "50", suffix: "+" },
                { num: "100%", label: "Satisfaction", animNum: "100", suffix: "%" },
                { num: "Expert", label: "Engineering Team", animNum: "Expert", suffix: "" }
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="space-y-2"
                >
                  <h3 className="text-4xl font-extrabold text-accent">
                    <AnimatedCounter value={stat.animNum} suffix={stat.suffix} />
                  </h3>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">{stat.label}</p>
                </motion.div>
              ))}
          </div>
        </div>
      </section>

      {/* --- SERVICES GRID --- */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">Engineering Excellence</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Comprehensive solutions from drafting the first line to pouring the final concrete.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((svc, i) => (
              <Link href="/services" key={i} prefetch={true}>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="h-full glass-panel p-8 rounded-2xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group cursor-pointer"
                >
                  <div className="text-5xl mb-6 group-hover:scale-110 transition-transform origin-left">{svc.icon}</div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-accent transition-colors">{svc.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{svc.desc}</p>
                </motion.div>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/services" prefetch={true}>
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold px-8">
                Explore All Services <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* --- TRACK PLAN BANNER --- */}
      <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2000')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          <ShieldCheck className="w-16 h-16 text-accent mx-auto" />
          <h2 className="text-3xl md:text-5xl font-heading font-bold">Track Your Plan Passing File Instantly</h2>
          <p className="text-primary-foreground/80 text-lg">
            No more calling the municipality. Enter your File ID to see exactly where your approval is stuck.
          </p>
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4 justify-center max-w-xl mx-auto pt-4">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Enter File ID (e.g. TH-2026-001)" 
                className="w-full h-14 pl-12 pr-4 rounded-lg bg-background text-foreground focus:ring-2 focus:ring-accent outline-none"
                value={trackQuery}
                onChange={(e) => setTrackQuery(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="h-14 px-8 bg-accent hover:bg-accent/90 text-primary-foreground font-bold text-lg">
              Track Now
            </Button>
          </form>
        </div>
      </section>

      {/* --- TESTIMONIALS --- */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">What Our Clients Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Hear from the homeowners and businesses who trusted us with their construction journey.
            </p>
          </div>
          <TestimonialCarousel />
        </div>
      </section>

      {/* --- CTA BANNER --- */}
      <section className="py-24 bg-background text-center">
        <div className="max-w-3xl mx-auto px-4 space-y-8">
          <h2 className="text-4xl md:text-5xl font-heading font-bold bengali-text">
            প্রস্তুত আপনার স্বপ্নের বাড়ি নির্মাণ শুরু করতে?
          </h2>
          <p className="text-xl text-muted-foreground">
            Contact us today for a free consultation and site visit booking. Let our engineers guide you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/contact" prefetch={true}>
              <Button size="lg" className="h-14 px-10 text-lg">
                <MapPin className="mr-2 w-5 h-5" /> Book a Site Visit
              </Button>
            </Link>
            <a href={`https://wa.me/${SITE_CONFIG.whatsapp}`} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="h-14 px-10 text-lg bg-[#25D366]/10 text-[#25D366] border-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors">
                WhatsApp Us
              </Button>
            </a>
          </div>
        </div>
      </section>

    </main>
  );
}
