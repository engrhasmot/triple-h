'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Trash2,
  Loader2,
  Search,
  Edit2,
  Star,
  Phone,
  MessageCircle,
  Users,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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

const SPECIALTIES = [
  { value: 'all', label: 'All' },
  { value: 'mason', label: 'Mason' },
  { value: 'rod-binder', label: 'Rod Binder' },
  { value: 'shuttering', label: 'Shuttering' },
  { value: 'sanitary-plumber', label: 'Plumber' },
  { value: 'electrician', label: 'Electrician' },
  { value: 'painter', label: 'Painter' },
  { value: 'tile-fixer', label: 'Tile Fixer' },
  { value: 'earthwork', label: 'Earthwork' },
  { value: 'other', label: 'Other' },
];

const SPECIALTY_COLORS: Record<string, string> = {
  mason: 'bg-amber-500/10 text-amber-700 border-amber-500/30',
  'rod-binder': 'bg-blue-500/10 text-blue-700 border-blue-500/30',
  shuttering: 'bg-purple-500/10 text-purple-700 border-purple-500/30',
  'sanitary-plumber': 'bg-cyan-500/10 text-cyan-700 border-cyan-500/30',
  electrician: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30',
  painter: 'bg-pink-500/10 text-pink-700 border-pink-500/30',
  'tile-fixer': 'bg-orange-500/10 text-orange-700 border-orange-500/30',
  earthwork: 'bg-brown-500/10 text-stone-700 border-stone-500/30',
  other: 'bg-gray-500/10 text-gray-600 border-gray-500/30',
};

const emptyForm = {
  name: '',
  phone: '',
  specialty: 'mason',
  experienceYears: '',
  rating: '3',
  area: '',
  notes: '',
  lastWorked: '',
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
          }`}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-1">({rating}/5)</span>
    </div>
  );
}

function buildWhatsAppLink(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  const intl = digits.startsWith('0') ? '880' + digits.slice(1) : digits;
  return `https://wa.me/${intl}?text=${encodeURIComponent('Hello, I got your contact from Triple H Engineering.')}`;
}

export default function AdminContractorsPage() {
  const [contractors, setContractors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  const fetchContractors = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (specialtyFilter !== 'all') params.set('specialty', specialtyFilter);
      if (search) params.set('search', search);
      const res = await adminFetch(`/api/admin/contractors?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setContractors(data.contractors || []);
      }
    } catch {
      toast.error('Failed to load contractors');
    } finally {
      setLoading(false);
    }
  }, [specialtyFilter, search]);

  useEffect(() => {
    fetchContractors();
  }, [fetchContractors]);

  const openEdit = (c: any) => {
    setEditTarget(c);
    setFormData({
      name: c.name || '',
      phone: c.phone || '',
      specialty: c.specialty || 'mason',
      experienceYears: c.experienceYears?.toString() || '',
      rating: c.rating?.toString() || '3',
      area: c.area || '',
      notes: c.notes || '',
      lastWorked: c.lastWorked ? new Date(c.lastWorked).toISOString().split('T')[0] : '',
    });
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditTarget(null);
    setFormData(emptyForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error('Name and phone are required');
      return;
    }
    setSubmitting(true);
    try {
      const payload = editTarget ? { id: editTarget._id, ...formData } : formData;
      const res = await adminFetch('/api/admin/contractors', {
        method: editTarget ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(editTarget ? 'Contractor updated!' : 'Contractor added!');
        closeModal();
        fetchContractors();
      } else {
        toast.error(data.error || 'Operation failed');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove contractor "${name}" from active list?`)) return;
    try {
      const res = await adminFetch(`/api/admin/contractors?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Contractor removed');
        fetchContractors();
      } else {
        toast.error('Failed to remove contractor');
      }
    } catch {
      toast.error('Network error');
    }
  };

  const specialtyBreakdown = SPECIALTIES.filter((s) => s.value !== 'all').map((s) => ({
    ...s,
    count: contractors.filter((c) => c.specialty === s.value).length,
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Users className="w-7 h-7 text-accent" />
            বিশ্বস্ত কন্ট্রাক্টর ডিরেক্টরি
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Trusted Contractor Directory — {contractors.length} active contractors
          </p>
        </div>
        <Button
          onClick={() => { setEditTarget(null); setFormData(emptyForm); setShowAddModal(true); }}
          className="gap-1.5 font-bold bg-accent hover:bg-accent/90"
        >
          <Plus className="w-4 h-4" /> Add Contractor
        </Button>
      </div>

      {/* Stats: specialty breakdown */}
      <div className="flex flex-wrap gap-2">
        {specialtyBreakdown.map((s) => (
          <div
            key={s.value}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 ${
              SPECIALTY_COLORS[s.value] || 'bg-muted'
            }`}
          >
            {s.label}: <span className="font-black">{s.count}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input
            className="pl-9 text-sm"
            placeholder="Search name, phone, area..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {/* Specialty tabs */}
        <div className="flex flex-wrap gap-1.5">
          {SPECIALTIES.map((s) => (
            <button
              key={s.value}
              onClick={() => setSpecialtyFilter(s.value)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors font-medium ${
                specialtyFilter === s.value
                  ? 'bg-accent text-white border-accent'
                  : 'border-border hover:bg-muted'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contractor grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-accent" />
          <span className="text-sm text-muted-foreground">Loading contractors...</span>
        </div>
      ) : contractors.length === 0 ? (
        <div className="text-center py-20 space-y-2">
          <Users className="w-10 h-10 text-muted-foreground/40 mx-auto" />
          <p className="font-semibold text-sm">No contractors found</p>
          <p className="text-xs text-muted-foreground">Add trusted contractors to your directory.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {contractors.map((c) => (
            <Card key={c._id} className="border hover:shadow-md transition-shadow">
              <CardContent className="p-4 space-y-3">
                {/* Name + specialty */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-base leading-tight">{c.name}</p>
                    <Badge
                      variant="outline"
                      className={`text-[10px] mt-1 ${SPECIALTY_COLORS[c.specialty] || ''}`}
                    >
                      {SPECIALTIES.find((s) => s.value === c.specialty)?.label || c.specialty}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-accent"
                      onClick={() => openEdit(c)}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(c._id, c.name)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Star rating */}
                <StarRating rating={c.rating || 3} />

                {/* Experience & Area */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {c.experienceYears !== undefined && (
                    <span>⏱ {c.experienceYears} yrs experience</span>
                  )}
                  {c.area && <span>📍 {c.area}</span>}
                  {c.lastWorked && (
                    <span>
                      🗓 Last: {new Date(c.lastWorked).toLocaleDateString('en-BD', { month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>

                {/* Notes */}
                {c.notes && (
                  <p className="text-xs text-muted-foreground italic line-clamp-2">{c.notes}</p>
                )}

                {/* Action buttons */}
                <div className="flex gap-2 pt-1">
                  <a
                    href={`tel:${c.phone}`}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-border hover:bg-muted transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {c.phone}
                  </a>
                  <a
                    href={buildWhatsAppLink(c.phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md bg-green-500/10 text-green-700 border border-green-500/30 hover:bg-green-500/20 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    WA
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={showAddModal} onOpenChange={(o) => { if (!o) closeModal(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-accent" />
              {editTarget ? 'Edit Contractor' : 'Add New Contractor'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Name *</Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Rahim Mia"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Phone *</Label>
                <Input
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="01XXXXXXXXX"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Specialty *</Label>
                <select
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
                  value={formData.specialty}
                  onChange={(e) => setFormData((p) => ({ ...p, specialty: e.target.value }))}
                >
                  {SPECIALTIES.filter((s) => s.value !== 'all').map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Rating (1–5)</Label>
                <select
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
                  value={formData.rating}
                  onChange={(e) => setFormData((p) => ({ ...p, rating: e.target.value }))}
                >
                  {[1, 2, 3, 4, 5].map((r) => (
                    <option key={r} value={r}>{'⭐'.repeat(r)} ({r})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Experience (years)</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.experienceYears}
                  onChange={(e) => setFormData((p) => ({ ...p, experienceYears: e.target.value }))}
                  placeholder="e.g. 8"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Area</Label>
                <Input
                  value={formData.area}
                  onChange={(e) => setFormData((p) => ({ ...p, area: e.target.value }))}
                  placeholder="e.g. Mirpur, Dhaka"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Last Worked</Label>
              <Input
                type="date"
                value={formData.lastWorked}
                onChange={(e) => setFormData((p) => ({ ...p, lastWorked: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                placeholder="Any additional info..."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 font-bold bg-accent hover:bg-accent/90"
              >
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editTarget ? 'Save Changes' : 'Add Contractor'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
