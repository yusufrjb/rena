import React from "react";
import type { ChatMessage } from "@/app/lib/types";
import { AiResponse, ErrorCard } from "@/app/components/ai-response";
import { SparkIcon } from "@/app/components/icons";

function Avatar(): React.JSX.Element {
  return (
    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-on-primary" aria-hidden="true">
      <SparkIcon className="h-3.5 w-3.5" />
    </div>
  );
}

export function Message({ message }: { message: ChatMessage }): React.JSX.Element {
  if (message.role === "user") {
    return (
      <div id={`msg-${message.id}`} className="flex scroll-mt-4 justify-end animate-rise">
        <p className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-[15px] leading-6 text-on-primary shadow-soft sm:max-w-[80%]">
          {message.content}
        </p>
      </div>
    );
  }

  return (
    <div className="flex gap-3 animate-rise">
      <Avatar />
      <div className="min-w-0 flex-1">
        <p className="mb-1.5 text-xs font-medium text-muted">AI Assistant</p>
        {message.status === "loading" ? (
          <div role="status" className="space-y-3 rounded-xl border border-border bg-panel p-4 shadow-soft">
            <div className="flex items-center gap-2 text-sm text-muted">
              <span className="flex gap-1" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="typing-dot h-1.5 w-1.5 rounded-full bg-primary" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </span>
              Analyzing your data…
            </div>
            <div className="space-y-2" aria-hidden="true">
              <div className="h-2.5 w-11/12 animate-pulse rounded-full bg-subtle" />
              <div className="h-2.5 w-3/4 animate-pulse rounded-full bg-subtle" />
              <div className="h-2.5 w-1/2 animate-pulse rounded-full bg-subtle" />
            </div>
          </div>
        ) : message.error ? (
          <ErrorCard error={message.error} />
        ) : message.result ? (
          <AiResponse result={message.result} />
        ) : null}
      </div>
    </div>
  );
}
