"use client";

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { motion } from 'framer-motion';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const setLanguage = (newLocale: 'en' | 'ar') => {
    if (locale !== newLocale) {
      router.replace(pathname, { locale: newLocale });
    }
  };

  return (
    <div className="relative flex items-center bg-black/[0.05] dark:bg-white/[0.06] p-0.5 rounded-full border border-black/5 dark:border-white/5 w-24 h-8.5 select-none shadow-[inset_0_1px_3px_rgba(0,0,0,0.08)]">
      {/* English Option */}
      <button
        onClick={() => setLanguage('en')}
        className={`relative flex-1 text-center text-[10px] md:text-xs font-black tracking-wider transition-colors duration-300 outline-none h-full flex items-center justify-center leading-none ${
          locale === 'en'
            ? 'text-white'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        {locale === 'en' && (
          <motion.div
            layoutId="activeLanguageBg"
            className="absolute inset-0 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/25 z-0"
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          />
        )}
        <span className="z-10 font-black">EN</span>
      </button>

      {/* Arabic Option */}
      <button
        onClick={() => setLanguage('ar')}
        className={`relative flex-1 text-center text-[10px] md:text-xs font-black tracking-wider transition-colors duration-300 outline-none h-full flex items-center justify-center leading-none ${
          locale === 'ar'
            ? 'text-white'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        {locale === 'ar' && (
          <motion.div
            layoutId="activeLanguageBg"
            className="absolute inset-0 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/25 z-0"
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          />
        )}
        <span className="z-10 font-black">عربي</span>
      </button>
    </div>
  );
}
