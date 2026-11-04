import React from "react";
import type { HealthStatus } from "@/app/lib/types";

const LABEL: Record<HealthStatus, string> = {
  checking: "Checking…",
  online: "Backend online",
  offline: "Backend offline",
};

const DOT: Record<HealthStatus, string> = {
  checking: "bg-muted-soft animate-pulse",
  online: "bg-success",
  offline: "bg-danger",
};

type Props = { status: HealthStatus; label?: string; onClick?: () => void };

export function StatusBadge({ status, label, onClick }: Props): React.JSX.Element {
  const content = (
    <>
      <span className={`h-1.5 w-1.5 rounded-full ${DOT[status]}`} aria-hidden="true" />
      <span>{label ?? LABEL[status]}</span>
    </>
  );
  const cls =
    "inline-flex items-center gap-1.5 rounded-full border border-border bg-panel px-2.5 py-1 text-xs font-medium text-body";
  return onClick ? (
    <button type="button" onClick={onClick} className={`${cls} transition-colors hover:border-border-strong`} title="Re-check backend connection">
      {content}
    </button>
  ) : (
    <span className={cls} role="status">{content}</span>
  );
}
