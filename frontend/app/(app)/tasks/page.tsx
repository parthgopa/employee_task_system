"use client";

import { useEffect, useState } from "react";
import { Plus, Calendar } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import TaskCard from "@/components/tasks/TaskCard";
import TaskForm from "@/components/tasks/TaskForm";
import TaskFilters from "@/components/tasks/TaskFilters";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import SkeletonCard from "@/components/ui/SkeletonCard";
import { useTasks } from "@/hooks/useTasks";
import type { Task } from "@/store/taskStore";
import type { Project } from "@/store/projectStore";
import { projectService } from "@/services/projectService";
import { todayStr, formatDate } from "@/utils/dateUtils";
import toast from "react-hot-toast";

export default function TasksPage() {
  const [selectedDate, setSelectedDate] = useState(todayStr());

  const {
    tasks, loading, fetchTodayTasks, fetchTasksByDate,
    createTask, editTask, deleteTask, updateTaskStatus, toggleTask,
    completedTasks, notInitiatedTasks, inProgressTasks, pendingTasks, completionRate,
  } = useTasks(selectedDate);
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

  useEffect(() => {
    if (selectedDate === todayStr()) {
      fetchTodayTasks();
    } else {
      fetchTasksByDate(selectedDate);
    }
    loadProjects();
  }, [selectedDate, fetchTodayTasks, fetchTasksByDate]);

  const loadProjects = async () => {
    try {
      const res = await projectService.getProjects();
      setProjects(res.data.data || []);
    } catch {
      // Silently fail - projects are optional
    }
  };

  const handleCreate = async (data: Parameters<typeof createTask>[0]) => {
    setFormLoading(true);
    try {
      await createTask({ ...data, taskDate: selectedDate });
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

  const isToday = selectedDate === todayStr();

  return (
    <>
      <Navbar title="My Tasks" onSearch={setSearch} />
      <div className="page-content">

        {/* Date Selector */}
        <div className="card" style={{ marginBottom: "var(--space-6)", padding: "var(--space-4)" }}>
          <div className="flex items-center gap-4" style={{ flexWrap: "wrap" }}>
            <div className="flex items-center gap-2">
              <Calendar size={16} color="var(--text-muted)" />
              <span style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", fontWeight: 500 }}>
                Viewing:
              </span>
            </div>
            <input
              type="date"
              className="form-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={todayStr()}
              style={{ width: "auto" }}
            />
            {!isToday && (
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedDate(todayStr())}>
                Back to Today
              </button>
            )}
            <span style={{
              fontSize: "var(--text-sm)", color: "var(--text-muted)",
              background: "var(--bg-tertiary)", padding: "4px 10px",
              borderRadius: "var(--radius-full)",
            }}>
              {isToday ? "Today" : formatDate(selectedDate)} — {tasks.length} tasks
            </span>
          </div>
        </div>

        {/* Quick stats */}
        {!loading && tasks.length > 0 && (
          <div className="flex gap-4" style={{ marginBottom: "var(--space-5)", flexWrap: "wrap" }}>
            <span className="badge badge-accent">{tasks.length} Total</span>
            <span className="badge badge-completed">{completedTasks.length} Done</span>
            <span className="badge badge-pending">{notInitiatedTasks.length} Not Started</span>
            <span className="badge badge-warning">{inProgressTasks.length} In Progress</span>
            <span className="badge badge-accent">{completionRate}% Complete</span>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center" style={{ marginBottom: "var(--space-4)" }}>
          <TaskFilters filter={filter} setFilter={setFilter} sort={sort} setSort={setSort} />
          <button className="btn btn-primary btn-sm" onClick={() => setAddOpen(true)} style={{ gap: 6 }}>
            <Plus size={14} /> Add Task
          </button>
        </div>

        {/* Task List */}
        <div className="flex flex-col gap-2">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : filteredTasks.length === 0 ? (
            <div className="empty-state">
              <span style={{ fontSize: "2.5rem" }}>📋</span>
              <h3>No tasks found</h3>
              <p>{search ? "Try a different search term" : filter !== "all" ? `No ${filter} tasks for this date` : "No tasks for this date yet"}</p>
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
                onEdit={(t) => { setEditTarget(t); setEditOpen(true); }}
                onDelete={(id) => setDeleteId(id)}
              />
            ))
          )}
        </div>
      </div>

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add New Task">
        <TaskForm onSubmit={handleCreate} loading={formLoading} defaultDate={selectedDate} projects={projects} />
      </Modal>

      <Modal isOpen={editOpen} onClose={() => { setEditOpen(false); setEditTarget(null); }} title="Edit Task">
        <TaskForm onSubmit={handleEdit} initial={editTarget} loading={formLoading} projects={projects} />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        message="This task will be permanently deleted."
        loading={deleteLoading}
      />
    </>
  );
}
