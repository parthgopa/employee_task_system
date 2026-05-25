"use client";

import { useState, useEffect } from "react";
import type { Task } from "@/store/taskStore";
import type { Project } from "@/store/projectStore";
import { todayStr } from "@/utils/dateUtils";

interface TaskFormProps {
  onSubmit: (data: {
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
    taskDate: string;
    projectId?: string | null;
    status?: "not_initiated" | "in_progress" | "completed";
  }) => Promise<void>;
  initial?: Task | null;
  loading?: boolean;
  defaultDate?: string;
  projects?: Project[];
  defaultProjectId?: string | null;
}

export default function TaskForm({ onSubmit, initial, loading, defaultDate, projects, defaultProjectId }: TaskFormProps) {
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [priority, setPriority] = useState<"low" | "medium" | "high">(initial?.priority || "medium");
  const [taskDate, setTaskDate] = useState(initial?.taskDate || defaultDate || todayStr());
  const [projectId, setProjectId] = useState<string | null>(initial?.projectId ?? defaultProjectId ?? null);
  const [status, setStatus] = useState<"not_initiated" | "in_progress" | "completed">(initial?.status || "not_initiated");
  const [error, setError] = useState("");

  useEffect(() => {
    if (initial) {
      setTitle(initial.title);
      setDescription(initial.description || "");
      setPriority(initial.priority);
      setTaskDate(initial.taskDate);
      setProjectId(initial.projectId ?? defaultProjectId ?? null);
      setStatus(initial.status);
    }
  }, [initial, defaultProjectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!title.trim()) { setError("Title is required"); return; }
    try {
      await onSubmit({ 
        title: title.trim(), 
        description: description.trim(), 
        priority, 
        taskDate, 
        projectId: projectId || undefined,
        status: initial ? status : undefined,
      });
    } catch {
      setError("Failed to save task. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Task Title *</label>
        <input
          className="form-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          autoFocus
          maxLength={200}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea
          className="form-input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional details..."
          rows={3}
          maxLength={1000}
        />
      </div>

      {/* Project Selection */}
      {projects && projects.length > 0 && (
        <div className="form-group">
          <label className="form-label">Project (Optional)</label>
          <select
            className="form-input"
            value={projectId || ""}
            onChange={(e) => setProjectId(e.target.value || null)}
          >
            <option value="">📋 Daily / No Project</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>📁 {p.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex gap-4">
        <div className="form-group flex-1">
          <label className="form-label">Priority</label>
          <select
            className="form-input"
            value={priority}
            onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
          >
            <option value="high">🔴 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>
        </div>

        <div className="form-group flex-1">
          <label className="form-label">Date</label>
          <input
            type="date"
            className="form-input"
            value={taskDate}
            onChange={(e) => setTaskDate(e.target.value)}
          />
        </div>
      </div>

      {/* Status (Edit Mode Only) */}
      {initial && (
        <div className="form-group">
          <label className="form-label">Status</label>
          <select
            className="form-input"
            value={status}
            onChange={(e) => setStatus(e.target.value as "not_initiated" | "in_progress" | "completed")}
          >
            <option value="not_initiated">⚪ Not Started</option>
            <option value="in_progress">🟡 In Progress</option>
            <option value="completed">🟢 Completed</option>
          </select>
        </div>
      )}

      {error && <p className="form-error" style={{ marginBottom: 12 }}>{error}</p>}

      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading ? "Saving..." : initial ? "Update Task" : "Add Task"}
      </button>
    </form>
  );
}
