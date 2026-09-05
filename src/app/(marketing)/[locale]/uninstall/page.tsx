'use client';

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, HeartHandshake, Rocket, Send } from 'lucide-react';
import LanguageSwitcher from '../../_components/language-switcher';

const REASON_KEYS = [
  { key: 'notWorking', tag: 'not-working' },
  { key: 'hardToUse', tag: 'hard-to-use' },
  { key: 'missingFeatures', tag: 'missing-features' },
  { key: 'foundAlternative', tag: 'found-alternative' },
  { key: 'notNeeded', tag: 'not-needed' },
  { key: 'other', tag: 'other' },
] as const;

export default function UninstallPage() {
  const searchParams = useSearchParams();
  const t = useTranslations('Uninstall');
  const appId = searchParams.get('appId') || 'free-ai-api-extension';
  const version = searchParams.get('version') || '';

  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [content, setContent] = useState('');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  function toggleReason(tag: string) {
    setSelectedReasons((prev) => (prev.includes(tag) ? prev.filter((r) => r !== tag) : [...prev, tag]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      const summaryText = content.trim()
        ? content.trim()
        : `[Uninstall Survey] Selected reasons: ${selectedReasons.join(', ') || 'None specified'}`;

      const res = await fetch('/api/feedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId,
          version: version || undefined,
          content: summaryText,
          contact: contact.trim() || undefined,
          tags: ['uninstall-survey', ...selectedReasons],
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit feedback');
      }

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setErrorMsg('提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex flex-col">
      <header className="px-6 py-4 flex justify-between items-center border-b bg-white dark:bg-neutral-950 sticky top-0 z-10">
        <div className="font-bold text-lg flex items-center gap-2">
          <Rocket className="w-5 h-5 text-blue-600" />
          App Feedback
        </div>
        <LanguageSwitcher />
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-12 flex flex-col justify-center">
        {submitted ? (
          <div className="bg-white dark:bg-neutral-950 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 text-center space-y-6 shadow-sm">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">{t('thankYouTitle')}</h1>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-md mx-auto">
                {t('thankYouSubtitle')}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-neutral-950 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-semibold rounded-full mb-2">
                <HeartHandshake className="w-4 h-4" />
                {appId} {version ? `v${version}` : ''}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                {t('title')}
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">{t('subtitle')}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                  {t('reasonsTitle')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {REASON_KEYS.map(({ key, tag }) => {
                    const active = selectedReasons.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleReason(tag)}
                        className={`p-3 text-xs rounded-xl border text-left transition-colors flex items-center justify-between font-medium ${
                          active
                            ? 'border-blue-600 bg-blue-50/70 text-blue-700 dark:bg-blue-950/40 dark:border-blue-500 dark:text-blue-300'
                            : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        <span>{t(`reasons.${key}`)}</span>
                        {active && <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={t('detailsPlaceholder')}
                  className="w-full p-3.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900 focus:bg-white dark:focus:bg-neutral-950 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  {t('contactLabel')}
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder={t('contactPlaceholder')}
                  className="w-full p-3 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900 focus:bg-white dark:focus:bg-neutral-950 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              {errorMsg && <p className="text-xs text-red-500 font-medium">{errorMsg}</p>}

              <Button type="submit" disabled={submitting} className="w-full py-3 h-11 font-semibold gap-2">
                <Send className="w-4 h-4" />
                {submitting ? t('submitting') : t('submit')}
              </Button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
