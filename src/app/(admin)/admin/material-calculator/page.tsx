"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import {
  Hammer,
  Calculator,
  Printer,
  Trash2,
  Edit,
  Eye,
  Loader2,
  Plus,
  Search,
  CheckCircle,
  Building,
  Layers,
  Coins,
  FileSpreadsheet,
  Settings2,
  X,
  Share2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { adminFetch } from "@/lib/admin-fetch";
import WhatsAppIcon from "@/components/shared/WhatsAppIcon";

interface SavedEstimate {
  _id: string;
  estimateNumber: string;
  clientName: string;
  clientPhone?: string;
  projectTitle: string;
  slabArea: number;
  floors: number;
  totalBuiltArea: number;
  buildingType: string;
  unitRates: {
    rodPerKg: number;
    cementPerBag: number;
    coarseSandPerCft: number;
    localSandPerCft: number;
    aggregatePerCft: number;
    brickPerPcs: number;
  };
  quantities: {
    rodKg: number;
    rodTons: number;
    rod16mmKg: number;
    rod12mmKg: number;
    rod10mmKg: number;
    rod8mmKg: number;
    cementBags: number;
    cementCastingBags: number;
    cementMasonryBags: number;
    coarseSandCft: number;
    localSandCft: number;
    aggregateCft: number;
    bricksCount: number;
  };
  costs: {
    rodCost: number;
    cementCost: number;
    sandCost: number;
    aggregateCost: number;
    brickCost: number;
    totalMaterialCost: number;
    costPerSqft: number;
  };
  createdAt: string;
}

export default function AdminMaterialCalculatorPage() {
  const [activeTab, setActiveTab] = useState<"calculator" | "saved">("calculator");
  const [savedList, setSavedList] = useState<SavedEstimate[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // View / Print Modal
  const [viewEstimate, setViewEstimate] = useState<SavedEstimate | null>(null);

  // Input States
  const [clientName, setClientName] = useState("মোঃ আনোয়ার হোসেন");
  const [clientPhone, setClientPhone] = useState("");
  const [projectTitle, setProjectTitle] = useState("আনোয়ার ভিলা — ৫ তলা ভবন");
  const [slabArea, setSlabArea] = useState<number>(1500);
  const [floors, setFloors] = useState<number>(5);
  const [buildingType, setBuildingType] = useState<"residential" | "commercial" | "duplex">("residential");
  const [densityMode, setDensityMode] = useState<"standard" | "heavy" | "economic">("standard");

  // Unit Rates
  const [rodRate, setRodRate] = useState<number>(96); // ৳/kg
  const [cementRate, setCementRate] = useState<number>(540); // ৳/bag
  const [coarseSandRate, setCoarseSandRate] = useState<number>(55); // ৳/cft
  const [localSandRate, setLocalSandRate] = useState<number>(35); // ৳/cft
  const [aggregateRate, setAggregateRate] = useState<number>(140); // ৳/cft
  const [brickRate, setBrickRate] = useState<number>(12.5); // ৳/pc

  const [showRateSettings, setShowRateSettings] = useState(false);

  // Real-time BNBC Empirical Calculation Logic
  const calculation = useMemo(() => {
    const totalArea = Math.max(0, (Number(slabArea) || 0) * (Number(floors) || 0));

    // Rod density factor (kg per sqft of built-up area)
    let rodFactor = 3.9;
    if (densityMode === "heavy") rodFactor = 4.3;
    if (densityMode === "economic") rodFactor = 3.5;
    if (buildingType === "commercial") rodFactor += 0.4;

    const totalRodKg = Math.round(totalArea * rodFactor);
    const totalRodTons = Number((totalRodKg / 1000).toFixed(2));

    // Rod breakdown
    const rod16mmKg = Math.round(totalRodKg * 0.35); // Columns & footings
    const rod12mmKg = Math.round(totalRodKg * 0.35); // Beams
    const rod10mmKg = Math.round(totalRodKg * 0.25); // Slab mesh & ties
    const rod8mmKg = Math.max(0, totalRodKg - (rod16mmKg + rod12mmKg + rod10mmKg)); // Stirrup rings

    // Cement
    // Casting: ~0.32 bags/sqft, Brickwork & Plaster: ~0.13 bags/sqft
    const cementCastingBags = Math.round(totalArea * 0.32);
    const cementMasonryBags = Math.round(totalArea * 0.13);
    const totalCementBags = cementCastingBags + cementMasonryBags;

    // Sand
    const coarseSandCft = Math.round(totalArea * 0.8);
    const localSandCft = Math.round(totalArea * 0.55);

    // Aggregate (Chips / Stone)
    const aggregateCft = Math.round(totalArea * 1.15);

    // Bricks (~11 bricks per sqft)
    const bricksCount = Math.round(totalArea * 11);

    // Costs
    const rodCost = Math.round(totalRodKg * rodRate);
    const cementCost = Math.round(totalCementBags * cementRate);
    const sandCost = Math.round(coarseSandCft * coarseSandRate + localSandCft * localSandRate);
    const aggregateCost = Math.round(aggregateCft * aggregateRate);
    const brickCost = Math.round(bricksCount * brickRate);

    const totalMaterialCost = rodCost + cementCost + sandCost + aggregateCost + brickCost;
    const costPerSqft = totalArea > 0 ? Math.round(totalMaterialCost / totalArea) : 0;

    return {
      totalArea,
      totalRodKg,
      totalRodTons,
      rod16mmKg,
      rod12mmKg,
      rod10mmKg,
      rod8mmKg,
      cementCastingBags,
      cementMasonryBags,
      totalCementBags,
      coarseSandCft,
      localSandCft,
      aggregateCft,
      bricksCount,
      rodCost,
      cementCost,
      sandCost,
      aggregateCost,
      brickCost,
      totalMaterialCost,
      costPerSqft,
    };
  }, [
    slabArea,
    floors,
    buildingType,
    densityMode,
    rodRate,
    cementRate,
    coarseSandRate,
    localSandRate,
    aggregateRate,
    brickRate,
  ]);

  const fetchSaved = useCallback(async () => {
    try {
      setLoadingSaved(true);
      const url = search
        ? `/api/admin/material-estimates?search=${encodeURIComponent(search)}`
        : "/api/admin/material-estimates";
      const res = await adminFetch(url);
      const data = await res.json();
      if (data.estimates) setSavedList(data.estimates);
    } catch (err: any) {
      toast.error("হিসাব তালিকা লোড করা যায়নি: " + err.message);
    } finally {
      setLoadingSaved(false);
    }
  }, [search]);

  useEffect(() => {
    if (activeTab === "saved") {
      fetchSaved();
    }
  }, [activeTab, fetchSaved]);

  const handleSaveEstimate = async () => {
    if (!clientName || !projectTitle || !slabArea || !floors) {
      toast.error("ক্লায়েন্টের নাম, প্রজেক্টের নাম ও এলাকা পূরণ করুন");
      return;
    }

    try {
      setSaving(true);
      const res = await adminFetch("/api/admin/material-estimates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: editId,
          clientName,
          clientPhone,
          projectTitle,
          slabArea,
          floors,
          totalBuiltArea: calculation.totalArea,
          buildingType,
          unitRates: {
            rodPerKg: rodRate,
            cementPerBag: cementRate,
            coarseSandPerCft: coarseSandRate,
            localSandPerCft: localSandRate,
            aggregatePerCft: aggregateRate,
            brickPerPcs: brickRate,
          },
          quantities: {
            rodKg: calculation.totalRodKg,
            rodTons: calculation.totalRodTons,
            rod16mmKg: calculation.rod16mmKg,
            rod12mmKg: calculation.rod12mmKg,
            rod10mmKg: calculation.rod10mmKg,
            rod8mmKg: calculation.rod8mmKg,
            cementBags: calculation.totalCementBags,
            cementCastingBags: calculation.cementCastingBags,
            cementMasonryBags: calculation.cementMasonryBags,
            coarseSandCft: calculation.coarseSandCft,
            localSandCft: calculation.localSandCft,
            aggregateCft: calculation.aggregateCft,
            bricksCount: calculation.bricksCount,
          },
          costs: {
            rodCost: calculation.rodCost,
            cementCost: calculation.cementCost,
            sandCost: calculation.sandCost,
            aggregateCost: calculation.aggregateCost,
            brickCost: calculation.brickCost,
            totalMaterialCost: calculation.totalMaterialCost,
            costPerSqft: calculation.costPerSqft,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      toast.success("ম্যাটেরিয়াল হিসাব ডাটাবেজে সফলভাবে সংরক্ষিত হয়েছে!");
      setEditId(null);
      if (activeTab === "saved") fetchSaved();
    } catch (err: any) {
      toast.error(err.message || "সংরক্ষণ ব্যর্থ হয়েছে");
    } finally {
      setSaving(false);
    }
  };

  const handleLoadEstimate = (est: SavedEstimate) => {
    setEditId(est._id);
    setClientName(est.clientName);
    setClientPhone(est.clientPhone || "");
    setProjectTitle(est.projectTitle);
    setSlabArea(est.slabArea);
    setFloors(est.floors);
    setBuildingType(est.buildingType as any);
    if (est.unitRates) {
      setRodRate(est.unitRates.rodPerKg);
      setCementRate(est.unitRates.cementPerBag);
      setCoarseSandRate(est.unitRates.coarseSandPerCft);
      setLocalSandRate(est.unitRates.localSandPerCft);
      setAggregateRate(est.unitRates.aggregatePerCft);
      setBrickRate(est.unitRates.brickPerPcs);
    }
    setActiveTab("calculator");
    toast.success(`"${est.projectTitle}" এর হিসাব ক্যালকুলেটরে লোড করা হয়েছে`);
  };

  const handleDelete = async (id: string, num: string) => {
    if (!confirm(`আপনি কি নিশ্চিত যে হিসাব নং "${num}" ডিলিট করতে চান?`)) return;
    try {
      const res = await adminFetch(`/api/admin/material-estimates?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      toast.success("হিসাব ডিলিট করা হয়েছে");
      fetchSaved();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  const handleWhatsAppSend = () => {
    const lines = [
      `🏗️ *কনস্ট্রাকশন ম্যাটেরিয়াল এস্টিমেট (Material BOQ)*`,
      `*Triple H Plandraft & Engineering*`,
      ``,
      `প্রিয় ${clientName || "ক্লায়েন্ট"},`,
      `আপনার প্রজেক্ট "*${projectTitle}*" এর আনুমানিক মূল নির্মাণ সামগ্রীর হিসাব প্রস্তুত করা হয়েছে:`,
      ``,
      `📐 প্রতি তলার ছাদ: *${slabArea.toLocaleString()} sqft*`,
      `🏢 মোট তলার সংখ্যা: *${floors} তলা*`,
      `🏗️ মোট নির্মিত এলাকা: *${calculation.totalArea.toLocaleString()} sqft*`,
      ``,
      `📊 *মূল মালামালের বিবরণ:*`,
      `• রড (Rebar): *${calculation.totalRodTons} টন* (${calculation.totalRodKg.toLocaleString()} কেজি) — ৳${calculation.rodCost.toLocaleString()}`,
      `  - ১৬/২০ মিমি: ${calculation.rod16mmKg.toLocaleString()} কেজি`,
      `  - ১২ মিমি: ${calculation.rod12mmKg.toLocaleString()} কেজি`,
      `  - ১০ মিমি: ${calculation.rod10mmKg.toLocaleString()} কেজি`,
      `• সিমেন্ট (Cement): *${calculation.totalCementBags.toLocaleString()} ব্যাগ* — ৳${calculation.cementCost.toLocaleString()}`,
      `  - ঢালাই: ${calculation.cementCastingBags} ব্যাগ | গাথুনি/প্লাস্টার: ${calculation.cementMasonryBags} ব্যাগ`,
      `• বালু (Sand): *${(calculation.coarseSandCft + calculation.localSandCft).toLocaleString()} cft* — ৳${calculation.sandCost.toLocaleString()}`,
      `  - সিলেট বালু: ${calculation.coarseSandCft.toLocaleString()} cft | লোকাল: ${calculation.localSandCft.toLocaleString()} cft`,
      `• খোয়া/পাথর (Aggregate): *${calculation.aggregateCft.toLocaleString()} cft* — ৳${calculation.aggregateCost.toLocaleString()}`,
      `• ইট (Bricks): *${calculation.bricksCount.toLocaleString()} টি* — ৳${calculation.brickCost.toLocaleString()}`,
      ``,
      `💰 *সর্বমোট আনুমানিক ম্যাটেরিয়াল খরচ: ৳${calculation.totalMaterialCost.toLocaleString()}*`,
      `📊 প্রতি স্কয়ার ফিট মালামাল খরচ: *৳${calculation.costPerSqft} / sqft*`,
      ``,
      `নোট: বাজার দর ও স্ট্রাকচারাল ডিজাইনের স্পেসিফিকেশন ভেদে সামান্য পরিবর্তন হতে পারে।`,
      `📞 যোগাযোগ: 01778-506500 | ইঞ্জিনিয়ার মোঃ হাসমত আলী`,
    ];

    const text = lines.join("\n");
    const cleanPhone = clientPhone ? clientPhone.replace(/[^0-9]/g, "") : "";
    const targetUrl = cleanPhone
      ? `https://wa.me/${cleanPhone.startsWith("88") ? cleanPhone : `88${cleanPhone}`}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(targetUrl, "_blank");
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Hammer className="w-7 h-7 text-accent" /> রড, সিমেন্ট ও ম্যাটেরিয়াল ক্যালকুলেটর
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            ছাদের আয়তন ও তলার সংখ্যা অনুযায়ী রড (১৬/১২/১০ মিমি), সিমেন্ট, বালু, খোয়া ও ইটের বিজ্ঞানসম্মত হিসাব ও বাজেট
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === "calculator" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("calculator")}
            className="cursor-pointer"
          >
            <Calculator className="w-4 h-4 mr-1.5" /> ক্যালকুলেটর
          </Button>
          <Button
            variant={activeTab === "saved" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("saved")}
            className="cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1.5" /> সংরক্ষিত হিসাব ({savedList.length})
          </Button>
        </div>
      </div>

      {activeTab === "calculator" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form & Market Rates (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <Card>
              <CardHeader className="pb-3 bg-secondary/30">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Building className="w-4 h-4 text-accent" /> ভবনের তথ্য ও পরিমাপ
                </CardTitle>
                <CardDescription className="text-xs">
                  ক্লায়েন্টের প্রজেক্ট ও ছাদের স্কয়ার ফিট ইনপুট দিন
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <Label className="text-xs">ক্লায়েন্টের নাম</Label>
                    <Input
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="মোঃ আনোয়ার হোসেন"
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">মোবাইল নম্বর</Label>
                    <Input
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="01711-XXXXXX"
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">ভবনের ধরন</Label>
                    <select
                      value={buildingType}
                      onChange={(e) => setBuildingType(e.target.value as any)}
                      className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
                    >
                      <option value="residential">আবাসিক (Residential)</option>
                      <option value="commercial">বাণিজ্যিক (Commercial)</option>
                      <option value="duplex">ডুপ্লেক্স (Duplex)</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-xs">প্রজেক্টের নাম / অবস্থান</Label>
                    <Input
                      value={projectTitle}
                      onChange={(e) => setProjectTitle(e.target.value)}
                      placeholder="আনোয়ার ভিলা — ৫ তলা ভবন"
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                  <div>
                    <Label className="text-xs font-semibold">প্রতি তলার ছাদ (Sq.Ft) *</Label>
                    <Input
                      type="number"
                      value={slabArea}
                      onChange={(e) => setSlabArea(Math.max(1, Number(e.target.value)))}
                      className="mt-1 text-xs font-bold text-accent"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">মোট তলার সংখ্যা *</Label>
                    <Input
                      type="number"
                      value={floors}
                      onChange={(e) => setFloors(Math.max(1, Number(e.target.value)))}
                      className="mt-1 text-xs font-bold text-accent"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  <Label className="text-xs font-semibold">রডের ঘনত্ব ও কাঠামোগত মান (Density)</Label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setDensityMode("economic")}
                      className={`p-2 rounded-lg border text-center text-xs font-semibold transition-all cursor-pointer ${
                        densityMode === "economic"
                          ? "bg-accent/15 border-accent text-accent font-bold shadow-xs"
                          : "bg-card border-border hover:bg-secondary/40 text-muted-foreground"
                      }`}
                    >
                      সাধারণ (৩.৫ kg/sft)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDensityMode("standard")}
                      className={`p-2 rounded-lg border text-center text-xs font-semibold transition-all cursor-pointer ${
                        densityMode === "standard"
                          ? "bg-accent/15 border-accent text-accent font-bold shadow-xs"
                          : "bg-card border-border hover:bg-secondary/40 text-muted-foreground"
                      }`}
                    >
                      স্ট্যান্ডার্ড (৩.৯ kg/sft)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDensityMode("heavy")}
                      className={`p-2 rounded-lg border text-center text-xs font-semibold transition-all cursor-pointer ${
                        densityMode === "heavy"
                          ? "bg-accent/15 border-accent text-accent font-bold shadow-xs"
                          : "bg-card border-border hover:bg-secondary/40 text-muted-foreground"
                      }`}
                    >
                      মজবুত (৪.৩ kg/sft)
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Market Rates Card */}
            <Card>
              <CardHeader
                className="pb-3 cursor-pointer select-none"
                onClick={() => setShowRateSettings(!showRateSettings)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Settings2 className="w-4 h-4 text-accent" /> বর্তমান বাজার দর (Unit Prices)
                    </CardTitle>
                    <CardDescription className="text-[11px]">
                      দর পরিবর্তন করতে ক্লিক করুন (দর অনুযায়ী বাজেট স্বয়ংক্রিয়ভাবে আপডেট হবে)
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {showRateSettings ? "লুকান" : "এডিট করুন"}
                  </Badge>
                </div>
              </CardHeader>
              {showRateSettings && (
                <CardContent className="space-y-3 pt-0 border-t border-border">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3">
                    <div>
                      <Label className="text-[11px]">রড (৳/কেজি)</Label>
                      <Input
                        type="number"
                        value={rodRate}
                        onChange={(e) => setRodRate(Number(e.target.value))}
                        className="h-8 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px]">সিমেন্ট (৳/ব্যাগ)</Label>
                      <Input
                        type="number"
                        value={cementRate}
                        onChange={(e) => setCementRate(Number(e.target.value))}
                        className="h-8 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px]">সিলেট বালু (৳/cft)</Label>
                      <Input
                        type="number"
                        value={coarseSandRate}
                        onChange={(e) => setCoarseSandRate(Number(e.target.value))}
                        className="h-8 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px]">লোকাল বালু (৳/cft)</Label>
                      <Input
                        type="number"
                        value={localSandRate}
                        onChange={(e) => setLocalSandRate(Number(e.target.value))}
                        className="h-8 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px]">খোয়া/পাথর (৳/cft)</Label>
                      <Input
                        type="number"
                        value={aggregateRate}
                        onChange={(e) => setAggregateRate(Number(e.target.value))}
                        className="h-8 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px]">ইট (৳/পিস)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={brickRate}
                        onChange={(e) => setBrickRate(Number(e.target.value))}
                        className="h-8 text-xs font-bold"
                      />
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Save and Share Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <Button
                onClick={handleSaveEstimate}
                disabled={saving}
                className="w-full sm:flex-1 bg-accent hover:bg-accent/90 text-primary-foreground font-bold text-xs cursor-pointer"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : null}
                {editId ? "হিসাব আপডেট করুন" : "হিসাব ডাটাবেজে সংরক্ষণ করুন"}
              </Button>
              <Button
                onClick={handleWhatsAppSend}
                variant="outline"
                className="w-full sm:w-auto text-xs font-bold text-[#25D366] hover:text-[#1EBE5D] border-border cursor-pointer"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 mr-1.5" /> হোয়াটসঅ্যাপে পাঠান
              </Button>
              <Button
                onClick={() => {
                  setViewEstimate({
                    _id: "temp",
                    estimateNumber: `EST-${Date.now().toString().slice(-5)}`,
                    clientName,
                    clientPhone,
                    projectTitle,
                    slabArea,
                    floors,
                    totalBuiltArea: calculation.totalArea,
                    buildingType,
                    unitRates: {
                      rodPerKg: rodRate,
                      cementPerBag: cementRate,
                      coarseSandPerCft: coarseSandRate,
                      localSandPerCft: localSandRate,
                      aggregatePerCft: aggregateRate,
                      brickPerPcs: brickRate,
                    },
                    quantities: {
                      rodKg: calculation.totalRodKg,
                      rodTons: calculation.totalRodTons,
                      rod16mmKg: calculation.rod16mmKg,
                      rod12mmKg: calculation.rod12mmKg,
                      rod10mmKg: calculation.rod10mmKg,
                      rod8mmKg: calculation.rod8mmKg,
                      cementBags: calculation.totalCementBags,
                      cementCastingBags: calculation.cementCastingBags,
                      cementMasonryBags: calculation.cementMasonryBags,
                      coarseSandCft: calculation.coarseSandCft,
                      localSandCft: calculation.localSandCft,
                      aggregateCft: calculation.aggregateCft,
                      bricksCount: calculation.bricksCount,
                    },
                    costs: {
                      rodCost: calculation.rodCost,
                      cementCost: calculation.cementCost,
                      sandCost: calculation.sandCost,
                      aggregateCost: calculation.aggregateCost,
                      brickCost: calculation.brickCost,
                      totalMaterialCost: calculation.totalMaterialCost,
                      costPerSqft: calculation.costPerSqft,
                    },
                    createdAt: new Date().toISOString(),
                  });
                }}
                variant="outline"
                className="w-full sm:w-auto text-xs font-bold cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 mr-1.5" /> প্রিন্ট ভাউচার
              </Button>
            </div>
          </div>

          {/* Right Column: Calculations & Breakdown Table (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 4 Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-card p-3.5 rounded-xl border border-border shadow-xs">
                <span className="text-[11px] text-muted-foreground block font-medium">মোট বিল্ট-আপ এলাকা</span>
                <span className="text-lg font-black text-foreground mt-0.5 block">
                  {calculation.totalArea.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">sft</span>
                </span>
                <span className="text-[10px] text-muted-foreground">({slabArea} sft × {floors} তলা)</span>
              </div>

              <div className="bg-card p-3.5 rounded-xl border border-border shadow-xs">
                <span className="text-[11px] text-muted-foreground block font-medium">মোট রড (Rebar)</span>
                <span className="text-lg font-black text-blue-600 dark:text-blue-400 mt-0.5 block">
                  {calculation.totalRodTons} <span className="text-xs font-normal text-muted-foreground">টন</span>
                </span>
                <span className="text-[10px] text-muted-foreground">({calculation.totalRodKg.toLocaleString()} কেজি)</span>
              </div>

              <div className="bg-card p-3.5 rounded-xl border border-border shadow-xs">
                <span className="text-[11px] text-muted-foreground block font-medium">মোট সিমেন্ট (Cement)</span>
                <span className="text-lg font-black text-purple-600 dark:text-purple-400 mt-0.5 block">
                  {calculation.totalCementBags.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">ব্যাগ</span>
                </span>
                <span className="text-[10px] text-muted-foreground">({calculation.cementCastingBags} ঢালাই + {calculation.cementMasonryBags} গাথুনি)</span>
              </div>

              <div className="bg-card p-3.5 rounded-xl border-2 border-accent/40 bg-accent/5 shadow-xs">
                <span className="text-[11px] text-accent font-bold block">মোট ম্যাটেরিয়াল বাজেট</span>
                <span className="text-lg font-black text-accent mt-0.5 block">
                  ৳{calculation.totalMaterialCost.toLocaleString()}
                </span>
                <span className="text-[10px] text-muted-foreground font-semibold">
                  (গড়ে ৳{calculation.costPerSqft} / sft)
                </span>
              </div>
            </div>

            {/* Cost Distribution Bar */}
            <Card className="p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span>ম্যাটেরিয়াল খরচের বণ্টন (Cost Distribution)</span>
                <span className="text-accent font-mono">১০০%</span>
              </div>
              <div className="w-full h-3.5 rounded-full overflow-hidden flex border border-border">
                <div
                  style={{ width: `${(calculation.rodCost / (calculation.totalMaterialCost || 1)) * 100}%` }}
                  className="bg-blue-500 h-full"
                  title="রড"
                ></div>
                <div
                  style={{ width: `${(calculation.cementCost / (calculation.totalMaterialCost || 1)) * 100}%` }}
                  className="bg-purple-500 h-full"
                  title="সিমেন্ট"
                ></div>
                <div
                  style={{ width: `${(calculation.sandCost / (calculation.totalMaterialCost || 1)) * 100}%` }}
                  className="bg-amber-500 h-full"
                  title="বালু"
                ></div>
                <div
                  style={{ width: `${(calculation.aggregateCost / (calculation.totalMaterialCost || 1)) * 100}%` }}
                  className="bg-emerald-500 h-full"
                  title="খোয়া/পাথর"
                ></div>
                <div
                  style={{ width: `${(calculation.brickCost / (calculation.totalMaterialCost || 1)) * 100}%` }}
                  className="bg-rose-500 h-full"
                  title="ইট"
                ></div>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> রড ({Math.round((calculation.rodCost / (calculation.totalMaterialCost || 1)) * 100)}%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> সিমেন্ট ({Math.round((calculation.cementCost / (calculation.totalMaterialCost || 1)) * 100)}%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> বালু ({Math.round((calculation.sandCost / (calculation.totalMaterialCost || 1)) * 100)}%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> খোয়া/পাথর ({Math.round((calculation.aggregateCost / (calculation.totalMaterialCost || 1)) * 100)}%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> ইট ({Math.round((calculation.brickCost / (calculation.totalMaterialCost || 1)) * 100)}%)
                </span>
              </div>
            </Card>

            {/* Detailed Table */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">বিস্তারিত মালামালের তালিকা (Bill of Quantities)</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-y border-border bg-secondary/30 text-muted-foreground font-semibold">
                        <th className="py-2.5 px-3">মালামালের বিবরণ</th>
                        <th className="py-2.5 px-3">স্পেসিফিকেশন / সাইজ</th>
                        <th className="py-2.5 px-3 text-right">পরিমাণ</th>
                        <th className="py-2.5 px-3 text-right">একক দর (৳)</th>
                        <th className="py-2.5 px-3 text-right">মোট টাকা (৳)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {/* Rod Details */}
                      <tr className="bg-blue-50/20 dark:bg-blue-950/10">
                        <td className="py-2.5 px-3 font-bold text-foreground">
                          রড (এমএস ৫০-৫০০W বার)
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground">
                          ১৬মিমি ({calculation.rod16mmKg} kg), ১২মিমি ({calculation.rod12mmKg} kg), ১০মিমি ({calculation.rod10mmKg} kg), ৮মিমি ({calculation.rod8mmKg} kg)
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-blue-600 dark:text-blue-400">
                          {calculation.totalRodKg.toLocaleString()} কেজি <span className="block text-[10px] text-muted-foreground font-normal">({calculation.totalRodTons} টন)</span>
                        </td>
                        <td className="py-2.5 px-3 text-right">৳{rodRate}/kg</td>
                        <td className="py-2.5 px-3 text-right font-bold">৳{calculation.rodCost.toLocaleString()}</td>
                      </tr>

                      {/* Cement */}
                      <tr className="bg-purple-50/20 dark:bg-purple-950/10">
                        <td className="py-2.5 px-3 font-bold text-foreground">
                          পোর্টল্যান্ড সিমেন্ট (PCC/OPC)
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground">
                          ঢালাই: {calculation.cementCastingBags} ব্যাগ, গাথুনি ও প্লাস্টার: {calculation.cementMasonryBags} ব্যাগ
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-purple-600 dark:text-purple-400">
                          {calculation.totalCementBags.toLocaleString()} ব্যাগ
                        </td>
                        <td className="py-2.5 px-3 text-right">৳{cementRate}/bag</td>
                        <td className="py-2.5 px-3 text-right font-bold">৳{calculation.cementCost.toLocaleString()}</td>
                      </tr>

                      {/* Coarse Sand */}
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-foreground">
                          মোটা বালু (সিলেট বালু)
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground">
                          FM 2.5 (কংক্রিট ঢালাইয়ের জন্য)
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold">
                          {calculation.coarseSandCft.toLocaleString()} cft <span className="block text-[10px] text-muted-foreground font-normal">(~{Math.ceil(calculation.coarseSandCft / 350)} ট্রাক)</span>
                        </td>
                        <td className="py-2.5 px-3 text-right">৳{coarseSandRate}/cft</td>
                        <td className="py-2.5 px-3 text-right font-semibold">৳{(calculation.coarseSandCft * coarseSandRate).toLocaleString()}</td>
                      </tr>

                      {/* Local Sand */}
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-foreground">
                          লোকাল বালু (প্লাস্টার ও গাথুনি)
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground">
                          FM 1.2 থেকে 1.5
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold">
                          {calculation.localSandCft.toLocaleString()} cft <span className="block text-[10px] text-muted-foreground font-normal">(~{Math.ceil(calculation.localSandCft / 350)} ট্রাক)</span>
                        </td>
                        <td className="py-2.5 px-3 text-right">৳{localSandRate}/cft</td>
                        <td className="py-2.5 px-3 text-right font-semibold">৳{(calculation.localSandCft * localSandRate).toLocaleString()}</td>
                      </tr>

                      {/* Aggregate */}
                      <tr className="bg-emerald-50/20 dark:bg-emerald-950/10">
                        <td className="py-2.5 px-3 font-bold text-foreground">
                          পাথর কুচি / ইটের খোয়া
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground">
                          ৩/৪&quot; ডাউন গ্রেডেড স্টোন/ব্রিক চিপস
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                          {calculation.aggregateCft.toLocaleString()} cft
                        </td>
                        <td className="py-2.5 px-3 text-right">৳{aggregateRate}/cft</td>
                        <td className="py-2.5 px-3 text-right font-bold">৳{calculation.aggregateCost.toLocaleString()}</td>
                      </tr>

                      {/* Bricks */}
                      <tr className="bg-rose-50/20 dark:bg-rose-950/10">
                        <td className="py-2.5 px-3 font-bold text-foreground">
                          ১ম শ্রেণির ইট (First Class Bricks)
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground">
                          ১০&quot; ও ৫&quot; দেয়ালের গাথুনির জন্য
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-rose-600 dark:text-rose-400">
                          {calculation.bricksCount.toLocaleString()} টি
                        </td>
                        <td className="py-2.5 px-3 text-right">৳{brickRate}/pc</td>
                        <td className="py-2.5 px-3 text-right font-bold">৳{calculation.brickCost.toLocaleString()}</td>
                      </tr>

                      {/* Total */}
                      <tr className="bg-secondary/40 font-bold border-t-2 border-border text-sm">
                        <td colSpan={4} className="py-3 px-3 text-right text-foreground">
                          সর্বমোট আনুমানিক ম্যাটেরিয়াল খরচ:
                        </td>
                        <td className="py-3 px-3 text-right text-accent text-base">
                          ৳{calculation.totalMaterialCost.toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Saved Tab */}
      {activeTab === "saved" && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base sm:text-lg font-bold">সংরক্ষিত ম্যাটেরিয়াল হিসাবসমূহ</CardTitle>
                <CardDescription className="text-xs">
                  বিভিন্ন ক্লায়েন্টের প্রজেক্টের সংরক্ষিত ম্যাটেরিয়াল বাজেট ও শিট
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="নাম, ফোন বা হিসাব নং..."
                  className="pl-9 h-9 text-xs"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loadingSaved ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
              </div>
            ) : savedList.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Calculator className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="font-semibold text-sm">কোনো সংরক্ষিত হিসাব পাওয়া যায়নি।</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-y border-border bg-secondary/30 text-muted-foreground font-semibold">
                      <th className="py-3 px-4">হিসাব নং</th>
                      <th className="py-3 px-4">ক্লায়েন্ট ও প্রজেক্ট</th>
                      <th className="py-3 px-4 text-center">আয়তন ও তলা</th>
                      <th className="py-3 px-4 text-right">রড (টন)</th>
                      <th className="py-3 px-4 text-right">সিমেন্ট (ব্যাগ)</th>
                      <th className="py-3 px-4 text-right">মোট বাজেট (৳)</th>
                      <th className="py-3 px-4 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {savedList.map((item) => (
                      <tr key={item._id} className="hover:bg-secondary/20 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-accent">{item.estimateNumber}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-foreground">{item.clientName}</div>
                          <div className="text-[11px] text-muted-foreground">{item.projectTitle}</div>
                        </td>
                        <td className="py-3 px-4 text-center font-medium">
                          {item.slabArea} sft × {item.floors} তলা
                          <span className="block text-[10px] text-muted-foreground">
                            ({item.totalBuiltArea.toLocaleString()} sft)
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-blue-600 dark:text-blue-400">
                          {item.quantities.rodTons} টন
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-purple-600 dark:text-purple-400">
                          {item.quantities.cementBags.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-accent">
                          ৳{item.costs.totalMaterialCost.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setViewEstimate(item)}
                              className="h-8 px-2 text-xs cursor-pointer"
                              title="প্রিন্ট ভাউচার"
                            >
                              <Printer className="w-3.5 h-3.5 mr-1" /> প্রিন্ট
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLoadEstimate(item)}
                              className="h-8 w-8 p-0 cursor-pointer text-accent hover:bg-accent/10"
                              title="ক্যালকুলেটরে এডিট করুন"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(item._id, item.estimateNumber)}
                              className="h-8 w-8 p-0 cursor-pointer text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Printable Material BOQ Voucher Modal */}
      {viewEstimate && (
        <Dialog open={!!viewEstimate} onOpenChange={() => setViewEstimate(null)}>
          <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-0 border-border">
            {/* Modal Top Actions */}
            <div className="p-4 bg-secondary/60 border-b border-border flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
              <span className="text-xs font-bold text-muted-foreground">
                অফিসিয়াল ম্যাটেরিয়াল এস্টিমেট ভাউচার (BOQ Sheet)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => window.print()}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 mr-1.5" /> প্রিন্ট / PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleWhatsAppSend}
                  className="text-xs text-[#25D366] hover:text-[#1EBE5D] cursor-pointer"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 mr-1.5" /> হোয়াটসঅ্যাপ
                </Button>
              </div>
            </div>

            {/* Printable Sheet */}
            <div
              id="printable-material-sheet"
              className="bg-white text-slate-900 p-8 sm:p-12 shadow-inner font-sans text-xs leading-relaxed mx-auto max-w-[210mm]"
            >
              {/* Header */}
              <div className="border-b-2 border-slate-900 pb-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Image
                      src="/images/logo.png"
                      alt="Triple H"
                      width={64}
                      height={64}
                      className="h-14 w-auto object-contain"
                    />
                    <div>
                      <h1 className="text-xl font-black tracking-tight text-slate-950 uppercase">
                        Triple H Plandraft &amp; Engineering
                      </h1>
                      <p className="text-[10px] font-semibold text-slate-600 tracking-wider uppercase">
                        পরিকল্পিত নকশা, নিরাপদ নির্মাণ • কনসালটেন্সি ও সুপারভিশন
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-slate-700 leading-tight">
                    <p className="font-bold">ইঞ্জিনিয়ার মোঃ হাসমত আলী</p>
                    <p className="text-[10px] text-slate-600">B.Sc. in Civil Engineering (IEB Member)</p>
                    <p className="text-[10px]">📞 01778-506500 | 01631-186218</p>
                    <p className="text-[10px]">নয়াবাড়ী, রেডিও কলোনি, সাভার, ঢাকা</p>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="text-center my-4">
                <h2 className="text-base sm:text-lg font-black uppercase tracking-wide underline">
                  কনস্ট্রাকশন মূল ম্যাটেরিয়াল এস্টিমেট শিট (Bill of Quantities)
                </h2>
                <div className="flex items-center justify-center gap-6 text-[11px] text-slate-600 mt-1">
                  <span>স্মারক নং: <strong>{viewEstimate.estimateNumber}</strong></span>
                  <span>তারিখ: <strong>{format(new Date(viewEstimate.createdAt || new Date()), "dd MMMM, yyyy")}</strong></span>
                </div>
              </div>

              {/* Client & Project */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 border border-slate-200 rounded-sm mb-5 text-[11px]">
                <div>
                  <p><strong>ক্লায়েন্টের নাম:</strong> {viewEstimate.clientName}</p>
                  {viewEstimate.clientPhone && <p><strong>মোবাইল নম্বর:</strong> {viewEstimate.clientPhone}</p>}
                </div>
                <div>
                  <p><strong>প্রজেক্টের নাম:</strong> {viewEstimate.projectTitle}</p>
                  <p>
                    <strong>ভবনের আয়তন:</strong> {viewEstimate.slabArea} sft × {viewEstimate.floors} তলা (মোট {viewEstimate.totalBuiltArea.toLocaleString()} sft)
                  </p>
                </div>
              </div>

              {/* Table */}
              <table className="w-full text-left text-[11px] border border-slate-300 mb-6">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 font-bold">
                    <th className="p-2">মালামালের বিবরণ</th>
                    <th className="p-2">স্পেসিফিকেশন</th>
                    <th className="p-2 text-right">পরিমাণ</th>
                    <th className="p-2 text-right">একক দর</th>
                    <th className="p-2 text-right">মোট টাকা (৳)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2 font-bold">রড (Rebar 500W)</td>
                    <td className="p-2 text-slate-600">১৬মিমি, ১২মিমি, ১০মিমি ও ৮মিমি</td>
                    <td className="p-2 text-right font-bold">{viewEstimate.quantities.rodTons} টন ({viewEstimate.quantities.rodKg.toLocaleString()} kg)</td>
                    <td className="p-2 text-right">৳{viewEstimate.unitRates.rodPerKg}/kg</td>
                    <td className="p-2 text-right font-bold">৳{viewEstimate.costs.rodCost.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold">সিমেন্ট (Cement)</td>
                    <td className="p-2 text-slate-600">ঢালাই ({viewEstimate.quantities.cementCastingBags}) + গাথুনি ({viewEstimate.quantities.cementMasonryBags})</td>
                    <td className="p-2 text-right font-bold">{viewEstimate.quantities.cementBags.toLocaleString()} ব্যাগ</td>
                    <td className="p-2 text-right">৳{viewEstimate.unitRates.cementPerBag}/bag</td>
                    <td className="p-2 text-right font-bold">৳{viewEstimate.costs.cementCost.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold">সিলেট বালু (Coarse)</td>
                    <td className="p-2 text-slate-600">FM 2.5 (ঢালাইয়ের জন্য)</td>
                    <td className="p-2 text-right font-semibold">{viewEstimate.quantities.coarseSandCft.toLocaleString()} cft</td>
                    <td className="p-2 text-right">৳{viewEstimate.unitRates.coarseSandPerCft}/cft</td>
                    <td className="p-2 text-right font-semibold">৳{(viewEstimate.quantities.coarseSandCft * viewEstimate.unitRates.coarseSandPerCft).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold">লোকাল বালু (Local)</td>
                    <td className="p-2 text-slate-600">FM 1.2 (গাথুনি ও প্লাস্টার)</td>
                    <td className="p-2 text-right font-semibold">{viewEstimate.quantities.localSandCft.toLocaleString()} cft</td>
                    <td className="p-2 text-right">৳{viewEstimate.unitRates.localSandPerCft}/cft</td>
                    <td className="p-2 text-right font-semibold">৳{(viewEstimate.quantities.localSandCft * viewEstimate.unitRates.localSandPerCft).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold">খোয়া / পাথর (Aggregate)</td>
                    <td className="p-2 text-slate-600">৩/৪&quot; ডাউন গ্রেডেড চিপস</td>
                    <td className="p-2 text-right font-bold">{viewEstimate.quantities.aggregateCft.toLocaleString()} cft</td>
                    <td className="p-2 text-right">৳{viewEstimate.unitRates.aggregatePerCft}/cft</td>
                    <td className="p-2 text-right font-bold">৳{viewEstimate.costs.aggregateCost.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold">১ম শ্রেণির ইট (Bricks)</td>
                    <td className="p-2 text-slate-600">দেয়াল গাথুনির জন্য</td>
                    <td className="p-2 text-right font-bold">{viewEstimate.quantities.bricksCount.toLocaleString()} টি</td>
                    <td className="p-2 text-right">৳{viewEstimate.unitRates.brickPerPcs}/pc</td>
                    <td className="p-2 text-right font-bold">৳{viewEstimate.costs.brickCost.toLocaleString()}</td>
                  </tr>
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-800 text-xs">
                    <td colSpan={4} className="p-2.5 text-right">সর্বমোট আনুমানিক মালামালের খরচ:</td>
                    <td className="p-2.5 text-right text-sm">৳{viewEstimate.costs.totalMaterialCost.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>

              <p className="text-[10px] text-slate-500 italic mb-10">
                * বিঃদ্রঃ এই প্রাক্কলনটি বাংলাদেশ ন্যাশনাল বিল্ডিং কোড (BNBC) অনুযায়ী তৈরি করা হয়েছে। সাইটের মাটির অবস্থা ও স্ট্রাকচারাল চূড়ান্ত ডিজাইনের উপর ভিত্তি করে পরিমাণের কিছুটা তারতম্য হতে পারে।
              </p>

              {/* Signature */}
              <div className="pt-8 grid grid-cols-2 gap-8 text-center text-[11px]">
                <div>
                  <div className="border-t border-slate-800 pt-1.5 font-bold">
                    হিসাব প্রস্তুতকারী
                  </div>
                  <p className="text-slate-600">Triple H Estimating Team</p>
                </div>
                <div>
                  <div className="border-t border-slate-800 pt-1.5 font-bold">
                    অনুমোদনকারী প্রকৌশলী
                  </div>
                  <p className="text-slate-600">ইঞ্জিনিয়ার মোঃ হাসমত আলী</p>
                  <p className="text-[10px] text-slate-500">Managing Director, Triple H</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
