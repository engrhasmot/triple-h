'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Plus,
  Trash2,
  Search,
  Loader2,
  AlertTriangle,
  ArrowDownRight,
  TrendingDown,
  Building,
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
import { format, differenceInDays } from 'date-fns';

interface InventoryItem {
  _id: string;
  projectName: string;
  itemType: string;
  itemLabel: string;
  challanNo?: string;
  supplier?: string;
  quantity: number;
  unit: string;
  usedQuantity: number;
  deliveryDate: string;
  notes?: string;
  createdAt: string;
}

interface Stats {
  totalItems: number;
  cementBags: number;
  rodTons: number;
  lowStockCount: number;
}

const ITEM_TYPES = [
  { value: 'all', label: 'সকল মালামাল' },
  { value: 'cement', label: 'সিমেন্ট (Cement)' },
  { value: 'rod', label: 'রড / স্টিল (MS Rod)' },
  { value: 'sand', label: 'বালু (Sand)' },
  { value: 'brick', label: 'ইট (Brick)' },
  { value: 'stone-chips', label: 'পাথর / খোয়া (Stone)' },
  { value: 'paint', label: 'রং (Paint)' },
  { value: 'tile', label: 'টাইলস (Tiles)' },
  { value: 'other', label: 'অন্যান্য (Other)' },
];

export default function SiteInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [useModalOpen, setUseModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    projectName: '',
    itemType: 'cement',
    itemLabel: '',
    challanNo: '',
    supplier: '',
    quantity: '',
    unit: 'bag',
    deliveryDate: format(new Date(), 'yyyy-MM-dd'),
    notes: '',
  });

  const [useQty, setUseQty] = useState('');

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.set('itemType', typeFilter);
      if (search) params.set('search', search);

      const res = await adminFetch(`/api/admin/site-inventory?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch inventory');
      const json = await res.json();
      setItems(json.data || []);
      setStats(json.stats || null);
    } catch (err: any) {
      toast.error(err.message || 'Error fetching inventory');
    } finally {
      setLoading(false);
    }
  }, [typeFilter, search]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectName || !formData.quantity) {
      toast.error('Project name and quantity are required');
      return;
    }
    setSubmitting(true);
    try {
      const res = await adminFetch('/api/admin/site-inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to add item');
      toast.success('Inventory item recorded successfully');
      setAddModalOpen(false);
      setFormData({
        projectName: '',
        itemType: 'cement',
        itemLabel: '',
        challanNo: '',
        supplier: '',
        quantity: '',
        unit: 'bag',
        deliveryDate: format(new Date(), 'yyyy-MM-dd'),
        notes: '',
      });
      fetchItems();
    } catch (err: any) {
      toast.error(err.message || 'Error adding item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateUsed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setSubmitting(true);
    try {
      const res = await adminFetch('/api/admin/site-inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedItem._id,
          usedQuantity: Number(useQty),
        }),
      });
      if (!res.ok) throw new Error('Failed to update used quantity');
      toast.success('Stock updated successfully');
      setUseModalOpen(false);
      fetchItems();
    } catch (err: any) {
      toast.error(err.message || 'Error updating stock');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this inventory record?')) return;
    try {
      const res = await adminFetch('/api/admin/site-inventory', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to delete item');
      toast.success('Item deleted successfully');
      fetchItems();
    } catch (err: any) {
      toast.error(err.message || 'Error deleting item');
    }
  };

  const openUseModal = (item: InventoryItem) => {
    setSelectedItem(item);
    setUseQty(String(item.usedQuantity || 0));
    setUseModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" />
            সাইট মালামাল চালান ও স্টক ট্র্যাকার (Site Inventory)
          </h1>
          <p className="text-sm text-muted-foreground">
            সাইটে রড, সিমেন্ট ও মালামাল ডেলিভারি চালান সংরক্ষণ, ব্যবহার ও ৩০+ দিন পুরোনো সিমেন্ট সতর্কতা
          </p>
        </div>
        <Button onClick={() => setAddModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> নতুন চালান এন্ট্রি
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">মোট চালান রেকর্ড</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{stats?.totalItems ?? 0}</div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-blue-700 dark:text-blue-400 uppercase">মজুদ সিমেন্ট (ব্যাগ)</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{stats?.cementBags ?? 0}</div>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase">মজুদ রড (টন)</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{stats?.rodTons ?? 0}</div>
          </CardContent>
        </Card>
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase">লো স্টক আইটেম</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">{stats?.lowStockCount ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="প্রজেক্ট, চালান বা সরবরাহকারী খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          {ITEM_TYPES.map((t) => (
            <Button
              key={t.value}
              size="sm"
              variant={typeFilter === t.value ? 'default' : 'outline'}
              onClick={() => setTypeFilter(t.value)}
              className="text-xs whitespace-nowrap"
            >
              {t.label}
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
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              কোনো সাইট মালামালের চালান পাওয়া যায়নি।
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-4 py-3">প্রজেক্ট ও মালামাল</th>
                    <th className="px-4 py-3">চালান ও সাপ্লায়ার</th>
                    <th className="px-4 py-3">ডেলিভারি</th>
                    <th className="px-4 py-3">ব্যবহৃত</th>
                    <th className="px-4 py-3">মজুদ (Stock)</th>
                    <th className="px-4 py-3">তারিখ ও সতর্কতা</th>
                    <th className="px-4 py-3 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((item) => {
                    const remaining = item.quantity - (item.usedQuantity || 0);
                    const ageDays = differenceInDays(new Date(), new Date(item.deliveryDate));
                    const isOldCement = item.itemType === 'cement' && ageDays > 30 && remaining > 0;

                    return (
                      <tr key={item._id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium">
                          <div>{item.projectName}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.itemLabel || item.itemType}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <div>চালান: <span className="font-mono font-semibold">{item.challanNo || '—'}</span></div>
                          <div className="text-muted-foreground">{item.supplier || '—'}</div>
                        </td>
                        <td className="px-4 py-3 font-semibold">
                          {item.quantity} <span className="text-xs text-muted-foreground font-normal">{item.unit}</span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {item.usedQuantity || 0} {item.unit}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-bold ${remaining <= 0 ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                            {remaining} {item.unit}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(item.deliveryDate), 'dd MMM yyyy')}
                          </div>
                          {isOldCement && (
                            <Badge variant="outline" className="gap-1 bg-amber-500/10 text-amber-700 border-amber-500/30 text-[10px] mt-0.5">
                              <AlertTriangle className="w-3 h-3" /> ৩০+ দিন পুরোনো
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openUseModal(item)}
                            className="h-8 text-xs gap-1"
                          >
                            <ArrowDownRight className="w-3.5 h-3.5" /> স্টক আপডেট
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(item._id)}
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
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>নতুন সাইট মালামাল চালান এন্ট্রি</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="space-y-1">
              <Label>প্রজেক্টের নাম *</Label>
              <Input
                required
                placeholder="উদাঃ গুলশান ভিলা"
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>মালামালের ধরন *</Label>
                <select
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
                  value={formData.itemType}
                  onChange={(e) => setFormData({ ...formData, itemType: e.target.value })}
                >
                  {ITEM_TYPES.filter((t) => t.value !== 'all').map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label>আইটেম লেবেল / নাম</Label>
                <Input
                  placeholder="উদাঃ ১৬ মিমি রড / ওপিসি"
                  value={formData.itemLabel}
                  onChange={(e) => setFormData({ ...formData, itemLabel: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>চালান নম্বর</Label>
                <Input
                  placeholder="CH-89201"
                  value={formData.challanNo}
                  onChange={(e) => setFormData({ ...formData, challanNo: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>সরবরাহকারী (Supplier)</Label>
                <Input
                  placeholder="উদাঃ মেসার্স রহিম ট্রেডার্স"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>ডেলিভারি পরিমাণ *</Label>
                <Input
                  type="number"
                  required
                  placeholder="উদাঃ 100"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>একক (Unit)</Label>
                <select
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                >
                  <option value="bag">ব্যাগ (Bag)</option>
                  <option value="ton">টন (Ton)</option>
                  <option value="cft">সিএফটি (Cft)</option>
                  <option value="sft">এসএফটি (Sft)</option>
                  <option value="nos">পিস / সংখ্যা (Nos)</option>
                  <option value="liter">লিটার (Liter)</option>
                  <option value="kg">কেজি (Kg)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label>ডেলিভারি তারিখ</Label>
              <Input
                type="date"
                value={formData.deliveryDate}
                onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <Label>নোট বা সাইট রিসিভার</Label>
              <Input
                placeholder="রিসিভ করেছেন মোঃ সেলিম..."
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

      {/* Use / Stock Update Modal */}
      <Dialog open={useModalOpen} onOpenChange={setUseModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>মালামাল ব্যবহার / স্টক আপডেট</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <form onSubmit={handleUpdateUsed} className="space-y-4">
              <div className="p-3 bg-muted/40 rounded-lg text-xs space-y-1">
                <div className="font-bold text-foreground">{selectedItem.projectName}</div>
                <div className="text-muted-foreground">{selectedItem.itemLabel || selectedItem.itemType}</div>
                <div className="font-semibold text-primary">
                  মোট ডেলিভারি: {selectedItem.quantity} {selectedItem.unit}
                </div>
              </div>

              <div className="space-y-1">
                <Label>এখন পর্যন্ত মোট ব্যবহৃত পরিমাণ ({selectedItem.unit})</Label>
                <Input
                  type="number"
                  required
                  min="0"
                  max={selectedItem.quantity}
                  value={useQty}
                  onChange={(e) => setUseQty(e.target.value)}
                />
                <p className="text-[11px] text-muted-foreground">
                  অবশিষ্ট স্টক হবে: {Math.max(0, selectedItem.quantity - Number(useQty || 0))} {selectedItem.unit}
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setUseModalOpen(false)}>
                  বাতিল
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                  আপডেট করুন
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
