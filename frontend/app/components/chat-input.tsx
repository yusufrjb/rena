"use client";

import React, { useEffect, useRef } from "react";
import { SendIcon } from "@/app/components/icons";

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (question: string) => void;
  disabled: boolean;
  autoFocus?: boolean;
  large?: boolean;
};

export function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled,
  autoFocus,
  large,
}: ChatInputProps): React.JSX.Element {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (canSend) onSubmit(value);
      }}
      className="flex items-end gap-2 rounded-2xl border border-border-strong bg-panel p-1.5 shadow-soft transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10"
    >
      <label htmlFor="question" className="sr-only">
        Your question
      </label>
      <textarea
        id="question"
        ref={ref}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault();
            if (canSend) onSubmit(value);
          }
        }}
        placeholder="Ask about sales, orders, sellers, payments…"
        rows={1}
        readOnly={disabled}
        className={`max-h-[200px] min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2.5 text-ink outline-none placeholder:text-muted-soft ${
          large ? "text-base" : "text-[15px]"
        }`}
      />
      <button
        type="submit"
        disabled={!canSend}
        className="flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3.5 text-sm font-medium text-on-primary transition-colors hover:bg-primary-hover disabled:bg-border-strong disabled:text-muted"
      >
        <span className="hidden sm:inline">{disabled ? "Analyzing…" : "Send"}</span>
        <SendIcon className="h-4 w-4" />
        <span className="sr-only sm:hidden">Send</span>
      </button>
    </form>
  );
}
