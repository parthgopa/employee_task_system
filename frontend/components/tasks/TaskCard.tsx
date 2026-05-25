"use client";

import { useState } from "react";
import { Edit2, Trash2, Clock, CheckCircle2, ChevronDown, ChevronUp, Folder, Circle, Play } from "lucide-react";
import clsx from "clsx";
import type { Task } from "@/store/taskStore";
import { formatTime } from "@/utils/dateUtils";

interface TaskCardProps {
  task: Task;
  onStatusChange: (id: string, status: "not_initiated" | "in_progress" | "completed") => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const PRIORITY_COLOR: Record<string, string> = {
  high: "var(--danger)",
  medium: "var(--warning)",
  low: "var(--success)",
};

const STATUS_CONFIG = {
  not_initiated: { label: "Not Started", Icon: Circle, color: "var(--text-muted)", bg: "var(--bg-tertiary)" },
  in_progress: { label: "In Progress", Icon: Play, color: "var(--warning)", bg: "var(--warning-bg)" },
  completed: { label: "Done", Icon: CheckCircle2, color: "var(--success)", bg: "var(--success-bg)" },
};

export default function TaskCard({ task, onStatusChange, onEdit, onDelete }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  // Handle old "pending" status or undefined
  const rawStatus = (task.status as string) || "not_initiated";
  const status = (rawStatus === "pending" ? "not_initiated" : rawStatus) as "not_initiated" | "in_progress" | "completed";
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.not_initiated;
  const StatusIcon = statusConfig.Icon;
  const isDone = status === "completed";

  const handleStatusClick = (newStatus: "not_initiated" | "in_progress" | "completed") => {
    onStatusChange(task._id, newStatus);
    setShowStatusMenu(false);
  };

  return (
    <div className={clsx("task-item", isDone && "completed")} style={{ flexDirection: "column", gap: 0 }}>
      <div className="flex items-center gap-3" style={{ width: "100%" }}>
        {/* Status selector */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            style={{
              width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
              border: `2px solid ${statusConfig.color}`,
              background: statusConfig.bg,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "var(--transition-fast)",
            }}
            title={statusConfig.label}
          >
            <StatusIcon size={14} color={statusConfig.color} fill={isDone ? statusConfig.color : "none"} />
          </button>
          
          {showStatusMenu && (
            <div 
              style={{ 
                position: "absolute", 
                top: "calc(100% + 4px)", 
                left: 0, 
                zIndex: 50, 
                minWidth: 150,
                background: "var(--bg-primary)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow-lg)",
                padding: "4px",
              }}
            >
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => handleStatusClick(key as "not_initiated" | "in_progress" | "completed")}
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 8,
                    width: "100%",
                    padding: "8px 12px",
                    border: "none",
                    borderRadius: "var(--radius-sm)",
                    background: status === key ? config.bg : "transparent",
                    color: "var(--text-primary)",
                    fontSize: "var(--text-sm)",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <config.Icon size={14} color={config.color} />
                  {config.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Priority dot */}
        <div style={{
          width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
          background: PRIORITY_COLOR[task.priority] || "var(--text-muted)",
        }} />

        {/* Title */}
        <span className={clsx("task-title", "flex-1", "truncate")}
          style={{ 
            fontSize: "var(--text-sm)", 
            fontWeight: 500, 
            color: isDone ? "var(--text-muted)" : "var(--text-primary)", 
            textDecoration: isDone ? "line-through" : "none" 
          }}>
          {task.title}
        </span>

        {/* Badges */}
        <span className={`badge badge-${task.priority}`} style={{ flexShrink: 0 }}>
          {task.priority}
        </span>
        <span 
          className="badge" 
          style={{ 
            flexShrink: 0, 
            background: statusConfig.bg, 
            color: statusConfig.color,
            border: `1px solid ${statusConfig.color}`,
          }}
        >
          {statusConfig.label}
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
      {expanded && (task.description || task.projectId) && (
        <div style={{ paddingLeft: 50, paddingTop: 8 }}>
          {task.description && (
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: "0 0 8px 0" }}>
              {task.description}
            </p>
          )}
          {task.projectId && (
            <span className="flex items-center gap-1" style={{ fontSize: "var(--text-xs)", color: "var(--purple)" }}>
              <Folder size={12} />
              Part of a project
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-4" style={{ paddingLeft: 50, paddingTop: 8 }}>
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
