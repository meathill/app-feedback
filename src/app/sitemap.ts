import { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';

export default function sitemap(): MetadataRoute.Sitemap {
  // TODO: Replace with your actual production domain
  const host = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

  const languages: Record<string, string> = {};
  routing.locales.forEach((locale) => {
    languages[locale] = locale === routing.defaultLocale ? host : `${host}/${locale}`;
  });

  return [
    {
      url: host,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
      alternates: {
        languages,
      },
    },
  ];
}