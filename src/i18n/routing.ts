import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

// 全站语言的唯一来源：marketing 路由、admin 后台、sitemap 共用，新增语言只改这里
export const SUPPORTED_LOCALES = ['zh', 'en', 'th', 'vi', 'es', 'pt'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: SupportedLocale = 'zh';

export const LOCALE_LABELS: Record<SupportedLocale, string> = {
  zh: '中文',
  en: 'English',
  th: 'ไทย',
  vi: 'Tiếng Việt',
  es: 'Español',
  pt: 'Português',
};

export const routing = defineRouting({
  locales: [...SUPPORTED_LOCALES],
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'as-needed',
});

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
