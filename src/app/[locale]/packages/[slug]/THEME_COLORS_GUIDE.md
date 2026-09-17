# Package Details Page - Theme Colors Guide

This guide explains how to customize the color scheme for the package details page.

## Current Color Scheme

The site currently uses **Teal (#15868f)** as the primary brand color throughout.

## Color Configuration Files

Theme colors are defined in two places:

1. **Global Colors**: `src/app/[locale]/globals.css` (affects entire site)
2. **Package Detail Colors**: `src/app/[locale]/packages/[id]/package-detail.css` (specific to package pages)

## Current Primary Color (Teal #15868f)

### In globals.css:
```css
:root {
  /* Teal Primary Color #15868f */
  --primary: oklch(0.52 0.08 195);
  --ring: oklch(0.52 0.08 195);
  --chart-1: oklch(0.52 0.08 195);
  --sidebar-primary: oklch(0.52 0.08 195);
  --sidebar-ring: oklch(0.52 0.08 195);
}
```

### In package-detail.css:
```css
:root {
  /* Primary Brand Colors - Teal #15868f */
  --pkg-primary: 186 75% 32%;        /* Teal-600 */
  --pkg-primary-hover: 186 75% 28%; /* Teal-700 (darker) */
  --pkg-primary-light: 186 75% 96%; /* Teal-50 (very light) */
  --pkg-primary-medium: 186 75% 88%; /* Teal-100 (light) */
}
```

## How to Change to a Different Color

### Example: Change to Purple

**In globals.css:**
```css
:root {
  --primary: oklch(0.56 0.18 300);
}
```

**In package-detail.css:**
```css
:root {
  --pkg-primary: 271 81% 56%;        /* Purple-500 */
  --pkg-primary-hover: 271 81% 50%; /* Purple-600 */
  --pkg-primary-light: 271 100% 95%; /* Purple-50 */
  --pkg-primary-medium: 271 100% 90%; /* Purple-100 */
}
```

### Example: Change to Blue

**In globals.css:**
```css
:root {
  --primary: oklch(0.60 0.18 240);
}
```

**In package-detail.css:**
```css
:root {
  --pkg-primary: 217 91% 60%;        /* Blue-500 */
  --pkg-primary-hover: 217 91% 54%; /* Blue-600 */
  --pkg-primary-light: 217 100% 95%; /* Blue-50 */
  --pkg-primary-medium: 217 100% 90%; /* Blue-100 */
}
```

### Example: Change to Red

**In globals.css:**
```css
:root {
  --primary: oklch(0.57 0.24 27);
}
```

**In package-detail.css:**
```css
:root {
  --pkg-primary: 0 72% 51%;          /* Red-600 */
  --pkg-primary-hover: 0 72% 45%;   /* Red-700 */
  --pkg-primary-light: 0 100% 95%;  /* Red-50 */
  --pkg-primary-medium: 0 100% 90%; /* Red-100 */
}
```

## Understanding Color Formats

### HSL Format (used in package-detail.css)
- **Hue**: 0-360 (color wheel position)
- **Saturation**: 0-100% (color intensity)
- **Lightness**: 0-100% (brightness)

### OKLCH Format (used in globals.css)
- **L**: 0-1 (lightness)
- **C**: 0-0.4 (chroma/saturation)
- **H**: 0-360 (hue)

### Common Hue Values:
- Red: 0-20
- Orange: 20-40
- Yellow: 40-60
- Green: 60-180
- Cyan/Teal: 180-200
- Blue: 200-260
- Purple: 260-320
- Pink: 320-360

## CSS Classes Used

The following CSS classes are applied throughout the page:

### Primary Color Classes:
- `.pkg-badge-primary` - Primary badges (Featured Tour, etc.)
- `.pkg-bg-primary` - Primary background
- `.pkg-text-primary` - Primary text color
- `.pkg-icon-primary` - Primary icon color
- `.pkg-btn-primary` - Primary buttons
- `.pkg-tab-active` - Active tab state
- `.pkg-gradient-primary` - Primary gradient
- `.pkg-date-badge` - Date badge gradient

### Status Color Classes:
- `.pkg-status-success` - Success status (green)
- `.pkg-status-warning` - Warning status (amber)
- `.pkg-status-info` - Info status (blue)

### Component-Specific Classes:
- `.pkg-accordion-open` - Accordion open state
- `.pkg-hover-border-primary` - Hover border effect

## Quick Color Change Workflow

1. **For Global Site Colors:**
   - Open `src/app/[locale]/globals.css`
   - Find the `:root` section
   - Update `--primary` with your desired OKLCH value
   - Update `--ring`, `--chart-1`, `--sidebar-primary`, and `--sidebar-ring` to match

2. **For Package Detail Page:**
   - Open `src/app/[locale]/packages/[id]/package-detail.css`
   - Find the `:root` section at the top
   - Update the `--pkg-primary` variables with your desired HSL values
   - Save the file

3. Refresh the page to see changes

## Additional Customization

### Accent Color (Currently Teal Shade)
```css
--pkg-accent: 186 85% 42%;
--pkg-accent-light: 186 85% 95%;
```

### Success Color (Green - unchanged)
```css
--pkg-success: 142 71% 45%;
--pkg-success-light: 142 76% 95%;
--pkg-success-medium: 142 76% 90%;
```

### Warning Color (Amber - unchanged)
```css
--pkg-warning: 38 92% 50%;
--pkg-warning-light: 38 100% 95%;
```

### Info Color (Now using Teal)
```css
--pkg-info: 186 75% 32%;
--pkg-info-light: 186 75% 96%;
--pkg-info-medium: 186 75% 88%;
```

## Notes

- All color changes are centralized in two files
- Changes apply instantly across the entire site
- Maintains consistent theming throughout
- Easy to switch between different brand colors
- The teal color (#15868f) provides a modern, professional look
