import type { NextConfig } from 'next';
import pkg from './package.json' with { type: 'json' };

const nextConfig: NextConfig = {
  env: {
    APP_VERSION: pkg.version,
  },
};

export default nextConfig;

// Enable calling `getCloudflareContext()` in `next dev`.
// See https://opennext.js.org/cloudflare/bindings#local-access-to-bindings.
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
initOpenNextCloudflareForDev();
