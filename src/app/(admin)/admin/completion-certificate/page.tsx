'use client';

import { useState, useEffect } from 'react';
import {
  Award,
  Printer,
  Search,
  Loader2,
  CheckCircle2,
  Building,
  ShieldCheck,
  Calendar,
  User,
  MapPin,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Project {
  _id: string;
  title: string;
  category?: string;
  location?: string;
  area?: string;
  description?: string;
  clientName?: string;
  completedAt?: string;
}

export default function CompletionCertificatePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Certificate Modal
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [certData, setCertData] = useState({
    projectTitle: '',
    clientName: '',
    location: '',
    stories: '৬ তলা বিশিষ্ট আবাসিক ভবন',
    area: '১০,৫০০ বর্গফুট',
    completionDate: format(new Date(), 'yyyy-MM-dd'),
    certificateNo: `TH-CERT-${Math.floor(1000 + Math.random() * 9000)}`,
    codeStandard: 'BNBC 2020 & ACI 318',
  });

  useEffect(() => {
    fetch('/api/projects')
      .then((res) => res.json())
      .then((data) => {
        setProjects(data.data || []);
      })
      .catch(() => {
        toast.error('Failed to load projects');
      })
      .finally(() => setLoading(false));
  }, []);

  const openCertForProject = (p: Project) => {
    setCertData({
      projectTitle: p.title,
      clientName: p.clientName || 'সম্মানিত ক্লায়েন্ট',
      location: p.location || 'ঢাকা, বাংলাদেশ',
      stories: p.category ? `${p.category.toUpperCase()} Project` : 'বহুতল আবাসিক ভবন',
      area: p.area || '৭,৫০০ বর্গফুট',
      completionDate: p.completedAt ? format(new Date(p.completedAt), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      certificateNo: `TH-${p._id.slice(-6).toUpperCase()}`,
      codeStandard: 'BNBC 2020 & ACI 318',
    });
    setCertModalOpen(true);
  };

  const openCustomCert = () => {
    setCertData({
      projectTitle: '',
      clientName: '',
      location: 'ঢাকা, বাংলাদেশ',
      stories: '৬ তলা আবাসিক ভবন',
      area: '৯,৫০০ বর্গফুট',
      completionDate: format(new Date(), 'yyyy-MM-dd'),
      certificateNo: `TH-CERT-${Math.floor(1000 + Math.random() * 9000)}`,
      codeStandard: 'BNBC 2020 & ACI 318',
    });
    setCertModalOpen(true);
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.location && p.location.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-primary" />
            প্রজেক্ট সমাপ্তি ও স্ট্রাকচারাল ফিটনেস সনদপত্র (Project Completion Certificate)
          </h1>
          <p className="text-sm text-muted-foreground">
            নির্মাণ শেষে ক্লায়েন্টকে ফ্রেম বাঁধাই করে রাখার মতো গোল্ডেন-বর্ডার সনদপত্র প্রদান
          </p>
        </div>
        <Button onClick={openCustomCert} className="gap-2">
          <Award className="w-4 h-4" /> কাস্টম সনদ তৈরি করুন
        </Button>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="প্রজেক্টের নাম দিয়ে খুঁজুন..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Project Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          <p>কোনো প্রজেক্ট পাওয়া যায়নি। &ldquo;কাস্টম সনদ তৈরি করুন&rdquo; বাটন ব্যবহার করতে পারেন।</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((proj) => (
            <Card key={proj._id} className="hover:border-primary/50 transition-colors flex flex-col justify-between">
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-base font-bold text-foreground line-clamp-1">
                    {proj.title}
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px] capitalize shrink-0">
                    {proj.category || 'Project'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-3">
                <div className="text-xs text-muted-foreground space-y-1">
                  {proj.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate">{proj.location}</span>
                    </div>
                  )}
                  {proj.area && (
                    <div className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{proj.area}</span>
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => openCertForProject(proj)}
                  className="w-full text-xs gap-1.5 bg-amber-600/10 text-amber-700 hover:bg-amber-600/20 border border-amber-600/20 dark:text-amber-400"
                  variant="outline"
                >
                  <Award className="w-3.5 h-3.5" /> সার্টিফিকেট তৈরি করুন
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Certificate Print Dialog */}
      <Dialog open={certModalOpen} onOpenChange={setCertModalOpen}>
        <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center pr-6">
              <span>স্ট্রাকচারাল সেফটি ও সমাপ্তি সনদপত্র</span>
              <Button size="sm" onClick={() => window.print()} className="gap-1 bg-amber-600 hover:bg-amber-700 text-white">
                <Printer className="w-4 h-4" /> প্রিন্ট সার্টিফিকেট
              </Button>
            </DialogTitle>
          </DialogHeader>

          {/* Edit inputs before printing */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 bg-muted/30 rounded border text-xs print:hidden">
            <div>
              <Label className="text-[10px]">প্রজেক্টের নাম</Label>
              <Input
                value={certData.projectTitle}
                onChange={(e) => setCertData({ ...certData, projectTitle: e.target.value })}
                className="h-7 text-xs"
              />
            </div>
            <div>
              <Label className="text-[10px]">ক্লায়েন্টের নাম</Label>
              <Input
                value={certData.clientName}
                onChange={(e) => setCertData({ ...certData, clientName: e.target.value })}
                className="h-7 text-xs"
              />
            </div>
            <div>
              <Label className="text-[10px]">লোকেশন</Label>
              <Input
                value={certData.location}
                onChange={(e) => setCertData({ ...certData, location: e.target.value })}
                className="h-7 text-xs"
              />
            </div>
            <div>
              <Label className="text-[10px]">কাঠামো / তলা</Label>
              <Input
                value={certData.stories}
                onChange={(e) => setCertData({ ...certData, stories: e.target.value })}
                className="h-7 text-xs"
              />
            </div>
            <div>
              <Label className="text-[10px]">সমাপ্তি তারিখ</Label>
              <Input
                type="date"
                value={certData.completionDate}
                onChange={(e) => setCertData({ ...certData, completionDate: e.target.value })}
                className="h-7 text-xs"
              />
            </div>
            <div>
              <Label className="text-[10px]">সনদ নম্বর</Label>
              <Input
                value={certData.certificateNo}
                onChange={(e) => setCertData({ ...certData, certificateNo: e.target.value })}
                className="h-7 text-xs"
              />
            </div>
          </div>

          {/* Premium Certificate Box */}
          <div className="relative border-8 border-double border-amber-500/80 p-8 md:p-12 rounded-xl bg-card text-foreground space-y-6 shadow-xl print:border-black print:p-6 print:shadow-none">
            {/* Corner Badges */}
            <div className="text-center space-y-2 border-b-2 border-amber-500/40 pb-6">
              <div className="flex justify-center mb-2">
                <div className="p-3 bg-amber-500/10 rounded-full border border-amber-500/30 text-amber-600 dark:text-amber-400">
                  <ShieldCheck className="w-10 h-10" />
                </div>
              </div>
              <div className="text-xs tracking-widest font-black uppercase text-amber-700 dark:text-amber-400">
                TRIPLE H PLANDRAFT & ENGINEERING CONSULTANCY
              </div>
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wider text-foreground font-serif">
                CERTIFICATE OF STRUCTURAL SAFETY
              </h2>
              <p className="text-xs text-muted-foreground tracking-widest uppercase">
                & PROJECT COMPLETION COMPLIANCE
              </p>
            </div>

            {/* Certificate Body */}
            <div className="space-y-4 text-center text-sm py-2">
              <p className="text-muted-foreground italic">
                This is to officially certify that the design, structural analysis, and engineering supervision of:
              </p>

              <div className="space-y-1">
                <h3 className="text-xl md:text-2xl font-black text-foreground">
                  {certData.projectTitle || '[ প্রজেক্টের নাম ]'}
                </h3>
                <p className="text-xs text-muted-foreground font-medium">
                  {certData.stories} • {certData.area}
                </p>
                <p className="text-xs text-muted-foreground">
                  Location: <span className="font-semibold text-foreground">{certData.location}</span>
                </p>
              </div>

              <p className="text-xs text-muted-foreground max-w-lg mx-auto">
                constructed for client <strong className="text-foreground">{certData.clientName}</strong>, has been verified to meet the structural integrity, load criteria, and seismic safety requirements in strict compliance with the{' '}
                <strong className="text-foreground">{certData.codeStandard}</strong>.
              </p>

              <div className="flex justify-center items-center gap-6 pt-2">
                <Badge variant="outline" className="text-xs bg-green-500/10 text-green-700 border-green-500/30 gap-1.5 py-1 px-3">
                  <CheckCircle2 className="w-4 h-4" /> 100% Structural Stability Certified
                </Badge>
              </div>
            </div>

            {/* Signatures & Footer */}
            <div className="pt-8 border-t-2 border-amber-500/40 grid grid-cols-2 gap-8 items-end text-xs">
              <div className="space-y-1">
                <p className="text-muted-foreground font-mono">Certificate ID: {certData.certificateNo}</p>
                <p className="text-muted-foreground">
                  Completion Date: {format(new Date(certData.completionDate), 'dd MMMM yyyy')}
                </p>
                <p className="text-muted-foreground">
                  Issue Date: {format(new Date(), 'dd MMMM yyyy')}
                </p>
              </div>

              <div className="text-right space-y-1">
                <div className="font-bold text-foreground text-sm">Engr. Md. Hasmot Ali</div>
                <div className="text-muted-foreground text-[11px]">B.Sc. in Civil Engineering (AUST)</div>
                <div className="text-muted-foreground font-semibold text-[11px]">Founder & Principal Engineer</div>
                <div className="text-[10px] text-muted-foreground">Triple H Plandraft & Engineering</div>
                <div className="pt-6 border-t border-foreground/30 w-44 ml-auto text-[10px] text-muted-foreground">
                  Seal & Signature
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
