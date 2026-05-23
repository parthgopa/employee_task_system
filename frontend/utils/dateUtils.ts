import { format, parseISO, isToday, isYesterday, formatDistanceToNow } from "date-fns";

export const formatDate = (date: string | Date, fmt = "MMM d, yyyy") => {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, fmt);
};

export const todayStr = () => format(new Date(), "yyyy-MM-dd");

export const formatRelative = (date: string | Date) => {
  const d = typeof date === "string" ? parseISO(date) : date;
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return formatDistanceToNow(d, { addSuffix: true });
};

export const formatChartDate = (dateStr: string) => {
  try { return format(parseISO(dateStr), "MMM d"); } catch { return dateStr; }
};

export const formatTime = (date: string | Date) => {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "h:mm a");
};

export const formatDateTime = (date: string | Date) => {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "MMM d, yyyy 'at' h:mm a");
};
