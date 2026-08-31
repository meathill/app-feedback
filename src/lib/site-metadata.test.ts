import { describe, expect, it } from 'vitest';
import { FEEDBACK_SITE_URL, getFeedbackAlternates } from './site-metadata';

describe('App Feedback SEO metadata', () => {
  it('为默认语言和其他语言输出绝对 canonical 与 hreflang', () => {
    expect(getFeedbackAlternates('en', ['en', 'zh'], 'en')).toEqual({
      canonical: FEEDBACK_SITE_URL,
      languages: {
        en: FEEDBACK_SITE_URL,
        zh: `${FEEDBACK_SITE_URL}/zh`,
      },
    });
    expect(getFeedbackAlternates('zh', ['en', 'zh'], 'en').canonical).toBe(`${FEEDBACK_SITE_URL}/zh`);
  });
});
