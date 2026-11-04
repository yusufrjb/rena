"use client";

import React from "react";
import Link from "next/link";
import type { HealthStatus, View } from "@/app/lib/types";
import {
  ClockIcon,
  CloseIcon,
  DatabaseIcon,
  PanelIcon,
  PlusIcon,
  SparkIcon,
} from "@/app/components/icons";
import { StatusBadge } from "@/app/components/status-badge";

type SidebarProps = {
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
  active: View;
  onSelect: (view: View) => void;
  status: HealthStatus;
  onRecheck: () => void;
  onNewConversation: () => void;
  historyCount: number;
};

const NAV: { key: View; label: string; Icon: typeof SparkIcon }[] = [
  { key: "assistant", label: "AI Assistant", Icon: SparkIcon },
  { key: "overview", label: "Data Overview", Icon: DatabaseIcon },
  { key: "history", label: "Query History", Icon: ClockIcon },
];

export function Sidebar({
  open,
  collapsed,
  onClose,
  onToggleCollapse,
  active,
  onSelect,
  status,
  onRecheck,
  onNewConversation,
  historyCount,
}: SidebarProps): React.JSX.Element {
  const hide = collapsed ? "md:hidden" : "";

  return (
    <>
      <aside
        id="app-sidebar"
        aria-label="Sidebar"
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-panel transition-[transform,width] duration-200 ease-out md:static md:z-auto md:translate-x-0 ${
          collapsed ? "md:w-[68px]" : "md:w-64"
        } ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-14 shrink-0 items-center justify-between gap-2 px-4">
          <Link href="/" title="Back to home" className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-on-primary">
              <SparkIcon className="h-4 w-4" />
            </div>
            <div className={`min-w-0 leading-tight ${hide}`}>
              <div className="truncate text-sm font-semibold text-ink">RENA</div>
              <div className="truncate text-xs text-muted">Retrieval-Enhanced Network</div>
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted hover:bg-subtle md:hidden"
            aria-label="Close sidebar"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="px-3 pb-2 pt-1">
          <button
            type="button"
            onClick={onNewConversation}
            title="New Conversation"
            className={`flex w-full items-center gap-2 rounded-lg border border-border bg-panel px-3 py-2 text-sm font-medium text-ink shadow-soft transition-colors hover:border-primary-line hover:bg-primary-soft ${
              collapsed ? "md:justify-center md:px-0" : ""
            }`}
          >
            <PlusIcon className="h-4 w-4 shrink-0 text-link" />
            <span className={hide}>New Conversation</span>
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2" aria-label="Main">
          {NAV.map(({ key, label, Icon }) => {
            const isActive = active === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onSelect(key)}
                title={label}
                aria-current={isActive ? "page" : undefined}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                  collapsed ? "md:justify-center md:px-0" : ""
                } ${
                  isActive
                    ? "bg-primary-soft font-medium text-link"
                    : "text-body hover:bg-subtle hover:text-ink"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className={hide}>{label}</span>
                {key === "history" && historyCount > 0 && (
                  <span className={`ml-auto rounded-full bg-subtle px-1.5 text-xs text-muted ${hide}`}>
                    {historyCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="space-y-3 border-t border-border p-3">
          <div className={`rounded-lg bg-subtle p-3 ${hide}`}>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-soft">Dataset</p>
            <p className="mt-1 text-sm font-medium text-ink">Olist Brazilian E-Commerce</p>
            <p className="mt-0.5 text-xs text-muted">Public Dataset · PostgreSQL</p>
          </div>
          <div className={collapsed ? "md:flex md:justify-center" : ""}>
            <StatusBadge status={status} onClick={onRecheck} />
          </div>
          <Link href="/" className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-subtle hover:text-ink ${collapsed ? "md:hidden" : ""}`}>← Back to website</Link>
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-subtle hover:text-ink md:flex"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
          >
            <PanelIcon className="h-4 w-4 shrink-0" />
            <span className={hide}>Collapse</span>
          </button>
        </div>
      </aside>

      <div
        className={`fixed inset-0 z-30 bg-slate-950/50 transition-opacity duration-200 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
    </>
  );
}
