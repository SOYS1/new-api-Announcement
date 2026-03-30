/*
  newapi announcement generator - local server

  - Serves static files in this folder
  - Provides /api/ai/announcement (OpenAI-compatible Chat Completions)

  Env:
    PORT=3210
    OPENAI_API_KEY=...
    OPENAI_BASE_URL=https://api.openai.com/v1
    OPENAI_MODEL=gpt-4.1-mini
*/

const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 3210);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml; charset=utf-8",
};

function send(res, status, headers, body) {
  res.writeHead(status, headers);
  res.end(body);
}

function sendJson(res, status, obj, extraHeaders = {}) {
  const body = JSON.stringify(obj, null, 2);
  send(
    res,
    status,
    {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
    body
  );
}

function setCors(headers, req) {
  const origin = req.headers.origin || "*";
  headers["Access-Control-Allow-Origin"] = origin;
  headers["Vary"] = "Origin";
  headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
  headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization";
  headers["Access-Control-Max-Age"] = "86400";
  return headers;
}

async function readJsonBody(req, limitBytes = 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];

    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > limitBytes) {
        reject(new Error("Request body too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on("end", () => {
      try {
        const text = Buffer.concat(chunks).toString("utf8");
        resolve(JSON.parse(text));
      } catch (e) {
        reject(e);
      }
    });

    req.on("error", reject);
  });
}

function normalizeBaseUrl(raw) {
  const input = String(raw || "").trim().replace(/\/+$/, "");
  if (!input) return "https://api.openai.com/v1";
  if (input.endsWith("/v1")) return input;
  return `${input}/v1`;
}

function buildSystemPrompt(count, nowDate) {
  const n = Number.isFinite(count) && count > 0 ? Math.min(10, Math.floor(count)) : 0;

  const countRule = n
    ? `- 标题条数：用户指定为 ${n} 条；请输出恰好 ${n} 条 stories，并按重要性排序（第 1 条为头条）`
    : "- 标题条数：用户未指定；请根据输入内容自行判断拆分 stories（通常 1-5 条），并按重要性排序（第 1 条为头条）";

  return `你是一个“newapi 报纸风公告生成器”的内容编辑助手。\n\n目标：把用户输入整理成结构化 JSON，用于生成一份报纸风公告。\n\n输出要求：\n- 只输出 JSON（不要 Markdown 代码块、不要解释）\n- 中文优先，措辞正式、简洁、像公告\n- 不要编造不存在的事实\n${countRule}\n- stories 至少 1 条；每条 story 都要有 title\n- date 使用 YYYY-MM-DD（默认 ${nowDate}）\n- severity 只能是：高 / 中 / 低（默认中）\n- stories[].format 固定输出 markdown\n\nJSON Schema：\n{\n  "type": "产品更新|运维通知|安全公告|活动公告|其他",\n  "date": "YYYY-MM-DD",\n  "dept": "",\n  "severity": "高|中|低",\n  "version": "",\n  "issue": "",\n  "tags": "tag1, tag2",\n  "highlights": "- ...\\n- ...",\n  "schedule": "...",\n  "stories": [\n    {\n      "title": "",\n      "subtitle": "",\n      "time": "YYYY-MM-DD HH:mm(可选)",\n      "format": "markdown",\n      "summary": "",\n      "body": ""\n    }\n  ]\n}`;
}

function extractJsonFromText(text) {
  const raw = String(text || "").trim();
  if (!raw) throw new Error("Empty model response");

  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = (fence ? fence[1] : raw).trim();

  const first = candidate.indexOf("{");
  const last = candidate.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    return JSON.parse(candidate.slice(first, last + 1));
  }

  return JSON.parse(candidate);
}

async function callOpenAiChatCompletions({ prompt, count, nowDate }) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY (or AI_API_KEY)");
  }

  const baseUrl = normalizeBaseUrl(process.env.OPENAI_BASE_URL || process.env.AI_BASE_URL);
  const model = process.env.OPENAI_MODEL || process.env.AI_MODEL || "gpt-4.1-mini";

  const endpoint = `${baseUrl}/chat/completions`;
  const system = buildSystemPrompt(count, nowDate);

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
        { role: "user", content: String(prompt || "") },
      ],
    }),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `HTTP ${res.status}`);
  }

  const data = JSON.parse(text);
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("No content in OpenAI response");

  return extractJsonFromText(content);
}

async function handleAiAnnouncement(req, res) {
  if (req.method === "OPTIONS") {
    send(res, 204, setCors({}, req), "");
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" }, setCors({}, req));
    return;
  }

  try {
    const body = await readJsonBody(req);
    const prompt = String(body.prompt || "").trim();
    const count = Number(body.count || 0);
    const nowDate = String(body.nowDate || "").trim() || new Date().toISOString().slice(0, 10);

    if (!prompt) {
      sendJson(res, 400, { error: "prompt is required" }, setCors({}, req));
      return;
    }

    const state = await callOpenAiChatCompletions({ prompt, count, nowDate });
    sendJson(res, 200, { state }, setCors({}, req));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    sendJson(res, 500, { error: message }, setCors({}, req));
  }
}

function safePathname(urlPath) {
  const decoded = decodeURIComponent(urlPath);
  if (decoded === "/") return "/index.html";
  return decoded;
}

function serveStatic(req, res, urlPath) {
  const pathname = safePathname(urlPath);

  const fsPath = path.join(ROOT, pathname);
  const resolved = path.resolve(fsPath);
  if (!resolved.startsWith(path.resolve(ROOT))) {
    send(res, 404, { "Content-Type": "text/plain; charset=utf-8" }, "Not found");
    return;
  }

  fs.stat(resolved, (err, stat) => {
    if (err || !stat.isFile()) {
      send(res, 404, { "Content-Type": "text/plain; charset=utf-8" }, "Not found");
      return;
    }

    const ext = path.extname(resolved).toLowerCase();
    const contentType = MIME[ext] || "application/octet-stream";

    fs.readFile(resolved, (readErr, buf) => {
      if (readErr) {
        send(res, 500, { "Content-Type": "text/plain; charset=utf-8" }, "Internal error");
        return;
      }

      send(res, 200, { "Content-Type": contentType, "Cache-Control": "no-cache" }, buf);
    });
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

    if (url.pathname === "/api/ai/announcement") {
      await handleAiAnnouncement(req, res);
      return;
    }

    if (req.method !== "GET" && req.method !== "HEAD") {
      send(res, 405, { "Content-Type": "text/plain; charset=utf-8" }, "Method not allowed");
      return;
    }

    serveStatic(req, res, url.pathname);
  } catch {
    send(res, 500, { "Content-Type": "text/plain; charset=utf-8" }, "Internal error");
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[newapi] server running: http://localhost:${PORT}`);
  console.log("[newapi] AI endpoint: /api/ai/announcement");
});
