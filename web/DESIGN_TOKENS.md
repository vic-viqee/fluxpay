# FluxPay Design Tokens & Color System

**Version:** 1.0  
**Last Updated:** December 2, 2025

---

## 🎨 Brand Colors

FluxPay uses a carefully crafted 7-color system representing different semantic meanings and interactions.

### Color Palette Overview

| Color Name | Main (500) | Hex Code | Purpose |
|---|---|---|---|
| **Primary: Digital Blue** | 0074d9 | `#0074d9` | Main brand identity, primary buttons, headers |
| **Secondary: Teal Green** | 00b8a6 | `#00b8a6` | Flow & growth, secondary actions |
| **Tertiary: Sunset Orange** | ff6633 | `#ff6633` | Calls-to-action, emphasis, special features |
| **Success: Emerald** | 22c55e | `#22c55e` | Success states, confirmations, positive feedback |
| **Info: Sky Blue** | 0ea5e9 | `#0ea5e9` | Informational messages, hints, neutral actions |
| **Warning: Amber** | f59e0b | `#f59e0b` | Warnings, cautions, attention-needed states |
| **Danger: Crimson Red** | ef4444 | `#ef4444` | Errors, deletions, critical actions |

---

## 📊 Color Shade System

Each color has 6 shade levels for different use cases:

### Shade Definitions

| Shade | Lightness | Use Case | Example |
|---|---|---|---|
| **50** | Very Light | Backgrounds, light surfaces, hover backgrounds | `bg-primary-50` |
| **200** | Light | Borders, subtle separators, light UI elements | `border-primary-200` |
| **400** | Medium-Light | Focus rings, subtle indicators | `focus:ring-primary-400` |
| **500** | Main | Primary usage, default state | `bg-primary-500` |
| **600** | Medium-Dark | Hover states, interactive feedback | `hover:bg-primary-600` |
| **700** | Dark | Pressed states, emphasis | `active:bg-primary-700` |

### Color Shade Grid

```
Primary: Digital Blue
├─ 50:  #f0f6ff  (very light blue background)
├─ 200: #b3d9ff  (light blue border/accent)
├─ 400: #4da3ff  (medium blue focus indicator)
├─ 500: #0074d9  (main brand blue) ⭐
├─ 600: #0052a3  (hover state)
└─ 700: #003d7a  (pressed state)

Secondary: Teal Green
├─ 50:  #f0fdf9  (very light teal background)
├─ 200: #99ede5  (light teal border)
├─ 400: #33d1c1  (medium teal focus)
├─ 500: #00b8a6  (main teal) ⭐
├─ 600: #008b7d  (hover state)
└─ 700: #006d65  (pressed state)

Tertiary: Sunset Orange
├─ 50:  #fff5f0  (very light orange background)
├─ 200: #ffcab3  (light orange border)
├─ 400: #ff9966  (medium orange focus)
├─ 500: #ff6633  (main sunset orange) ⭐
├─ 600: #e64d1a  (hover state)
└─ 700: #cc3d0d  (pressed state)

Success: Emerald
├─ 50:  #f0fdf4  (very light green background)
├─ 200: #86efac  (light green border)
├─ 400: #4ade80  (medium green focus)
├─ 500: #22c55e  (main emerald) ⭐
├─ 600: #16a34a  (hover state)
└─ 700: #15803d  (pressed state)

Info: Sky Blue
├─ 50:  #f0f9ff  (very light sky background)
├─ 200: #7dd3fc  (light sky border)
├─ 400: #38bdf8  (medium sky focus)
├─ 500: #0ea5e9  (main sky blue) ⭐
├─ 600: #0284c7  (hover state)
└─ 700: #0369a1  (pressed state)

Warning: Amber
├─ 50:  #fffbf0  (very light amber background)
├─ 200: #fcd34d  (light amber border)
├─ 400: #fbbf24  (medium amber focus)
├─ 500: #f59e0b  (main amber) ⭐
├─ 600: #d97706  (hover state)
└─ 700: #b45309  (pressed state)

Danger: Crimson Red
├─ 50:  #fef2f2  (very light red background)
├─ 200: #fecaca  (light red border)
├─ 400: #f87171  (medium red focus)
├─ 500: #ef4444  (main crimson red) ⭐
├─ 600: #dc2626  (hover state)
└─ 700: #b91c1c  (pressed state)

Neutral: Grayscale
├─ 50:  #f9fafb
├─ 100: #f3f4f6
├─ 200: #e5e7eb
├─ 300: #d1d5db
├─ 400: #9ca3af
├─ 500: #6b7280
├─ 600: #4b5563
├─ 700: #374151
├─ 800: #1f2937
└─ 900: #111827
```

---

## 🎯 Usage Guidelines

### Primary Color (Digital Blue)
**When to use:** Brand identity, main CTAs, navigation, primary buttons

```jsx
<button className="bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white px-4 py-2 rounded">
  Primary Action
</button>
```

**Backgrounds:**
```jsx
<div className="bg-primary-50">Light background with blue tint</div>
```

**Borders:**
```jsx
<div className="border border-primary-200">Subtle blue border</div>
```

### Secondary Color (Teal Green)
**When to use:** Secondary actions, flow indicators, growth-related features

```jsx
<button className="bg-secondary-500 hover:bg-secondary-600 text-white">
  Secondary Action
</button>
```

### Success Color (Emerald)
**When to use:** Successful operations, confirmations, positive feedback

```jsx
<div className="bg-success-50 border-l-4 border-success-500 text-success-700 p-4">
  ✅ Operation completed successfully!
</div>
```

### Error Color (Crimson Red)
**When to use:** Errors, deletions, critical warnings

```jsx
<div className="bg-danger-50 border-l-4 border-danger-500 text-danger-700 p-4">
  ❌ An error occurred. Please try again.
</div>
```

### Warning Color (Amber)
**When to use:** Warnings, cautions, alerts

```jsx
<div className="bg-warning-50 border-l-4 border-warning-500 text-warning-700 p-4">
  ⚠️ This action cannot be undone.
</div>
```

### Info Color (Sky Blue)
**When to use:** Information, hints, neutral notifications

```jsx
<div className="bg-info-50 border-l-4 border-info-500 text-info-700 p-4">
  ℹ️ Here's some helpful information.
</div>
```

---

## 💡 Interactive States Pattern

### Button States

```tsx
<button className="
  bg-primary-500           // Default state
  hover:bg-primary-600     // Hover
  active:bg-primary-700    // Pressed
  focus:ring-2 focus:ring-primary-400  // Focus ring
  disabled:opacity-50      // Disabled
">
  Click me
</button>
```

### Form Focus States

```tsx
<input 
  className="
    border-neutral-200
    focus:border-primary-500
    focus:ring-2 focus:ring-primary-400
    focus:ring-opacity-50
  "
/>
```

### Alert/Notification Pattern

```tsx
// Success Alert
<div className="bg-success-50 border-l-4 border-success-500">
  <p className="text-success-700">Success message</p>
</div>

// Error Alert
<div className="bg-danger-50 border-l-4 border-danger-500">
  <p className="text-danger-700">Error message</p>
</div>

// Warning Alert
<div className="bg-warning-50 border-l-4 border-warning-500">
  <p className="text-warning-700">Warning message</p>
</div>

// Info Alert
<div className="bg-info-50 border-l-4 border-info-500">
  <p className="text-info-700">Info message</p>
</div>
```

---

## 🏗️ Component Color Mapping

| Component | Default Color | Alternative | State Feedback |
|---|---|---|---|
| Primary Button | `primary-500` | `tertiary-500` | `primary-600` (hover), `primary-700` (active) |
| Secondary Button | `secondary-500` | `neutral-400` | `secondary-600` (hover), `secondary-700` (active) |
| Link/Text | `primary-500` | - | `primary-600` (hover) |
| Input Border | `neutral-200` | - | `primary-500` (focus) |
| Badge/Tag | Contextual | - | Based on type (success, warning, etc.) |
| Card Background | `white` | `neutral-50` | `neutral-100` (hover, optional) |
| Divider | `neutral-200` | - | - |
| Text Primary | `neutral-900` | - | - |
| Text Secondary | `neutral-600` | - | - |
| Text Disabled | `neutral-400` | - | - |

---

## 🎨 Tailwind CSS Classes Reference

### Background Colors
```css
bg-primary-50 through bg-primary-700
bg-secondary-50 through bg-secondary-700
bg-success-50 through bg-success-700
bg-warning-50 through bg-warning-700
bg-danger-50 through bg-danger-700
bg-info-50 through bg-info-700
bg-neutral-50 through bg-neutral-900
```

### Text Colors
```css
text-primary-500, text-secondary-500, text-success-500, etc.
text-neutral-900 (for primary text)
text-neutral-600 (for secondary text)
```

### Border Colors
```css
border-primary-200, border-primary-500, etc.
border-t-primary-500 (top border)
border-l-primary-500 (left border)
```

### Ring Colors (Focus States)
```css
focus:ring-primary-400
focus:ring-secondary-400
focus:ring-danger-400
```

---

## 📱 Responsive & Dark Mode

Currently, this design system is optimized for light mode. Dark mode support can be added by extending Tailwind with `darkMode` configuration.

---

## ✅ Implementation Checklist

- [x] Color palette defined in `tailwind.config.cjs`
- [ ] Create reusable Button component with color variants
- [ ] Create Alert/Toast component using color system
- [ ] Create Badge component
- [ ] Apply colors to all UI pages
- [ ] Test contrast ratios for accessibility
- [ ] Document component library with color examples

---

## 📖 References

- **Tailwind Colors:** https://tailwindcss.com/docs/customizing-colors
- **WCAG Contrast:** https://webaim.org/resources/contrastchecker/
- **Color Psychology:** https://www.nngroup.com/articles/color-ui-design/
