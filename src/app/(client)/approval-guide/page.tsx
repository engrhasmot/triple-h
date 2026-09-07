"use client";

import { useState, useId } from "react";
import Link from "next/link";
import { CheckSquare, Square, Building, FileCheck, ShieldCheck, Phone, ArrowRight, Printer, AlertCircle, HelpCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import WhatsAppIcon from "@/components/shared/WhatsAppIcon";

interface ChecklistItem {
  id: string;
  titleBn: string;
  titleEn: string;
  descBn: string;
  descEn: string;
  required: boolean;
}

interface ChecklistCategory {
  titleBn: string;
  titleEn: string;
  items: ChecklistItem[];
}

const CHECKLIST_DATA: Record<string, ChecklistCategory[]> = {
  rajuk: [
    {
      titleBn: "১. জমি ও মালিকানার কাগজপত্র (Land Documents)",
      titleEn: "1. Land Ownership Documents",
      items: [
        {
          id: "r_deed",
          titleBn: "মূল দলিল ও প্রয়োজনীয় বায়া দলিল",
          titleEn: "Original Registered Deed & Chain Deeds",
          descBn: "রেজিস্ট্রিকৃত মূল দলিল এবং পূর্বের মালিকানার ধারাবাহিক বায়া দলিলের সত্যায়িত কপি।",
          descEn: "Original deed and chain of prior ownership title deeds.",
          required: true,
        },
        {
          id: "r_namjari",
          titleBn: "হালনাগাদ নামজারি খতিয়ান ও ডি.সি.আর",
          titleEn: "Mutated Khatian (Namjari) & DCR",
          descBn: "সহকারী কমিশনার (ভূমি) অফিস থেকে প্রাপ্ত আবেদনকারীর নামের নামজারি খতিয়ান ও ডিসিআর ডুপ্লিকেট কার্বন রসিদ।",
          descEn: "Latest Namjari Porcha and DCR receipt in the applicant's name.",
          required: true,
        },
        {
          id: "r_tax",
          titleBn: "চলতি অর্থবছর পর্যন্ত ভূমি উন্নয়ন কর (খাজনা)",
          titleEn: "Up-to-date Land Development Tax Receipt (Khajna)",
          descBn: "অনলাইনে বা সংশ্লিষ্ট ইউনিয়ন ভূমি অফিস থেকে প্রদত্ত হাল সনের খাজনা দাখিলা।",
          descEn: "Paid tax receipt for the current fiscal year.",
          required: true,
        },
        {
          id: "r_mouza",
          titleBn: "সত্যায়িত মৌজা নকশা (Mouza Map)",
          titleEn: "Certified Mouza Map Sheet",
          descBn: "ডিসি অফিস বা রেকর্ড রুম থেকে প্রাপ্ত সিএস/এসএ/আরএস/বিএস মৌজা ম্যাপের সার্টিফাইড কপি।",
          descEn: "Certified Mouza sheet showing plot location clearly.",
          required: true,
        },
        {
          id: "r_nid",
          titleBn: "মালিকের NID ও পাসপোর্ট সাইজ ছবি",
          titleEn: "Owner's NID & Passport Size Photos",
          descBn: "জমির সকল মালিকের জাতীয় পরিচয়পত্র ও সদ্য তোলা রঙিন ছবি।",
          descEn: "NID copy and photos of all legal land owners.",
          required: true,
        },
      ],
    },
    {
      titleBn: "২. কারিগরি ড্রয়িং ও রিপোর্ট (Engineering Documents)",
      titleEn: "2. Technical Drawings & Reports",
      items: [
        {
          id: "r_arch",
          titleBn: "আর্কিটেকচারাল প্ল্যান (IAB রেজিস্টার্ড আর্কিটেক্ট)",
          titleEn: "Architectural Drawings (IAB Approved)",
          descBn: "সাইট প্ল্যান, ফ্লোর প্ল্যান, এলিভেশন, সেকশন ও সেটব্যাক রুলস অনুযায়ী প্রস্তুতকৃত ড্রয়িং।",
          descEn: "Master layout, elevations, setbacks, and floor plans.",
          required: true,
        },
        {
          id: "r_struct",
          titleBn: "স্ট্রাকচারাল ডিজাইন ও বিএনবিসি কমপ্লায়েন্স রিপোর্ট",
          titleEn: "Structural Design & Calculation (IEB Registered Engineer)",
          descBn: "ইঞ্জিনিয়ার্স ইনস্টিটিউশন (IEB) সদস্য সিভিল/স্ট্রাকচারাল ইঞ্জিনিয়ারের স্বাক্ষরিত লোড ও আর্থকোয়েক ক্যালকুলেশন।",
          descEn: "Structural load calculations following BNBC seismic & wind codes.",
          required: true,
        },
        {
          id: "r_soil",
          titleBn: "সয়েল টেস্ট / ভূ-তাত্ত্বিক অনুসন্ধান রিপোর্ট",
          titleEn: "Soil Investigation & Bearing Capacity Report",
          descBn: "অনুমোদিত জিওটেকনিক্যাল ল্যাব ও প্রফেশনাল ইঞ্জিনিয়ার দ্বারা প্রস্তুতকৃত মাটির বহনক্ষমতা ও বোরহোল লগ রিপোর্ট।",
          descEn: "Soil test report with certified soil bearing capacity.",
          required: true,
        },
        {
          id: "r_plumbing",
          titleBn: "প্লাম্বিং, স্যুয়ারেজ ও ইলেকট্রিক্যাল লেআউট",
          titleEn: "Plumbing, Sanitary & Electrical Layouts",
          descBn: "সেপটিক ট্যাংক, ড্রেনেজ কানেকশন ও বিল্ডিং ইলেকট্রিক্যাল সার্ভিস ডায়াগ্রাম।",
          descEn: "Sanitary drainage, septic tank details, and electrical load plan.",
          required: false,
        },
      ],
    },
    {
      titleBn: "৩. ছাড়পত্র ও অনাপত্তিপত্র (NOC & Clearances)",
      titleEn: "3. Special Clearances & NOCs",
      items: [
        {
          id: "r_luc",
          titleBn: "রাজউক ভূমি ব্যবহার ছাড়পত্র (LUC)",
          titleEn: "RAJUK Land Use Clearance (LUC)",
          descBn: "ঢাকা ডিটেইলড এরিয়া প্ল্যান (DAP) অনুযায়ী প্লটটির ব্যবহারের অনুমতিপত্র।",
          descEn: "Land Use Clearance in accordance with Dhaka DAP regulations.",
          required: true,
        },
        {
          id: "r_fire",
          titleBn: "ফায়ার সার্ভিস ও সিভিল ডিফেন্স অনাপত্তি (NOC)",
          titleEn: "Fire Safety Clearance (for 7+ floors/commercial)",
          descBn: "৭ তলার বেশি উচ্চতার আবাসিক ভবন বা যেকোনো বাণিজ্যিক ভবনের জন্য বাধ্যতামূলক।",
          descEn: "Mandatory for high-rise residential (7+ stories) or commercial buildings.",
          required: false,
        },
        {
          id: "r_env",
          titleBn: "পরিবেশ অধিদপ্তরের ছাড়পত্র (DOE)",
          titleEn: "Department of Environment Clearance",
          descBn: "নির্দিষ্ট এলাকার বৃহৎ বা বাণিজ্যিক আবাসন প্রকল্পের ক্ষেত্রে প্রযোজ্য।",
          descEn: "Required for commercial complexes or large residential projects.",
          required: false,
        },
      ],
    },
  ],
  municipality: [
    {
      titleBn: "১. জমির মালিকানা সংক্রান্ত কাগজ (Ownership)",
      titleEn: "1. Land Ownership Documents",
      items: [
        {
          id: "m_deed",
          titleBn: "রেজিস্ট্রিকৃত মূল দলিল ও বায়া দলিল",
          titleEn: "Registered Original Deed & Chain Deeds",
          descBn: "জমির বৈধ স্বত্ব ও দখল প্রমাণের জন্য রেজিস্ট্রিকৃত দলিলের কপি।",
          descEn: "Registered deed showing valid title and possession.",
          required: true,
        },
        {
          id: "m_namjari",
          titleBn: "নামজারি খতিয়ান ও ডিসিআর",
          titleEn: "Namjari Porcha & DCR",
          descBn: "আবেদনকারীর নিজ নামে হালনাগাদ জমা-খারিজ বা নামজারি রেকর্ড।",
          descEn: "Updated Namjari record in the applicant's name.",
          required: true,
        },
        {
          id: "m_tax",
          titleBn: "হাল খাজনা দাখিলা ও পৌর কর পরিশোধের প্রমাণ",
          titleEn: "Current Land Tax & Pourashava Holding Tax",
          descBn: "ভূমি উন্নয়ন কর এবং পৌরসভা বা ইউনিয়ন পরিষদের কোনো বকেয়া থাকলে তা পরিশোধের রসিদ।",
          descEn: "Up-to-date land development tax and municipal holding clearance.",
          required: true,
        },
        {
          id: "m_mouza",
          titleBn: "মৌজা ম্যাপ ও প্লট সীমানা চিহ্নিতকরণ",
          titleEn: "Certified Mouza Sheet & Plot Demarcation",
          descBn: "রাস্তার প্রশস্ততা এবং প্লটের দৈর্ঘ্য-প্রস্থ প্রদর্শনকারী দাগের অবস্থান।",
          descEn: "Mouza sheet highlighting road width and boundary coordinates.",
          required: true,
        },
      ],
    },
    {
      titleBn: "২. নকশা ও প্রকৌশল ড্রয়িং (Engineering & Design)",
      titleEn: "2. Engineering Plans",
      items: [
        {
          id: "m_plan",
          titleBn: "পৌরসভার বিধি মোতাবেক আর্কিটেকচারাল নকশা (Blue Print)",
          titleEn: "Architectural Blueprint Plan",
          descBn: "সামনে, পেছনে ও পাশে নির্ধারিত জায়গা (Setback) ছেড়ে প্রস্তুতকৃত পূর্ণাঙ্গ ড্রয়িং।",
          descEn: "Full architectural blueprints observing local municipality setbacks.",
          required: true,
        },
        {
          id: "m_struct",
          titleBn: "সিভিল ইঞ্জিনিয়ারের স্ট্রাকচারাল ডিজাইন ও স্থায়িত্ব সনদ",
          titleEn: "Structural Design & Soundness Certificate",
          descBn: "আইইবি (IEB) তালিকাভুক্ত প্রফেশনাল সিভিল ইঞ্জিনিয়ারের সত্যায়ন পত্র।",
          descEn: "Structural safety certificate signed by an IEB member engineer.",
          required: true,
        },
        {
          id: "m_soil",
          titleBn: "সয়েল টেস্ট রিপোর্ট (৩ তলার বেশি হলে)",
          titleEn: "Soil Investigation Report (for 3+ stories)",
          descBn: "বহুতল ভবনের মাটির লোড বেয়ারিং সক্ষমতার পরীক্ষিত রিপোর্ট।",
          descEn: "Soil test log ensuring foundation stability for multi-story buildings.",
          required: true,
        },
      ],
    },
  ],
};

const STEPS = [
  {
    step: "০১",
    titleBn: "সাইট ভিজিট ও ডিজিটাল সার্ভে",
    descBn: "প্লটের সঠিক মাপ, সীমানা এবং সামনের রাস্তার প্রশস্ততা সুনির্দিষ্টভাবে পরিমাপ করা।",
  },
  {
    step: "০২",
    titleBn: "সয়েল টেস্ট ও ভূ-তাত্ত্বিক পরীক্ষা",
    descBn: "মাটির ভারবহন ক্ষমতা যাচাই করে নিরাপদ পাইলিং বা ফাউন্ডেশন নির্ধারণ।",
  },
  {
    step: "০৩",
    titleBn: "আর্কিটেকচারাল ও স্ট্রাকচারাল ড্রয়িং",
    descBn: "রাজউক বা পৌরসভার বিল্ডিং কোড (BNBC) ও সেটব্যাক মেনে ভবনের পূর্ণাঙ্গ ড্রয়িং প্রস্তুত।",
  },
  {
    step: "০৪",
    titleBn: "অনলাইনে আবেদন ও ফাইল সাবমিশন",
    descBn: "নির্ধারিত সরকারি ফি পরিশোধ করে প্রয়োজনীয় সকল ডকুমেন্ট সহ আবেদনপত্র দাখিল।",
  },
  {
    step: "০৫",
    titleBn: "মাঠ পরিদর্শন ও চূড়ান্ত অনুমোদন",
    descBn: "ইন্সপেক্টর কর্তৃক প্লট পরিদর্শন ও যাচাই-বাছাই শেষে চূড়ান্ত বিল্ডিং পারমিট ও অনুমোদিত নকশা হস্তান্তর।",
  },
];

export default function ApprovalGuidePage() {
  const [authority, setAuthority] = useState<"rajuk" | "municipality">("rajuk");
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({});

  const currentCategories = CHECKLIST_DATA[authority];
  const allItems = currentCategories.flatMap((c) => c.items);
  const totalCount = allItems.length;
  const checkedCount = allItems.filter((i) => checkedIds[i.id]).length;
  const percentage = Math.round((checkedCount / totalCount) * 100);

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Header */}
      <section className="relative bg-gradient-to-b from-primary/10 via-background to-background pt-12 pb-10 border-b border-border/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-3">
            <Badge variant="outline" className="px-3 py-1 text-xs font-semibold bg-primary/10 text-primary border-primary/20">
              <Building className="w-3.5 h-3.5 mr-1.5 inline" /> অফিসিয়াল অনুমোদন চেকলিস্ট
            </Badge>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              রাজউক ও পৌরসভা বিল্ডিং প্ল্যান অনুমোদন গাইড
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              নতুন বাড়ি নির্মাণের ক্ষেত্রে প্রয়োজনীয় সকল কাগজপত্র, ইঞ্জিনিয়ারিং ড্রয়িং ও সরকারি ছাড়পত্রের সঠিক চেকলিস্ট। নিজের ফাইলের অগ্রগতি এখনই যাচাই করুন।
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-8">
        {/* Authority Switcher Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 bg-secondary/80 rounded-2xl border border-border">
            <button
              onClick={() => setAuthority("rajuk")}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
                authority === "rajuk"
                  ? "bg-card text-foreground shadow-md border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Building className="w-4 h-4 text-accent" />
              রাজউক (ঢাকা মেগাসিটি এলাকা)
            </button>
            <button
              onClick={() => setAuthority("municipality")}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
                authority === "municipality"
                  ? "bg-card text-foreground shadow-md border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileCheck className="w-4 h-4 text-emerald-600" />
              পৌরসভা ও ইউনিয়ন পরিষদ
            </button>
          </div>
        </div>

        {/* Readiness Meter Card */}
        <Card className="mb-8 border-2 border-accent/20 bg-card shadow-lg overflow-hidden">
          <CardHeader className="pb-3 bg-secondary/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-accent" /> আপনার ফাইল প্রস্তুতির স্কোর
                </CardTitle>
                <CardDescription className="text-xs">
                  নিচের যে যে কাগজপত্র ও ড্রয়িং আপনার প্রস্তুত আছে সেগুলোতে টিক দিন
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handlePrint} className="h-8 text-xs cursor-pointer">
                  <Printer className="w-3.5 h-3.5 mr-1.5" /> প্রিন্ট চেকলিস্ট
                </Button>
                <Badge
                  className={`text-xs font-bold px-3 py-1 ${
                    percentage === 100
                      ? "bg-emerald-600 text-white"
                      : percentage >= 60
                      ? "bg-amber-600 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {checkedCount} / {totalCount} টি প্রস্তুত ({percentage}%)
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {/* Progress bar */}
            <div className="w-full bg-secondary h-3.5 rounded-full overflow-hidden mb-3 p-0.5 border border-border">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  percentage === 100 ? "bg-emerald-500" : percentage >= 50 ? "bg-accent" : "bg-amber-500"
                }`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>

            <div className="text-xs flex items-center justify-between text-muted-foreground">
              <span>০% শুরু</span>
              <span className="font-semibold text-foreground">
                {percentage === 100
                  ? "🎉 অভিনন্দন! আপনার ফাইল অনুমোদনের জন্য শতভাগ প্রস্তুত।"
                  : percentage >= 50
                  ? "👍 ভালো অগ্রগতি! বাকি ড্রয়িং বা ছাড়পত্র সংগ্রহ করুন।"
                  : "⚠️ কিছু অতি প্রয়োজনীয় ডকুমেন্ট বা ড্রয়িং সংগ্রহ বাকি আছে।"}
              </span>
              <span>১০০% সম্পূর্ণ</span>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Checklist Sections */}
        <div className="space-y-6">
          {currentCategories.map((category, catIdx) => (
            <div key={catIdx} className="space-y-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border/80 pb-2">
                {category.titleBn}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {category.items.map((item) => {
                  const isChecked = !!checkedIds[item.id];
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleCheck(item.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                        isChecked
                          ? "bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-500/50 shadow-xs"
                          : "bg-card border-border/80 hover:border-border hover:bg-secondary/40"
                      }`}
                    >
                      <button
                        type="button"
                        className="mt-0.5 shrink-0 text-foreground cursor-pointer focus:outline-hidden"
                        aria-label={isChecked ? "Uncheck" : "Check"}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Square className="w-5 h-5 text-muted-foreground/60" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-xs sm:text-sm font-bold ${
                              isChecked ? "text-emerald-900 dark:text-emerald-200 line-through opacity-80" : "text-foreground"
                            }`}
                          >
                            {item.titleBn}
                          </span>
                          {item.required && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 font-semibold">
                              বাধ্যতামূলক
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{item.descBn}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* 5-Step Approval Process Workflow */}
        <section className="mt-14 pt-10 border-t border-border">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              বিল্ডিং প্ল্যান পাসিংয়ের ৫টি মূল ধাপ
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              জমির ডিজিটাল সার্ভে থেকে শুরু করে অনুমোদিত নকশা হাতে পাওয়ার সহজ রূপরেখা
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {STEPS.map((s, idx) => (
              <div key={idx} className="bg-card p-4 rounded-xl border border-border/80 shadow-xs relative flex flex-col justify-between">
                <div>
                  <span className="text-2xl font-black text-accent/30 block mb-1">{s.step}</span>
                  <h4 className="text-xs sm:text-sm font-bold text-foreground mb-1.5">{s.titleBn}</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{s.descBn}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Triple H Engineering Consultation CTA Card */}
        <div className="mt-12 bg-gradient-to-r from-accent/15 via-primary/10 to-accent/15 border-2 border-accent/30 rounded-2xl p-6 sm:p-8 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/20 text-accent mb-1">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg sm:text-2xl font-extrabold text-foreground">
            কোনো ড্রয়িং, সয়েল টেস্ট বা ছাড়পত্র নিয়ে ভাবছেন?
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
            ট্রিপল এইচ কনসালটেন্সির অভিজ্ঞ স্ট্রাকচারাল ইঞ্জিনিয়ার ও রাজউক সনদপ্রাপ্ত আর্কিটেক্টদের মাধ্যমে সম্পূর্ণ প্ল্যান প্রস্তুত ও অনুমোদনের পূর্ণ সহায়তা নিন।
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href={`https://wa.me/8801778506500?text=${encodeURIComponent(
                "আসসালামু আলাইকুম ইঞ্জিনিয়ার হাসমত ভাই, আমি রাজউক/পৌরসভা প্ল্যান অনুমোদনের জন্য পরামর্শ চাই।"
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="w-full sm:w-auto font-bold bg-[#25D366] hover:bg-[#1EBE5D] text-white">
                <WhatsAppIcon className="w-4 h-4 mr-2" /> হোয়াটসঅ্যাপে পরামর্শ নিন
              </Button>
            </a>
            <Link href="/contact">
              <Button variant="outline" className="w-full sm:w-auto font-bold border-accent/40 hover:bg-accent/10">
                <Phone className="w-4 h-4 mr-2 text-accent" /> সরাসরি কল করুন: 01778-506500
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
