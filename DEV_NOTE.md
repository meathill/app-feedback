# DEV_NOTE

长期有效的架构决策与坑位记录。只记“为什么”，不记流水账。

## 部署与构建（Cloudflare Workers + OpenNext）

- Next 16.3.4 + OpenNext 1.20.6，`wrangler.jsonc` 里 observability 保持关闭，`open-next.config.ts` 里 `enableCacheInterception: false`。
  - 原因：曾在 freeaiapi 触发 Next 16.3 + OpenNext `_rsc` 预取循环（约 10M Worker 请求 / 2 天），见 app-feedback#4。上游：opennextjs-cloudflare#1348、opennextjs-aws#1212。升级 OpenNext 后若要重开，先小流量验证。
- `NEXT_PUBLIC_SITE_URL` 是构建期注入（`wrangler.jsonc` vars + 构建命令显式传参），robots/sitemap 直接 `process.env.NEXT_PUBLIC_SITE_URL!`，缺失就 fail fast，不再回退 example.com。
- `pnpm-workspace.yaml` 必须保留 `packages` 字段，Cloudflare 构建机的 pnpm 10.11.1 认这个。

## 路由与中间件（`src/middleware.ts`）

- `/api`：只做 CORS（OPTIONS 直接 204，余者透传并加响应头），不在 middleware 做鉴权。
- `/admin`：直接放行，安全靠 Cloudflare Zero Trust（见 README），不要在这里加自建登录。
- 其余路径走 next-intl middleware。

## i18n

- 六语言 zh/en/th/vi/es/pt，默认 zh，`localePrefix: 'as-needed'`。
- 语言列表的唯一来源是 `src/i18n/routing.ts` 的 `SUPPORTED_LOCALES` / `LOCALE_LABELS` / `DEFAULT_LOCALE`，marketing 与 admin 的切换器、`(admin)/layout.tsx` 都从这里取。新增语言只改这一处，另需补 `messages/<locale>.json`。
- admin 后台不在 intl middleware 内，用 `NEXT_LOCALE` cookie 切换语言（`request.ts` 与 `(admin)/layout.tsx` 各读一次）。

## SEO

- canonical / hreflang（含 x-default）统一经 `lib/site-metadata.ts` 的 `getFeedbackAlternates` 生成，marketing 页与 sitemap 共用同一域名常量 `FEEDBACK_SITE_URL`。
- robots 禁止收录 `/admin` 与 `/api`。

## 数据与 API

- D1 `feedbacks` 表，迁移在 `migrations/`，本地用 `db:migrate:local`，线上用 `db:migrate`。
- `tags` 存 JSON 字符串；按 tag 过滤用 `EXISTS (SELECT 1 FROM json_each(tags) ...)`。
- 删除是软删除（`status='deleted'`），GET 默认排除 `deleted`。
- `CORS_HEADERS` 在 middleware 与 `feedbacks/route.ts` 各有一份、`VALID_STATUSES` 在两处路由各有一份——都是两次，不抽取（三次才抽）。

## AI 翻译

- 模型 `gemini-3-flash-preview`（`src/lib/gemini.ts`），管理后台按需触发，译文落 `content_en`。
- 失败直接透错给调用方，不做静默吞错。

## UI 约定

- `src/components/ui` 是 COSS UI（base-ui）生成代码，原样保留：再大也不拆、不手改。
- 图标用 lucide-react / phosphor，不内联 SVG；条件类名用 `clsx + tailwind-merge`，变体用 `cva`；全局状态用 zustand。
