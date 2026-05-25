"use client";

interface TaskFiltersProps {
  filter: string;
  setFilter: (v: string) => void;
  sort: string;
  setSort: (v: string) => void;
}

export default function TaskFilters({ filter, setFilter, sort, setSort }: TaskFiltersProps) {
  const filterBtns = [
    { value: "all", label: "All" },
    { value: "not_initiated", label: "Not Started" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
  ];

  return (
    <div className="flex items-center gap-3" style={{ flexWrap: "wrap" }}>
      <div className="flex gap-2">
        {filterBtns.map((b) => (
          <button
            key={b.value}
            className={`btn btn-sm ${filter === b.value ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setFilter(b.value)}
          >
            {b.label}
          </button>
        ))}
      </div>

      <select
        className="form-input"
        style={{ width: "auto", height: 32, fontSize: "var(--text-xs)", paddingTop: 4, paddingBottom: 4 }}
        value={sort}
        onChange={(e) => setSort(e.target.value)}
      >
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="priority">Priority</option>
      </select>
    </div>
  );
}
