export default function SkeletonCard({ lines = 3, height = 80 }: { lines?: number; height?: number }) {
  return (
    <div className="card" style={{ padding: "var(--space-4)" }}>
      <div className="skeleton" style={{ height: 16, width: "60%", marginBottom: 10 }} />
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 12, width: `${70 + i * 10}%`, marginBottom: 8 }} />
      ))}
    </div>
  );
}

export function SkeletonText({ width = "100%" }: { width?: string | number }) {
  return <div className="skeleton" style={{ height: 14, width, borderRadius: 4 }} />;
}

export function SkeletonStatCard() {
  return (
    <div className="stat-card">
      <div className="skeleton" style={{ height: 40, width: 60 }} />
      <div className="skeleton" style={{ height: 12, width: 80 }} />
    </div>
  );
}
