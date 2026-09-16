"use client";

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  // "toggle" shows both language options side by side (used where space is
  // generous, e.g. the mobile menu sheet and footer). "compact" collapses
  // to a single pill showing the *other* language — clicking it switches —
  // used in the header nav row where horizontal space is tight.
  variant?: 'toggle' | 'compact';
  className?: string;
}

export default function LanguageSwitcher({ variant = 'toggle', className }: LanguageSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const setLanguage = (newLocale: 'en' | 'ar') => {
    if (locale !== newLocale) {
      router.replace(pathname, { locale: newLocale });
    }
  };

  if (variant === 'compact') {
    const nextLocale = locale === 'en' ? 'ar' : 'en';
    return (
      <button
        type="button"
        onClick={() => setLanguage(nextLocale)}
        aria-label={nextLocale === 'ar' ? 'Switch to Arabic' : 'Switch to English'}
        className={cn(
          "shrink-0 inline-flex items-center justify-center h-8 px-3 rounded-full text-xs font-black tracking-wider uppercase leading-none transition-colors duration-300 cursor-pointer",
          "bg-black/[0.05] dark:bg-white/[0.06] border border-black/5 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:bg-emerald-500 hover:text-white hover:border-emerald-500",
          className
        )}
      >
        {nextLocale === 'ar' ? 'عربي' : 'EN'}
      </button>
    );
  }

  return (
    <div className={cn("relative flex items-center bg-black/[0.05] dark:bg-white/[0.06] p-0.5 rounded-full border border-black/5 dark:border-white/5 w-24 h-8.5 select-none shadow-[inset_0_1px_3px_rgba(0,0,0,0.08)]", className)}>
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
