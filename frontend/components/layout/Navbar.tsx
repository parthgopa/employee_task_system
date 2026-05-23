"use client";

import { Search, Sun, Moon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { formatDate } from "@/utils/dateUtils";
import { useState } from "react";
import NotificationPanel from "./NotificationPanel";

interface NavbarProps {
  title?: string;
  onSearch?: (q: string) => void;
}

export default function Navbar({ title, onSearch }: NavbarProps) {
  const { user } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [searchVal, setSearchVal] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <header className="navbar">
      <div>
        {title && (
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
            {title}
          </h2>
        )}
        <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 2 }}>
          {formatDate(new Date(), "EEEE, MMMM d yyyy")}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {onSearch && (
          <div style={{ position: "relative" }}>
            <Search size={15} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              className="form-input"
              placeholder="Search tasks..."
              value={searchVal}
              onChange={handleSearch}
              style={{ paddingLeft: 32, width: 220, height: 36 }}
            />
          </div>
        )}

        {/* Theme Toggle */}
        <button
          className="btn btn-ghost btn-icon"
          onClick={toggleTheme}
          aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
          title={`Switch to ${isDark ? "light" : "dark"} mode`}
        >
          {isDark ? <Sun size={18} color="var(--warning)" /> : <Moon size={18} color="var(--accent)" />}
        </button>

        {/* Notifications */}
        <NotificationPanel />

        <div style={{
          width: 34, height: 34, borderRadius: "50%",
          background: "linear-gradient(135deg, var(--accent), var(--purple))",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "var(--text-sm)", fontWeight: 700, color: "#fff", cursor: "default",
        }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
