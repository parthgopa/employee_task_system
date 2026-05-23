"use client";

import { useEffect, useState, useCallback } from "react";
import { Users, CheckCircle2, ListTodo, TrendingUp, Clock, Trophy } from "lucide-react";
import { SkeletonStatCard } from "@/components/ui/SkeletonCard";
import SkeletonCard from "@/components/ui/SkeletonCard";
import ProgressBar from "@/components/ui/ProgressBar";
import { adminService } from "@/services/adminService";
import { formatDate } from "@/utils/dateUtils";
import toast from "react-hot-toast";
import Link from "next/link";

interface DashStats {
  totalEmployees: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overallCompletionRate: number;
  todayTasks: number;
  todayCompleted: number;
  todayRate: number;
  topEmployees: TopEmployee[];
}

interface TopEmployee {
  _id: string;
  name: string;
  email: string;
  task_total: number;
  task_done: number;
  rate: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getStats();
      setStats(res.data.data);
    } catch {
      toast.error("Failed to load admin stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return (
    <>
      {/* Navbar */}
      <header className="navbar">
        <div>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
            Admin Dashboard
          </h2>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 2 }}>
            {formatDate(new Date(), "EEEE, MMMM d yyyy")}
          </p>
        </div>
      </header>

      <div className="page-content">
        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: "var(--space-6)" }}>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)
          ) : stats && (
            <>
              <StatCard icon={<Users size={20} color="var(--accent)" />} label="Total Employees" value={stats.totalEmployees} color="var(--accent)" />
              <StatCard icon={<ListTodo size={20} color="var(--purple)" />} label="Total Tasks" value={stats.totalTasks} color="var(--purple)" />
              <StatCard icon={<CheckCircle2 size={20} color="var(--success)" />} label="Completed" value={stats.completedTasks} color="var(--success)" />
              <StatCard icon={<TrendingUp size={20} color="var(--warning)" />} label="Completion Rate" value={`${stats.overallCompletionRate}%`} color="var(--warning)" />
            </>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)", marginBottom: "var(--space-6)" }}>
          {/* Today's Overview */}
          {loading ? <SkeletonCard lines={5} /> : stats && (
            <div className="card">
              <div className="flex items-center gap-2" style={{ marginBottom: "var(--space-5)" }}>
                <Clock size={18} color="var(--accent)" />
                <h4 style={{ margin: 0 }}>Today&apos;s Overview</h4>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-4)", marginBottom: "var(--space-4)" }}>
                <MiniStat label="Tasks" value={stats.todayTasks} color="var(--accent)" />
                <MiniStat label="Done" value={stats.todayCompleted} color="var(--success)" />
                <MiniStat label="Pending" value={stats.todayTasks - stats.todayCompleted} color="var(--warning)" />
              </div>
              <ProgressBar value={stats.todayRate} label="Today's Progress" height={8} />
            </div>
          )}

          {/* Overall Progress */}
          {loading ? <SkeletonCard lines={5} /> : stats && (
            <div className="card">
              <div className="flex items-center gap-2" style={{ marginBottom: "var(--space-5)" }}>
                <TrendingUp size={18} color="var(--purple)" />
                <h4 style={{ margin: 0 }}>Overall Progress</h4>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)", marginBottom: "var(--space-4)" }}>
                <MiniStat label="All-Time Tasks" value={stats.totalTasks} color="var(--accent)" />
                <MiniStat label="Completed" value={stats.completedTasks} color="var(--success)" />
              </div>
              <ProgressBar value={stats.overallCompletionRate} label="All-Time Completion" height={8} />
            </div>
          )}
        </div>

        {/* Top Performers */}
        {loading ? <SkeletonCard lines={6} /> : stats && stats.topEmployees.length > 0 && (
          <div className="card">
            <div className="flex items-center gap-2" style={{ marginBottom: "var(--space-5)" }}>
              <Trophy size={18} color="var(--warning)" />
              <h4 style={{ margin: 0 }}>Top Performers</h4>
            </div>

            <div className="flex flex-col gap-2">
              {stats.topEmployees.map((emp, idx) => (
                <Link
                  key={emp._id}
                  href={`/admin/employees/${emp._id}`}
                  style={{
                    display: "flex", alignItems: "center", gap: "var(--space-4)",
                    padding: "var(--space-3) var(--space-4)",
                    background: "var(--bg-tertiary)", borderRadius: "var(--radius-md)",
                    textDecoration: "none", transition: "var(--transition-fast)",
                    border: "1px solid transparent",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-light)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "transparent"; }}
                >
                  {/* Rank */}
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: idx === 0 ? "var(--warning)" : idx === 1 ? "var(--text-muted)" : idx === 2 ? "var(--warning)" : "var(--bg-elevated)",
                    opacity: idx === 0 ? 1 : idx === 1 ? 0.7 : idx === 2 ? 0.5 : 0.3,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "var(--text-xs)", fontWeight: 700, color: "#fff", flexShrink: 0,
                  }}>
                    {idx + 1}
                  </div>

                  {/* Avatar */}
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: "linear-gradient(135deg, var(--accent), var(--purple))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "var(--text-sm)", fontWeight: 700, color: "#fff", flexShrink: 0,
                  }}>
                    {emp.name?.charAt(0).toUpperCase()}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="truncate" style={{ fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--text-primary)" }}>
                      {emp.name}
                    </div>
                    <div className="truncate" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                      {emp.email}
                    </div>
                  </div>

                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: "var(--text-base)", color: emp.rate >= 80 ? "var(--success)" : emp.rate >= 50 ? "var(--warning)" : "var(--text-primary)" }}>
                      {emp.rate}%
                    </div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                      {emp.task_done}/{emp.task_total} tasks
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
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

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "var(--text-2xl)", fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{label}</div>
    </div>
  );
}
