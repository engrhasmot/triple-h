'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Printer,
  Loader2,
  Search,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Droplets,
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

interface SoilLayer {
  depthFrom: number;
  depthTo: number;
  soilType: string;
  nValue: number;
  allowableBearing?: number;
}

interface SoilTestRecord {
  _id: string;
  projectName: string;
  location?: string;
  date: string;
  boreholeNo?: string;
  boreholeDepth?: number;
  layers: SoilLayer[];
  groundwaterDepth?: number;
  recommendedFoundation?: string;
  recommendedPileDepth?: number;
  safeAllowableBearing?: number;
  notes?: string;
  createdAt: string;
}

const FOUNDATION_CONFIG: Record<string, { label: string; color: string }> = {
  'isolated-footing': {
    label: 'আইসোলেটেড ফুটিং (Isolated Footing)',
    color: 'bg-green-500/15 text-green-700 border-green-500/30 dark:text-green-400',
  },
  'combined-footing': {
    label: 'কম্বাইন্ড ফুটিং (Combined Footing)',
    color: 'bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-400',
  },
  'raft-foundation': {
    label: 'ম্যাট / র‍্যাফট (Raft / Mat Foundation)',
    color: 'bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-400',
  },
  'pile-foundation': {
    label: 'ডিপ পাইল প্রয়োজন (Deep Pile Required)',
    color: 'bg-red-500/15 text-red-700 border-red-500/30 dark:text-red-400',
  },
};

export default function SoilTestPage() {
  const [records, setRecords] = useState<SoilTestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<SoilTestRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [projectName, setProjectName] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [boreholeNo, setBoreholeNo] = useState('BH-01');
  const [boreholeDepth, setBoreholeDepth] = useState('60');
  const [groundwaterDepth, setGroundwaterDepth] = useState('8');
  const [notes, setNotes] = useState('');
  const [layersList, setLayersList] = useState<SoilLayer[]>([
    { depthFrom: 0, depthTo: 10, soilType: 'Soft Organic Clay', nValue: 3 },
    { depthFrom: 10, depthTo: 25, soilType: 'Medium Stiff Clay', nValue: 8 },
    { depthFrom: 25, depthTo: 45, soilType: 'Medium Dense Silty Sand', nValue: 18 },
    { depthFrom: 45, depthTo: 60, soilType: 'Dense Sand & Silt', nValue: 32 },
  ]);

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);

      const res = await adminFetch(`/api/admin/soil-test?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch soil tests');
      const json = await res.json();
      setRecords(json.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Error fetching soil test records');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const addLayerRow = () => {
    const last = layersList[layersList.length - 1];
    const from = last ? last.depthTo : 0;
    setLayersList([
      ...layersList,
      { depthFrom: from, depthTo: from + 10, soilType: 'Medium Sand', nValue: 15 },
    ]);
  };

  const removeLayerRow = (index: number) => {
    setLayersList(layersList.filter((_, idx) => idx !== index));
  };

  const updateLayer = (index: number, field: keyof SoilLayer, value: any) => {
    const updated = [...layersList];
    updated[index] = { ...updated[index], [field]: value };
    setLayersList(updated);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName) {
      toast.error('Project name is required');
      return;
    }
    setSubmitting(true);
    try {
      const res = await adminFetch('/api/admin/soil-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName,
          location,
          date,
          boreholeNo,
          boreholeDepth: Number(boreholeDepth || 0),
          groundwaterDepth: Number(groundwaterDepth || 0),
          layers: layersList,
          notes,
        }),
      });
      if (!res.ok) throw new Error('Failed to save soil test');
      toast.success('Soil test record created successfully');
      setAddModalOpen(false);
      setProjectName('');
      setLocation('');
      setNotes('');
      fetchRecords();
    } catch (err: any) {
      toast.error(err.message || 'Error saving soil test');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this soil test record?')) return;
    try {
      const res = await adminFetch('/api/admin/soil-test', {
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

  const pileCount = records.filter((r) => r.recommendedFoundation === 'pile-foundation').length;
  const avgBearing =
    records.length > 0
      ? (records.reduce((s, r) => s + (r.safeAllowableBearing || 0), 0) / records.length).toFixed(2)
      : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-primary" />
            সয়েল টেস্ট এসপিটি ডাটা ও বিয়ারিং ক্যাপাসিটি (Soil Test SPT Analyzer)
          </h1>
          <p className="text-sm text-muted-foreground">
            বোরহোল এন-ভ্যালু (SPT N-Value) ইনপুট দিয়ে ধারণক্ষমতা ও ফাউন্ডেশন রিকমেন্ডেশন বিশ্লেষণ
          </p>
        </div>
        <Button onClick={() => setAddModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> নতুন সয়েল টেস্ট এন্ট্রি
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">মোট টেস্ট রিপোর্ট</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{records.length} টি</div>
          </CardContent>
        </Card>
        <Card className="border-red-500/20 bg-red-500/5">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-red-700 dark:text-red-400 uppercase">পাইল ফাউন্ডেশন প্রয়োজন</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-red-700 dark:text-red-400">{pileCount} টি প্রজেক্ট</div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-blue-700 dark:text-blue-400 uppercase">গড় ধারণক্ষমতা (Bearing)</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{avgBearing} ton/sft</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="প্রজেক্ট বা লোকেশন খুঁজুন..."
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
              কোনো সয়েল টেস্টের ডাটা পাওয়া যায়নি।
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-4 py-3">প্রজেক্ট ও বোরহোল</th>
                    <th className="px-4 py-3">লোকেশন</th>
                    <th className="px-4 py-3">গভীরতা</th>
                    <th className="px-4 py-3">ধারণক্ষমতা (Bearing)</th>
                    <th className="px-4 py-3">ফাউন্ডেশন রিকমেন্ডেশন</th>
                    <th className="px-4 py-3 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {records.map((rec) => {
                    const cfg =
                      FOUNDATION_CONFIG[rec.recommendedFoundation || 'pile-foundation'] ||
                      FOUNDATION_CONFIG['pile-foundation'];
                    return (
                      <tr key={rec._id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium">
                          <div>{rec.projectName}</div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {rec.boreholeNo || 'BH-01'} • {format(new Date(rec.date), 'dd MMM yyyy')}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {rec.location || 'Dhaka'}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <div>{rec.boreholeDepth || 60} ফুট</div>
                          <div className="text-muted-foreground flex items-center gap-1">
                            <Droplets className="w-3 h-3 text-blue-500" /> {rec.groundwaterDepth || '—'} ft GW
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-foreground">
                            {rec.safeAllowableBearing || '1.0'} ton/sft
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={`text-xs ${cfg.color}`}>
                            {cfg.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedRecord(rec);
                              setReportModalOpen(true);
                            }}
                            className="h-8 text-xs gap-1"
                          >
                            <Building2 className="w-3 h-3" /> রিপোর্ট
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
            <DialogTitle>নতুন সয়েল টেস্ট রিপোর্ট ডাটা এন্ট্রি</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>প্রজেক্টের নাম *</Label>
                <Input
                  required
                  placeholder="উদাঃ গুলশান রেসিডেন্স"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>লোকেশন</Label>
                <Input
                  placeholder="উদাঃ গুলশান-২, ঢাকা"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>টেস্টের তারিখ</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>বোরহোল নম্বর</Label>
                <Input
                  placeholder="BH-01"
                  value={boreholeNo}
                  onChange={(e) => setBoreholeNo(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>বোরহোল গভীরতা (ft)</Label>
                <Input
                  type="number"
                  placeholder="60"
                  value={boreholeDepth}
                  onChange={(e) => setBoreholeDepth(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>গ্রাউন্ড ওয়াটার টেবিল (ft)</Label>
                <Input
                  type="number"
                  placeholder="8"
                  value={groundwaterDepth}
                  onChange={(e) => setGroundwaterDepth(e.target.value)}
                />
              </div>
            </div>

            {/* Soil Layers */}
            <div className="space-y-2 border border-border rounded-lg p-3 bg-muted/20">
              <div className="flex justify-between items-center pb-1">
                <span className="text-xs font-bold uppercase text-muted-foreground">মাটির স্তর ও SPT N-ভ্যালু</span>
                <Button type="button" size="sm" variant="outline" onClick={addLayerRow} className="h-7 text-xs gap-1">
                  <Plus className="w-3 h-3" /> স্তর যোগ করুন
                </Button>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {layersList.map((layer, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-card p-2 rounded border border-border text-xs">
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        placeholder="From"
                        value={layer.depthFrom}
                        onChange={(e) => updateLayer(idx, 'depthFrom', Number(e.target.value))}
                        className="h-8 text-xs w-14"
                      />
                      <span>-</span>
                      <Input
                        type="number"
                        placeholder="To"
                        value={layer.depthTo}
                        onChange={(e) => updateLayer(idx, 'depthTo', Number(e.target.value))}
                        className="h-8 text-xs w-14"
                      />
                      <span className="text-muted-foreground">ft</span>
                    </div>
                    <Input
                      placeholder="মাটির ধরন (Clay/Sand)"
                      value={layer.soilType}
                      onChange={(e) => updateLayer(idx, 'soilType', e.target.value)}
                      className="h-8 text-xs flex-1"
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">N=</span>
                      <Input
                        type="number"
                        placeholder="SPT N"
                        value={layer.nValue}
                        onChange={(e) => updateLayer(idx, 'nValue', Number(e.target.value))}
                        className="h-8 text-xs w-16 font-bold"
                      />
                    </div>
                    {layersList.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLayerRow(idx)}
                        className="h-8 w-8 p-0 text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <Label>মন্তব্য / সয়েল ল্যাবরেটরি</Label>
              <Input
                placeholder="বুয়েট / ইঞ্জিনিয়ার হাসমত আলী সাইট রিপোর্ট..."
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
                সংরক্ষণ ও বিশ্লেষণ করুন
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Soil Report Sheet Print Modal */}
      <Dialog open={reportModalOpen} onOpenChange={setReportModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center pr-6">
              <span>সয়েল টেস্ট জিওটেকনিক্যাল রিপোর্ট</span>
              <Button size="sm" onClick={() => window.print()} className="gap-1">
                <Printer className="w-4 h-4" /> প্রিন্ট রিপোর্ট
              </Button>
            </DialogTitle>
          </DialogHeader>

          {selectedRecord && (
            <div className="border border-border p-6 rounded-lg bg-card text-foreground space-y-4 print:border-black print:p-2 text-xs">
              <div className="text-center border-b border-border pb-3">
                <div className="text-[11px] font-bold tracking-widest text-primary uppercase">
                  Triple H Plandraft & Engineering Consultancy
                </div>
                <h2 className="text-base font-black uppercase tracking-wider">
                  GEOTECHNICAL SOIL INVESTIGATION REPORT
                </h2>
                <div className="text-[11px] text-muted-foreground">
                  Sub-soil Profile & Bearing Capacity Analysis (BNBC Standard)
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-muted-foreground">Project:</span>
                  <p className="font-bold text-foreground">{selectedRecord.projectName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Location:</span>
                  <p className="font-medium">{selectedRecord.location || 'Dhaka'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Borehole No:</span>
                  <p className="font-mono font-bold">{selectedRecord.boreholeNo || 'BH-01'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Test Date:</span>
                  <p className="font-medium">{format(new Date(selectedRecord.date), 'dd MMMM yyyy')}</p>
                </div>
              </div>

              {/* Subsoil Profile Table */}
              <div className="border border-border rounded overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">Depth Range</th>
                      <th className="px-3 py-2">Soil Description</th>
                      <th className="px-3 py-2">SPT N-Value</th>
                      <th className="px-3 py-2 text-right">Allowable Bearing</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {selectedRecord.layers.map((l, i) => (
                      <tr key={i} className="hover:bg-muted/20">
                        <td className="px-3 py-2 font-mono">{l.depthFrom} ft - {l.depthTo} ft</td>
                        <td className="px-3 py-2">{l.soilType}</td>
                        <td className="px-3 py-2 font-bold font-mono">{l.nValue}</td>
                        <td className="px-3 py-2 text-right font-mono font-bold">
                          {l.allowableBearing || (l.nValue < 10 ? 1.0 : 2.0)} ton/sft
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Recommendation */}
              <div className="p-3 bg-muted/40 rounded border border-border space-y-1">
                <div className="font-bold text-foreground">ইঞ্জিনিয়ারিং রিকমেন্ডেশন ও সিদ্ধান্ত:</div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                  <div>
                    <span className="text-muted-foreground">নিরাপদ ধারণক্ষমতা (Safe Bearing):</span>
                    <p className="font-bold text-primary text-sm">{selectedRecord.safeAllowableBearing || '1.0'} ton/sft</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">প্রস্তাবিত ফাউন্ডেশন টাইপ:</span>
                    <p className="font-bold text-foreground">
                      {FOUNDATION_CONFIG[selectedRecord.recommendedFoundation || 'pile-foundation']?.label}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex justify-between text-[11px] border-t border-border">
                <div>
                  <p className="text-muted-foreground">Report ID: SL-{selectedRecord._id.slice(-6).toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-foreground">Engr. Md. Hasmot Ali</div>
                  <div className="text-muted-foreground">B.Sc. Civil Engineering (AUST)</div>
                  <div className="w-32 border-b border-border mt-3 mb-1 ml-auto" />
                  <div className="text-[10px] text-muted-foreground">Geotechnical Specialist</div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
