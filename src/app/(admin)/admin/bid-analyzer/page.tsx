'use client';

import { useState } from 'react';
import {
  Scale,
  Printer,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  TrendingDown,
  Building,
  Award,
  DollarSign,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface BidItem {
  id: string;
  name: string;
  unit: string;
  defaultQty: number;
  rateA: number;
  rateB: number;
  rateC: number;
}

const DEFAULT_ITEMS: BidItem[] = [
  {
    id: '1',
    name: 'রড বাইন্ডিং ও প্লেসিং (MS Rod Binding)',
    unit: 'কেজি (Kg)',
    defaultQty: 18000,
    rateA: 8.5,
    rateB: 9.0,
    rateC: 8.0,
  },
  {
    id: '2',
    name: 'শাটারিং ও স্কাফোল্ডিং (Shuttering & Scaffolding)',
    unit: 'বর্গফুট (Sft)',
    defaultQty: 12000,
    rateA: 42,
    rateB: 45,
    rateC: 38,
  },
  {
    id: '3',
    name: 'আরসিসি ছাদ ও কলাম ঢালাই লেবার (RCC Casting)',
    unit: 'সিএফটি (Cft)',
    defaultQty: 4500,
    rateA: 30,
    rateB: 32,
    rateC: 28,
  },
  {
    id: '4',
    name: '৫ ইঞ্চি ও ১০ ইঞ্চি ইটের গাঁথুনি (Brick Masonry)',
    unit: 'বর্গফুট (Sft)',
    defaultQty: 8500,
    rateA: 28,
    rateB: 30,
    rateC: 27,
  },
  {
    id: '5',
    name: 'অভ্যন্তরীণ ও বাইরের প্লাস্টার (Plastering)',
    unit: 'বর্গফুট (Sft)',
    defaultQty: 14000,
    rateA: 18,
    rateB: 20,
    rateC: 17,
  },
  {
    id: '6',
    name: 'টাইলস ফিটিং ফ্লোর ও বাথরুম (Tiles Work)',
    unit: 'বর্গফুট (Sft)',
    defaultQty: 5000,
    rateA: 35,
    rateB: 40,
    rateC: 32,
  },
  {
    id: '7',
    name: 'প্লাম্বিং ও স্যানিটারি লেবার (Plumbing Lump)',
    unit: 'এককালীন (Lump)',
    defaultQty: 1,
    rateA: 120000,
    rateB: 135000,
    rateC: 110000,
  },
  {
    id: '8',
    name: 'ইলেকট্রিক্যাল ওয়্যারিং লেবার (Electrical Lump)',
    unit: 'এককালীন (Lump)',
    defaultQty: 1,
    rateA: 110000,
    rateB: 125000,
    rateC: 105000,
  },
];

export default function ComparativeBidAnalyzerPage() {
  const [projectName, setProjectName] = useState('উত্তরা ৭ তলা আবাসিক ভবন');
  const [projectLocation, setProjectLocation] = useState('সেক্টর-১১, উত্তরা, ঢাকা');
  const [buildingArea, setBuildingArea] = useState('১২,০০০ বর্গফুট');

  const [contractorA, setContractorA] = useState('মেসার্স করিম কনস্ট্রাকশন');
  const [contractorB, setContractorB] = useState('মেসার্স রহিম বিল্ডার্স');
  const [contractorC, setContractorC] = useState('আলমগীর মিস্ত্রি টিম');

  const [items, setItems] = useState<BidItem[]>(DEFAULT_ITEMS);

  const updateItem = (id: string, field: keyof BidItem, value: any) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: Number(value) } : item))
    );
  };

  // Calculations
  const totalA = items.reduce((sum, item) => sum + item.defaultQty * item.rateA, 0);
  const totalB = items.reduce((sum, item) => sum + item.defaultQty * item.rateB, 0);
  const totalC = items.reduce((sum, item) => sum + item.defaultQty * item.rateC, 0);

  const totals = [
    { name: contractorA, total: totalA, code: 'A' },
    { name: contractorB, total: totalB, code: 'B' },
    { name: contractorC, total: totalC, code: 'C' },
  ];

  const lowestTotal = Math.min(totalA, totalB, totalC);
  const highestTotal = Math.max(totalA, totalB, totalC);
  const winner = totals.find((t) => t.total === lowestTotal);

  const resetDefaults = () => {
    setItems(DEFAULT_ITEMS);
    toast.info('ডিফল্ট রেট রিস্টোর করা হয়েছে');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Scale className="w-6 h-6 text-primary" />
            কন্ট্রাক্টর দরপত্র ও রেট তুলনামূলক যাচাইকারী (Comparative Bid Analyzer)
          </h1>
          <p className="text-sm text-muted-foreground">
            ৩ জন কন্ট্রাক্টরের রড বাইন্ডিং, শাটারিং, প্লাস্টার ও গাঁথুনির রেট পাশাপাশি রেখে তুলনা এবং সেরা দর নির্ধারণ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={resetDefaults} className="gap-1 text-xs">
            <RotateCcw className="w-3.5 h-3.5" /> রিসেট
          </Button>
          <Button size="sm" onClick={() => window.print()} className="gap-1.5 text-xs bg-primary">
            <Printer className="w-3.5 h-3.5" /> প্রিন্ট কম্পারেটিভ শিট
          </Button>
        </div>
      </div>

      {/* Project & Contractor Names Input (Hidden during print or shown compact) */}
      <Card className="print:border-none print:shadow-none print:p-0">
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">প্রজেক্টের নাম</Label>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="h-8 text-xs font-semibold"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">লোকেশন</Label>
              <Input
                value={projectLocation}
                onChange={(e) => setProjectLocation(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">মোট বিল্ট-আপ এরিয়া</Label>
              <Input
                value={buildingArea}
                onChange={(e) => setBuildingArea(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-border">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-blue-700 dark:text-blue-400">
                কন্ট্রাক্টর ১ (Bidder A)
              </Label>
              <Input
                value={contractorA}
                onChange={(e) => setContractorA(e.target.value)}
                className="h-8 text-xs border-blue-300 dark:border-blue-800"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-purple-700 dark:text-purple-400">
                কন্ট্রাক্টর ২ (Bidder B)
              </Label>
              <Input
                value={contractorB}
                onChange={(e) => setContractorB(e.target.value)}
                className="h-8 text-xs border-purple-300 dark:border-purple-800"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                কন্ট্রাক্টর ৩ (Bidder C)
              </Label>
              <Input
                value={contractorC}
                onChange={(e) => setContractorC(e.target.value)}
                className="h-8 text-xs border-emerald-300 dark:border-emerald-800"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {totals.map((c) => {
          const isLowest = c.total === lowestTotal;
          const diff = c.total - lowestTotal;
          return (
            <Card
              key={c.code}
              className={`border-2 transition-all ${
                isLowest
                  ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-md'
                  : 'border-border'
              }`}
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">
                      Bidder {c.code}
                    </span>
                    <CardTitle className="text-sm font-bold truncate">{c.name}</CardTitle>
                  </div>
                  {isLowest && (
                    <Badge className="bg-emerald-600 text-white text-[10px] gap-1 shrink-0">
                      <Award className="w-3 h-3" /> সবচেয়ে সাশ্রয়ী
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-1">
                <div className="text-xl font-black text-foreground font-mono">
                  ৳ {c.total.toLocaleString('en-BD')}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isLowest ? (
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                      সর্বোচ্চ দর থেকে ৳ {(highestTotal - lowestTotal).toLocaleString('en-BD')} কম
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      সর্বনিম্ন থেকে +৳ {diff.toLocaleString('en-BD')} বেশি
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Comparative Matrix Table */}
      <Card className="print:border print:border-black print:rounded-none">
        <CardHeader className="p-4 pb-2 print:pb-0">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base font-bold">আইটেমভিত্তিক রেট তুলনা (Rate Comparison Matrix)</CardTitle>
            <span className="text-xs text-muted-foreground print:hidden">
              *সবুজ চিহ্নিত রেটগুলো সর্বনিম্ন এবং সবচেয়ে সাশ্রয়ী
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/60 uppercase text-muted-foreground border-b border-border text-[11px]">
                <tr>
                  <th className="px-4 py-3">কাজের বিবরণ (Work Description)</th>
                  <th className="px-3 py-3">একক</th>
                  <th className="px-3 py-3">আনুমানিক পরিমাণ</th>
                  <th className="px-3 py-3 text-center bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-300">
                    {contractorA}
                  </th>
                  <th className="px-3 py-3 text-center bg-purple-50/50 dark:bg-purple-950/20 text-purple-900 dark:text-purple-300">
                    {contractorB}
                  </th>
                  <th className="px-3 py-3 text-center bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300">
                    {contractorC}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item) => {
                  const minRate = Math.min(item.rateA, item.rateB, item.rateC);
                  return (
                    <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-2.5 font-medium">
                        {item.name}
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">
                        {item.unit}
                      </td>
                      <td className="px-3 py-2.5 font-mono">
                        <Input
                          type="number"
                          value={item.defaultQty}
                          onChange={(e) => updateItem(item.id, 'defaultQty', e.target.value)}
                          className="h-7 w-24 text-xs font-mono print:border-none print:p-0"
                        />
                      </td>

                      {/* Contractor A */}
                      <td className={`px-3 py-2.5 text-center ${item.rateA === minRate ? 'bg-emerald-500/10 font-bold text-emerald-700 dark:text-emerald-400' : ''}`}>
                        <div className="flex items-center justify-center gap-1">
                          <span>৳</span>
                          <Input
                            type="number"
                            step="0.5"
                            value={item.rateA}
                            onChange={(e) => updateItem(item.id, 'rateA', e.target.value)}
                            className="h-7 w-20 text-xs text-center font-mono print:border-none"
                          />
                        </div>
                        <div className="text-[10px] text-muted-foreground pt-0.5">
                          মোট: ৳ {(item.defaultQty * item.rateA).toLocaleString('en-BD')}
                        </div>
                      </td>

                      {/* Contractor B */}
                      <td className={`px-3 py-2.5 text-center ${item.rateB === minRate ? 'bg-emerald-500/10 font-bold text-emerald-700 dark:text-emerald-400' : ''}`}>
                        <div className="flex items-center justify-center gap-1">
                          <span>৳</span>
                          <Input
                            type="number"
                            step="0.5"
                            value={item.rateB}
                            onChange={(e) => updateItem(item.id, 'rateB', e.target.value)}
                            className="h-7 w-20 text-xs text-center font-mono print:border-none"
                          />
                        </div>
                        <div className="text-[10px] text-muted-foreground pt-0.5">
                          মোট: ৳ {(item.defaultQty * item.rateB).toLocaleString('en-BD')}
                        </div>
                      </td>

                      {/* Contractor C */}
                      <td className={`px-3 py-2.5 text-center ${item.rateC === minRate ? 'bg-emerald-500/10 font-bold text-emerald-700 dark:text-emerald-400' : ''}`}>
                        <div className="flex items-center justify-center gap-1">
                          <span>৳</span>
                          <Input
                            type="number"
                            step="0.5"
                            value={item.rateC}
                            onChange={(e) => updateItem(item.id, 'rateC', e.target.value)}
                            className="h-7 w-20 text-xs text-center font-mono print:border-none"
                          />
                        </div>
                        <div className="text-[10px] text-muted-foreground pt-0.5">
                          মোট: ৳ {(item.defaultQty * item.rateC).toLocaleString('en-BD')}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {/* Grand Total Row */}
                <tr className="bg-muted/80 font-black text-sm border-t-2 border-border">
                  <td colSpan={3} className="px-4 py-3 text-right">
                    প্রাক্কলিত মোট কাজের চুক্তি মূল্য (Total Bid Amount):
                  </td>
                  <td className="px-3 py-3 text-center text-blue-900 dark:text-blue-300 font-mono">
                    ৳ {totalA.toLocaleString('en-BD')}
                  </td>
                  <td className="px-3 py-3 text-center text-purple-900 dark:text-purple-300 font-mono">
                    ৳ {totalB.toLocaleString('en-BD')}
                  </td>
                  <td className="px-3 py-3 text-center text-emerald-700 dark:text-emerald-400 font-mono">
                    ৳ {totalC.toLocaleString('en-BD')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Engineer Audit & Recommendation Box */}
      <div className="border border-border p-6 rounded-xl bg-card text-foreground space-y-4 print:border-black">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ইঞ্জিনিয়ারিং মতামত ও সুপারিশ (Engineering Recommendation):
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              দরপত্র যাচাই করে দেখা গেছে যে, <strong>{winner?.name}</strong> সামগ্রিকভাবে সবচেয়ে প্রতিযোগিতামূলক ও সাশ্রয়ী দর প্রদান করেছেন। কাজ প্রদানের পূর্বে কন্ট্রাক্টরের পূর্বের সাইটের মান, শাটারিং শিট ও ইকুইপমেন্টের অবস্থা যাচাই করার পরামর্শ দেওয়া হলো।
            </p>
          </div>
        </div>

        <div className="pt-8 flex justify-between items-end border-t border-border text-xs">
          <div>
            <p className="text-muted-foreground">তৈরি করেছে: ট্রিপল এইচ ইঞ্জিনিয়ারিং কনসালটেন্সি</p>
            <p className="text-muted-foreground font-mono">রিপোর্ট আইডি: BID-{Math.floor(1000 + Math.random() * 9000)}</p>
          </div>
          <div className="text-right space-y-1">
            <div className="font-bold text-foreground">ইঞ্জিনিয়ার মোঃ হাসমত আলী</div>
            <div className="text-muted-foreground text-[11px]">প্রতিষ্ঠাতা ও প্রধান পরামর্শক</div>
            <div className="w-36 border-b border-border mt-3 mb-1 ml-auto" />
            <div className="text-[10px] text-muted-foreground">অনুমোদনকারী প্রকৌশলী</div>
          </div>
        </div>
      </div>
    </div>
  );
}
