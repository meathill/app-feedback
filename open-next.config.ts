import { defineCloudflareConfig } from '@opennextjs/cloudflare';

export default defineCloudflareConfig({
  // 禁止 cache interception：曾在 freeaiapi 引发 Next 16.3 + OpenNext `_rsc` 预取循环
  //（~10M Worker 请求 / 2 天），见 app-feedback#4。上游：
  // https://github.com/opennextjs/opennextjs-cloudflare/pull/1348
  // https://github.com/opennextjs/opennextjs-aws/issues/1212
  enableCacheInterception: false,
  // Uncomment to enable R2 cache,
  // It should be imported as:
  // `import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";`
  // See https://opennext.js.org/cloudflare/caching for more details
  // incrementalCache: r2IncrementalCache,
});
