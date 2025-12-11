# 应用反馈收集器 (App Feedback Collector)

这是一个简单的用于收集移动应用上面用户反馈的程序。它只包含两个功能：

1. **反馈收集 API**: 接收移动应用提交的反馈，存入 Cloudflare D1 数据库，并推送到 Telegram。
2. **反馈列表页**: 提供一个简单的 Web 界面查看反馈列表。

## 功能特性

- **API (`POST /api/feedbacks`)**: 接收 JSON 格式的反馈数据。
- **Telegram 通知**: 收到新反馈时自动推送到指定的 Telegram Chat。
- **管理界面**: 基于 Next.js 的服务端渲染页面，支持分页查看反馈。
- **Cloudflare Zero Trust**: (推荐) 配合 Cloudflare Zero Trust 保护管理界面。

## 技术栈

- Framework: [Next.js](https://nextjs.org/) (App Router)
- Deployment: [Cloudflare Workers](https://workers.cloudflare.com/) via [OpenNext](https://opennext.js.org/)
- Database: [Cloudflare D1](https://developers.cloudflare.com/d1/)
- Styling: [Tailwind CSS](https://tailwindcss.com/)

## 开发指南

### 1. 环境准备

确保安装了 `Node.js` 和 `pnpm`。

```bash
pnpm install
```

### 2. 数据库设置

本地开发需要初始化 D1 数据库：

```bash
# 创建迁移文件 (已存在)
# npx wrangler d1 migrations create feedbacks "init"

# 应用迁移到本地数据库
npx wrangler d1 migrations apply feedbacks --local
```

### 3. 配置环境变量

在 Cloudflare Dashboard 设置以下环境变量 (或本地 `.dev.vars`):

- `TELEGRAM_BOT_TOKEN`: Telegram Bot Token
- `TELEGRAM_CHAT_ID`: 接收通知的 Chat ID

### 4. 运行开发服务器

```bash
pnpm dev
```

### 5. 运行测试

```bash
pnpm test
```

## API 文档

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

## 部署

```bash
pnpm deploy
```
