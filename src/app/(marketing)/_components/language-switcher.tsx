'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
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
        <SelectItem value="zh">中文</SelectItem>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="th">ไทย</SelectItem>
        <SelectItem value="vi">Tiếng Việt</SelectItem>
        <SelectItem value="es">Español</SelectItem>
        <SelectItem value="pt">Português</SelectItem>
      </SelectPopup>
    </Select>
  );
}
