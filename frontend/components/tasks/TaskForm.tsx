"use client";

import { useState, useEffect } from "react";
import type { Task } from "@/store/taskStore";
import { todayStr } from "@/utils/dateUtils";

interface TaskFormProps {
  onSubmit: (data: {
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
    taskDate: string;
  }) => Promise<void>;
  initial?: Task | null;
  loading?: boolean;
  defaultDate?: string;
}

export default function TaskForm({ onSubmit, initial, loading, defaultDate }: TaskFormProps) {
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [priority, setPriority] = useState<"low" | "medium" | "high">(initial?.priority || "medium");
  const [taskDate, setTaskDate] = useState(initial?.taskDate || defaultDate || todayStr());
  const [error, setError] = useState("");

  useEffect(() => {
    if (initial) {
      setTitle(initial.title);
      setDescription(initial.description || "");
      setPriority(initial.priority);
      setTaskDate(initial.taskDate);
    }
  }, [initial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!title.trim()) { setError("Title is required"); return; }
    try {
      await onSubmit({ title: title.trim(), description: description.trim(), priority, taskDate });
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

      {error && <p className="form-error" style={{ marginBottom: 12 }}>{error}</p>}

      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading ? "Saving..." : initial ? "Update Task" : "Add Task"}
      </button>
    </form>
  );
}
