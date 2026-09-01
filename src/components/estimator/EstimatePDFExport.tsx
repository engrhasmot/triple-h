"use client";

import { useRef } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EstimateData {
  totalArea: number;
  floors: number;
  areaPerFloor: number;
  quality: string;
  rate: number;
  minCost: number;
  maxCost: number;
  breakdown: Record<string, { label: string; percentage: number; min: number; max: number }>;
}

interface Props {
  result: EstimateData;
  clientName: string;
  clientPhone: string;
}

function formatBDT(val: number) {
  if (val >= 10000000) return `${(val / 10000000).toFixed(2)} Crore BDT`;
  return `${(val / 100000).toFixed(2)} Lakh BDT`;
}

function formatNum(val: number) {
  return `৳ ${val.toLocaleString("en-BD")}`;
}

export default function EstimatePDFExport({ result, clientName, clientPhone }: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const el = printRef.current;
    if (!el) return;

    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;

    const today = new Date().toLocaleDateString("en-BD", {
      day: "2-digit", month: "long", year: "numeric",
    });
    const refNo = `TH-EST-${Date.now().toString().slice(-6)}`;

    printWindow.document.write(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cost Estimate — Triple H Engineering</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; background: #fff; }
    .page { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 12mm 14mm; }

    /* Header */
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #d4a017; padding-bottom: 12px; margin-bottom: 20px; }
    .company-name { font-size: 20px; font-weight: 900; color: #1a1a2e; letter-spacing: -0.5px; }
    .company-slogan { font-size: 11px; color: #888; margin-top: 2px; }
    .company-contact { text-align: right; font-size: 10.5px; color: #555; line-height: 1.6; }
    
    /* Title Banner */
    .title-banner { background: linear-gradient(135deg, #1a1a2e, #2d2d4e); color: #fff; border-radius: 10px; padding: 18px 24px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
    .title-banner h1 { font-size: 18px; font-weight: 800; }
    .title-banner .ref { font-size: 11px; background: rgba(212,160,23,0.2); border: 1px solid #d4a017; color: #d4a017; padding: 4px 10px; border-radius: 6px; font-weight: 700; }

    /* Client Info */
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
    .info-box { background: #f8f9fc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 16px; }
    .info-box .label { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #888; font-weight: 700; margin-bottom: 4px; }
    .info-box .value { font-size: 14px; font-weight: 700; color: #1a1a2e; }
    .info-box .sub { font-size: 11px; color: #666; margin-top: 2px; }

    /* Cost Highlight */
    .cost-highlight { background: linear-gradient(135deg, #d4a01715, #d4a01730); border: 2px solid #d4a017; border-radius: 12px; padding: 20px 24px; text-align: center; margin-bottom: 24px; }
    .cost-highlight .label { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #888; font-weight: 700; }
    .cost-highlight .amount { font-size: 30px; font-weight: 900; color: #1a1a2e; margin: 6px 0; }
    .cost-highlight .sub { font-size: 12px; color: #666; }
    .cost-highlight .badges { display: flex; justify-content: center; gap: 10px; margin-top: 12px; flex-wrap: wrap; }
    .badge { background: #fff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 5px 12px; font-size: 11px; font-weight: 600; color: #1a1a2e; }

    /* Breakdown Table */
    .section-title { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #1a1a2e; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 2px solid #e5e7eb; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    thead tr { background: #1a1a2e; color: #fff; }
    thead th { padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; }
    thead th:last-child { text-align: right; }
    tbody tr { border-bottom: 1px solid #f0f0f0; }
    tbody tr:last-child { border-bottom: 2px solid #e5e7eb; font-weight: 700; background: #f8f9fc; }
    td { padding: 10px 14px; font-size: 12px; }
    td:last-child { text-align: right; }
    .bar-cell { width: 100px; }
    .bar-bg { background: #e5e7eb; border-radius: 4px; height: 6px; }
    .bar-fill { background: #d4a017; height: 6px; border-radius: 4px; }

    /* Progress row */
    .pct { font-size: 11px; color: #888; font-weight: 600; }

    /* Disclaimer */
    .disclaimer { background: #fffbeb; border-left: 4px solid #d4a017; padding: 12px 16px; font-size: 10.5px; color: #666; line-height: 1.7; border-radius: 0 8px 8px 0; margin-bottom: 20px; }

    /* Footer */
    .footer { border-top: 2px solid #e5e7eb; padding-top: 12px; display: flex; justify-content: space-between; align-items: center; }
    .footer-left { font-size: 10px; color: #888; }
    .footer-right { text-align: right; font-size: 10px; color: #888; }
    .footer-brand { font-size: 12px; font-weight: 800; color: #1a1a2e; }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page { margin: 0; padding: 10mm 12mm; }
    }
  </style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <div>
      <div class="company-name">TRIPLE H PLANDRAFT & ENGINEERING</div>
      <div class="company-slogan">পরিকল্পিত নকশা, নিরাপদ নির্মাণ • Planned Design, Safe Construction</div>
    </div>
    <div class="company-contact">
      Aysha Monjil, House 14/05, Ward No 1, Noyabari, Savar Radio Colony, Dhaka<br/>
      📞 01778-506500 | 01631-186218<br/>
      📧 info@tripleh.com.bd
    </div>
  </div>

  <!-- Title Banner -->
  <div class="title-banner">
    <div>
      <h1>Construction Cost Estimate Report</h1>
      <div style="font-size:12px; color:rgba(255,255,255,0.7); margin-top:4px;">Prepared on ${today}</div>
    </div>
    <div class="ref">Ref: ${refNo}</div>
  </div>

  <!-- Client + Project Info -->
  <div class="info-grid">
    <div class="info-box">
      <div class="label">Prepared For</div>
      <div class="value">${clientName || "Valued Client"}</div>
      <div class="sub">📞 ${clientPhone || "—"}</div>
    </div>
    <div class="info-box">
      <div class="label">Project Details</div>
      <div class="value">${result.areaPerFloor.toLocaleString()} Sq.Ft × ${result.floors} Floor(s)</div>
      <div class="sub">Total Built Area: ${result.totalArea.toLocaleString()} Sq.Ft</div>
    </div>
    <div class="info-box">
      <div class="label">Construction Quality</div>
      <div class="value" style="text-transform:capitalize">${result.quality}</div>
      <div class="sub">Rate: ৳${result.rate.toLocaleString()} per Sq.Ft</div>
    </div>
    <div class="info-box">
      <div class="label">Report Date</div>
      <div class="value">${today}</div>
      <div class="sub">Valid for 30 days from issue date</div>
    </div>
  </div>

  <!-- Cost Highlight -->
  <div class="cost-highlight">
    <div class="label">Estimated Construction Cost Range</div>
    <div class="amount">${formatBDT(result.minCost)} – ${formatBDT(result.maxCost)}</div>
    <div class="sub">Bangladeshi Taka (BDT) • Excluding Land Cost</div>
    <div class="badges">
      <div class="badge">Min: ${formatNum(result.minCost)}</div>
      <div class="badge">Max: ${formatNum(result.maxCost)}</div>
      <div class="badge">Avg: ${formatNum(Math.round((result.minCost + result.maxCost) / 2))}</div>
    </div>
  </div>

  <!-- Breakdown Table -->
  <div class="section-title">Detailed Cost Breakdown</div>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Work Category</th>
        <th>% Share</th>
        <th class="bar-cell">Progress</th>
        <th>Min Amount</th>
        <th>Max Amount</th>
      </tr>
    </thead>
    <tbody>
      ${Object.entries(result.breakdown).map(([, item], i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${item.label}</td>
        <td class="pct">${item.percentage}%</td>
        <td>
          <div class="bar-bg"><div class="bar-fill" style="width:${item.percentage}%"></div></div>
        </td>
        <td>${formatNum(item.min)}</td>
        <td>${formatNum(item.max)}</td>
      </tr>`).join("")}
      <tr>
        <td></td>
        <td><strong>Total Estimated Cost</strong></td>
        <td class="pct">100%</td>
        <td></td>
        <td><strong>${formatNum(result.minCost)}</strong></td>
        <td><strong>${formatNum(result.maxCost)}</strong></td>
      </tr>
    </tbody>
  </table>

  <!-- Disclaimer -->
  <div class="disclaimer">
    <strong>⚠️ Important Disclaimer:</strong> This estimate is a preliminary approximation based on current average market rates in Bangladesh. Actual costs may vary based on land conditions, material price fluctuations, labour rates, structural complexity, and contractor agreements. This report does not constitute a contract or binding quotation. For an accurate Bill of Quantities (BOQ), please contact our engineering team for a site visit and detailed assessment.
  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="footer-left">
      <div class="footer-brand">Triple H Plandraft & Engineering</div>
      Aysha Monjil, House 14/05, Ward No 1, Noyabari, Savar Radio Colony, Dhaka, Bangladesh
    </div>
    <div class="footer-right">
      Ref: ${refNo} • ${today}<br/>
      This document is computer generated.
    </div>
  </div>

</div>
<script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); }</script>
</body>
</html>`);
    printWindow.document.close();
  };

  // Hidden printable div (not actually rendered in main page, just used for ref)
  return (
    <>
      <div ref={printRef} className="hidden" />
      <Button
        type="button"
        variant="outline"
        onClick={handlePrint}
        className="w-full h-14 text-base font-bold border-primary text-primary hover:bg-primary hover:text-primary-foreground gap-2"
      >
        <Download className="w-5 h-5" />
        Download PDF Report
      </Button>
    </>
  );
}
