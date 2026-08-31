export const FEEDBACK_SITE_URL = 'https://feedback.meathill.com';

export function getFeedbackAlternates(locale: string, supportedLocales: readonly string[], defaultLocale: string) {
  const languages = Object.fromEntries(
    supportedLocales.map((supportedLocale) => [
      supportedLocale,
      supportedLocale === defaultLocale ? FEEDBACK_SITE_URL : `${FEEDBACK_SITE_URL}/${supportedLocale}`,
    ]),
  );

  return {
    canonical: locale === defaultLocale ? FEEDBACK_SITE_URL : `${FEEDBACK_SITE_URL}/${locale}`,
    languages,
  };
}
