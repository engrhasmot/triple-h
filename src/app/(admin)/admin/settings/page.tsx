"use client";

import { useState, useEffect } from "react";
import { 
  Settings, 
  User, 
  KeyRound, 
  ShieldCheck, 
  Building2, 
  Phone, 
  Mail, 
  Globe, 
  Database, 
  Loader2, 
  CheckCircle2, 
  ExternalLink,
  Eye,
  EyeOff
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { adminFetch } from "@/lib/admin-fetch";
import { toast } from "sonner";
import Link from "next/link";
import { format } from "date-fns";

interface AdminProfile {
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt?: string;
}

export default function AdminSettingsPage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile Edit
  const [name, setName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setName(data.name || "");
      }
    } catch {
      toast.error("Failed to load profile details");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    setSavingProfile(true);
    try {
      const res = await adminFetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Profile name updated successfully!");
        fetchProfile();
      } else {
        toast.error(data.error || "Failed to update profile name");
      }
    } catch {
      toast.error("Network error while updating profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    setSavingPassword(true);
    try {
      const res = await adminFetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Password changed successfully! Keep it safe.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.error || "Failed to change password");
      }
    } catch {
      toast.error("Network error while changing password");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
        <p className="text-sm text-muted-foreground">Loading admin settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6 text-accent" /> Admin Settings & Security
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your administrator credentials, account details, and quick system references.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20 py-1 px-3">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Super Admin Authenticated
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols on Large) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-accent" /> Administrator Profile
              </CardTitle>
              <CardDescription>
                Your account identity and administrator access role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateName} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="admin-name">Full Name</Label>
                    <Input
                      id="admin-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Engr. Hasmot Ali"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="admin-email">Email Address</Label>
                    <Input
                      id="admin-email"
                      value={profile?.email || ""}
                      disabled
                      className="bg-muted/50 font-mono text-xs cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-foreground">Role:</span>
                    <Badge variant="secondary" className="uppercase text-[10px] tracking-wider font-bold">
                      {profile?.role || "admin"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-foreground">Status:</span>
                    <span className="inline-flex items-center text-emerald-600 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Active
                    </span>
                  </div>
                  {profile?.lastLogin && (
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-foreground">Last Session:</span>
                      <span>{format(new Date(profile.lastLogin), "dd MMM yyyy, hh:mm a")}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex justify-end">
                  <Button type="submit" disabled={savingProfile} className="gap-2">
                    {savingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save Profile Name
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Change Password Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-accent" /> Change Administrator Password
              </CardTitle>
              <CardDescription>
                Ensure your admin portal is protected with a strong, secret password (minimum 8 characters)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="current-pw">Current Password *</Label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <Input
                    id="current-pw"
                    type={showPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="new-pw">New Password *</Label>
                    <Input
                      id="new-pw"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="confirm-pw">Confirm New Password *</Label>
                    <Input
                      id="confirm-pw"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type new password"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    disabled={savingPassword}
                    className="gap-2 bg-accent hover:bg-accent/90 text-white font-bold"
                  >
                    {savingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
                    Update Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Quick References & Company Info */}
        <div className="space-y-6">
          {/* Company Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="w-4 h-4 text-accent" /> Official Organization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <Globe className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Triple H Engineering Consultancy</p>
                  <p className="text-muted-foreground">Civil, Architecture & RAJUK Approval</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">WhatsApp & Hotline</p>
                  <p className="text-muted-foreground font-mono">+880 1711-285651</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Official Email</p>
                  <p className="text-muted-foreground font-mono">contact@tripleh.com</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Globe className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Official Facebook Page</p>
                  <a
                    href="https://www.facebook.com/profile.php?id=61592186641331"
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent hover:underline inline-flex items-center gap-1 font-medium"
                  >
                    View Page <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick System Tools */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="w-4 h-4 text-accent" /> System Maintenance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <Link
                href="/admin/backup"
                className="flex items-center justify-between p-2.5 rounded-lg border border-border hover:bg-muted/50 transition-colors text-xs"
              >
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-accent" />
                  <div>
                    <p className="font-semibold text-foreground">Database Backup</p>
                    <p className="text-[11px] text-muted-foreground">Download full 1-click JSON backup</p>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              </Link>

              <Link
                href="/admin/activity-log"
                className="flex items-center justify-between p-2.5 rounded-lg border border-border hover:bg-muted/50 transition-colors text-xs"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="font-semibold text-foreground">Audit Activity Logs</p>
                    <p className="text-[11px] text-muted-foreground">Review admin and security history</p>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              </Link>
            </CardContent>
          </Card>

          {/* Cloud Infrastructure Info */}
          <Card className="bg-muted/30">
            <CardContent className="pt-4 text-xs space-y-2 text-muted-foreground">
              <div className="flex justify-between">
                <span>Cloud Platform:</span>
                <span className="font-semibold text-foreground">Vercel Edge & Serverless</span>
              </div>
              <div className="flex justify-between">
                <span>Database Engine:</span>
                <span className="font-semibold text-foreground">MongoDB Atlas Cluster</span>
              </div>
              <div className="flex justify-between">
                <span>Automated Cron:</span>
                <span className="font-semibold text-emerald-600">Daily 8:00 AM WhatsApp</span>
              </div>
              <div className="flex justify-between">
                <span>System Timezone:</span>
                <span className="font-semibold text-foreground">Asia/Dhaka (UTC+6)</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
