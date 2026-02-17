# Language Switcher Implementation Guide

## ✅ What's Implemented

### 1. Language Switcher Button
**Location:** Header navigation (desktop and mobile)

**Features:**
- Shows "AR" when viewing English site → Click to switch to Arabic
- Shows "EN" when viewing Arabic site → Click to switch to English  
- Globe icon for visual clarity
- Maintains current page route when switching

**Component:** `src/components/LanguageSwitcher.tsx`

### 2. Automatic RTL/LTR Direction
The site automatically switches direction based on language:

- **English (EN)**: `dir="ltr"` (Left-to-Right)
- **Arabic (AR)**: `dir="rtl"` (Right-to-Left)

This is handled in `src/app/[locale]/layout.tsx`:
```typescript
const isRTL = locale === 'ar';
<html lang={locale} dir={isRTL ? 'rtl' : 'ltr'}>
```

### 3. RTL CSS Support
Added comprehensive RTL styles in `src/app/[locale]/globals.css`:
- Text alignment reversal
- Flex direction adjustments
- Carousel controls positioning
- Sheet/Drawer positioning
- Spacing adjustments

## 🎯 How It Works

### User Flow:
1. User visits site → Defaults to `/en` (English, LTR)
2. User clicks language switcher button in header
3. URL changes to `/ar` (Arabic, RTL)
4. Page reloads with:
   - Arabic translations
   - RTL layout
   - Right-aligned text
   - Reversed navigation

### Technical Flow:
```
User clicks button
    ↓
LanguageSwitcher detects current locale
    ↓
Switches to opposite locale (en ↔ ar)
    ↓
Router navigates to new locale route
    ↓
Layout detects locale and sets dir attribute
    ↓
CSS applies RTL styles automatically
    ↓
All text loads from translation files
```

## 📍 Where to Find the Button

### Desktop View:
- Top navigation bar
- Between navigation links and "Book Now" button
- Shows: `[Globe Icon] AR` or `[Globe Icon] EN`

### Mobile View:
- Top right corner
- Next to the hamburger menu icon
- Same appearance as desktop

## 🧪 Testing

### Test English (LTR):
1. Navigate to `http://localhost:3000/en`
2. Verify:
   - Content is in English
   - Text flows left-to-right
   - Navigation is on the left
   - Button shows "AR"

### Test Arabic (RTL):
1. Click the language switcher (or go to `/ar`)
2. Verify:
   - Content is in Arabic
   - Text flows right-to-left
   - Navigation is on the right
   - Button shows "EN"
   - Layout is mirrored

### Test Switching:
1. Start on English page
2. Click "AR" button
3. Verify smooth transition to Arabic RTL
4. Click "EN" button
5. Verify return to English LTR

## 🎨 Customization

### Change Button Style:
Edit `src/components/LanguageSwitcher.tsx`:
```typescript
<Button
  onClick={switchLanguage}
  variant="outline"  // Change to: "default", "ghost", "secondary"
  size="sm"          // Change to: "default", "lg", "icon"
  className="gap-2"
>
```

### Change Button Text:
Edit translation files:
- `messages/en.json` → `"language": { "en": "English", "ar": "عربي" }`
- `messages/ar.json` → `"language": { "en": "English", "ar": "عربي" }`

### Add More Languages:
1. Add locale to `i18n/routing.ts`:
   ```typescript
   locales: ['en', 'ar', 'fr']
   ```
2. Create `messages/fr.json`
3. Update LanguageSwitcher logic for 3+ languages

## 🔧 Files Modified

1. ✅ `src/components/LanguageSwitcher.tsx` - New component
2. ✅ `src/components/Layout/Header.tsx` - Added switcher
3. ✅ `src/app/[locale]/layout.tsx` - RTL/LTR detection
4. ✅ `src/app/[locale]/globals.css` - RTL styles
5. ✅ `messages/en.json` - Language labels
6. ✅ `messages/ar.json` - Language labels

## ✨ Features

✅ Seamless language switching
✅ Automatic RTL/LTR direction
✅ Maintains current page route
✅ Visual feedback (Globe icon)
✅ Mobile responsive
✅ Accessible button
✅ Type-safe with TypeScript
✅ Integrated with next-intl

## 🚀 Ready to Use!

The language switcher is now fully functional. Just run your dev server and test it out:

```bash
npm run dev
```

Then visit:
- English: http://localhost:3000/en
- Arabic: http://localhost:3000/ar

Click the language button in the header to switch between them!
