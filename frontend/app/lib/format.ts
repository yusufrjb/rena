export function formatCell(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return String(value);
    return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function isNumeric(value: unknown): boolean {
  return typeof value === "number" && Number.isFinite(value);
}

export function humanizeColumn(name: string): string {
  return name.replaceAll("_", " ");
}

export function relativeTime(timestamp: number, now: number): string {
  const seconds = Math.max(0, Math.round((now - timestamp) / 1000));
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.round(hours / 24)} d ago`;
}
