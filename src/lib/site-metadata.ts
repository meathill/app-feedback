export const FEEDBACK_SITE_URL = 'https://feedback.meathill.com';

export const FEEDBACK_OG_IMAGE = `${FEEDBACK_SITE_URL}/og-image.png`;
export const FEEDBACK_OG_IMAGE_WIDTH = 1200;
export const FEEDBACK_OG_IMAGE_HEIGHT = 630;

export function getFeedbackAlternates(locale: string, supportedLocales: readonly string[], defaultLocale: string) {
  const languages: Record<string, string> = Object.fromEntries(
    supportedLocales.map((supportedLocale) => [
      supportedLocale,
      supportedLocale === defaultLocale ? FEEDBACK_SITE_URL : `${FEEDBACK_SITE_URL}/${supportedLocale}`,
    ]),
  );
  languages['x-default'] = FEEDBACK_SITE_URL;

  return {
    canonical: locale === defaultLocale ? FEEDBACK_SITE_URL : `${FEEDBACK_SITE_URL}/${locale}`,
    languages,
  };
}
