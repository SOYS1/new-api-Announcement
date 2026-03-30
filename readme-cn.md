# newapi-Announcement 公告生成器（报纸风）

[English](./README.md) | [中文](./readme-cn.md)

一个零依赖的公告编辑器：左侧编辑、右侧实时预览，并可导出可发布内容。

## 安装

### 前置条件

- 现代浏览器（必需）
- Node.js 18+（可选，仅在使用 `server.js` 本地 AI 代理时需要）

### 获取项目

1. 克隆或下载本仓库。
2. 本项目无需安装依赖（不需要执行 `npm install`）。

### 快速验证

- 纯前端模式：
  - 直接用浏览器打开 `index.html`
- 本地服务模式：
  - 启动 `node server.js`
  - 访问 `http://localhost:3210`

## 卸载

本项目不会自行安装全局包，清理方式如下：

1. 停止本地服务进程（若正在运行）。
2. 清理浏览器本地数据（可选）：
   - `localStorage` 键：
     - `newapi-announcement-generator:v2`
     - `newapi-announcement-generator:v1`
     - `newapi-announcement-generator:ai:v1`
3. 若设置过环境变量，可从当前会话移除：
   - `OPENAI_API_KEY`、`OPENAI_BASE_URL`、`OPENAI_MODEL`
   - `AI_API_KEY`、`AI_BASE_URL`、`AI_MODEL`
   - `PORT`
4. 不再使用时删除项目目录。

## 使用方法

### 1）编辑与预览

1. 填写基础信息（类型/日期/部门/重要性/版本/标签）。
2. 添加一条或多条内容（第一条作为头条）。
3. 调整展示项（分栏、强调色、主题、首字下沉）。
4. 在两个标签页查看结果：
   - `预览`：渲染后的公告
   - `代码`：内联 HTML

### 2）导入 / 导出

- 支持导入：
  - `.json`
  - 本工具导出的 `.html`（从 `#newapi-announcement-state` 读取内嵌状态）
- 支持导出：
  - JSON（`newapi-announcement_<date>_<title>.json`）
  - HTML（`newapi-announcement_<date>_<title>.html`）

### 3）复制发布

- `Markdown（NewAPI）`：兼容性最好
- `NewAPI HTML（内联样式）`：在支持 HTML 时版式更完整
- `HTML 源码`：完整 HTML 文档

### 4）打印 / PDF

- 通过浏览器打印流程输出生成后的 HTML。
- 若弹窗或下载被拦截，会自动弹出手动复制框。

### 5）AI 辅助生成（可选）

- 当 AI Base URL 留空时，前端调用本地代理接口：`/api/ai/announcement`（推荐）。
- 当填写 AI Base URL 时，前端会直连 `${baseUrl}/v1/chat/completions`，并需要在浏览器中提供 API Key。

## 配置 / 自定义

### 服务端环境变量（`server.js`）

| 变量 | 默认值 | 作用 |
|------|------|------|
| `PORT` | `3210` | 本地 HTTP 服务端口 |
| `OPENAI_API_KEY` 或 `AI_API_KEY` | 无 | `/api/ai/announcement` 使用的密钥 |
| `OPENAI_BASE_URL` 或 `AI_BASE_URL` | `https://api.openai.com/v1` | OpenAI 兼容地址 |
| `OPENAI_MODEL` 或 `AI_MODEL` | `gpt-4.1-mini` | 对话模型名称 |

### AI 面板运行参数（`index.html` + `app.js`）

| 选项 | 默认值 | 说明 |
|------|------|------|
| `AI Base URL` | 空 | 留空即走本地 `/api/ai/announcement` |
| `AI Model` | `gpt-4.1-mini` | 直连 OpenAI 兼容接口时使用 |
| `API Key` | 空 | 浏览器直连 AI 时必填 |
| `记住 AI 设置` | 关闭 | 存入 `newapi-announcement-generator:ai:v1` |

### 公告渲染自定义项

| 字段 | 默认值 | 可选值 / 行为 |
|------|------|------|
| `masthead` | `newapi-Announcement` | 顶部刊头名称 |
| `columns` | `2` | `1`、`2`、`3` |
| `accent` | `#EC4899` | 十六进制颜色（如 `#2563EB`） |
| `paperTheme` | `system` | `system`、`light`、`dark` |
| `optDropcap` | `true` | 是否启用首字下沉 |
| `stories[].format` | `markdown` | `markdown` 或 `html` |

### 本地持久化键

| 键名 | 作用 |
|------|------|
| `newapi-announcement-generator:v2` | 主编辑状态 |
| `newapi-announcement-generator:v1` | 旧版本状态兼容 |
| `newapi-announcement-generator:ai:v1` | AI 设置缓存 |

## 项目结构说明

| 路径 | 作用 |
|------|------|
| `index.html` | 页面结构与表单控件 |
| `app.js` | 编辑逻辑、状态管理、渲染、导入导出、复制打印、AI 流程 |
| `styles.css` | 应用样式与报纸风排版样式 |
| `export-css.js` | 导出 HTML 时注入的样式 |
| `server.js` | 可选本地静态服务 + AI 代理接口 |
| `debug.js` | 临时调试脚本（DOM/localStorage） |
| `app.js.corrupted.bak` | 历史备份文件（损坏副本） |
| `.project-folder-tidy.plan.json` | 目录清理计划产物 |
| `design-system/` | 设计系统文档目录 |
| `design-system/newapi-公告生成器/MASTER.md` | 本项目设计规范主文件 |
