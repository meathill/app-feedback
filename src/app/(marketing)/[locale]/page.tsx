import { ArrowRight, CheckCircle, GithubLogo, Rocket } from '@phosphor-icons/react/dist/ssr';
import { brandCatalog, getOrganizationJsonLd } from 'meathill-brand';
import { BrandFooter, BrandHeader } from 'meathill-brand-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { routing } from '@/i18n/routing';
import { FEEDBACK_SITE_URL, getFeedbackAlternates } from '@/lib/site-metadata';
import LanguageSwitcher from '../_components/language-switcher';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Landing.seo' });

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      locale: locale,
      type: 'website',
    },
    alternates: getFeedbackAlternates(locale, routing.locales, routing.defaultLocale),
  };
}

export default function LandingPage() {
  const t = useTranslations('Landing');
  const siteUrl = FEEDBACK_SITE_URL;
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      getOrganizationJsonLd(),
      {
        '@type': 'WebSite',
        name: 'App Feedback',
        url: siteUrl,
        publisher: { '@id': brandCatalog.organization.id },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[var(--meathill-cream)] dark:bg-neutral-900 flex flex-col">
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD 结构化数据
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <BrandHeader
        currentSiteId="app-feedback"
        productName="App Feedback"
        productUrl={siteUrl}
        actions={
          <div className="flex gap-4 items-center flex-wrap">
            <Link href="/admin">
              <Button variant="outline">{t('hero.demo')}</Button>
            </Link>
            <LanguageSwitcher />
          </div>
        }
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-24 space-y-32">
        {/* Hero */}
        <section className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-tight">
            {t('hero.title')}
          </h1>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <a href="https://github.com/meathill/app-feedback" target="_blank" rel="noreferrer">
              <Button size="lg" className="gap-2 w-full sm:w-auto h-12 px-6">
                <GithubLogo className="w-5 h-5" weight="fill" />
                {t('hero.github')}
              </Button>
            </a>
            <a
              href="https://deploy.workers.cloudflare.com/?url=https://github.com/meathill/app-feedback"
              target="_blank"
              rel="noreferrer"
            >
              <Button
                size="lg"
                variant="outline"
                className="gap-2 w-full sm:w-auto h-12 px-6 bg-[#F38020] text-white hover:bg-[#F38020]/90 hover:text-white border-transparent"
              >
                <Rocket className="w-5 h-5" />
                {t('hero.deploy')}
              </Button>
            </a>
          </div>
        </section>

        {/* Features */}
        <section className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200 fill-mode-both">
          <h2 className="text-3xl font-bold text-center">{t('features.title')}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-8 bg-white dark:bg-neutral-950 rounded-3xl shadow-sm border border-neutral-200 dark:border-neutral-800 space-y-4 hover:shadow-md transition-shadow"
              >
                <CheckCircle className="w-8 h-8 text-green-500" />
                <h3 className="font-bold text-xl">{t(`features.items.${i}.title`)}</h3>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {t(`features.items.${i}.description`)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 fill-mode-both">
          <h2 className="text-3xl font-bold text-center">{t('testimonials.title')}</h2>
          <div className="grid md:grid-cols-1 gap-8 max-w-2xl mx-auto">
            {[0].map((i) => (
              <div key={i} className="p-8 bg-blue-50 dark:bg-blue-950/20 rounded-3xl space-y-6">
                <p className="text-xl text-blue-900 dark:text-blue-100 italic leading-relaxed">
                  "{t(`testimonials.items.${i}.quote`)}"
                </p>
                <div className="font-semibold text-blue-700 dark:text-blue-300">
                  — {t(`testimonials.items.${i}.author`)}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="space-y-12 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 fill-mode-both">
          <h2 className="text-3xl font-bold text-center">{t('faq.title')}</h2>
          <div className="space-y-4">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="p-6 bg-white dark:bg-neutral-950 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 space-y-3"
              >
                <h3 className="font-bold text-lg flex items-center gap-3">
                  <ArrowRight className="w-5 h-5 text-blue-600 shrink-0" />
                  {t(`faq.items.${i}.question`)}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 pl-8 leading-relaxed">
                  {t(`faq.items.${i}.answer`)}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <BrandFooter currentSiteId="app-feedback" description={t('hero.subtitle')} />
    </div>
  );
}
