# i18n Routing Implementation Guide

## ✅ Complete i18n Routing Setup

All routing in the application now properly handles internationalization with locale prefixes in URLs.

## 🔧 Configuration

### Routing Config (`i18n/routing.ts`)
```typescript
export const routing = defineRouting({
  locales: ['en', 'ar'],
  defaultLocale: 'en',
  localePrefix: 'always'  // ← Ensures locale is always in URL
});
```

### Middleware (`src/middleware.ts`)
- Automatically detects and adds locale to URLs
- Redirects `/` → `/en` (default locale)
- Redirects `/packages` → `/en/packages`
- Maintains locale when navigating between pages

## 📍 URL Structure

### Automatic Locale Handling

**Without locale in URL:**
```
/              → Redirects to /en
/packages      → Redirects to /en/packages
/visa          → Redirects to /en/visa
```

**With locale in URL:**
```
/en            → English homepage
/en/packages   → English packages page
/ar            → Arabic homepage
/ar/packages   → Arabic packages page
```

## 🔗 Proper Link Usage

### ✅ CORRECT - Using i18n Link

```typescript
import { Link } from "@/i18n/navigation";

// Maintains current locale
<Link href="/packages">Packages</Link>

// If user is on /en/home → goes to /en/packages
// If user is on /ar/home → goes to /ar/packages
```

### ❌ INCORRECT - Using Next.js Link

```typescript
import Link from "next/link";

// Loses locale context!
<Link href="/packages">Packages</Link>
// Would go to /packages (then redirect to /en/packages)
```

## 📦 Updated Components

All components now use i18n-aware imports:

### 1. **Homepage** (`src/app/[locale]/page.tsx`)
```typescript
import { Link, useRouter } from "@/i18n/navigation";
```

### 2. **Packages Page** (`src/app/[locale]/packages/page.tsx`)
```typescript
import { Link } from "@/i18n/navigation";
```

### 3. **Header** (`src/components/layout/Header.tsx`)
```typescript
import { Link } from "@/i18n/navigation";
```

### 4. **Footer** (`src/components/layout/Footer.tsx`)
```typescript
import { Link } from "@/i18n/navigation";
```

### 5. **Visa Pages** (`src/app/[locale]/visa/page.tsx`)
```typescript
import { Link, useRouter } from "@/i18n/navigation";
```

### 6. **Language Switcher** (`src/components/LanguageSwitcher.tsx`)
```typescript
import { useRouter, usePathname } from "@/i18n/navigation";
```

## 🎯 Navigation Behavior

### Internal Navigation
All internal links maintain the current locale:

```typescript
// User on /en/home
<Link href="/packages">View Packages</Link>
// → Navigates to /en/packages

// User on /ar/home  
<Link href="/packages">View Packages</Link>
// → Navigates to /ar/packages
```

### Language Switching
Language switcher changes locale while maintaining the current page:

```typescript
// User on /en/packages
// Clicks language switcher to Arabic
// → Navigates to /ar/packages

// User on /ar/visa
// Clicks language switcher to English
// → Navigates to /en/visa
```

### External Links
For external links, use regular `<a>` tags:

```typescript
<a href="https://external-site.com" target="_blank">
  External Link
</a>
```

## 🚀 Router Usage

### Navigation with Router

```typescript
import { useRouter } from "@/i18n/navigation";

function MyComponent() {
  const router = useRouter();
  
  // Maintains locale
  const handleClick = () => {
    router.push('/packages');
    // If on /en → goes to /en/packages
    // If on /ar → goes to /ar/packages
  };
}
```

### Getting Current Pathname

```typescript
import { usePathname } from "@/i18n/navigation";

function MyComponent() {
  const pathname = usePathname();
  // Returns pathname without locale
  // /en/packages → returns "/packages"
  // /ar/packages → returns "/packages"
}
```

### Getting Current Locale

```typescript
import { useLocale } from "next-intl";

function MyComponent() {
  const locale = useLocale();
  // Returns "en" or "ar"
}
```

## 📋 Import Checklist

When creating new components, always use:

✅ **For Links:**
```typescript
import { Link } from "@/i18n/navigation";
```

✅ **For Router:**
```typescript
import { useRouter } from "@/i18n/navigation";
```

✅ **For Pathname:**
```typescript
import { usePathname } from "@/i18n/navigation";
```

✅ **For Locale:**
```typescript
import { useLocale } from "next-intl";
```

✅ **For Translations:**
```typescript
import { useTranslations } from "next-intl";
```

❌ **DON'T Use:**
```typescript
import Link from "next/link";  // ❌
import { useRouter } from "next/navigation";  // ❌
```

## 🔍 Testing Locale Routing

### Test Default Locale Redirect
1. Visit `http://localhost:3000/`
2. Should redirect to `http://localhost:3000/en`

### Test Locale Persistence
1. Visit `http://localhost:3000/en`
2. Click "Packages" link
3. URL should be `http://localhost:3000/en/packages`
4. Switch to Arabic
5. URL should be `http://localhost:3000/ar/packages`
6. Click "Home" link
7. URL should be `http://localhost:3000/ar`

### Test Direct URL Access
1. Visit `http://localhost:3000/packages` directly
2. Should redirect to `http://localhost:3000/en/packages`

## 🎨 Benefits

1. **SEO Friendly**: Each language has its own URL
2. **Shareable Links**: Users can share localized URLs
3. **Browser History**: Back/forward buttons work correctly
4. **Bookmarkable**: Users can bookmark specific language pages
5. **Consistent**: Locale always maintained during navigation
6. **Type Safe**: TypeScript ensures correct usage

## 🔄 Migration Guide

If you have existing components using `next/link`:

### Before:
```typescript
import Link from "next/link";

<Link href="/packages">Packages</Link>
```

### After:
```typescript
import { Link } from "@/i18n/navigation";

<Link href="/packages">Packages</Link>
```

### Router Migration:

### Before:
```typescript
import { useRouter } from "next/navigation";

const router = useRouter();
router.push('/packages');
```

### After:
```typescript
import { useRouter } from "@/i18n/navigation";

const router = useRouter();
router.push('/packages');  // Automatically includes locale
```

## ✨ Summary

All routing is now fully internationalized:
- ✅ Locale always in URL (`/en/...` or `/ar/...`)
- ✅ Default locale redirect (`/` → `/en`)
- ✅ Locale maintained during navigation
- ✅ Language switcher preserves current page
- ✅ All components use i18n-aware imports
- ✅ Type-safe routing with TypeScript
- ✅ SEO-friendly localized URLs

The application now has a complete, production-ready internationalization routing system!
