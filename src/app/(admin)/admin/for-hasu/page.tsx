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
  Flame,
  Sun,
  CloudRain,
  ShieldAlert,
  Activity,
  Footprints,
  Globe,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

type ActiveTab =
  | 'land-far'
  | 'cashflow'
  | 'water-tank'
  | 'septic'
  | 'room-setback'
  | 'substation'
  | 'staircase'
  | 'earthquake'
  | 'crack-diagnosis'
  | 'rainwater'
  | 'fire-safety'
  | 'solar';

export default function ForHasuMasterPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('land-far');

  // ==========================================
  // TAB 1: LAND CONVERTER & RAJUK FAR ENGINE
  // ==========================================
  const [landUnit, setLandUnit] = useState<'katha' | 'decimal' | 'sqft' | 'bigha'>('katha');
  const [landValue, setLandValue] = useState<number>(5);
  const [roadWidth, setRoadWidth] = useState<number>(25);
  const [buildingType, setBuildingType] = useState<'residential' | 'commercial' | 'mixed'>('residential');

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

  const farCalculation = (() => {
    let baseFar = 3.15;
    let mgcPercent = 60;

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
  const [totalBudgetValue, setTotalBudgetValue] = useState<number>(6000000);
  const [cfBuildingArea, setCfBuildingArea] = useState<number>(3000);
  const [cfRatePerSqft, setCfRatePerSqft] = useState<number>(2200);

  const effectiveBudget = budgetMode === 'total' ? totalBudgetValue : cfBuildingArea * cfRatePerSqft;

  const budgetBreakdown = [
    { phase: '১. সয়েল টেস্ট, আর্কিটেকচারাল ও স্ট্রাকচারাল ডিজাইন এবং প্ল্যান পাসিং', percent: 3.5, amount: effectiveBudget * 0.035, timeline: '১ম - ২য় মাস', priority: 'অপরিহার্য' },
    { phase: '২. পাইলিং, মাটি খনন ও সাব-স্ট্রাকচার ফাউন্ডেশন আরসিসি কাজ', percent: 22.0, amount: effectiveBudget * 0.22, timeline: '৩য় - ৪র্থ মাস', priority: 'গুরুত্বপূর্ণ' },
    { phase: '৩. আরসিসি কলাম, গ্রেড বিম ও প্রতিটি ছাদ ঢালাই (সুপার-স্ট্রাকচার)', percent: 32.0, amount: effectiveBudget * 0.32, timeline: '৫ম - ৮ম মাস', priority: 'সর্বোচ্চ খরচ' },
    { phase: '৪. ইটের গাঁথুনি, দেয়াল প্লাস্টার ও বিদ্যুৎ-পানির পাইপ কনসিল', percent: 14.5, amount: effectiveBudget * 0.145, timeline: '৯ম - ১০ম মাস', priority: 'মাঝারি' },
    { phase: '৫. ফ্লোর ও বাথরুম টাইলস, স্যানিটারি ওয়্যার ও বাথরুম ফিটিংস', percent: 14.0, amount: effectiveBudget * 0.14, timeline: '১১তম মাস', priority: 'ফিনিশিং' },
    { phase: '৬. রং, থাই অ্যালুমিনিয়াম গ্লাস, গ্রিল ও কাঠ/দরজা-জানালা', percent: 10.0, amount: effectiveBudget * 0.1, timeline: '১২শ মাস', priority: 'ফিনিশিং' },
    { phase: '৭. অপ্রত্যাশিত সাইট ওভারহেড ও মিসলেনিয়াস ফান্ড', percent: 4.0, amount: effectiveBudget * 0.04, timeline: 'জরুরি ফান্ড', priority: 'রিজার্ভ' },
  ];

  // ==========================================
  // TAB 3: WATER TANK SIZING (BNBC 2020)
  // ==========================================
  const [tankFlats, setTankFlats] = useState<number>(10);
  const [personsPerFlat, setPersonsPerFlat] = useState<number>(5);
  const [waterPerCapita, setWaterPerCapita] = useState<number>(150);
  const [tankBackupDays, setTankBackupDays] = useState<number>(2);

  const totalResidents = tankFlats * personsPerFlat;
  const dailyWaterDemandLiters = totalResidents * waterPerCapita;
  const totalStorageNeededLiters = dailyWaterDemandLiters * tankBackupDays;
  const totalStorageGallons = totalStorageNeededLiters * 0.219969;

  const ugwrLiters = totalStorageNeededLiters * 0.7;
  const ugwrCft = ugwrLiters / 28.3168;
  const ugwrDepth = 7;
  const ugwrArea = ugwrCft / 6;
  const ugwrWidth = Math.round(Math.sqrt(ugwrArea / 1.5) * 10) / 10;
  const ugwrLength = Math.round((ugwrWidth * 1.5) * 10) / 10;

  const ohwtLiters = totalStorageNeededLiters * 0.3;
  const ohwtCft = ohwtLiters / 28.3168;
  const ohwtDepth = 5;
  const ohwtArea = ohwtCft / 4;
  const ohwtWidth = Math.round(Math.sqrt(ohwtArea) * 10) / 10;
  const ohwtLength = ohwtWidth;

  // ==========================================
  // TAB 4: SEPTIC TANK & SOAK-WELL SIZING
  // ==========================================
  const [septicUsers, setSepticUsers] = useState<number>(40);
  const [cleaningIntervalYears, setCleaningIntervalYears] = useState<number>(2);

  const sewagePerDay = septicUsers * 80;
  const sludgeVolumeLiters = septicUsers * 35 * cleaningIntervalYears;
  const septicTotalLiters = sewagePerDay + sludgeVolumeLiters;
  const septicCft = septicTotalLiters / 28.3168;
  const liquidDepth = 5;
  const septicFloorArea = septicCft / liquidDepth;
  const septicWidth = Math.round(Math.sqrt(septicFloorArea / 2.5) * 10) / 10;
  const septicLength = Math.round((septicWidth * 2.5) * 10) / 10;
  const septicTotalDepth = liquidDepth + 1.5;

  const soakPitDiameter = 5;
  const soakPitArea = Math.PI * Math.pow(soakPitDiameter / 2, 2);
  const soakPitDepth = Math.max(10, Math.round((septicCft * 0.4) / soakPitArea));

  // ==========================================
  // TAB 5: ROOM PLANNER & SETBACK RULES
  // ==========================================
  const [plotFrontWidth, setPlotFrontWidth] = useState<number>(45);
  const [plotDepth, setPlotDepth] = useState<number>(65);
  const [setbackRoadWidth, setSetbackRoadWidth] = useState<number>(25);

  const frontSetback = 5;
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
  const [kwPerFlat, setKwPerFlat] = useState<number>(5.5);
  const [commonServiceKw, setCommonServiceKw] = useState<number>(18);
  const [diversityFactor, setDiversityFactor] = useState<number>(0.75);
  const powerFactor = 0.85;

  const totalConnectedKw = subFlats * kwPerFlat + commonServiceKw;
  const maximumDemandKw = totalConnectedKw * diversityFactor;
  const requiredKva = maximumDemandKw / powerFactor;
  const isSubstationMandatory = totalConnectedKw > 50;

  const recommendedTransformerKva = (() => {
    if (requiredKva <= 50) return 50;
    if (requiredKva <= 100) return 100;
    if (requiredKva <= 150) return 160;
    if (requiredKva <= 200) return 200;
    if (requiredKva <= 250) return 250;
    if (requiredKva <= 315) return 315;
    return 500;
  })();

  const recommendedGeneratorKva = Math.round(((commonServiceKw + subFlats * 1.5) / powerFactor) * 1.15);
  const solarRequiredKwp = Math.round(requiredKva * 0.03 * 10) / 10;

  // ==========================================
  // TAB 7: STAIRCASE RISER & TREAD (BNBC)
  // ==========================================
  const [floorHeightFt, setFloorHeightFt] = useState<number>(10); // 10 ft
  const [riserInches, setRiserInches] = useState<number>(6); // 6 inches
  const [treadInches, setTreadInches] = useState<number>(10); // 10 inches
  const [stairWidthFt, setStairWidthFt] = useState<number>(3.5); // 3.5 ft flight width
  const [landingWidthFt, setLandingWidthFt] = useState<number>(3.5); // 3.5 ft landing

  const totalFloorHeightInches = floorHeightFt * 12;
  const totalRisers = Math.round(totalFloorHeightInches / riserInches);
  const exactRiserInches = Math.round((totalFloorHeightInches / totalRisers) * 100) / 100;
  const totalTreads = totalRisers - 1;
  const risersPerFlight = Math.ceil(totalRisers / 2);
  const treadsPerFlight = risersPerFlight - 1;
  const flightRunFt = Math.round(((treadsPerFlight * treadInches) / 12) * 10) / 10;
  const stairRoomLengthFt = flightRunFt + landingWidthFt + 3.5; // flight run + mid-landing + floor landing
  const stairRoomWidthFt = stairWidthFt * 2 + 0.5; // 2 flights + 6" stair eye gap

  // BNBC Comfort Formula: 2R + T = 24" - 25"
  const comfortFormulaValue = 2 * exactRiserInches + treadInches;
  const isComfortIdeal = comfortFormulaValue >= 23.5 && comfortFormulaValue <= 25.5;
  const stairAngleDeg = Math.round((Math.atan(exactRiserInches / treadInches) * (180 / Math.PI)) * 10) / 10;

  // ==========================================
  // TAB 8: BANGLADESH SEISMIC & EARTHQUAKE
  // ==========================================
  const [selectedDistrict, setSelectedDistrict] = useState<string>('dhaka');
  const [soilCategory, setSoilCategory] = useState<'SC' | 'SD' | 'SE'>('SD');
  const [occupancyCat, setOccupancyCat] = useState<'standard' | 'essential'>('standard');

  const SEISMIC_DISTRICTS: Record<string, { name: string; zone: number; zValue: number; risk: string; note: string }> = {
    dhaka: { name: 'ঢাকা (Dhaka)', zone: 2, zValue: 0.20, risk: 'মাঝারি ঝুঁকি (Moderate Risk)', note: 'মধুপুর কাদা মাটি ও বালু' },
    sylhet: { name: 'সিলেট (Sylhet)', zone: 4, zValue: 0.36, risk: 'সর্বোচ্চ ঝুঁকিপূর্ণ (Severe Seismic Zone)', note: 'ডাউকি ফল্টের নিকটবর্তী' },
    chittagong: { name: 'চট্টগ্রাম (Chittagong)', zone: 3, zValue: 0.28, risk: 'উচ্চ ঝুঁকি (High Risk)', note: 'পাহাড় ও উপকূলীয় ফল্ট লাইন' },
    coxsbazar: { name: 'কক্সবাজার (Cox\'s Bazar)', zone: 3, zValue: 0.28, risk: 'উচ্চ ঝুঁকি (High Risk)', note: 'উপকূলীয় সিসমিক বেল্ট' },
    mymensingh: { name: 'ময়মনসিংহ (Mymensingh)', zone: 3, zValue: 0.28, risk: 'উচ্চ ঝুঁকি (High Risk)', note: 'ব্রহ্মপুত্র বেসিন ও ফল্ট' },
    rangpur: { name: 'রংপুর (Rangpur)', zone: 3, zValue: 0.28, risk: 'উচ্চ ঝুঁকি (High Risk)', note: 'উত্তরাঞ্চলীয় ভূ-তাত্ত্বিক ফল্ট' },
    khulna: { name: 'খুলনা (Khulna)', zone: 1, zValue: 0.12, risk: 'নিম্ন ঝুঁকি (Low Risk)', note: 'উপকূলীয় ডেল্টা পলি' },
    barisal: { name: 'বরিশাল (Barisal)', zone: 1, zValue: 0.12, risk: 'নিম্ন ঝুঁকি (Low Risk)', note: 'নরম পলল মৃত্তিকা' },
    rajshahi: { name: 'রাজশাহী (Rajshahi)', zone: 2, zValue: 0.20, risk: 'মাঝারি ঝুঁকি (Moderate Risk)', note: 'বরেন্দ্র অঞ্চলের শক্ত মাটি' },
    comilla: { name: 'কুমিল্লা (Comilla)', zone: 2, zValue: 0.20, risk: 'মাঝারি ঝুঁকি (Moderate Risk)', note: 'ত্রিপুরা সীমান্ত সংলগ্ন' },
  };

  const currentSeismic = SEISMIC_DISTRICTS[selectedDistrict] || SEISMIC_DISTRICTS['dhaka'];
  const importanceFactor = occupancyCat === 'essential' ? 1.25 : 1.0;

  // ==========================================
  // TAB 9: BUILDING CRACK DIAGNOSIS
  // ==========================================
  const [crackLocation, setCrackLocation] = useState<'beam' | 'column' | 'slab' | 'masonry' | 'lintel' | 'foundation'>('beam');
  const [crackPattern, setCrackPattern] = useState<'diagonal' | 'vertical' | 'horizontal' | 'map'>('diagonal');
  const [crackWidthMm, setCrackWidthMm] = useState<number>(2.0);

  const crackAnalysis = (() => {
    if (crackLocation === 'column') {
      return {
        cause: 'কলামে অতিরিক্ত অক্ষীয় চাপ (Overload) বা কংক্রিট ক্রাশিং। এটি কাঠামোগতভাবে অত্যন্ত ঝুঁকিপূর্ণ!',
        riskLevel: '🔴 উচ্চ ঝুঁকি (Critical)',
        riskColor: 'bg-red-500/10 text-red-700 border-red-500/30',
        retrofit: 'তাৎক্ষণিক সাইট সাপোর্ট প্রপ বসানো, আল্ট্রাসনিক টেস্ট এবং আরসিসি/স্টিল জ্যাকেটিং বা CFRP র্যাপিং।',
      };
    }
    if (crackLocation === 'beam') {
      if (crackPattern === 'diagonal') {
        return {
          cause: 'বিমের প্রান্তে ৪৫-ডিগ্রি শিয়ার ক্র্যাক (Shear Crack)। অপর্যাপ্ত রডের টাই বা অতিরিক্ত পয়েন্ট লোড।',
          riskLevel: '🔴 উচ্চ ঝুঁকি (Severe)',
          riskColor: 'bg-red-500/10 text-red-700 border-red-500/30',
          retrofit: 'বিমের প্রান্তে অতিরিক্ত স্টিল প্লেট এনকোরিং, ইপক্সি গ্রাউটিং এবং কার্বন ফাইবার শিট বন্ধনী।',
        };
      }
      return {
        cause: 'বিমের মাঝখানে ফ্লেক্সারাল ক্র্যাক (Flexural Tension Crack)। অতিরিক্ত ডিফ্লেকশন বা রডের ঘাটতি।',
        riskLevel: '🟡 মাঝারি ঝুঁকি (Warning)',
        riskColor: 'bg-amber-500/10 text-amber-700 border-amber-500/30',
        retrofit: 'লাইভ লোড কমানো এবং তলায় স্টিল চ্যানেল বা এক্সটারনাল পোস্ট-টেনশনিং সাপোর্ট।',
      };
    }
    if (crackLocation === 'foundation') {
      return {
        cause: 'ফাউন্ডেশনের ডিফারেনশিয়াল সেটেলমেন্ট (Differential Settlement) বা পাইলিং দুর্বলতা।',
        riskLevel: '🔴 অত্যন্ত বিপজ্জনক (High Risk)',
        riskColor: 'bg-red-500/10 text-red-700 border-red-500/30',
        retrofit: 'সয়েল টেস্ট পুনঃযাচাই, কেমিক্যাল গ্রাউটিং বা মাইক্রোপাইল আন্ডারপিনিং (Micropile Underpinning)।',
      };
    }
    if (crackLocation === 'masonry') {
      return {
        cause: 'তাপমাত্রার পরিবর্তন, প্লাস্টারের কিউরিং ঘাটতি বা দেয়ালের স্বাভাবিক সংকোচন (Shrinkage)।',
        riskLevel: '🟢 সাধারণ ঝুঁকি (Cosmetic)',
        riskColor: 'bg-green-500/10 text-green-700 border-green-500/30',
        retrofit: 'ফাটল ভি-গ্রুভ (V-groove) করে পলিমার মডিফাইড ক্র্যাক ফিলিং পুটি ও ফাইবার মেশ দিয়ে প্লাস্টার মেরামত।',
      };
    }
    return {
      cause: 'কংক্রিটের প্লাস্টিক শ্রিঙ্কেজ বা স্ল্যাবের টেম্পারেচার রডের দূরত্ব বেশি হওয়া।',
      riskLevel: '🟡 পর্যবেক্ষণ প্রয়োজন (Moderate)',
      riskColor: 'bg-amber-500/10 text-amber-700 border-amber-500/30',
      retrofit: 'প্রেসার ইপক্সি গ্রাউটিং এবং ওয়াটারপ্রুফিং কোটিং।',
    };
  })();

  // ==========================================
  // TAB 10: RAINWATER HARVESTING
  // ==========================================
  const [roofAreaSqft, setRoofAreaSqft] = useState<number>(2000);
  const [rainfallMm, setRainfallMm] = useState<number>(2200); // 2200 mm/year (Dhaka average)
  const runoffCoeff = 0.85; // RCC flat roof
  const filterEfficiency = 0.9; // 90%

  // Formula: Harvested Water (Liters) = Area (sq.m) × Rainfall (mm) × Runoff × Filter
  const roofAreaSqm = roofAreaSqft * 0.092903;
  const annualHarvestLiters = Math.round(roofAreaSqm * rainfallMm * runoffCoeff * filterEfficiency);
  const monthlyAverageHarvest = Math.round(annualHarvestLiters / 12);
  const rwhStorageTankLiters = Math.round(annualHarvestLiters * 0.15); // 15% annual capture storage tank

  // ==========================================
  // TAB 11: FIRE SAFETY & FIRE NOC CHECKLIST
  // ==========================================
  const [buildingHeightMeters, setBuildingHeightMeters] = useState<number>(24); // 8-story ~ 24m
  const [buildingOccupancy, setBuildingOccupancy] = useState<'residential' | 'commercial'>('residential');

  const isHighRiseFireCode = buildingHeightMeters > 20; // BNBC > 20m is High-Rise
  const fireStairWidthMeters = isHighRiseFireCode ? 1.5 : 1.25; // 5 ft vs 4 ft
  const fireReservoirLiters = isHighRiseFireCode ? 50000 : 30000; // 50k Liters mandatory
  const isSprinklerMandatory = buildingHeightMeters > 33 || buildingOccupancy === 'commercial'; // > 10 stories

  // ==========================================
  // TAB 12: ROOFTOP SOLAR & NET METERING
  // ==========================================
  const [solarUsableAreaSqft, setSolarUsableAreaSqft] = useState<number>(800);
  const [panelWattage, setPanelWattage] = useState<number>(550); // 550W Mono PERC
  const [electricityTariffTk, setElectricityTariffTk] = useState<number>(11.5); // Tk/unit

  const panelSizeSqft = 26.5; // ~2.2m × 1.13m
  const totalPanels = Math.floor(solarUsableAreaSqft / panelSizeSqft);
  const totalSolarKwp = Math.round(((totalPanels * panelWattage) / 1000) * 10) / 10;
  const dailySolarUnits = Math.round(totalSolarKwp * 4.2 * 10) / 10; // 4.2 peak sun hours in BD
  const monthlySolarUnits = Math.round(dailySolarUnits * 30);
  const monthlySavingsTk = Math.round(monthlySolarUnits * electricityTariffTk);
  const estimatedSolarCostTk = totalSolarKwp * 65000; // ~65,000 Tk/kWp on-grid
  const paybackYears = Math.round((estimatedSolarCostTk / (monthlySavingsTk * 12)) * 10) / 10;

  // WhatsApp Share master function
  const shareCalculationOnWhatsApp = () => {
    let text = `*ট্রিপল এইচ ইঞ্জিনিয়ারিং কনসালটেন্সি*\n*ইঞ্জিনিয়ার মোঃ হাসমত আলী (AUST)*\n\n`;

    if (activeTab === 'land-far') {
      text += `📐 *জমি পরিমাপ ও রাজউক FAR রিপোর্ট:*\n• জমির পরিমাণ: ${landValue} ${landUnit} (${Math.round(landInSqft)} sft / ${landInKatha.toFixed(2)} কাঠা)\n• রাস্তার মাপ: ${roadWidth} ফুট\n• অনুমোদনযোগ্য FAR: ${farCalculation.far}\n• সর্বোচ্চ গ্রাউন্ড কভারেজ: ${farCalculation.mgcPercent}%\n• মোট অনুমোদনযোগ্য ফ্লোর স্পেস: ${Math.round(farCalculation.totalPermissibleFloorAreaSqft)} sft\n• সম্ভাব্য তলা: ~${farCalculation.estimatedFloors} তলা\n`;
    } else if (activeTab === 'cashflow') {
      text += `💰 *বাড়ি নির্মাণের বাজেট রোডম্যাপ:*\n• মোট প্রাক্কলিত বাজেট: ৳ ${effectiveBudget.toLocaleString('en-BD')}\n`;
      budgetBreakdown.forEach((b) => {
        text += `• ${b.phase.split('(')[0]}: ৳ ${Math.round(b.amount).toLocaleString('en-BD')} (${b.percent}%)\n`;
      });
    } else if (activeTab === 'water-tank') {
      text += `💧 *পানির ট্যাঙ্ক সাইজিং রিপোর্ট:*\n• ফ্ল্যাট সংখ্যা: ${tankFlats} (${totalResidents} জন)\n• মোট দৈনিক চাহিদা: ${dailyWaterDemandLiters} লিটার\n• আন্ডারগ্রাউন্ড রিজার্ভার: ${ugwrLength}' × ${ugwrWidth}' × ${ugwrDepth}' (${Math.round(ugwrLiters)} L)\n• ছাদের ওভারহেড ট্যাঙ্ক: ${ohwtLength}' × ${ohwtWidth}' × ${ohwtDepth}' (${Math.round(ohwtLiters)} L)\n`;
    } else if (activeTab === 'septic') {
      text += `🚽 *সেপটিক ট্যাঙ্ক ও সোক-ওয়েল সাইজ:*\n• মোট ব্যবহারকারী: ${septicUsers} জন\n• সেপটিক ট্যাঙ্ক মাপ: ${septicLength}' × ${septicWidth}' × ${septicTotalDepth}'\n• সোক-ওয়েল মাপ: ${soakPitDiameter}' ব্যাস × ${soakPitDepth}' গভীরতা\n`;
    } else if (activeTab === 'room-setback') {
      text += `📏 *BNBC সেটব্যাক ও রুম সাইজ:*\n• প্লট মাপ: ${plotFrontWidth}' × ${plotDepth}' (${totalPlotArea} sft)\n• ছাড়: সামনে ${frontSetback}', পেছনে ${rearSetback}', দুই পাশে ${sideSetback1}' করে\n• প্লিন্থ এরিয়া: ${buildableWidth}' × ${buildableDepth}' (${buildablePlinthArea} sft)\n`;
    } else if (activeTab === 'substation') {
      text += `⚡ *সাবস্টেশন ও জেনারেটর ক্ষমতা:*\n• ফ্ল্যাট সংখ্যা: ${subFlats} (মোট লোড: ${totalConnectedKw.toFixed(1)} kW)\n• সাবস্টেশন প্রয়োজন: ${isSubstationMandatory ? 'হ্যাঁ (বাধ্যতামূলক, >৫০ kW)' : 'প্রয়োজন নেই'}\n• প্রস্তাবিত ট্রান্সফরমার: ${recommendedTransformerKva} kVA\n• ব্যাকআপ জেনারেটর: ${recommendedGeneratorKva} kVA\n`;
    } else if (activeTab === 'staircase') {
      text += `🏢 *সিঁড়ির মাপ ও ধাপ হিসাব (BNBC):*\n• ফ্লোর হাইট: ${floorHeightFt} ফুট (${totalFloorHeightInches} ইঞ্চি)\n• মোট রাইজার: ${totalRisers} টি (${exactRiserInches}" প্রতিটি)\n• ট্রেড: ${treadInches} ইঞ্চি (ধাপ কোণ: ${stairAngleDeg}°)\n• প্রস্তাবিত সিঁড়ি ঘর মাপ: ${stairRoomWidthFt}' (প্রস্থ) × ${stairRoomLengthFt}' (দৈর্ঘ্য)\n• কমফোর্ট ইনডেক্স: ${isComfortIdeal ? 'আদর্শ ও আরামদায়ক' : 'পর্যবেক্ষণ প্রয়োজন'}\n`;
    } else if (activeTab === 'earthquake') {
      text += `🌍 *সিসমিক জোন ও ভূমিকম্প ডিজাইন (BNBC 2020):*\n• জেলা: ${currentSeismic.name}\n• সিসমিক জোন: জোন ${currentSeismic.zone} (Z = ${currentSeismic.zValue})\n• ঝুঁকি স্তর: ${currentSeismic.risk}\n• বাধ্যবাধকতা: কলাম-বিম টাই রডে ১৩৫° হুক ও ৪" স্পেসিং\n`;
    } else if (activeTab === 'crack-diagnosis') {
      text += `🔍 *বিল্ডিং ক্র্যাক ডায়াগনোসিস রিপোর্ট:*\n• ফাটলের অবস্থান: ${crackLocation.toUpperCase()}\n• ঝুঁকি স্তর: ${crackAnalysis.riskLevel}\n• সম্ভাব্য কারণ: ${crackAnalysis.cause}\n• প্রস্তাবিত সমাধান: ${crackAnalysis.retrofit}\n`;
    } else if (activeTab === 'rainwater') {
      text += `🌧️ *ছাদের বৃষ্টির পানি সংরক্ষণ হিসাব:*\n• ছাদের আয়তন: ${roofAreaSqft} sft\n• বার্ষিক সংগ্রহযোগ্য পানি: ${annualHarvestLiters.toLocaleString()} লিটার\n• প্রস্তাবিত রেইন ওয়াটার ট্যাঙ্ক: ${rwhStorageTankLiters.toLocaleString()} লিটার\n`;
    } else if (activeTab === 'fire-safety') {
      text += `🚒 *ফায়ার সেফটি ও এনওসি গাইড (BNBC):*\n• ভবনের উচ্চতা: ${buildingHeightMeters} মিটার (${isHighRiseFireCode ? 'হাই-রাইজ' : 'মিড-রাইজ'})\n• ফায়ার সিঁড়ি চওড়া: ন্যূনতম ${fireStairWidthMeters} মিটার (৫ ফুট)\n• ফায়ার রিজার্ভার: ${fireReservoirLiters.toLocaleString()} লিটার\n• স্প্রিংকলার বাধ্যবাধকতা: ${isSprinklerMandatory ? 'হ্যাঁ (বাধ্যতামূলক)' : 'ঐচ্ছিক'}\n`;
    } else if (activeTab === 'solar') {
      text += `☀️ *ছাদের সোলার ও নেট মিটারিং রিপোর্ট:*\n• ব্যবহারযোগ্য ছাদ: ${solarUsableAreaSqft} sft (${totalPanels} টি ৫৫০W প্যানেল)\n• মোট ক্ষমতা: ${totalSolarKwp} kWp\n• মাসিক বিদ্যুৎ উৎপাদন: ~${monthlySolarUnits} ইউনিট\n• মাসিক বিদ্যুৎ বিল সাশ্রয়: ~৳ ${monthlySavingsTk.toLocaleString('en-BD')}\n• পে-ব্যাক সময়: ~${paybackYears} বছর\n`;
    }

    text += `\n📞 কনসালটেন্সি ও ড্রয়িং: 01778-506500 | 01631-186218\n🌐 triple-h-engineering.vercel.app`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24">
      {/* Executive Header */}
      <div className="bg-gradient-to-r from-slate-900 via-primary/95 to-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden border border-primary/30">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-400 text-slate-950 font-bold px-2.5 py-0.5 text-xs flex items-center gap-1.5 shadow">
                <Crown className="w-3.5 h-3.5" /> FOR HASU
              </Badge>
              <span className="text-xs text-amber-200/90 font-medium tracking-wide">
                Chief Consultant&apos;s Engineering Super Suite
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white font-serif">
              ইঞ্জিনিয়ার হাসমত আলীর কমপ্লিট ইঞ্জিনিয়ারিং টুলকিট
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-3xl leading-relaxed">
              রাজউক FAR, বাজেট, পানির ট্যাঙ্ক, সেপটিক, সেটব্যাক, সাবস্টেশন, সিঁড়ি, ভূমিকম্প জোন, ক্র্যাক অডিট, রেইনওয়াটার, ফায়ার সেফটি ও সোলার — মোট ১২টি পাওয়ারফুল ইঞ্জিন
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={shareCalculationOnWhatsApp}
              className="bg-emerald-600 hover:bg-emerald-700 text-white border-none gap-1.5 text-xs shadow"
            >
              <MessageCircle className="w-4 h-4" /> হোয়াটসঅ্যাপে পাঠান
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.print()}
              className="gap-1.5 text-xs bg-white/10 hover:bg-white/20 text-white border border-white/20"
            >
              <Printer className="w-4 h-4" /> প্রিন্ট শিট
            </Button>
          </div>
        </div>
      </div>

      {/* 12-Tool Segmented Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {[
          { id: 'land-far', label: '১. জমি ও রাজউক FAR', icon: Compass, color: 'text-amber-500' },
          { id: 'cashflow', label: '২. ক্যাশ-ফ্লো বাজেট', icon: DollarSign, color: 'text-emerald-500' },
          { id: 'water-tank', label: '৩. পানির ট্যাঙ্ক মাপ', icon: Droplets, color: 'text-blue-500' },
          { id: 'septic', label: '৪. সেপটিক ও সোক-ওয়েল', icon: Layers, color: 'text-purple-500' },
          { id: 'room-setback', label: '৫. রুম সাইজ ও সেটব্যাক', icon: Sliders, color: 'text-rose-500' },
          { id: 'substation', label: '৬. সাবস্টেশন ও জেনারেটর', icon: Zap, color: 'text-yellow-500' },
          { id: 'staircase', label: '৭. সিঁড়ির মাপ ও ধাপ', icon: Footprints, color: 'text-cyan-500' },
          { id: 'earthquake', label: '৮. সিসমিক ও ভূমিকম্প', icon: Globe, color: 'text-orange-500' },
          { id: 'crack-diagnosis', label: '৯. ক্র্যাক ও ফাটল অডিট', icon: ShieldAlert, color: 'text-red-500' },
          { id: 'rainwater', label: '১০. বৃষ্টির পানি সংরক্ষণ', icon: CloudRain, color: 'text-teal-500' },
          { id: 'fire-safety', label: '১১. ফায়ার সেফটি ও NOC', icon: Flame, color: 'text-amber-600' },
          { id: 'solar', label: '১২. ছাদের সোলার পাওয়ার', icon: Sun, color: 'text-yellow-600' },
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
                <Icon className={`w-4 h-4 ${tab.color}`} />
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                )}
              </div>
              <span className={`text-[11px] font-bold mt-2 truncate ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: LAND & FAR */}
      {/* ========================================================================= */}
      {activeTab === 'land-far' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CASHFLOW */}
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
      {/* TAB 3: WATER TANK */}
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
                    <span className="font-mono">{totalStorageNeededLiters.toLocaleString()} লিটার</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="lg:col-span-7 space-y-4">
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
      {/* TAB 4: SEPTIC TANK */}
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
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">স্ল্যাজ ক্লিনিং সময়কাল</Label>
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

            <Card className="lg:col-span-7">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-base font-bold">সেপটিক ট্যাঙ্ক ও সোক-ওয়েলের নকশা মাপ</CardTitle>
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
                    <div>• সোক-ওয়েল ব্যাস: <strong>{soakPitDiameter} ফুট</strong></div>
                    <div>• সোক-ওয়েল গভীরতা: <strong>{soakPitDepth} ফুট</strong></div>
                    <div>• ফিল্টার মিডিয়া: ইটের খোয়া ও বালু</div>
                    <div>• ইনলেট/আউটলেট ফল: ৩ ইঞ্চি স্লোপ</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: ROOM PLANNER & SETBACK */}
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
                    <span className="text-[11px] text-muted-foreground">প্লিন্থ এরিয়া</span>
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
                        <td className="px-3 py-2 text-muted-foreground">২০% ভেন্টিলেশন</td>
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
      {/* TAB 6: SUBSTATION & GENERATOR */}
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
                    <span className="text-[9px] text-muted-foreground">স্ট্যান্ডবাই লোড</span>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-xl">
                    <span className="text-[10px] text-muted-foreground">ছাদে সোলার প্যানেল</span>
                    <div className="text-xl font-black font-mono text-foreground">
                      {solarRequiredKwp} kWp
                    </div>
                    <span className="text-[9px] text-muted-foreground">নেট মিটারিং</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: STAIRCASE RISER & TREAD CALCULATOR */}
      {/* ========================================================================= */}
      {activeTab === 'staircase' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-5">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Footprints className="w-5 h-5 text-cyan-500" />
                  সিঁড়ির উচ্চতা ও ধাপ ইনপুট
                </CardTitle>
                <CardDescription className="text-xs">
                  বিএনবিসি (BNBC) কমফোর্ট রুল: 2R + T = 24&quot; থেকে 25&quot;
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-2 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">ফ্লোর টু ফ্লোর উচ্চতা (ফুট)</Label>
                  <Input
                    type="number"
                    step="0.25"
                    value={floorHeightFt}
                    onChange={(e) => setFloorHeightFt(Number(e.target.value) || 10)}
                    className="font-mono text-sm"
                  />
                  <span className="text-[11px] text-muted-foreground">
                    মোট উচ্চতা = {totalFloorHeightInches} ইঞ্চি
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">প্রস্তাবিত রাইজার (Riser In)</Label>
                    <select
                      value={riserInches}
                      onChange={(e) => setRiserInches(Number(e.target.value))}
                      className="w-full h-9 bg-background border border-border rounded-md px-3 text-xs"
                    >
                      <option value={5.5}>৫.৫ ইঞ্চি (খুব আরামদায়ক)</option>
                      <option value={5.75}>৫.৭৫ ইঞ্চি</option>
                      <option value={6}>৬.০ ইঞ্চি (স্ট্যান্ডার্ড)</option>
                      <option value={6.25}>৬.২৫ ইঞ্চি</option>
                      <option value={6.5}>৬.৫ ইঞ্চি</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">ট্রেড বা পা ফেলার জায়গা (In)</Label>
                    <select
                      value={treadInches}
                      onChange={(e) => setTreadInches(Number(e.target.value))}
                      className="w-full h-9 bg-background border border-border rounded-md px-3 text-xs"
                    >
                      <option value={10}>১০ ইঞ্চি (স্ট্যান্ডার্ড)</option>
                      <option value={10.5}>১০.৫ ইঞ্চি</option>
                      <option value={11}>১১ ইঞ্চি</option>
                      <option value={12}>১২ ইঞ্চি</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">সিঁড়ির ফ্লাইট চওড়া (ফুট)</Label>
                    <Input
                      type="number"
                      step="0.25"
                      value={stairWidthFt}
                      onChange={(e) => setStairWidthFt(Number(e.target.value) || 3.5)}
                      className="font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">ল্যান্ডিং চওড়া (ফুট)</Label>
                    <Input
                      type="number"
                      step="0.25"
                      value={landingWidthFt}
                      onChange={(e) => setLandingWidthFt(Number(e.target.value) || 3.5)}
                      className="font-mono text-xs"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-7">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-base font-bold">সিঁড়ি ঘরের সাইজ ও কমফোর্ট রেজাল্ট</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-muted/40 rounded-xl">
                    <span className="text-[10px] text-muted-foreground">মোট রাইজার সংখ্যা</span>
                    <div className="text-xl font-black font-mono text-cyan-600 dark:text-cyan-400">
                      {totalRisers} টি
                    </div>
                    <span className="text-[9px] text-muted-foreground">{exactRiserInches}&quot; করে</span>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-xl">
                    <span className="text-[10px] text-muted-foreground">প্রতি ফ্লাইটে ট্রেড</span>
                    <div className="text-xl font-black font-mono text-foreground">
                      {treadsPerFlight} টি
                    </div>
                    <span className="text-[9px] text-muted-foreground">২ ফ্লাইটের সিঁড়ি</span>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-xl">
                    <span className="text-[10px] text-muted-foreground">সিঁড়ির ঢাল (Angle)</span>
                    <div className="text-xl font-black font-mono text-foreground">
                      {stairAngleDeg}°
                    </div>
                    <span className="text-[9px] text-muted-foreground">৩০°-৩৫° আদর্শ</span>
                  </div>
                </div>

                <div className="p-4 bg-cyan-50/40 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-900 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-cyan-900 dark:text-cyan-300">প্রস্তাবিত সিঁড়ি ঘরের অভ্যন্তরীণ সাইজ:</span>
                    <Badge className="bg-cyan-600 text-white font-mono text-xs">
                      {stairRoomWidthFt}&apos; × {stairRoomLengthFt}&apos;
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    *দুই ফ্লাইটের মাঝখানে ৬ ইঞ্চি ফাঁকা জায়গা (Stair Eye), ৩&apos;-৬&quot; মিড-ল্যান্ডিং এবং ফ্লোর ল্যান্ডিং সহ হিসাবকৃত।
                  </p>
                  <div className="flex items-center gap-2 pt-1 border-t border-cyan-200 dark:border-cyan-800">
                    <span className="text-[11px]">BNBC কমফোর্ট রুল (2R + T = {comfortFormulaValue.toFixed(1)}&quot;):</span>
                    <Badge variant="outline" className={isComfortIdeal ? 'text-green-700 bg-green-50' : 'text-amber-700 bg-amber-50'}>
                      {isComfortIdeal ? '✅ আদর্শ ও আরামদায়ক' : '⚠️ খাড়া বা সতর্কতামূলক'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: EARTHQUAKE & SEISMIC DETAILING */}
      {/* ========================================================================= */}
      {activeTab === 'earthquake' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-5">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="w-5 h-5 text-orange-500" />
                  সিসমিক জোন ইনপুট (BNBC 2020)
                </CardTitle>
                <CardDescription className="text-xs">
                  জেলা অনুযায়ী সিসমিক জোন কো-এফিশিয়েন্ট (Z-Value) ও বাধ্যবাধকতা
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-2 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">প্রজেক্টের জেলা নির্বাচন করুন</Label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full h-9 bg-background border border-border rounded-md px-3 text-xs"
                  >
                    {Object.entries(SEISMIC_DISTRICTS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.name} — জোন {v.zone} (Z={v.zValue})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">মাটির ধরণ (Soil Type)</Label>
                    <select
                      value={soilCategory}
                      onChange={(e) => setSoilCategory(e.target.value as any)}
                      className="w-full h-9 bg-background border border-border rounded-md px-3 text-xs"
                    >
                      <option value="SC">SC (Dense Sand / Hard Clay)</option>
                      <option value="SD">SD (Stiff Soil / Medium Clay)</option>
                      <option value="SE">SE (Soft Clay / Loose Sand)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">ভবনের গুরুত্ব (Occupancy)</Label>
                    <select
                      value={occupancyCat}
                      onChange={(e) => setOccupancyCat(e.target.value as any)}
                      className="w-full h-9 bg-background border border-border rounded-md px-3 text-xs"
                    >
                      <option value="standard">আবাসিক / সাধারণ (I=1.0)</option>
                      <option value="essential">হাসপাতাল / ফায়ার (I=1.25)</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 rounded-xl space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">সিসমিক জোন:</span>
                    <span className="font-bold text-orange-700 dark:text-orange-400">জোন {currentSeismic.zone} (Z = {currentSeismic.zValue})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ঝুঁকির মাত্রা:</span>
                    <span className="font-bold">{currentSeismic.risk}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground pt-1 border-t">
                    • বিশেষ বৈশিষ্ট্য: {currentSeismic.note}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-7">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-base font-bold">সিসমিক রড ডিটেইলিং বাধ্যবাধকতা (BNBC 2020)</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3 text-xs">
                <div className="p-3 bg-muted/40 rounded-xl space-y-1.5 border">
                  <div className="font-bold text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ১. কলাম ও বিমের টাই রডে ১৩৫° সিসমিক হুক
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    ভূমিকম্পের সময় কলাম খুলে যাওয়া রোধ করতে ৯০° সাধারণ হুক সম্পূর্ণ নিষিদ্ধ। ১৩৫° বাঁকানো হুক এবং প্রান্তে ন্যূনতম ৩ ইঞ্চি এক্সটেনশন বাধ্যতামূলক।
                  </p>
                </div>

                <div className="p-3 bg-muted/40 rounded-xl space-y-1.5 border">
                  <div className="font-bold text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ২. কনফাইন্ড জোন স্পেসিং (Confined Zone Tie Spacing)
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    কলামের সংযোগস্থল থেকে উপর ও নিচে ২ ফুট অংশে টাই রডের দূরত্ব সর্বোচ্চ ৪ ইঞ্চি (d/4) হতে হবে। মাঝের অংশে সর্বোচ্চ ৬ ইঞ্চি স্পেসিং গ্রহণযোগ্য।
                  </p>
                </div>

                <div className="p-3 bg-muted/40 rounded-xl space-y-1.5 border">
                  <div className="font-bold text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ৩. রডের ল্যাপিং পজিশন (Lapping Zone Rule)
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    কলামের নিচে বা বিম-কলাম জয়েন্টের ভেতর ল্যাপিং দেওয়া সম্পূর্ণ নিষিদ্ধ। কলামের মাঝের ১/৩ অংশে ল্যাপিং দিতে হবে এবং এক জায়গায় ৫০%-এর বেশি রড ল্যাপ করা যাবে না।
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 9: CRACK DIAGNOSIS */}
      {/* ========================================================================= */}
      {activeTab === 'crack-diagnosis' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-5">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-500" />
                  ফাটলের লক্ষণ নির্বাচন করুন
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-2 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">ফাটল কোথায় দেখা গেছে?</Label>
                  <select
                    value={crackLocation}
                    onChange={(e) => setCrackLocation(e.target.value as any)}
                    className="w-full h-9 bg-background border border-border rounded-md px-3 text-xs"
                  >
                    <option value="beam">আরসিসি বিম (RCC Beam)</option>
                    <option value="column">আরসিসি কলাম (RCC Column)</option>
                    <option value="slab">ছাদ বা মেঝে স্ল্যাব (Slab)</option>
                    <option value="foundation">ফাউন্ডেশন / বেইজমেন্ট দেয়াল</option>
                    <option value="masonry">ইটের দেয়াল বা প্লাস্টার</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">ফাটলের দিক ও প্যাটার্ন</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'diagonal', label: '৪৫° তীর্যক (Diagonal)' },
                      { id: 'vertical', label: 'উল্লম্ব (Vertical)' },
                      { id: 'horizontal', label: 'আনুভূমিক (Horizontal)' },
                      { id: 'map', label: 'মাকড়সার জাল (Map/Spider)' },
                    ].map((p) => (
                      <Button
                        key={p.id}
                        type="button"
                        size="sm"
                        variant={crackPattern === p.id ? 'default' : 'outline'}
                        onClick={() => setCrackPattern(p.id as any)}
                        className="text-xs h-8"
                      >
                        {p.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">ফাটলের চওড়া (Width mm)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={crackWidthMm}
                    onChange={(e) => setCrackWidthMm(Number(e.target.value) || 0.5)}
                    className="font-mono text-sm"
                  />
                  <span className="text-[10px] text-muted-foreground">
                    &lt;০.৩ মিমি = হেয়ারলাইন | &gt;১.৫ মিমি = গভীর ফাটল
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-7">
              <CardHeader className="p-5 pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base font-bold">ডায়াগনোসিস ফলাফল ও রেট্রোফিটিং গাইড</CardTitle>
                  <Badge variant="outline" className={`font-bold ${crackAnalysis.riskColor}`}>
                    {crackAnalysis.riskLevel}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-4 text-xs">
                <div className="p-4 bg-muted/40 rounded-xl space-y-1.5 border">
                  <span className="text-xs font-bold text-muted-foreground uppercase">সম্ভাব্য মূল কারণ:</span>
                  <p className="text-sm font-semibold text-foreground leading-relaxed">
                    {crackAnalysis.cause}
                  </p>
                </div>

                <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-1.5">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    প্রস্তাবিত ইঞ্জিনিয়ারিং প্রতিকার ও রেট্রোফিটিং:
                  </span>
                  <p className="text-xs text-foreground leading-relaxed">
                    {crackAnalysis.retrofit}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 10: RAINWATER HARVESTING */}
      {/* ========================================================================= */}
      {activeTab === 'rainwater' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-5">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CloudRain className="w-5 h-5 text-teal-500" />
                  ছাদ ও বৃষ্টিপাতের ইনপুট
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-2 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">ছাদের আয়তন (বর্গফুট)</Label>
                  <Input
                    type="number"
                    value={roofAreaSqft}
                    onChange={(e) => setRoofAreaSqft(Number(e.target.value) || 0)}
                    className="font-mono"
                  />
                  <span className="text-[11px] text-muted-foreground">= {roofAreaSqm.toFixed(1)} বর্গমিটার</span>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">বার্ষিক বৃষ্টিপাত (মিমি)</Label>
                  <select
                    value={rainfallMm}
                    onChange={(e) => setRainfallMm(Number(e.target.value))}
                    className="w-full h-9 bg-background border border-border rounded-md px-3 text-xs"
                  >
                    <option value={2200}>ঢাকা অঞ্চল (২২০০ মিমি/বছর)</option>
                    <option value={3000}>সিলেট অঞ্চল (৩০০০ মিমি/বছর)</option>
                    <option value={2800}>চট্টগ্রাম উপকূল (২৮০০ মিমি/বছর)</option>
                    <option value={1600}>রাজশাহী / খুলনা (১৬০০ মিমি/বছর)</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-7">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-base font-bold">বৃষ্টির পানি সঞ্চয় ও ট্যাঙ্কের মাপ</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-muted/40 rounded-xl">
                    <span className="text-[10px] text-muted-foreground">বার্ষিক সংগ্রহযোগ্য পানি</span>
                    <div className="text-xl font-black font-mono text-teal-600 dark:text-teal-400">
                      {annualHarvestLiters.toLocaleString()} L
                    </div>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-xl">
                    <span className="text-[10px] text-muted-foreground">মাসিক গড় উৎপাদন</span>
                    <div className="text-xl font-black font-mono text-foreground">
                      {monthlyAverageHarvest.toLocaleString()} L
                    </div>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-xl">
                    <span className="text-[10px] text-muted-foreground">প্রস্তাবিত ফিল্টার ট্যাঙ্ক</span>
                    <div className="text-xl font-black font-mono text-foreground">
                      {rwhStorageTankLiters.toLocaleString()} L
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900 rounded-xl space-y-1.5 text-xs text-teal-950 dark:text-teal-200">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    ব্যবহার ক্ষেত্র ও সুবিধা:
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    এই পানি দিয়ে ভবনের টয়লেট ফ্লাশিং, বাগান পরিচর্যা ও গাড়ি ধোয়ার শতভাগ চাহিদা মেটানো সম্ভব। রাজউকে রেইনওয়াটার হার্ভেস্টিং নকশা জমা দিলে অনুমোদন প্রক্রিয়া দ্রুততর হয়।
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 11: FIRE SAFETY & FIRE NOC */}
      {/* ========================================================================= */}
      {activeTab === 'fire-safety' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-5">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-600" />
                  ইমারতের ফায়ার ইনপুট
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-2 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">ভবনের উচ্চতা (মিটার)</Label>
                  <Input
                    type="number"
                    value={buildingHeightMeters}
                    onChange={(e) => setBuildingHeightMeters(Number(e.target.value) || 0)}
                    className="font-mono"
                  />
                  <span className="text-[11px] text-muted-foreground">
                    &gt;২০ মিটার (সাধারণত ৭ তলার বেশি) হলে হাই-রাইজ ফায়ার কোড প্রযোজ্য
                  </span>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">ব্যবহার ক্যাটাগরি</Label>
                  <select
                    value={buildingOccupancy}
                    onChange={(e) => setBuildingOccupancy(e.target.value as any)}
                    className="w-full h-9 bg-background border border-border rounded-md px-3 text-xs"
                  >
                    <option value="residential">আবাসিক ভবন</option>
                    <option value="commercial">বাণিজ্যিক / অফিস ভবন</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-7">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-base font-bold">ফায়ার সার্ভিস এনওসি বাধ্যবাধকতা চেকলিস্ট</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3 text-xs">
                <div className="p-3 bg-muted/40 rounded-xl space-y-1 border">
                  <div className="font-bold text-foreground">১. ইমার্জেন্সি ফায়ার এস্কেপ সিঁড়ি</div>
                  <p className="text-[11px] text-muted-foreground">
                    ন্যূনতম চওড়া {fireStairWidthMeters} মিটার (৫ ফুট)। সিঁড়িটি ধোঁয়ামুক্ত প্রেশারাইজড বা প্রাকৃতিক বাতাসযুক্ত হতে হবে।
                  </p>
                </div>

                <div className="p-3 bg-muted/40 rounded-xl space-y-1 border">
                  <div className="font-bold text-foreground">২. ডেডিকেটেড ফায়ার ওয়াটার রিজার্ভার</div>
                  <p className="text-[11px] text-muted-foreground">
                    আন্ডারগ্রাউন্ডে ন্যূনতম <strong>{fireReservoirLiters.toLocaleString()} লিটার</strong> পানি শুধুমাত্র অগ্নিনির্বাপণের জন্য সার্বক্ষণিক সংরক্ষিত থাকতে হবে।
                  </p>
                </div>

                <div className="p-3 bg-muted/40 rounded-xl space-y-1 border">
                  <div className="font-bold text-foreground">৩. অটোমেটিক ফায়ার স্প্রিংকলার</div>
                  <p className="text-[11px] text-muted-foreground">
                    {isSprinklerMandatory ? '🔴 এই ভবনের জন্য প্রতিটি ফ্লোরে স্প্রিংকলার সিস্টেম বাধ্যতামূলক!' : '🟢 আবাসিক ক্ষেত্রে ম্যানুয়াল হোস রিল ক্যাবিনেট যথেষ্ট।'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 12: ROOFTOP SOLAR & NET METERING */}
      {/* ========================================================================= */}
      {activeTab === 'solar' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-5">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sun className="w-5 h-5 text-yellow-500" />
                  ছাদের সোলার ইনপুট
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-2 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">ব্যবহারযোগ্য ছাদের এলাকা (বর্গফুট)</Label>
                  <Input
                    type="number"
                    value={solarUsableAreaSqft}
                    onChange={(e) => setSolarUsableAreaSqft(Number(e.target.value) || 0)}
                    className="font-mono"
                  />
                  <span className="text-[11px] text-muted-foreground">ছাদের ছায়ামুক্ত অংশ</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">প্যানেল ক্ষমতা (Watt)</Label>
                    <Input
                      type="number"
                      value={panelWattage}
                      onChange={(e) => setPanelWattage(Number(e.target.value) || 550)}
                      className="font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">বিদ্যুৎ ট্যারিফ (Tk/Unit)</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={electricityTariffTk}
                      onChange={(e) => setElectricityTariffTk(Number(e.target.value) || 11.5)}
                      className="font-mono text-xs"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-7">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-base font-bold">সোলার বিদ্যুৎ উৎপাদন ও বিল সাশ্রয়</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-muted/40 rounded-xl">
                    <span className="text-[10px] text-muted-foreground">সোলার সিস্টেম ক্ষমতা</span>
                    <div className="text-xl font-black font-mono text-yellow-600 dark:text-yellow-400">
                      {totalSolarKwp} kWp
                    </div>
                    <span className="text-[9px] text-muted-foreground">{totalPanels} টি প্যানেল</span>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-xl">
                    <span className="text-[10px] text-muted-foreground">মাসিক বিদ্যুৎ উৎপাদন</span>
                    <div className="text-xl font-black font-mono text-foreground">
                      ~{monthlySolarUnits} Unit
                    </div>
                    <span className="text-[9px] text-muted-foreground">{dailySolarUnits} Unit/দিন</span>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-xl">
                    <span className="text-[10px] text-muted-foreground">মাসিক বিল সাশ্রয়</span>
                    <div className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                      ৳ {monthlySavingsTk.toLocaleString('en-BD')}
                    </div>
                    <span className="text-[9px] text-muted-foreground">পে-ব্যাক: ~{paybackYears} বছর</span>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50/40 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-xl space-y-1 text-xs">
                  <div className="font-bold flex items-center gap-1.5 text-yellow-900 dark:text-yellow-300">
                    <CheckCircle2 className="w-4 h-4 text-yellow-600" />
                    ডেসকো / ডিপিডিসি নেট মিটারিং সুবিধা:
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    অন-গ্রিড ইনভার্টারের মাধ্যমে উৎপাদিত অতিরিক্ত বিদ্যুৎ সরাসরি গ্রিডে চলে যাবে এবং মাসিক বিদ্যুৎ বিলের সাথে সমন্বয় (Net-Off) হবে।
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
