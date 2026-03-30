# newapi-Announcement Generator (Newspaper Style)

[English](./README.md) | [中文](./readme-cn.md)

A zero-dependency announcement editor that renders a newspaper-style layout in real time.  
Left panel: authoring. Right panel: preview/code/export-ready output.

## Install

### Prerequisites

- Modern browser (required)
- Node.js 18+ (optional, only if you want the local AI proxy endpoint in `server.js`)

### Get the project

1. Clone or download this repository.
2. No package installation is required (`npm install` is not needed).

### Quick verification

- Frontend-only mode:
  - Open `index.html` directly in your browser.
- Local server mode:
  - Start with `node server.js`
  - Open `http://localhost:3210`

## Uninstall

This project does not install global packages by itself. To clean it up:

1. Stop the local server process (if running).
2. Remove local browser data for this app (optional):
   - `localStorage` keys:
     - `newapi-announcement-generator:v2`
     - `newapi-announcement-generator:v1`
     - `newapi-announcement-generator:ai:v1`
3. Remove optional shell environment variables from your session if you set them:
   - `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `OPENAI_MODEL`
   - `AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL`
   - `PORT`
4. Delete the project directory when no longer needed.

## Usage

### 1) Edit and preview

1. Fill in basic metadata (type/date/dept/severity/version/tags).
2. Add one or more stories (the first one is rendered as the main headline).
3. Tune display options (columns, accent color, theme, drop cap).
4. Check both tabs:
   - `Preview`: rendered announcement
   - `Code`: inline HTML output

### 2) Import / export

- Import supports:
  - `.json`
  - `.html` exported by this tool (embedded state is read from `#newapi-announcement-state`)
- Export supports:
  - JSON (`newapi-announcement_<date>_<title>.json`)
  - HTML (`newapi-announcement_<date>_<title>.html`)

### 3) Copy and publish

- `Markdown (NewAPI)`: best compatibility
- `NewAPI HTML (inline style)`: richer layout where HTML is accepted
- `HTML source`: full HTML document

### 4) Print / PDF

- Uses browser print flow from generated HTML.
- If popup/download is blocked, the app opens a manual copy dialog with full HTML.

### 5) AI-assisted drafting (optional)

- If AI Base URL is empty, frontend calls local proxy endpoint: `/api/ai/announcement` (recommended).
- If AI Base URL is provided, frontend calls `${baseUrl}/v1/chat/completions` directly and needs API Key in browser.

## Configuration / Customization

### Server environment variables (`server.js`)

| Variable | Default | Purpose |
|------|------|------|
| `PORT` | `3210` | Local HTTP server port |
| `OPENAI_API_KEY` or `AI_API_KEY` | none | API key used by `/api/ai/announcement` |
| `OPENAI_BASE_URL` or `AI_BASE_URL` | `https://api.openai.com/v1` | OpenAI-compatible base URL |
| `OPENAI_MODEL` or `AI_MODEL` | `gpt-4.1-mini` | Model name for chat completions |

### AI panel runtime options (`index.html` + `app.js`)

| Option | Default | Notes |
|------|------|------|
| `AI Base URL` | empty | Empty means use local `/api/ai/announcement` |
| `AI Model` | `gpt-4.1-mini` | Used for direct OpenAI-compatible calls |
| `API Key` | empty | Required for direct browser-side AI calls |
| `Remember AI settings` | off | Stores settings in localStorage key `newapi-announcement-generator:ai:v1` |

### Announcement rendering options

| Field | Default | Supported values / behavior |
|------|------|------|
| `masthead` | `newapi-Announcement` | Header name shown at top |
| `columns` | `2` | `1`, `2`, `3` |
| `accent` | `#EC4899` | Hex color (e.g. `#2563EB`) |
| `paperTheme` | `system` | `system`, `light`, `dark` |
| `optDropcap` | `true` | Enables first-letter drop cap style |
| `stories[].format` | `markdown` | `markdown` or `html` |

### Data persistence

| Key | Purpose |
|------|------|
| `newapi-announcement-generator:v2` | Main editor state |
| `newapi-announcement-generator:v1` | Legacy state fallback |
| `newapi-announcement-generator:ai:v1` | Saved AI settings |

## Project Structure

| Path | Purpose |
|------|------|
| `index.html` | Main UI layout and form controls |
| `app.js` | Editor logic, state management, rendering, import/export/copy/print, AI flow |
| `styles.css` | App styles and newspaper layout styles |
| `export-css.js` | Export-time CSS embedded into generated HTML |
| `server.js` | Optional local static server + AI proxy endpoint |
| `debug.js` | Temporary DOM/localStorage debug helper script |
| `app.js.corrupted.bak` | Backup file (historical/corrupted copy) |
| `.project-folder-tidy.plan.json` | Cleanup planning artifact |
| `design-system/` | Design system documentation and rules |
| `design-system/newapi-公告生成器/MASTER.md` | Master design spec for this project |
