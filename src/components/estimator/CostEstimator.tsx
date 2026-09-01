"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Calculator, PhoneCall, Minus, Plus, CheckCircle2, Building2, PaintBucket, Wrench, HardHat } from "lucide-react";
import WhatsAppIcon from "@/components/shared/WhatsAppIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { SITE_CONFIG } from "@/lib/constants";
import EstimatePDFExport from "@/components/estimator/EstimatePDFExport";

type QualityType = "standard" | "premium" | "luxury";

interface BreakdownItem {
  label: string;
  percentage: number;
  min: number;
  max: number;
}

interface EstimateData {
  inquiryId: string;
  totalArea: number;
  floors: number;
  areaPerFloor: number;
  quality: QualityType;
  rate: number;
  minCost: number;
  maxCost: number;
  breakdown: {
    civil: BreakdownItem;
    finishing: BreakdownItem;
    electrical: BreakdownItem;
    fees: BreakdownItem;
  };
}

const QUALITY_CONFIG: Record<QualityType, { label: string; rate: number; desc: string; icon: string }> = {
  standard: { label: "Standard", rate: 1800, desc: "Standard brick, ceramic tiles & regular fittings", icon: "🏠" },
  premium: { label: "Premium", rate: 2200, desc: "Premium ceramic/marble, branded fittings & exterior design", icon: "🏛️" },
  luxury: { label: "Luxury", rate: 2800, desc: "High-end 3D finishing, imported tiles, glass facade & automation", icon: "✨" },
};

const BREAKDOWN_ICONS: Record<string, React.ReactNode> = {
  civil: <Building2 className="w-5 h-5" />,
  finishing: <PaintBucket className="w-5 h-5" />,
  electrical: <Wrench className="w-5 h-5" />,
  fees: <HardHat className="w-5 h-5" />,
};

function formatBDT(value: number): string {
  if (value >= 10000000) return `${(value / 10000000).toFixed(2)} Crore`;
  return `${(value / 100000).toFixed(2)} Lakh`;
}

function formatBdtShort(value: number): string {
  return `৳ ${value.toLocaleString("en-BD")}`;
}

export default function CostEstimator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EstimateData | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState<number>(1200);
  const [floors, setFloors] = useState<number>(1);
  const [quality, setQuality] = useState<QualityType>("standard");
  const [activeTab, setActiveTab] = useState<"form" | "result">("form");

  const handleFloorsChange = useCallback((delta: number) => {
    setFloors(prev => Math.max(1, Math.min(20, prev + delta)));
  }, []);

  const resetForm = () => {
    setName("");
    setPhone("");
    setArea(1200);
    setFloors(1);
    setQuality("standard");
    setResult(null);
    setActiveTab("form");
    setShowBreakdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      toast.error("Please enter your name and phone number");
      return;
    }
    if (!/^(?:\+?880)?\d{10,11}$/.test(phone.replace(/[\s-]/g, ""))) {
      toast.error("Please enter a valid Bangladeshi phone number");
      return;
    }
    if (!area || area < 100) {
      toast.error("Minimum 100 sq. ft. area required");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, areaSqFt: area, floors, quality }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to calculate");
      setResult(data.data);
      setActiveTab("result");
      toast.success("Your cost estimate is ready!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getWhatsAppMessage = () => {
    if (!result) return "";
    const totalArea = result.totalArea;
    return `Hello Engr. Hasmot,
I calculated a cost estimate for my project on your website.

*Project Details:*
- Area: ${result.areaPerFloor} sq.ft per floor × ${result.floors} floor(s) = ${totalArea.toLocaleString()} sq.ft
- Quality: ${QUALITY_CONFIG[result.quality].label}
- Estimated Cost Range: ${formatBDT(result.minCost)} - ${formatBDT(result.maxCost)} BDT

I would like a detailed BOQ and consultation. Please guide me on the next steps.`;
  };

  const whatsappUrl = `https://wa.me/${SITE_CONFIG.whatsapp}?text=${encodeURIComponent(getWhatsAppMessage())}`;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      <AnimatePresence mode="wait">
        {activeTab === "form" ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-border shadow-xl overflow-hidden">
              <CardContent className="p-6 md:p-10">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Row 1: Name & Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-bold">Full Name *</Label>
                    <Input id="name" placeholder="e.g. Md. Anisur Rahman" value={name} onChange={e => setName(e.target.value)} required className="h-12 text-base" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-bold">Mobile Number *</Label>
                      <Input id="phone" type="tel" placeholder="017XXXXXXXX" value={phone} onChange={e => setPhone(e.target.value)} required className="h-12 text-base" />
                    </div>
                  </div>

                  {/* Row 2: Area & Floors */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="area" className="text-sm font-bold">Area per Floor (Sq. Ft.)</Label>
                      <Input
                        id="area" type="number" min={100} max={100000}
                        placeholder="e.g. 1200" value={area}
                        onChange={e => setArea(Number(e.target.value) || 0)}
                        required className="h-12 text-lg font-bold"
                      />
                      <p className="text-xs text-muted-foreground">Total Area: <strong>{(area * floors).toLocaleString()}</strong> sq.ft</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold">Number of Floors</Label>
                      <div className="flex items-center gap-4 h-12">
                        <button type="button" onClick={() => handleFloorsChange(-1)} disabled={floors <= 1}
                          className="w-12 h-12 rounded-lg border border-border flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        ><Minus className="w-5 h-5" /></button>
                        <div className="flex-1 text-center">
                          <span className="text-3xl font-extrabold text-primary">{floors}</span>
                          <span className="text-sm text-muted-foreground ml-2">Floor{floors > 1 ? 's' : ''}</span>
                        </div>
                        <button type="button" onClick={() => handleFloorsChange(1)} disabled={floors >= 20}
                          className="w-12 h-12 rounded-lg border border-border flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        ><Plus className="w-5 h-5" /></button>
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Quality Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-bold">Select Construction Quality</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {(Object.entries(QUALITY_CONFIG) as [QualityType, typeof QUALITY_CONFIG[QualityType]][]).map(([key, cfg]) => (
                        <button
                          key={key} type="button" onClick={() => setQuality(key)}
                          className={`relative p-5 rounded-xl border-2 text-left transition-all duration-200 ${
                            quality === key
                              ? "border-accent bg-accent/5 shadow-lg shadow-accent/10 scale-[1.02]"
                              : "border-border bg-card hover:border-muted-foreground/30 hover:shadow-md"
                          }`}
                        >
                          {quality === key && (
                            <CheckCircle2 className="absolute top-3 right-3 w-5 h-5 text-accent" />
                          )}
                          <div className="text-3xl mb-3">{cfg.icon}</div>
                          <div className="font-bold text-lg mb-1">{cfg.label}</div>
                          <div className="text-sm text-muted-foreground mb-2 leading-relaxed">{cfg.desc}</div>
                          <div className="text-sm font-bold text-accent">≈ {cfg.rate.toLocaleString()} BDT/Sq.Ft</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit */}
                  <Button type="submit" className="w-full h-14 text-lg font-bold" disabled={loading}>
                    {loading ? (
                      <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Calculating...</>
                    ) : (
                      <><Calculator className="w-5 h-5 mr-3" /> Calculate Construction Cost</>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        ) : result ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Result Card */}
            <Card className="border-accent/30 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-accent/10 to-accent/5 p-6 md:p-10 text-center border-b border-border">
                <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold mb-2">Estimated Construction Cost</p>
                <h3 className="text-4xl md:text-5xl font-extrabold text-primary font-heading">
                  {formatBDT(result.minCost)} - {formatBDT(result.maxCost)}
                </h3>
                <p className="text-sm text-muted-foreground mt-2">In Bangladeshi Taka (BDT)</p>

                <div className="flex flex-wrap justify-center gap-6 mt-6 text-sm">
                  <div className="bg-background/80 px-4 py-2 rounded-lg border border-border">
                    <span className="text-muted-foreground">Total Area: </span>
                    <strong>{result.totalArea.toLocaleString()} Sq.Ft</strong>
                  </div>
                  <div className="bg-background/80 px-4 py-2 rounded-lg border border-border">
                    <span className="text-muted-foreground">Quality: </span>
                    <strong>{QUALITY_CONFIG[result.quality].label}</strong>
                  </div>
                  <div className="bg-background/80 px-4 py-2 rounded-lg border border-border">
                    <span className="text-muted-foreground">Rate: </span>
                    <strong>৳{result.rate.toLocaleString()}/Sq.Ft</strong>
                  </div>
                </div>
              </div>

              <CardContent className="p-6 md:p-10 space-y-6">
                {/* Breakdown Toggle */}
                <button
                  onClick={() => setShowBreakdown(!showBreakdown)}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors border border-border"
                >
                  <span className="font-bold text-lg">View Detailed Cost Breakdown</span>
                  <motion.span animate={{ rotate: showBreakdown ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    ▼
                  </motion.span>
                </button>

                <AnimatePresence>
                  {showBreakdown && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-3 pt-2">
                        {Object.entries(result.breakdown).map(([key, item], idx) => (
                          <motion.div
                            key={key}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.08 }}
                            className="p-4 rounded-xl bg-card border border-border"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <span className="text-accent">{BREAKDOWN_ICONS[key]}</span>
                                <span className="font-semibold text-sm">{item.label}</span>
                              </div>
                              <span className="text-sm font-bold text-accent">{item.percentage}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${item.percentage}%` }}
                                transition={{ duration: 0.8, delay: idx * 0.1 }}
                                className="h-full bg-accent rounded-full"
                              />
                            </div>
                            <div className="flex justify-between mt-2 text-sm">
                              <span className="text-muted-foreground">Min</span>
                              <span className="font-bold">{formatBdtShort(item.min)}</span>
                              <span className="text-muted-foreground">to</span>
                              <span className="font-bold">{formatBdtShort(item.max)}</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* CTAs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full h-14 text-base font-bold bg-[#25D366] hover:bg-[#20bd5a] text-white">
                      <WhatsAppIcon className="w-5 h-5 mr-3" />
                      Discuss with Engineer on WhatsApp
                    </Button>
                  </a>
                  <Dialog>
                    <DialogTrigger render={
                      <Button variant="outline" className="w-full h-14 text-base font-bold border-accent text-accent hover:bg-accent hover:text-primary-foreground">
                        <PhoneCall className="w-5 h-5 mr-3" />
                        Book Free Consultation
                      </Button>
                    } />
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Book Free Consultation</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <p className="text-sm text-muted-foreground">
                          Our engineering team will call you to discuss your project in detail.
                        </p>
                        <div className="bg-secondary/50 p-4 rounded-lg space-y-2 text-sm">
                          <p><strong>Name:</strong> {name}</p>
                          <p><strong>Phone:</strong> {phone}</p>
                          <p><strong>Project:</strong> {result.areaPerFloor} sq.ft × {result.floors} floor(s) = {result.totalArea.toLocaleString()} sq.ft</p>
                          <p><strong>Estimated Budget:</strong> {formatBDT(result.minCost)} - {formatBDT(result.maxCost)}</p>
                        </div>
                        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                          <Button className="w-full h-12 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold">
                            <WhatsAppIcon className="w-5 h-5 mr-2" />
                            Contact Us on WhatsApp Now
                          </Button>
                        </a>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* PDF Export */}
                <EstimatePDFExport result={result} clientName={name} clientPhone={phone} />

                <Button variant="ghost" onClick={resetForm} className="w-full text-muted-foreground">
                  Calculate Again
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
