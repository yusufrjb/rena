import React from "react";

const KEYWORDS = new Set(
  (
    "SELECT FROM WHERE AND OR NOT IN LIKE ILIKE IS NULL JOIN INNER LEFT RIGHT FULL OUTER CROSS ON GROUP BY ORDER HAVING " +
    "LIMIT OFFSET AS CASE WHEN THEN ELSE END UNION ALL DISTINCT WITH EXISTS ASC DESC BETWEEN OVER PARTITION " +
    "TRUE FALSE INTERVAL NULLS FIRST LAST"
  ).split(" ")
);

type Token = { text: string; cls: string };

function tokenize(sql: string): Token[] {
  const tokens: Token[] = [];
  const pattern =
    /(--[^\n]*)|('(?:[^']|'')*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)|(\s+)|([\s\S])/g;
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(sql)) !== null) {
    const text = m[0];
    if (m[1]) tokens.push({ text, cls: "text-slate-500 italic" });
    else if (m[2]) tokens.push({ text, cls: "text-emerald-300" });
    else if (m[3]) tokens.push({ text, cls: "text-amber-300" });
    else if (m[4]) {
      const isFn = sql[pattern.lastIndex] === "(";
      tokens.push({
        text,
        cls: KEYWORDS.has(text.toUpperCase())
          ? "text-sky-300 font-medium"
          : isFn
            ? "text-blue-300"
            : "text-slate-100",
      });
    } else tokens.push({ text, cls: m[5] ? "" : "text-slate-500" });
  }
  return tokens;
}

export function SqlCode({ sql }: { sql: string }): React.JSX.Element {
  const lineCount = sql.split("\n").length;
  return (
    <div className="overflow-hidden rounded-lg border border-slate-700/60 bg-code ring-1 ring-black/5">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2 text-xs text-slate-400">
        <span className="h-2 w-2 rounded-full bg-sky-400" aria-hidden="true" />
        PostgreSQL · read-only
      </div>
      <div className="flex max-h-96 overflow-auto font-mono text-[13px] leading-6">
        <div aria-hidden="true" className="select-none border-r border-white/10 px-3 py-4 text-right text-slate-600">
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <pre className="flex-1 p-4" tabIndex={0}>
          <code>
            {tokenize(sql).map((t, i) => (
              <span key={i} className={t.cls}>{t.text}</span>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}
