"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Loader2, FileText, CheckCircle2, Clock, AlertTriangle, FileX, MapPin, Download, FileDown, Phone, ChevronRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface PlanData {
  _id: string;
  fileId: string;
  clientName: string;
  phone: string;
  projectTitle: string;
  location: string;
  currentStatus: string;
  statusHistory: { status: string; note: string; date: string }[];
  documents: { name: string; url: string; uploadedAt: string }[];
  submissionDate: string;
}

function TrackPlanContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query") || "";
  
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PlanData[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PlanData | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setSearched(true);
    setResults([]);
    setSelectedPlan(null);

    try {
      const res = await fetch(`/api/track?query=${encodeURIComponent(searchQuery)}`);
      const json = await res.json();
      if (json.success && json.data) {
        const plans = Array.isArray(json.data) ? json.data : [json.data];
        setResults(plans);
        // If only one result, auto-select it
        if (plans.length === 1) {
          setSelectedPlan(plans[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const statusFlow = ['submitted', 'under-review', 'revision-required', 'approved', 'rejected'];
  
  const getStatusIcon = (status: string, currentStatus: string, index: number) => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (status === 'rejected') return currentIndex === 4 ? <FileX className="w-5 h-5" /> : <Clock className="w-5 h-5 text-muted-foreground" />;
    if (index < currentIndex || status === 'approved' && currentStatus === 'approved') return <CheckCircle2 className="w-5 h-5" />;
    if (index === currentIndex) {
      if (status === 'revision-required') return <AlertTriangle className="w-5 h-5" />;
      return <Clock className="w-5 h-5" />;
    }
    return <Clock className="w-5 h-5 text-muted-foreground" />;
  };

  const getStatusBg = (status: string, currentStatus: string, index: number) => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (status === 'rejected' && currentIndex === 4) return 'bg-destructive text-destructive-foreground';
    if (index < currentIndex || (status === 'approved' && currentStatus === 'approved')) return 'status-approved';
    if (index === currentIndex) {
      if (status === 'revision-required') return 'status-correction';
      if (status === 'under-review') return 'status-review';
      return 'status-submitted';
    }
    return 'bg-muted border border-border text-muted-foreground';
  };

  const statusLabel: Record<string, string> = {
    'submitted': 'জমা দেওয়া হয়েছে',
    'under-review': 'পর্যালোচনাধীন',
    'revision-required': 'সংশোধন প্রয়োজন',
    'approved': 'অনুমোদিত',
    'rejected': 'বাতিল',
  };

  // ─── Multiple results list view ───
  const renderFileList = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold font-heading text-foreground">
          আপনার {results.length}টি ফাইল পাওয়া গেছে
        </h3>
        <p className="text-sm text-muted-foreground">ফাইল দেখতে ক্লিক করুন</p>
      </div>
      {results.map((plan) => {
        const statusIdx = statusFlow.indexOf(plan.currentStatus);
        return (
          <button
            key={plan._id}
            onClick={() => setSelectedPlan(plan)}
            className="w-full text-left bg-card rounded-2xl border border-border p-5 hover:shadow-lg hover:border-accent/50 transition-all group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-5 h-5 text-accent shrink-0" />
                  <h4 className="font-bold text-foreground font-heading truncate">{plan.projectTitle}</h4>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {plan.location}
                  </span>
                  <span className="font-mono text-xs font-semibold text-primary">{plan.fileId}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBg(plan.currentStatus, plan.currentStatus, statusIdx)}`}>
                  {plan.currentStatus.replace('-', ' ')}
                </span>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );

  // ─── Single plan detail view ───
  const renderPlanDetail = (plan: PlanData) => (
    <div className="bg-card rounded-3xl shadow-2xl overflow-hidden border border-border animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Back button if multiple results */}
      {results.length > 1 && (
        <div className="border-b border-border px-6 py-3">
          <button
            onClick={() => setSelectedPlan(null)}
            className="text-sm text-accent hover:underline font-medium flex items-center gap-1"
          >
            ← সব ফাইল দেখুন ({results.length}টি)
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-primary/5 border-b border-border p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground font-heading">{plan.projectTitle}</h2>
            <p className="text-muted-foreground flex items-center mt-2">
              <MapPin className="w-4 h-4 mr-1" /> {plan.location}
            </p>
            <p className="text-muted-foreground flex items-center mt-1">
              <User className="w-4 h-4 mr-1" /> {plan.clientName}
            </p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">File ID</p>
            <p className="text-2xl font-mono font-bold text-primary">{plan.fileId}</p>
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="p-6 md:p-10">
        <h3 className="text-lg font-bold font-heading mb-6">ফাইলের অবস্থা</h3>
        <div className="relative border-l-2 border-muted ml-4 md:ml-6 space-y-12">
          {statusFlow.map((status, index) => {
            if (status === 'rejected' && plan.currentStatus !== 'rejected') return null;
            
            const historyEntry = plan.statusHistory?.slice().reverse().find((h) => h.status === status);
            const isCurrent = plan.currentStatus === status;
            const isPast = statusFlow.indexOf(plan.currentStatus) > index;
            
            return (
              <div key={status} className={`relative pl-8 md:pl-12 ${(!isCurrent && !isPast && status !== 'rejected') ? 'opacity-40' : ''}`}>
                <div className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${getStatusBg(status, plan.currentStatus, index)}`}>
                  {getStatusIcon(status, plan.currentStatus, index)}
                </div>
                
                <div className="bg-muted/30 p-5 rounded-2xl border border-border">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
                    <h3 className="text-lg font-bold capitalize text-foreground font-heading">
                      {status.replace('-', ' ')}
                      {isCurrent && <span className="ml-2 text-xs text-accent">(বর্তমান)</span>}
                    </h3>
                    {historyEntry && (
                      <span className="text-sm font-medium text-muted-foreground mt-1 sm:mt-0 badge-micro">
                        {format(new Date(historyEntry.date), "MMM dd, yyyy")}
                      </span>
                    )}
                  </div>
                  
                  {historyEntry?.note && (
                    <div className="mt-3 bg-card p-3 rounded-xl border border-border text-sm text-foreground italic">
                      <strong className="text-primary not-italic">Engineer&apos;s Remark:</strong> &ldquo;{historyEntry.note}&rdquo;
                    </div>
                  )}
                  
                  {!historyEntry && isCurrent && (
                    <p className="text-sm text-muted-foreground mt-2">
                      এই ধাপটি বর্তমানে সক্রিয়।
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Documents */}
      {plan.documents && plan.documents.length > 0 && (
        <div className="border-t border-border p-6 md:p-10">
          <h3 className="text-lg font-bold font-heading mb-4 flex items-center gap-2">
            <FileDown className="w-5 h-5 text-accent" />
            Downloadable Documents
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {plan.documents.map((doc, i) => (
              <a
                key={i}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-accent/5 border border-accent/20 rounded-xl hover:bg-accent/10 hover:border-accent/40 transition-all group"
              >
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                  <FileText className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {doc.uploadedAt ? format(new Date(doc.uploadedAt), "dd MMM yyyy") : "Available"}
                  </p>
                </div>
                <Download className="w-4 h-4 text-accent shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Contact CTA */}
      <div className="border-t border-border p-6 md:px-10 pb-8 bg-primary/5">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <p className="text-sm text-muted-foreground">প্রশ্ন আছে? আমাদের সাথে সরাসরি যোগাযোগ করুন।</p>
          <div className="flex gap-3">
            <a href="tel:+8801778506500">
              <Button size="sm" variant="outline" className="font-semibold gap-1.5">
                <Phone className="w-4 h-4" /> 01778-506500
              </Button>
            </a>
            <a href={`https://wa.me/8801778506500?text=আমার File ID: ${plan.fileId} — আমার প্ল্যান সম্পর্কে জানতে চাই।`} target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="font-semibold bg-[#25D366] hover:bg-[#20bd5a] text-white gap-1.5">
                WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-background">
      <section className="bg-primary pt-32 pb-16 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold font-heading text-primary-foreground mb-4">
          Track <span className="text-accent">Plan Status</span>
        </h1>
        <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
          আপনার File ID অথবা ফোন নম্বর দিয়ে প্ল্যানের অবস্থা জানুন।
        </p>
      </section>

      <section className="py-12 max-w-3xl mx-auto px-4 sm:px-6">
        {/* Search Bar */}
        <div className="glass-panel p-2 rounded-2xl shadow-xl flex items-center bg-card mb-12 border border-border">
          <Search className="w-6 h-6 text-muted-foreground ml-4" />
          <input 
            type="text" 
            placeholder="File ID (e.g. TH-2026-001) অথবা ফোন নম্বর" 
            className="flex-grow h-14 bg-transparent border-none focus:ring-0 px-4 text-lg outline-none text-foreground"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
          />
          <Button onClick={() => handleSearch(query)} className="h-12 px-8 bg-accent hover:bg-accent/90 text-primary-foreground font-bold rounded-xl" disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Track"}
          </Button>
        </div>

        {/* No results */}
        {searched && !loading && results.length === 0 && (
          <div className="text-center py-16 bg-muted/30 rounded-3xl border border-dashed border-border">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-foreground mb-2">কোনো ফাইল পাওয়া যায়নি</h3>
            <p className="text-muted-foreground">আপনার দেওয়া তথ্য দিয়ে কোনো ফাইল পাওয়া যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।</p>
          </div>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          selectedPlan ? renderPlanDetail(selectedPlan) : renderFileList()
        )}
      </section>
    </div>
  );
}

export default function TrackPlanPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <TrackPlanContent />
    </Suspense>
  );
}
