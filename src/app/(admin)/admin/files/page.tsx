"use client";

import { useEffect, useState } from "react";
import { FileText, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { toast } from "sonner";
import { adminFetch } from "@/lib/admin-fetch";

export default function AdminFiles() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [remark, setRemark] = useState<Record<string, string>>({});

  const [newFile, setNewFile] = useState({
    clientName: '',
    phone: '',
    projectTitle: '',
    location: '',
    submissionDate: '',
  });

  const fetchFiles = async () => {
    try {
      const res = await adminFetch("/api/admin/files");
      const json = await res.json();
      setFiles(json.data || []);
    } catch (error) {
      toast.error("Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFiles(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFile.clientName || !newFile.phone || !newFile.projectTitle || !newFile.location) {
      toast.error("All fields are required");
      return;
    }
    setSaving(true);
    try {
      const res = await adminFetch("/api/admin/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFile),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Tracking file created");
      setDialogOpen(false);
      setNewFile({ clientName: '', phone: '', projectTitle: '', location: '', submissionDate: '' });
      fetchFiles();
    } catch (err) {
      toast.error("Failed to create file");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await adminFetch("/api/admin/files", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          currentStatus: newStatus,
          remark: remark[id] || "",
          updatedBy: "Engr. Md. Hasmot Ali"
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("File status updated successfully");
      setRemark(prev => ({ ...prev, [id]: "" }));
      fetchFiles();
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Plan Passing Files</h1>
          <p className="text-muted-foreground mt-1">Manage client municipality approvals and update tracking status.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button><Plus className="w-4 h-4 mr-2" /> New Tracking File</Button>} />
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Tracking File</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="cn">Client Name *</Label>
                <Input id="cn" value={newFile.clientName} onChange={e => setNewFile({...newFile, clientName: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ph">Phone Number *</Label>
                <Input id="ph" value={newFile.phone} onChange={e => setNewFile({...newFile, phone: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pt">Project Title *</Label>
                <Input id="pt" value={newFile.projectTitle} onChange={e => setNewFile({...newFile, projectTitle: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="loc">Location *</Label>
                <Input id="loc" value={newFile.location} onChange={e => setNewFile({...newFile, location: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sd">Submission Date</Label>
                <Input id="sd" type="date" value={newFile.submissionDate} onChange={e => setNewFile({...newFile, submissionDate: e.target.value})} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving ? 'Creating...' : 'Create File'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {files.map((file) => (
          <Card key={file._id} className="overflow-hidden">
            <CardHeader className="bg-secondary/30 pb-4 border-b">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <CardTitle className="text-xl font-heading">{file.projectTitle}</CardTitle>
                    <span className={`px-2.5 py-0.5 rounded-full badge-micro ${
                      file.currentStatus === 'submitted' ? 'status-submitted' :
                      file.currentStatus === 'under-review' ? 'status-review' :
                      file.currentStatus === 'revision-required' ? 'status-correction' :
                      file.currentStatus === 'approved' ? 'status-approved' :
                      'bg-destructive text-destructive-foreground'
                    }`}>
                      {file.currentStatus.replace('-', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    File ID: <span className="font-mono font-bold text-foreground">{file.fileId}</span>
                  </p>
                </div>
                <div className="text-left md:text-right text-sm">
                  <p><span className="font-medium">Client:</span> {file.clientName}</p>
                  <p className="text-muted-foreground">{file.phone}</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4 border-r pr-0 md:pr-8">
                  <h3 className="font-semibold border-b pb-2">Update Status</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Engineering Remark (Optional)</label>
                      <Input
                        placeholder="e.g. Waiting for Town Planner signature..."
                        value={remark[file._id] || ""}
                        onChange={(e) => setRemark(prev => ({ ...prev, [file._id]: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-2 block">Change Status To:</label>
                      <div className="flex flex-wrap gap-2">
                        {['submitted', 'under-review', 'revision-required', 'approved', 'rejected'].map((status) => (
                          <Button
                            key={status}
                            variant={file.currentStatus === status ? "default" : "outline"}
                            size="sm"
                            className="capitalize text-xs"
                            disabled={file.currentStatus === status || updatingId === file._id}
                            onClick={() => updateStatus(file._id, status)}
                          >
                            {status.replace('-', ' ')}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold border-b pb-2">Recent Updates</h3>
                  <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                    {file.statusHistory.slice().reverse().map((h: any, i: number) => (
                      <div key={i} className="text-sm p-3 rounded-md bg-muted/50 border">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold capitalize text-primary">{h.status.replace('-', ' ')}</span>
                          <span className="text-xs text-muted-foreground">{format(new Date(h.date), "MMM dd, yyyy")}</span>
                        </div>
                        {h.note && <p className="text-xs text-foreground mt-1">&ldquo;{h.note}&rdquo;</p>}
                        <p className="text-[10px] text-muted-foreground mt-2 text-right">- {h.updatedBy}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {files.length === 0 && (
          <div className="py-12 text-center border-2 border-dashed border-border rounded-xl">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No tracking files found</h3>
            <p className="text-muted-foreground mb-4">Clients will see their status here once a file is generated.</p>
          </div>
        )}
      </div>
    </div>
  );
}
