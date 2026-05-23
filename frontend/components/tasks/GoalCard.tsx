"use client";

import { useState } from "react";
import { Target, CheckCircle2, Edit2, Plus } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { goalService } from "@/services/goalService";
import toast from "react-hot-toast";

interface Goal {
  _id?: string;
  goal?: string;
  completed?: boolean;
  notes?: string;
  date?: string;
}

interface GoalCardProps {
  goal: Goal | null;
  date?: string;
  onUpdate: (goal: Goal) => void;
  readOnly?: boolean;
}

export default function GoalCard({ goal, date, onUpdate, readOnly }: GoalCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [goalText, setGoalText] = useState(goal?.goal || "");
  const [notes, setNotes] = useState(goal?.notes || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalText.trim()) return;
    setLoading(true);
    try {
      const payload = { goal: goalText.trim(), notes: notes.trim(), date };
      let res;
      if (goal?._id) {
        res = await goalService.updateGoal(goal._id, payload);
      } else {
        res = await goalService.upsertGoal(payload);
      }
      onUpdate(res.data.data);
      setModalOpen(false);
      toast.success("Goal saved!");
    } catch {
      toast.error("Failed to save goal");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async () => {
    if (!goal?._id || readOnly) return;
    try {
      const res = await goalService.updateGoal(goal._id, { completed: !goal.completed });
      onUpdate(res.data.data);
      toast.success(goal.completed ? "Goal marked incomplete" : "Goal achieved! 🎉");
    } catch {
      toast.error("Failed to update goal");
    }
  };

  return (
    <>
      <div className="card" style={{
        background: goal?.completed
          ? "linear-gradient(135deg, rgba(34,197,94,0.08), var(--card-bg))"
          : "linear-gradient(135deg, rgba(59,130,246,0.08), var(--card-bg))",
        borderColor: goal?.completed ? "rgba(34,197,94,0.3)" : "rgba(59,130,246,0.2)",
      }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
          <div className="flex items-center gap-2">
            <Target size={18} color={goal?.completed ? "var(--success)" : "var(--accent)"} />
            <span style={{ fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--text-primary)" }}>
              Final Goal
            </span>
          </div>
          {!readOnly && (
            <button
              className="btn btn-ghost btn-icon btn-sm"
              onClick={() => { setGoalText(goal?.goal || ""); setNotes(goal?.notes || ""); setModalOpen(true); }}
            >
              {goal ? <Edit2 size={14} /> : <Plus size={14} />}
            </button>
          )}
        </div>

        {goal?.goal ? (
          <>
            <p style={{ fontSize: "var(--text-base)", color: "var(--text-primary)", fontWeight: 500, marginBottom: 8 }}>
              {goal.goal}
            </p>
            {goal.notes && (
              <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginBottom: 12 }}>
                {goal.notes}
              </p>
            )}
            {!readOnly && (
              <button
                className={`btn btn-sm ${goal.completed ? "btn-secondary" : "btn-success"}`}
                onClick={handleToggleComplete}
                style={{ gap: 6 }}
              >
                <CheckCircle2 size={14} />
                {goal.completed ? "Mark Incomplete" : "Mark Achieved"}
              </button>
            )}
            {readOnly && (
              <span className={`badge ${goal.completed ? "badge-completed" : "badge-pending"}`}>
                {goal.completed ? "Achieved" : "Not Achieved"}
              </span>
            )}
          </>
        ) : (
          <div className="empty-state" style={{ padding: "var(--space-6)" }}>
            <Target size={32} color="var(--text-muted)" />
            <p style={{ margin: 0 }}>
              {readOnly ? "No goal was set for this day" : "Set your final goal for today"}
            </p>
            {!readOnly && (
              <button className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>
                Set Goal
              </button>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={goal ? "Edit Final Goal" : "Set Final Goal"}>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Goal *</label>
            <textarea
              className="form-input"
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              placeholder="What is your main goal for today?"
              rows={3}
              autoFocus
              maxLength={500}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Notes (optional)</label>
            <textarea
              className="form-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional context..."
              rows={2}
              maxLength={1000}
            />
          </div>
          <div className="flex gap-3">
            <button type="button" className="btn btn-secondary flex-1" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
              {loading ? "Saving..." : "Save Goal"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
