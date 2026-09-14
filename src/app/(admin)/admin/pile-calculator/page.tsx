"use client";

import { useState, useMemo } from "react";
import { Calculator, Printer, Info } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PILE_DIAMETERS = [12, 16, 18, 20, 24, 30] as const;
const FOS_OPTIONS = [2.5, 3.0] as const;

interface CalcInputs {
  diameterInch: number;
  depthFt: number;
  skinFriction: number;
  endBearing: number;
  numPiles: number;
  fos: number;
}

interface CalcResults {
  radius: number;
  perimeter: number;
  area: number;
  skinForce: number;
  endForce: number;
  ultimate: number;
  safePerPile: number;
  totalSafe: number;
  totalSafeKN: number;
}

function calculate(inp: CalcInputs): CalcResults | null {
  if (!inp.depthFt || !inp.skinFriction || !inp.endBearing || !inp.numPiles || !inp.fos) return null;
  const radius = inp.diameterInch / 24;
  const perimeter = 2 * Math.PI * radius;
  const area = Math.PI * radius * radius;
  const skinForce = perimeter * inp.depthFt * inp.skinFriction;
  const endForce = area * inp.endBearing;
  const ultimate = skinForce + endForce;
  const safePerPile = ultimate / inp.fos;
  const totalSafe = safePerPile * inp.numPiles;
  const totalSafeKN = totalSafe * 9.81;
  return { radius, perimeter, area, skinForce, endForce, ultimate, safePerPile, totalSafe, totalSafeKN };
}

function fmt(n: number, d = 2) { return n.toFixed(d); }

function todayStr() {
  return new Date().toLocaleDateString("en-BD", { day: "2-digit", month: "long", year: "numeric" });
}

export default function PileCalculatorPage() {
  const [inputs, setInputs] = useState<CalcInputs>({
    diameterInch: 16,
    depthFt: 0,
    skinFriction: 0,
    endBearing: 0,
    numPiles: 1,
    fos: 3.0,
  });

  const set = (k: keyof CalcInputs, v: number) => setInputs((prev) => ({ ...prev, [k]: v }));
  const results = useMemo(() => calculate(inputs), [inputs]);

  const handlePrint = () => {
    if (!results) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Pile Load Capacity Summary</title>
  <style>
    body { font-family: "Courier New", monospace; font-size: 13px; margin: 40px; color: #000; }
    h2 { text-align: center; font-size: 16px; margin: 0; letter-spacing: 1px; }
    .sub { text-align: center; font-size: 13px; margin: 4px 0 16px; }
    .divider { border-top: 2px solid #000; margin: 10px 0; }
    .thin { border-top: 1px dashed #555; margin: 8px 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    td { padding: 3px 0; }
    td.val { text-align: right; font-weight: bold; }
    .footer { margin-top: 24px; font-size: 12px; }
    @media print { body { margin: 20px; } }
  </style>
</head>
<body>
  <h2>TRIPLE H PLANDRAFT &amp; ENGINEERING</h2>
  <div class="sub">PILING LOAD CAPACITY SUMMARY</div>
  <div class="divider"></div>
  <table>
    <tr><td>Pile Type</td><td class="val">Bored Cast-in-Situ RCC Pile</td></tr>
    <tr><td>Pile Diameter</td><td class="val">${inputs.diameterInch} inch</td></tr>
    <tr><td>Pile Depth</td><td class="val">${inputs.depthFt} ft</td></tr>
    <tr><td>Method</td><td class="val">BNBC Skin Friction + End Bearing</td></tr>
    <tr><td>Factor of Safety (FOS)</td><td class="val">${inputs.fos}</td></tr>
  </table>
  <div class="thin"></div>
  <table>
    <tr><td>Skin Friction (fs)</td><td class="val">${inputs.skinFriction} ton/sft</td></tr>
    <tr><td>End Bearing (fb)</td><td class="val">${inputs.endBearing} ton/sft</td></tr>
    <tr><td>Pile Perimeter</td><td class="val">${fmt(results!.perimeter)} ft</td></tr>
    <tr><td>Pile Cross-section Area</td><td class="val">${fmt(results!.area)} sft</td></tr>
  </table>
  <div class="thin"></div>
  <table>
    <tr><td>Skin Friction Component</td><td class="val">${fmt(results!.skinForce)} ton/pile</td></tr>
    <tr><td>End Bearing Component</td><td class="val">${fmt(results!.endForce)} ton/pile</td></tr>
    <tr><td>Ultimate Capacity</td><td class="val">${fmt(results!.ultimate)} ton/pile</td></tr>
    <tr><td><strong>Safe Working Load</strong></td><td class="val"><strong>${fmt(results!.safePerPile)} ton/pile</strong></td></tr>
    <tr><td>Number of Piles</td><td class="val">${inputs.numPiles}</td></tr>
    <tr><td><strong>Total Safe Load</strong></td><td class="val"><strong>${fmt(results!.totalSafe)} ton</strong></td></tr>
    <tr><td>Total Safe Load (kN)</td><td class="val">${fmt(results!.totalSafeKN)} kN</td></tr>
  </table>
  <div class="divider"></div>
  <div class="footer">
    <p>Engineer: Md. Hasmot Ali (Chief Engineering Consultant)</p>
    <p>Organization: Triple H Plandraft &amp; Engineering</p>
    <p>Date: ${todayStr()}</p>
    <br/>
    <p><em>Note: This is a preliminary estimate based on BNBC method. Actual design requires soil test report and expert engineering review.</em></p>
  </div>
  <script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`);
    win.document.close();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">পাইল লোড ক্যাপাসিটি ক্যালকুলেটর</h1>
        <p className="text-muted-foreground mt-1">
          Deep Pile Load Capacity Calculator — BNBC (Skin Friction + End Bearing)
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calculator className="w-5 h-5 text-accent" />
              ইনপুট প্যারামিটার
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="diameter">Pile Diameter (inches)</Label>
              <select
                id="diameter"
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm font-medium"
                value={inputs.diameterInch}
                onChange={(e) => set("diameterInch", Number(e.target.value))}
              >
                {PILE_DIAMETERS.map((d) => (
                  <option key={d} value={d}>{d}&quot;</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="depth">Pile Depth (feet)</Label>
              <Input
                id="depth"
                type="number"
                min="0"
                step="0.5"
                placeholder="e.g. 50"
                value={inputs.depthFt || ""}
                onChange={(e) => set("depthFt", Number(e.target.value))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="skin">Skin Friction Value (ton/sft)</Label>
              <Input
                id="skin"
                type="number"
                min="0"
                step="0.1"
                placeholder="e.g. 1.0"
                value={inputs.skinFriction || ""}
                onChange={(e) => set("skinFriction", Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">Typical range: 0.5 – 2.0 ton/sft</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="end">End Bearing Value (ton/sft)</Label>
              <Input
                id="end"
                type="number"
                min="0"
                step="0.5"
                placeholder="e.g. 3.0"
                value={inputs.endBearing || ""}
                onChange={(e) => set("endBearing", Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">Typical range: 2.0 – 5.0 ton/sft</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="piles">Number of Piles</Label>
                <Input
                  id="piles"
                  type="number"
                  min="1"
                  step="1"
                  value={inputs.numPiles}
                  onChange={(e) => set("numPiles", Number(e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fos">Factor of Safety</Label>
                <select
                  id="fos"
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm font-medium"
                  value={inputs.fos}
                  onChange={(e) => set("fos", Number(e.target.value))}
                >
                  {FOS_OPTIONS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          {results ? (
            <Card className="border-accent/40 bg-accent/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-accent">
                  <Calculator className="w-5 h-5" />
                  গণনার ফলাফল
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg bg-muted/50 p-3 space-y-1.5 text-sm">
                  <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">পাইল জ্যামিতি</p>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pile Perimeter</span>
                    <span className="font-semibold">{fmt(results.perimeter)} ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cross-section Area</span>
                    <span className="font-semibold">{fmt(results.area)} sft</span>
                  </div>
                </div>

                <div className="rounded-lg bg-muted/50 p-3 space-y-1.5 text-sm">
                  <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">ধারণ ক্ষমতার উপাদান</p>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Skin Friction Component</span>
                    <span className="font-semibold">{fmt(results.skinForce)} ton</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">End Bearing Component</span>
                    <span className="font-semibold">{fmt(results.endForce)} ton</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 mt-2">
                    <span className="font-semibold">Ultimate Capacity</span>
                    <span className="font-bold text-orange-600">{fmt(results.ultimate)} ton</span>
                  </div>
                </div>

                <div className="rounded-xl border-2 border-accent/50 bg-accent/10 p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-base">
                      Safe Working Load{" "}
                      <span className="text-xs text-muted-foreground font-normal">(per pile)</span>
                    </span>
                    <span className="text-2xl font-black text-accent">{fmt(results.safePerPile)} ton</span>
                  </div>
                  {inputs.numPiles > 1 && (
                    <div className="flex justify-between items-center border-t border-accent/30 pt-3">
                      <span className="font-bold text-base">
                        Total Safe Load{" "}
                        <span className="text-xs text-muted-foreground font-normal">({inputs.numPiles} piles)</span>
                      </span>
                      <span className="text-2xl font-black text-green-600 dark:text-green-400">{fmt(results.totalSafe)} ton</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Total Safe Load (kN)</span>
                    <span className="font-semibold">{fmt(results.totalSafeKN)} kN</span>
                  </div>
                </div>

                <Button className="w-full font-bold gap-2 mt-1" variant="outline" onClick={handlePrint}>
                  <Printer className="w-4 h-4" />
                  Print Summary Sheet
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center text-muted-foreground">
                <Calculator className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="font-semibold">সব ইনপুট পূরণ করুন</p>
                <p className="text-sm mt-1">Depth, Skin Friction, End Bearing মান দিলে ফলাফল দেখাবে।</p>
              </CardContent>
            </Card>
          )}

          <Card className="border-yellow-300/50 bg-yellow-50/50 dark:bg-yellow-950/20 dark:border-yellow-900/40">
            <CardContent className="pt-4 pb-4">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800 dark:text-yellow-300 leading-relaxed">
                  এই ক্যালকুলেটর BNBC পদ্ধতিতে Bored Cast-in-Situ RCC Pile-এর আনুমানিক ধারণ ক্ষমতা নির্ধারণ করে।
                  প্রকৃত ডিজাইনের জন্য সয়েল টেস্ট রিপোর্ট ও বিশেষজ্ঞ প্রকৌশলীর পরামর্শ নিন।
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
