'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Users2,
  Plus,
  Trash2,
  Printer,
  Loader2,
  Search,
  Receipt,
  CheckCircle2,
  XCircle,
  Calendar,
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
import { adminFetch } from '@/lib/admin-fetch';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Worker {
  name: string;
  role: string;
  present: boolean;
  dailyWage: number;
}

interface HaziraRecord {
  _id: string;
  projectName: string;
  date: string;
  workers: Worker[];
  totalWage: number;
  notes?: string;
  createdAt: string;
}

interface Stats {
  totalRecords: number;
  todayWage: number;
  monthWage: number;
}

const ROLES = [
  { value: 'mason', label: 'রাজমিস্ত্রি (Mason)' },
  { value: 'helper', label: 'হেলপার / যোগালি (Helper)' },
  { value: 'rod-binder', label: 'রড মিস্ত্রি (Rod Binder)' },
  { value: 'shuttering', label: 'শাটারিং মিস্ত্রি (Shuttering)' },
  { value: 'painter', label: 'রং মিস্ত্রি (Painter)' },
  { value: 'plumber', label: 'প্লাম্বার (Plumber)' },
  { value: 'electrician', label: 'ইলেকট্রিশিয়ান (Electrician)' },
  { value: 'other', label: 'অন্যান্য (Other)' },
];

export default function SiteHaziraPage() {
  const [records, setRecords] = useState<HaziraRecord[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [billModalOpen, setBillModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<HaziraRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Add Form
  const [projectName, setProjectName] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');
  const [workersList, setWorkersList] = useState<Worker[]>([
    { name: '', role: 'mason', present: true, dailyWage: 800 },
    { name: '', role: 'helper', present: true, dailyWage: 500 },
  ]);

  // R.A. Bill Form
  const [billProject, setBillProject] = useState('');
  const [billPrevAmount, setBillPrevAmount] = useState('0');
  const [billRetentionRate, setBillRetentionRate] = useState('5');
  const [billContractorName, setBillContractorName] = useState('');

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('project', search);

      const res = await adminFetch(`/api/admin/site-hazira?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch records');
      const json = await res.json();
      setRecords(json.data || []);
      setStats(json.stats || null);
    } catch (err: any) {
      toast.error(err.message || 'Error fetching hazira');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const addWorkerRow = () => {
    setWorkersList([...workersList, { name: '', role: 'helper', present: true, dailyWage: 500 }]);
  };

  const removeWorkerRow = (index: number) => {
    setWorkersList(workersList.filter((_, idx) => idx !== index));
  };

  const updateWorker = (index: number, field: keyof Worker, value: any) => {
    const updated = [...workersList];
    updated[index] = { ...updated[index], [field]: value };
    setWorkersList(updated);
  };

  const calculatedFormTotal = workersList.reduce(
    (sum, w) => sum + (w.present ? Number(w.dailyWage || 0) : 0),
    0
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName) {
      toast.error('Project name is required');
      return;
    }
    const validWorkers = workersList.filter((w) => w.name.trim() !== '');
    if (validWorkers.length === 0) {
      toast.error('At least one worker with name is required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await adminFetch('/api/admin/site-hazira', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName,
          date,
          workers: validWorkers,
          notes,
        }),
      });
      if (!res.ok) throw new Error('Failed to create hazira record');
      toast.success('Hazira recorded successfully');
      setAddModalOpen(false);
      setProjectName('');
      setNotes('');
      setWorkersList([
        { name: '', role: 'mason', present: true, dailyWage: 800 },
        { name: '', role: 'helper', present: true, dailyWage: 500 },
      ]);
      fetchRecords();
    } catch (err: any) {
      toast.error(err.message || 'Error creating hazira');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      const res = await adminFetch('/api/admin/site-hazira', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Record deleted successfully');
      fetchRecords();
    } catch (err: any) {
      toast.error(err.message || 'Error deleting record');
    }
  };

  // Bill calculations
  const projectRecords = records.filter(
    (r) => !billProject || r.projectName.toLowerCase() === billProject.toLowerCase()
  );
  const currentPeriodWork = projectRecords.reduce((sum, r) => sum + (r.totalWage || 0), 0);
  const prevAmount = Number(billPrevAmount || 0);
  const grossAmount = prevAmount + currentPeriodWork;
  const retentionPercent = Number(billRetentionRate || 5);
  const retentionDeduction = (grossAmount * retentionPercent) / 100;
  const netPayable = grossAmount - retentionDeduction;

  const openBillModal = (proj?: string) => {
    setBillProject(proj || (records[0]?.projectName ?? ''));
    setBillModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users2 className="w-6 h-6 text-primary" />
            দৈনিক সাইট হাজিরা ও কন্ট্রাক্টর রানিং বিল (Site Hazira & R.A. Bill)
          </h1>
          <p className="text-sm text-muted-foreground">
            রাজমিস্ত্রি, হেলপার ও মিস্ত্রির দৈনিক হাজিরা, মজুরি ট্র্যাকিং এবং R.A. বিল ভাউচার জেনারেটর
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => openBillModal()} className="gap-1">
            <Receipt className="w-4 h-4" /> R.A. বিল জেনারেটর
          </Button>
          <Button onClick={() => setAddModalOpen(true)} className="gap-1">
            <Plus className="w-4 h-4" /> আজকের হাজিরা
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">মোট হাজিরা রেকর্ড</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{stats?.totalRecords ?? 0} দিন</div>
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-primary uppercase">আজকের মোট মজুরি</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-primary">
              ৳ {(stats?.todayWage ?? 0).toLocaleString('en-BD')}
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase">চলতি মাসের মোট মজুরি</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
              ৳ {(stats?.monthWage ?? 0).toLocaleString('en-BD')}
            </div>
          </CardContent>
        </Card>
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

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              কোনো সাইট হাজিরার রেকর্ড পাওয়া যায়নি।
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-4 py-3">প্রজেক্টের নাম</th>
                    <th className="px-4 py-3">তারিখ</th>
                    <th className="px-4 py-3">মোট শ্রমিক</th>
                    <th className="px-4 py-3">উপস্থিত</th>
                    <th className="px-4 py-3">দৈনিক মজুরি বিল</th>
                    <th className="px-4 py-3 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {records.map((rec) => {
                    const presentCount = rec.workers.filter((w) => w.present).length;
                    return (
                      <tr key={rec._id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-semibold text-foreground">
                          {rec.projectName}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          {format(new Date(rec.date), 'dd MMM yyyy')}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {rec.workers.length} জন
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-700 border-green-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            {presentCount} জন
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-bold text-foreground">
                          ৳ {rec.totalWage.toLocaleString('en-BD')}
                        </td>
                        <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedRecord(rec);
                              setDetailsModalOpen(true);
                            }}
                            className="h-8 text-xs"
                          >
                            তালিকা দেখুন
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openBillModal(rec.projectName)}
                            className="h-8 text-xs gap-1"
                          >
                            <Receipt className="w-3.5 h-3.5" /> বিল
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(rec._id)}
                            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>দৈনিক সাইট হাজিরা ও মজুরি এন্ট্রি</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>প্রজেক্টের নাম *</Label>
                <Input
                  required
                  placeholder="উদাঃ বনানী রেসিডেন্স"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>হাজিরার তারিখ *</Label>
                <Input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            {/* Workers Rows */}
            <div className="space-y-2 border border-border rounded-lg p-3 bg-muted/20">
              <div className="flex justify-between items-center pb-1">
                <span className="text-xs font-bold uppercase text-muted-foreground">শ্রমিকদের তালিকা</span>
                <Button type="button" size="sm" variant="outline" onClick={addWorkerRow} className="h-7 text-xs gap-1">
                  <Plus className="w-3 h-3" /> শ্রমিক যোগ করুন
                </Button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {workersList.map((worker, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-card p-2 rounded border border-border text-xs">
                    <Input
                      placeholder="শ্রমিকের নাম"
                      value={worker.name}
                      onChange={(e) => updateWorker(idx, 'name', e.target.value)}
                      className="h-8 text-xs flex-1"
                    />
                    <select
                      value={worker.role}
                      onChange={(e) => updateWorker(idx, 'role', e.target.value)}
                      className="h-8 bg-background border border-border rounded px-2 text-xs"
                    >
                      {ROLES.map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                    <label className="flex items-center gap-1 cursor-pointer whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={worker.present}
                        onChange={(e) => updateWorker(idx, 'present', e.target.checked)}
                        className="rounded"
                      />
                      <span>উপস্থিত</span>
                    </label>
                    <Input
                      type="number"
                      placeholder="মজুরি"
                      value={worker.dailyWage}
                      onChange={(e) => updateWorker(idx, 'dailyWage', Number(e.target.value))}
                      className="h-8 text-xs w-20"
                    />
                    {workersList.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeWorkerRow(idx)}
                        className="h-8 w-8 p-0 text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-border text-xs">
                <span className="text-muted-foreground">আজকের আনুমানিক মোট মজুরি:</span>
                <span className="font-bold text-sm text-primary">৳ {calculatedFormTotal.toLocaleString('en-BD')}</span>
              </div>
            </div>

            <div className="space-y-1">
              <Label>সাইট নোট / সুপারভাইজার মন্তব্য</Label>
              <Input
                placeholder="আজকের কাজের বিবরণ বা বিশেষ নির্দেশনা..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
                বাতিল
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                হাজিরা সংরক্ষণ করুন
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Worker Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>শ্রমিকদের উপস্থিতির বিবরণ</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="p-3 bg-muted/40 rounded-lg text-xs space-y-1">
                <div className="font-bold text-foreground">{selectedRecord.projectName}</div>
                <div className="text-muted-foreground">
                  তারিখ: {format(new Date(selectedRecord.date), 'dd MMMM yyyy')}
                </div>
                <div className="font-semibold text-primary">
                  মোট বিল: ৳ {selectedRecord.totalWage.toLocaleString('en-BD')}
                </div>
              </div>

              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">নাম</th>
                      <th className="px-3 py-2">কাজের পদবী</th>
                      <th className="px-3 py-2">স্ট্যাটাস</th>
                      <th className="px-3 py-2 text-right">মজুরি</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {selectedRecord.workers.map((w, i) => (
                      <tr key={i} className="hover:bg-muted/20">
                        <td className="px-3 py-2 font-medium">{w.name}</td>
                        <td className="px-3 py-2 text-muted-foreground capitalize">{w.role}</td>
                        <td className="px-3 py-2">
                          {w.present ? (
                            <span className="text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> উপস্থিত
                            </span>
                          ) : (
                            <span className="text-red-500 font-semibold flex items-center gap-1">
                              <XCircle className="w-3 h-3" /> অনুপস্থিত
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right font-mono">
                          {w.present ? `৳ ${w.dailyWage.toLocaleString('en-BD')}` : '৳ 0'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Running Bill (R.A.) Modal */}
      <Dialog open={billModalOpen} onOpenChange={setBillModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center pr-6">
              <span>কন্ট্রাক্টর রানিং বিল (R.A. Bill)</span>
              <Button size="sm" onClick={() => window.print()} className="gap-1">
                <Printer className="w-4 h-4" /> প্রিন্ট ভাউচার
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-lg">
              <div>
                <Label className="text-[11px]">প্রজেক্ট ফিল্টার</Label>
                <select
                  value={billProject}
                  onChange={(e) => setBillProject(e.target.value)}
                  className="w-full bg-background border border-border rounded px-2 py-1 mt-1 text-xs"
                >
                  <option value="">সকল প্রজেক্ট</option>
                  {Array.from(new Set(records.map((r) => r.projectName))).map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-[11px]">কন্ট্রাক্টরের নাম</Label>
                <Input
                  placeholder="উদাঃ মেসার্স রহিম কনস্ট্রাকশন"
                  value={billContractorName}
                  onChange={(e) => setBillContractorName(e.target.value)}
                  className="h-8 text-xs mt-1"
                />
              </div>
              <div>
                <Label className="text-[11px]">পূর্ববর্তী বিল পর্যন্ত পরিশোধ (৳)</Label>
                <Input
                  type="number"
                  value={billPrevAmount}
                  onChange={(e) => setBillPrevAmount(e.target.value)}
                  className="h-8 text-xs mt-1"
                />
              </div>
              <div>
                <Label className="text-[11px]">রিটেনশন কর্তন হার (%)</Label>
                <Input
                  type="number"
                  value={billRetentionRate}
                  onChange={(e) => setBillRetentionRate(e.target.value)}
                  className="h-8 text-xs mt-1"
                />
              </div>
            </div>

            {/* Print Voucher Sheet */}
            <div className="border border-border p-6 rounded-lg bg-card text-foreground space-y-4 print:border-black print:p-2">
              <div className="text-center border-b border-border pb-3 space-y-1">
                <div className="flex justify-center mb-1">
                  <div className="w-10 h-10 bg-white rounded-lg border border-border/60 p-1 flex items-center justify-center">
                    <img src="/images/logo.png" alt="Triple H" className="w-full h-full object-contain" />
                  </div>
                </div>
                <h2 className="font-black text-sm uppercase tracking-wider">RUNNING ACCOUNT BILL (R.A. BILL)</h2>
                <div className="text-[11px] text-muted-foreground font-semibold">Triple H Plandraft &amp; Engineering</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div><span className="text-muted-foreground">Project:</span> <span className="font-bold">{billProject || 'All Sites'}</span></div>
                <div><span className="text-muted-foreground">Contractor:</span> <span className="font-bold">{billContractorName || 'Site Contractor'}</span></div>
                <div><span className="text-muted-foreground">Bill Date:</span> {format(new Date(), 'dd/MM/yyyy')}</div>
                <div><span className="text-muted-foreground">Recorded Days:</span> {projectRecords.length} দিন</div>
              </div>

              <div className="border border-border rounded overflow-hidden text-xs">
                <div className="flex justify-between p-2 border-b border-border">
                  <span>পূর্বের কাজের বিল (Previous Total):</span>
                  <span className="font-mono">৳ {prevAmount.toLocaleString('en-BD')}</span>
                </div>
                <div className="flex justify-between p-2 border-b border-border">
                  <span>বর্তমান মেয়াদের কাজ / মজুরি (Current Work):</span>
                  <span className="font-mono">৳ {currentPeriodWork.toLocaleString('en-BD')}</span>
                </div>
                <div className="flex justify-between p-2 font-bold bg-muted/30 border-b border-border">
                  <span>মোট গ্রস পরিমাণ (Gross Bill):</span>
                  <span className="font-mono">৳ {grossAmount.toLocaleString('en-BD')}</span>
                </div>
                <div className="flex justify-between p-2 text-destructive border-b border-border">
                  <span>রিটেনশন মানি কর্তন ({retentionPercent}%):</span>
                  <span className="font-mono">- ৳ {retentionDeduction.toLocaleString('en-BD')}</span>
                </div>
                <div className="flex justify-between p-2 font-black text-sm bg-primary/10 text-primary">
                  <span>চলতি নিট প্রদেয় (Net Payable):</span>
                  <span className="font-mono">৳ {netPayable.toLocaleString('en-BD')}</span>
                </div>
              </div>

              <div className="pt-8 flex justify-between text-[11px]">
                <div className="text-center">
                  <div className="w-32 border-b border-border mb-1" />
                  <span>কন্ট্রাক্টরের স্বাক্ষর</span>
                </div>
                <div className="text-center">
                  <div className="w-32 border-b border-border mb-1" />
                  <span>ইঞ্জিনিয়ারের স্বাক্ষর ও সিল</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
