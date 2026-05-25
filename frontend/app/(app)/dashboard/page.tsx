"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, CheckCircle2, Clock, TrendingUp, ListTodo, Download } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import TaskCard from "@/components/tasks/TaskCard";
import TaskForm from "@/components/tasks/TaskForm";
import TaskFilters from "@/components/tasks/TaskFilters";
import GoalCard from "@/components/tasks/GoalCard";
import ProgressBar from "@/components/ui/ProgressBar";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import SkeletonCard, { SkeletonStatCard } from "@/components/ui/SkeletonCard";
import { useTasks } from "@/hooks/useTasks";
import type { Task } from "@/store/taskStore";
import { goalService } from "@/services/goalService";
import { projectService } from "@/services/projectService";
import { exportDailyReport } from "@/utils/pdfExport";
import { todayStr } from "@/utils/dateUtils";
import type { Project } from "@/store/projectStore";
import toast from "react-hot-toast";
import clsx from "clsx";

interface Goal {
  _id?: string;
  goal?: string;
  completed?: boolean;
  notes?: string;
  date?: string;
}

export default function DashboardPage() {
  const {
    tasks, loading, completedTasks, pendingTasks,
    completionRate, fetchTodayTasks, createTask, editTask, deleteTask, updateTaskStatus, toggleTask,
  } = useTasks(todayStr());

  const [goal, setGoal] = useState<Goal | null>(null);
  const [goalLoading, setGoalLoading] = useState(true);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Task | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);

  const fetchGoal = useCallback(async () => {
    setGoalLoading(true);
    try {
      const res = await goalService.getTodayGoal();
      setGoal(res.data.data);
    } catch {
      /* no goal yet */
    } finally {
      setGoalLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodayTasks();
    fetchGoal();
  }, [fetchTodayTasks, fetchGoal]);

  const handleCreate = async (data: Parameters<typeof createTask>[0]) => {
    setFormLoading(true);
    try {
      await createTask(data);
      setAddOpen(false);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (data: Parameters<typeof createTask>[0]) => {
    if (!editTarget) return;
    setFormLoading(true);
    try {
      await editTask(editTarget._id, data);
      setEditOpen(false);
      setEditTarget(null);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    await deleteTask(deleteId);
    setDeleteId(null);
    setDeleteLoading(false);
  };

  const openEdit = (task: Task) => { setEditTarget(task); setEditOpen(true); };

  const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };

  const filteredTasks = tasks
    .filter((t) => {
      if (filter === "completed") return t.status === "completed";
      if (filter === "not_initiated") return t.status === "not_initiated";
      if (filter === "in_progress") return t.status === "in_progress";
      if (filter === "pending") return t.status !== "completed";
      return true;
    })
    .filter((t) =>
      !search || t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === "priority") return priorityOrder[a.priority] - priorityOrder[b.priority];
      if (sort === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const handleExport = async () => {
    try {
      await exportDailyReport(todayStr(), tasks, goal);
      toast.success("PDF exported!");
    } catch {
      toast.error("Failed to export PDF");
    }
  };

  return (
    <>
      <Navbar title="Dashboard" onSearch={setSearch} />
      <div className="page-content">

        {/* Stats Row */}
        <div className="stats-grid" style={{ marginBottom: "var(--space-6)" }}>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)
          ) : (
            <>
              <StatCard icon={<ListTodo size={20} color="var(--accent)" />} label="Total Tasks" value={tasks.length} color="var(--accent)" />
              <StatCard icon={<CheckCircle2 size={20} color="var(--success)" />} label="Completed" value={completedTasks.length} color="var(--success)" />
              <StatCard icon={<Clock size={20} color="var(--warning)" />} label="Pending" value={pendingTasks.length} color="var(--warning)" />
              <StatCard icon={<TrendingUp size={20} color="var(--purple)" />} label="Completion Rate" value={`${completionRate}%`} color="var(--purple)" />
            </>
          )}
        </div>

        {/* Progress */}
        {!loading && tasks.length > 0 && (
          <div className="card" style={{ marginBottom: "var(--space-6)" }}>
            <div className="flex justify-between items-center" style={{ marginBottom: 12 }}>
              <h4 style={{ margin: 0 }}>Today&apos;s Progress</h4>
              <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
                {completedTasks.length} / {tasks.length} tasks done
              </span>
            </div>
            <ProgressBar value={completionRate} showPercentage={false} height={10} />
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "var(--space-6)", alignItems: "start" }}>
          {/* Tasks Panel */}
          <div>
            <div className="flex justify-between items-center" style={{ marginBottom: "var(--space-4)" }}>
              <h3 style={{ margin: 0 }}>Today&apos;s Tasks</h3>
              <div className="flex gap-2">
                <button className="btn btn-secondary btn-sm" onClick={handleExport} style={{ gap: 6 }}>
                  <Download size={14} /> Export PDF
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => setAddOpen(true)} style={{ gap: 6 }}>
                  <Plus size={14} /> Add Task
                </button>
              </div>
            </div>

            <div style={{ marginBottom: "var(--space-4)" }}>
              <TaskFilters filter={filter} setFilter={setFilter} sort={sort} setSort={setSort} />
            </div>

            <div className="flex flex-col gap-2">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
              ) : filteredTasks.length === 0 ? (
                <div className="empty-state">
                  <ListTodo size={40} color="var(--text-muted)" />
                  <p>{search ? "No tasks match your search" : filter !== "all" ? `No ${filter} tasks` : "No tasks yet. Add your first task!"}</p>
                  {filter === "all" && !search && (
                    <button className="btn btn-primary btn-sm" onClick={() => setAddOpen(true)}>
                      <Plus size={14} /> Add Task
                    </button>
                  )}
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onStatusChange={updateTaskStatus}
                    onEdit={openEdit}
                    onDelete={(id) => setDeleteId(id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Right Sidebar — Goal + Summary */}
          <div className="flex flex-col gap-4">
            {goalLoading ? (
              <SkeletonCard lines={4} />
            ) : (
              <GoalCard goal={goal} onUpdate={setGoal} />
            )}

            {/* Daily Summary */}
            <div className="card">
              <h4 style={{ marginBottom: 16 }}>Daily Summary</h4>
              <SummaryRow label="Total" value={tasks.length} color="var(--text-primary)" />
              <SummaryRow label="Completed" value={completedTasks.length} color="var(--success)" />
              <SummaryRow label="Pending" value={pendingTasks.length} color="var(--warning)" />
              <SummaryRow
                label="High Priority"
                value={tasks.filter((t) => t.priority === "high").length}
                color="var(--danger)"
              />
              <div className="divider" />
              <SummaryRow
                label="Goal"
                value={goal?.goal ? (goal.completed ? "Achieved ✓" : "In Progress") : "Not Set"}
                color={goal?.completed ? "var(--success)" : "var(--text-muted)"}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add New Task">
        <TaskForm onSubmit={handleCreate} loading={formLoading} projects={projects} defaultDate={todayStr()} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editOpen} onClose={() => { setEditOpen(false); setEditTarget(null); }} title="Edit Task">
        <TaskForm onSubmit={handleEdit} initial={editTarget} loading={formLoading} projects={projects} />
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        message="This task will be permanently deleted."
        loading={deleteLoading}
      />

      <style>{`
        @media (max-width: 900px) {
          .dashboard-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: string | number; color: string;
}) {
  return (
    <div className="stat-card" style={{ borderLeft: `3px solid ${color}` }}>
      <div className="flex justify-between items-center">
        <div className="stat-value">{value}</div>
        <div style={{
          width: 40, height: 40, borderRadius: "var(--radius-md)",
          background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {icon}
        </div>
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function SummaryRow({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="flex justify-between items-center" style={{ padding: "6px 0" }}>
      <span style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>{label}</span>
      <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color }}>{value}</span>
    </div>
  );
}
