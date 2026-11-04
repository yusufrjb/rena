"use client";

import React from "react";
import type { HealthStatus, View } from "@/app/lib/types";
import { ClockIcon, MenuIcon, PlusIcon, SparkIcon } from "@/app/components/icons";
import { ThemeSwitcher } from "@/app/components/theme-switcher";
import { StatusBadge } from "@/app/components/status-badge";

const TITLES: Record<View, { title: string; subtitle: string }> = {
  assistant: { title: "AI Assistant", subtitle: "Natural language to SQL and insight" },
  overview: { title: "Data Overview", subtitle: "Olist dataset and business views" },
  history: { title: "Query History", subtitle: "This session only" },
};

type TopbarProps = {
  view: View;
  onMenu: () => void;
  status: HealthStatus;
  onRecheck: () => void;
  onAsk: () => void;
  onNew: () => void;
  onHistory: () => void;
};

const ghost =
  "inline-flex items-center gap-1.5 rounded-lg border border-border bg-panel px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-subtle";

export function Topbar({ view, onMenu, status, onRecheck, onAsk, onNew, onHistory }: TopbarProps): React.JSX.Element {
  const { title, subtitle } = TITLES[view];
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-panel px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" onClick={onMenu} className="-ml-1.5 rounded-md p-2 text-muted hover:bg-subtle md:hidden" aria-label="Open sidebar" aria-controls="app-sidebar">
          <MenuIcon className="h-5 w-5" />
        </button>
        <div className="min-w-0 leading-tight">
          <h1 className="truncate text-sm font-semibold text-ink">{title}</h1>
          <p className="hidden truncate text-xs text-muted sm:block">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {view === "overview" && (
          <button type="button" onClick={onAsk} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-on-primary transition-colors hover:bg-primary-hover xl:hidden" aria-controls="assistant-panel">
            <SparkIcon className="h-3.5 w-3.5" />Ask AI
          </button>
        )}
        {view === "assistant" && (
          <>
            <button type="button" onClick={onHistory} className={ghost}><ClockIcon className="h-3.5 w-3.5" /><span className="hidden sm:inline">History</span></button>
            <button type="button" onClick={onNew} className={ghost}><PlusIcon className="h-3.5 w-3.5 text-link" /><span className="hidden sm:inline">New conversation</span></button>
          </>
        )}
        <ThemeSwitcher />
        <span className="hidden sm:block"><StatusBadge status={status} onClick={onRecheck} /></span>
      </div>
    </header>
  );
}
