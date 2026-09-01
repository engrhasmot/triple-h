"use client";

import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { Search, FileText, Loader2, CheckCircle2, Clock, AlertCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

type PlanStatusType = 'submitted' | 'under-review' | 'revision-required' | 'approved' | 'rejected';

interface StatusHistoryEntry {
  status: PlanStatusType;
  note: string;
  updatedBy: string;
  date: string;
}

interface PlanDocument {
  name: string;
  url: string;
  uploadedAt: string;
}

interface PlanData {
  fileId: string;
  clientName: string;
  projectTitle: string;
  location: string;
  currentStatus: PlanStatusType;
  statusHistory: StatusHistoryEntry[];
  documents: PlanDocument[];
  submissionDate: string;
  expectedCompletionDate?: string;
}

const STAGES: { id: PlanStatusType; label: string }[] = [
  { id: 'submitted', label: 'Submitted' },
  { id: 'under-review', label: 'Under Review' },
  { id: 'revision-required', label: 'Revision' },
  { id: 'approved', label: 'Approved' },
];

export default function PlanStatusTracker() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState<PlanData | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setPlan(null);

    try {
      const res = await fetch(`/api/track?query=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch tracking information");
      }

      setPlan(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStageIcon = (stageId: PlanStatusType, currentStatus: PlanStatusType) => {
    const stageIndex = STAGES.findIndex(s => s.id === stageId);
    const currentIndex = STAGES.findIndex(s => s.id === currentStatus);
    
    // Special case for rejected
    if (currentStatus === 'rejected' && stageId === 'approved') {
      return <XCircle className="w-8 h-8 text-destructive" />;
    }

    if (stageIndex < currentIndex || (stageIndex === currentIndex && currentStatus === 'approved')) {
      return <CheckCircle2 className="w-8 h-8 text-primary" />;
    } else if (stageIndex === currentIndex) {
      if (currentStatus === 'revision-required') return <AlertCircle className="w-8 h-8 text-amber-500" />;
      return <Clock className="w-8 h-8 text-blue-500" />;
    }
    return <div className="w-8 h-8 rounded-full border-2 border-muted-foreground bg-muted" />;
  };

  const getStageLineColor = (stageIndex: number, currentStatus: PlanStatusType) => {
    const currentIndex = STAGES.findIndex(s => s.id === currentStatus);
    if (currentStatus === 'rejected') return "bg-muted";
    return stageIndex < currentIndex ? "bg-primary" : "bg-muted";
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Search Section */}
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold">Track Your Plan</CardTitle>
          <CardDescription>
            Enter your File ID or registered mobile number to check the approval status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                <Search className="w-5 h-5" />
              </div>
              <Input
                type="text"
                placeholder="e.g. TH-2026-0001 or 017..."
                className="pl-10 h-12 text-lg"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="h-12 px-8" disabled={loading || !query.trim()}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Track"}
            </Button>
          </form>

          {error && (
            <div className="mt-4 p-4 text-sm text-destructive bg-destructive/10 rounded-md text-center border border-destructive/20 animate-in fade-in">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {plan && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          
          {/* Project Overview */}
          <Card>
            <CardHeader className="pb-4 border-b">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <CardTitle className="text-xl">{plan.projectTitle}</CardTitle>
                    <Badge variant={plan.currentStatus === 'approved' ? 'default' : plan.currentStatus === 'rejected' ? 'destructive' : 'secondary'}>
                      {plan.currentStatus.toUpperCase().replace('-', ' ')}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm">
                    File ID: <span className="font-mono font-medium text-foreground">{plan.fileId}</span>
                  </CardDescription>
                </div>
                <div className="text-left md:text-right text-sm">
                  <p><span className="text-muted-foreground">Client:</span> {plan.clientName}</p>
                  <p><span className="text-muted-foreground">Location:</span> {plan.location}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              
              {/* Timeline / Stepper */}
              <div className="py-6">
                <div className="flex justify-between items-center relative">
                  {/* Connecting Lines */}
                  <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 flex z-0">
                    {STAGES.slice(0, -1).map((_, idx) => (
                      <div key={idx} className={`flex-1 h-full ${getStageLineColor(idx, plan.currentStatus)} transition-colors duration-500`} />
                    ))}
                  </div>

                  {/* Nodes */}
                  {STAGES.map((stage) => {
                    const isRejected = plan.currentStatus === 'rejected' && stage.id === 'approved';
                    const label = isRejected ? 'Rejected' : stage.label;
                    
                    return (
                      <div key={stage.id} className="relative z-10 flex flex-col items-center bg-card px-2">
                        {getStageIcon(stage.id, plan.currentStatus)}
                        <span className="text-xs md:text-sm font-medium mt-2 text-center whitespace-nowrap">
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status History & Remarks */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Status History & Remarks</h3>
                <div className="space-y-4">
                  {plan.statusHistory.slice().reverse().map((history, idx) => (
                    <div key={idx} className="flex gap-4 p-4 rounded-lg bg-secondary/30 border border-secondary">
                      <div className="hidden sm:flex shrink-0 w-12 h-12 items-center justify-center rounded-full bg-background border">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-grow">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1">
                          <span className="font-semibold capitalize text-primary">{history.status.replace('-', ' ')}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(history.date), "MMM dd, yyyy - hh:mm a")}
                          </span>
                        </div>
                        {history.note ? (
                          <p className="text-sm text-foreground mt-1 bg-background p-3 rounded border">
                            <span className="font-medium text-xs text-muted-foreground uppercase tracking-wider block mb-1">Engineer&apos;s Remark:</span>
                            {history.note}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground mt-1 italic">Status updated.</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
