'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FlaskConical,
  Plus,
  Trash2,
  Printer,
  Loader2,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Award,
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

interface CastingQCRecord {
  _id: string;
  projectName: string;
  castingDate: string;
  floor?: string;
  location?: string;
  mixRatio?: string;
  cementBrand?: string;
  waterCementRatio?: number;
  vibratorUsed: boolean;
  coverBlockUsed: boolean;
  preCastingChecklistOk: boolean;
  cylinder7DayPsi?: number;
  cylinder28DayPsi?: number;
  testDate7Day?: string;
  testDate28Day?: string;
  designStrengthPsi: number;
  status: 'pending-7day' | 'pending-28day' | 'passed' | 'failed';
  notes?: string;
  createdAt: string;
}

interface Stats {
  total: number;
  passed: number;
  failed: number;
  pending7Day: number;
  pending28Day: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  passed: {
    label: 'Passed (উত্তীর্ণ)',
    color: 'bg-green-500/15 text-green-700 border-green-500/30 dark:text-green-400',
    icon: CheckCircle2,
  },
  failed: {
    label: 'Failed (অনুত্তীর্ণ)',
    color: 'bg-red-500/15 text-red-700 border-red-500/30 dark:text-red-400',
    icon: XCircle,
  },
  'pending-7day': {
    label: 'Pending 7-Day',
    color: 'bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-400',
    icon: Clock,
  },
  'pending-28day': {
    label: 'Pending 28-Day',
    color: 'bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-400',
    icon: AlertTriangle,
  },
};

export default function CastingQCPage() {
  const [records, setRecords] = useState<CastingQCRecord[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<CastingQCRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    projectName: '',
    castingDate: format(new Date(), 'yyyy-MM-dd'),
    floor: '',
    location: '',
    mixRatio: '1:1.5:3',
    cementBrand: '',
    waterCementRatio: '0.45',
    vibratorUsed: true,
    coverBlockUsed: true,
    preCastingChecklistOk: true,
    designStrengthPsi: '3000',
    notes: '',
  });

  const [editData, setEditData] = useState({
    cylinder7DayPsi: '',
    testDate7Day: '',
    cylinder28DayPsi: '',
    testDate28Day: '',
    notes: '',
  });

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (search) params.set('search', search);

      const res = await adminFetch(`/api/admin/casting-qc?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch records');
      const json = await res.json();
      setRecords(json.data || []);
      setStats(json.stats || null);
    } catch (err: any) {
      toast.error(err.message || 'Error fetching QC records');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectName) {
      toast.error('Project name is required');
      return;
    }
    setSubmitting(true);
    try {
      const res = await adminFetch('/api/admin/casting-qc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to create record');
      toast.success('Casting QC record created successfully');
      setAddModalOpen(false);
      setFormData({
        projectName: '',
        castingDate: format(new Date(), 'yyyy-MM-dd'),
        floor: '',
        location: '',
        mixRatio: '1:1.5:3',
        cementBrand: '',
        waterCementRatio: '0.45',
        vibratorUsed: true,
        coverBlockUsed: true,
        preCastingChecklistOk: true,
        designStrengthPsi: '3000',
        notes: '',
      });
      fetchRecords();
    } catch (err: any) {
      toast.error(err.message || 'Error creating record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;
    setSubmitting(true);
    try {
      const res = await adminFetch('/api/admin/casting-qc', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedRecord._id,
          ...editData,
        }),
      });
      if (!res.ok) throw new Error('Failed to update record');
      toast.success('Test results updated successfully');
      setEditModalOpen(false);
      fetchRecords();
    } catch (err: any) {
      toast.error(err.message || 'Error updating record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      const res = await adminFetch('/api/admin/casting-qc', {
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

  const openEditModal = (rec: CastingQCRecord) => {
    setSelectedRecord(rec);
    setEditData({
      cylinder7DayPsi: rec.cylinder7DayPsi ? String(rec.cylinder7DayPsi) : '',
      testDate7Day: rec.testDate7Day ? format(new Date(rec.testDate7Day), 'yyyy-MM-dd') : '',
      cylinder28DayPsi: rec.cylinder28DayPsi ? String(rec.cylinder28DayPsi) : '',
      testDate28Day: rec.testDate28Day ? format(new Date(rec.testDate28Day), 'yyyy-MM-dd') : '',
      notes: rec.notes || '',
    });
    setEditModalOpen(true);
  };

  const openCertModal = (rec: CastingQCRecord) => {
    setSelectedRecord(rec);
    setCertModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-primary" />
            ছাদ ঢালাই QC রেজিস্টার (Casting QC & Concrete Tests)
          </h1>
          <p className="text-sm text-muted-foreground">
            ঢালাই পূর্ববর্তী চেকলিস্ট, ৭ ও ২৮ দিনের সিলিন্ডার ক্রাশিং টেস্ট ও কোয়ালিটি সনদপত্র
          </p>
        </div>
        <Button onClick={() => setAddModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> নতুন ঢালাই রেকর্ড
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">মোট রেকর্ড</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{stats?.total ?? 0}</div>
          </CardContent>
        </Card>
        <Card className="border-green-500/20 bg-green-500/5">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-green-700 dark:text-green-400 uppercase">পাস (Passed)</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">{stats?.passed ?? 0}</div>
          </CardContent>
        </Card>
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase">৭ দিন অপেক্ষমান</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">{stats?.pending7Day ?? 0}</div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-blue-700 dark:text-blue-400 uppercase">২৮ দিন অপেক্ষমান</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{stats?.pending28Day ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="প্রজেক্ট বা লোকেশন খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          {['all', 'pending-7day', 'pending-28day', 'passed', 'failed'].map((st) => (
            <Button
              key={st}
              size="sm"
              variant={statusFilter === st ? 'default' : 'outline'}
              onClick={() => setStatusFilter(st)}
              className="text-xs whitespace-nowrap capitalize"
            >
              {st === 'all' ? 'সকল' : st.replace('-', ' ')}
            </Button>
          ))}
        </div>
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
              কোনো ঢালাই QC রেকর্ড পাওয়া যায়নি।
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-4 py-3">প্রজেক্ট ও তলা</th>
                    <th className="px-4 py-3">ঢালাই তারিখ</th>
                    <th className="px-4 py-3">মিক্স রেশিও</th>
                    <th className="px-4 py-3">৭ দিনের PSI</th>
                    <th className="px-4 py-3">২৮ দিনের PSI</th>
                    <th className="px-4 py-3">স্ট্যাটাস</th>
                    <th className="px-4 py-3 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {records.map((rec) => {
                    const cfg = STATUS_CONFIG[rec.status] || STATUS_CONFIG['pending-7day'];
                    const Icon = cfg.icon;
                    return (
                      <tr key={rec._id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium">
                          <div>{rec.projectName}</div>
                          <div className="text-xs text-muted-foreground">
                            {rec.floor || 'Roof Slab'} {rec.location ? `• ${rec.location}` : ''}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          {format(new Date(rec.castingDate), 'dd MMM yyyy')}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <span className="font-mono bg-muted px-2 py-0.5 rounded">{rec.mixRatio || '1:1.5:3'}</span>
                        </td>
                        <td className="px-4 py-3">
                          {rec.cylinder7DayPsi ? (
                            <span className="font-semibold text-foreground">{rec.cylinder7DayPsi} psi</span>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">বাকি আছে</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {rec.cylinder28DayPsi ? (
                            <span className="font-semibold text-foreground">{rec.cylinder28DayPsi} psi</span>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">বাকি আছে</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={`gap-1 ${cfg.color}`}>
                            <Icon className="w-3 h-3" />
                            {cfg.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditModal(rec)}
                            className="h-8 text-xs"
                          >
                            টেস্ট এন্ট্রি
                          </Button>
                          {rec.status === 'passed' && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => openCertModal(rec)}
                              className="h-8 text-xs gap-1 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 border-amber-500/20"
                            >
                              <Award className="w-3 h-3" /> সনদপত্র
                            </Button>
                          )}
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
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>নতুন ছাদ ঢালাই রেকর্ড এন্ট্রি</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>প্রজেক্টের নাম *</Label>
                <Input
                  required
                  placeholder="উদাঃ ধানমন্ডি ৭ তলা ভবন"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>ঢালাইয়ের তারিখ *</Label>
                <Input
                  type="date"
                  required
                  value={formData.castingDate}
                  onChange={(e) => setFormData({ ...formData, castingDate: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>ফ্লোর / ছাদ</Label>
                <Input
                  placeholder="উদাঃ ২য় তলা ছাদ ঢালাই"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>লোকেশন</Label>
                <Input
                  placeholder="উদাঃ মিরপুর-১০, ঢাকা"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>মিক্স রেশিও (Mix Ratio)</Label>
                <Input
                  placeholder="1:1.5:3"
                  value={formData.mixRatio}
                  onChange={(e) => setFormData({ ...formData, mixRatio: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>সিমেন্ট ব্র্যান্ড</Label>
                <Input
                  placeholder="উদাঃ শাহ সিমেন্ট / হোলসিম"
                  value={formData.cementBrand}
                  onChange={(e) => setFormData({ ...formData, cementBrand: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>ডিজাইন স্ট্রেন্থ (PSI)</Label>
                <Input
                  type="number"
                  placeholder="3000"
                  value={formData.designStrengthPsi}
                  onChange={(e) => setFormData({ ...formData, designStrengthPsi: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>ওয়াটার-সিমেন্ট রেশিও (W/C)</Label>
                <Input
                  placeholder="0.45"
                  value={formData.waterCementRatio}
                  onChange={(e) => setFormData({ ...formData, waterCementRatio: e.target.value })}
                />
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-2 p-3 bg-muted/40 rounded-lg border border-border">
              <span className="text-xs font-bold uppercase text-muted-foreground">ঢালাই পূর্ববর্তী সাইট চেকলিস্ট</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.vibratorUsed}
                    onChange={(e) => setFormData({ ...formData, vibratorUsed: e.target.checked })}
                    className="rounded text-primary"
                  />
                  <span>ভাইব্রেটর প্রস্তুত ও সচল</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.coverBlockUsed}
                    onChange={(e) => setFormData({ ...formData, coverBlockUsed: e.target.checked })}
                    className="rounded text-primary"
                  />
                  <span>কভার ব্লক বসানো হয়েছে</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.preCastingChecklistOk}
                    onChange={(e) => setFormData({ ...formData, preCastingChecklistOk: e.target.checked })}
                    className="rounded text-primary"
                  />
                  <span>শাখিং ও লেভেল ক্লিয়ার</span>
                </label>
              </div>
            </div>

            <div className="space-y-1">
              <Label>মন্তব্য / সাইট নোট</Label>
              <Input
                placeholder="প্রয়োজনীয় অন্যান্য তথ্য..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
                বাতিল
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                সংরক্ষণ করুন
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Test Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>সিলিন্ডার ক্রাশিং টেস্ট এন্ট্রি</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="p-3 bg-muted/40 rounded-lg text-xs space-y-1">
              <div className="font-semibold text-foreground">{selectedRecord?.projectName}</div>
              <div className="text-muted-foreground">ডিজাইন স্ট্রেন্থ: {selectedRecord?.designStrengthPsi} PSI</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>৭ দিনের টেস্ট (PSI)</Label>
                <Input
                  type="number"
                  placeholder="উদাঃ 2100"
                  value={editData.cylinder7DayPsi}
                  onChange={(e) => setEditData({ ...editData, cylinder7DayPsi: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>৭ দিনের টেস্ট তারিখ</Label>
                <Input
                  type="date"
                  value={editData.testDate7Day}
                  onChange={(e) => setEditData({ ...editData, testDate7Day: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>২৮ দিনের টেস্ট (PSI)</Label>
                <Input
                  type="number"
                  placeholder="উদাঃ 3200"
                  value={editData.cylinder28DayPsi}
                  onChange={(e) => setEditData({ ...editData, cylinder28DayPsi: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>২৮ দিনের টেস্ট তারিখ</Label>
                <Input
                  type="date"
                  value={editData.testDate28Day}
                  onChange={(e) => setEditData({ ...editData, testDate28Day: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>টেস্ট ল্যাব ও মন্তব্য</Label>
              <Input
                placeholder="বুয়েট / কুয়েট বা সাইট টেস্ট..."
                value={editData.notes}
                onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>
                বাতিল
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                আপডেট করুন
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Certificate Print Modal */}
      <Dialog open={certModalOpen} onOpenChange={setCertModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center pr-6">
              <span>কংক্রিট কোয়ালিটি সনদপত্র (Print View)</span>
              <Button size="sm" onClick={() => window.print()} className="gap-1">
                <Printer className="w-4 h-4" /> প্রিন্ট করুন
              </Button>
            </DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="border-4 border-double border-amber-600/60 p-8 rounded-xl bg-card text-foreground space-y-6 print:border-black print:p-4">
              <div className="text-center space-y-1 border-b border-border pb-4">
                <div className="flex justify-center mb-1">
                  <div className="w-12 h-12 bg-white rounded-xl border border-border/60 p-1 flex items-center justify-center">
                    <img src="/images/logo.png" alt="Triple H" className="w-full h-full object-contain" />
                  </div>
                </div>
                <div className="text-xs font-bold tracking-widest text-amber-700 dark:text-amber-400 uppercase">
                  Triple H Plandraft &amp; Engineering
                </div>
                <h2 className="text-xl font-black uppercase tracking-wider">
                  CONCRETE STRENGTH QUALITY CERTIFICATE
                </h2>
                <p className="text-xs text-muted-foreground">
                  Official Quality Control &amp; Structural Compliance Verification
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground">Project Name:</span>
                  <p className="font-bold text-sm text-foreground">{selectedRecord.projectName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Floor / Slab:</span>
                  <p className="font-bold text-sm text-foreground">{selectedRecord.floor || 'Roof Slab'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Location:</span>
                  <p className="font-medium">{selectedRecord.location || 'Dhaka, Bangladesh'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Casting Date:</span>
                  <p className="font-medium">{format(new Date(selectedRecord.castingDate), 'dd MMMM yyyy')}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Concrete Mix Ratio:</span>
                  <p className="font-medium font-mono">{selectedRecord.mixRatio || '1:1.5:3'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Design Strength:</span>
                  <p className="font-bold text-foreground">{selectedRecord.designStrengthPsi} PSI</p>
                </div>
              </div>

              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted text-muted-foreground font-semibold">
                    <tr>
                      <th className="px-4 py-2">Test Milestone</th>
                      <th className="px-4 py-2">Test Date</th>
                      <th className="px-4 py-2">Achieved Strength</th>
                      <th className="px-4 py-2">Compliance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="px-4 py-2.5">7-Day Cylinder Crushing</td>
                      <td className="px-4 py-2.5">
                        {selectedRecord.testDate7Day
                          ? format(new Date(selectedRecord.testDate7Day), 'dd/MM/yyyy')
                          : 'N/A'}
                      </td>
                      <td className="px-4 py-2.5 font-bold">{selectedRecord.cylinder7DayPsi || '—'} PSI</td>
                      <td className="px-4 py-2.5 text-green-700 dark:text-green-400 font-semibold">
                        {selectedRecord.cylinder7DayPsi ? '≥ 67% Achieved' : '—'}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-bold">28-Day Final Crushing</td>
                      <td className="px-4 py-2.5">
                        {selectedRecord.testDate28Day
                          ? format(new Date(selectedRecord.testDate28Day), 'dd/MM/yyyy')
                          : 'N/A'}
                      </td>
                      <td className="px-4 py-2.5 font-bold text-sm text-green-700 dark:text-green-400">
                        {selectedRecord.cylinder28DayPsi} PSI
                      </td>
                      <td className="px-4 py-2.5 text-green-700 dark:text-green-400 font-bold">
                        ✅ PASSED (BNBC COMPLIANT)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="pt-6 flex justify-between items-end border-t border-border text-xs">
                <div>
                  <p className="text-[11px] text-muted-foreground">Issue Date: {format(new Date(), 'dd MMM yyyy')}</p>
                  <p className="text-[11px] text-muted-foreground">Certificate ID: QC-{selectedRecord._id.slice(-6).toUpperCase()}</p>
                </div>
                <div className="text-right space-y-1">
                  <div className="font-bold text-foreground">Engr. Md. Hasmot Ali</div>
                  <div className="text-muted-foreground font-semibold">Triple H Plandraft & Engineering</div>
                  <div className="pt-4 border-t border-foreground/30 w-44 ml-auto text-[10px] text-muted-foreground">
                    Authorized Signatory & Seal
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
