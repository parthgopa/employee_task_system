"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Folder, Plus, Edit2, Trash2, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { projectService } from "@/services/projectService";
import { taskService } from "@/services/taskService";
import type { Project } from "@/store/projectStore";
import type { Task } from "@/store/taskStore";
import TaskCard from "@/components/tasks/TaskCard";
import TaskForm from "@/components/tasks/TaskForm";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import SkeletonCard from "@/components/ui/SkeletonCard";
import ProgressBar from "@/components/ui/ProgressBar";
import { formatDate } from "@/utils/dateUtils";
import toast from "react-hot-toast";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (id) loadProject();
  }, [id]);

  const loadProject = async () => {
    setLoading(true);
    try {
      const [projectRes, tasksRes] = await Promise.all([
        projectService.getProject(id as string),
        taskService.getTasksByProject(id as string),
      ]);
      setProject(projectRes.data.data);
      setTasks(tasksRes.data.data || []);
    } catch {
      toast.error("Failed to load project");
      router.push("/projects");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (data: Parameters<typeof taskService.createTask>[0]) => {
    setFormLoading(true);
    try {
      const res = await taskService.createTask({ ...data, projectId: id as string });
      setTasks([res.data.data, ...tasks]);
      setShowTaskModal(false);
      toast.success("Task added to project!");
    } catch {
      toast.error("Failed to create task");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditTask = async (data: Parameters<typeof taskService.createTask>[0]) => {
    if (!editingTask) return;
    setFormLoading(true);
    try {
      const res = await taskService.updateTask(editingTask._id, { ...data, projectId: id as string });
      setTasks(tasks.map((t) => (t._id === editingTask._id ? res.data.data : t)));
      setEditingTask(null);
      toast.success("Task updated!");
    } catch {
      toast.error("Failed to update task");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!deleteTaskId) return;
    try {
      await taskService.deleteTask(deleteTaskId);
      setTasks(tasks.filter((t) => t._id !== deleteTaskId));
      setDeleteTaskId(null);
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
    }
  };

  const handleStatusChange = async (taskId: string, status: "not_initiated" | "in_progress" | "completed") => {
    try {
      const res = await taskService.updateTaskStatus(taskId, status);
      setTasks(tasks.map((t) => (t._id === taskId ? res.data.data : t)));
    } catch {
      toast.error("Failed to update status");
    }
  };

  const progress = project?.taskStats
    ? Math.round((project.taskStats.completed / project.taskStats.total) * 100) || 0
    : 0;

  if (loading) {
    return (
      <div className="page-content">
        <SkeletonCard lines={5} />
        <div className="flex flex-col gap-2 mt-6">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <>
      <header className="navbar">
        <div className="flex items-center gap-3">
          <Link href="/projects" className="btn btn-ghost btn-icon">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
              {project.name}
            </h2>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 2 }}>
              Project Details
            </p>
          </div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowTaskModal(true)}>
          <Plus size={16} /> Add Task
        </button>
      </header>

      <div className="page-content">
        {/* Project Info Card */}
        <div className="card" style={{ marginBottom: "var(--space-6)" }}>
          <div className="flex items-center gap-3" style={{ marginBottom: "var(--space-4)" }}>
            <div style={{
              width: 50, height: 50, borderRadius: "12px",
              background: "linear-gradient(135deg, var(--purple), var(--accent))",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Folder size={24} color="#fff" />
            </div>
            <div>
              <span className={`badge badge-${project.status}`}>{project.status}</span>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: 4 }}>
                Created {formatDate(project.createdAt)}
              </p>
            </div>
          </div>

          {project.description && (
            <p style={{ fontSize: "var(--text-base)", color: "var(--text-secondary)", marginBottom: "var(--space-4)" }}>
              {project.description}
            </p>
          )}

          {/* Progress */}
          <div style={{ marginBottom: "var(--space-3)" }}>
            <div className="flex items-center justify-between" style={{ marginBottom: "var(--space-2)" }}>
              <span style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>Progress</span>
              <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: progress === 100 ? "var(--success)" : "var(--accent)" }}>
                {progress}%
              </span>
            </div>
            <ProgressBar value={progress} max={100} color={progress === 100 ? "var(--success)" : "var(--accent)"} />
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6" style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
            <span className="flex items-center gap-2">
              <AlertCircle size={16} color="var(--danger)" />
              {project.taskStats?.notInitiated || 0} Not Started
            </span>
            <span className="flex items-center gap-2">
              <Clock size={16} color="var(--warning)" />
              {project.taskStats?.inProgress || 0} In Progress
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} color="var(--success)" />
              {project.taskStats?.completed || 0} Completed
            </span>
            <span style={{ marginLeft: "auto", fontWeight: 600 }}>
              {project.taskStats?.total || 0} Total Tasks
            </span>
          </div>
        </div>

        {/* Tasks List */}
        <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 600, marginBottom: "var(--space-4)", color: "var(--text-primary)" }}>
          Project Tasks
        </h3>

        {tasks.length === 0 ? (
          <div className="empty-state card" style={{ padding: "var(--space-12)" }}>
            <p>No tasks in this project yet.</p>
            <button className="btn btn-primary btn-sm" onClick={() => setShowTaskModal(true)} style={{ marginTop: "var(--space-4)" }}>
              <Plus size={14} /> Add First Task
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onStatusChange={handleStatusChange}
                onEdit={(t) => setEditingTask(t)}
                onDelete={(id) => setDeleteTaskId(id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title="Add Task to Project">
        <TaskForm 
          onSubmit={handleCreateTask} 
          loading={formLoading} 
          defaultProjectId={id as string}
        />
      </Modal>

      {/* Edit Task Modal */}
      <Modal isOpen={!!editingTask} onClose={() => setEditingTask(null)} title="Edit Task">
        <TaskForm 
          onSubmit={handleEditTask} 
          initial={editingTask} 
          loading={formLoading}
          defaultProjectId={id as string}
        />
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTaskId}
        onClose={() => setDeleteTaskId(null)}
        onConfirm={handleDeleteTask}
        message="This task will be permanently deleted."
      />
    </>
  );
}
