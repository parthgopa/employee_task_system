"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, User, CheckCircle2, ListTodo, TrendingUp, Clock,
  Calendar, ChevronLeft, ChevronRight,
} from "lucide-react";
import SkeletonCard, { SkeletonStatCard } from "@/components/ui/SkeletonCard";
import ProgressBar from "@/components/ui/ProgressBar";
import { adminService } from "@/services/adminService";
import { formatDate, formatTime, todayStr } from "@/utils/dateUtils";
import type { Task } from "@/store/taskStore";
import toast from "react-hot-toast";

interface EmployeeDetail {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  stats: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    completionRate: number;
    priorityBreakdown: { high: number; medium: number; low: number };
  };
}

interface HistoryDate {
  date: string;
  total: number;
  completed: number;
  pending: number;
  completion_rate: number;
}

const PRIORITY_COLOR: Record<string, string> = { high: "var(--danger)", medium: "var(--warning)", low: "var(--success)" };

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [employee, setEmployee] = useState<EmployeeDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskStats, setTaskStats] = useState<{ total: number; completed: number; pending: number; completionRate: number } | null>(null);
  const [tasksLoading, setTasksLoading] = useState(false);

  const [history, setHistory] = useState<HistoryDate[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [histPage, setHistPage] = useState(1);
  const [histTotal, setHistTotal] = useState(0);

  const [activeTab, setActiveTab] = useState<"tasks" | "history">("tasks");

  const fetchEmployee = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getEmployee(id);
      setEmployee(res.data.data);
    } catch {
      toast.error("Employee not found");
      router.push("/admin/employees");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  const fetchTasks = useCallback(async (date: string) => {
    setTasksLoading(true);
    try {
      const res = await adminService.getEmployeeTasks(id, date);
      setTasks(res.data.data.tasks);
      setTaskStats(res.data.data.stats);
    } catch {
      toast.error("Failed to load tasks");
    } finally {
      setTasksLoading(false);
    }
  }, [id]);

  const fetchHistory = useCallback(async (p: number) => {
    setHistoryLoading(true);
    try {
      const res = await adminService.getEmployeeHistory(id, p);
      setHistory(res.data.data.dates);
      setHistTotal(res.data.data.total);
    } catch {
      toast.error("Failed to load history");
    } finally {
      setHistoryLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchEmployee(); }, [fetchEmployee]);
  useEffect(() => { fetchTasks(selectedDate); }, [fetchTasks, selectedDate]);
  useEffect(() => { fetchHistory(histPage); }, [fetchHistory, histPage]);

  if (loading) {
    return (
      <>
        <header className="navbar"><div /></header>
        <div className="page-content">
          <div className="stats-grid" style={{ marginBottom: "var(--space-6)" }}>
            {Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)}
          </div>
          <SkeletonCard lines={8} />
        </div>
      </>
    );
  }

  if (!employee) return null;

  const { stats } = employee;

  return (
    <>
      <header className="navbar">
        <div className="flex items-center gap-3">
          <button className="btn btn-ghost btn-icon" onClick={() => router.push("/admin/employees")}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
              {employee.name}
            </h2>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 2 }}>
              {employee.email}
            </p>
          </div>
        </div>
      </header>

      <div className="page-content">
        {/* Profile Card */}
        <div className="card" style={{ marginBottom: "var(--space-6)" }}>
          <div className="flex items-center gap-4" style={{ flexWrap: "wrap" }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "linear-gradient(135deg, var(--accent), var(--purple))",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "var(--text-2xl)", fontWeight: 700, color: "#fff", flexShrink: 0,
            }}>
              {employee.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0 }}>{employee.name}</h3>
              <p style={{ margin: 0, fontSize: "var(--text-sm)" }}>{employee.email}</p>
              <div className="flex gap-2 mt-2">
                <span className="badge badge-accent">{employee.role}</span>
                <span className="badge" style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)" }}>
                  Joined {formatDate(employee.createdAt)}
                </span>
              </div>
            </div>
            <div style={{ textAlign: "center", padding: "var(--space-3) var(--space-6)", background: "var(--bg-tertiary)", borderRadius: "var(--radius-lg)" }}>
              <div style={{
                fontSize: "var(--text-3xl)", fontWeight: 800,
                color: stats.completionRate >= 80 ? "var(--success)" : stats.completionRate >= 50 ? "var(--warning)" : "var(--danger)",
              }}>
                {stats.completionRate}%
              </div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Overall Rate</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: "var(--space-6)" }}>
          <StatCard icon={<ListTodo size={20} color="var(--accent)" />} label="Total Tasks" value={stats.totalTasks} color="var(--accent)" />
          <StatCard icon={<CheckCircle2 size={20} color="var(--success)" />} label="Completed" value={stats.completedTasks} color="var(--success)" />
          <StatCard icon={<Clock size={20} color="var(--warning)" />} label="Pending" value={stats.pendingTasks} color="var(--warning)" />
          <StatCard icon={<TrendingUp size={20} color="var(--purple)" />} label="Rate" value={`${stats.completionRate}%`} color="var(--purple)" />
        </div>

        {/* Priority Breakdown */}
        <div className="card" style={{ marginBottom: "var(--space-6)" }}>
          <h4 style={{ marginBottom: "var(--space-4)" }}>Priority Breakdown</h4>
          <div className="flex gap-6">
            {(["high", "medium", "low"] as const).map((p) => {
              const count = stats.priorityBreakdown[p];
              const pct = stats.totalTasks > 0 ? Math.round((count / stats.totalTasks) * 100) : 0;
              return (
                <div key={p} style={{ flex: 1 }}>
                  <div className="flex justify-between" style={{ marginBottom: 4 }}>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", textTransform: "capitalize" }}>{p}</span>
                    <span style={{ fontSize: "var(--text-xs)", color: PRIORITY_COLOR[p], fontWeight: 600 }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: 6, background: "var(--bg-tertiary)", borderRadius: "var(--radius-full)" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: PRIORITY_COLOR[p], borderRadius: "var(--radius-full)", transition: "width 0.6s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2" style={{ marginBottom: "var(--space-5)", borderBottom: "1px solid var(--border-color)", paddingBottom: "var(--space-3)" }}>
          <button className={`btn btn-sm ${activeTab === "tasks" ? "btn-primary" : "btn-ghost"}`} onClick={() => setActiveTab("tasks")} style={{ gap: 6 }}>
            <ListTodo size={14} /> Tasks by Date
          </button>
          <button className={`btn btn-sm ${activeTab === "history" ? "btn-primary" : "btn-ghost"}`} onClick={() => setActiveTab("history")} style={{ gap: 6 }}>
            <Calendar size={14} /> History
          </button>
        </div>

        {/* Tasks by Date */}
        {activeTab === "tasks" && (
          <>
            <div className="flex items-center gap-3" style={{ marginBottom: "var(--space-4)", flexWrap: "wrap" }}>
              <Calendar size={16} color="var(--text-muted)" />
              <input
                type="date"
                className="form-input"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={todayStr()}
                style={{ width: "auto" }}
              />
              {selectedDate !== todayStr() && (
                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedDate(todayStr())}>
                  Back to Today
                </button>
              )}
              {taskStats && (
                <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", background: "var(--bg-tertiary)", padding: "4px 10px", borderRadius: "var(--radius-full)" }}>
                  {taskStats.completed}/{taskStats.total} done — {taskStats.completionRate}%
                </span>
              )}
            </div>

            {tasksLoading ? (
              <div className="flex flex-col gap-2">{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}</div>
            ) : tasks.length === 0 ? (
              <div className="empty-state card" style={{ padding: "var(--space-10)" }}>
                <ListTodo size={36} color="var(--text-muted)" />
                <p>No tasks for {selectedDate === todayStr() ? "today" : formatDate(selectedDate)}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {tasks.map((task) => (
                  <div key={task._id} className={`task-item ${task.status === "completed" ? "completed" : ""}`}>
                    <div style={{
                      width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                      border: `2px solid ${task.status === "completed" ? "var(--success)" : "var(--border-light)"}`,
                      background: task.status === "completed" ? "var(--success)" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {task.status === "completed" && <CheckCircle2 size={14} color="#fff" fill="#fff" />}
                    </div>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: PRIORITY_COLOR[task.priority] || "var(--text-muted)" }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="flex items-center gap-2">
                        <span style={{
                          fontSize: "var(--text-sm)", fontWeight: 500,
                          color: task.status === "completed" ? "var(--text-muted)" : "var(--text-primary)",
                          textDecoration: task.status === "completed" ? "line-through" : "none",
                        }}>
                          {task.title}
                        </span>
                        <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                      </div>
                      {task.description && (
                        <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", margin: "4px 0 0" }}>{task.description}</p>
                      )}
                      <div className="flex items-center gap-3" style={{ marginTop: 4 }}>
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                          <Clock size={10} style={{ display: "inline", marginRight: 4 }} />
                          Created {formatTime(task.createdAt)}
                        </span>
                        {task.status === "completed" && task.completedAt && (
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--success)" }}>
                            ✓ Done at {formatTime(task.completedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* History */}
        {activeTab === "history" && (
          <>
            {historyLoading ? (
              <div className="flex flex-col gap-2">{Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}</div>
            ) : history.length === 0 ? (
              <div className="empty-state card" style={{ padding: "var(--space-10)" }}>
                <Calendar size={36} color="var(--text-muted)" />
                <p>No task history yet</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {history.map((d) => (
                  <button
                    key={d.date}
                    onClick={() => { setSelectedDate(d.date); setActiveTab("tasks"); }}
                    style={{
                      display: "flex", alignItems: "center", gap: "var(--space-4)",
                      padding: "var(--space-4)", background: "var(--card-bg)",
                      border: "1px solid var(--card-border)", borderRadius: "var(--radius-md)",
                      cursor: "pointer", textAlign: "left", width: "100%",
                      transition: "var(--transition-fast)",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--text-primary)" }}>
                        {d.date === todayStr() ? "Today" : formatDate(d.date, "EEEE, MMM d yyyy")}
                      </div>
                      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 2 }}>
                        {d.completed}/{d.total} tasks completed
                      </div>
                    </div>
                    <div style={{ width: 160 }}>
                      <ProgressBar value={d.completion_rate} showPercentage={false} height={6} />
                    </div>
                    <div style={{
                      fontSize: "var(--text-base)", fontWeight: 700, minWidth: 48, textAlign: "right",
                      color: d.completion_rate >= 80 ? "var(--success)" : d.completion_rate >= 50 ? "var(--warning)" : "var(--danger)",
                    }}>
                      {d.completion_rate}%
                    </div>
                  </button>
                ))}
              </div>
            )}

            {histTotal > 30 && (
              <div className="flex justify-between items-center" style={{ marginTop: "var(--space-4)" }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setHistPage((p) => Math.max(1, p - 1))} disabled={histPage === 1}>
                  <ChevronLeft size={14} /> Prev
                </button>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Page {histPage}</span>
                <button className="btn btn-ghost btn-sm" onClick={() => setHistPage((p) => p + 1)} disabled={history.length < 30}>
                  Next <ChevronRight size={14} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="stat-card" style={{ borderLeft: `3px solid ${color}` }}>
      <div className="flex justify-between items-center">
        <div className="stat-value">{value}</div>
        <div style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {icon}
        </div>
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
