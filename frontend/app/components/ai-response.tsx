"use client";

import React, { useEffect, useRef, useState } from "react";
import type { AppError, AskResult } from "@/app/lib/types";
import { classifyBackendError } from "@/app/lib/api";
import { AlertIcon, ChevronIcon, CheckIcon, CodeIcon, CopyIcon, SparkIcon, TableIcon } from "@/app/components/icons";
import { Markdown } from "@/app/components/markdown";
import { QueryTable } from "@/app/components/query-table";
import { SqlCode } from "@/app/components/sql-code";

function Card({
  title,
  icon,
  aside,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  aside?: React.ReactNode;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <section className="rounded-xl border border-border bg-panel p-4 shadow-soft sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
          {icon}
          {title}
        </h3>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function ErrorCard({ error }: { error: AppError }): React.JSX.Element {
  return (
    <div role="alert" className="rounded-xl border border-danger/20 bg-danger-soft p-4">
      <div className="flex items-start gap-3">
        <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-danger">{error.title}</p>
          <p className="mt-1 text-sm text-body">{error.message}</p>
          {error.detail && (
            <p className="mt-2 break-words rounded-md bg-panel/70 px-2.5 py-1.5 font-mono text-xs text-muted">
              {error.detail}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function SqlSection({ sql }: { sql: string }): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(sql);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="rounded-xl border border-border bg-panel shadow-soft">
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 sm:px-5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex items-center gap-2 rounded-md py-1 text-sm font-semibold text-ink"
        >
          <ChevronIcon className={`h-4 w-4 text-muted transition-transform duration-150 ${open ? "rotate-90" : ""}`} />
          <CodeIcon className="h-4 w-4 text-muted" />
          Generated SQL
        </button>
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted transition-colors hover:bg-subtle hover:text-ink"
        >
          {copied ? <CheckIcon className="h-3.5 w-3.5 text-success" /> : <CopyIcon className="h-3.5 w-3.5" />}
          <span aria-live="polite">{copied ? "Copied" : "Copy SQL"}</span>
        </button>
      </div>
      {open && (
        <div className="border-t border-border p-3 sm:p-4">
          <SqlCode sql={sql} />
        </div>
      )}
    </section>
  );
}

export function AiResponse({ result }: { result: AskResult }): React.JSX.Element {
  const rows = Array.isArray(result.data) ? result.data : [];
  const columns = result.columns ?? [];

  const views =
    result.data &&
    !Array.isArray(result.data) &&
    Array.isArray(result.data.result)
      ? result.data.result.filter(
          (item): item is string => typeof item === "string"
        )
      : [];

  const failure =
    !result.success || Boolean(result.error)
      ? classifyBackendError(
          result.error ?? "The backend did not return a result."
        )
      : null;

  const hasAnswer = Boolean(result.answer?.trim());
  const hasInsight = Boolean(result.business_insight?.trim());
  const hasReport = Boolean(result.report?.trim());
  const sql = result.generated_sql?.trim() ? result.generated_sql : null;

  return (
    <div className="space-y-4">
      {failure && <ErrorCard error={failure} />}

      {hasAnswer && (
        <Card title="AI Business Assistant">
          <Markdown text={result.answer as string} />

          {result.sources && result.sources.length > 0 && (
            <div className="mt-4 border-t border-border pt-3">
              <p className="mb-2 text-xs font-semibold text-muted">
                Sources
              </p>
              <div className="flex flex-wrap gap-2">
                {result.sources.map((source) => (
                  <span
                    key={source}
                    className="rounded-md bg-subtle px-2.5 py-1 text-xs text-muted"
                  >
                    {source}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {hasInsight && (
        <section className="rounded-xl border border-primary-line border-l-4 border-l-primary bg-primary-soft p-4 sm:p-5">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-link">
            <SparkIcon className="h-4 w-4" />
            Business Insight
          </h3>
          <p className="max-w-[72ch] whitespace-pre-line text-[15px] leading-7 text-ink">
            {result.business_insight}
          </p>
        </section>
      )}

      {hasReport && (
        <Card title="Detailed Report">
          <Markdown text={result.report as string} />
        </Card>
      )}

      {views.length > 0 && (
        <Card title="Available Business Views">
          <ul className="list-inside list-disc space-y-2 text-sm text-body">
            {views.map((view) => (
              <li key={view}>{view}</li>
            ))}
          </ul>
        </Card>
      )}

      {result.success && sql && (
        <Card
          title="Query Results"
          icon={<TableIcon className="h-4 w-4 text-muted" />}
          aside={
            <span className="text-xs text-muted">
              {rows.length.toLocaleString("en-US")}{" "}
              {rows.length === 1 ? "row" : "rows"}
            </span>
          }
        >
          {rows.length > 0 ? (
            <QueryTable columns={columns} data={rows} />
          ) : (
            <p className="rounded-lg border border-dashed border-border-strong px-4 py-8 text-center text-sm text-muted">
              The query ran successfully but returned no rows.
            </p>
          )}
        </Card>
      )}

      {sql && <SqlSection sql={sql} />}
    </div>
  );
}