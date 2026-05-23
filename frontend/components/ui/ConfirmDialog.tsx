"use client";

import Modal from "./Modal";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
}

export default function ConfirmDialog({
  isOpen, onClose, onConfirm,
  title = "Are you sure?",
  message,
  confirmLabel = "Delete",
  loading,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title=" " maxWidth={420}>
      <div style={{ textAlign: "center", padding: "8px 0" }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: "var(--danger-light)", display: "flex",
          alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
        }}>
          <AlertTriangle size={26} color="var(--danger)" />
        </div>
        <h3 style={{ marginBottom: 8 }}>{title}</h3>
        <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>{message}</p>
        <div className="flex gap-3" style={{ justifyContent: "center" }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
