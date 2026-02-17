# i18n File Structure

## ✅ Fixed Module Resolution

The error "Can't resolve '../../../i18n/routing'" has been fixed by properly organizing the i18n configuration files.

## 📁 File Structure

```
project-root/
├── i18n/                          # Root i18n configuration
│   ├── routing.ts                 # Main routing config (locales, default locale)
│   └── request.ts                 # Request config (loads messages)
│
├── src/
│   ├── i18n/                      # Re-exports for easier imports
│   │   ├── navigation.ts          # Navigation helpers (Link, useRouter, etc.)
│   │   ├── routing.ts             # Re-exports routing from root
│   │   └── request.ts             # Re-exports request from root
│   │
│   ├── middleware.ts              # Locale detection middleware
│   │
│   ├── app/
│   │   ├── page.tsx               # Root redirect to /en
│   │   └── [locale]/
│   │       ├── layout.tsx         # Sets dir="rtl" or "ltr"
│   │       ├── globals.css        # RTL styles
│   │       └── page.tsx           # Home page
│   │
│   └── components/
│       ├── LanguageSwitcher.tsx   # Language toggle button
│       └── Layout/
│           ├── Header.tsx         # Includes LanguageSwitcher
│           ├── TopBar.tsx
│           └── SiteFooter.tsx
│
├── messages/                      # Translation files
│   ├── en.json                    # English translations
│   └── ar.json                    # Arabic translations
│
└── next.config.ts                 # Points to ./i18n/request.ts
```

## 🔗 Import Paths

### From Components:
```typescript
// ✅ Correct
import { Link, useRouter } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
```

### From Middleware:
```typescript
// ✅ Correct
import { routing } from '../i18n/routing';
```

### From Layout:
```typescript
// ✅ Correct
import { getMessages } from 'next-intl/server';
```

## 🎯 Key Files Explained

### 1. `i18n/routing.ts` (Root)
- Defines supported locales: `['en', 'ar']`
- Sets default locale: `'en'`
- Exports navigation helpers

### 2. `i18n/request.ts` (Root)
- Loads translation messages
- Validates locale
- Returns config for next-intl

### 3. `src/i18n/navigation.ts`
- Re-exports navigation helpers
- Provides: `Link`, `useRouter`, `usePathname`, `redirect`
- Used by components for locale-aware navigation

### 4. `src/middleware.ts`
- Detects user's locale
- Redirects to appropriate locale route
- Runs on every request

### 5. `src/app/[locale]/layout.tsx`
- Sets `dir="rtl"` for Arabic
- Sets `dir="ltr"` for English
- Wraps app with `NextIntlClientProvider`

### 6. `src/components/LanguageSwitcher.tsx`
- Toggle button for EN ↔ AR
- Uses `useRouter` from `@/i18n/navigation`
- Maintains current route when switching

## ✨ How It Works

1. **User visits site** → Middleware detects locale → Redirects to `/en` or `/ar`
2. **Layout loads** → Sets `dir` attribute → Loads translations
3. **Components render** → Use `useTranslations()` → Display localized text
4. **User clicks switcher** → Router navigates to new locale → Page reloads with new language

## 🔧 Configuration Flow

```
next.config.ts
    ↓ (loads)
i18n/request.ts
    ↓ (uses)
i18n/routing.ts
    ↓ (exports to)
src/i18n/navigation.ts
    ↓ (used by)
Components (Header, LanguageSwitcher, etc.)
```

## ✅ All Imports Fixed

All module resolution errors should now be resolved. The structure follows next-intl best practices with:
- Root `i18n/` for configuration
- `src/i18n/` for component-friendly re-exports
- Proper TypeScript paths via `@/` alias
