# 应用反馈收集器 (App Feedback Collector)

> Live: https://feedback.roudan.io

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/meathill/app-feedback)

这是一个开源、快速且简单的应用反馈收集管理系统。专为独立开发者和创作者打造，用于收集移动应用或网站用户的反馈。

## 🌟 核心特性

- **多语言着陆页**: 开箱即用的多语言 (i18n) 宣传页面，支持中、英、泰、越、西、葡六种语言。
- **深度 AI 融合**: 内置基于大模型的自动翻译（已上线），未来计划支持 AI 自动分类与情感分析。善用免费额度，提效降本。
- **反馈收集 API**: 接收移动应用或网站提交的反馈，存入 Cloudflare D1 数据库。
- **Telegram 通知**: 收到新反馈时自动推送到指定的 Telegram Chat。
- **管理后台**: 基于 Next.js 的服务端渲染页面，支持分页查看反馈，保持轻量级和极速访问。
- **一键部署**: 支持一键部署到 Cloudflare Workers 免费层，零运维成本。

## 🛠 技术栈

- Framework: [Next.js](https://nextjs.org/) (App Router, next-intl)
- Deployment: [Cloudflare Workers](https://workers.cloudflare.com/) via [OpenNext](https://opennext.js.org/)
- Database: [Cloudflare D1](https://developers.cloudflare.com/d1/)
- Styling: [Tailwind CSS](https://tailwindcss.com/)

## 🚀 部署指南

### 方式一：一键部署到 Cloudflare (推荐)

点击上方的 "Deploy to Cloudflare Workers" 按钮，按照指引授权 GitHub 和 Cloudflare 即可自动完成部署。无需准备服务器或数据库。

### 方式二：本地开发部署

**1. 环境准备**

确保安装了 `Node.js` 和 `pnpm`。

```bash
pnpm install
```

**2. 数据库设置**

本地开发需要初始化 D1 数据库：

```bash
# 应用迁移到本地数据库
npx wrangler d1 migrations apply feedbacks --local
```

**3. 配置环境变量**

在 Cloudflare Dashboard 设置以下环境变量 (或本地创建 `.dev.vars`):

- `TELEGRAM_BOT_TOKEN`: Telegram Bot Token (可选)
- `TELEGRAM_CHAT_ID`: 接收通知的 Chat ID (可选)

**4. 运行开发服务器**

```bash
pnpm dev
```

打开 `http://localhost:3010` 即可访问多语言着陆页。打开 `/admin` 访问管理后台。

**5. 手动部署**

```bash
pnpm deploy
```

## 📚 API 文档

### 提交反馈

- **URL**: `/api/feedbacks`
- **Method**: `POST`
- **Content-Type**: `application/json`

**请求体示例**:

```json
{
  "appId": "com.example.myapp",
  "version": "1.0.0",
  "content": "这里是反馈内容...",
  "contact": "user@example.com",
  "deviceInfo": {
    "model": "iPhone 13",
    "os": "iOS 16.0"
  },
  "location": {
    "lat": 35.6895,
    "lng": 139.6917
  }
}
```

## 🔒 管理后台安全

我们推荐配合 **Cloudflare Zero Trust** 来保护您的 `/admin` 路由。您可以配置访问策略，仅允许特定的邮箱或 GitHub 账号访问管理页面，无需自己编写复杂的登录认证逻辑。
