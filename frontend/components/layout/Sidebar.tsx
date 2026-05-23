"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, CheckSquare, History, BarChart2,
  Settings, LogOut, Menu, X, Target,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import clsx from "clsx";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/tasks",     icon: CheckSquare,     label: "My Tasks" },
  { href: "/history",   icon: History,         label: "History" },
  { href: "/analytics", icon: BarChart2,       label: "Analytics" },
  { href: "/settings",  icon: Settings,        label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div style={{ padding: "24px 20px 16px", borderBottom: "1px solid var(--border-color)" }}>
        <div className="flex items-center gap-2">
          <div style={{
            width: 36, height: 36, borderRadius: "10px",
            background: "linear-gradient(135deg, var(--accent), var(--purple))",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Target size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--text-primary)" }}>
              TaskFlow
            </div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
              Employee System
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 0" }}>
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
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

      {/* User */}
      <div style={{ padding: "16px", borderTop: "1px solid var(--border-color)" }}>
        <div className="flex items-center gap-3" style={{ marginBottom: 12 }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--accent), var(--purple))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "var(--text-sm)", fontWeight: 700, color: "#fff", flexShrink: 0,
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: "hidden" }}>
            <div className="truncate" style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-primary)" }}>
              {user?.name}
            </div>
            <div className="truncate" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
              {user?.email}
            </div>
          </div>
        </div>
        <button className="btn btn-ghost w-full" style={{ justifyContent: "flex-start", gap: 8 }} onClick={logout}>
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="btn btn-ghost btn-icon"
        style={{ position: "fixed", top: 14, left: 14, zIndex: 200, display: "none" }}
        id="mobile-menu-btn"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 49 }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx("sidebar", mobileOpen && "open")}
        style={{ display: "flex", flexDirection: "column" }}>
        {sidebarContent}
      </aside>

      <style>{`
        @media (max-width: 768px) {
          #mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
