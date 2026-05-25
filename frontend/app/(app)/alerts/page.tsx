"use client";

import { useEffect, useState } from "react";
import { Bell, AlertTriangle, CheckCircle2, Clock, Calendar, ArrowRight, X } from "lucide-react";
import { useAlertStore, OverdueTask } from "@/store/alertStore";
import { taskService } from "@/services/taskService";
import { formatDate, todayStr } from "@/utils/dateUtils";
import SkeletonCard from "@/components/ui/SkeletonCard";
import toast from "react-hot-toast";
import Link from "next/link";

export default function AlertsPage() {
  const { overdueTasks, summary, loading, fetchAlerts, dismissAlert } = useAlertStore();
  const [dismissing, setDismissing] = useState<string | null>(null);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleComplete = async (taskId: string) => {
    try {
      await taskService.toggleTask(taskId);
      toast.success("Task completed!");
      fetchAlerts(); // Refresh alerts
    } catch {
      toast.error("Failed to complete task");
    }
  };

  const handleDismiss = async (taskId: string) => {
    setDismissing(taskId);
    try {
      await dismissAlert(taskId);
      toast.success("Alert dismissed");
    } catch {
      toast.error("Failed to dismiss");
    } finally {
      setDismissing(null);
    }
  };

  // Group tasks by date
  const groupedTasks = overdueTasks.reduce((acc, task) => {
    const date = task.taskDate;
    if (!acc[date]) acc[date] = [];
    acc[date].push(task);
    return acc;
  }, {} as Record<string, OverdueTask[]>);

  const sortedDates = Object.keys(groupedTasks).sort().reverse();
  const today = todayStr();

  return (
    <>
      <header className="navbar">
        <div>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
            Alerts
          </h2>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 2 }}>
            {summary?.count || 0} overdue task{summary?.count !== 1 ? "s" : ""} need{summary?.count === 1 ? "s" : ""} attention
          </p>
        </div>
      </header>

      <div className="page-content">
        {/* Summary Card */}
        {loading ? (
          <SkeletonCard lines={3} />
        ) : (
          <div className="card" style={{ marginBottom: "var(--space-6)" }}>
            <div className="flex items-center gap-3" style={{ marginBottom: "var(--space-4)" }}>
              <div style={{
                width: 44, height: 44, borderRadius: "50%",
                background: summary?.hasHighPriority ? "var(--danger)" : "var(--warning)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Bell size={22} color="#fff" />
              </div>
              <div>
                <h3 style={{ margin: 0 }}>Overdue Tasks</h3>
                <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
                  Pending tasks from previous days
                </p>
              </div>
            </div>

            {summary?.count ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--space-4)" }}>
                <StatBox label="Total Overdue" value={summary.count} color="var(--danger)" />
                <StatBox label="High Priority" value={overdueTasks.filter(t => t.priority === "high").length} color="var(--danger)" />
                <StatBox label="Oldest" value={sortedDates.length ? formatDate(sortedDates[sortedDates.length - 1]) : "-"} color="var(--warning)" isDate />
              </div>
            ) : (
              <div className="flex items-center gap-2" style={{ padding: "var(--space-4)", background: "var(--success)", borderRadius: "var(--radius-md)", opacity: 0.1 }}>
                <CheckCircle2 size={20} color="var(--success)" />
                <span style={{ color: "var(--success)" }}>All caught up! No overdue tasks.</span>
              </div>
            )}
          </div>
        )}

        {/* Overdue Tasks by Date */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : sortedDates.length === 0 ? (
          <div className="empty-state card" style={{ padding: "var(--space-16)" }}>
            <CheckCircle2 size={48} color="var(--success)" />
            <h3>You're all caught up!</h3>
            <p>No overdue tasks. Great job staying on top of your work.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {sortedDates.map((date) => {
              const tasks = groupedTasks[date];
              const daysOverdue = Math.floor((new Date(today).getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
              
              return (
                <div key={date} className="card">
                  <div className="flex items-center gap-3" style={{ marginBottom: "var(--space-4)", paddingBottom: "var(--space-3)", borderBottom: "1px solid var(--border-color)" }}>
                    <Calendar size={18} color="var(--text-muted)" />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                        {date === today ? "Today" : formatDate(date, "EEEE, MMM d yyyy")}
                      </span>
                    </div>
                    <span className={`badge badge-${daysOverdue > 7 ? "danger" : daysOverdue > 3 ? "warning" : "accent"}`}>
                      {daysOverdue === 0 ? "Today" : daysOverdue === 1 ? "1 day overdue" : `${daysOverdue} days overdue`}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    {tasks.map((task) => (
                      <div
                        key={task._id}
                        style={{
                          display: "flex", alignItems: "center", gap: "var(--space-3)",
                          padding: "var(--space-3)",
                          background: "var(--bg-tertiary)",
                          borderRadius: "var(--radius-md)",
                          borderLeft: `3px solid ${task.priority === "high" ? "var(--danger)" : task.priority === "medium" ? "var(--warning)" : "var(--success)"}`,
                        }}
                      >
                        <button
                          onClick={() => handleComplete(task._id)}
                          style={{
                            width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                            border: "2px solid var(--border-light)",
                            background: "transparent",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer",
                          }}
                          title="Mark as complete"
                        >
                          <CheckCircle2 size={14} color="var(--success)" />
                        </button>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 500, fontSize: "var(--text-sm)", color: "var(--text-primary)" }}>
                            {task.title}
                          </div>
                          {task.description && (
                            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 2 }}>
                              {task.description}
                            </div>
                          )}
                          <div className="flex items-center gap-2" style={{ marginTop: 4 }}>
                            <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                              <Clock size={10} />
                              Created {formatDate(task.createdAt)}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDismiss(task._id)}
                          disabled={dismissing === task._id}
                          className="btn btn-ghost btn-icon btn-sm"
                          title="Dismiss alert"
                        >
                          <X size={16} color="var(--text-muted)" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: "var(--space-4)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                      {tasks.length} task{tasks.length !== 1 ? "s" : ""} pending
                    </span>
                    <Link href={`/tasks?date=${date}`} style={{ fontSize: "var(--text-sm)", color: "var(--accent)", display: "flex", alignItems: "center", gap: 4 }}>
                      View in Tasks <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

function StatBox({ label, value, color, isDate }: { label: string; value: string | number; color: string; isDate?: boolean }) {
  return (
    <div style={{ textAlign: "center", padding: "var(--space-3)", background: "var(--bg-tertiary)", borderRadius: "var(--radius-md)" }}>
      <div style={{ fontSize: isDate ? "var(--text-sm)" : "var(--text-2xl)", fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
    </div>
  );
}
