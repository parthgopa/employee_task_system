"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, LineChart, Line,
} from "recharts";
import { formatChartDate } from "@/utils/dateUtils";

interface ChartDataPoint {
  date: string;
  total: number;
  completed: number;
  pending: number;
}

interface AnalyticsChartProps {
  data: ChartDataPoint[];
  type?: "bar" | "line";
  title?: string;
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: "var(--bg-secondary)", border: "1px solid var(--border-light)",
        borderRadius: "var(--radius-md)", padding: "10px 14px",
      }}>
        <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: 6, color: "var(--text-primary)" }}>
          {formatChartDate(label || "")}
        </p>
        {payload.map((p) => (
          <p key={p.name} style={{ fontSize: "var(--text-xs)", color: p.color, margin: "2px 0" }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsChart({ data, type = "bar", title }: AnalyticsChartProps) {
  const chartData = data.map((d) => ({ ...d, date: formatChartDate(d.date) }));

  return (
    <div className="card">
      {title && (
        <h4 style={{ marginBottom: 20, color: "var(--text-primary)" }}>{title}</h4>
      )}
      <ResponsiveContainer width="100%" height={280}>
        {type === "bar" ? (
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis dataKey="date" tick={{ fill: "var(--text-muted)", fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, color: "var(--text-secondary)" }} />
            <Bar dataKey="completed" name="Completed" fill="var(--success)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="pending" name="Pending" fill="var(--warning)" radius={[4, 4, 0, 0]} />
          </BarChart>
        ) : (
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis dataKey="date" tick={{ fill: "var(--text-muted)", fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, color: "var(--text-secondary)" }} />
            <Line type="monotone" dataKey="completed" name="Completed" stroke="var(--accent)" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="total" name="Total" stroke="var(--text-muted)" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
