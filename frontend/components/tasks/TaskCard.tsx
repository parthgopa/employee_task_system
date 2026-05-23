"use client";

import { useState } from "react";
import { Edit2, Trash2, Clock, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import clsx from "clsx";
import type { Task } from "@/store/taskStore";
import { formatTime } from "@/utils/dateUtils";

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const PRIORITY_COLOR: Record<string, string> = {
  high: "var(--danger)",
  medium: "var(--warning)",
  low: "var(--success)",
};

export default function TaskCard({ task, onToggle, onEdit, onDelete }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isDone = task.status === "completed";

  return (
    <div className={clsx("task-item", isDone && "completed")} style={{ flexDirection: "column", gap: 0 }}>
      <div className="flex items-center gap-3" style={{ width: "100%" }}>
        {/* Checkbox */}
        <button
          onClick={() => onToggle(task._id)}
          style={{
            width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
            border: `2px solid ${isDone ? "var(--success)" : "var(--border-light)"}`,
            background: isDone ? "var(--success)" : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "var(--transition-fast)",
          }}
          aria-label="Toggle task"
        >
          {isDone && <CheckCircle2 size={14} color="#fff" fill="#fff" />}
        </button>

        {/* Priority dot */}
        <div style={{
          width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
          background: PRIORITY_COLOR[task.priority] || "var(--text-muted)",
        }} />

        {/* Title */}
        <span className={clsx("task-title", "flex-1", "truncate")}
          style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: isDone ? "var(--text-muted)" : "var(--text-primary)", textDecoration: isDone ? "line-through" : "none" }}>
          {task.title}
        </span>

        {/* Badges */}
        <span className={`badge badge-${task.priority}`} style={{ flexShrink: 0 }}>
          {task.priority}
        </span>

        {/* Actions */}
        <div className="flex gap-1" style={{ flexShrink: 0 }}>
          {task.description && (
            <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setExpanded(!expanded)} aria-label="Expand">
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => onEdit(task)} aria-label="Edit">
            <Edit2 size={14} />
          </button>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => onDelete(task._id)}
            style={{ color: "var(--danger)" }} aria-label="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Expanded description */}
      {expanded && task.description && (
        <div style={{ paddingLeft: 44, paddingTop: 8 }}>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: 0 }}>
            {task.description}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-4" style={{ paddingLeft: 44, paddingTop: 8 }}>
        <span className="flex items-center gap-1" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
          <Clock size={11} />
          {formatTime(task.createdAt)}
        </span>
        {isDone && task.completedAt && (
          <span style={{ fontSize: "var(--text-xs)", color: "var(--success)" }}>
            ✓ Completed at {formatTime(task.completedAt)}
          </span>
        )}
      </div>
    </div>
  );
}
