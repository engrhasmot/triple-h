'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Megaphone,
  Search,
  Loader2,
  MessageCircle,
  CheckCircle2,
  Send,
  Sparkles,
  Users,
  Copy,
  ExternalLink,
  RotateCcw,
  Moon,
  Sun,
  Flame,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { adminFetch } from '@/lib/admin-fetch';
import { toast } from 'sonner';

interface BroadcastClient {
  name: string;
  phone: string;
  projectTitle?: string;
  source: string;
  status?: string;
  hasDue?: boolean;
}

const TEMPLATES = [
  {
    id: 'eid-fitr',
    name: '🌙 ঈদুল ফিতর',
    text: `আসসালামুয়ালাইকুম {clientName},\n\nপবিত্র ঈদুল ফিতরের আনন্দ ও অনাবিল সুখ আপনার ও আপনার পরিবারের জীবনে বয়ে আনুক সমৃদ্ধি ও শান্তি।\n\nঈদ মোবারক!\n\nআপনার স্বপ্নের বাড়ি নির্মাণের বিশ্বস্ত সঙ্গী হিসেবে পাশে থাকার জন্য ধন্যবাদ।\n\nশুভেচ্ছান্তে,\nইঞ্জিনিয়ার মোঃ হাসমত আলী\nপ্রতিষ্ঠাতা ও প্রধান পরামর্শক\nট্রিপল এইচ পল্যান ড্রাফট ও ইঞ্জিনিয়ারিং\n📞 01778-506500, 01631-186218\n🌐 triple-h-engineering.vercel.app`,
  },
  {
    id: 'eid-adha',
    name: '🕋 ঈদুল আযহা',
    text: `আসসালামুয়ালাইকুম {clientName},\n\nপবিত্র ঈদুল আযহার ত্যাগ ও মহিমা আপনার জীবনে বয়ে আনুক অনাবিল শান্তি ও কল্যাণ।\n\nআপনাকে ও আপনার পরিবারকে জানাই পবিত্র ঈদুল আযহার আন্তরিক শুভেচ্ছা ও মোবারকবাদ।\n\nঈদ মোবারক!\n\nইঞ্জিনিয়ার মোঃ হাসমত আলী\nট্রিপল এইচ ইঞ্জিনিয়ারিং কনসালটেন্সি\n📞 01778-506500`,
  },
  {
    id: 'ramadan',
    name: '🕌 রমজানুল মোবারক',
    text: `আসসালামুয়ালাইকুম {clientName},\n\nরহমত, মাগফিরাত ও নাজাতের মাস—পবিত্র মাহে রমজানের আন্তরিক মোবারকবাদ। মহান আল্লাহ আমাদের সকলের সিয়াম ও নেক আমল কবুল করুন। আমিন।\n\nইঞ্জিনিয়ার মোঃ হাসমত আলী\nট্রিপল এইচ ইঞ্জিনিয়ারিং কনসালটেন্সি\n📞 01778-506500`,
  },
  {
    id: 'new-year',
    name: '🌺 শুভ নববর্ষ',
    text: `শুভ নববর্ষ {clientName}!\n\nনতুন বছর আপনার ও আপনার পরিবারের জন্য নিয়ে আসুক নতুন আশা, আনন্দ ও সাফল্য।\n\nআপনার নির্মাণ প্রকল্পের যে কোনো ড্রয়িং, রাজউক অনুমোদন বা কাঠামোগত প্রয়োজনে আমরা সর্বদা আপনার পাশে আছি।\n\nইঞ্জিনিয়ার মোঃ হাসমত আলী\nট্রিপল এইচ ইঞ্জিনিয়ারিং\n📞 01778-506500`,
  },
  {
    id: 'service-update',
    name: '🏗️ সাইট ভিজিট ও ড্রয়িং অফার',
    text: `আসসালামুয়ালাইকুম {clientName},\n\nআশা করি ভালো আছেন। ট্রিপল এইচ ইঞ্জিনিয়ারিং থেকে জানাচ্ছি যে, আপনার {projectTitle}-এর বিষয়ে যে কোনো আর্কিটেকচারাল প্ল্যান, স্ট্রাকচারাল ডিজাইন বা রাজউক/পৌরসভা পাসিং সংক্রান্ত সহায়তায় আমরা সর্বদা প্রস্তুত।\n\nপ্রয়োজনে সরাসরি সাইট ভিজিট বা পরামর্শের জন্য আমাদের সাথে যোগাযোগ করতে পারেন।\n\nধন্যবাদ,\nইঞ্জিনিয়ার মোঃ হাসমত আলী\n📞 01778-506500, 01631-186218`,
  },
];

export default function WhatsAppBroadcastPage() {
  const [clients, setClients] = useState<BroadcastClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');

  // Selected template & custom text
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0].id);
  const [messageBody, setMessageBody] = useState(TEMPLATES[0].text);

  // Sent tracking
  const [sentPhones, setSentPhones] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    adminFetch('/api/admin/broadcast/clients')
      .then((res) => res.json())
      .then((data) => {
        setClients(data.clients || []);
      })
      .catch(() => {
        toast.error('ক্লায়েন্ট তালিকা লোড করতে ব্যর্থ হয়েছে');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleTemplateChange = (id: string) => {
    setSelectedTemplate(id);
    const tmpl = TEMPLATES.find((t) => t.id === id);
    if (tmpl) setMessageBody(tmpl.text);
  };

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search) ||
        (c.projectTitle && c.projectTitle.toLowerCase().includes(search.toLowerCase()));

      const matchSource =
        sourceFilter === 'all'
          ? true
          : sourceFilter === 'due'
          ? c.hasDue
          : c.source.toLowerCase().includes(sourceFilter.toLowerCase());

      return matchSearch && matchSource;
    });
  }, [clients, search, sourceFilter]);

  const compileMessage = (client: BroadcastClient) => {
    return messageBody
      .replace(/{clientName}/g, client.name || 'সম্মানিত ক্লায়েন্ট')
      .replace(/{projectTitle}/g, client.projectTitle || 'আপনার প্রজেক্ট');
  };

  const sendToClient = (client: BroadcastClient) => {
    const rawPhone = client.phone.replace(/[^\d]/g, '');
    const cleanPhone = rawPhone.startsWith('0') ? '880' + rawPhone.slice(1) : rawPhone;
    const msg = compileMessage(client);

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');

    setSentPhones((prev) => new Set(prev).add(client.phone));
    toast.success(`${client.name}-কে WhatsApp লিঙ্ক পাঠানো হয়েছে`);
  };

  const copyMessage = (client?: BroadcastClient) => {
    const msg = client ? compileMessage(client) : messageBody;
    navigator.clipboard.writeText(msg);
    toast.success('বার্তা ক্লিপবোর্ডে কপি করা হয়েছে');
  };

  const sendNextInQueue = () => {
    const remaining = filteredClients.filter((c) => !sentPhones.has(c.phone));
    if (remaining.length === 0) {
      toast.info('তালিকার সকল ক্লায়েন্টকে বার্তা পাঠানো সম্পন্ন হয়েছে!');
      return;
    }
    const nextClient = remaining[0];
    sendToClient(nextClient);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-primary" />
            ঈদ ও উৎসবের শুভেচ্ছা অটো-ব্রডকাস্টার (WhatsApp Broadcaster)
          </h1>
          <p className="text-sm text-muted-foreground">
            ১-ক্লিকে সকল বর্তমান ও পুরোনো ক্লায়েন্টদের হোয়াটসঅ্যাপে ট্রিপল এইচ ও ইঞ্জিনিয়ার হাসমত আলীর ব্র্যান্ডেড শুভেচ্ছা পাঠান
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={sendNextInQueue}
            disabled={filteredClients.length === 0}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            <Send className="w-4 h-4" />
            সিরিয়ালে পরবর্তী ক্লায়েন্টকে পাঠান
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Template Selector & Message Customizer (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                শুভেচ্ছা টেমপ্লেট নির্বাচন করুন
              </CardTitle>
              <CardDescription className="text-xs">
                প্রয়োজনীয় উপলক্ষ সিলেক্ট করলে বার্তা স্বয়ংক্রিয়ভাবে লোড হবে
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {TEMPLATES.map((tmpl) => (
                  <Button
                    key={tmpl.id}
                    size="sm"
                    variant={selectedTemplate === tmpl.id ? 'default' : 'outline'}
                    onClick={() => handleTemplateChange(tmpl.id)}
                    className="text-xs h-8"
                  >
                    {tmpl.name}
                  </Button>
                ))}
              </div>

              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-semibold">বার্তা কাস্টমাইজ করুন</Label>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    ব্যবহার্য ট্যাগ: {'{clientName}'}, {'{projectTitle}'}
                  </span>
                </div>
                <Textarea
                  rows={10}
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  className="text-xs font-sans leading-relaxed"
                  placeholder="আপনার বার্তা লিখুন..."
                />
              </div>

              {/* Live Preview Box */}
              <div className="border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl p-3 text-xs space-y-2">
                <div className="flex justify-between items-center pb-1 border-b border-emerald-500/20">
                  <span className="font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1 text-[11px]">
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp লাইভ প্রিভিউ
                  </span>
                  <button
                    onClick={() => copyMessage()}
                    className="text-[10px] text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> কপি
                  </button>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/40 rounded-lg p-3 text-[11px] whitespace-pre-wrap leading-relaxed shadow-sm">
                  {compileMessage({
                    name: 'মোঃ রফিকুল ইসলাম',
                    phone: '01711000000',
                    projectTitle: 'উত্তরা ৮ তলা ভবন',
                    source: 'Demo',
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Client Queue & Sender List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card>
            <CardHeader className="p-4 pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    ক্লায়েন্ট তালিকা ({filteredClients.length} জন)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    পাঠানো সম্পন্ন: {sentPhones.size} জন • বাকি আছে: {Math.max(0, filteredClients.length - sentPhones.size)} জন
                  </CardDescription>
                </div>
                <div className="flex gap-1.5 overflow-x-auto">
                  {[
                    { id: 'all', label: 'সকল' },
                    { id: 'payment', label: 'ক্লায়েন্ট' },
                    { id: 'inquiry', label: 'ইনকোয়ারি' },
                    { id: 'due', label: 'বকেয়া আছে' },
                  ].map((f) => (
                    <Button
                      key={f.id}
                      size="sm"
                      variant={sourceFilter === f.id ? 'default' : 'outline'}
                      onClick={() => setSourceFilter(f.id)}
                      className="text-xs h-7 px-2.5"
                    >
                      {f.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Search */}
              <div className="pt-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="নাম, ফোন বা প্রজেক্ট খুঁজুন..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-8 text-xs"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center p-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : filteredClients.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-xs">
                  কোনো ক্লায়েন্ট পাওয়া যায়নি।
                </div>
              ) : (
                <div className="max-h-[500px] overflow-y-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/60 text-muted-foreground uppercase sticky top-0 border-b border-border text-[10px]">
                      <tr>
                        <th className="px-4 py-2.5">ক্লায়েন্টের নাম</th>
                        <th className="px-4 py-2.5">ফোন নম্বর</th>
                        <th className="px-4 py-2.5">সোর্স / প্রজেক্ট</th>
                        <th className="px-4 py-2.5">স্ট্যাটাস</th>
                        <th className="px-4 py-2.5 text-right">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredClients.map((client, idx) => {
                        const isSent = sentPhones.has(client.phone);
                        return (
                          <tr
                            key={idx}
                            className={`hover:bg-muted/30 transition-colors ${
                              isSent ? 'bg-emerald-50/30 dark:bg-emerald-950/10' : ''
                            }`}
                          >
                            <td className="px-4 py-2.5 font-medium">
                              <div>{client.name}</div>
                              {client.hasDue && (
                                <span className="text-[10px] text-destructive font-semibold">
                                  বকেয়া রয়েছে
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2.5 font-mono text-muted-foreground">
                              {client.phone}
                            </td>
                            <td className="px-4 py-2.5">
                              <span className="truncate max-w-[120px] inline-block">
                                {client.projectTitle || client.source}
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              {isSent ? (
                                <Badge
                                  variant="outline"
                                  className="gap-1 bg-emerald-500/10 text-emerald-700 border-emerald-500/30 text-[10px]"
                                >
                                  <CheckCircle2 className="w-3 h-3" /> পাঠানো হয়েছে
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-[10px] text-muted-foreground">
                                  অপেক্ষমান
                                </Badge>
                              )}
                            </td>
                            <td className="px-4 py-2.5 text-right whitespace-nowrap">
                              <Button
                                size="sm"
                                onClick={() => sendToClient(client)}
                                className="h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                <MessageCircle className="w-3 h-3" /> পাঠান
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
        </div>
      </div>
    </div>
  );
}
