(() => {
  "use strict";

  window.NEWAPI_EXPORT_CSS = `
@import url("https://fonts.googleapis.com/css2?family=Newsreader:wght@400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap");

:root {
  color-scheme: light dark;

  --export-bg: #ffffff;

  --paper: #fafaf8;
  --paper-edge: #e4e4e7;
  --ink: #09090b;
  --muted-ink: #3f3f46;

  --paper-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);

  --paper-line-18: rgba(0, 0, 0, 0.18);
  --paper-line-16: rgba(0, 0, 0, 0.16);
  --paper-line-14: rgba(0, 0, 0, 0.14);
  --paper-line-12: rgba(0, 0, 0, 0.12);

  --paper-ink-92: rgba(0, 0, 0, 0.92);
  --paper-ink-90: rgba(0, 0, 0, 0.9);
  --paper-ink-74: rgba(0, 0, 0, 0.74);
  --paper-ink-72: rgba(0, 0, 0, 0.72);
  --paper-ink-70: rgba(0, 0, 0, 0.7);
  --paper-ink-66: rgba(0, 0, 0, 0.66);
  --paper-ink-62: rgba(0, 0, 0, 0.62);
  --paper-ink-58: rgba(0, 0, 0, 0.58);

  --paper-surface: rgba(255, 255, 255, 0.62);
  --paper-fill-02: rgba(0, 0, 0, 0.02);
  --paper-fill-03: rgba(0, 0, 0, 0.03);
  --paper-fill-06: rgba(0, 0, 0, 0.06);
  --paper-code-bg: rgba(0, 0, 0, 0.06);
  --paper-code-border: rgba(0, 0, 0, 0.08);
  --paper-badge-border: rgba(0, 0, 0, 0.12);

  --font-heading: "Newsreader", "Noto Serif SC", "Source Han Serif SC", "Songti SC", "STSong", "SimSun", Georgia,
    "Times New Roman", serif;
  --font-body: "Roboto", ui-sans-serif, system-ui, -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei",
    sans-serif;
}

@media (prefers-color-scheme: dark) {
  :root {
    --export-bg: #09090b;

    --paper: #0f0f12;
    --paper-edge: rgba(255, 255, 255, 0.12);
    --ink: #f4f4f5;
    --muted-ink: rgba(255, 255, 255, 0.72);

    --paper-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);

    --paper-line-18: rgba(255, 255, 255, 0.18);
    --paper-line-16: rgba(255, 255, 255, 0.16);
    --paper-line-14: rgba(255, 255, 255, 0.14);
    --paper-line-12: rgba(255, 255, 255, 0.12);

    --paper-ink-92: rgba(255, 255, 255, 0.92);
    --paper-ink-90: rgba(255, 255, 255, 0.9);
    --paper-ink-74: rgba(255, 255, 255, 0.74);
    --paper-ink-72: rgba(255, 255, 255, 0.72);
    --paper-ink-70: rgba(255, 255, 255, 0.7);
    --paper-ink-66: rgba(255, 255, 255, 0.66);
    --paper-ink-62: rgba(255, 255, 255, 0.62);
    --paper-ink-58: rgba(255, 255, 255, 0.58);

    --paper-surface: rgba(255, 255, 255, 0.06);
    --paper-fill-02: rgba(255, 255, 255, 0.04);
    --paper-fill-03: rgba(255, 255, 255, 0.06);
    --paper-fill-06: rgba(255, 255, 255, 0.08);
    --paper-code-bg: rgba(255, 255, 255, 0.08);
    --paper-code-border: rgba(255, 255, 255, 0.14);
    --paper-badge-border: rgba(255, 255, 255, 0.18);
  }
}

.paper[data-theme="light"] {
  --export-bg: #ffffff;

  --paper: #fafaf8;
  --paper-edge: #e4e4e7;
  --ink: #09090b;
  --muted-ink: #3f3f46;

  --paper-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);

  --paper-line-18: rgba(0, 0, 0, 0.18);
  --paper-line-16: rgba(0, 0, 0, 0.16);
  --paper-line-14: rgba(0, 0, 0, 0.14);
  --paper-line-12: rgba(0, 0, 0, 0.12);

  --paper-ink-92: rgba(0, 0, 0, 0.92);
  --paper-ink-90: rgba(0, 0, 0, 0.9);
  --paper-ink-74: rgba(0, 0, 0, 0.74);
  --paper-ink-72: rgba(0, 0, 0, 0.72);
  --paper-ink-70: rgba(0, 0, 0, 0.7);
  --paper-ink-66: rgba(0, 0, 0, 0.66);
  --paper-ink-62: rgba(0, 0, 0, 0.62);
  --paper-ink-58: rgba(0, 0, 0, 0.58);

  --paper-surface: rgba(255, 255, 255, 0.62);
  --paper-fill-02: rgba(0, 0, 0, 0.02);
  --paper-fill-03: rgba(0, 0, 0, 0.03);
  --paper-fill-06: rgba(0, 0, 0, 0.06);
  --paper-code-bg: rgba(0, 0, 0, 0.06);
  --paper-code-border: rgba(0, 0, 0, 0.08);
  --paper-badge-border: rgba(0, 0, 0, 0.12);
}

.paper[data-theme="dark"] {
  --export-bg: #09090b;

  --paper: #0f0f12;
  --paper-edge: rgba(255, 255, 255, 0.12);
  --ink: #f4f4f5;
  --muted-ink: rgba(255, 255, 255, 0.72);

  --paper-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);

  --paper-line-18: rgba(255, 255, 255, 0.18);
  --paper-line-16: rgba(255, 255, 255, 0.16);
  --paper-line-14: rgba(255, 255, 255, 0.14);
  --paper-line-12: rgba(255, 255, 255, 0.12);

  --paper-ink-92: rgba(255, 255, 255, 0.92);
  --paper-ink-90: rgba(255, 255, 255, 0.9);
  --paper-ink-74: rgba(255, 255, 255, 0.74);
  --paper-ink-72: rgba(255, 255, 255, 0.72);
  --paper-ink-70: rgba(255, 255, 255, 0.7);
  --paper-ink-66: rgba(255, 255, 255, 0.66);
  --paper-ink-62: rgba(255, 255, 255, 0.62);
  --paper-ink-58: rgba(255, 255, 255, 0.58);

  --paper-surface: rgba(255, 255, 255, 0.06);
  --paper-fill-02: rgba(255, 255, 255, 0.04);
  --paper-fill-03: rgba(255, 255, 255, 0.06);
  --paper-fill-06: rgba(255, 255, 255, 0.08);
  --paper-code-bg: rgba(255, 255, 255, 0.08);
  --paper-code-border: rgba(255, 255, 255, 0.14);
  --paper-badge-border: rgba(255, 255, 255, 0.18);
}

html,
body {
  height: 100%;
}

body {
  margin: 0;
  background: var(--export-bg);
  color: var(--ink);
  font-family: var(--font-body);
}

.page {
  padding: 28px;
  display: grid;
  place-items: start center;
}

.paper {
  --accent: #ec4899;
  --body-columns: 2;
  position: relative;
  width: min(860px, 100%);
  background: var(--paper);
  border: 1px solid var(--paper-edge);
  border-radius: 18px;
  box-shadow: var(--paper-shadow);
  padding: 28px 28px 26px;
}

.news {
  position: relative;
}

.muted {
  color: var(--muted-ink);
}

.masthead {
  display: grid;
  gap: 10px;
  padding-bottom: 14px;
  border-bottom: 3px double var(--paper-line-18);
}

.masthead-name {
  font-family: var(--font-heading);
  font-weight: 700;
  text-align: center;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-size: 30px;
  line-height: 1.1;
}

.issue-line {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--paper-line-14);
  border-bottom: 1px solid var(--paper-line-14);
  padding: 8px 10px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.issue-left,
.issue-right {
  display: inline-flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.kicker {
  color: var(--accent);
  font-weight: 800;
}

.issue-item {
  color: var(--paper-ink-72);
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 999px;
  border: 1px solid var(--paper-badge-border);
  font-weight: 800;
  letter-spacing: 0.12em;
}

.badge.sev-high {
  color: #991b1b;
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.28);
}

.badge.sev-mid {
  color: #92400e;
  background: rgba(245, 158, 11, 0.14);
  border-color: rgba(245, 158, 11, 0.28);
}

.badge.sev-low {
  color: #065f46;
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.26);
}

.headline-wrap {
  padding-top: 14px;
}

.headline {
  margin: 0;
  font-family: var(--font-heading);
  font-weight: 650;
  font-size: 40px;
  line-height: 1.04;
  letter-spacing: -0.02em;
}

.deck {
  margin: 10px 0 0;
  color: var(--paper-ink-66);
  font-size: 16px;
  line-height: 1.55;
  max-width: 70ch;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 20px;
  padding-top: 18px;
}

.article {
  min-width: 0;
}

.article-body {
  column-count: var(--body-columns);
  column-gap: 22px;
  font-size: 14px;
  line-height: 1.8;
}

.article-body p {
  margin: 0 0 12px;
  break-inside: avoid;
}

.article-body h2 {
  column-span: all;
  margin: 18px 0 10px;
  padding-top: 12px;
  border-top: 1px solid var(--paper-line-14);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--paper-ink-70);
}

.story-deck {
  column-span: all;
  margin: 0 0 12px;
  color: var(--paper-ink-62);
  font-size: 13px;
  line-height: 1.6;
}

.article-body ul {
  margin: 0 0 12px;
  padding-left: 18px;
}

.article-body li {
  margin: 0 0 6px;
  break-inside: avoid;
}

.article-body blockquote {
  column-span: all;
  margin: 14px 0;
  padding: 12px 14px;
  border-left: 4px solid var(--accent);
  background: var(--paper-fill-03);
  border-radius: 12px;
  color: var(--paper-ink-74);
}

.article-body hr {
  column-span: all;
  border: none;
  border-top: 1px solid var(--paper-line-12);
  margin: 16px 0;
}

.article-body code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.96em;
  background: var(--paper-code-bg);
  border: 1px solid var(--paper-code-border);
  padding: 0.1em 0.35em;
  border-radius: 8px;
}

.dropcap .article-body p:first-of-type::first-letter {
  font-family: var(--font-heading);
  float: left;
  font-size: 4.5em;
  line-height: 0.86;
  padding-right: 10px;
  padding-top: 4px;
  font-weight: 700;
  color: var(--paper-ink-92);
}

.sidebar {
  display: grid;
  gap: 12px;
  align-content: start;
}

.card-callout {
  border: 1px solid var(--paper-badge-border);
  border-radius: 16px;
  background: var(--paper-surface);
  padding: 12px 12px;
}

.card-title {
  margin: 0 0 10px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-weight: 900;
  color: var(--paper-ink-62);
}

.card-body {
  font-size: 13px;
  line-height: 1.6;
}

.card-body ul {
  margin: 0;
  padding-left: 16px;
}

.card-body li {
  margin: 0 0 6px;
}

.tag-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--paper-badge-border);
  border-radius: 999px;
  padding: 5px 10px;
  background: var(--paper-fill-02);
  font-size: 12px;
}

.paper-footer {
  margin-top: 18px;
  padding-top: 10px;
  border-top: 3px double var(--paper-line-16);
  color: var(--paper-ink-62);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 12px;
}

.footer-right {
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.verify-link {
  color: inherit;
  text-decoration: none;
  border-bottom: 1px dashed currentColor;
  padding-bottom: 1px;
}

.verify-link:hover {
  opacity: 0.9;
}

@media (max-width: 980px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .article-body {
    column-count: 1;
  }
}

@media print {
  @page {
    size: A4;
    margin: 14mm;
  }

  body {
    background: #ffffff;
  }

  .page {
    padding: 0;
  }

  .paper {
    width: auto;
    border: none;
    box-shadow: none;
    border-radius: 0;
    padding: 0;
  }
}
`;
})();

(() => {
  "use strict";

  if (typeof window.NEWAPI_EXPORT_CSS !== "string") return;

  window.NEWAPI_EXPORT_CSS += `

/* ===== Newspaper additions (multi-stories) ===== */

.headline-meta {
  margin-top: 8px;
  font-size: 12px;
  color: var(--paper-ink-58);
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.article-body .story-title {
  column-span: all;
  margin: 22px 0 10px;
  padding-top: 16px;
  border-top: 3px double var(--paper-line-18);
  font-family: var(--font-heading);
  font-size: 22px;
  line-height: 1.18;
  letter-spacing: -0.01em;
  text-transform: none;
  color: var(--paper-ink-90);
}

.article-body .story-meta {
  column-span: all;
  margin: -4px 0 12px;
  font-size: 12px;
  color: var(--paper-ink-58);
  text-transform: uppercase;
  letter-spacing: 0.12em;
}
`;
})();
