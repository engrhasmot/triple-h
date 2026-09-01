"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FolderKanban, FileText, LogOut, Loader2, Menu, Star, Users, HelpCircle, Inbox, BarChart3, ImageIcon, Newspaper, History, Globe, Banknote, Calculator, MapPin, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

const allNavItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/admin/team", label: "Team", icon: Users },
  { href: "/admin/testimonials", label: "Testimonials", icon: Star },
  { href: "/admin/faqs", label: "FAQ", icon: HelpCircle },
  { href: "/admin/inquiries", label: "Inquiries", icon: Inbox },
  { href: "/admin/quotations", label: "Quotations", icon: Calculator },
  { href: "/admin/site-visits", label: "Site Visits", icon: MapPin },
  { href: "/admin/work-orders", label: "Work Orders", icon: ClipboardList },
  { href: "/admin/files", label: "Plan Files", icon: FileText },
  { href: "/admin/payments", label: "Payments", icon: Banknote },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/activity-log", label: "Activity Log", icon: History },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

const allowedHrefsByRole: Record<string, string[]> = {
  admin: allNavItems.map((i) => i.href),
  editor: [
    "/admin/dashboard",
    "/admin/projects",
    "/admin/blog",
    "/admin/team",
    "/admin/testimonials",
    "/admin/faqs",
    "/admin/files",
    "/admin/media",
    "/admin/analytics",
  ],
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.role) setUserRole(data.role);
      })
      .catch(() => {});
  }, []);

  const navItems = userRole
    ? allNavItems.filter((item) => allowedHrefsByRole[userRole]?.includes(item.href))
    : allNavItems;

  // If we are on the login page, don't show the sidebar
  if (pathname === "/admin/login") {
    return <>{children}<Toaster position="bottom-right" /></>;
  }

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Logged out successfully");
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      toast.error("Failed to logout");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden absolute top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {/* Sidebar */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 border-r border-border bg-card transform transition-transform duration-200 ease-in-out flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-border mt-12 md:mt-0">
          <Image
            src="/images/logo.png"
            alt="TRIPLE H PLANDRAFT & ENGINEERING"
            width={120}
            height={120}
            className="h-10 w-auto object-contain"
          />
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-semibold">Admin Portal</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <span 
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                    isActive 
                      ? "bg-primary text-primary-foreground font-medium" 
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-1">
          <Link href="/">
            <span className="flex items-center gap-3 px-3 py-2.5 rounded-md text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors">
              <Globe className="w-5 h-5" />
              Visit Website
            </span>
          </Link>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <LogOut className="w-5 h-5 mr-3" />}
            Logout
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-muted/20 relative">
        <div className="p-6 md:p-8 mt-12 md:mt-0 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      
      <Toaster position="bottom-right" />
    </div>
  );
}
