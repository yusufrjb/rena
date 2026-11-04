"use client";

import React from "react";

import { SUGGESTED_QUESTIONS } from "@/app/lib/suggested-questions";

export { SUGGESTED_QUESTIONS };

const TOPICS = ["Sales", "Trends", "Categories", "Sellers", "Reviews", "Payments", "Orders"];

type SuggestionsProps = { onSelect: (question: string) => void; disabled: boolean; stacked?: boolean; grid?: boolean };

export function Suggestions({ onSelect, disabled, stacked = false, grid = false }: SuggestionsProps): React.JSX.Element {
  return (
    <ul className={grid ? "grid gap-2 sm:grid-cols-2" : stacked ? "flex flex-col gap-1.5" : "flex flex-wrap justify-center gap-2"} aria-label="Suggested questions">
      {SUGGESTED_QUESTIONS.map((question, qi) => (
        <li key={question}>
          <button
            type="button"
            onClick={() => onSelect(question)}
            disabled={disabled}
            className={`border border-border bg-panel text-left text-sm ${stacked || grid ? "w-full rounded-lg px-3 py-2" : "rounded-full px-3.5 py-2"} text-body transition-colors hover:border-primary-line hover:bg-primary-soft hover:text-link disabled:opacity-50`}
          >
            {grid && <span className="mb-0.5 block text-xs font-medium text-link">{TOPICS[qi] ?? "Analysis"}</span>}
            {question}
          </button>
        </li>
      ))}
    </ul>
  );
}
