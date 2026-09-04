import { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { getSiteUrl } from '@/lib/site-url';

export default function sitemap(): MetadataRoute.Sitemap {
  const host = getSiteUrl();

  const languages: Record<string, string> = {};
  routing.locales.forEach((locale) => {
    languages[locale] = locale === routing.defaultLocale ? host : `${host}/${locale}`;
  });
  languages['x-default'] = host;

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
