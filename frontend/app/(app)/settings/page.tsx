"use client";

import { useState } from "react";
import { User, Lock, Save, AlertTriangle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  const [name, setName] = useState(user?.name || "");
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const TABS = [
    { id: "profile",  icon: <User size={16} />,    label: "Profile" },
    { id: "security", icon: <Lock size={16} />,    label: "Security" },
  ];

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }
    setProfileLoading(true);
    try {
      await api.put("/api/auth/me", { name: name.trim() });
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPw || !newPw || !confirmPw) {
      toast.error("All fields are required");
      return;
    }
    if (newPw.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPw !== confirmPw) {
      toast.error("Passwords do not match");
      return;
    }
    setPwLoading(true);
    try {
      await api.put("/api/auth/password", { currentPassword: currentPw, newPassword: newPw });
      toast.success("Password changed successfully!");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to change password";
      toast.error(msg);
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <>
      <Navbar title="Settings" />
      <div className="page-content" style={{ maxWidth: 800 }}>

        {/* Tab Bar */}
        <div className="flex gap-2" style={{ marginBottom: "var(--space-6)", borderBottom: "1px solid var(--border-color)", paddingBottom: "var(--space-3)" }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`btn btn-sm ${activeTab === tab.id ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setActiveTab(tab.id)}
              style={{ gap: 6 }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="card" style={{ maxWidth: 480 }}>
            <h3 style={{ marginBottom: "var(--space-6)" }}>Profile Information</h3>

            {/* Avatar */}
            <div className="flex items-center gap-4" style={{ marginBottom: "var(--space-6)" }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "linear-gradient(135deg, var(--accent), var(--purple))",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "var(--text-2xl)", fontWeight: 700, color: "#fff",
              }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: "var(--text-base)", color: "var(--text-primary)", margin: 0 }}>{user?.name}</p>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", margin: 0 }}>{user?.email}</p>
                <span className="badge badge-accent" style={{ marginTop: 4 }}>{user?.role}</span>
              </div>
            </div>

            <form onSubmit={handleProfileSave}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  className="form-input"
                  value={user?.email || ""}
                  disabled
                  style={{ opacity: 0.6, cursor: "not-allowed" }}
                />
                <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Email cannot be changed</span>
              </div>
              <div className="form-group">
                <label className="form-label">Member Since</label>
                <input
                  className="form-input"
                  value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : ""}
                  disabled
                  style={{ opacity: 0.6, cursor: "not-allowed" }}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={profileLoading} style={{ gap: 8 }}>
                <Save size={16} /> {profileLoading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="flex flex-col gap-6" style={{ maxWidth: 480 }}>
            <div className="card">
              <h3 style={{ marginBottom: "var(--space-6)" }}>Change Password</h3>
              <form onSubmit={handlePasswordChange}>
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input
                    className="form-input"
                    type="password"
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    className="form-input"
                    type="password"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    placeholder="Min. 6 characters"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    className="form-input"
                    type="password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    placeholder="Repeat new password"
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={pwLoading} style={{ gap: 8 }}>
                  <Lock size={16} /> {pwLoading ? "Changing..." : "Change Password"}
                </button>
              </form>
            </div>

            <div className="card" style={{ borderColor: "rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.04)" }}>
              <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
                <AlertTriangle size={18} color="var(--danger)" />
                <h4 style={{ margin: 0, color: "var(--danger)" }}>Danger Zone</h4>
              </div>
              <p style={{ fontSize: "var(--text-sm)", marginBottom: 16 }}>
                Signing out will end your current session. All your data remains saved.
              </p>
              <button className="btn btn-danger btn-sm" onClick={logout}>Sign Out</button>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
