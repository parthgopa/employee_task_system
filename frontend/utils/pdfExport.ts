import type { Task } from "@/store/taskStore";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsPDFWithAutoTable = { lastAutoTable: { finalY: number } } & Record<string, any>;

export async function exportDailyReport(
  date: string,
  tasks: Task[],
  goal: { goal?: string; completed?: boolean; notes?: string } | null
) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF();
  doc.setFontSize(20);
  doc.text("Daily Task Report", 14, 20);
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`Date: ${date}`, 14, 30);

  if (goal?.goal) {
    doc.setFontSize(13);
    doc.setTextColor(0);
    doc.text(`Final Goal: ${goal.goal}`, 14, 42);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Status: ${goal.completed ? "Achieved" : "Not Achieved"}`, 14, 50);
    if (goal.notes) doc.text(`Notes: ${goal.notes}`, 14, 58);
  }

  const completed = tasks.filter((t) => t.status === "completed").length;
  const rows = tasks.map((t) => [
    t.title,
    t.description || "-",
    t.priority.charAt(0).toUpperCase() + t.priority.slice(1),
    t.status === "completed" ? "✓ Done" : "Pending",
  ]);

  autoTable(doc, {
    startY: goal?.goal ? 68 : 40,
    head: [["Task", "Description", "Priority", "Status"]],
    body: rows,
    theme: "grid",
    headStyles: { fillColor: [59, 130, 246] },
  });

  const finalY = (doc as unknown as JsPDFWithAutoTable).lastAutoTable.finalY + 10;
  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.text(
    `Summary: ${completed}/${tasks.length} tasks completed (${tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0}%)`,
    14,
    finalY
  );

  doc.save(`task-report-${date}.pdf`);
}
