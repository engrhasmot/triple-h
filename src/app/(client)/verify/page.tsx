"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Search, ArrowRight, FileCheck, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function VerifyIndexPage() {
  const [docId, setDocId] = useState("");
  const router = useRouter();

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docId.trim()) return;
    router.push(`/verify/${encodeURIComponent(docId.trim())}`);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-16 px-4">
      <div className="max-w-xl w-full space-y-6 text-center">
        <div className="space-y-3">
          <Badge variant="outline" className="px-3 py-1 bg-emerald-500/10 text-emerald-700 border-emerald-500/20 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Triple H Engineering Authentication
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            ডকুমেন্ট ও ড্রয়িং ভেরিফিকেশন
          </h1>
          <p className="text-sm text-muted-foreground">
            আপনার কোটেশন, বিল, মানি রিসিট অথবা অনুমোদিত নকশার রেফারেন্স আইডি দিয়ে এর অফিসিয়াল বৈধতা যাচাই করুন।
          </p>
        </div>

        <Card className="border-2 shadow-sm text-left">
          <CardContent className="p-6">
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Document Reference ID / ফাইল নম্বর
                </label>
                <div className="relative">
                  <FileCheck className="w-5 h-5 absolute left-3.5 top-3.5 text-muted-foreground" />
                  <Input
                    className="pl-11 h-12 text-base font-mono uppercase"
                    placeholder="যেমন: TH-2026-0001 বা REC-20260908"
                    value={docId}
                    onChange={(e) => setDocId(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-12 font-bold bg-accent hover:bg-accent/90 gap-2">
                যাচাই করুন (Verify Now) <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-4 pt-4 text-xs text-muted-foreground">
          <div className="p-3 bg-muted/30 rounded-xl border">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
            <p className="font-semibold text-foreground">IEB Certified</p>
            <p className="text-[10px]">Engineer Validation</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-xl border">
            <ShieldCheck className="w-4 h-4 text-blue-600 mx-auto mb-1" />
            <p className="font-semibold text-foreground">Anti-Fraud</p>
            <p className="text-[10px]">Tamper Proof Record</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-xl border">
            <FileCheck className="w-4 h-4 text-accent mx-auto mb-1" />
            <p className="font-semibold text-foreground">Instant Proof</p>
            <p className="text-[10px]">RAJUK & Municipal</p>
          </div>
        </div>
      </div>
    </div>
  );
}
