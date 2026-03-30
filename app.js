﻿(() => {
  "use strict";

  const STORAGE_KEY = "newapi-announcement-generator:v2";
  const LEGACY_STORAGE_KEY = "newapi-announcement-generator:v1";
  const AI_SETTINGS_KEY = "newapi-announcement-generator:ai:v1";


  const APP_VERSION = "v1.0.1";
  const OFFICIAL_REPO_OWNER = "SOYS1";
  const OFFICIAL_REPO_URL = "https://github.com/SOYS1/newapi-Announcement";
  const DEFAULT_MASTHEAD = "newapi-Announcement";

  const DEFAULT_STORY = () => ({
    title: "",
    subtitle: "",
    time: "",
    format: "markdown", // markdown | html
    summary: "",
    body: "",
  });

  const DEFAULT_STATE = {
    masthead: DEFAULT_MASTHEAD,
    type: "产品更新",
    date: "",
    dept: "",
    severity: "中",
    version: "",
    issue: "",
    tags: "",
    highlights: "",
    schedule: "",
    stories: [DEFAULT_STORY()],
    optDropcap: true,
    columns: "2",
    accent: "#EC4899",
    paperTheme: "system",
  };

  const SAMPLE_STATE = {
    masthead: DEFAULT_MASTHEAD,
    type: "安全公告",
    date: new Date().toISOString().slice(0, 10),
    dept: "安全响应",
    severity: "高",
    version: "里程碑#21",
    issue: "SA-2026-03",
    tags: "密钥轮换, 权限收敛, 风险提示",
    highlights: "- 必做：24h 内完成 API Key 轮换\n- 变更：默认权限改为最小集合\n- 新增：异常访问告警与审计字段",
    schedule: "- 2026-03-20 22:00 开始轮换\n- 2026-03-21 12:00 完成自查与灰度\n- 2026-03-21 22:00 旧 Key 分批失效",
    stories: [
      {
        title: "API Key 轮换与权限收敛（必须执行）",
        subtitle: "减少误用风险，提升可追溯性。",
        time: "2026-03-20 22:00",
        format: "markdown",
        summary:
          "我们将对历史 Key 做权限收敛，并要求在 24 小时内完成轮换。\n\n若你们的服务依赖‘全量权限’，请尽快按最小权限重新配置。",
        body:
          "## 影响范围\n- 旧 Key：将于 2026-03-21 22:00 起分批失效\n- 新 Key：默认仅包含必要权限（可在控制台调整）\n\n## 你需要做什么\n- 创建新 Key：命名包含服务名/环境，按最小权限勾选\n- 替换配置：优先灰度 10% 流量，观察无异常后再全量\n- 禁用旧 Key：确认无 401/403 后再下线\n\n## 如何验证\n- 关注调用日志中的 401/403\n- 通过响应头 `x-newapi-request-id` 进行排查\n\n> 建议：先在测试环境验证，再上生产。",
      },
      {
        title: "权限变更说明",
        subtitle: "常见场景与建议配置。",
        time: "",
        format: "html",
        summary: "以下为常见调用场景的权限建议（可按业务拆分多个 Key）。",
        body:
          "<p><strong>建议做法</strong></p>\n<ul>\n  <li><strong>按服务拆分</strong>：每个服务/环境使用独立 Key</li>\n  <li><strong>按权限拆分</strong>：读写分离，避免共享高权限 Key</li>\n  <li><strong>定期轮换</strong>：建议每 90 天轮换一次</li>\n</ul>\n<p><strong>排查提示</strong></p>\n<ul>\n  <li>遇到 <code>403</code>：优先检查 Key 权限是否勾选</li>\n  <li>遇到 <code>429</code>：检查是否触发限流策略</li>\n</ul>",
      },
      {
        title: "回滚与支持",
        subtitle: "遇到问题如何快速恢复。",
        time: "",
        format: "markdown",
        summary: "如出现大面积失败，可先回滚到旧 Key（短期）并联系我们协助定位。",
        body:
          "## 临时回滚\n- 将配置切回旧 Key（仅作为短期应急）\n- 保留错误日志与 `x-newapi-request-id`\n\n## 联系方式\n- 请在值班群同步：服务名 / 环境 / 时间范围 / 请求 ID\n- 我们会在 30 分钟内响应",
      },
    ],
    optDropcap: true,
    columns: "2",
    accent: "#2563EB",
    paperTheme: "system",
  };
  const $ = (id) => document.getElementById(id);

  let statusEl = null;
  let previewEl = null;
  let previewMetaEl = null;
  let previewPaneEl = null;
  let codePaneEl = null;
  let codeEl = null;
  let tabPreviewEl = null;
  let tabCodeEl = null;

  let formEls = {};
  let actionEls = {};
  let aiEls = {};
  let actionModalEls = {};
  let copyModalEls = {};

  let previewMode = "preview";
  let lastRenderedState = null;
  let onActionModalSelect = null;

  const resolveDomRefs = () => {
    statusEl = $("status");
    previewEl = $("preview");
    previewMetaEl = $("previewMeta");

    previewPaneEl = $("previewPane");
    codePaneEl = $("codePane");
    codeEl = $("previewCode");
    tabPreviewEl = $("tabPreview");
    tabCodeEl = $("tabCode");

    formEls = {
      masthead: $("masthead"),
      type: $("type"),
      date: $("date"),
      dept: $("dept"),
      severity: $("severity"),
      version: $("version"),
      issue: $("issue"),
      tags: $("tags"),
      highlights: $("highlights"),
      schedule: $("schedule"),
      optDropcap: $("optDropcap"),
      columns: $("columns"),
      accent: $("accent"),
      paperTheme: $("paperTheme"),
      stories: $("stories"),
    };

    actionEls = {
      sample: $("btnSample"),
      reset: $("btnReset"),
      import: $("btnImport"),
      importFile: $("fileImport"),
      copy: $("btnCopy"),
      export: $("btnExport"),
      print: $("btnPrint"),
      addStory: $("btnAddStory"),
      aiGenerate: $("btnAiGenerate"),
    };

    aiEls = {
      prompt: $("aiPrompt"),
      count: $("aiCount"),
      baseUrl: $("aiBaseUrl"),
      model: $("aiModel"),
      apiKey: $("aiApiKey"),
      remember: $("aiRemember"),
    };

    actionModalEls = {
      root: $("actionModal"),
      title: $("actionModalTitle"),
      options: $("actionModalOptions"),
      close: $("btnActionModalClose"),
    };

    copyModalEls = {
      root: $("copyModal"),
      title: $("copyModalTitle"),
      text: $("copyModalText"),
      close: $("btnCopyModalClose"),
      select: $("btnCopyModalSelect"),
      copy: $("btnCopyModalCopy"),
    };
  };

  const todayISO = () => new Date().toISOString().slice(0, 10);

  const safeStorage = {
    get(key) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        return JSON.parse(raw);
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // ignore
      }
    },
    clear(key) {
      try {
        localStorage.removeItem(key);
      } catch {
        // ignore
      }
    },
  };

  let statusTimer = null;
  const flashStatus = (message, ms = 1800) => {
    if (!statusEl) return;
    if (statusTimer) window.clearTimeout(statusTimer);
    statusEl.textContent = message || "";
    if (!message) return;
    statusTimer = window.setTimeout(() => {
      statusEl.textContent = "";
    }, ms);
  };

  const eventTargetElement = (event) => {
    const target = event ? event.target : null;
    if (target instanceof Element) return target;
    if (target && typeof target === "object" && "parentElement" in target) {
      const parent = target.parentElement;
      if (parent instanceof Element) return parent;
    }
    return null;
  };

  const escapeHtml = (value) => {
    return String(value || "").replace(/[&<>"']/g, (ch) => {
      switch (ch) {
        case "&":
          return "&amp;";
        case "<":
          return "&lt;";
        case ">":
          return "&gt;";
        case '"':
          return "&quot;";
        case "'":
          return "&#39;";
        default:
          return ch;
      }
    });
  };

  const normalizeHexColor = (value, fallback) => {
    const v = String(value || "").trim();
    if (/^#[0-9a-fA-F]{6}$/.test(v)) return v;
    return fallback;
  };

  const normalizeStory = (raw) => {
    const r = raw && typeof raw === "object" ? raw : {};
    const format = String(r.format || "markdown").trim().toLowerCase();
    return {
      title: String(r.title || "").trim(),
      subtitle: String(r.subtitle || "").trim(),
      time: String(r.time || "").trim(),
      format: format === "html" ? "html" : "markdown",
      summary: String(r.summary || "").replace(/\r\n/g, "\n").trim(),
      body: String(r.body || "").replace(/\r\n/g, "\n").trim(),
    };
  };

  const normalizeState = (raw) => {
    const r = raw && typeof raw === "object" ? raw : {};

    const severity = ["高", "中", "低"].includes(String(r.severity)) ? String(r.severity) : "中";
    const paperTheme = ["system", "light", "dark"].includes(String(r.paperTheme)) ? String(r.paperTheme) : DEFAULT_STATE.paperTheme;
    const stories = Array.isArray(r.stories) ? r.stories.map(normalizeStory) : [];

    return {
      masthead: String(r.masthead || DEFAULT_MASTHEAD).trim() || DEFAULT_MASTHEAD,
      type: String(r.type || DEFAULT_STATE.type).trim() || DEFAULT_STATE.type,
      date: String(r.date || "").trim(),
      dept: String(r.dept || "").trim(),
      severity,
      version: String(r.version || "").trim(),
      issue: String(r.issue || "").trim(),
      tags: String(r.tags || "").trim(),
      highlights: String(r.highlights || "").replace(/\r\n/g, "\n").trim(),
      schedule: String(r.schedule || "").replace(/\r\n/g, "\n").trim(),
      stories: stories.length ? stories : [DEFAULT_STORY()],
      optDropcap: r.optDropcap === false ? false : Boolean(r.optDropcap),
      columns: ["1", "2", "3"].includes(String(r.columns)) ? String(r.columns) : "2",
      accent: normalizeHexColor(r.accent, DEFAULT_STATE.accent),
      paperTheme,
    };
  };

  const parseLines = (value, maxItems = 20) => {
    return String(value || "")
      .replace(/\r\n/g, "\n")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.replace(/^[-*]\s+/, ""))
      .slice(0, maxItems);
  };

  const parseTags = (value, maxItems = 20) => {
    return String(value || "")
      .split(/[,，]/)
      .map((x) => x.trim())
      .filter(Boolean)
      .slice(0, maxItems);
  };

  const formatDate = (isoDate) => {
    const v = String(isoDate || "").trim();
    const m = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return "";
    return `${m[1]}.${m[2]}.${m[3]}`;
  };

  const sanitizeFileName = (value) => {
    const raw = String(value || "")
      .replace(/[\\/:*?"<>|]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!raw) return "announcement";
    return raw.slice(0, 60);
  };
  const updateStorySummaryTitle = (cardEl) => {
    const titleInput = cardEl.querySelector('[data-field="title"]');
    const title = titleInput ? String(titleInput.value || "").trim() : "";
    const titleSpan = cardEl.querySelector('[data-role="story-title"]');
    if (titleSpan) titleSpan.textContent = title || "未命名标题";
  };

  const renderStoryCard = (story, index, total) => {
    const st = normalizeStory(story);
    const indexText = `#${index + 1}${index === 0 ? " 头条" : ""}`;

    const disableUp = index <= 0;
    const disableDown = index >= total - 1;
    const disableDelete = total <= 1;

    return `
<details class="story-card" data-index="${index}"${index === 0 ? " open" : ""}>
  <summary>
    <div class="story-summary-left">
      <div class="story-index">${escapeHtml(indexText)}</div>
      <div class="story-summary-title" data-role="story-title">${escapeHtml(st.title || "未命名标题")}</div>
    </div>
    <div class="story-controls">
      <button class="btn btn-ghost btn-mini" type="button" data-action="up"${disableUp ? " disabled" : ""}>上移</button>
      <button class="btn btn-ghost btn-mini" type="button" data-action="down"${disableDown ? " disabled" : ""}>下移</button>
      <button class="btn btn-danger btn-mini" type="button" data-action="delete"${disableDelete ? " disabled" : ""}>删除</button>
    </div>
  </summary>

  <div class="story-body">
    <div class="grid-2">
      <div class="field">
        <label>标题</label>
        <input class="input" data-field="title" maxlength="60" value="${escapeHtml(st.title)}" placeholder="例如：版本发布 / 系统通知" />
      </div>
      <div class="field">
        <label>副标题（可选）</label>
        <input class="input" data-field="subtitle" maxlength="120" value="${escapeHtml(st.subtitle)}" placeholder="例如：一句话概括亮点" />
      </div>
    </div>

    <div class="grid-2">
      <div class="field">
        <label>时间（可选）</label>
        <input class="input" data-field="time" maxlength="30" value="${escapeHtml(st.time)}" placeholder="例如：2026-03-19 00:30" />
      </div>
      <div class="field">
        <label>正文格式</label>
        <select class="input" data-field="format">
          <option value="markdown"${st.format === "markdown" ? " selected" : ""}>Markdown</option>
          <option value="html"${st.format === "html" ? " selected" : ""}>HTML</option>
        </select>
      </div>
    </div>

    <div class="field">
      <label>摘要（可选）</label>
      <textarea class="input textarea" rows="4" data-field="summary" placeholder="可写几行摘要（会以引用块样式展示）">${escapeHtml(
        st.summary
      )}</textarea>
    </div>

    <div class="field">
      <label>正文</label>
      <textarea class="input textarea" rows="8" data-field="body" placeholder="支持 Markdown 或 HTML（取决于上方格式）">${escapeHtml(
        st.body
      )}</textarea>
    </div>
  </div>
</details>
    `.trim();
  };

  const renderStoriesToDom = (stories) => {
    if (!formEls.stories) return;
    const list = Array.isArray(stories) ? stories.map(normalizeStory) : [];
    const items = list.length ? list : [DEFAULT_STORY()];

    formEls.stories.innerHTML = items.map((st, idx) => renderStoryCard(st, idx, items.length)).join("\n");

    Array.from(formEls.stories.querySelectorAll("details.story-card")).forEach((card) => updateStorySummaryTitle(card));
  };

  const readStoriesFromDom = () => {
    const root = formEls.stories;
    if (!root) return [DEFAULT_STORY()];

    const cards = Array.from(root.querySelectorAll("details.story-card"));
    if (!cards.length) return [DEFAULT_STORY()];

    return cards.map((card) => {
      const getValue = (selector) => {
        const el = card.querySelector(selector);
        return el && "value" in el ? String(el.value || "") : "";
      };

      return normalizeStory({
        title: getValue('[data-field="title"]'),
        subtitle: getValue('[data-field="subtitle"]'),
        time: getValue('[data-field="time"]'),
        format: getValue('[data-field="format"]'),
        summary: getValue('[data-field="summary"]'),
        body: getValue('[data-field="body"]'),
      });
    });
  };

  const readFormState = () => {
    return normalizeState({
      masthead: formEls.masthead ? formEls.masthead.value : "",
      type: formEls.type ? formEls.type.value : "",
      date: formEls.date ? formEls.date.value : "",
      dept: formEls.dept ? formEls.dept.value : "",
      severity: formEls.severity ? formEls.severity.value : "中",
      version: formEls.version ? formEls.version.value : "",
      issue: formEls.issue ? formEls.issue.value : "",
      tags: formEls.tags ? formEls.tags.value : "",
      highlights: formEls.highlights ? formEls.highlights.value : "",
      schedule: formEls.schedule ? formEls.schedule.value : "",
      stories: readStoriesFromDom(),
      optDropcap: formEls.optDropcap ? formEls.optDropcap.checked : true,
      columns: formEls.columns ? formEls.columns.value : "2",
      accent: formEls.accent ? formEls.accent.value : DEFAULT_STATE.accent,
      paperTheme: formEls.paperTheme ? formEls.paperTheme.value : DEFAULT_STATE.paperTheme,
    });
  };

  const applyStateToForm = (state) => {
    const s = normalizeState(state);

    if (formEls.masthead) formEls.masthead.value = s.masthead;
    if (formEls.type) formEls.type.value = s.type;
    if (formEls.date) formEls.date.value = s.date;
    if (formEls.dept) formEls.dept.value = s.dept;
    if (formEls.severity) formEls.severity.value = s.severity;
    if (formEls.version) formEls.version.value = s.version;
    if (formEls.issue) formEls.issue.value = s.issue;
    if (formEls.tags) formEls.tags.value = s.tags;
    if (formEls.highlights) formEls.highlights.value = s.highlights;
    if (formEls.schedule) formEls.schedule.value = s.schedule;

    if (formEls.optDropcap) formEls.optDropcap.checked = s.optDropcap;

    if (formEls.columns) formEls.columns.value = s.columns;
    if (formEls.accent) formEls.accent.value = s.accent;
    if (formEls.paperTheme) formEls.paperTheme.value = s.paperTheme;

    renderStoriesToDom(s.stories);
  };
  const sanitizeHtml = (html) => {
    const input = String(html || "");
    if (!input.trim()) return "";

    const doc = new DOMParser().parseFromString(`<div>${input}</div>`, "text/html");
    const root = doc.body.firstElementChild;
    if (!root) return "";

    const blockedTags = ["script", "style", "iframe", "object", "embed", "link", "meta", "base"];
    root.querySelectorAll(blockedTags.join(",")).forEach((el) => el.remove());

    root.querySelectorAll("*").forEach((el) => {
      Array.from(el.attributes).forEach((attr) => {
        const name = attr.name;
        const value = attr.value || "";

        if (/^on/i.test(name)) el.removeAttribute(name);
        if (name === "style") el.removeAttribute(name);
        if ((name === "href" || name === "src") && /^\s*javascript:/i.test(value)) el.removeAttribute(name);
      });
    });

    return root.innerHTML;
  };

  const renderInlineMarkdown = (raw) => {
    const input = String(raw || "");

    const codeSpans = [];
    const withCodePlaceholders = input.replace(/`([^`]+)`/g, (_, code) => {
      const idx = codeSpans.length;
      codeSpans.push(code);
      return `\u0000CODE${idx}\u0000`;
    });

    let out = escapeHtml(withCodePlaceholders);

    out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    out = out.replace(/\*([^*]+)\*/g, "<em>$1</em>");

    out = out.replace(/\u0000CODE(\d+)\u0000/g, (_, idxRaw) => {
      const idx = Number(idxRaw);
      const code = codeSpans[idx] ?? "";
      return `<code>${escapeHtml(code)}</code>`;
    });

    return out;
  };

  const renderMarkdown = (markdown) => {
    const lines = String(markdown || "").replace(/\r\n/g, "\n").split("\n");

    const blocks = [];
    const isRule = (line) => /^-{3,}$/.test(line.trim());
    const isHeading = (line) => /^#{1,3}\s+/.test(line.trim());
    const isQuote = (line) => /^>\s+/.test(line.trim());
    const isList = (line) => /^-\s+/.test(line.trim());

    let index = 0;
    while (index < lines.length) {
      const rawLine = lines[index];
      const line = rawLine.trimEnd();
      const trimmed = line.trim();

      if (!trimmed) {
        index += 1;
        continue;
      }

      if (isRule(trimmed)) {
        blocks.push({ type: "hr" });
        index += 1;
        continue;
      }

      if (isHeading(trimmed)) {
        const m = trimmed.match(/^(#{1,3})\s+(.*)$/);
        const level = m ? m[1].length : 2;
        const text = m ? m[2] : trimmed;
        blocks.push({ type: "heading", level, text });
        index += 1;
        continue;
      }

      if (isQuote(trimmed)) {
        const buf = [];
        while (index < lines.length && isQuote(lines[index].trim())) {
          buf.push(lines[index].trim().replace(/^>\s+/, ""));
          index += 1;
        }
        blocks.push({ type: "quote", lines: buf });
        continue;
      }

      if (isList(trimmed)) {
        const items = [];
        while (index < lines.length && isList(lines[index].trim())) {
          items.push(lines[index].trim().replace(/^-\s+/, ""));
          index += 1;
        }
        blocks.push({ type: "list", items });
        continue;
      }

      const buf = [];
      while (index < lines.length) {
        const curr = lines[index].trimEnd();
        const t = curr.trim();
        if (!t) {
          index += 1;
          break;
        }
        if (isRule(t) || isHeading(t) || isQuote(t) || isList(t)) break;
        buf.push(curr);
        index += 1;
      }

      blocks.push({ type: "para", lines: buf });
    }

    return blocks
      .map((block) => {
        if (block.type === "hr") return "<hr />";

        if (block.type === "heading") {
          const level = block.level === 1 ? 2 : block.level === 3 ? 3 : 2;
          return `<h${level}>${renderInlineMarkdown(block.text)}</h${level}>`;
        }

        if (block.type === "quote") {
          const text = block.lines.map((x) => renderInlineMarkdown(x)).join("<br />");
          return `<blockquote>${text}</blockquote>`;
        }

        if (block.type === "list") {
          const items = block.items.map((x) => `<li>${renderInlineMarkdown(x)}</li>`).join("");
          return `<ul>${items}</ul>`;
        }

        if (block.type === "para") {
          const text = block.lines.map((x) => x.trim()).join("\n");
          return `<p>${renderInlineMarkdown(text)}</p>`;
        }

        return "";
      })
      .filter(Boolean)
      .join("");
  };

  const renderStoryContent = (story) => {
    const st = normalizeStory(story);
    const parts = [];

    if (st.summary) {
      const summaryLines = st.summary
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean);
      const summaryHtml = summaryLines.map((x) => renderInlineMarkdown(x)).join("<br />");
      parts.push(`<blockquote>${summaryHtml}</blockquote>`);
    }

    if (st.body) {
      if (st.format === "html") {
        parts.push(sanitizeHtml(st.body));
      } else {
        parts.push(renderMarkdown(st.body));
      }
    }

    return parts.join("");
  };

  const badgeForSeverity = (severity) => {
    const s = String(severity || "中");
    const cls = s === "高" ? "sev-high" : s === "低" ? "sev-low" : "sev-mid";
    return `<span class="badge ${cls}">${escapeHtml(s)}</span>`;
  };

  const renderSidebarCards = (state) => {
    const s = normalizeState(state);

    const tags = parseTags(s.tags, 20);
    const highlights = parseLines(s.highlights, 20);
    const schedule = parseLines(s.schedule, 20);

    const cards = [];

    if (tags.length) {
      const items = tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("");
      cards.push(`
<div class="card-callout">
  <div class="card-title">标签</div>
  <div class="card-body"><div class="tag-list">${items}</div></div>
</div>`.trim());
    }

    if (highlights.length) {
      const items = highlights.map((t) => `<li>${escapeHtml(t)}</li>`).join("");
      cards.push(`
<div class="card-callout">
  <div class="card-title">亮点</div>
  <div class="card-body"><ul>${items}</ul></div>
</div>`.trim());
    }

    if (schedule.length) {
      const items = schedule.map((t) => `<li>${escapeHtml(t)}</li>`).join("");
      cards.push(`
<div class="card-callout">
  <div class="card-title">时间安排</div>
  <div class="card-body"><ul>${items}</ul></div>
</div>`.trim());
    }

    if (!cards.length) {
      cards.push(`
<div class="card-callout">
  <div class="card-title">侧栏</div>
  <div class="card-body muted">未填写亮点 / 时间安排 / 标签</div>
</div>`.trim());
    }

    return cards;
  };

  const renderAnnouncement = (state) => {
    const s = normalizeState(state);
    const masthead = String(s.masthead || DEFAULT_MASTHEAD).trim() || DEFAULT_MASTHEAD;

    const stories = s.stories.map(normalizeStory).filter((st) => st.title || st.subtitle || st.time || st.summary || st.body);
    const main = stories[0] || normalizeStory(DEFAULT_STORY());

    const dateText = formatDate(s.date);
    const dept = s.dept ? `<span class="issue-item">${escapeHtml(s.dept)}</span>` : "";
    const issue = s.issue ? `<span class="issue-item">${escapeHtml(s.issue)}</span>` : "";
    const version = s.version ? `<span class="issue-item">${escapeHtml(s.version)}</span>` : "";

    const sidebarCards = renderSidebarCards(s);

    const bodyParts = [];
    bodyParts.push(renderStoryContent(main));

    for (let i = 1; i < stories.length; i += 1) {
      const st = stories[i];
      bodyParts.push("<hr />");
      bodyParts.push(`<h2 class="story-title">${escapeHtml(st.title || `条目 ${i + 1}`)}</h2>`);
      if (st.subtitle) bodyParts.push(`<p class="story-deck">${escapeHtml(st.subtitle)}</p>`);
      if (st.time) bodyParts.push(`<p class="story-meta">${escapeHtml(st.time)}</p>`);
      bodyParts.push(renderStoryContent(st));
    }

    const deck = main.subtitle ? `<p class="deck">${escapeHtml(main.subtitle)}</p>` : "";
    const headTime = main.time ? `<div class="headline-meta">${escapeHtml(main.time)}</div>` : "";

    return `
<div class="news">
  <header class="masthead">
    <div class="masthead-name">${escapeHtml(masthead)}</div>
    <div class="issue-line" role="group" aria-label="刊头信息">
      <div class="issue-left">
        <span class="kicker">${escapeHtml(s.type)}</span>
        ${dateText ? `<span class="issue-item">${escapeHtml(dateText)}</span>` : ""}
        ${dept}
      </div>
      <div class="issue-right">
        ${badgeForSeverity(s.severity)}
        ${issue}
        ${version}
      </div>
    </div>
  </header>

  <section class="headline-wrap" aria-label="标题区">
    <h1 class="headline">${escapeHtml(main.title || "未命名标题")}</h1>
    ${deck}
    ${headTime}
  </section>

  <section class="content-grid" aria-label="正文与侧栏">
    <article class="article" aria-label="正文">
      <div class="article-body">${bodyParts.join("")}</div>
    </article>

    <aside class="sidebar" aria-label="侧栏">
      ${sidebarCards.join("")}
    </aside>
  </section>

  <footer class="paper-footer" aria-label="页脚">
    <div>© ${new Date().getFullYear()} ${escapeHtml(masthead)}</div>
    <div class="footer-right">Generated by ${escapeHtml(masthead)} \u00b7 <a class="verify-link" href="${escapeHtml(OFFICIAL_REPO_URL)}" target="_blank" rel="noopener" aria-label="\u9632\u4f2a\u6807\u8bc6\uFF1A${escapeHtml(OFFICIAL_REPO_OWNER)} \u5b98\u65b9\u4ed3\u5e93">\u9632\u4f2a\u6807\u8bc6\uFF1A${escapeHtml(OFFICIAL_REPO_OWNER)}</a></div>
  </footer>
</div>
    `.trim();
  };

  const estimateReading = (state) => {
    const s = normalizeState(state);

    const textParts = [];
    textParts.push(s.type, s.dept, s.version, s.issue, s.tags, s.highlights, s.schedule);

    s.stories.forEach((story) => {
      const st = normalizeStory(story);
      textParts.push(st.title, st.subtitle, st.time, st.summary);

      if (st.body) {
        if (st.format === "html") textParts.push(st.body.replace(/<[^>]*>/g, " "));
        else textParts.push(st.body);
      }
    });

    const merged = textParts.filter(Boolean).join("\n");
    const count = merged.replace(/\s+/g, "").length;
    const minutes = Math.max(1, Math.ceil(count / 450));

    return { count, minutes };
  };

  const ensureContent = (state) => {
    const s = normalizeState(state);
    const ok = s.stories.some((x) => x.title || x.subtitle || x.summary || x.body);
    if (!ok) flashStatus("请先填写至少一条标题/正文");
    return ok;
  };
  const safeJsonForHtmlScript = (obj) => {
    return JSON.stringify(obj)
      .replaceAll("<", "\\u003c")
      .replaceAll(">", "\\u003e")
      .replaceAll("&", "\\u0026")
      .replaceAll("\u2028", "\\u2028")
      .replaceAll("\u2029", "\\u2029");
  };

  const buildExportDocument = (state) => {
    const s = normalizeState(state);

    const css = String(window.NEWAPI_EXPORT_CSS || "").trim();
    const body = renderAnnouncement(s);

    const title = s.stories[0]?.title ? normalizeStory(s.stories[0]).title : `${s.masthead} 公告`;
    const paperClass = ["paper", s.optDropcap ? "dropcap" : ""].filter(Boolean).join(" ");
    const embedded = safeJsonForHtmlScript(s);

    return `<!doctype html>
<html lang="zh-Hans">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <title>${escapeHtml(title)}</title>
  <style>${css}</style>
</head>
<body>
  <main class="page">
    <div class="${paperClass}" data-theme="${escapeHtml(s.paperTheme)}" style="--accent: ${escapeHtml(s.accent)}; --body-columns: ${escapeHtml(s.columns)};">
      ${body}
    </div>
  </main>

  <script id="newapi-announcement-state" type="application/json">${embedded}</script>
</body>
</html>`;
  };

  const buildNewapiMarkdown = (state) => {
    const s = normalizeState(state);

    const stories = s.stories
      .map(normalizeStory)
      .filter((st) => st.title || st.subtitle || st.time || st.summary || st.body);

    const main = stories[0] || normalizeStory(DEFAULT_STORY());

    const lines = [];
    lines.push(`# ${main.title || "未命名标题"}`);
    lines.push("");

    const meta = [
      s.type ? `**类型：** ${s.type}` : "",
      s.date ? `**日期：** ${s.date}` : "",
      s.dept ? `**部门：** ${s.dept}` : "",
      s.severity ? `**重要性：** ${s.severity}` : "",
      s.version ? `**版本：** ${s.version}` : "",
      s.issue ? `**期号：** ${s.issue}` : "",
      s.tags ? `**标签：** ${s.tags}` : "",
    ]
      .filter(Boolean)
      .join("  \n");

    if (meta) {
      lines.push(meta);
      lines.push("");
    }

    const appendStory = (st, idx, { heading }) => {
      if (heading) {
        lines.push(`## ${st.title || `条目 ${idx + 1}`}`);
        lines.push("");
      }

      if (st.subtitle) {
        lines.push(`_${st.subtitle}_`);
        lines.push("");
      }

      if (st.time) {
        lines.push(`**时间：** ${st.time}`);
        lines.push("");
      }

      if (st.summary) {
        const q = st.summary
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => `> ${line}`)
          .join("\n");
        if (q) {
          lines.push(q);
          lines.push("");
        }
      }

      if (st.body) {
        lines.push(st.body);
        lines.push("");
      }
    };

    appendStory(main, 0, { heading: false });

    for (let i = 1; i < stories.length; i += 1) {
      lines.push("---");
      lines.push("");
      appendStory(stories[i], i, { heading: true });
    }

    lines.push("---");
    lines.push("");
    lines.push(`[\u9632\u4f2a\u6807\u8bc6\uFF1A${OFFICIAL_REPO_OWNER}](${OFFICIAL_REPO_URL}) \u00b7 ${APP_VERSION}`);

    return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
  };
  const buildNewapiInlineHtml = (state) => {
    const s = normalizeState(state);

    const stories = s.stories
      .map(normalizeStory)
      .filter((st) => st.title || st.subtitle || st.time || st.summary || st.body);

    const main = stories[0] || normalizeStory(DEFAULT_STORY());

    const isoDate = s.date || todayISO();
    const dotDate = formatDate(isoDate) || isoDate;
    const year = /^\d{4}/.test(isoDate) ? isoDate.slice(0, 4) : String(new Date().getFullYear());
    const masthead = String(s.masthead || DEFAULT_MASTHEAD).trim() || DEFAULT_MASTHEAD;

    const tags = parseTags(s.tags, 20);
    const highlightItems = parseLines(s.highlights, 20);
    const scheduleItems = parseLines(s.schedule, 20);

    const accent = s.accent;
    const columns = ["1", "2", "3"].includes(String(s.columns)) ? String(s.columns) : "2";

    const fontHeading =
      "Newsreader, Noto Serif SC, Source Han Serif SC, Songti SC, STSong, SimSun, Georgia, Times New Roman, serif";
    const fontBody =
      "Roboto, ui-sans-serif, system-ui, -apple-system, Segoe UI, PingFang SC, Microsoft YaHei, sans-serif";

    const theme = s.paperTheme || "system";
    const palette =
      theme === "dark"
        ? {
            bg: "#0f0f12",
            fg: "#f4f4f5",
            border: "rgba(255,255,255,0.12)",
            shadow: "0 12px 40px rgba(0,0,0,0.5)",
            line18: "rgba(255,255,255,0.18)",
            line16: "rgba(255,255,255,0.16)",
            line14: "rgba(255,255,255,0.14)",
            line12: "rgba(255,255,255,0.12)",
            ink92: "rgba(255,255,255,0.92)",
            ink90: "rgba(255,255,255,0.9)",
            ink74: "rgba(255,255,255,0.74)",
            ink72: "rgba(255,255,255,0.72)",
            ink70: "rgba(255,255,255,0.7)",
            ink66: "rgba(255,255,255,0.66)",
            ink62: "rgba(255,255,255,0.62)",
            ink58: "rgba(255,255,255,0.58)",
            surface: "rgba(255,255,255,0.06)",
            fill02: "rgba(255,255,255,0.04)",
            fill03: "rgba(255,255,255,0.06)",
            codeBg: "rgba(255,255,255,0.08)",
            codeBorder: "rgba(255,255,255,0.14)",
            badgeBorder: "rgba(255,255,255,0.18)",
          }
        : theme === "light"
          ? {
              bg: "#fafaf8",
              fg: "#09090b",
              border: "#e4e4e7",
              shadow: "0 12px 40px rgba(0,0,0,0.08)",
              line18: "rgba(0,0,0,0.18)",
              line16: "rgba(0,0,0,0.16)",
              line14: "rgba(0,0,0,0.14)",
              line12: "rgba(0,0,0,0.12)",
              ink92: "rgba(0,0,0,0.92)",
              ink90: "rgba(0,0,0,0.9)",
              ink74: "rgba(0,0,0,0.74)",
              ink72: "rgba(0,0,0,0.72)",
              ink70: "rgba(0,0,0,0.7)",
              ink66: "rgba(0,0,0,0.66)",
              ink62: "rgba(0,0,0,0.62)",
              ink58: "rgba(0,0,0,0.58)",
              surface: "rgba(255,255,255,0.62)",
              fill02: "rgba(0,0,0,0.02)",
              fill03: "rgba(0,0,0,0.03)",
              codeBg: "rgba(0,0,0,0.06)",
              codeBorder: "rgba(0,0,0,0.08)",
              badgeBorder: "rgba(0,0,0,0.12)",
            }
          : {
              bg: "Canvas",
              fg: "CanvasText",
              border: "GrayText",
              shadow: "0 12px 40px rgba(0,0,0,0.18)",
              line18: "GrayText",
              line16: "GrayText",
              line14: "GrayText",
              line12: "GrayText",
              ink92: "CanvasText",
              ink90: "CanvasText",
              ink74: "GrayText",
              ink72: "GrayText",
              ink70: "GrayText",
              ink66: "GrayText",
              ink62: "GrayText",
              ink58: "GrayText",
              surface: "rgba(127,127,127,0.08)",
              fill02: "rgba(127,127,127,0.06)",
              fill03: "rgba(127,127,127,0.08)",
              codeBg: "rgba(127,127,127,0.12)",
              codeBorder: "rgba(127,127,127,0.22)",
              badgeBorder: "GrayText",
            };

    const inlineCodeStyle =
      `font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace; font-size: 0.96em; background: ${palette.codeBg}; border: 1px solid ${palette.codeBorder}; padding: 0.1em 0.35em; border-radius: 8px;`;

    const renderMarkdownInline = (markdown) => {
      const html = renderMarkdown(markdown);

      return html
        .replace(/<p>/g, '<p style="margin: 0 0 12px; break-inside: avoid;">')
        .replace(
          /<h2>/g,
          `<h2 style="column-span: all; margin: 18px 0 10px; padding-top: 12px; border-top: 1px solid ${palette.line14}; font-size: 12px; text-transform: uppercase; letter-spacing: 0.14em; color: ${palette.ink70};">`
        )
        .replace(
          /<h3>/g,
          `<h3 style="column-span: all; margin: 18px 0 10px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.14em; color: ${palette.ink70};">`
        )
        .replace(/<ul>/g, '<ul style="margin: 0 0 12px; padding-left: 18px;">')
        .replace(/<li>/g, '<li style="margin: 0 0 6px; break-inside: avoid;">')
        .replace(/<code>/g, `<code style=\"${inlineCodeStyle}\">`)
        .replace(
          /<blockquote>/g,
          `<blockquote style="margin: 14px 0; padding: 12px 14px; border-left: 4px solid ${accent}; background: ${palette.fill03}; border-radius: 12px; color: ${palette.ink74};">`
        )
        .replace(
          /<hr \/>/g,
          `<hr style="border: none; border-top: 1px solid ${palette.line12}; margin: 16px 0;" />`
        );
    };

    const severityBadge = (sev) => {
      const s = String(sev || "中");
      const style =
        s === "高"
          ? "color:#991b1b;background:rgba(239,68,68,0.12);border-color:rgba(239,68,68,0.28);"
          : s === "低"
            ? "color:#065f46;background:rgba(16,185,129,0.12);border-color:rgba(16,185,129,0.26);"
            : "color:#92400e;background:rgba(245,158,11,0.14);border-color:rgba(245,158,11,0.28);";
      return `<span style="display:inline-flex;align-items:center;padding:2px 10px;border-radius:999px;border:1px solid ${palette.badgeBorder};font-weight:800;letter-spacing:0.12em;${style}">${escapeHtml(
        s
      )}</span>`;
    };

    const storyBody = (st) => {
      const parts = [];

      if (st.summary) {
        const lines = st.summary
          .split("\n")
          .map((x) => x.trim())
          .filter(Boolean);

        const summaryHtml = lines.map((x) => renderInlineMarkdown(x)).join("<br />");

        parts.push(
          `<blockquote style="margin: 14px 0; padding: 12px 14px; border-left: 4px solid ${accent}; background: ${palette.fill03}; border-radius: 12px; color: ${palette.ink74};">${summaryHtml}</blockquote>`
        );
      }

      if (st.body) {
        if (st.format === "html") parts.push(sanitizeHtml(st.body));
        else parts.push(renderMarkdownInline(st.body));
      }

      return parts.join("");
    };

    const bodyParts = [];
    bodyParts.push(storyBody(main));

    for (let i = 1; i < stories.length; i += 1) {
      const st = stories[i];

      bodyParts.push(`<hr style="border:none;border-top:1px solid ${palette.line12};margin:16px 0;" />`);
      bodyParts.push(
        `<div style="margin: 18px 0 10px; padding-top: 12px; border-top: 3px double ${palette.line18}; font-family: ${fontHeading}; font-size: 22px; line-height: 1.18; letter-spacing: -0.01em; color: ${palette.ink90};">${escapeHtml(
          st.title || `条目 ${i + 1}`
        )}</div>`
      );

      if (st.subtitle)
        bodyParts.push(
          `<div style="margin: 0 0 12px; color: ${palette.ink62}; font-size: 13px; line-height: 1.6;">${escapeHtml(
            st.subtitle
          )}</div>`
        );

      if (st.time)
        bodyParts.push(
          `<div style="margin: -4px 0 12px; font-size: 12px; color: ${palette.ink58}; text-transform: uppercase; letter-spacing: 0.12em;">${escapeHtml(
            st.time
          )}</div>`
        );

      bodyParts.push(storyBody(st));
    }

    const card = (title, body) => {
      return `
<div style="border: 1px solid ${palette.badgeBorder}; border-radius: 16px; background: ${palette.surface}; padding: 12px 12px;">
  <div style="margin: 0 0 10px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.16em; font-weight: 900; color: ${palette.ink62};">${escapeHtml(
        title
      )}</div>
  <div style="font-size: 13px; line-height: 1.6;">${body}</div>
</div>`.trim();
    };

    const sidebarCards = [];

    if (tags.length) {
      const tagHtml = tags
        .map(
          (t) =>
            `<span style="display: inline-flex; align-items: center; border: 1px solid ${palette.badgeBorder}; border-radius: 999px; padding: 5px 10px; background: ${palette.fill02}; font-size: 12px;">${escapeHtml(
              t
            )}</span>`
        )
        .join(" ");
      sidebarCards.push(card("标签", `<div style="display:flex;gap:8px;flex-wrap:wrap;">${tagHtml}</div>`));
    }

    if (highlightItems.length) {
      const items = highlightItems.map((x) => `<li>${escapeHtml(x)}</li>`).join("");
      sidebarCards.push(card("亮点", `<ul style="margin:0;padding-left:16px;">${items}</ul>`));
    }

    if (scheduleItems.length) {
      const items = scheduleItems.map((x) => `<li>${escapeHtml(x)}</li>`).join("");
      sidebarCards.push(card("时间安排", `<ul style="margin:0;padding-left:16px;">${items}</ul>`));
    }

    if (!sidebarCards.length)
      sidebarCards.push(card("侧栏", `<div style="color: ${palette.ink62};">未填写亮点 / 时间安排 / 标签</div>`));

    const leftItems = [
      `<span style="color: ${accent}; font-weight: 800;">${escapeHtml(s.type || "公告")}</span>`,
      dotDate ? `<span style="color: ${palette.ink72};">${escapeHtml(dotDate)}</span>` : "",
      s.dept ? `<span style="color: ${palette.ink72};">${escapeHtml(s.dept)}</span>` : "",
    ]
      .filter(Boolean)
      .join(" ");

    const rightItems = [
      severityBadge(s.severity),
      s.issue ? `<span style="color: ${palette.ink72};">${escapeHtml(s.issue)}</span>` : "",
      s.version ? `<span style="color: ${palette.ink72};">${escapeHtml(s.version)}</span>` : "",
    ]
      .filter(Boolean)
      .join(" ");

    const headlineDeck = main.subtitle
      ? `<div style="margin: 10px 0 0; color: ${palette.ink66}; font-size: 16px; line-height: 1.55; max-width: 70ch;">${escapeHtml(
          main.subtitle
        )}</div>`
      : "";

    const headlineTime = main.time
      ? `<div style="margin-top: 8px; color: ${palette.ink62}; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;">${escapeHtml(
          main.time
        )}</div>`
      : "";

    const bodyLayout = `
<div style="display:flex;gap:20px;padding-top:18px;flex-wrap:wrap;">
  <div style="flex: 1 1 520px; min-width: 0;">
    <div style="column-count: ${escapeHtml(columns)}; column-gap: 22px; font-size: 14px; line-height: 1.8;">${bodyParts.join("")}</div>
  </div>
  <div style="flex: 0 0 280px; display: grid; gap: 12px; align-content: start;">
    ${sidebarCards.join("")}
  </div>
</div>`.trim();

    const out = `
<div style="color-scheme: light dark; background: ${palette.bg}; color: ${palette.fg}; padding: 22px; border-radius: 18px; border: 1px solid ${palette.border}; box-shadow: ${palette.shadow}; font-size: 14px; line-height: 1.7; font-family: ${fontBody}; max-width: 860px; margin: 0 auto; box-sizing: border-box;">
  <div style="display: grid; gap: 10px; padding-bottom: 14px; border-bottom: 3px double ${palette.line18};">
    <div style="font-family: ${fontHeading}; font-weight: 700; text-align: center; letter-spacing: 0.18em; text-transform: none; font-size: 30px; line-height: 1.1;">${escapeHtml(
      masthead
    )}</div>
    <div style="display: flex; gap: 12px; align-items: center; justify-content: space-between; border-top: 1px solid ${palette.line14}; border-bottom: 1px solid ${palette.line14}; padding: 8px 10px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; flex-wrap: wrap;">
      <div style="display: inline-flex; gap: 10px; align-items: center; flex-wrap: wrap;">${leftItems}</div>
      <div style="display: inline-flex; gap: 10px; align-items: center; flex-wrap: wrap;">${rightItems}</div>
    </div>
  </div>

  <div style="padding-top: 14px;">
    <div style="margin: 0; font-family: ${fontHeading}; font-weight: 650; font-size: 40px; line-height: 1.04; letter-spacing: -0.02em;">${escapeHtml(
      main.title || "未命名标题"
    )}</div>
    ${headlineDeck}
    ${headlineTime}
  </div>

  ${bodyLayout}

  <div style="margin-top: 18px; padding-top: 10px; border-top: 3px double ${palette.line16}; color: ${palette.ink62}; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; font-size: 12px;">
    <div>© ${escapeHtml(year)} ${escapeHtml(masthead)}</div>
    <div style="text-transform: none; letter-spacing: 0.1em; display: inline-flex; gap: 10px; align-items: center; flex-wrap: wrap;"><span>Generated by ${escapeHtml(
      masthead
    )}</span><span aria-hidden="true">·</span><a href="${escapeHtml(OFFICIAL_REPO_URL)}" target="_blank" rel="noopener" style="color: inherit; text-decoration: none; border-bottom: 1px dashed currentColor; padding-bottom: 1px;">防伪标识：${escapeHtml(OFFICIAL_REPO_OWNER)}</a></div>
  </div>
</div>
    `.trim();

    return out
      .replace(/\r\n/g, "\n")
      .replace(/\n\s+/g, "\n")
      .replace(/\n{2,}/g, "\n")
      .trim()
      .replace(/\n/g, "");
  };

  const renderInlineHtmlCode = (state, { hasAnyContent } = {}) => {
    if (!codeEl) return;

    const s = normalizeState(state);
    const hasContent =
      typeof hasAnyContent === "boolean"
        ? hasAnyContent
        : s.stories.some((x) => x.title || x.subtitle || x.summary || x.body);

    if (!hasContent) {
      codeEl.textContent = "<!-- 填写左侧内容后，这里会生成 NewAPI HTML（内联样式） -->";
      return;
    }

    try {
      codeEl.textContent = buildNewapiInlineHtml(s);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      codeEl.textContent = `<!-- HTML 生成失败：${msg} -->`;
    }
  };

  const setPreviewMode = (mode) => {
    const next = mode === "code" ? "code" : "preview";
    previewMode = next;

    const isCode = next === "code";

    if (previewPaneEl) previewPaneEl.hidden = isCode;
    if (codePaneEl) codePaneEl.hidden = !isCode;

    if (tabPreviewEl) {
      tabPreviewEl.classList.toggle("tab-active", !isCode);
      tabPreviewEl.setAttribute("aria-selected", !isCode ? "true" : "false");
    }

    if (tabCodeEl) {
      tabCodeEl.classList.toggle("tab-active", isCode);
      tabCodeEl.setAttribute("aria-selected", isCode ? "true" : "false");
    }

    if (isCode) {
      const latest = lastRenderedState || readFormState();
      renderInlineHtmlCode(latest);
    }
  };

  const render = (state, { persist } = { persist: true }) => {
    const s = normalizeState(state);
    lastRenderedState = s;

    const hasAnyContent = s.stories.some((x) => x.title || x.subtitle || x.summary || x.body);

    if (previewEl) {
      previewEl.style.setProperty("--accent", s.accent);
      previewEl.style.setProperty("--body-columns", s.columns);

      if (s.paperTheme && s.paperTheme !== "system") previewEl.setAttribute("data-theme", s.paperTheme);
      else previewEl.removeAttribute("data-theme");

      previewEl.classList.toggle("dropcap", s.optDropcap);

      if (!hasAnyContent) {
        previewEl.innerHTML = '<div class="paper-empty">填写左侧内容后，这里会实时生成报纸风公告。</div>';
        if (previewMetaEl) previewMetaEl.textContent = "";
      } else {
        try {
          previewEl.innerHTML = renderAnnouncement(s);
          const { count, minutes } = estimateReading(s);
          const dt = formatDate(s.date);
          if (previewMetaEl) previewMetaEl.textContent = `${dt ? dt + " · " : ""}${count} 字 · 约 ${minutes} 分钟阅读`;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          previewEl.innerHTML = `<div class="paper-empty">预览渲染失败：${escapeHtml(msg)}</div>`;
          if (previewMetaEl) previewMetaEl.textContent = "";
        }
      }
    }

    if (previewMode === "code") {
      renderInlineHtmlCode(s, { hasAnyContent });
    }

    if (persist) safeStorage.set(STORAGE_KEY, s);
  };

  const renderFromFormSafe = ({ persist } = { persist: true }) => {
    try {
      render(readFormState(), { persist });
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (previewEl) previewEl.innerHTML = `<div class="paper-empty">渲染失败：${escapeHtml(msg)}</div>`;
      if (previewMetaEl) previewMetaEl.textContent = "";
      flashStatus(`渲染失败：${msg}`, 3200);
      return false;
    }
  };
  const downloadText = (filename, text, mime = "text/plain") => {
    const withBom = `\ufeff${String(text || "")}`;
    const blob = new Blob([withBom], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const saveTextFile = async (filename, text, mime = "text/plain") => {
    const name = String(filename || "download.txt");
    const value = String(text || "");

    const extMatch = name.match(/\.[a-z0-9]+$/i);
    const ext = extMatch ? extMatch[0] : "";

    if (typeof window.showSaveFilePicker === "function") {
      try {
        const types = mime && ext ? [{ description: ext.toUpperCase().slice(1), accept: { [mime]: [ext] } }] : [];

        const handle = await window.showSaveFilePicker({
          suggestedName: name,
          types: types.length ? types : undefined,
        });

        const writable = await handle.createWritable();
        const withBom = `\ufeff${value}`;
        await writable.write(new Blob([withBom], { type: `${mime};charset=utf-8` }));
        await writable.close();
        return true;
      } catch {
        // fall back
      }
    }

    try {
      downloadText(name, value, mime);
      return true;
    } catch {
      return false;
    }
  };

  const copyText = async (text) => {
    const value = String(text || "");

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(value);
        return true;
      } catch {
        // ignore
      }
    }

    try {
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      ta.style.top = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  };

  const openActionModal = (title, options, onSelect) => {
    const root = actionModalEls.root;
    const listEl = actionModalEls.options;
    const header = actionModalEls.title;
    if (!root || !listEl || !header) return false;

    header.textContent = String(title || "选择操作");
    onActionModalSelect = typeof onSelect === "function" ? onSelect : null;

    const items = Array.isArray(options) ? options : [];

    listEl.innerHTML = items
      .map((opt) => {
        const value = String(opt?.value || "");
        const label = String(opt?.label || value || "选项");
        const desc = String(opt?.desc || "");
        const meta = String(opt?.meta || "");

        return `
<button class="action-option" type="button" data-value="${escapeHtml(value)}">
  <div>
    <div class="action-option-title">${escapeHtml(label)}</div>
    ${desc ? `<div class="action-option-desc">${escapeHtml(desc)}</div>` : ""}
  </div>
  ${meta ? `<div class="action-option-meta">${escapeHtml(meta)}</div>` : ""}
</button>`;
      })
      .join("\n");

    root.hidden = false;
    return true;
  };

  const closeActionModal = () => {
    const root = actionModalEls.root;
    if (!root) return;
    root.hidden = true;
    onActionModalSelect = null;
  };

  const showTextForManualCopy = (title, text) => {
    if (!copyModalEls.root || !copyModalEls.text || !copyModalEls.title) return;
    copyModalEls.title.textContent = String(title || "手动复制");
    copyModalEls.text.value = String(text || "");
    copyModalEls.root.hidden = false;
    copyModalEls.text.focus();
    copyModalEls.text.select();
  };

  const closeCopyModal = () => {
    const root = copyModalEls.root;
    if (!root) return;
    root.hidden = true;
  };
  const parseExportedHtml = (html) => {
    const text = String(html || "");
    const doc = new DOMParser().parseFromString(text, "text/html");
    const script = doc.querySelector("#newapi-announcement-state");
    if (!script) return null;

    const raw = script.textContent || "";
    if (!raw.trim()) return null;

    return normalizeState(JSON.parse(raw));
  };

  const normalizeOpenAiBaseUrl = (baseUrl) => {
    const raw = String(baseUrl || "").trim().replace(/\/+$/, "");
    if (!raw) return "";
    if (raw.endsWith("/v1")) return raw;
    return `${raw}/v1`;
  };

  const loadAiSettings = () => {
    const saved = safeStorage.get(AI_SETTINGS_KEY);
    if (!saved || typeof saved !== "object") return;

    if (aiEls.baseUrl) aiEls.baseUrl.value = String(saved.baseUrl || "");
    if (aiEls.model) aiEls.model.value = String(saved.model || "");
    if (aiEls.apiKey && saved.apiKey) aiEls.apiKey.value = String(saved.apiKey || "");
    if (aiEls.remember) aiEls.remember.checked = Boolean(saved.apiKey);
  };

  const saveAiSettingsIfNeeded = () => {
    if (!aiEls.baseUrl || !aiEls.model || !aiEls.apiKey || !aiEls.remember) return;

    const baseUrl = aiEls.baseUrl.value.trim();
    const model = aiEls.model.value.trim();
    const remember = aiEls.remember.checked;
    const apiKey = remember ? aiEls.apiKey.value.trim() : "";

    safeStorage.set(AI_SETTINGS_KEY, { baseUrl, model, apiKey });
  };

  const buildAiSystemPrompt = (count, nowDate) => {
    const n = Number.isFinite(count) && count > 0 ? Math.min(10, Math.floor(count)) : 0;

    const countRule = n
      ? `- 标题条数：用户指定为 ${n} 条；请输出恰好 ${n} 条 stories，并按重要性排序（第 1 条为头条）`
      : "- 标题条数：用户未指定；请根据输入内容自行判断拆分 stories（通常 1-5 条），并按重要性排序（第 1 条为头条）";

    return `你是一个“newapi-Announcement 报纸风公告生成器”的内容编辑助手。\n\n目标：把用户输入整理成结构化 JSON，用于生成一份报纸风公告。\n\n输出要求：\n- 只输出 JSON（不要 Markdown 代码块、不要解释）\n- 中文优先，措辞正式、简洁、像公告\n- 不要编造不存在的事实\n${countRule}\n- stories 至少 1 条；每条 story 都要有 title\n- date 使用 YYYY-MM-DD（默认 ${nowDate}）\n- severity 只能是：高 / 中 / 低（默认中）\n- stories[].format 固定输出 markdown\n\nJSON Schema：\n{\n  "type": "产品更新|运维通知|安全公告|活动公告|其他",\n  "date": "YYYY-MM-DD",\n  "dept": "",\n  "severity": "高|中|低",\n  "version": "",\n  "issue": "",\n  "tags": "tag1, tag2",\n  "highlights": "- ...\\n- ...",\n  "schedule": "...",\n  "stories": [\n    {\n      "title": "",\n      "subtitle": "",\n      "time": "YYYY-MM-DD HH:mm(可选)",\n      "format": "markdown",\n      "summary": "",\n      "body": ""\n    }\n  ]\n}`;
  };

  const extractJsonFromText = (text) => {
    const raw = String(text || "").trim();
    if (!raw) throw new Error("AI 返回为空");

    const fence = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    const candidate = (fence ? fence[1] : raw).trim();

    const first = candidate.indexOf("{");
    const last = candidate.lastIndexOf("}");
    if (first !== -1 && last !== -1 && last > first) {
      return JSON.parse(candidate.slice(first, last + 1));
    }

    return JSON.parse(candidate);
  };

  const aiGenerate = async () => {
    if (!aiEls.prompt) return;

    const prompt = aiEls.prompt.value.trim();
    if (!prompt) {
      flashStatus("请先填写要发的内容");
      return;
    }

    const count = aiEls.count ? Number(aiEls.count.value) : 0;
    const baseUrlRaw = aiEls.baseUrl ? aiEls.baseUrl.value.trim() : "";
    const model = (aiEls.model ? aiEls.model.value.trim() : "") || "gpt-4.1-mini";
    const apiKey = aiEls.apiKey ? aiEls.apiKey.value.trim() : "";

    saveAiSettingsIfNeeded();

    flashStatus("AI 生成中...", 8000);

    try {
      const nowDate = todayISO();
      const system = buildAiSystemPrompt(count, nowDate);

      let resultObj = null;

      if (!baseUrlRaw) {
        const res = await fetch("/api/ai/announcement", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, count, nowDate }),
        });

        if (!res.ok) {
          const t = await res.text();
          throw new Error(t || `HTTP ${res.status}`);
        }

        const data = await res.json();
        resultObj = data.state || data;
      } else {
        if (!apiKey) throw new Error("缺少 API Key（建议走 /api/ai/announcement 代理）");

        const baseUrl = normalizeOpenAiBaseUrl(baseUrlRaw);
        const endpoint = `${baseUrl}/chat/completions`;

        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            temperature: 0.35,
            messages: [
              { role: "system", content: system },
              { role: "user", content: prompt },
            ],
          }),
        });

        if (!res.ok) {
          const t = await res.text();
          throw new Error(t || `HTTP ${res.status}`);
        }

        const data = await res.json();
        const content = data?.choices?.[0]?.message?.content;
        if (!content) throw new Error("AI 返回为空");
        resultObj = extractJsonFromText(content);
      }

      const current = readFormState();
      const aiState = normalizeState(resultObj);

      const merged = {
        ...aiState,
        masthead: current.masthead,
        optDropcap: current.optDropcap,
        columns: current.columns,
        accent: current.accent,
      };

      applyStateToForm(merged);
      render(merged, { persist: true });

      flashStatus("AI 已生成并填充");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      flashStatus(`AI 生成失败：${msg}`, 3200);
    }
  };

  const wire = () => {
    resolveDomRefs();

    const essentialOk = formEls.type && formEls.stories && previewEl;
    if (!essentialOk) {
      const msg =
        "页面初始化失败：找不到关键 DOM 元素。请用本工具的 index.html 打开，或运行 node server.js 后访问 http://localhost:3210。";
      const previewFallback = $("preview");
      if (previewFallback) previewFallback.innerHTML = `<div class="paper-empty">${escapeHtml(msg)}</div>`;
      if (statusEl) statusEl.textContent = msg;
      return;
    }

    const saved = safeStorage.get(STORAGE_KEY) || safeStorage.get(LEGACY_STORAGE_KEY);
    const initial = normalizeState(saved || DEFAULT_STATE);

    applyStateToForm(initial);
    render(initial, { persist: false });

    loadAiSettings();

    if (tabPreviewEl && tabCodeEl) {
      tabPreviewEl.addEventListener("click", () => setPreviewMode("preview"));
      tabCodeEl.addEventListener("click", () => setPreviewMode("code"));
      setPreviewMode(previewMode);
    }

    const form = $("form");
    if (form) {
      form.addEventListener("input", () => renderFromFormSafe({ persist: true }));
      form.addEventListener("change", () => renderFromFormSafe({ persist: true }));
    }

    formEls.stories.addEventListener("input", (e) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement))
        return;

      const card = target.closest("details.story-card");
      if (!card) return;

      if (target.getAttribute("data-field") === "title") updateStorySummaryTitle(card);
    });

    formEls.stories.addEventListener("click", (e) => {
      const target = eventTargetElement(e);
      if (!target) return;
      const btn = target.closest("button[data-action]");
      if (!btn) return;

      e.preventDefault();
      e.stopPropagation();

      if (btn.hasAttribute("disabled")) return;

      const action = btn.getAttribute("data-action") || "";
      const card = btn.closest("details.story-card");
      const idx = card ? Number(card.getAttribute("data-index")) : NaN;
      if (!Number.isFinite(idx)) return;

      const state = readFormState();
      const stories = state.stories.slice();

      if (action === "up" && idx > 0) {
        const next = stories.slice();
        const temp = next[idx - 1];
        next[idx - 1] = next[idx];
        next[idx] = temp;
        applyStateToForm({ ...state, stories: next });
        render({ ...state, stories: next }, { persist: true });
        return;
      }

      if (action === "down" && idx < stories.length - 1) {
        const next = stories.slice();
        const temp = next[idx + 1];
        next[idx + 1] = next[idx];
        next[idx] = temp;
        applyStateToForm({ ...state, stories: next });
        render({ ...state, stories: next }, { persist: true });
        return;
      }

      if (action === "delete") {
        const next = stories.slice();
        next.splice(idx, 1);
        if (!next.length) next.push(DEFAULT_STORY());
        applyStateToForm({ ...state, stories: next });
        render({ ...state, stories: next }, { persist: true });
      }
    });

    actionEls.addStory?.addEventListener("click", () => {
      const state = readFormState();
      const next = state.stories.slice();
      next.push(DEFAULT_STORY());
      applyStateToForm({ ...state, stories: next });
      render({ ...state, stories: next }, { persist: true });
    });

    actionEls.sample?.addEventListener("click", () => {
      applyStateToForm(SAMPLE_STATE);
      render(SAMPLE_STATE, { persist: true });
      flashStatus("已填充示例");
    });

    actionEls.reset?.addEventListener("click", () => {
      safeStorage.clear(STORAGE_KEY);
      applyStateToForm(DEFAULT_STATE);
      render(DEFAULT_STATE, { persist: false });
      flashStatus("已清空");
    });

    actionEls.import?.addEventListener("click", () => {
      actionEls.importFile?.click();
    });

    actionEls.importFile?.addEventListener("change", async () => {
      const input = actionEls.importFile;
      if (!input) return;

      const file = input.files?.[0];
      input.value = "";
      if (!file) return;

      try {
        const text = await file.text();
        const name = (file.name || "").toLowerCase();

        let nextState = null;
        if (name.endsWith(".json") || text.trim().startsWith("{")) {
          nextState = normalizeState(JSON.parse(text));
        } else if (name.endsWith(".html") || /<\s*html\b/i.test(text) || /\b<!doctype\b/i.test(text)) {
          nextState = parseExportedHtml(text);
          if (!nextState) throw new Error("无法识别的 HTML（建议导入本工具导出的 HTML）");
        } else {
          throw new Error("仅支持导入 .json 或 .html");
        }

        applyStateToForm(nextState);
        render(nextState, { persist: true });
        flashStatus("已导入");
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        flashStatus(`导入失败：${msg}`, 2600);
      }
    });

    actionEls.export?.addEventListener("click", () => {
      const state = readFormState();
      if (!ensureContent(state)) return;

      const options = [
        { value: "export:json", label: "导出 JSON", desc: "备份/二次编辑（会同时打开手动复制框）", meta: "JSON" },
        { value: "export:html", label: "导出 HTML", desc: "发布/打印（会同时打开手动复制框）", meta: "HTML" },
      ];

      const ok = openActionModal("选择导出格式", options, async (value) => {
        const s = readFormState();
        if (!ensureContent(s)) return;

        const date = s.date || todayISO();
        const name = sanitizeFileName(s.stories[0]?.title || "announcement");

        if (value === "export:json") {
          const text = JSON.stringify(s, null, 2);
          const filename = `newapi-announcement_${date}_${name}.json`;
          const saved = await saveTextFile(filename, text, "application/json");
          showTextForManualCopy("导出 JSON（手动复制/保存）", text);
          flashStatus(saved ? "已导出 JSON" : "已生成 JSON（浏览器可能拦截下载）");
          return;
        }

        if (value === "export:html") {
          const html = buildExportDocument(s);
          const filename = `newapi-announcement_${date}_${name}.html`;
          const saved = await saveTextFile(filename, html, "text/html");
          showTextForManualCopy("导出 HTML（手动复制/保存）", html);
          flashStatus(saved ? "已导出 HTML" : "已生成 HTML（浏览器可能拦截下载）");
        }
      });

      if (!ok) flashStatus("导出失败：弹窗未初始化", 2600);
    });

    actionEls.copy?.addEventListener("click", () => {
      const state = readFormState();
      if (!ensureContent(state)) return;

      const options = [
        { value: "copy:md", label: "Markdown（NewAPI）", desc: "兼容性最好", meta: "MD" },
        { value: "copy:inline-html", label: "NewAPI HTML（内联样式）", desc: "更接近报纸排版（需 NewAPI 支持 HTML）", meta: "HTML" },
        { value: "copy:html", label: "HTML 源码", desc: "用于支持完整 HTML 的系统", meta: "HTML" },
      ];

      const ok = openActionModal("选择复制格式", options, async (value) => {
        const s = readFormState();
        if (!ensureContent(s)) return;

        if (value === "copy:md") {
          const text = buildNewapiMarkdown(s);
          const copied = await copyText(text);
          if (!copied) showTextForManualCopy("Markdown（NewAPI）", text);
          flashStatus(copied ? "已复制 Markdown" : "自动复制失败：已打开手动复制框", copied ? 1400 : 2600);
          return;
        }

        if (value === "copy:inline-html") {
          try {
            const html = buildNewapiInlineHtml(s);
            const copied = await copyText(html);
            if (!copied) showTextForManualCopy("NewAPI HTML（内联样式）", html);
            flashStatus(copied ? "已复制 NewAPI HTML" : "自动复制失败：已打开手动复制框", copied ? 1400 : 2600);
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            flashStatus(`复制失败：${msg}`, 2600);
          }
          return;
        }

        if (value === "copy:html") {
          const html = buildExportDocument(s);
          const copied = await copyText(html);
          if (!copied) showTextForManualCopy("HTML 源码", html);
          flashStatus(copied ? "已复制 HTML 源码" : "自动复制失败：已打开手动复制框", copied ? 1400 : 2600);
        }
      });

      if (!ok) flashStatus("复制失败：弹窗未初始化", 2600);
    });

    actionEls.print?.addEventListener("click", async () => {
      const state = readFormState();
      if (!ensureContent(state)) return;

      const html = buildExportDocument(state);

      const w = window.open("", "_blank", "noopener,noreferrer");
      if (w) {
        w.document.open();
        w.document.write(html);
        w.document.close();
        w.addEventListener(
          "load",
          () => {
            try {
              w.focus();
              w.print();
            } catch {
              // ignore
            }
          },
          { once: true }
        );
        flashStatus("已打开打印", 1600);
        return;
      }

      showTextForManualCopy("打印失败：请手动保存为 HTML 后打印", html);
      flashStatus("打印失败：已打开手动复制框", 2600);
    });

    actionEls.aiGenerate?.addEventListener("click", () => {
      aiGenerate();
    });

    if (actionModalEls.root) {
      const root = actionModalEls.root;
      const close = () => closeActionModal();

      actionModalEls.close?.addEventListener("click", close);
      root.addEventListener("click", (e) => {
        const target = eventTargetElement(e);
        if (!target) return;

        if (target.getAttribute("data-action") === "close") {
          close();
          return;
        }

        const btn = target.closest("button.action-option");
        if (!btn) return;

        const value = btn.getAttribute("data-value") || "";
        closeActionModal();
        if (onActionModalSelect) onActionModalSelect(value);
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !root.hidden) close();
      });
    }

    if (copyModalEls.root) {
      const modalRoot = copyModalEls.root;
      const close = () => closeCopyModal();

      copyModalEls.close?.addEventListener("click", close);
      modalRoot.addEventListener("click", (e) => {
        const target = eventTargetElement(e);
        if (!target) return;
        if (target.getAttribute("data-action") === "close") close();
      });

      copyModalEls.select?.addEventListener("click", () => {
        copyModalEls.text?.focus();
        copyModalEls.text?.select();
      });

      copyModalEls.copy?.addEventListener("click", async () => {
        const val = copyModalEls.text?.value || "";
        const ok = await copyText(val);
        flashStatus(ok ? "已复制" : "复制失败：请手动 Ctrl+C", ok ? 1400 : 2600);
        if (ok) close();
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !modalRoot.hidden) close();
      });
    }

    window.__NEWAPI_ANNOUNCER_READY__ = true;
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wire, { once: true });
  } else {
    wire();
  }
})();
