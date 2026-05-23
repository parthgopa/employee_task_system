"use client";

import { useEffect, useState, useCallback } from "react";
import { Users, Search, ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import { SkeletonStatCard } from "@/components/ui/SkeletonCard";
import ProgressBar from "@/components/ui/ProgressBar";
import { adminService } from "@/services/adminService";
import { formatDate } from "@/utils/dateUtils";
import toast from "react-hot-toast";
import Link from "next/link";

interface Employee {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  stats: {
    totalTasks: number;
    completedTasks: number;
    todayTasks: number;
    completionRate: number;
  };
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  const fetchEmployees = useCallback(async (p: number, q: string) => {
    setLoading(true);
    try {
      const res = await adminService.getEmployees(p, q);
      setEmployees(res.data.data.employees);
      setTotal(res.data.data.total);
      setPages(res.data.data.pages);
    } catch {
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEmployees(page, search); }, [fetchEmployees, page, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  return (
    <>
      <header className="navbar">
        <div>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
            Employees
          </h2>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 2 }}>
            {total} employee{total !== 1 ? "s" : ""} registered
          </p>
        </div>
      </header>

      <div className="page-content">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-3" style={{ marginBottom: "var(--space-6)" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: 400 }}>
            <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              className="form-input"
              placeholder="Search by name or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ paddingLeft: 36 }}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
          {search && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }}>
              Clear
            </button>
          )}
        </form>

        {/* Employee Grid */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "var(--space-4)" }}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonStatCard key={i} />)}
          </div>
        ) : employees.length === 0 ? (
          <div className="empty-state card" style={{ padding: "var(--space-16)" }}>
            <Users size={48} color="var(--text-muted)" />
            <h3>{search ? "No employees match your search" : "No employees yet"}</h3>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "var(--space-4)" }}>
            {employees.map((emp) => (
              <Link
                key={emp._id}
                href={`/admin/employees/${emp._id}`}
                style={{ textDecoration: "none" }}
              >
                <div className="card" style={{ cursor: "pointer", height: "100%" }}>
                  <div className="flex items-center gap-3" style={{ marginBottom: "var(--space-4)" }}>
                    {/* Avatar */}
                    <div style={{
                      width: 44, height: 44, borderRadius: "50%",
                      background: "linear-gradient(135deg, var(--accent), var(--purple))",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "var(--text-base)", fontWeight: 700, color: "#fff", flexShrink: 0,
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
                    <div style={{
                      fontSize: "var(--text-lg)", fontWeight: 800,
                      color: emp.stats.completionRate >= 80 ? "var(--success)" : emp.stats.completionRate >= 50 ? "var(--warning)" : "var(--text-muted)",
                    }}>
                      {emp.stats.completionRate}%
                    </div>
                  </div>

                  <ProgressBar value={emp.stats.completionRate} showPercentage={false} height={6} />

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-2)", marginTop: "var(--space-4)" }}>
                    <SmallStat label="Total" value={emp.stats.totalTasks} color="var(--accent)" />
                    <SmallStat label="Done" value={emp.stats.completedTasks} color="var(--success)" />
                    <SmallStat label="Today" value={emp.stats.todayTasks} color="var(--purple)" />
                  </div>

                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "var(--space-3)" }}>
                    Joined {formatDate(emp.createdAt)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex justify-between items-center" style={{ marginTop: "var(--space-6)" }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft size={14} /> Previous
            </button>
            <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
              Page {page} of {pages}
            </span>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}>
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function SmallStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ textAlign: "center", padding: "var(--space-2)", background: "var(--bg-tertiary)", borderRadius: "var(--radius-sm)" }}>
      <div style={{ fontSize: "var(--text-base)", fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
    </div>
  );
}
