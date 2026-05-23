interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  height?: number;
  color?: string;
}

export default function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = true,
  height = 8,
  color,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100));

  return (
    <div style={{ width: "100%" }}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center" style={{ marginBottom: 6 }}>
          {label && <span style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>{label}</span>}
          {showPercentage && (
            <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-primary)" }}>
              {pct}%
            </span>
          )}
        </div>
      )}
      <div className="progress-bar-container" style={{ height }}>
        <div
          className="progress-bar-fill"
          style={{
            width: `${pct}%`,
            background: color || undefined,
          }}
        />
      </div>
    </div>
  );
}
