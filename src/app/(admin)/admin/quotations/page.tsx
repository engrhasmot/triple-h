"use client";

import { useState, useId } from "react";
import Image from "next/image";
import {
  Printer,
  Plus,
  Trash2,
  Share2,
  RotateCcw,
  Building2,
  FileText,
  Phone,
  Calendar,
  CheckCircle2,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface QuotationItem {
  id: string;
  description: string;
  qty: number;
  unit: string;
  rate: number;
}

const COMMON_SERVICES = [
  "2D Architectural Floor Plan & Layout",
  "3D Photorealistic Exterior Elevation",
  "3D Interior Design & Rendering",
  "Structural Design & Detailing (BNBC Compliant)",
  "Plumbing, Sanitary & Drainage Layout",
  "Electrical Circuit & Lighting Design",
  "Rajuk / Municipality Plan Passing Clearance",
  "BOQ (Bill of Quantities) & Cost Estimation",
  "Soil Test & Geotechnical Investigation",
  "Construction Site Supervision & Quality Audit",
];

export default function AdminQuotationsPage() {
  const [docType, setDocType] = useState<"quotation" | "bill">("quotation");
  const [docNumber, setDocNumber] = useState(`TH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);

  // Client Details
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [projectLocation, setProjectLocation] = useState("");

  // Items
  const [items, setItems] = useState<QuotationItem[]>([
    {
      id: "1",
      description: "2D Architectural Floor Plan & Layout",
      qty: 1200,
      unit: "sqft",
      rate: 15,
    },
    {
      id: "2",
      description: "3D Photorealistic Exterior Elevation",
      qty: 1,
      unit: "package",
      rate: 12000,
    },
  ]);

  // Discount & Advance
  const [discount, setDiscount] = useState<number>(0);
  const [advancePaid, setAdvancePaid] = useState<number>(0);
  const [terms, setTerms] = useState(
    "১. কাজের শুরুতে ৫০% অগ্রিম প্রদেয়।\n২. ডিজাইন ফাইনাল করার পর ৩০% এবং চূড়ান্ত ডেলিভারির সময় অবশিষ্ট ২০% প্রদেয়।\n৩. ডেলিভারি সময়সীমা: ৭ থেকে ১০ কার্যদিবস।"
  );

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(7),
        description: "",
        qty: 1,
        unit: "item",
        rate: 0,
      },
    ]);
  };

  const updateItem = (id: string, field: keyof QuotationItem, value: unknown) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const removeItem = (id: string) => {
    if (items.length === 1) {
      toast.error("At least one item is required");
      return;
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Calculations
  const subtotal = items.reduce((acc, item) => acc + (Number(item.qty) || 0) * (Number(item.rate) || 0), 0);
  const grandTotal = Math.max(0, subtotal - (Number(discount) || 0));
  const dueAmount = Math.max(0, grandTotal - (Number(advancePaid) || 0));

  const resetForm = () => {
    setDocNumber(`TH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setClientName("");
    setClientPhone("");
    setProjectTitle("");
    setProjectLocation("");
    setDiscount(0);
    setAdvancePaid(0);
    setItems([
      {
        id: "1",
        description: "2D Architectural Floor Plan & Layout",
        qty: 1200,
        unit: "sqft",
        rate: 15,
      },
    ]);
    toast.success("Form reset");
  };

  const printDocument = () => {
    if (!clientName) {
      toast.error("Please enter Client Name before printing");
      return;
    }
    window.print();
  };

  const shareWhatsApp = () => {
    if (!clientPhone) {
      toast.error("Please enter Client Phone number");
      return;
    }

    const cleanPhone = clientPhone.replace(/[+\s-]/g, "").replace(/^0/, "880");
    const docTitle = docType === "quotation" ? "OFFICIAL QUOTATION" : "BILL / INVOICE";

    const itemLines = items
      .map(
        (it, idx) =>
          `${idx + 1}. ${it.description}: ${it.qty} ${it.unit} × ৳${it.rate} = ৳${(it.qty * it.rate).toLocaleString()}`
      )
      .join("\n");

    const message = [
      `*${docTitle}*`,
      `*Triple H Plandraft & Engineering*`,
      `Doc No: #${docNumber}`,
      `তারিখ: ${date}`,
      ``,
      `👤 ক্লায়েন্ট: ${clientName}`,
      `🏗️ প্রজেক্ট: ${projectTitle || "N/A"}`,
      `📍 লোকেশন: ${projectLocation || "N/A"}`,
      ``,
      `📋 *কাজের বিবরণ:*`,
      itemLines,
      ``,
      `💰 সাব-টোটাল: ৳${subtotal.toLocaleString()}`,
      discount > 0 ? `🎁 ডিসকাউন্ট: ৳${discount.toLocaleString()}` : null,
      `✅ সর্বমোট: *৳${grandTotal.toLocaleString()}*`,
      advancePaid > 0 ? `💵 অগ্রিম জমা: ৳${advancePaid.toLocaleString()}` : null,
      advancePaid > 0 ? `⏳ বর্তমান বকেয়া: *৳${dueAmount.toLocaleString()}*` : null,
      ``,
      `📞 যোগাযোগ: 01778-506500, 01631-186218`,
      `🌐 www.tripleh.com.bd`,
    ]
      .filter(Boolean)
      .join("\n");

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Controls Bar (hidden during print) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden bg-card p-4 rounded-xl border">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Quotation & Bill Generator
          </h1>
          <p className="text-sm text-muted-foreground">
            Create, print, and WhatsApp official quotations and invoices
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="inline-flex rounded-lg border p-1 bg-muted/30">
            <button
              type="button"
              onClick={() => setDocType("quotation")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                docType === "quotation"
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Quotation
            </button>
            <button
              type="button"
              onClick={() => setDocType("bill")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                docType === "bill"
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Bill / Invoice
            </button>
          </div>

          <Button variant="outline" size="sm" onClick={resetForm}>
            <RotateCcw className="w-4 h-4 mr-1.5" />
            Reset
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={shareWhatsApp}
            className="text-emerald-700 border-emerald-300 hover:bg-emerald-50"
          >
            <MessageCircle className="w-4 h-4 mr-1.5" />
            WhatsApp
          </Button>

          <Button size="sm" onClick={printDocument} className="bg-primary hover:bg-primary/90">
            <Printer className="w-4 h-4 mr-1.5" />
            Print / Save PDF
          </Button>
        </div>
      </div>

      {/* Editor & Printable Paper */}
      <div className="bg-white text-slate-900 shadow-xl rounded-2xl border p-8 md:p-12 print:shadow-none print:border-none print:p-0 print:m-0 print:rounded-none">
        {/* Letterhead Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b pb-6">
          <div className="flex items-start gap-4">
            <div className="relative w-16 h-16 shrink-0 mt-0.5 bg-slate-50 rounded-lg p-1 border border-slate-200/80 flex items-center justify-center print:border-none print:p-0 print:bg-transparent">
              <Image
                src="/images/logo.png"
                alt="Triple H Logo"
                width={64}
                height={64}
                className="object-contain w-14 h-14"
                priority
              />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-blue-950 tracking-tight leading-tight">
                TRIPLE H PLANDRAFT & ENGINEERING
              </h2>
              <p className="text-xs text-slate-500 font-medium tracking-wide mt-0.5">
                Architectural Design • Structural Engineering • Rajuk Approval • Supervision
              </p>
              <p className="text-xs text-slate-600 mt-1">
                House 14/05, Ward 01, Noyabari, Savar Radio Colony, Dhaka
              </p>
              <p className="text-xs text-slate-600">
                📞 +880 1631-186218, +880 1778-506500 | ✉️ info@tripleh.com.bd
              </p>
            </div>
          </div>

          <div className="text-right sm:self-center">
            <div className="inline-block bg-blue-950 text-white font-bold text-sm uppercase px-4 py-1.5 rounded-md mb-2">
              {docType === "quotation" ? "QUOTATION" : "BILL / INVOICE"}
            </div>
            <div className="text-xs text-slate-600 space-y-1">
              <div>
                <span className="font-semibold text-slate-800">Doc No:</span> #{docNumber}
              </div>
              <div>
                <span className="font-semibold text-slate-800">Date:</span> {date}
              </div>
            </div>
          </div>
        </div>

        {/* Client & Project Form Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 bg-slate-50 p-4 rounded-xl border border-slate-100 print:bg-transparent print:p-0 print:border-none">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase">Client Name</label>
              <input
                type="text"
                placeholder="e.g. Engr. Monir Hossain"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full text-sm font-medium bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-900 print:border-none print:p-0"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase">Phone Number</label>
              <input
                type="text"
                placeholder="e.g. 017XXXXXXXX"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full text-sm bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-900 print:border-none print:p-0"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase">Project Title</label>
              <input
                type="text"
                placeholder="e.g. 6-Storied Residential Building"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="w-full text-sm font-medium bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-900 print:border-none print:p-0"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase">Project Location</label>
              <input
                type="text"
                placeholder="e.g. Mirpur DOHS, Dhaka"
                value={projectLocation}
                onChange={(e) => setProjectLocation(e.target.value)}
                className="w-full text-sm bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-900 print:border-none print:p-0"
              />
            </div>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="overflow-x-auto my-6">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-blue-950 text-white font-semibold text-xs uppercase">
                <th className="p-3 w-12 text-center rounded-l">#</th>
                <th className="p-3">Service Description</th>
                <th className="p-3 w-24 text-center">Qty</th>
                <th className="p-3 w-24 text-center">Unit</th>
                <th className="p-3 w-32 text-right">Rate (৳)</th>
                <th className="p-3 w-36 text-right">Total (৳)</th>
                <th className="p-3 w-12 text-center print:hidden rounded-r"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items.map((item, idx) => {
                const rowTotal = (Number(item.qty) || 0) * (Number(item.rate) || 0);
                return (
                  <tr key={item.id} className="hover:bg-slate-50/60">
                    <td className="p-3 text-center text-slate-500 font-medium">{idx + 1}</td>
                    <td className="p-3">
                      <input
                        type="text"
                        list={`services-${item.id}`}
                        placeholder="Service name / details"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, "description", e.target.value)}
                        className="w-full bg-transparent border-0 border-b border-transparent focus:border-slate-400 focus:outline-none py-1 font-medium text-slate-800"
                      />
                      <datalist id={`services-${item.id}`}>
                        {COMMON_SERVICES.map((s) => (
                          <option key={s} value={s} />
                        ))}
                      </datalist>
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => updateItem(item.id, "qty", Number(e.target.value))}
                        className="w-full text-center bg-transparent border rounded p-1 text-slate-800 print:border-none"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => updateItem(item.id, "unit", e.target.value)}
                        className="w-full text-center bg-transparent border rounded p-1 text-slate-800 print:border-none"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        min="0"
                        value={item.rate}
                        onChange={(e) => updateItem(item.id, "rate", Number(e.target.value))}
                        className="w-full text-right bg-transparent border rounded p-1 text-slate-800 print:border-none font-medium"
                      />
                    </td>
                    <td className="p-3 text-right font-bold text-slate-900">
                      ৳{rowTotal.toLocaleString()}
                    </td>
                    <td className="p-3 text-center print:hidden">
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="p-1 rounded text-red-500 hover:bg-red-50"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="mt-3 print:hidden">
            <Button variant="outline" size="sm" onClick={addItem} className="text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Item
            </Button>
          </div>
        </div>

        {/* Summary & Terms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8 pt-4 border-t">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
              Terms & Conditions / Note
            </label>
            <textarea
              rows={4}
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              className="w-full text-xs text-slate-600 bg-slate-50 border rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-900 print:bg-transparent print:border-none print:p-0"
            />
          </div>

          <div className="space-y-2 text-sm text-slate-700 self-end">
            <div className="flex justify-between py-1">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900">৳{subtotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-xs text-slate-500">Discount (৳):</span>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-28 text-right bg-transparent border rounded px-2 py-0.5 text-sm print:border-none"
              />
            </div>

            <div className="flex justify-between py-2 border-t font-bold text-base text-blue-950">
              <span>Grand Total:</span>
              <span>৳{grandTotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-xs text-slate-500">Advance / Paid:</span>
              <input
                type="number"
                min="0"
                value={advancePaid}
                onChange={(e) => setAdvancePaid(Number(e.target.value))}
                className="w-28 text-right bg-transparent border rounded px-2 py-0.5 text-sm print:border-none font-medium text-emerald-700"
              />
            </div>

            <div className="flex justify-between py-1 border-t text-sm font-bold text-red-600">
              <span>Net Due:</span>
              <span>৳{dueAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer & Signature */}
        <div className="mt-16 pt-8 border-t flex justify-between items-end text-xs text-slate-500">
          <div>
            <p className="font-semibold text-slate-800">Thank you for choosing Triple H!</p>
            <p>This is a computer-generated official document.</p>
          </div>

          <div className="text-center w-48 border-t border-slate-400 pt-1.5">
            <p className="font-bold text-slate-900">Authorized Signature</p>
            <p className="text-[11px] text-slate-500">Triple H Plandraft & Engineering</p>
          </div>
        </div>
      </div>
    </div>
  );
}
