"use client";

import { useEffect, useState, useCallback } from "react";
import { TrendingUp, BarChart2, Flame, CheckCircle2, ListTodo, Target } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import AnalyticsChart from "@/components/analytics/AnalyticsChart";
import ProgressBar from "@/components/ui/ProgressBar";
import SkeletonCard, { SkeletonStatCard } from "@/components/ui/SkeletonCard";
import { analyticsService } from "@/services/analyticsService";
import toast from "react-hot-toast";

interface ChartPoint {
  date: string;
  total: number;
  completed: number;
  pending: number;
  completion_rate: number;
}

interface Summary {
  total_tasks: number;
  completed: number;
  pending: number;
  avg_completion_rate: number;
}

interface Stats {
  total_tasks: number;
  completed: number;
  pending: number;
  completion_rate: number;
  streak: number;
  priority_breakdown: { high: number; medium: number; low: number };
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<"bar" | "line">("bar");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [chartRes, statsRes] = await Promise.all([
        period === "weekly" ? analyticsService.getWeekly() : analyticsService.getMonthly(),
        analyticsService.getStats(),
      ]);
      setChartData(chartRes.data.data.chart);
      setSummary(chartRes.data.data.summary);
      setStats(statsRes.data.data);
    } catch {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <>
      <Navbar title="Analytics" />
      <div className="page-content">

        {/* Period Toggle */}
        <div className="flex items-center gap-3" style={{ marginBottom: "var(--space-6)", flexWrap: "wrap" }}>
          <div className="flex gap-2">
            {(["weekly", "monthly"] as const).map((p) => (
              <button
                key={p}
                className={`btn btn-sm ${period === p ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setPeriod(p)}
              >
                {p === "weekly" ? "Last 7 Days" : "Last 30 Days"}
              </button>
            ))}
          </div>
          <div className="flex gap-2" style={{ marginLeft: "auto" }}>
            <button
              className={`btn btn-sm ${chartType === "bar" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setChartType("bar")}
            >
              <BarChart2 size={14} />
            </button>
            <button
              className={`btn btn-sm ${chartType === "line" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setChartType("line")}
            >
              <TrendingUp size={14} />
            </button>
          </div>
        </div>

        {/* Period Summary */}
        {loading ? (
          <div className="stats-grid" style={{ marginBottom: "var(--space-6)" }}>
            {Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)}
          </div>
        ) : summary && (
          <div className="stats-grid" style={{ marginBottom: "var(--space-6)" }}>
            <StatCard icon={<ListTodo size={20} color="var(--accent)" />} label={`Tasks (${period})`} value={summary.total_tasks} color="var(--accent)" />
            <StatCard icon={<CheckCircle2 size={20} color="var(--success)" />} label="Completed" value={summary.completed} color="var(--success)" />
            <StatCard icon={<Target size={20} color="var(--warning)" />} label="Pending" value={summary.pending} color="var(--warning)" />
            <StatCard icon={<TrendingUp size={20} color="var(--purple)" />} label="Avg Completion" value={`${summary.avg_completion_rate}%`} color="var(--purple)" />
          </div>
        )}

        {/* Chart */}
        {loading ? (
          <SkeletonCard lines={6} height={300} />
        ) : (
          <div style={{ marginBottom: "var(--space-6)" }}>
            <AnalyticsChart
              data={chartData}
              type={chartType}
              title={`${period === "weekly" ? "7-Day" : "30-Day"} Task Overview`}
            />
          </div>
        )}

        {/* All-Time Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)" }}>
          {loading ? (
            <><SkeletonCard lines={4} /><SkeletonCard lines={4} /></>
          ) : stats && (
            <>
              <div className="card">
                <h4 style={{ marginBottom: "var(--space-5)" }}>All-Time Stats</h4>
                <AllTimeStat icon={<ListTodo size={18} color="var(--accent)" />} label="Total Tasks" value={stats.total_tasks} />
                <AllTimeStat icon={<CheckCircle2 size={18} color="var(--success)" />} label="Completed" value={stats.completed} />
                <AllTimeStat icon={<Target size={18} color="var(--warning)" />} label="Pending" value={stats.pending} />
                <div style={{ marginTop: "var(--space-4)" }}>
                  <ProgressBar
                    value={stats.completion_rate}
                    label="Overall Completion Rate"
                    height={8}
                  />
                </div>
              </div>

              <div className="card">
                <h4 style={{ marginBottom: "var(--space-5)" }}>Performance</h4>

                {/* Streak */}
                <div style={{
                  background: "linear-gradient(135deg, rgba(245,158,11,0.1), var(--card-bg))",
                  border: "1px solid rgba(245,158,11,0.2)",
                  borderRadius: "var(--radius-md)", padding: "var(--space-4)",
                  marginBottom: "var(--space-4)", display: "flex", alignItems: "center", gap: 12,
                }}>
                  <Flame size={28} color="var(--warning)" />
                  <div>
                    <div style={{ fontSize: "var(--text-2xl)", fontWeight: 800, color: "var(--warning)" }}>
                      {stats.streak}
                    </div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                      Day Streak
                    </div>
                  </div>
                </div>

                {/* Priority Breakdown */}
                <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: "var(--space-3)", color: "var(--text-secondary)" }}>
                  Priority Breakdown
                </p>
                <PriorityBar label="High" value={stats.priority_breakdown.high} total={stats.total_tasks} color="var(--danger)" />
                <PriorityBar label="Medium" value={stats.priority_breakdown.medium} total={stats.total_tasks} color="var(--warning)" />
                <PriorityBar label="Low" value={stats.priority_breakdown.low} total={stats.total_tasks} color="var(--success)" />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: string | number; color: string;
}) {
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

function AllTimeStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center justify-between" style={{ padding: "8px 0", borderBottom: "1px solid var(--border-color)" }}>
      <div className="flex items-center gap-2">
        {icon}
        <span style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>{label}</span>
      </div>
      <span style={{ fontSize: "var(--text-base)", fontWeight: 700, color: "var(--text-primary)" }}>{value}</span>
    </div>
  );
}

function PriorityBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div className="flex justify-between" style={{ marginBottom: 4 }}>
        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>{label}</span>
        <span style={{ fontSize: "var(--text-xs)", color, fontWeight: 600 }}>{value} ({pct}%)</span>
      </div>
      <div style={{ height: 6, background: "var(--bg-tertiary)", borderRadius: "var(--radius-full)" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "var(--radius-full)", transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}
