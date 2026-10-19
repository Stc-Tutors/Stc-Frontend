import React from "react";

// A small, dependency-free Markdown renderer for the manuals and the handover note. It builds React elements directly (no
// dangerouslySetInnerHTML), so nothing in a document can inject markup or script. It supports exactly what those documents use:
// headings, paragraphs, bullet/numbered lists (one nested level), tables, block quotes, fenced code, horizontal rules, and the
// inline forms **bold**, *italic*, `code` and [links](url). Anything else is shown as plain text.

export interface TocItem {
  id: string;
  level: 1 | 2 | 3;
  text: string;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[`*_]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// Links may only be web addresses, mail links or in-page/relative paths. Anything else (javascript:, data:, ...) is dropped.
function safeHref(href: string): string | null {
  const h = href.trim();
  if (/^(https?:\/\/|mailto:|\/|#)/i.test(h)) return h;
  return null;
}

const INLINE = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*|\[[^\]]+\]\([^)]+\))/g;

export function renderInline(text: string, keyPrefix = "i"): React.ReactNode[] {
  const unescaped = text.replace(/\\\|/g, "|");
  const parts = unescaped.split(INLINE).filter((p) => p !== "");
  return parts.map((part, idx) => {
    const key = `${keyPrefix}-${idx}`;
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={key} className="font-semibold text-gray-900 dark:text-gray-100">
          {renderInline(part.slice(2, -2), key)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code key={key} className="rounded bg-gray-100 px-1 py-0.5 font-mono text-[0.85em] text-gray-800 dark:bg-gray-800 dark:text-gray-200">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={key}>{renderInline(part.slice(1, -1), key)}</em>;
    }
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (link) {
      const href = safeHref(link[2]);
      if (!href) return <span key={key}>{link[1]}</span>;
      const external = /^https?:/i.test(href);
      return (
        <a
          key={key}
          href={href}
          className="text-blue-700 underline underline-offset-2 hover:text-blue-900 dark:text-blue-400"
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {link[1]}
        </a>
      );
    }
    return <React.Fragment key={key}>{part}</React.Fragment>;
  });
}

export type Block =
  | { type: "heading"; level: 1 | 2 | 3 | 4; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: { text: string; children: string[] }[] }
  | { type: "table"; header: string[]; rows: string[][] }
  | { type: "quote"; text: string }
  | { type: "code"; text: string }
  | { type: "hr" };

function splitRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  const cells: string[] = [];
  let current = "";
  for (let i = 0; i < trimmed.length; i++) {
    const c = trimmed[i];
    if (c === "\\" && trimmed[i + 1] === "|") {
      current += "\\|";
      i++;
    } else if (c === "|") {
      cells.push(current.trim());
      current = "";
    } else current += c;
  }
  cells.push(current.trim());
  return cells;
}

export function parseBlocks(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || /^\s*<!--.*-->\s*$/.test(line)) {
      i++;
      continue;
    }
    if (/^```/.test(line)) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++;
      blocks.push({ type: "code", text: buf.join("\n") });
      continue;
    }
    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    if (h) {
      blocks.push({ type: "heading", level: h[1].length as 1 | 2 | 3 | 4, text: h[2].trim() });
      i++;
      continue;
    }
    if (/^\s*---+\s*$/.test(line)) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }
    if (/^\s*\|/.test(line) && i + 1 < lines.length && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1])) {
      const header = splitRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) rows.push(splitRow(lines[i++]));
      blocks.push({ type: "table", header, rows });
      continue;
    }
    if (/^>\s?/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ""));
      blocks.push({ type: "quote", text: buf.join(" ") });
      continue;
    }
    const li = /^(\s*)([-*]|\d+\.)\s+(.*)$/.exec(line);
    if (li) {
      const ordered = /\d+\./.test(li[2]);
      const items: { text: string; children: string[] }[] = [];
      while (i < lines.length) {
        const m = /^(\s*)([-*]|\d+\.)\s+(.*)$/.exec(lines[i]);
        if (!m) {
          // A wrapped continuation line of the previous item (indented text, not a new block).
          if (items.length && /^\s{2,}\S/.test(lines[i]) && lines[i].trim()) {
            items[items.length - 1].text += " " + lines[i].trim();
            i++;
            continue;
          }
          break;
        }
        if (m[1].length >= 2 && items.length) items[items.length - 1].children.push(m[3]);
        else items.push({ text: m[3], children: [] });
        i++;
      }
      blocks.push({ type: "list", ordered, items });
      continue;
    }
    const buf: string[] = [line.trim()];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,4}\s|```|>\s?|\s*\|)/.test(lines[i]) &&
      !/^\s*([-*]|\d+\.)\s+/.test(lines[i]) &&
      !/^\s*---+\s*$/.test(lines[i])
    ) {
      buf.push(lines[i++].trim());
    }
    blocks.push({ type: "paragraph", text: buf.join(" ") });
  }
  return blocks;
}

// Heading ids must be produced the same way here and in <Markdown>, or in-page links and search results would point nowhere.
function headingIds(blocks: Block[], idPrefix: string): Map<number, string> {
  const seen = new Map<string, number>();
  const ids = new Map<number, string>();
  blocks.forEach((b, idx) => {
    if (b.type !== "heading") return;
    const base = `${idPrefix}-${slugify(b.text) || "section"}`;
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    ids.set(idx, n === 0 ? base : `${base}-${n}`);
  });
  return ids;
}

export function buildToc(markdown: string, idPrefix: string): TocItem[] {
  const blocks = parseBlocks(markdown);
  const ids = headingIds(blocks, idPrefix);
  const toc: TocItem[] = [];
  blocks.forEach((b, idx) => {
    if (b.type === "heading" && b.level <= 3) toc.push({ id: ids.get(idx)!, level: b.level as 1 | 2 | 3, text: b.text.replace(/[`*]/g, "") });
  });
  return toc;
}

export interface SearchEntry {
  headingId: string;
  heading: string;
  text: string;
}

// One entry per block of readable text, tagged with the nearest heading above it, so a search hit can jump straight to its section.
export function buildSearchIndex(markdown: string, idPrefix: string): SearchEntry[] {
  const blocks = parseBlocks(markdown);
  const ids = headingIds(blocks, idPrefix);
  const out: SearchEntry[] = [];
  let current = { id: "", text: "" };
  blocks.forEach((b, idx) => {
    if (b.type === "heading") {
      current = { id: ids.get(idx)!, text: b.text.replace(/[`*]/g, "") };
      out.push({ headingId: current.id, heading: current.text, text: current.text });
    } else if (b.type === "paragraph" || b.type === "quote") {
      out.push({ headingId: current.id, heading: current.text, text: b.text.replace(/[`*]/g, "") });
    } else if (b.type === "list") {
      for (const item of b.items) out.push({ headingId: current.id, heading: current.text, text: [item.text, ...item.children].join(" ").replace(/[`*]/g, "") });
    } else if (b.type === "table") {
      for (const row of b.rows) out.push({ headingId: current.id, heading: current.text, text: row.join(" - ").replace(/[`*]/g, "") });
    }
  });
  return out;
}

export function Markdown({ markdown, idPrefix }: { markdown: string; idPrefix: string }) {
  const blocks = parseBlocks(markdown);
  const seen = new Map<string, number>();
  return (
    <div className="manual-prose text-[15px] leading-7 text-gray-700 dark:text-gray-300">
      {blocks.map((b, idx) => {
        const key = `${idPrefix}-b${idx}`;
        switch (b.type) {
          case "heading": {
            const base = `${idPrefix}-${slugify(b.text) || "section"}`;
            const n = seen.get(base) ?? 0;
            seen.set(base, n + 1);
            const id = n === 0 ? base : `${base}-${n}`;
            if (b.level === 1)
              return (
                <h1 id={id} key={key} className="scroll-mt-24 mb-4 mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
                  {renderInline(b.text, key)}
                </h1>
              );
            if (b.level === 2)
              return (
                <h2 id={id} key={key} className="scroll-mt-24 mb-3 mt-10 border-b border-gray-200 pb-2 text-2xl font-semibold text-gray-900 dark:border-gray-700 dark:text-gray-50">
                  {renderInline(b.text, key)}
                </h2>
              );
            if (b.level === 3)
              return (
                <h3 id={id} key={key} className="scroll-mt-24 mb-2 mt-7 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {renderInline(b.text, key)}
                </h3>
              );
            return (
              <h4 id={id} key={key} className="scroll-mt-24 mb-1 mt-5 text-base font-semibold text-gray-800 dark:text-gray-200">
                {renderInline(b.text, key)}
              </h4>
            );
          }
          case "paragraph":
            return (
              <p key={key} className="my-3">
                {renderInline(b.text, key)}
              </p>
            );
          case "list": {
            const Tag = b.ordered ? "ol" : "ul";
            return (
              <Tag key={key} className={`my-3 space-y-1.5 pl-6 ${b.ordered ? "list-decimal" : "list-disc"} marker:text-gray-400`}>
                {b.items.map((item, j) => (
                  <li key={`${key}-${j}`}>
                    {renderInline(item.text, `${key}-${j}`)}
                    {item.children.length > 0 && (
                      <ul className="mt-1 list-[circle] space-y-1 pl-5">
                        {item.children.map((c, k) => (
                          <li key={`${key}-${j}-${k}`}>{renderInline(c, `${key}-${j}-${k}`)}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </Tag>
            );
          }
          case "table":
            return (
              <div key={key} className="my-4 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="min-w-full border-collapse text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      {b.header.map((c, j) => (
                        <th key={j} className="border-b border-gray-200 px-3 py-2 font-semibold text-gray-900 dark:border-gray-700 dark:text-gray-100">
                          {renderInline(c, `${key}-h${j}`)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((r, j) => (
                      <tr key={j} className="align-top odd:bg-white even:bg-gray-50/60 dark:odd:bg-transparent dark:even:bg-gray-800/40">
                        {r.map((c, k) => (
                          <td key={k} className="border-b border-gray-100 px-3 py-2 dark:border-gray-800">
                            {renderInline(c, `${key}-${j}-${k}`)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "quote":
            return (
              <blockquote key={key} className="my-4 rounded-r-lg border-l-4 border-blue-400 bg-blue-50 px-4 py-2 text-gray-700 dark:bg-blue-950/40 dark:text-gray-300">
                {renderInline(b.text, key)}
              </blockquote>
            );
          case "code":
            return (
              <pre key={key} className="my-4 overflow-x-auto rounded-lg bg-gray-900 p-4 text-[13px] leading-6 text-gray-100">
                <code>{b.text}</code>
              </pre>
            );
          case "hr":
            return <hr key={key} className="my-8 border-gray-200 dark:border-gray-700" />;
        }
      })}
    </div>
  );
}
