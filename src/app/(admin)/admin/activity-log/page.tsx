"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { adminFetch } from "@/lib/admin-fetch";
import { format } from "date-fns";
import { toast } from "sonner";
import { useSearchParams, useRouter } from "next/navigation";

interface ActivityLogEntry {
  _id: string;
  action: string;
  resource: string;
  resourceId?: string;
  performedBy: string;
  details?: string;
  ip?: string;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const actionColorMap: Record<string, string> = {
  create: "bg-green-500/10 text-green-600",
  update: "bg-blue-500/10 text-blue-600",
  delete: "bg-red-500/10 text-red-600",
};

function getActionVariant(action: string) {
  for (const [key, cls] of Object.entries(actionColorMap)) {
    if (action.startsWith(key)) return cls;
  }
  return "bg-gray-500/10 text-gray-600";
}

export default function ActivityLogPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);

  const [actionFilter, setActionFilter] = useState(searchParams.get("action") || "");
  const [resourceFilter, setResourceFilter] = useState(searchParams.get("resource") || "");
  const [searchFilter, setSearchFilter] = useState(searchParams.get("performedBy") || "");

  const page = parseInt(searchParams.get("page") || "1", 10);

  const fetchLogs = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(p));
      if (actionFilter) params.set("action", actionFilter);
      if (resourceFilter) params.set("resource", resourceFilter);
      if (searchFilter) params.set("performedBy", searchFilter);

      const res = await adminFetch(`/api/admin/activity-log?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch logs");
      const json = await res.json();
      setLogs(json.logs);
      setPagination(json.pagination);
    } catch {
      toast.error("Failed to fetch activity logs");
    } finally {
      setLoading(false);
    }
  }, [actionFilter, resourceFilter, searchFilter]);

  useEffect(() => {
    fetchLogs(page);
  }, [page, fetchLogs]);

  const handleFilter = () => {
    const params = new URLSearchParams();
    if (actionFilter) params.set("action", actionFilter);
    if (resourceFilter) params.set("resource", resourceFilter);
    if (searchFilter) params.set("performedBy", searchFilter);
    params.set("page", "1");
    router.replace(`/admin/activity-log?${params.toString()}`);
    fetchLogs(1);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <History className="w-7 h-7" /> Activity Log
        </h1>
        <p className="text-muted-foreground mt-1">Track all admin actions across the system.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Input
              placeholder="Action (e.g. create_blog)"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="max-w-xs"
            />
            <Input
              placeholder="Resource (e.g. Blog)"
              value={resourceFilter}
              onChange={(e) => setResourceFilter(e.target.value)}
              className="max-w-xs"
            />
            <Input
              placeholder="Performed by (email)"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="max-w-xs"
            />
            <Button onClick={handleFilter}>Filter</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-muted-foreground">
              No activity logs found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
                  <tr>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Resource</th>
                    <th className="px-4 py-3">Performed By</th>
                    <th className="px-4 py-3">Details</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3">
                        <Badge className={getActionVariant(log.action)}>{log.action}</Badge>
                      </td>
                      <td className="px-4 py-3">{log.resource}</td>
                      <td className="px-4 py-3 text-muted-foreground">{log.performedBy}</td>
                      <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{log.details || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {format(new Date(log.createdAt), "MMM dd, yyyy HH:mm")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("page", String(page - 1));
              router.replace(`/admin/activity-log?${params.toString()}`);
            }}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pagination.totalPages}
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("page", String(page + 1));
              router.replace(`/admin/activity-log?${params.toString()}`);
            }}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
