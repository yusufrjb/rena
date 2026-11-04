import React from "react";
import type { Row } from "@/app/lib/types";
import { formatCell, humanizeColumn, isNumeric } from "@/app/lib/format";

type Props = { columns: string[]; data: Row[] };

export function QueryTable({ columns, data }: Props): React.JSX.Element {
  const cols = columns.length > 0 ? columns : Object.keys(data[0] ?? {});
  const numericCols = new Set(cols.filter((c) => data.some((r) => isNumeric(r[c]))));

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="max-h-[26rem] overflow-auto" tabIndex={0} role="region" aria-label="Query results table">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-subtle shadow-[0_1px_0_var(--color-border)]">
            <tr>
              {cols.map((col, ci) => (
                <th
                  key={col}
                  scope="col"
                  className={`whitespace-nowrap px-4 py-2.5 text-xs font-semibold capitalize text-muted ${
                    numericCols.has(col) ? "text-right" : ""
                  } ${ci === 0 ? "sticky left-0 bg-subtle" : ""}`}
                >
                  {humanizeColumn(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="[&>tr:nth-child(even)]:bg-subtle/40">
            {data.map((row, i) => (
              <tr key={i} className="border-b border-border/70 transition-colors last:border-0 hover:bg-primary-soft/60">
                {cols.map((col, ci) => {
                  const v = row[col];
                  const empty = v === null || v === undefined;
                  return (
                    <td
                      key={col}
                      className={`whitespace-nowrap px-4 py-2 ${
                        isNumeric(v) ? "text-right tabular-nums text-ink" : "text-body"
                      } ${empty ? "text-muted-soft" : ""} ${ci === 0 ? "sticky left-0 bg-panel font-medium text-ink" : ""}`}
                    >
                      {formatCell(v)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length > 8 && (
        <p className="border-t border-border bg-subtle px-4 py-1.5 text-xs text-muted">Scroll to see all {data.length.toLocaleString("en-US")} rows</p>
      )}
    </div>
  );
}
