"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  FolderKanban, 
  FileText, 
  CalendarRange, 
  Loader2, 
  Download, 
  Database, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Clock 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from "sonner";
import { adminFetch } from "@/lib/admin-fetch";

interface DashboardData {
  metrics: {
    totalInquiries: number;
    newInquiries: number;
    activeProjects: number;
    pendingFiles: number;
    newBookings: number;
  };
  recentLeads: any[];
  todayAppointments?: any[];
}

function safeFormatDate(d: any, fmt: string = "MMM dd, yyyy"): string {
  if (!d) return "N/A";
  try {
    const dateObj = new Date(d);
    if (isNaN(dateObj.getTime())) return "N/A";
    return format(dateObj, fmt);
  } catch {
    return "N/A";
  }
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastBackup, setLastBackup] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      const res = await adminFetch("/api/admin/dashboard");
      if (!res.ok) {
        console.warn("Dashboard API responded with status:", res.status);
        return;
      }
      const json = await res.json();
      if (json && (json.metrics || json.success)) {
        setData(json);
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      toast.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    try {
      const stored = localStorage.getItem("last_backup");
      if (stored) setLastBackup(stored);
    } catch {
      // ignore localStorage error
    }
  }, []);

  const updateLeadStatus = async (id: string, newStatus: string) => {
    try {
      const res = await adminFetch("/api/admin/dashboard", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) fetchDashboard();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const downloadCSV = () => {
    if (!data || !data.recentLeads || data.recentLeads.length === 0) {
      toast.error("No data to export");
      return;
    }
    
    const headers = ["Name", "Phone", "Email", "Service", "Status", "Date", "Notes"];
    
    const csvContent = data.recentLeads.map(lead => {
      const notes = (lead?.notes || lead?.message || '').replace(/"/g, '""').replace(/\n/g, ' ');
      return [
        `"${lead?.name || ''}"`,
        `"${lead?.phone || ''}"`,
        `"${lead?.email || ''}"`,
        `"${(lead?.serviceType || '').replace(/-/g, ' ')}"`,
        `"${lead?.status || ''}"`,
        `"${safeFormatDate(lead?.createdAt, "yyyy-MM-dd")}"`,
        `"${notes}"`
      ].join(",");
    });
    
    // UTF-8 BOM for Bengali support in Excel
    const BOM = "\uFEFF";
    const finalCSV = BOM + [headers.join(","), ...csvContent].join("\n");
    
    const blob = new Blob([finalCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `tripleh_leads_${safeFormatDate(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">Welcome back. Here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.metrics?.newInquiries ?? 0}</div>
            <p className="text-xs text-muted-foreground">Out of {data?.metrics?.totalInquiries ?? 0} total inquiries</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Files</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.metrics?.pendingFiles ?? 0}</div>
            <p className="text-xs text-muted-foreground">Plan passing files requiring action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Bookings</CardTitle>
            <CalendarRange className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.metrics?.newBookings ?? 0}</div>
            <p className="text-xs text-muted-foreground">Pending site visits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.metrics?.activeProjects ?? 0}</div>
            <p className="text-xs text-muted-foreground">Published in portfolio</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule & Site Visits */}
      <Card className="border-primary/20 shadow-sm bg-gradient-to-br from-card to-primary/5">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="space-y-0.5">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <CalendarRange className="w-5 h-5 text-primary" />
              আজকের শিডিউল ও সাইট ভিজিট (Today&apos;s Schedule)
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {safeFormatDate(new Date(), "EEEE, dd MMMM yyyy")}
            </p>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            {data?.todayAppointments?.length || 0} Scheduled
          </Badge>
        </CardHeader>
        <CardContent>
          {!data?.todayAppointments || data.todayAppointments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 italic text-center">
              আজকের কোনো নির্ধারিত সাইট ভিজিট বা অ্যাপয়েন্টমেন্ট নেই।
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.todayAppointments.map((apt: any, idx: number) => {
                const aptName = apt?.name || "Client";
                const rawPhone = apt?.phone ? String(apt.phone) : "";
                const cleanPhone = rawPhone.replace(/[+\s-]/g, "");
                const waPhone = cleanPhone.startsWith("0") ? "880" + cleanPhone.slice(1) : cleanPhone;
                const aptType = apt?.appointmentType || "site-visit";
                const timeSlot = apt?.timeSlot || "Anytime";
                const location = apt?.location || "";
                const aptKey = apt?._id ? String(apt._id) : `apt-${idx}`;

                return (
                  <div key={aptKey} className="p-3.5 rounded-xl border bg-card/80 space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="font-semibold text-sm text-foreground">{aptName}</span>
                      <Badge variant="secondary" className="text-[10px] capitalize">
                        {aptType}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        <span>{timeSlot}</span>
                      </div>
                      {location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-primary" />
                          <span className="truncate">{location}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 pt-1 border-t border-border/60">
                      {rawPhone && (
                        <a
                          href={`tel:${rawPhone}`}
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-secondary hover:bg-secondary/80 text-foreground transition-colors font-medium"
                        >
                          <Phone className="w-3 h-3" />
                          Call
                        </a>
                      )}
                      {waPhone && (
                        <a
                          href={`https://wa.me/${waPhone}?text=${encodeURIComponent(`Hello ${aptName}, regarding your appointment today with Triple H Plandraft & Engineering...`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors font-medium border border-emerald-200"
                        >
                          <MessageCircle className="w-3 h-3" />
                          WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Database Backup */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-heading">Database Backup</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              onClick={async () => {
                const btn = document.activeElement as HTMLButtonElement;
                if (btn) btn.disabled = true;
                try {
                  const res = await adminFetch("/api/admin/backup", { method: "POST" });
                  if (!res.ok) throw new Error("Backup failed");
                  const blob = await res.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `backup-${safeFormatDate(new Date(), "yyyy-MM-dd-HH-mm")}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  const nowIso = new Date().toISOString();
                  localStorage.setItem("last_backup", nowIso);
                  setLastBackup(nowIso);
                  toast.success("Backup downloaded successfully");
                } catch {
                  toast.error("Failed to create backup");
                } finally {
                  if (btn) btn.disabled = false;
                }
              }}
            >
              <Download className="w-4 h-4 mr-2" /> Download Backup
            </Button>
            {lastBackup && (
              <span className="text-xs text-muted-foreground">
                Last backup: {safeFormatDate(lastBackup, "MMM dd, yyyy HH:mm")}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Leads Table */}
      <Card className="rounded-2xl border-slate-800/20 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="font-heading">Recent Cost Estimator & Consultation Leads</CardTitle>
          <button 
            onClick={downloadCSV}
            className="flex items-center text-xs font-black uppercase tracking-wider px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors border border-border"
          >
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
                <tr>
                  <th className="px-4 py-3 rounded-tl-md">Client</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right rounded-tr-md">Action</th>
                </tr>
              </thead>
              <tbody>
                {!data?.recentLeads || data.recentLeads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-muted-foreground">No leads found.</td>
                  </tr>
                ) : (
                  data.recentLeads.map((lead, idx) => {
                    const leadId = lead?._id ? String(lead._id) : `lead-${idx}`;
                    const leadName = lead?.name || "Client";
                    const leadPhone = lead?.phone || "";
                    const leadService = lead?.serviceType ? String(lead.serviceType).replace(/-/g, ' ') : "Consultation";
                    const leadStatus = lead?.status || "new";

                    return (
                      <tr key={leadId} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium">{leadName}</p>
                          <p className="text-xs text-muted-foreground">{leadPhone}</p>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="capitalize">
                            {leadService}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {safeFormatDate(lead?.createdAt, "MMM dd, yyyy")}
                        </td>
                        <td className="px-4 py-3">
                          <Badge 
                            variant={leadStatus === 'new' ? 'default' : leadStatus === 'closed' ? 'secondary' : 'outline'}
                          >
                            {leadStatus}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <select 
                            className="bg-background border border-border rounded text-xs px-2 py-1 ml-auto"
                            value={leadStatus}
                            onChange={(e) => updateLeadStatus(leadId, e.target.value)}
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="in-progress">In Progress</option>
                            <option value="converted">Converted</option>
                            <option value="closed">Closed</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
