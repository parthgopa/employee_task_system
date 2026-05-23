"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Calendar, Download } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import TaskCard from "@/components/tasks/TaskCard";
import GoalCard from "@/components/tasks/GoalCard";
import ProgressBar from "@/components/ui/ProgressBar";
import SkeletonCard, { SkeletonStatCard } from "@/components/ui/SkeletonCard";
import { historyService } from "@/services/historyService";
import { exportDailyReport } from "@/utils/pdfExport";
import { formatDate, todayStr } from "@/utils/dateUtils";
import type { Task } from "@/store/taskStore";
import toast from "react-hot-toast";

interface DailySummary {
  date: string;
  total: number;
  completed: number;
  pending: number;
  completion_rate: number;
}

interface HistoryDetail {
  date: string;
  tasks: Task[];
  goal: { _id?: string; goal?: string; completed?: boolean; notes?: string } | null;
  stats: { total: number; completed: number; pending: number; completion_rate: number };
}

export default function HistoryPage() {
  const [dates, setDates] = useState<DailySummary[]>([]);
  const [datesLoading, setDatesLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [detail, setDetail] = useState<HistoryDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 20;

  const fetchDates = useCallback(async (p: number) => {
    setDatesLoading(true);
    try {
      const res = await historyService.getHistoryDates(p, LIMIT);
      setDates(res.data.data.dates);
      setTotal(res.data.data.total);
    } catch {
      toast.error("Failed to load history");
    } finally {
      setDatesLoading(false);
    }
  }, []);

  useEffect(() => { fetchDates(page); }, [fetchDates, page]);

  const fetchDetail = useCallback(async (date: string) => {
    setSelectedDate(date);
    setDetailLoading(true);
    setDetail(null);
    try {
      const res = await historyService.getHistoryByDate(date);
      setDetail(res.data.data);
    } catch {
      toast.error("Failed to load day details");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const handleExport = async () => {
    if (!detail) return;
    try {
      await exportDailyReport(detail.date, detail.tasks, detail.goal);
      toast.success("PDF exported!");
    } catch {
      toast.error("Failed to export PDF");
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <>
      <Navbar title="History" />
      <div className="page-content">
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "var(--space-6)", alignItems: "start" }}>

          {/* Date List */}
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: "var(--space-4)" }}>
              <Calendar size={16} color="var(--accent)" />
              <h3 style={{ margin: 0, fontSize: "var(--text-base)" }}>Past Days</h3>
              <span className="badge badge-accent" style={{ marginLeft: "auto" }}>{total}</span>
            </div>

            <div className="flex flex-col gap-2">
              {datesLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 68, borderRadius: "var(--radius-md)" }} />
                ))
              ) : dates.length === 0 ? (
                <div className="empty-state" style={{ padding: "var(--space-8)" }}>
                  <Calendar size={32} color="var(--text-muted)" />
                  <p>No history yet</p>
                </div>
              ) : (
                dates.map((d) => (
                  <button
                    key={d.date}
                    onClick={() => fetchDetail(d.date)}
                    style={{
                      background: selectedDate === d.date ? "var(--accent-light)" : "var(--card-bg)",
                      border: `1px solid ${selectedDate === d.date ? "var(--accent)" : "var(--card-border)"}`,
                      borderRadius: "var(--radius-md)",
                      padding: "var(--space-3) var(--space-4)",
                      cursor: "pointer", textAlign: "left", transition: "var(--transition-fast)",
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span style={{
                        fontSize: "var(--text-sm)", fontWeight: 600,
                        color: selectedDate === d.date ? "var(--accent)" : "var(--text-primary)",
                      }}>
                        {d.date === todayStr() ? "Today" : formatDate(d.date, "MMM d, yyyy")}
                      </span>
                      <span style={{
                        fontSize: "var(--text-xs)", fontWeight: 600,
                        color: d.completion_rate >= 80 ? "var(--success)" : d.completion_rate >= 50 ? "var(--warning)" : "var(--danger)",
                      }}>
                        {d.completion_rate}%
                      </span>
                    </div>
                    <div style={{ marginTop: 6 }}>
                      <ProgressBar value={d.completion_rate} showPercentage={false} height={4} />
                    </div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 4 }}>
                      {d.completed}/{d.total} tasks completed
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center" style={{ marginTop: "var(--space-4)" }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft size={14} /> Prev
                </button>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                  {page} / {totalPages}
                </span>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Day Detail */}
          <div>
            {!selectedDate ? (
              <div className="empty-state card" style={{ padding: "var(--space-16)" }}>
                <Calendar size={48} color="var(--text-muted)" />
                <h3>Select a day</h3>
                <p>Click any date on the left to view its details</p>
              </div>
            ) : detailLoading ? (
              <div className="flex flex-col gap-4">
                <div className="flex gap-4"><SkeletonStatCard /><SkeletonStatCard /><SkeletonStatCard /></div>
                {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : detail ? (
              <>
                {/* Header */}
                <div className="flex justify-between items-center" style={{ marginBottom: "var(--space-5)" }}>
                  <div>
                    <h2 style={{ margin: 0 }}>
                      {detail.date === todayStr() ? "Today" : formatDate(detail.date, "EEEE, MMMM d yyyy")}
                    </h2>
                    <p style={{ margin: 0, fontSize: "var(--text-sm)" }}>
                      {detail.stats.completed} of {detail.stats.total} tasks completed
                    </p>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={handleExport} style={{ gap: 6 }}>
                    <Download size={14} /> Export PDF
                  </button>
                </div>

                {/* Stats */}
                <div className="stats-grid" style={{ marginBottom: "var(--space-5)" }}>
                  <MiniStat label="Total" value={detail.stats.total} color="var(--accent)" />
                  <MiniStat label="Completed" value={detail.stats.completed} color="var(--success)" />
                  <MiniStat label="Pending" value={detail.stats.pending} color="var(--warning)" />
                  <MiniStat label="Rate" value={`${detail.stats.completion_rate}%`} color="var(--purple)" />
                </div>

                {/* Progress */}
                <div className="card" style={{ marginBottom: "var(--space-5)" }}>
                  <ProgressBar value={detail.stats.completion_rate} label="Completion" height={8} />
                </div>

                {/* Goal */}
                <div style={{ marginBottom: "var(--space-5)" }}>
                  <GoalCard goal={detail.goal} date={detail.date} onUpdate={() => {}} readOnly />
                </div>

                {/* Tasks */}
                <h4 style={{ marginBottom: "var(--space-3)" }}>Tasks</h4>
                <div className="flex flex-col gap-2">
                  {detail.tasks.length === 0 ? (
                    <div className="empty-state" style={{ padding: "var(--space-8)" }}>
                      <p>No tasks recorded for this day</p>
                    </div>
                  ) : (
                    detail.tasks.map((task) => (
                      <TaskCard
                        key={task._id}
                        task={task}
                        onToggle={() => {}}
                        onEdit={() => {}}
                        onDelete={() => {}}
                      />
                    ))
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="stat-card" style={{ borderTop: `3px solid ${color}` }}>
      <div className="stat-value" style={{ fontSize: "var(--text-2xl)", color }}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
