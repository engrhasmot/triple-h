"use client";

import { useEffect, useState, useCallback } from "react";
import { Eye, Users, Activity, RefreshCw, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { adminFetch } from "@/lib/admin-fetch";

interface PathStat {
  path: string;
  count: number;
}

interface DateStat {
  date: string;
  count: number;
}

interface AnalyticsData {
  totalPageViews: number;
  uniqueVisitors: number;
  pageViewsByPath: PathStat[];
  pageViewsByDate: DateStat[];
  todayViews: number;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch("/api/admin/analytics");
      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized");
        throw new Error("Failed to load analytics");
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const maxPathCount = data ? Math.max(...data.pageViewsByPath.map((p) => p.count), 1) : 1;
  const maxDateCount = data ? Math.max(...data.pageViewsByDate.map((d) => d.count), 1) : 1;

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={fetchAnalytics} className="mt-4">
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">Page view tracking and insights.</p>
        </div>
        <Button variant="outline" onClick={fetchAnalytics}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Page Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalPageViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.uniqueVisitors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Distinct IPs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&#39;s Views</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.todayViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Page Views by Path (Bar Chart) */}
      <Card>
        <CardHeader>
          <CardTitle>Page Views by Path</CardTitle>
        </CardHeader>
        <CardContent>
          {data.pageViewsByPath.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {data.pageViewsByPath.map((item) => (
                <div key={item.path} className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-8 text-right font-mono">
                    {item.count}
                  </span>
                  <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full flex items-center px-2 text-xs text-primary-foreground font-medium transition-all duration-500"
                      style={{ width: `${(item.count / maxPathCount) * 100}%` }}
                    >
                      {item.path}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Page Views Over Last 30 Days (Bar Chart) */}
      <Card>
        <CardHeader>
          <CardTitle>Page Views — Last 30 Days</CardTitle>
        </CardHeader>
        <CardContent>
          {data.pageViewsByDate.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No data yet.</p>
          ) : (
            <div className="flex items-end gap-1 h-40">
              {data.pageViewsByDate.map((item) => (
                <div
                  key={item.date}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {item.count}
                  </span>
                  <div
                    className="w-full bg-primary/80 rounded-t transition-all duration-500 hover:bg-primary"
                    style={{ height: `${(item.count / maxDateCount) * 100}%` }}
                    title={`${item.date}: ${item.count} views`}
                  />
                  <span className="text-[10px] text-muted-foreground rotate-45 origin-left whitespace-nowrap">
                    {item.date.slice(5)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
