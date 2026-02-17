"use client";

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { Button } from './ui/button';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const t = useTranslations('language');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = () => {
    const nextLocale = locale === 'ar' ? 'en' : 'ar';
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <Button
      onClick={switchLanguage}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <Globe className="h-4 w-4" />
      <span className="font-semibold">
        {locale === 'ar' ? t('en') : t('ar')}
      </span>
    </Button>
  );
}
