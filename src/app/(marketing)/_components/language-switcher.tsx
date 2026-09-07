'use client';

import { useLocale } from 'next-intl';
import { LOCALE_LABELS, SUPPORTED_LOCALES, usePathname, useRouter } from '@/i18n/routing';
import { Select, SelectItem, SelectPopup, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function onSelectChange(nextLocale: string | null) {
    if (!nextLocale) return;
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <Select value={locale} onValueChange={onSelectChange}>
      <SelectTrigger className="w-[120px] bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800">
        <SelectValue />
      </SelectTrigger>
      <SelectPopup>
        {SUPPORTED_LOCALES.map((locale) => (
          <SelectItem key={locale} value={locale}>
            {LOCALE_LABELS[locale]}
          </SelectItem>
        ))}
      </SelectPopup>
    </Select>
  );
}
