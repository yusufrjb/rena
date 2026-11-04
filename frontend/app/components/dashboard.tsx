
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ApiError, askQuestion } from "@/app/lib/api";
import { useHealth } from "@/app/lib/use-health";
import type { AppError, ChatMessage, View } from "@/app/lib/types";
import { ChatArea } from "@/app/components/chat-area";
import { DataOverview } from "@/app/components/data-overview";
import { QueryHistory, buildHistory, type HistoryItem } from "@/app/components/query-history";
import { Sidebar } from "@/app/components/sidebar";
import { CloseIcon, PanelIcon } from "@/app/components/icons";
import { Topbar } from "@/app/components/topbar";

function toAppError(error: unknown): AppError {
  if (error instanceof ApiError) return error.info;
  return {
    kind: "network",
    title: "Something went wrong",
    message: "An unexpected error occurred while contacting the backend.",
  };
}

export function Dashboard(): React.JSX.Element {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [view, setView] = useState<View>("overview");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [focusId, setFocusId] = useState<string | null>(null);
  const { status, refresh } = useHealth();

  const inFlight = useRef(false);
  const controller = useRef<AbortController | null>(null);

  const loading = messages.some(
    (m) => m.role === "assistant" && m.status === "loading"
  );
  const history = useMemo(() => buildHistory(messages), [messages]);

  useEffect(() => () => controller.current?.abort(), []);

  const submit = useCallback(async (raw: string) => {
    const question = raw.trim();
    if (!question || inFlight.current) return;

    inFlight.current = true;

    const now = Date.now();
    const assistantId = crypto.randomUUID();

    setFocusId(null);
    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: question, createdAt: now },
      { id: assistantId, role: "assistant", createdAt: now, status: "loading", question },
    ]);

    const ctl = new AbortController();
    controller.current = ctl;

    try {
      const result = await askQuestion(question, ctl.signal);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId && m.role === "assistant"
            ? { ...m, status: "done", result }
            : m
        )
      );
    } catch (error) {
      if (ctl.signal.aborted) return;

      const appError = toAppError(error);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId && m.role === "assistant"
            ? { ...m, status: "done", error: appError }
            : m
        )
      );

      if (appError.kind === "offline") refresh();
    } finally {
      if (controller.current === ctl) controller.current = null;
      inFlight.current = false;
    }
  }, [refresh]);

  const newConversation = useCallback(() => {
    controller.current?.abort();
    controller.current = null;
    inFlight.current = false;
    setMessages([]);
    setInput("");
    setFocusId(null);
    setView("assistant");
    setDrawerOpen(false);
  }, []);

  const select = useCallback((next: View) => {
    setView(next);
    setDrawerOpen(false);
    setAssistantOpen(false);
  }, []);

  const openHistory = useCallback((item: HistoryItem) => {
    setFocusId(item.userMessageId);
    setView("assistant");
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  return (
    <div className="flex h-dvh overflow-hidden bg-bg">
      <Sidebar
        open={drawerOpen}
        collapsed={collapsed}
        onClose={() => setDrawerOpen(false)}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        active={view}
        onSelect={select}
        status={status}
        onRecheck={refresh}
        onNewConversation={newConversation}
        historyCount={history.length}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          view={view}
          onMenu={() => setDrawerOpen(true)}
          status={status}
          onRecheck={refresh}
          onAsk={() => setAssistantOpen(true)}
          onNew={newConversation}
          onHistory={() => select("history")}
        />


        <main className="flex min-h-0 flex-1">
          <div className={`min-h-0 min-w-0 flex-1 ${view === "overview" ? "flex" : "hidden"}`}>
            <section className="min-h-0 min-w-0 flex-1 overflow-y-auto">
              <DataOverview compact />
            </section>

            <div
              className={`fixed inset-0 z-40 bg-slate-950/50 xl:hidden ${assistantOpen ? "" : "hidden"}`}
              onClick={() => setAssistantOpen(false)}
              aria-hidden="true"
            />
            <aside
              id="assistant-panel"
              aria-label="AI Assistant"
              className={`fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-border bg-panel transition-transform duration-200 sm:w-[440px] xl:static xl:z-auto xl:w-[400px] xl:shrink-0 xl:translate-x-0 2xl:w-[460px] ${
                assistantOpen ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border px-4">
                <div className="min-w-0 leading-tight">
                  <h2 className="text-sm font-semibold text-ink">AI Assistant</h2>
                  <p className="truncate text-xs text-muted">Ask about the data behind these charts</p>
                </div>
                <div className="flex items-center gap-1">
                  <span
                    role="status"
                    className={`rounded-full px-2 py-1 text-[11px] font-medium ${
                      loading ? "bg-primary-soft text-link" : "bg-success-soft text-success"
                    }`}
                  >
                    {loading ? "Analyzing…" : "Ready"}
                  </span>
                  <button type="button" onClick={() => select("assistant")} title="Open full-page assistant" aria-label="Open full-page assistant" className="rounded-md p-1.5 text-muted transition-colors hover:bg-subtle hover:text-ink">
                    <PanelIcon className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => setAssistantOpen(false)} aria-label="Close assistant" className="rounded-md p-1.5 text-muted hover:bg-subtle xl:hidden">
                    <CloseIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <ChatArea
                messages={messages}
                input={input}
                onInputChange={setInput}
                onSubmit={submit}
                loading={loading}
                focusId={focusId}
                compact
              />
            </aside>
          </div>

          {view === "assistant" && (
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <ChatArea
                messages={messages}
                input={input}
                onInputChange={setInput}
                onSubmit={submit}
                loading={loading}
                focusId={focusId}
              />
            </div>
          )}

          {view === "history" && (
            <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
              <QueryHistory items={history} onOpen={openHistory} onStart={() => select("assistant")} />
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
