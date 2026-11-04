import React from "react";

/** Minimal, safe markdown renderer (no HTML injection): headings, paragraphs,
 *  bold, italic, inline code, bullet and numbered lists. */

const INLINE = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*|_[^_\s][^_]*_)/g;

function renderInline(text: string): React.ReactNode[] {
  return text.split(INLINE).map((part, index) => {
    if (part.length > 4 && part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index} className="font-semibold text-ink">{part.slice(2, -2)}</strong>;
    }
    if (part.length > 2 && part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={index} className="rounded bg-subtle px-1.5 py-0.5 font-mono text-[0.85em] text-link">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.length > 2 && ((part.startsWith("*") && part.endsWith("*")) || (part.startsWith("_") && part.endsWith("_")))) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

type Block =
  | { kind: "heading"; level: number; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "ul" | "ol"; items: string[] }
  | { kind: "table"; header: string[]; rows: string[][] };

const SEP = /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?$/;
const cells = (line: string) => line.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
const NUM = /^[-+]?[\d.,\s]+%?$|^R\$\s?[\d.,]+$/;

function parse(text: string): Block[] {
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let list: { kind: "ul" | "ol"; items: string[] } | null = null;

  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ kind: "paragraph", text: paragraph.join(" ") });
    paragraph = [];
  };
  let table: string[][] | null = null;
  const flushTable = () => {
    if (table && table.length) blocks.push({ kind: "table", header: table[0], rows: table.slice(1) });
    table = null;
  };
  const flushList = () => {
    if (list) blocks.push(list);
    list = null;
  };

  for (const raw of text.replace(/\r\n/g, "\n").split("\n")) {
    const line = raw.trim();
    if (!line) {
      flushParagraph();
      flushList();
      flushTable();
      continue;
    }
    if (line.startsWith("|")) {
      flushParagraph();
      flushList();
      if (!table) table = [];
      if (!SEP.test(line)) table.push(cells(line));
      continue;
    }
    flushTable();
    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({ kind: "heading", level: heading[1].length, text: heading[2] });
      continue;
    }
    const bullet = /^[-*•]\s+(.+)$/.exec(line);
    const numbered = /^\d+[.)]\s+(.+)$/.exec(line);
    if (bullet || numbered) {
      flushParagraph();
      const kind = bullet ? "ul" : "ol";
      const content = (bullet ?? numbered)![1];
      if (!list || list.kind !== kind) {
        flushList();
        list = { kind, items: [] };
      }
      list.items.push(content);
      continue;
    }
    flushList();
    paragraph.push(line);
  }
  flushParagraph();
  flushList();
  flushTable();
  return blocks;
}

export function Markdown({ text }: { text: string }): React.JSX.Element {
  const blocks = parse(text);
  return (
    <div className="space-y-3.5 text-[15px] leading-7 text-body">
      {blocks.map((block, index) => {
        switch (block.kind) {
          case "heading":
            return block.level <= 2 ? (
              <h3 key={index} className="border-b border-border pb-1.5 pt-3 text-base font-semibold text-ink first:pt-0">{renderInline(block.text)}</h3>
            ) : (
              <h4 key={index} className="pt-1 text-sm font-semibold text-ink first:pt-0">{renderInline(block.text)}</h4>
            );
          case "paragraph":
            return <p key={index} className="max-w-[72ch]">{renderInline(block.text)}</p>;
          case "table":
            return (
              <div key={index} className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-subtle">
                    <tr>
                      {block.header.map((h, i) => (
                        <th key={i} scope="col" className={`whitespace-nowrap px-3 py-2 text-xs font-semibold text-muted ${i > 0 && block.rows.every((r) => NUM.test(r[i] ?? "")) ? "text-right" : ""}`}>{renderInline(h)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((r, ri) => (
                      <tr key={ri} className="border-t border-border/70">
                        {r.map((c, ci) => (
                          <td key={ci} className={`px-3 py-2 ${ci > 0 && NUM.test(c) ? "text-right tabular-nums text-ink" : ""}`}>{renderInline(c)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "ul":
            return (
              <ul key={index} className="list-disc space-y-1.5 pl-5 marker:text-muted-soft">
                {block.items.map((item, i) => <li key={i}>{renderInline(item)}</li>)}
              </ul>
            );
          case "ol":
            return (
              <ol key={index} className="list-decimal space-y-1.5 pl-5 marker:text-muted">
                {block.items.map((item, i) => <li key={i}>{renderInline(item)}</li>)}
              </ol>
            );
        }
      })}
    </div>
  );
}
