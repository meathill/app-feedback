import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const host = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api'],
    },
    sitemap: `${host}/sitemap.xml`,
  };
}
