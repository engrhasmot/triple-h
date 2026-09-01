"use client";

import { useEffect, useState } from "react";
import { Users, FolderKanban, FileText, CalendarRange, Loader2, Download, Database } from "lucide-react";
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
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastBackup, setLastBackup] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      const res = await adminFetch("/api/admin/dashboard");
      if (!res.ok) throw new Error("Failed to load dashboard data");
      const json = await res.json();
      setData(json);
    } catch (error) {
      toast.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    setLastBackup(localStorage.getItem("last_backup"));
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
    if (!data || data.recentLeads.length === 0) {
      toast.error("No data to export");
      return;
    }
    
    const headers = ["Name", "Phone", "Email", "Service", "Status", "Date", "Notes"];
    
    const csvContent = data.recentLeads.map(lead => {
      const notes = (lead.notes || lead.message || '').replace(/"/g, '""').replace(/\n/g, ' ');
      return [
        `"${lead.name || ''}"`,
        `"${lead.phone || ''}"`,
        `"${lead.email || ''}"`,
        `"${lead.serviceType || ''}"`,
        `"${lead.status || ''}"`,
        `"${format(new Date(lead.createdAt), "yyyy-MM-dd")}"`,
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
    link.setAttribute("download", `tripleh_leads_${format(new Date(), "yyyy-MM-dd")}.csv`);
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

  if (!data) return null;

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
            <div className="text-2xl font-bold">{data.metrics.newInquiries}</div>
            <p className="text-xs text-muted-foreground">Out of {data.metrics.totalInquiries} total inquiries</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Files</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.metrics.pendingFiles}</div>
            <p className="text-xs text-muted-foreground">Plan passing files requiring action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Bookings</CardTitle>
            <CalendarRange className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.metrics.newBookings}</div>
            <p className="text-xs text-muted-foreground">Pending site visits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.metrics.activeProjects}</div>
            <p className="text-xs text-muted-foreground">Published in portfolio</p>
          </CardContent>
        </Card>
      </div>

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
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = `tripleh_backup_${new Date().toISOString().split("T")[0]}.json`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                  localStorage.setItem("last_backup", new Date().toISOString());
                  setLastBackup(new Date().toISOString());
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
                Last backup: {format(new Date(lastBackup), "MMM dd, yyyy HH:mm")}
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
                {data.recentLeads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-muted-foreground">No leads found.</td>
                  </tr>
                ) : (
                  data.recentLeads.map((lead) => (
                    <tr key={lead._id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium">{lead.name}</p>
                        <p className="text-xs text-muted-foreground">{lead.phone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="capitalize">
                          {lead.serviceType.replace('-', ' ')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {format(new Date(lead.createdAt), "MMM dd, yyyy")}
                      </td>
                      <td className="px-4 py-3">
                        <Badge 
                          variant={lead.status === 'new' ? 'default' : lead.status === 'closed' ? 'secondary' : 'outline'}
                        >
                          {lead.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <select 
                          className="bg-background border border-border rounded text-xs px-2 py-1 ml-auto"
                          value={lead.status}
                          onChange={(e) => updateLeadStatus(lead._id, e.target.value)}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="in-progress">In Progress</option>
                          <option value="converted">Converted</option>
                          <option value="closed">Closed</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
