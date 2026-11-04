
"use client";

import React from "react";
import type { ChatMessage } from "@/app/lib/types";
import { AiResponse } from "@/app/components/ai-response";
import { Markdown } from "@/app/components/markdown";

type MessageBubbleProps = {
  message: ChatMessage;
};

export function MessageBubble({
  message,
}: MessageBubbleProps): React.JSX.Element {
  if (message.role === "user") {
    return (
      <div className="flex w-full justify-end">
        <div className="max-w-[60%] rounded-lg border border-border bg-primary-soft p-4 text-right text-body md:max-w-[52%]">
          {message.content}
        </div>
      </div>
    );
  }

  if (message.status === "loading") {
    return (
      <div className="flex w-full max-w-[64rem]">
        <div className="rounded-lg border border-border bg-panel p-4 text-body">
          <p className="flex items-center gap-1">
            Analyzing your data
            <span className="animate-pulse">...</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-[64rem]">
      <div className="flex w-full flex-col gap-4">
        {message.error && (
          <div className="rounded-lg border border-danger-soft bg-danger-soft p-3 text-sm text-danger">
            <p className="font-semibold">{message.error.title}</p>
            <p className="mt-1">{message.error.message}</p>
          </div>
        )}

        {message.result && <AiResponse result={message.result} />}

        {!message.result && !message.error && (
          <div className="rounded-lg border border-border bg-panel p-4 text-body">
            <Markdown text={message.question} />
          </div>
        )}
      </div>
    </div>
  );
}
