import { describe, expect, it } from 'vitest';
import {
  FEEDBACK_OG_IMAGE,
  FEEDBACK_OG_IMAGE_HEIGHT,
  FEEDBACK_OG_IMAGE_WIDTH,
  FEEDBACK_SITE_URL,
  getFeedbackAlternates,
} from './site-metadata';

describe('App Feedback SEO metadata', () => {
  it('为默认语言和其他语言输出绝对 canonical 与 hreflang', () => {
    expect(getFeedbackAlternates('en', ['en', 'zh'], 'en')).toEqual({
      canonical: FEEDBACK_SITE_URL,
      languages: {
        en: FEEDBACK_SITE_URL,
        zh: `${FEEDBACK_SITE_URL}/zh`,
        'x-default': FEEDBACK_SITE_URL,
      },
    });
    expect(getFeedbackAlternates('zh', ['en', 'zh'], 'en').canonical).toBe(`${FEEDBACK_SITE_URL}/zh`);
  });

  it('x-default 指向根域名且各 locale 互相回链', () => {
    const locales = ['zh', 'en', 'th', 'vi', 'es', 'pt'] as const;
    for (const locale of locales) {
      const { canonical, languages } = getFeedbackAlternates(locale, locales, 'zh');
      expect(languages['x-default']).toBe(FEEDBACK_SITE_URL);
      expect(canonical).toBe(locale === 'zh' ? FEEDBACK_SITE_URL : `${FEEDBACK_SITE_URL}/${locale}`);
      for (const supported of locales) {
        expect(languages[supported]).toBe(supported === 'zh' ? FEEDBACK_SITE_URL : `${FEEDBACK_SITE_URL}/${supported}`);
      }
    }
  });

  it('分享图使用绝对 URL 且尺寸为 1200x630', () => {
    expect(FEEDBACK_OG_IMAGE.startsWith(FEEDBACK_SITE_URL)).toBe(true);
    expect(FEEDBACK_OG_IMAGE).toBe(`${FEEDBACK_SITE_URL}/og-image.png`);
    expect(FEEDBACK_OG_IMAGE_WIDTH).toBe(1200);
    expect(FEEDBACK_OG_IMAGE_HEIGHT).toBe(630);
  });
});
