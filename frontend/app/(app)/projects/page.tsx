"use client";

import { useEffect, useState } from "react";
import { Folder, Plus, MoreVertical, Edit2, Trash2, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useProjectStore, Project } from "@/store/projectStore";
import { projectService } from "@/services/projectService";
import { formatDate } from "@/utils/dateUtils";
import SkeletonCard from "@/components/ui/SkeletonCard";
import ProgressBar from "@/components/ui/ProgressBar";
import toast from "react-hot-toast";
import Link from "next/link";

export default function ProjectsPage() {
  const { projects, loading, setProjects, setLoading, addProject, updateProject, removeProject } = useProjectStore();
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await projectService.getProjects();
      setProjects(res.data.data);
    } catch {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Project name is required");
      return;
    }

    try {
      const res = await projectService.createProject(formData);
      addProject(res.data.data);
      setFormData({ name: "", description: "" });
      setShowModal(false);
      toast.success("Project created!");
    } catch {
      toast.error("Failed to create project");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || !formData.name.trim()) return;

    try {
      const res = await projectService.updateProject(editingProject._id, formData);
      updateProject(editingProject._id, res.data.data);
      setEditingProject(null);
      setFormData({ name: "", description: "" });
      toast.success("Project updated!");
    } catch {
      toast.error("Failed to update project");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project? Tasks will be unassigned (not deleted).")) return;

    try {
      await projectService.deleteProject(id, false);
      removeProject(id);
      toast.success("Project deleted");
    } catch {
      toast.error("Failed to delete project");
    }
  };

  const openEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({ name: project.name, description: project.description });
    setActiveMenu(null);
  };

  const calculateProgress = (stats?: Project["taskStats"]) => {
    if (!stats || stats.total === 0) return 0;
    return Math.round((stats.completed / stats.total) * 100);
  };

  return (
    <>
      <header className="navbar">
        <div>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
            Projects
          </h2>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 2 }}>
            Manage your project-based tasks
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Project
        </button>
      </header>

      <div className="page-content">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : projects.length === 0 ? (
          <div className="empty-state card" style={{ padding: "var(--space-16)" }}>
            <Folder size={48} color="var(--text-muted)" />
            <h3>No Projects Yet</h3>
            <p>Create your first project to organize related tasks together.</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ marginTop: "var(--space-4)" }}>
              <Plus size={16} /> Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => {
              const progress = calculateProgress(project.taskStats);
              const hasTasks = (project.taskStats?.total || 0) > 0;
              
              return (
                <div key={project._id} className="card" style={{ position: "relative" }}>
                  {/* Menu */}
                  <div style={{ position: "absolute", top: 12, right: 12, zIndex: 20 }}>
                    <button 
                      className="btn btn-ghost btn-icon btn-sm" 
                      onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === project._id ? null : project._id); }}
                    >
                      <MoreVertical size={16} />
                    </button>
                    {activeMenu === project._id && (
                      <div 
                        style={{ 
                          position: "absolute", 
                          right: 0, 
                          top: "calc(100% + 4px)", 
                          zIndex: 50,
                          minWidth: 120,
                          background: "var(--bg-primary)",
                          border: "1px solid var(--border-color)",
                          borderRadius: "var(--radius-md)",
                          boxShadow: "var(--shadow-lg)",
                          padding: "4px",
                        }}
                      >
                        <button 
                          onClick={(e) => { e.stopPropagation(); openEdit(project); }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            width: "100%",
                            padding: "8px 12px",
                            border: "none",
                            borderRadius: "var(--radius-sm)",
                            background: "transparent",
                            color: "var(--text-primary)",
                            fontSize: "var(--text-sm)",
                            cursor: "pointer",
                            textAlign: "left",
                          }}
                        >
                          <Edit2 size={14} /> Edit
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(project._id); }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            width: "100%",
                            padding: "8px 12px",
                            border: "none",
                            borderRadius: "var(--radius-sm)",
                            background: "transparent",
                            color: "var(--danger)",
                            fontSize: "var(--text-sm)",
                            cursor: "pointer",
                            textAlign: "left",
                          }}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    )}
                  </div>

                  <Link href={`/projects/${project._id}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <div className="flex items-center gap-3" style={{ marginBottom: "var(--space-4)" }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: "10px",
                        background: "linear-gradient(135deg, var(--purple), var(--accent))",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Folder size={22} color="#fff" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 className="truncate" style={{ margin: 0, fontSize: "var(--text-base)" }}>{project.name}</h4>
                        <span className={`badge badge-${project.status}`}>{project.status}</span>
                      </div>
                    </div>

                    {project.description && (
                      <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: "var(--space-4)", lineHeight: 1.5 }}>
                        {project.description}
                      </p>
                    )}

                    {/* Task Stats */}
                    {hasTasks ? (
                      <>
                        <div className="flex items-center justify-between" style={{ marginBottom: "var(--space-2)" }}>
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                            {project.taskStats?.completed}/{project.taskStats?.total} completed
                          </span>
                          <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: progress === 100 ? "var(--success)" : "var(--text-primary)" }}>
                            {progress}%
                          </span>
                        </div>
                        <ProgressBar value={progress} max={100} color={progress === 100 ? "var(--success)" : "var(--accent)"} />
                        
                        <div className="flex items-center gap-4" style={{ marginTop: "var(--space-4)", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                          <span className="flex items-center gap-1">
                            <AlertCircle size={12} color="var(--danger)" />
                            {project.taskStats?.notInitiated || 0} not started
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} color="var(--warning)" />
                            {project.taskStats?.inProgress || 0} in progress
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle2 size={12} color="var(--success)" />
                            {project.taskStats?.completed || 0} done
                          </span>
                        </div>
                      </>
                    ) : (
                      <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", fontStyle: "italic" }}>
                        No tasks yet. Add tasks from the My Tasks page.
                      </p>
                    )}

                    <div style={{ marginTop: "var(--space-4)", fontSize: "var(--text-xs)", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                      Created {formatDate(project.createdAt)}
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showModal || editingProject) && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--space-4)",
        }} onClick={() => { setShowModal(false); setEditingProject(null); }}>
          <div style={{
            background: "var(--bg-primary)", borderRadius: "var(--radius-lg)",
            padding: "var(--space-6)", width: "100%", maxWidth: 480,
            border: "1px solid var(--border-color)", boxShadow: "var(--shadow-lg)",
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: "var(--space-5)", fontSize: "var(--text-xl)", fontWeight: 700 }}>
              {editingProject ? "Edit Project" : "New Project"}
            </h3>
            <form onSubmit={editingProject ? handleUpdate : handleCreate}>
              <div style={{ marginBottom: "var(--space-4)" }}>
                <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: 500, marginBottom: "var(--space-2)", color: "var(--text-secondary)" }}>
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Project name"
                  required
                  style={{
                    width: "100%", padding: "var(--space-3)",
                    border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)",
                    background: "var(--bg-secondary)", color: "var(--text-primary)",
                    fontSize: "var(--text-base)",
                  }}
                />
              </div>
              <div style={{ marginBottom: "var(--space-5)" }}>
                <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: 500, marginBottom: "var(--space-2)", color: "var(--text-secondary)" }}>
                  Description (optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description..."
                  rows={3}
                  style={{
                    width: "100%", padding: "var(--space-3)",
                    border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)",
                    background: "var(--bg-secondary)", color: "var(--text-primary)",
                    fontSize: "var(--text-base)", resize: "vertical",
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setEditingProject(null); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProject ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
