'use client';

import { useState } from 'react';
import {
  Crown,
  Calculator,
  Compass,
  DollarSign,
  Droplets,
  Layers,
  Zap,
  Printer,
  MessageCircle,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Building,
  ArrowRight,
  TrendingUp,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

type ActiveTab = 'land-far' | 'cashflow' | 'water-tank' | 'septic' | 'room-setback' | 'substation';

export default function ForHasuMasterPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('land-far');

  // ==========================================
  // TAB 1: LAND CONVERTER & RAJUK FAR ENGINE
  // ==========================================
  const [landUnit, setLandUnit] = useState<'katha' | 'decimal' | 'sqft' | 'bigha'>('katha');
  const [landValue, setLandValue] = useState<number>(5); // 5 katha default
  const [roadWidth, setRoadWidth] = useState<number>(25); // 25 ft road
  const [buildingType, setBuildingType] = useState<'residential' | 'commercial' | 'mixed'>('residential');

  // Convert to Sqft
  const landInSqft = (() => {
    switch (landUnit) {
      case 'katha':
        return landValue * 720;
      case 'decimal':
        return landValue * 435.6;
      case 'bigha':
        return landValue * 14400;
      case 'sqft':
      default:
        return landValue;
    }
  })();

  const landInKatha = landInSqft / 720;
  const landInDecimal = landInSqft / 435.6;
  const landInBigha = landInSqft / 14400;
  const landInSqm = landInSqft * 0.092903;

  // Rajuk FAR 2008/2020 Rules Approximation
  // Based on Plot size (katha) and Road Width (ft)
  const farCalculation = (() => {
    let baseFar = 3.15;
    let mgcPercent = 60; // Maximum Ground Coverage %

    if (landInKatha < 3) {
      baseFar = roadWidth >= 20 ? 2.5 : 2.0;
      mgcPercent = 65;
    } else if (landInKatha <= 5) {
      baseFar = roadWidth >= 40 ? 3.5 : roadWidth >= 25 ? 3.15 : 2.75;
      mgcPercent = 62.5;
    } else if (landInKatha <= 10) {
      baseFar = roadWidth >= 60 ? 4.25 : roadWidth >= 30 ? 3.75 : 3.15;
      mgcPercent = 60;
    } else {
      baseFar = roadWidth >= 80 ? 5.5 : roadWidth >= 40 ? 4.5 : 3.5;
      mgcPercent = 55;
    }

    if (buildingType === 'commercial') baseFar += 0.5;

    const maxGroundCoverageSqft = (landInSqft * mgcPercent) / 100;
    const mandatoryOpenSpaceSqft = landInSqft - maxGroundCoverageSqft;
    const totalPermissibleFloorAreaSqft = landInSqft * baseFar;
    const estimatedFloors = Math.floor(totalPermissibleFloorAreaSqft / maxGroundCoverageSqft) + 1;

    return {
      far: baseFar,
      mgcPercent,
      maxGroundCoverageSqft,
      mandatoryOpenSpaceSqft,
      totalPermissibleFloorAreaSqft,
      estimatedFloors,
    };
  })();

  // ==========================================
  // TAB 2: CASH-FLOW & BUDGET PLANNER
  // ==========================================
  const [budgetMode, setBudgetMode] = useState<'total' | 'rate'>('total');
  const [totalBudgetValue, setTotalBudgetValue] = useState<number>(6000000); // 60 Lakh BDT
  const [cfBuildingArea, setCfBuildingArea] = useState<number>(3000); // 3000 sqft
  const [cfRatePerSqft, setCfRatePerSqft] = useState<number>(2200); // 2200 Tk/sqft

  const effectiveBudget = budgetMode === 'total' ? totalBudgetValue : cfBuildingArea * cfRatePerSqft;

  const budgetBreakdown = [
    {
      phase: '১. সয়েল টেস্ট, আর্কিটেকচারাল ও স্ট্রাকচারাল ডিজাইন এবং প্ল্যান পাসিং',
      percent: 3.5,
      amount: effectiveBudget * 0.035,
      timeline: '১ম - ২য় মাস',
      priority: 'অপরিহার্য',
    },
    {
      phase: '২. পাইলিং, মাটি খনন ও সাব-স্ট্রাকচার ফাউন্ডেশন আরসিসি কাজ',
      percent: 22.0,
      amount: effectiveBudget * 0.22,
      timeline: '৩য় - ৪র্থ মাস',
      priority: 'গুরুত্বপূর্ণ',
    },
    {
      phase: '৩. আরসিসি কলাম, গ্রেড বিম ও প্রতিটি ছাদ ঢালাই (সুপার-স্ট্রাকচার)',
      percent: 32.0,
      amount: effectiveBudget * 0.32,
      timeline: '৫ম - ৮ম মাস',
      priority: 'সর্বোচ্চ খরচ',
    },
    {
      phase: '৪. ইটের গাঁথুনি, দেয়াল প্লাস্টার ও বিদ্যুৎ-পানির পাইপ কনসিল',
      percent: 14.5,
      amount: effectiveBudget * 0.145,
      timeline: '৯ম - ১০ম মাস',
      priority: 'মাঝারি',
    },
    {
      phase: '৫. ফ্লোর ও বাথরুম টাইলস, স্যানিটারি ওয়্যার ও বাথরুম ফিটিংস',
      percent: 14.0,
      amount: effectiveBudget * 0.14,
      timeline: '১১তম মাস',
      priority: 'ফিনিশিং',
    },
    {
      phase: '৬. রং, থাই অ্যালুমিনিয়াম গ্লাস, গ্রিল ও কাঠ/দরজা-জানালা',
      percent: 10.0,
      amount: effectiveBudget * 0.1,
      timeline: '১২শ মাস',
      priority: 'ফিনিশিং',
    },
    {
      phase: '৭. অপ্রত্যাশিত সাইট ওভারহেড ও মিসলেনিয়াস ফান্ড',
      percent: 4.0,
      amount: effectiveBudget * 0.04,
      timeline: 'জরুরি ফান্ড',
      priority: 'রিজার্ভ',
    },
  ];

  // ==========================================
  // TAB 3: WATER TANK SIZING (BNBC 2020)
  // ==========================================
  const [tankFlats, setTankFlats] = useState<number>(10);
  const [personsPerFlat, setPersonsPerFlat] = useState<number>(5);
  const [waterPerCapita, setWaterPerCapita] = useState<number>(150); // 150 Liters/day (BNBC residential)
  const [tankBackupDays, setTankBackupDays] = useState<number>(2); // 2 days storage

  const totalResidents = tankFlats * personsPerFlat;
  const dailyWaterDemandLiters = totalResidents * waterPerCapita;
  const totalStorageNeededLiters = dailyWaterDemandLiters * tankBackupDays;
  const totalStorageGallons = totalStorageNeededLiters * 0.219969;

  // Underground Water Reservoir (UGWR) = 70% of storage
  // Overhead Water Tank (OHWT) = 30% of storage
  const ugwrLiters = totalStorageNeededLiters * 0.7;
  const ugwrCft = ugwrLiters / 28.3168; // 1 Cft = 28.317 Liters
  const ugwrDepth = 7; // standard 7 ft depth (effective 6 ft + 1 ft freeboard)
  const ugwrArea = ugwrCft / 6;
  const ugwrWidth = Math.round(Math.sqrt(ugwrArea / 1.5) * 10) / 10;
  const ugwrLength = Math.round((ugwrWidth * 1.5) * 10) / 10;

  const ohwtLiters = totalStorageNeededLiters * 0.3;
  const ohwtCft = ohwtLiters / 28.3168;
  const ohwtDepth = 5; // standard 5 ft depth (4 ft liquid + 1 ft freeboard)
  const ohwtArea = ohwtCft / 4;
  const ohwtWidth = Math.round(Math.sqrt(ohwtArea) * 10) / 10;
  const ohwtLength = ohwtWidth;

  // ==========================================
  // TAB 4: SEPTIC TANK & SOAK-WELL SIZING
  // ==========================================
  const [septicUsers, setSepticUsers] = useState<number>(40);
  const [cleaningIntervalYears, setCleaningIntervalYears] = useState<number>(2);

  // BNBC / IS Code calculation:
  // Liquid volume = 70 L to 90 L per user + Sludge volume (0.03 m3/user/yr)
  const sewagePerDay = septicUsers * 80; // liters
  const sludgeVolumeLiters = septicUsers * 35 * cleaningIntervalYears;
  const septicTotalLiters = sewagePerDay + sludgeVolumeLiters;
  const septicCft = septicTotalLiters / 28.3168;
  const liquidDepth = 5; // 5 ft liquid depth
  const septicFloorArea = septicCft / liquidDepth;
  // Standard L:B is 2.5:1 or 3:1
  const septicWidth = Math.round(Math.sqrt(septicFloorArea / 2.5) * 10) / 10;
  const septicLength = Math.round((septicWidth * 2.5) * 10) / 10;
  const septicTotalDepth = liquidDepth + 1.5; // 1.5 ft freeboard

  // Soak Well sizing:
  // Volume based on 30% of daily sewage absorption
  const soakPitDiameter = 5; // 5 ft diameter circular pit
  const soakPitArea = Math.PI * Math.pow(soakPitDiameter / 2, 2);
  const soakPitDepth = Math.max(10, Math.round((septicCft * 0.4) / soakPitArea));

  // ==========================================
  // TAB 5: ROOM PLANNER & SETBACK RULES
  // ==========================================
  const [plotFrontWidth, setPlotFrontWidth] = useState<number>(45); // ft
  const [plotDepth, setPlotDepth] = useState<number>(65); // ft
  const [setbackRoadWidth, setSetbackRoadWidth] = useState<number>(25); // ft

  const frontSetback = setbackRoadWidth >= 30 ? 5 : 5; // BNBC mandatory min front
  const rearSetback = plotDepth > 60 ? 8 : 6.5;
  const sideSetback1 = 4;
  const sideSetback2 = 4;

  const buildableWidth = Math.max(0, plotFrontWidth - (sideSetback1 + sideSetback2));
  const buildableDepth = Math.max(0, plotDepth - (frontSetback + rearSetback));
  const buildablePlinthArea = buildableWidth * buildableDepth;
  const totalPlotArea = plotFrontWidth * plotDepth;

  // ==========================================
  // TAB 6: SUBSTATION & GENERATOR SIZING
  // ==========================================
  const [subFlats, setSubFlats] = useState<number>(14);
  const [kwPerFlat, setKwPerFlat] = useState<number>(5.5); // 5.5 kW / flat
  const [commonServiceKw, setCommonServiceKw] = useState<number>(18); // Lift, pump, common light
  const [diversityFactor, setDiversityFactor] = useState<number>(0.75);
  const powerFactor = 0.85;

  const totalConnectedKw = subFlats * kwPerFlat + commonServiceKw;
  const maximumDemandKw = totalConnectedKw * diversityFactor;
  const requiredKva = maximumDemandKw / powerFactor;

  // Rule: In DESCO/DPDC/BREB, if connected load > 50 kW, Substation is MANDATORY!
  const isSubstationMandatory = totalConnectedKw > 50;

  // Recommended standard transformer rating
  const recommendedTransformerKva = (() => {
    if (requiredKva <= 50) return 50;
    if (requiredKva <= 100) return 100;
    if (requiredKva <= 150) return 160;
    if (requiredKva <= 200) return 200;
    if (requiredKva <= 250) return 250;
    if (requiredKva <= 315) return 315;
    return 500;
  })();

  const recommendedGeneratorKva = Math.round(
    ((commonServiceKw + subFlats * 1.5) / powerFactor) * 1.15
  );

  const solarRequiredKwp = Math.round(requiredKva * 0.03 * 10) / 10; // 3% of peak for net metering

  // WhatsApp Share function
  const shareCalculationOnWhatsApp = () => {
    let text = `*ট্রিপল এইচ ইঞ্জিনিয়ারিং কনসালটেন্সি*\n*ইঞ্জিনিয়ার মোঃ হাসমত আলী (প্রতিষ্ঠাতা ও প্রধান পরামর্শক)*\n\n`;

    if (activeTab === 'land-far') {
      text += `📐 *জমি পরিমাপ ও রাজউক FAR রিপোর্ট:*\n`;
      text += `• জমির পরিমাণ: ${landValue} ${landUnit} (${Math.round(landInSqft)} বর্গফুট / ${landInKatha.toFixed(2)} কাঠা)\n`;
      text += `• রাস্তার প্রশস্ততা: ${roadWidth} ফুট\n`;
      text += `• অনুমোদনযোগ্য FAR: ${farCalculation.far}\n`;
      text += `• সর্বোচ্চ গ্রাউন্ড কভারেজ (MGC): ${farCalculation.mgcPercent}%\n`;
      text += `• মোট অনুমোদনযোগ্য ফ্লোর স্পেস: ${Math.round(farCalculation.totalPermissibleFloorAreaSqft)} বর্গফুট\n`;
      text += `• সম্ভাব্য বৈধ তলা সংখ্যা: ~${farCalculation.estimatedFloors} তলা\n`;
    } else if (activeTab === 'cashflow') {
      text += `💰 *বাড়ি নির্মাণের বাজেট ও ক্যাশ-ফ্লো রিপোর্ট:*\n`;
      text += `• মোট প্রাক্কলিত বাজেট: ৳ ${effectiveBudget.toLocaleString('en-BD')}\n`;
      budgetBreakdown.forEach((b) => {
        text += `• ${b.phase.split('(')[0]}: ৳ ${Math.round(b.amount).toLocaleString('en-BD')} (${b.percent}%)\n`;
      });
    } else if (activeTab === 'water-tank') {
      text += `💧 *পানির ট্যাঙ্ক সাইজিং রিপোর্ট (BNBC):*\n`;
      text += `• ফ্ল্যাট সংখ্যা: ${tankFlats} টি (${totalResidents} জন বাসিন্দা)\n`;
      text += `• মোট দৈনিক পানির চাহিদা: ${dailyWaterDemandLiters} লিটার\n`;
      text += `• আন্ডারগ্রাউন্ড রিজার্ভার (UGWR): ${ugwrLength}' × ${ugwrWidth}' × ${ugwrDepth}' (${Math.round(ugwrLiters)} লিটার)\n`;
      text += `• ছাদের ওভারহেড ট্যাঙ্ক (OHWT): ${ohwtLength}' × ${ohwtWidth}' × ${ohwtDepth}' (${Math.round(ohwtLiters)} লিটার)\n`;
    } else if (activeTab === 'septic') {
      text += `🚽 *সেপটিক ট্যাঙ্ক ও সোক-ওয়েল সাইজ:*\n`;
      text += `• মোট ব্যবহারকারী: ${septicUsers} জন\n`;
      text += `• সেপটিক ট্যাঙ্ক মাপ: ${septicLength}' (দৈর্ঘ্য) × ${septicWidth}' (প্রস্থ) × ${septicTotalDepth}' (গভীরতা)\n`;
      text += `• সোক-ওয়েল মাপ: ${soakPitDiameter}' ব্যাস × ${soakPitDepth}' গভীরতা\n`;
    } else if (activeTab === 'room-setback') {
      text += `📏 *BNBC সেটব্যাক ও রুম সাইজ গাইড:*\n`;
      text += `• প্লট মাপ: ${plotFrontWidth}' × ${plotDepth}' (${totalPlotArea} sft)\n`;
      text += `• বাধ্যতামূলক ফাঁকা জায়গা: সামনে ${frontSetback}', পেছনে ${rearSetback}', দুই পাশে ${sideSetback1}' করে\n`;
      text += `• নির্মাণযোগ্য প্লিন্থ মাপ: ${buildableWidth}' × ${buildableDepth}' (${buildablePlinthArea} sft)\n`;
    } else if (activeTab === 'substation') {
      text += `⚡ *সাবস্টেশন ও জেনারেটর ক্ষমতা রিপোর্ট:*\n`;
      text += `• ফ্ল্যাট সংখ্যা: ${subFlats} টি (মোট কানেক্টেড লোড: ${totalConnectedKw.toFixed(1)} kW)\n`;
      text += `• সাবস্টেশন প্রয়োজন: ${isSubstationMandatory ? 'হ্যাঁ (বাধ্যতামূলক, >৫০ kW)' : 'প্রয়োজন নেই'}\n`;
      text += `• প্রস্তাবিত ট্রান্সফরমার: ${recommendedTransformerKva} kVA\n`;
      text += `• প্রস্তাবিত ব্যাকআপ জেনারেটর: ${recommendedGeneratorKva} kVA\n`;
    }

    text += `\n📞 কনসালটেন্সি ও ড্রয়িং যোগাযোগ: 01778-506500\n🌐 triple-h-engineering.vercel.app`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Executive Header */}
      <div className="bg-gradient-to-r from-slate-900 via-primary/95 to-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden border border-primary/30">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-400 text-slate-950 font-bold px-2.5 py-0.5 text-xs flex items-center gap-1.5 shadow">
                <Crown className="w-3.5 h-3.5" /> FOR HASU
              </Badge>
              <span className="text-xs text-amber-200/90 font-medium tracking-wide">
                Chief Engineer&apos;s Master Suite
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white font-serif">
              ইঞ্জিনিয়ার হাসমত আলীর ডিজিটাল ইঞ্জিনিয়ারিং ক্যালকুলেটর
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              রাজউক FAR, ক্যাশ-ফ্লো বাজেট, পানির ট্যাঙ্ক, সেপটিক ট্যাঙ্ক, সেটব্যাক ও সাবস্টেশন হিসাবের সমন্বিত মাস্টার ড্যাশবোর্ড
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={shareCalculationOnWhatsApp}
              className="bg-emerald-600 hover:bg-emerald-700 text-white border-none gap-1.5 text-xs"
            >
              <MessageCircle className="w-4 h-4" /> হোয়াটসঅ্যাপে শেয়ার
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.print()}
              className="gap-1.5 text-xs bg-white/10 hover:bg-white/20 text-white border border-white/20"
            >
              <Printer className="w-4 h-4" /> প্রিন্ট রিপোর্ট
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {[
          { id: 'land-far', label: 'জমি ও রাজউক FAR', icon: Compass, color: 'text-amber-500' },
          { id: 'cashflow', label: 'ক্যাশ-ফ্লো বাজেট', icon: DollarSign, color: 'text-emerald-500' },
          { id: 'water-tank', label: 'পানির ট্যাঙ্ক মাপ', icon: Droplets, color: 'text-blue-500' },
          { id: 'septic', label: 'সেপটিক ও সোক-ওয়েল', icon: Layers, color: 'text-purple-500' },
          { id: 'room-setback', label: 'রুম সাইজ ও সেটব্যাক', icon: Sliders, color: 'text-rose-500' },
          { id: 'substation', label: 'সাবস্টেশন ও জেনারেটর', icon: Zap, color: 'text-yellow-500' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                isActive
                  ? 'bg-card border-primary shadow-md ring-2 ring-primary/20'
                  : 'bg-card/50 border-border hover:bg-card hover:border-border/80 text-muted-foreground'
              }`}
            >
              <div className="flex justify-between items-center w-full">
                <Icon className={`w-5 h-5 ${tab.color}`} />
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                )}
              </div>
              <span className={`text-xs font-bold mt-2 ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: LAND MEASUREMENT & RAJUK FAR CALCULATOR */}
      {/* ========================================================================= */}
      {activeTab === 'land-far' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Inputs */}
            <Card className="lg:col-span-5">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Compass className="w-5 h-5 text-amber-500" />
                  জমির পরিমাপ ও রাস্তার ইনপুট
                </CardTitle>
                <CardDescription className="text-xs">
                  জমির মাপ ও রাস্তার চওড়া দিয়ে রাজউক FAR হিসাব করুন
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-2 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">জমির পরিমাণ</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={landValue}
                      onChange={(e) => setLandValue(Number(e.target.value) || 0)}
                      className="font-bold text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">পরিমাপের একক</Label>
                    <select
                      value={landUnit}
                      onChange={(e) => setLandUnit(e.target.value as any)}
                      className="w-full h-9 bg-background border border-border rounded-md px-3 text-xs"
                    >
                      <option value="katha">কাঠা (Katha)</option>
                      <option value="decimal">শতক (Decimal)</option>
                      <option value="sqft">বর্গফুট (Sq.ft)</option>
                      <option value="bigha">বিঘা (Bigha)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-semibold">সামনের রাস্তার প্রশস্ততা (ফুট)</Label>
                    <span className="text-xs font-bold text-primary">{roadWidth} ফুট রাস্তা</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={roadWidth}
                    onChange={(e) => setRoadWidth(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>১০&apos; (সরু গলি)</span>
                    <span>২৫&apos; (আবাসিক)</span>
                    <span>৪০&apos; (প্রধান সড়ক)</span>
                    <span>১০০&apos; (এভিনিউ)</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">ইমারতের ধরণ (Building Type)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'residential', label: 'আবাসিক' },
                      { id: 'mixed', label: 'মিক্সড-ইউজ' },
                      { id: 'commercial', label: 'বাণিজ্যিক' },
                    ].map((t) => (
                      <Button
                        key={t.id}
                        type="button"
                        size="sm"
                        variant={buildingType === t.id ? 'default' : 'outline'}
                        onClick={() => setBuildingType(t.id as any)}
                        className="text-xs h-8"
                      >
                        {t.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Conversion Matrix */}
                <div className="p-3 bg-muted/40 rounded-xl space-y-1.5 text-xs border border-border">
                  <span className="font-bold text-muted-foreground text-[11px] uppercase">
                    লাইভ ইউনিট কনভার্সন:
                  </span>
                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                    <div>• {landInKatha.toFixed(2)} কাঠা</div>
                    <div>• {landInDecimal.toFixed(2)} শতক</div>
                    <div>• {Math.round(landInSqft).toLocaleString()} বর্গফুট</div>
                    <div>• {landInSqm.toFixed(1)} বর্গমিটার</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results & FAR Engine */}
            <Card className="lg:col-span-7 border-amber-500/30">
              <CardHeader className="p-5 pb-3 bg-amber-50/40 dark:bg-amber-950/10 border-b border-border">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base font-bold text-amber-900 dark:text-amber-300">
                    রাজউক FAR ও ইমারত নির্মাণ ফলাফল
                  </CardTitle>
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 font-mono">
                    FAR {farCalculation.far}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-card border rounded-xl space-y-1">
                    <span className="text-[11px] text-muted-foreground">অনুমোদনযোগ্য FAR</span>
                    <div className="text-xl font-black text-foreground font-mono">{farCalculation.far}</div>
                    <span className="text-[10px] text-muted-foreground">রাস্তা {roadWidth} ফুট ভিত্তিক</span>
                  </div>
                  <div className="p-3 bg-card border rounded-xl space-y-1">
                    <span className="text-[11px] text-muted-foreground">ম্যাক্সিমাম গ্রাউন্ড কভারেজ</span>
                    <div className="text-xl font-black text-foreground font-mono">{farCalculation.mgcPercent}%</div>
                    <span className="text-[10px] text-muted-foreground">MGC অনুমোদিত হার</span>
                  </div>
                  <div className="p-3 bg-card border rounded-xl space-y-1">
                    <span className="text-[11px] text-muted-foreground">সম্ভাব্য সর্বোচ্চ তলা</span>
                    <div className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">
                      ~{farCalculation.estimatedFloors} তলা
                    </div>
                    <span className="text-[10px] text-muted-foreground">গ্রাউন্ড সহ সম্ভাব্য তলা</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs border rounded-xl p-4 bg-muted/20">
                  <div className="flex justify-between py-1.5 border-b border-border">
                    <span className="text-muted-foreground">মোট জমির পরিমাণ:</span>
                    <span className="font-bold">{Math.round(landInSqft).toLocaleString()} বর্গফুট ({landInKatha.toFixed(2)} কাঠা)</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border">
                    <span className="text-muted-foreground">গ্রাউন্ডে সর্বোচ্চ নির্মাণযোগ্য জায়গা (MGC):</span>
                    <span className="font-bold text-foreground">
                      {Math.round(farCalculation.maxGroundCoverageSqft).toLocaleString()} বর্গফুট
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border">
                    <span className="text-muted-foreground">গ্রাউন্ডে বাধ্যতামূলক উন্মুক্ত ফাঁকা জায়গা:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {Math.round(farCalculation.mandatoryOpenSpaceSqft).toLocaleString()} বর্গফুট ({100 - farCalculation.mgcPercent}%)
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 text-sm font-bold bg-amber-500/10 p-2 rounded text-amber-900 dark:text-amber-300">
                    <span>মোট বৈধ বিল্ট-আপ ফ্লোর এরিয়া (Total Floor Space):</span>
                    <span className="font-mono">{Math.round(farCalculation.totalPermissibleFloorAreaSqft).toLocaleString()} বর্গফুট</span>
                  </div>
                </div>

                <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-900 text-xs space-y-1 text-blue-900 dark:text-blue-300">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    ইঞ্জিনিয়ার হাসমত আলীর বিশেষ পরামর্শ:
                  </div>
                  <p className="text-[11px] leading-relaxed text-blue-800/80 dark:text-blue-300/80">
                    রাস্তার প্রশস্ততা ২০ ফুটের কম হলে সর্বোচ্চ তলা সংখ্যা ও FAR সীমিত থাকে। রাস্তার মাপ ২৫ ফুট বা তদূর্ধ্ব হলে বোনাস FAR সুবিধা এবং সেটব্যাকের ছাড় পাওয়া যায়। এছাড়া রেইন ওয়াটার হার্ভেস্টিং ও গ্রিন রুফ রাখলে পরিবেশ ছাড়পত্র দ্রুত মেলে।
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CASH-FLOW & BUDGET PLANNER */}
      {/* ========================================================================= */}
      {activeTab === 'cashflow' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-4">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                  বাজেট নির্ধারণ করুন
                </CardTitle>
                <CardDescription className="text-xs">
                  মোট বাজেট অথবা স্কয়ারফুট রেট অনুযায়ী খরচের স্তর নির্ধারণ
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-2 space-y-4">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={budgetMode === 'total' ? 'default' : 'outline'}
                    onClick={() => setBudgetMode('total')}
                    className="text-xs flex-1"
                  >
                    মোট বাজেট দিয়ে
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={budgetMode === 'rate' ? 'default' : 'outline'}
                    onClick={() => setBudgetMode('rate')}
                    className="text-xs flex-1"
                  >
                    স্কয়ারফুট রেট দিয়ে
                  </Button>
                </div>

                {budgetMode === 'total' ? (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">প্রাক্কলিত মোট বাজেট (টাকা)</Label>
                    <Input
                      type="number"
                      step="50000"
                      value={totalBudgetValue}
                      onChange={(e) => setTotalBudgetValue(Number(e.target.value) || 0)}
                      className="font-bold font-mono text-sm"
                    />
                    <span className="text-[11px] text-muted-foreground">
                      = ৳ {(totalBudgetValue / 100000).toFixed(2)} লাখ টাকা
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">মোট ভবনের আয়তন (বর্গফুট)</Label>
                      <Input
                        type="number"
                        value={cfBuildingArea}
                        onChange={(e) => setCfBuildingArea(Number(e.target.value) || 0)}
                        className="font-mono text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">প্রতি বর্গফুট নির্মাণ রেট (টাকা)</Label>
                      <Input
                        type="number"
                        value={cfRatePerSqft}
                        onChange={(e) => setCfRatePerSqft(Number(e.target.value) || 0)}
                        className="font-mono text-sm"
                      />
                    </div>
                    <div className="p-2.5 bg-muted rounded text-xs font-semibold text-foreground">
                      হিসাবকৃত বাজেট: ৳ {(effectiveBudget / 100000).toFixed(2)} লাখ
                    </div>
                  </div>
                )}

                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-1">
                  <span className="text-xs text-muted-foreground">সর্বমোট বাজেট রোডম্যাপ:</span>
                  <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
                    ৳ {effectiveBudget.toLocaleString('en-BD')}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Breakdown Table */}
            <Card className="lg:col-span-8">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-base font-bold">ধাপভিত্তিক ক্যাশ-ফ্লো ও আর্থিক বরাদ্দ</CardTitle>
                <CardDescription className="text-xs">
                  কোন ধাপে কত শতাংশ ও কত টাকার ফান্ড প্রস্তুত রাখতে হবে তার নিখুঁত পরিকল্পনা
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/60 uppercase text-muted-foreground border-b text-[10px]">
                      <tr>
                        <th className="px-4 py-3">নির্মাণ ধাপ</th>
                        <th className="px-3 py-3">সময়সীমা</th>
                        <th className="px-3 py-3">বরাদ্দ %</th>
                        <th className="px-4 py-3 text-right">প্রাক্কলিত খরচ (টাকা)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {budgetBreakdown.map((b, i) => (
                        <tr key={i} className="hover:bg-muted/20">
                          <td className="px-4 py-3 font-medium">
                            <div>{b.phase}</div>
                            <span className="text-[10px] text-muted-foreground">{b.priority}</span>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-muted-foreground font-mono">
                            {b.timeline}
                          </td>
                          <td className="px-3 py-3 font-bold font-mono text-primary">
                            {b.percent}%
                          </td>
                          <td className="px-4 py-3 text-right font-black font-mono text-foreground">
                            ৳ {Math.round(b.amount).toLocaleString('en-BD')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: WATER TANK SIZING (BNBC 2020) */}
      {/* ========================================================================= */}
      {activeTab === 'water-tank' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-5">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-blue-500" />
                  পানির চাহিদার ইনপুট
                </CardTitle>
                <CardDescription className="text-xs">
                  বিএনবিসি (BNBC 2020) কোড অনুযায়ী প্রতি ব্যক্তি দৈনিক ১৫০ লিটার হিসাব
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-2 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">ফ্ল্যাটের সংখ্যা</Label>
                    <Input
                      type="number"
                      value={tankFlats}
                      onChange={(e) => setTankFlats(Number(e.target.value) || 1)}
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">প্রতি ফ্ল্যাটে সদস্য</Label>
                    <Input
                      type="number"
                      value={personsPerFlat}
                      onChange={(e) => setPersonsPerFlat(Number(e.target.value) || 1)}
                      className="font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">প্রতি ব্যক্তি চাহিদা (L/day)</Label>
                    <Input
                      type="number"
                      value={waterPerCapita}
                      onChange={(e) => setWaterPerCapita(Number(e.target.value) || 150)}
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">ব্যাকআপ দিন (Storage Days)</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={tankBackupDays}
                      onChange={(e) => setTankBackupDays(Number(e.target.value) || 1)}
                      className="font-mono"
                    />
                  </div>
                </div>

                <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">মোট নিয়মিত বাসিন্দা:</span>
                    <span className="font-bold">{totalResidents} জন</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">দৈনিক মোট পানির চাহিদা:</span>
                    <span className="font-bold font-mono">{dailyWaterDemandLiters.toLocaleString()} লিটার</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-blue-700 dark:text-blue-400 pt-1 border-t border-blue-200 dark:border-blue-800">
                    <span>প্রয়োজনীয় মোট স্টোরেজ:</span>
                    <span className="font-mono">{totalStorageNeededLiters.toLocaleString()} লিটার ({Math.round(totalStorageGallons)} গ্যালন)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results: UGWR & OHWT Dimensions */}
            <div className="lg:col-span-7 space-y-4">
              {/* Underground Reservoir */}
              <Card className="border-blue-500/30">
                <CardHeader className="p-4 pb-2 bg-blue-50/30 dark:bg-blue-950/10 border-b">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-bold text-blue-900 dark:text-blue-300">
                      ১. আন্ডারগ্রাউন্ড রিজার্ভার (UGWR - ৭০% স্টোরেজ)
                    </CardTitle>
                    <Badge className="bg-blue-600 text-white font-mono text-xs">
                      {Math.round(ugwrLiters).toLocaleString()} লিটার
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-2.5 bg-muted/40 rounded-lg">
                      <span className="text-[10px] text-muted-foreground">দৈর্ঘ্য (Length)</span>
                      <div className="text-lg font-black font-mono">{ugwrLength} ফুট</div>
                    </div>
                    <div className="p-2.5 bg-muted/40 rounded-lg">
                      <span className="text-[10px] text-muted-foreground">প্রস্থ (Width)</span>
                      <div className="text-lg font-black font-mono">{ugwrWidth} ফুট</div>
                    </div>
                    <div className="p-2.5 bg-muted/40 rounded-lg">
                      <span className="text-[10px] text-muted-foreground">মোট গভীরতা</span>
                      <div className="text-lg font-black font-mono">{ugwrDepth} ফুট</div>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    *কার্যকর তরল গভীরতা ৬ ফুট + ১ ফুট ফ্রি-বোর্ড সহ প্রস্তাবিত আরসিসি ট্যাংক সাইজ।
                  </p>
                </CardContent>
              </Card>

              {/* Overhead Water Tank */}
              <Card className="border-emerald-500/30">
                <CardHeader className="p-4 pb-2 bg-emerald-50/30 dark:bg-emerald-950/10 border-b">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-bold text-emerald-900 dark:text-emerald-300">
                      ২. ছাদের ওভারহেড পানির ট্যাঙ্ক (OHWT - ৩০% স্টোরেজ)
                    </CardTitle>
                    <Badge className="bg-emerald-600 text-white font-mono text-xs">
                      {Math.round(ohwtLiters).toLocaleString()} লিটার
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-2.5 bg-muted/40 rounded-lg">
                      <span className="text-[10px] text-muted-foreground">দৈর্ঘ্য (Length)</span>
                      <div className="text-lg font-black font-mono">{ohwtLength} ফুট</div>
                    </div>
                    <div className="p-2.5 bg-muted/40 rounded-lg">
                      <span className="text-[10px] text-muted-foreground">প্রস্থ (Width)</span>
                      <div className="text-lg font-black font-mono">{ohwtWidth} ফুট</div>
                    </div>
                    <div className="p-2.5 bg-muted/40 rounded-lg">
                      <span className="text-[10px] text-muted-foreground">মোট গভীরতা</span>
                      <div className="text-lg font-black font-mono">{ohwtDepth} ফুট</div>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    *ছাদের লোড কমাতে ও নিয়মিত পাম্পিং সুবিধা নিশ্চিত করতে এই মাপ বিএনবিসি স্ট্যান্ডার্ড মেনে তৈরি।
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SEPTIC TANK & SOAK-WELL */}
      {/* ========================================================================= */}
      {activeTab === 'septic' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-5">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers className="w-5 h-5 text-purple-500" />
                  ব্যবহারকারী ইনপুট
                </CardTitle>
                <CardDescription className="text-xs">
                  বাসিন্দার সংখ্যা ও ক্লিনিং সময়কাল অনুযায়ী সেপটিক চেম্বার সাইজিং
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-2 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">ব্যবহারকারী সংখ্যা (Persons)</Label>
                  <Input
                    type="number"
                    value={septicUsers}
                    onChange={(e) => setSepticUsers(Number(e.target.value) || 1)}
                    className="font-bold text-sm"
                  />
                  <span className="text-[10px] text-muted-foreground">
                    পরিবারের সদস্য বা ফ্ল্যাটের মোট বাসিন্দা সংখ্যা
                  </span>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">স্ল্যাজ ক্লিনিং সময়কাল (Cleaning Interval)</Label>
                  <select
                    value={cleaningIntervalYears}
                    onChange={(e) => setCleaningIntervalYears(Number(e.target.value))}
                    className="w-full h-9 bg-background border border-border rounded-md px-3 text-xs"
                  >
                    <option value={1}>১ বছর পর পর পরিষ্কার</option>
                    <option value={2}>২ বছর পর পর পরিষ্কার (প্রস্তাবিত)</option>
                    <option value={3}>৩ বছর পর পর পরিষ্কার</option>
                  </select>
                </div>

                <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 rounded-xl space-y-1 text-xs">
                  <span className="text-muted-foreground">প্রয়োজনীয় মোট কার্যকর ভলিউম:</span>
                  <div className="text-xl font-black text-purple-700 dark:text-purple-400 font-mono">
                    {Math.round(septicTotalLiters).toLocaleString()} লিটার ({Math.round(septicCft)} Cft)
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dimensions */}
            <Card className="lg:col-span-7">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-base font-bold">সেপটিক ট্যাঙ্ক ও সোক-ওয়েলের নকশা মাপ</CardTitle>
                <CardDescription className="text-xs">
                  ২ বা ৩ চেম্বার বিশিষ্ট আরসিসি সেপটিক ট্যাঙ্ক ও ফিল্টার সোক-ওয়েল সাইজ
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-muted/40 rounded-xl">
                    <span className="text-[11px] text-muted-foreground">দৈর্ঘ্য (Length)</span>
                    <div className="text-xl font-black font-mono">{septicLength} ফুট</div>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-xl">
                    <span className="text-[11px] text-muted-foreground">প্রস্থ (Width)</span>
                    <div className="text-xl font-black font-mono">{septicWidth} ফুট</div>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-xl">
                    <span className="text-[11px] text-muted-foreground">মোট গভীরতা</span>
                    <div className="text-xl font-black font-mono">{septicTotalDepth} ফুট</div>
                  </div>
                </div>

                <div className="border rounded-xl p-4 bg-card space-y-2 text-xs">
                  <div className="font-bold text-foreground">সোক-ওয়েল (Soak Pit / Seepage Pit) সুপারিশ:</div>
                  <div className="grid grid-cols-2 gap-2 text-muted-foreground pt-1">
                    <div>• সোক-ওয়েল ব্যাস (Diameter): <strong>{soakPitDiameter} ফুট</strong></div>
                    <div>• সোক-ওয়েল গভীরতা: <strong>{soakPitDepth} ফুট</strong></div>
                    <div>• ফিল্টার মিডিয়া: ইটের খোয়া ও বালু (Graded Sand)</div>
                    <div>• ইনলেট/আউটলেট ফল: ৩ ইঞ্চি স্লোপ</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: ROOM PLANNER & SETBACK RULES */}
      {/* ========================================================================= */}
      {activeTab === 'room-setback' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-5">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-rose-500" />
                  প্লট সাইজ ও রাস্তার মাপ
                </CardTitle>
                <CardDescription className="text-xs">
                  বিএনবিসি বাধ্যতামূলক সেটব্যাক রুলস অনুযায়ী নির্মাণযোগ্য এরিয়া নির্ধারণ
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-2 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">প্লটের সামনের চওড়া (ফুট)</Label>
                    <Input
                      type="number"
                      value={plotFrontWidth}
                      onChange={(e) => setPlotFrontWidth(Number(e.target.value) || 0)}
                      className="font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">প্লটের গভীরতা (ফুট)</Label>
                    <Input
                      type="number"
                      value={plotDepth}
                      onChange={(e) => setPlotDepth(Number(e.target.value) || 0)}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">সামনের রাস্তার চওড়া (ফুট)</Label>
                  <Input
                    type="number"
                    value={setbackRoadWidth}
                    onChange={(e) => setSetbackRoadWidth(Number(e.target.value) || 20)}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="p-3 bg-muted/40 rounded-xl space-y-1 text-xs border">
                  <span className="font-bold text-muted-foreground">বাধ্যতামূলক সেটব্যাক ছাড়:</span>
                  <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                    <div>• সামনে: <strong>{frontSetback} ফুট</strong></div>
                    <div>• পেছনে: <strong>{rearSetback} ফুট</strong></div>
                    <div>• বাম পাশে: <strong>{sideSetback1} ফুট</strong></div>
                    <div>• ডান পাশে: <strong>{sideSetback2} ফুট</strong></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-7">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-base font-bold">নির্মাণযোগ্য ফুটপ্রিন্ট ও প্রমিত রুম সাইজ</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-xl">
                    <span className="text-[11px] text-muted-foreground">কার্যকর নির্মাণযোগ্য মাপ</span>
                    <div className="text-xl font-black font-mono text-foreground">
                      {buildableWidth}&apos; × {buildableDepth}&apos;
                    </div>
                  </div>
                  <div className="p-3 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-xl">
                    <span className="text-[11px] text-muted-foreground">প্লিন্থ এরিয়া (Buildable Footprint)</span>
                    <div className="text-xl font-black font-mono text-rose-600 dark:text-rose-400">
                      {buildablePlinthArea.toLocaleString()} sft
                    </div>
                  </div>
                </div>

                <div className="border rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-muted text-muted-foreground uppercase text-[10px]">
                      <tr>
                        <th className="px-3 py-2">রুমের ধরণ</th>
                        <th className="px-3 py-2">প্রমিত সাইজ (L × W)</th>
                        <th className="px-3 py-2">ক্ষেত্রফল (sft)</th>
                        <th className="px-3 py-2">ভেন্টিলেশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr>
                        <td className="px-3 py-2 font-medium">মাস্টার বেডরুম</td>
                        <td className="px-3 py-2 font-mono">১৪&apos; × ১২&apos;</td>
                        <td className="px-3 py-2 font-bold font-mono">১৬৮ sft</td>
                        <td className="px-3 py-2 text-muted-foreground">১৫% জানালা এরিয়া</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-medium">কমন বেডরুম</td>
                        <td className="px-3 py-2 font-mono">১২&apos; × ১১&apos;</td>
                        <td className="px-3 py-2 font-bold font-mono">১৩২ sft</td>
                        <td className="px-3 py-2 text-muted-foreground">১২% জানালা</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-medium">লিভিং / ড্রয়িং রুম</td>
                        <td className="px-3 py-2 font-mono">১৬&apos; × ১৪&apos;</td>
                        <td className="px-3 py-2 font-bold font-mono">২২৪ sft</td>
                        <td className="px-3 py-2 text-muted-foreground">খোলামেলা ডাবল উইন্ডো</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-medium">কিচেন / রান্নাঘর</td>
                        <td className="px-3 py-2 font-mono">১০&apos; × ৮&apos;</td>
                        <td className="px-3 py-2 font-bold font-mono">৮০ sft</td>
                        <td className="px-3 py-2 text-muted-foreground">২০% ভেন্টিলেশন + এক্সহস্ট</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-medium">টয়লেট / বাথরুম</td>
                        <td className="px-3 py-2 font-mono">৭&apos; × ৫&apos;</td>
                        <td className="px-3 py-2 font-bold font-mono">৩৫ sft</td>
                        <td className="px-3 py-2 text-muted-foreground">লুভার উইন্ডো</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: SUBSTATION & GENERATOR SIZING */}
      {/* ========================================================================= */}
      {activeTab === 'substation' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-5">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  ভবনের বৈদ্যুতিক লোড ইনপুট
                </CardTitle>
                <CardDescription className="text-xs">
                  ডেসকো / ডিপিডিসি ও বিআরইবি রুলস অনুযায়ী সাবস্টেশন নির্ণয়
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-2 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">ফ্ল্যাট সংখ্যা</Label>
                    <Input
                      type="number"
                      value={subFlats}
                      onChange={(e) => setSubFlats(Number(e.target.value) || 1)}
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">প্রতি ফ্ল্যাট লোড (kW)</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={kwPerFlat}
                      onChange={(e) => setKwPerFlat(Number(e.target.value) || 1)}
                      className="font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">কমন সার্ভিস (kW)</Label>
                    <Input
                      type="number"
                      value={commonServiceKw}
                      onChange={(e) => setCommonServiceKw(Number(e.target.value) || 0)}
                      className="font-mono"
                    />
                    <span className="text-[10px] text-muted-foreground">লিফট, পানির পাম্প ও লাইট</span>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">ডাইভারসিটি ফ্যাক্টর</Label>
                    <Input
                      type="number"
                      step="0.05"
                      value={diversityFactor}
                      onChange={(e) => setDiversityFactor(Number(e.target.value) || 0.75)}
                      className="font-mono"
                    />
                  </div>
                </div>

                <div className="p-4 bg-muted/40 rounded-xl space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">মোট কানেক্টেড লোড:</span>
                    <span className="font-bold font-mono">{totalConnectedKw.toFixed(1)} kW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">সর্বোচ্চ পিক ডিমান্ড:</span>
                    <span className="font-bold font-mono">{maximumDemandKw.toFixed(1)} kW</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-primary pt-1 border-t">
                    <span>প্রয়োজনীয় ট্রান্সফরমার রেটিং:</span>
                    <span className="font-mono">{requiredKva.toFixed(1)} kVA</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-7">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-base font-bold">সাবস্টেশন ও জেনারেটর ক্ষমতা সুপারিশ</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {/* Substation Warning Badge */}
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
                    isSubstationMandatory
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-900 dark:text-amber-300'
                      : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-900 dark:text-emerald-300'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-xs flex items-center gap-1.5">
                      {isSubstationMandatory ? (
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      )}
                      সাবস্টেশন স্ট্যাটাস:
                    </div>
                    <p className="text-xs">
                      {isSubstationMandatory
                        ? 'মোট লোড ৫০ কিলোওয়াট অতিক্রম করায় সরকারি বিধি অনুযায়ী নিজস্ব সাবস্টেশন বাধ্যতামূলক!'
                        : 'লোড ৫০ কিলোওয়াটের নিচে থাকায় আলাদা সাবস্টেশন ছাড়াই সরাসরি এলটি কানেকশন পাওয়া সম্ভব।'}
                    </p>
                  </div>
                  <Badge className={isSubstationMandatory ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'}>
                    {isSubstationMandatory ? 'বাধ্যতামূলক' : 'ঐচ্ছিক'}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-muted/40 rounded-xl">
                    <span className="text-[10px] text-muted-foreground">প্রস্তাবিত ট্রান্সফরমার</span>
                    <div className="text-xl font-black font-mono text-primary">
                      {recommendedTransformerKva} kVA
                    </div>
                    <span className="text-[9px] text-muted-foreground">11/0.415 kV HT/LT</span>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-xl">
                    <span className="text-[10px] text-muted-foreground">ব্যাকআপ জেনারেটর (DG)</span>
                    <div className="text-xl font-black font-mono text-foreground">
                      {recommendedGeneratorKva} kVA
                    </div>
                    <span className="text-[9px] text-muted-foreground">স্ট্যান্ডবাই জরুরি লোড</span>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-xl">
                    <span className="text-[10px] text-muted-foreground">ছাদে সোলার প্যানেল</span>
                    <div className="text-xl font-black font-mono text-foreground">
                      {solarRequiredKwp} kWp
                    </div>
                    <span className="text-[9px] text-muted-foreground">নেট মিটারিং কমপ্লায়েন্স</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
