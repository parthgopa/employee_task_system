"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Users, LogOut, Shield, Menu, X, Sun, Moon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import clsx from "clsx";

const ADMIN_NAV = [
  { href: "/admin/dashboard",  icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/employees",  icon: Users,           label: "Employees" },
];

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== "admin")) {
      router.push("/admin");
    }
  }, [isAuthenticated, loading, user, router]);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "var(--bg-primary)",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 48, height: 48, border: "3px solid var(--border-color)",
            borderTopColor: "var(--danger)", borderRadius: "50%",
            animation: "spin 0.8s linear infinite", margin: "0 auto 16px",
          }} />
          <p style={{ color: "var(--text-muted)" }}>Loading admin panel...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") return null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/admin";
  };

  return (
    <div className="app-layout">
      {/* Mobile Toggle */}
      <button
        className="btn btn-ghost btn-icon"
        style={{ position: "fixed", top: 14, left: 14, zIndex: 200, display: "none" }}
        id="admin-mobile-btn"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {mobileOpen && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 49 }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx("sidebar", mobileOpen && "open")} style={{ display: "flex", flexDirection: "column" }}>
        {/* Logo */}
        <div style={{ padding: "24px 20px 16px", borderBottom: "1px solid var(--border-color)" }}>
          <div className="flex items-center gap-2">
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, var(--danger), var(--purple))",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Shield size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--text-primary)" }}>
                TaskFlow
              </div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--danger)", fontWeight: 600 }}>
                Admin Panel
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 0" }}>
          {ADMIN_NAV.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={clsx("sidebar-nav-item", pathname.startsWith(href) && "active")}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: 16, borderTop: "1px solid var(--border-color)" }}>
          <div className="flex items-center gap-3" style={{ marginBottom: 12 }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "linear-gradient(135deg, var(--danger), var(--purple))",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "var(--text-sm)", fontWeight: 700, color: "#fff", flexShrink: 0,
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div className="truncate" style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-primary)" }}>
                {user?.name}
              </div>
              <div className="truncate" style={{ fontSize: "var(--text-xs)", color: "var(--danger)" }}>
                Administrator
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-ghost btn-sm btn-icon" onClick={toggleTheme} title="Toggle theme">
              {isDark ? <Sun size={16} color="var(--warning)" /> : <Moon size={16} color="var(--accent)" />}
            </button>
            <button className="btn btn-ghost flex-1" style={{ justifyContent: "flex-start", gap: 8 }} onClick={handleLogout}>
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      <div className="main-content">
        {children}
      </div>

      <style>{`
        @media (max-width: 768px) {
          #admin-mobile-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
