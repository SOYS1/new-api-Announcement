# newapi 公告生成器（报纸风）

一个纯前端、零依赖的公告生成器：左侧编辑，右侧实时预览报纸/杂志风公告。

## 功能

- 多标题合并：支持把多条内容整合在一个公告里一起发（第一条为头条）
- 正文渲染：简单 Markdown；也支持 HTML（会过滤危险标签）
- 导入/导出：JSON、HTML（点击“导出”后选择格式；HTML 内会内嵌 JSON，方便二次导入继续编辑）
- 复制发布：点击“复制”后选择格式（Markdown / NewAPI 内联 HTML / HTML 源码）

> 备注：NewAPI 公告通常会过滤 <style>/<class>（或不解析外部 CSS），所以提供了“NewAPI 内联样式 HTML”版本，粘贴后更容易直接渲染。
- 打印/PDF：优先用隐藏 iframe 触发打印；若被拦截会给出可手动保存的 HTML
- AI 辅助（可选）：把要发的内容贴给 AI，自动生成标题/副标题/时间/正文（推荐走本地代理，避免 Key 暴露）

## 使用

### 纯前端（无 AI）

- 直接用浏览器打开 `index.html`

### 启动本地 Server（推荐：支持 AI 接口）

1) 设置环境变量（示例）

- PowerShell：
  - `$env:OPENAI_API_KEY = "YOUR_KEY"`
  - `$env:OPENAI_MODEL = "gpt-4.1-mini"`（可选）
  - `$env:OPENAI_BASE_URL = "https://api.openai.com/v1"`（可选）

2) 启动：

- `node server.js`

3) 打开：

- `http://localhost:3210`

> 说明：样式默认会尝试加载 Google Fonts（Newsreader/Roboto）。若网络不可用，会自动使用系统字体回退，不影响使用。

## 设计系统（ui-ux-pro-max）

- `design-system/newapi-公告生成器/MASTER.md`




