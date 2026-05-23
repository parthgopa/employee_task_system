"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, CheckCheck, Clock, Plus, Target, CheckCircle2, Trash2 } from "lucide-react";
import { useNotificationStore } from "@/store/notificationStore";
import { formatDistanceToNow } from "date-fns";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  task_created:   <Plus size={16} color="var(--accent)" />,
  task_completed: <CheckCircle2 size={16} color="var(--success)" />,
  goal_set:       <Target size={16} color="var(--purple)" />,
  info:           <Bell size={16} color="var(--text-muted)" />,
};

const TYPE_BADGES: Record<string, { label: string; cls: string }> = {
  task_created:   { label: "NEW TASK",   cls: "badge-accent" },
  task_completed: { label: "COMPLETED",  cls: "badge-completed" },
  goal_set:       { label: "GOAL",       cls: "badge-purple" },
  info:           { label: "INFO",       cls: "badge-accent" },
};

export default function NotificationPanel() {
  const { notifications, markRead, markAllRead, clearAll, unreadCount } =
    useNotificationStore();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const ref = useRef<HTMLDivElement>(null);

  const count = unreadCount();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const filtered =
    filter === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Bell Button */}
      <button
        className="btn btn-ghost btn-icon"
        style={{ position: "relative" }}
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
      >
        <Bell size={18} />
        {count > 0 && (
          <span style={{
            position: "absolute", top: 4, right: 4,
            minWidth: 16, height: 16, borderRadius: "50%",
            background: "var(--danger)", color: "#fff",
            fontSize: 10, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 4px",
          }}>
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="notif-panel">
          {/* Header */}
          <div className="notif-header">
            <div>
              <h4 style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Bell size={14} /> Notifications
              </h4>
              <span style={{ fontSize: "var(--text-xs)", opacity: 0.8 }}>
                {count} unread
              </span>
            </div>
            <div className="flex gap-2">
              {count > 0 && (
                <button
                  onClick={() => markAllRead()}
                  style={{
                    background: "rgba(255,255,255,0.2)", border: "none",
                    borderRadius: "var(--radius-sm)", padding: "4px 10px",
                    color: "#fff", fontSize: "var(--text-xs)", fontWeight: 600,
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                  }}
                >
                  <CheckCheck size={12} /> Mark All Read
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="notif-tabs">
            <button
              className={`notif-tab ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All ({notifications.length})
            </button>
            <button
              className={`notif-tab ${filter === "unread" ? "active" : ""}`}
              onClick={() => setFilter("unread")}
            >
              Unread ({count})
            </button>
          </div>

          {/* List */}
          <div className="notif-list">
            {filtered.length === 0 ? (
              <div className="notif-empty">
                <Bell size={24} style={{ marginBottom: 8, opacity: 0.4 }} />
                <p style={{ margin: 0 }}>
                  {filter === "unread" ? "All caught up!" : "No notifications yet"}
                </p>
              </div>
            ) : (
              filtered.map((n) => (
                <div
                  key={n.id}
                  className={`notif-item ${!n.read ? "unread" : ""}`}
                  onClick={() => { if (!n.read) markRead(n.id); }}
                  style={{ cursor: n.read ? "default" : "pointer" }}
                >
                  <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: "var(--bg-tertiary)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      {TYPE_ICONS[n.type]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="flex items-center gap-2">
                        <span style={{ fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--text-primary)" }}>
                          {n.title}
                        </span>
                        <span className={`badge ${TYPE_BADGES[n.type]?.cls || "badge-accent"}`}>
                          {TYPE_BADGES[n.type]?.label || "INFO"}
                        </span>
                      </div>
                    </div>
                    {!n.read && <span className="notif-dot" />}
                  </div>
                  <p style={{
                    fontSize: "var(--text-xs)", color: "var(--text-secondary)",
                    margin: "0 0 6px 40px", lineHeight: 1.4,
                  }}>
                    {n.message}
                  </p>
                  <div className="flex items-center justify-between" style={{ marginLeft: 40 }}>
                    <span className="flex items-center gap-1" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                      <Clock size={10} />
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </span>
                    {!n.read && (
                      <button
                        onClick={(e) => { e.stopPropagation(); markRead(n.id); }}
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          color: "var(--success)", fontSize: "var(--text-xs)",
                          fontWeight: 600, display: "flex", alignItems: "center", gap: 4,
                        }}
                      >
                        <CheckCheck size={12} /> Mark Read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div style={{
              padding: "var(--space-3) var(--space-4)",
              borderTop: "1px solid var(--border-color)",
              textAlign: "center",
            }}>
              <button
                onClick={() => { clearAll(); setOpen(false); }}
                className="btn btn-ghost btn-sm w-full"
                style={{ fontSize: "var(--text-xs)", gap: 4, color: "var(--text-muted)" }}
              >
                <Trash2 size={12} /> Clear All
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
