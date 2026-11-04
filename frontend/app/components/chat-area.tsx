
"use client";

import React, { useEffect, useRef } from "react";
import type { ChatMessage } from "@/app/lib/types";
import { Message } from "@/app/components/chat-message";
import { ChatInput } from "@/app/components/chat-input";
import { Suggestions } from "@/app/components/suggestions";

type ChatAreaProps = {
  messages: ChatMessage[];
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (question: string) => void;
  loading: boolean;
  focusId: string | null;
  compact?: boolean;
};

export function ChatArea({
  messages,
  input,
  onInputChange,
  onSubmit,
  loading,
  focusId,
  compact = false,
}: ChatAreaProps): React.JSX.Element {
  const endRef = useRef<HTMLDivElement>(null);
  const last = messages[messages.length - 1];
  const lastKey = last
    ? `${last.id}:${last.role === "assistant" ? last.status : ""}`
    : "";

  useEffect(() => {
    if (focusId) return;
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [lastKey, focusId]);

  useEffect(() => {
    if (!focusId) return;
    document
      .getElementById(`msg-${focusId}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [focusId]);

  if (messages.length === 0) {
    if (compact) {
      return (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
          <div className="mb-5">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-link">
              <span className="text-lg">✦</span>
            </div>
            <h3 className="text-base font-semibold text-ink">
              Ask your business data
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Ask in natural language. The assistant writes the SQL, runs it, and explains the result.
            </p>
          </div>

          <div className="mb-4">
            <p className="mb-2 text-xs font-medium text-muted">
              Suggested questions
            </p>
            <Suggestions onSelect={onSubmit} disabled={loading} stacked />
          </div>

          <div className="mt-auto pt-4">
            <ChatInput
              value={input}
              onChange={onInputChange}
              onSubmit={onSubmit}
              disabled={loading}
            />
            <p className="mt-2 text-center text-[11px] text-muted-soft">
              AI-generated insights · PostgreSQL
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-1 overflow-y-auto px-4 py-10 sm:px-8">
        <div className="m-auto w-full max-w-4xl animate-rise">
          <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Ask your business data</h2>
          <p className="mt-3 max-w-2xl text-base text-muted">
            Ask in natural language about the Olist e-commerce dataset. The assistant writes read-only SQL, runs it on PostgreSQL, and explains what it finds.
          </p>
          <div className="mt-7">
            <ChatInput value={input} onChange={onInputChange} onSubmit={onSubmit} disabled={loading} large />
          </div>
          <ol className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted">
            {["Reads your question", "Writes and runs SQL", "Explains the result"].map((t, n) => (
              <li key={t}><span className="mr-1.5 font-medium text-link">{n + 1}</span>{t}</li>
            ))}
          </ol>
          <p className="mb-3 mt-10 text-sm font-medium text-ink">Try asking</p>
          <Suggestions onSelect={onSubmit} disabled={loading} grid />
          <p className="mt-8 text-xs text-muted-soft">
            AI-generated SQL and insights should be reviewed before making business decisions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 sm:px-4">
        <div
          className={`mx-auto space-y-6 py-5 ${compact ? "max-w-none" : "max-w-4xl"
            }`}
        >
          {messages.map((m) => (
            <Message key={m.id} message={m} />
          ))}
          <div ref={endRef} />
        </div>
      </div>

      <div className="shrink-0 border-t border-border bg-panel px-3 pb-3 pt-3 sm:px-4">
        <div className={compact ? "max-w-none" : "mx-auto max-w-4xl"}>
          <ChatInput
            value={input}
            onChange={onInputChange}
            onSubmit={onSubmit}
            disabled={loading}
          />
          <p className="mt-2 text-center text-[11px] text-muted-soft">
            Review AI-generated results before making business decisions.
          </p>
        </div>
      </div>
    </>
  );
}
