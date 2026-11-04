"use client";

import React, { useEffect, useState } from "react";
import type { ChatMessage } from "@/app/lib/types";
import { relativeTime } from "@/app/lib/format";
import { ChevronIcon, ClockIcon } from "@/app/components/icons";

export type HistoryItem = {
  id: string;
  userMessageId: string;
  question: string;
  createdAt: number;
  status: "loading" | "success" | "failed";
};

export function buildHistory(messages: ChatMessage[]): HistoryItem[] {
  const items: HistoryItem[] = [];
  for (let i = 0; i < messages.length; i++) {
    const m = messages[i];
    if (m.role !== "assistant") continue;
    const user = messages[i - 1];
    const failed = m.status === "done" && (Boolean(m.error) || !m.result?.success || Boolean(m.result?.error));
    items.push({
      id: m.id,
      userMessageId: user && user.role === "user" ? user.id : m.id,
      question: m.question,
      createdAt: m.createdAt,
      status: m.status === "loading" ? "loading" : failed ? "failed" : "success",
    });
  }
  return items.reverse();
}

const BADGE: Record<HistoryItem["status"], { label: string; cls: string }> = {
  loading: { label: "Running", cls: "bg-subtle text-muted" },
  success: { label: "Success", cls: "bg-success-soft text-success" },
  failed: { label: "Failed", cls: "bg-danger-soft text-danger" },
};

type Props = { items: HistoryItem[]; onOpen: (item: HistoryItem) => void; onStart?: () => void };

export function QueryHistory({ items, onOpen, onStart }: Props): React.JSX.Element {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const update = () => setNow(Date.now());
    update();
    const timer = window.setInterval(update, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const ok = items.filter((i) => i.status === "success").length;
  const failed = items.filter((i) => i.status === "failed").length;

  return (
    <div className="mx-auto w-full max-w-4xl animate-rise px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Query History</h2>
          <p className="mt-1.5 max-w-xl text-sm text-muted">
            Questions from this session. History stays in this browser tab and clears on reload or when you start a new conversation.
          </p>
        </div>
        {items.length > 0 && (
          <p className="text-sm tabular-nums text-muted">
            {items.length} {items.length === 1 ? "question" : "questions"} · {ok} answered · {failed} failed
          </p>
        )}
      </header>

      {items.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-xl border border-dashed border-border-strong bg-panel px-6 py-16 text-center">
          <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-link">
            <ClockIcon className="h-5 w-5" />
          </span>
          <p className="font-semibold text-ink">No queries yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted">Ask the AI Assistant a question and it will be listed here so you can return to the answer.</p>
          {onStart && (
            <button type="button" onClick={onStart} className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-hover">
              Ask a question
            </button>
          )}
        </div>
      ) : (
        <ol className="mt-6 space-y-2.5">
          {items.map((item, idx) => {
            const badge = BADGE[item.status];
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onOpen(item)}
                  className="group flex w-full items-center gap-4 rounded-xl border border-border bg-panel px-4 py-3.5 text-left shadow-soft transition-colors hover:border-primary-line hover:bg-primary-soft/40"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-subtle text-xs font-medium tabular-nums text-muted">
                    {items.length - idx}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 font-medium text-ink">{item.question}</span>
                    <span className="mt-0.5 block text-xs text-muted">
                      {now === null
                        ? ""
                        : `${relativeTime(item.createdAt, now)} · ${new Date(item.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`}
                    </span>
                  </span>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.cls}`}>{badge.label}</span>
                  <ChevronIcon className="h-4 w-4 shrink-0 text-muted-soft transition-transform group-hover:translate-x-0.5 group-hover:text-link" />
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
