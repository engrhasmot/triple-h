'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Trash2,
  Loader2,
  Search,
  ClipboardList,
  Calendar,
  User,
  AlertCircle,
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

const COLUMNS = [
  { key: 'todo', label: '📋 To Do', headerClass: 'bg-blue-500/10 text-blue-700 border-blue-500/20' },
  { key: 'working', label: '⚙️ Working', headerClass: 'bg-orange-500/10 text-orange-700 border-orange-500/20' },
  { key: 'review', label: '🔍 Review', headerClass: 'bg-purple-500/10 text-purple-700 border-purple-500/20' },
  { key: 'done', label: '✅ Done', headerClass: 'bg-green-500/10 text-green-700 border-green-500/20' },
];

const PRIORITY_BADGE: Record<string, string> = {
  urgent: 'bg-red-500/10 text-red-700 border-red-500/30',
  high: 'bg-orange-500/10 text-orange-700 border-orange-500/30',
  medium: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30',
  low: 'bg-gray-500/10 text-gray-600 border-gray-500/30',
};

const STATUS_OPTIONS = ['todo', 'working', 'review', 'done'];

const emptyForm = {
  title: '',
  description: '',
  assignedTo: '',
  projectRef: '',
  dueDate: '',
  priority: 'medium',
};

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignedFilter, setAssignedFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (assignedFilter) params.set('assignedTo', assignedFilter);
      const res = await adminFetch(`/api/admin/tasks?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [assignedFilter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await adminFetch('/api/admin/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        toast.success('Task status updated');
        fetchTasks();
      } else {
        toast.error('Failed to update status');
      }
    } catch {
      toast.error('Network error');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete task "${title}"?`)) return;
    try {
      const res = await adminFetch(`/api/admin/tasks?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Task deleted');
        fetchTasks();
      } else {
        toast.error('Failed to delete task');
      }
    } catch {
      toast.error('Network error');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Task title is required');
      return;
    }
    setSubmitting(true);
    try {
      const res = await adminFetch('/api/admin/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Task created!');
        setShowAddModal(false);
        setFormData(emptyForm);
        fetchTasks();
      } else {
        toast.error(data.error || 'Failed to create task');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const now = new Date();
  const getColumn = (status: string) => tasks.filter((t) => t.status === status);
  const counts = {
    total: tasks.length,
    todo: getColumn('todo').length,
    working: getColumn('working').length,
    review: getColumn('review').length,
    done: getColumn('done').length,
  };

  const isOverdue = (task: any) =>
    task.dueDate && new Date(task.dueDate) < now && task.status !== 'done';

  return (
    <div className="space-y-6 max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-accent" />
            টাস্ক ডেলিভারি বোর্ড
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Task Delivery Board — track and manage team tasks</p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="gap-1.5 font-bold bg-accent hover:bg-accent/90"
        >
          <Plus className="w-4 h-4" /> Add Task
        </Button>
      </div>

      {/* Stats bar */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Total', value: counts.total, color: 'bg-muted' },
          { label: 'To Do', value: counts.todo, color: 'bg-blue-500/10 text-blue-700' },
          { label: 'Working', value: counts.working, color: 'bg-orange-500/10 text-orange-700' },
          { label: 'Review', value: counts.review, color: 'bg-purple-500/10 text-purple-700' },
          { label: 'Done', value: counts.done, color: 'bg-green-500/10 text-green-700' },
        ].map((s) => (
          <div
            key={s.label}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${s.color}`}
          >
            <span>{s.label}:</span>
            <span className="font-black text-base">{s.value}</span>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 max-w-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input
            className="pl-9 text-sm"
            placeholder="Filter by assigned to..."
            value={assignedFilter}
            onChange={(e) => setAssignedFilter(e.target.value)}
          />
        </div>
        {assignedFilter && (
          <Button variant="ghost" size="sm" onClick={() => setAssignedFilter('')}>
            Reset
          </Button>
        )}
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="flex items-center justify-center py-24 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-accent" />
          <span className="text-sm text-muted-foreground">Loading tasks...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {COLUMNS.map((col) => {
            const colTasks = getColumn(col.key);
            return (
              <div key={col.key} className="flex flex-col gap-3">
                {/* Column header */}
                <div
                  className={`flex items-center justify-between px-3 py-2 rounded-lg border font-bold text-sm ${col.headerClass}`}
                >
                  <span>{col.label}</span>
                  <span className="rounded-full bg-white/60 dark:bg-black/20 px-2 py-0.5 text-xs font-black">
                    {colTasks.length}
                  </span>
                </div>

                {/* Task cards */}
                <div className="flex flex-col gap-3">
                  {colTasks.length === 0 ? (
                    <div className="text-center text-xs text-muted-foreground py-8 border-2 border-dashed rounded-xl">
                      No tasks
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <Card key={task._id} className="border shadow-sm">
                        <CardContent className="p-3 space-y-2">
                          {/* Overdue indicator */}
                          {isOverdue(task) && (
                            <div className="flex items-center gap-1 text-xs text-red-600 font-semibold">
                              <AlertCircle className="w-3 h-3" />
                              Overdue
                            </div>
                          )}

                          {/* Title */}
                          <p className="font-bold text-sm leading-tight">{task.title}</p>

                          {/* Priority badge */}
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${PRIORITY_BADGE[task.priority] || ''}`}
                          >
                            {task.priority?.toUpperCase()}
                          </Badge>

                          {/* Assigned to */}
                          {task.assignedTo && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <User className="w-3 h-3" />
                              {task.assignedTo}
                            </div>
                          )}

                          {/* Project ref */}
                          {task.projectRef && (
                            <div className="text-xs text-muted-foreground italic truncate">
                              📁 {task.projectRef}
                            </div>
                          )}

                          {/* Due date */}
                          {task.dueDate && (
                            <div
                              className={`flex items-center gap-1 text-xs ${
                                isOverdue(task)
                                  ? 'text-red-600 font-semibold'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              <Calendar className="w-3 h-3" />
                              {new Date(task.dueDate).toLocaleDateString('en-BD', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </div>
                          )}

                          {/* Status dropdown + delete */}
                          <div className="flex items-center gap-2 pt-1">
                            <select
                              className="flex-1 text-xs px-2 py-1 rounded border border-border bg-background"
                              value={task.status}
                              onChange={(e) => handleStatusChange(task._id, e.target.value)}
                            >
                              {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>
                                  {s.charAt(0).toUpperCase() + s.slice(1)}
                                </option>
                              ))}
                            </select>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDelete(task._id, task.title)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Task Dialog */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-accent" /> Add New Task
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Task Title *</Label>
              <Input
                required
                value={formData.title}
                onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Prepare structural drawing for 5th floor"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="Additional details..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Assigned To</Label>
                <Input
                  value={formData.assignedTo}
                  onChange={(e) => setFormData((p) => ({ ...p, assignedTo: e.target.value }))}
                  placeholder="e.g. Draftsman - Rahim"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Project Ref</Label>
                <Input
                  value={formData.projectRef}
                  onChange={(e) => setFormData((p) => ({ ...p, projectRef: e.target.value }))}
                  placeholder="e.g. TH-2026-0012"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData((p) => ({ ...p, dueDate: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <select
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
                  value={formData.priority}
                  onChange={(e) => setFormData((p) => ({ ...p, priority: e.target.value }))}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 font-bold bg-accent hover:bg-accent/90"
              >
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Task
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
