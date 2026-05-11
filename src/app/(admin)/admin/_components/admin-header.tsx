'use client';

import { useFeedbackStore } from '@/store/feedback-store';
import { Select, SelectItem, SelectPopup, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

export default function AdminHeader() {
  const total = useFeedbackStore((s) => s.total);
  const loading = useFeedbackStore((s) => s.loading);
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('Admin');

  function changeLanguage(newLocale: string | null) {
    if (!newLocale) return;
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    router.refresh();
  }

  return (
    <header className="mb-8 flex justify-between items-center flex-wrap gap-4">
      <div className="flex items-baseline gap-3">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">App Feedback</h1>
        <span className="text-xs text-gray-400">v{process.env.APP_VERSION}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {loading ? t('loading') : t('total', { count: total })}
        </div>
        <Select value={locale} onValueChange={changeLanguage}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectPopup>
            <SelectItem value="zh">中文</SelectItem>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="th">ไทย</SelectItem>
            <SelectItem value="vi">Tiếng Việt</SelectItem>
            <SelectItem value="es">Español</SelectItem>
            <SelectItem value="pt">Português</SelectItem>
          </SelectPopup>
        </Select>
      </div>
    </header>
  );
}
