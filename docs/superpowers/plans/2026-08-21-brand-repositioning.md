# LessonScriptor Brand Repositioning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reposition lessonscriptor.com from its current cream/terra/orange warm-editorial look to a premium, near-black/gold, Cormorant+Inter identity, add dark mode, and tighten section spacing — across the whole site, all 6 locales, in one cutover, with no layout/structural changes.

**Architecture:** Introduce semantic CSS-variable color tokens (`--color-primary`, `--color-accent`, `--color-background`, etc.) redefined under a `.dark` class, replacing the old `cream-*`/`terra-*`/`accent-*` Tailwind tokens everywhere they're used. Add `next-themes` for the dark-mode toggle/persistence. Every component/page keeps its exact current structure — only className tokens and a handful of `dark:` overrides change.

**Tech Stack:** Next.js 14.2.3 (App Router), Tailwind CSS 3.4.1, next-intl 3.14, next-themes (new dependency).

**Spec:** `docs/superpowers/specs/2026-08-21-brand-repositioning-design.md`

## Global Constraints

- All 6 locales (`en`, `fr`, `es`, `pt`, `de`, `zh`) must build and render correctly after every task — run `npm run build` before committing each task.
- No layout, spacing-*structure*, grid, or component-composition changes — only colors, typography, a few explicit `dark:` overrides, and the specific vertical-padding tightening below.
- No new automated visual-regression tests are being added (confirmed non-goal in the spec) — verification is `npm run build` + manual smoke check.
- Never hardcode translatable text (existing repo rule — not touched by this plan, but don't violate it while editing files).
- `localePrefix: 'always'` and all existing routing must remain unchanged.

### Token Migration Map (single source of truth for every task below)

CSS variables (defined in Task 2):

| Semantic token | Light value | Dark value |
|---|---|---|
| `--color-primary` | `#1C1917` | *(unchanged — see Task 5 note on Footer)* |
| `--color-primary-hover` | `#0C0A09` | *(unchanged)* |
| `--color-primary-foreground` | `#FFFFFF` | *(unchanged)* |
| `--color-accent` | `#A16207` | `#D4A017` |
| `--color-accent-hover` | `#7C4A05` | `#E8B923` |
| `--color-accent-foreground` | `#FFFFFF` | `#1C1917` |
| `--color-background` | `#FAFAF9` | `#0C0A09` |
| `--color-foreground` | `#0C0A09` | `#F5F5F4` |
| `--color-card` | `#FFFFFF` | `#292524` |
| `--color-card-foreground` | `#0C0A09` | `#F5F5F4` |
| `--color-muted` | `#F5F5F4` | `#44403C` |
| `--color-muted-foreground` | `#57534E` | `#A8A29E` |
| `--color-border` | `#D6D3D1` | `#44403C` |
| `--color-destructive` | `#DC2626` | *(unchanged)* |
| `--color-ring` | `#1C1917` | *(unchanged)* |

Tailwind class rename rules (apply by exact prefix+token match; `hover:` prefix always routes to the `-hover` token):

| Old class pattern | New class |
|---|---|
| `bg-terra-800*`, `border-terra-800*` | `bg-primary*` / `border-primary*` |
| `text-terra-800*` (incl. `/NN` opacity suffixes) | `text-foreground*` |
| `hover:bg-terra-900` | `hover:bg-primary-hover` |
| `bg-terra-950` | `bg-primary` (Footer: see Task 5 exception) |
| `bg-cream-50*` | `bg-background*` |
| `text-cream-50*`, `text-cream-100*` (light text on a dark surface) | `text-primary-foreground*` |
| `bg-cream-100*` | `bg-muted*` |
| `border-cream-200*` | `border-border*` |
| `text-accent-500*`, `bg-accent-500*`, `border-accent-500*` (incl. `/NN`) | same prefix + `accent*` |
| `border-accent-400/NN` | same prefix + `accent/NN` (scale collapses into the single `accent` token + opacity modifier) |
| `hover:*-accent-600`, `hover:*-accent-700` | `hover:*-accent-hover` |
| bare (non-`hover:`) `accent-600` / `accent-700` | `accent` (static darker text use collapses to the one semantic token) |

Font rename: `font-serif` → keep the utility name but point it at `Cormorant` instead of `Playfair Display` (Task 1). No className changes needed for typography — only the font file behind `font-serif` changes.

---

### Task 1: Semantic color tokens + font config in Tailwind

**Files:**
- Modify: `tailwind.config.ts`

**Interfaces:**
- Produces: Tailwind color utilities (`bg-primary`, `text-foreground`, `bg-accent`, etc.) resolving to CSS variables consumed by every later task. Produces `font-heading` (Cormorant) as an addition; `font-serif` is repointed to Cormorant.

- [ ] **Step 1: Replace the color/font sections of `tailwind.config.ts`**

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          foreground: 'var(--color-primary-foreground)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
          foreground: 'var(--color-accent-foreground)',
        },
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        card: {
          DEFAULT: 'var(--color-card)',
          foreground: 'var(--color-card-foreground)',
        },
        muted: {
          DEFAULT: 'var(--color-muted)',
          foreground: 'var(--color-muted-foreground)',
        },
        border: 'var(--color-border)',
        destructive: 'var(--color-destructive)',
        ring: 'var(--color-ring)',
      },
      fontFamily: {
        serif: ['Cormorant', 'Georgia', 'serif'],
        heading: ['Cormorant', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '10px',
        lg: '16px',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(12,10,9,0.04), 0 1px 2px rgba(12,10,9,0.06)',
        md: '0 4px 16px rgba(12,10,9,0.06), 0 1px 4px rgba(12,10,9,0.04)',
        lg: '0 8px 32px rgba(12,10,9,0.08), 0 2px 8px rgba(12,10,9,0.04)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}

export default config
```

Note the shadow rgba base changed from the old terra `26,23,20` to the new near-black `12,10,9` — same shadow shape, recolored to match the new foreground.

- [ ] **Step 2: Verify build fails predictably (CSS vars not defined yet)**

Run: `npm run build`
Expected: build **fails or produces unstyled output** referencing `var(--color-primary)` etc. with no definition — this is expected until Task 2. Do not treat this as a blocker; proceed to Task 2 before the next real verification checkpoint.

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.ts
git commit -m "feat: add semantic color tokens and Cormorant heading font to Tailwind config"
```

---

### Task 2: CSS variables + shared component classes in globals.css

**Files:**
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: Tailwind tokens from Task 1 (`bg-primary`, `text-foreground`, etc.)
- Produces: `:root` and `.dark` CSS variable definitions; rewritten `.btn-primary`, `.btn-secondary`, `.eyebrow`, `.section-header`, `.card`, `.badge`, `.accent`, `.prose-custom` component classes that every other task's components rely on.

- [ ] **Step 1: Replace `app/globals.css` in full**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-primary: #1C1917;
    --color-primary-hover: #0C0A09;
    --color-primary-foreground: #FFFFFF;
    --color-accent: #A16207;
    --color-accent-hover: #7C4A05;
    --color-accent-foreground: #FFFFFF;
    --color-background: #FAFAF9;
    --color-foreground: #0C0A09;
    --color-card: #FFFFFF;
    --color-card-foreground: #0C0A09;
    --color-muted: #F5F5F4;
    --color-muted-foreground: #57534E;
    --color-border: #D6D3D1;
    --color-destructive: #DC2626;
    --color-ring: #1C1917;
  }

  .dark {
    --color-accent: #D4A017;
    --color-accent-hover: #E8B923;
    --color-accent-foreground: #1C1917;
    --color-background: #0C0A09;
    --color-foreground: #F5F5F4;
    --color-card: #292524;
    --color-card-foreground: #F5F5F4;
    --color-muted: #44403C;
    --color-muted-foreground: #A8A29E;
    --color-border: #44403C;
    /* --color-primary and --color-primary-hover intentionally NOT redefined:
       primary is already near-black and stays constant across both modes.
       See Task 5 for the one place (Footer) that needs an explicit dark:
       override because of this. */
  }

  html {
    scroll-behavior: smooth;
  }
  body {
    @apply bg-background antialiased;
    color: var(--color-foreground);
    line-height: 1.6;
  }
}

@layer components {
  /* ── Buttons ── */
  .btn-primary {
    @apply inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-semibold py-3 px-7 rounded-full shadow-sm transition-all duration-200;
  }
  .btn-primary:hover {
    @apply bg-primary-hover scale-[1.02];
  }
  .btn-secondary {
    @apply inline-flex items-center justify-center gap-2 bg-card text-foreground text-sm font-semibold py-3 px-7 rounded-full border border-border shadow-sm transition-all duration-200;
  }
  .btn-secondary:hover {
    @apply bg-muted scale-[1.02];
  }

  /* ── Eyebrow ── */
  .eyebrow {
    @apply text-[11px] font-bold tracking-[2.5px] uppercase text-accent mb-4;
  }

  /* ── Section header ── */
  .section-header {
    @apply text-center mb-14;
  }
  .section-header h2 {
    @apply font-serif text-4xl md:text-5xl font-semibold text-foreground tracking-tight leading-tight;
  }
  .section-header p {
    @apply text-[15px] text-foreground/60 mt-4 max-w-xl mx-auto leading-relaxed;
  }

  /* ── Cards ── */
  .card {
    @apply bg-card/80 backdrop-blur-sm rounded-2xl border border-border shadow-sm p-6 transition-all duration-200;
  }
  .card:hover {
    @apply shadow-md -translate-y-0.5;
  }

  /* ── Badge ── */
  .badge {
    @apply inline-flex items-center gap-1.5 bg-muted border border-border text-accent text-[10px] font-bold tracking-wider uppercase py-1 px-3.5 rounded-full;
  }

  /* ── Accent text ── */
  .accent {
    @apply font-serif italic text-accent;
  }

  /* ── Prose (blog/content pages) ── */
  .prose-custom h2 {
    @apply font-serif text-2xl font-semibold text-foreground mt-10 mb-4;
  }
  .prose-custom h3 {
    @apply font-serif text-xl font-semibold text-foreground mt-8 mb-3;
  }
  .prose-custom p {
    @apply text-foreground/70 leading-relaxed mb-4;
  }
  .prose-custom ul {
    @apply list-disc list-inside space-y-2 text-foreground/70 mb-4;
  }
  .prose-custom ol {
    @apply list-decimal list-inside space-y-2 text-foreground/70 mb-4;
  }
}
```

Note `.section-header h2` and `.prose-custom h2/h3` changed `font-bold` → `font-semibold`: Cormorant's bold weight (700) at heading sizes reads heavier than Playfair's did at the same weight — semibold (600) matches the visual weight the spec's mockups were picked on. `text-terra-800` (`#2A1F1A`) directly in the old `body` rule is replaced by `var(--color-foreground)` so the base text color also switches under `.dark`.

- [ ] **Step 2: Run build**

Run: `npm run build`
Expected: **PASS** — no TypeScript/CSS errors, all locale pages still statically generate. (Components still reference old `cream-*`/`terra-*`/`accent-*` classes at this point — Tailwind will simply no longer generate those utilities since they're removed from the config in Task 1, so any element still using them will silently lose that styling until later tasks fix it. This is expected and temporary; do not stop to "fix" it here.)

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: define light/dark CSS variables and rewrite shared component classes"
```

---

### Task 3: next-themes wiring + font loading

**Files:**
- Modify: `package.json` (add dependency)
- Create: `components/ThemeProvider.tsx`
- Modify: `app/[locale]/layout.tsx`

**Interfaces:**
- Produces: `ThemeProvider` (default export from `components/ThemeProvider.tsx`, wraps children, `'use client'`) used by Task 4's `ThemeToggle`.

- [ ] **Step 1: Add the dependency**

```bash
npm install next-themes
```

- [ ] **Step 2: Create `components/ThemeProvider.tsx`**

```tsx
'use client'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemesProvider>
  )
}
```

- [ ] **Step 3: Wrap the root layout and update font loading**

In `app/[locale]/layout.tsx`, replace the `<head>` font link and the `<body>` block:

```tsx
import ThemeProvider from '@/components/ThemeProvider'
```//  add this import near the top with the other component imports

Replace:
```tsx
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Navbar locale={locale} />
          <main>{children}</main>
          <Footer locale={locale} />
        </NextIntlClientProvider>
      </body>
```

with:
```tsx
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href={`https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Cormorant:wght@400;600;700${locale === 'zh' ? '&family=Noto+Serif+SC:wght@600;700&family=Noto+Sans+SC:wght@400;500;600' : ''}&display=swap`}
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <NextIntlClientProvider messages={messages}>
            <Navbar locale={locale} />
            <main>{children}</main>
            <Footer locale={locale} />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
```

`suppressHydrationWarning` on `<body>` is next-themes' documented requirement — it sets the theme class before React hydrates, which otherwise triggers a one-time, harmless hydration mismatch warning. The `zh`-only Noto Serif/Sans SC load keeps the extra font weight off the other 5 locales, since Cormorant/Inter already cover them.

- [ ] **Step 4: Run build**

Run: `npm run build`
Expected: PASS, no TypeScript errors on the new import/prop.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json components/ThemeProvider.tsx "app/[locale]/layout.tsx"
git commit -m "feat: wire next-themes and switch font loading to Cormorant + Inter"
```

---

### Task 4: Dark-mode toggle + Navbar migration + i18n key

**Files:**
- Create: `components/ThemeToggle.tsx`
- Modify: `components/Navbar.tsx`
- Modify: `messages/en.json`, `messages/fr.json`, `messages/es.json`, `messages/pt.json`, `messages/de.json`, `messages/zh.json`

**Interfaces:**
- Consumes: `ThemeProvider` context from Task 3 (via `useTheme` from `next-themes`)
- Produces: `ThemeToggle` default export, rendered inside `Navbar`

- [ ] **Step 1: Create `components/ThemeToggle.tsx`**

```tsx
'use client'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const t = useTranslations('nav')

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <span className="w-8 h-8 inline-block" aria-hidden="true" />
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={t('toggleDarkMode')}
      className="w-8 h-8 flex items-center justify-center rounded-full text-foreground/60 hover:text-foreground hover:bg-muted transition-colors"
    >
      {isDark ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.36 6.36l-.7-.7M6.34 6.34l-.7-.7m12.72 0l-.7.7M6.34 17.66l-.7.7M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  )
}
```

The `mounted` guard is required with `next-themes`: `resolvedTheme` is `undefined` on the server, so rendering the real icon before the client mounts would produce a light/dark flash and a hydration mismatch. The `aria-hidden` placeholder keeps layout stable while waiting.

- [ ] **Step 2: Add the i18n key to all 6 locale files**

Add to the `nav` object in `messages/en.json`:
```json
"toggleDarkMode": "Toggle dark mode"
```

Add the equivalent to the other 5 files' `nav` object:
- `fr.json`: `"toggleDarkMode": "Basculer le mode sombre"`
- `es.json`: `"toggleDarkMode": "Alternar modo oscuro"`
- `pt.json`: `"toggleDarkMode": "Alternar modo escuro"`
- `de.json`: `"toggleDarkMode": "Dunkelmodus umschalten"`
- `zh.json`: `"toggleDarkMode": "切换深色模式"`

- [ ] **Step 3: Run the locale-parity check**

```bash
node -e "
const fs = require('fs');
const en = JSON.parse(fs.readFileSync('messages/en.json','utf8'));
function getLeafKeys(obj, p='') {
  return Object.entries(obj).flatMap(([k,v]) => {
    const path = p ? \`\${p}.\${k}\` : k;
    return (v && typeof v==='object' && !Array.isArray(v)) ? getLeafKeys(v,path) : [path];
  });
}
const enKeys = new Set(getLeafKeys(en));
for (const l of ['fr','es','pt','de','zh']) {
  const d = JSON.parse(fs.readFileSync(\`messages/\${l}.json\`,'utf8'));
  const lKeys = new Set(getLeafKeys(d));
  const missing = [...enKeys].filter(k => !lKeys.has(k));
  console.log(missing.length ? \`FAIL \${l} MISSING: \${missing.join(', ')}\` : \`OK \${l}\`);
}
"
```
Expected: `OK` for all 5 locales.

- [ ] **Step 4: Migrate and update `components/Navbar.tsx`**

Replace the full file:

```tsx
'use client'
import { useTranslations } from 'next-intl'
import { Link } from '@/navigation'
import { useState } from 'react'
import ThemeToggle from './ThemeToggle'

const LOCALES = [
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
  { code: 'es', label: 'ES' },
  { code: 'pt', label: 'PT' },
  { code: 'de', label: 'DE' },
  { code: 'zh', label: '中文' },
]

export default function Navbar({ locale }: { locale: string }) {
  const t = useTranslations('nav')
  const ts = useTranslations('site')
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-background backdrop-blur-xl border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 no-underline">
            <span className="font-serif text-lg font-bold text-foreground tracking-tight">
              Lesson<span className="text-accent">Scriptor</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-7 text-[13px] font-medium">
            <Link href="/transcribe-video-to-text" className="text-foreground/60 no-underline hover:text-foreground transition-colors">{t('transcribeVideo')}</Link>
            <Link href="/transcribe-youtube-video" className="text-foreground/60 no-underline hover:text-foreground transition-colors">{t('youtube')}</Link>
            <Link href="/live-captions-chrome" className="text-foreground/60 no-underline hover:text-foreground transition-colors">{t('liveCaptions')}</Link>
            <Link href="/for-adhd-students" className="text-foreground/60 no-underline hover:text-foreground transition-colors">{t('forAdhd')}</Link>
            <Link href="/blog" className="text-foreground/60 no-underline hover:text-foreground transition-colors">{t('blog')}</Link>
            <Link href="/contact" className="text-foreground/60 no-underline hover:text-foreground transition-colors">{t('contact')}</Link>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {/* Locale switcher */}
            <div className="flex items-center gap-1">
              {LOCALES.map(l => (
                <Link
                  key={l.code}
                  href="/"
                  locale={l.code}
                  className={`text-[10px] px-1.5 py-0.5 rounded font-semibold transition-colors ${
                    locale === l.code ? 'bg-accent/10 text-accent' : 'text-foreground/30 hover:text-foreground/60'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>
            <ThemeToggle />
            <a
              href="https://chromewebstore.google.com/detail/lessonscriptor/apofgfejefeeepabfbaabdijnokbpcgp"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-[13px] py-2 px-5"
            >
              {ts('installCTA').split(' — ')[0]}
            </a>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-foreground/60">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {open
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-3">
          <Link href="/transcribe-video-to-text" className="block text-sm text-foreground/60 hover:text-foreground py-2">{t('transcribeVideo')}</Link>
          <Link href="/transcribe-youtube-video" className="block text-sm text-foreground/60 hover:text-foreground py-2">{t('youtube')}</Link>
          <Link href="/live-captions-chrome" className="block text-sm text-foreground/60 hover:text-foreground py-2">{t('liveCaptions')}</Link>
          <Link href="/for-adhd-students" className="block text-sm text-foreground/60 hover:text-foreground py-2">{t('forAdhd')}</Link>
          <Link href="/blog" className="block text-sm text-foreground/60 hover:text-foreground py-2">{t('blog')}</Link>
          <Link href="/contact" className="block text-sm text-foreground/60 hover:text-foreground py-2">{t('contact')}</Link>
          <div className="flex items-center gap-2 pt-2">
            {LOCALES.map(l => (
              <Link key={l.code} href="/" locale={l.code}
                className={`text-xs px-2 py-1 rounded font-medium ${locale === l.code ? 'bg-accent/10 text-accent' : 'text-foreground/30'}`}>
                {l.label}
              </Link>
            ))}
            <ThemeToggle />
          </div>
          <a href="https://chromewebstore.google.com/detail/lessonscriptor/apofgfejefeeepabfbaabdijnokbpcgp" target="_blank" rel="noopener noreferrer" className="btn-primary w-full justify-center text-sm mt-2">
            {ts('installCTA').split(' — ')[0]}
          </a>
        </div>
      )}
    </nav>
  )
}
```

- [ ] **Step 5: Run build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/ThemeToggle.tsx components/Navbar.tsx messages/*.json
git commit -m "feat: add dark-mode toggle and migrate Navbar to semantic tokens"
```

---

### Task 5: Migrate Footer.tsx (with the dark-mode band exception)

**Files:**
- Modify: `components/Footer.tsx`

- [ ] **Step 1: Replace the full file**

```tsx
import { useTranslations } from 'next-intl'
import NextLink from 'next/link'
import { Link } from '@/navigation'

export default function Footer({ locale }: { locale: string }) {
  const t = useTranslations('footer')
  const s = useTranslations('site')
  const base = `/${locale}`

  return (
    <footer className="bg-primary dark:bg-card text-primary-foreground/40 dark:text-card-foreground/40 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="font-serif text-lg font-bold text-primary-foreground dark:text-card-foreground mb-2">
              Lesson<span className="text-accent">Scriptor</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">{t('tagline')}</p>
            <a
              href="https://chromewebstore.google.com/detail/lessonscriptor/apofgfejefeeepabfbaabdijnokbpcgp"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-xs bg-accent text-accent-foreground px-4 py-2 rounded-full hover:bg-accent-hover transition-colors"
            >
              {s('footerInstall')}
            </a>
          </div>

          {/* Product */}
          <div>
            <div className="text-primary-foreground dark:text-card-foreground font-semibold text-sm mb-4">{t('product')}</div>
            <ul className="space-y-2 text-sm">
              <li><Link href="/transcribe-youtube-video" className="hover:text-primary-foreground dark:hover:text-card-foreground transition-colors">YouTube</Link></li>
              <li><Link href="/live-captions-chrome" className="hover:text-primary-foreground dark:hover:text-card-foreground transition-colors">Live Captions</Link></li>
              <li><Link href="/transcribe-video-to-text" className="hover:text-primary-foreground dark:hover:text-card-foreground transition-colors">Video to Text</Link></li>
              <li><Link href="/compare/otter-ai-alternative" className="hover:text-primary-foreground dark:hover:text-card-foreground transition-colors">vs Otter.ai</Link></li>
              <li><Link href="/for-adhd-students" className="hover:text-primary-foreground dark:hover:text-card-foreground transition-colors">For ADHD Students</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <div className="text-primary-foreground dark:text-card-foreground font-semibold text-sm mb-4">{t('resources')}</div>
            <ul className="space-y-2 text-sm">
              <li><Link href="/blog" className="hover:text-primary-foreground dark:hover:text-card-foreground transition-colors">{t('blog')}</Link></li>
              <li><NextLink href={`${base}/blog/how-to-transcribe-lecture-videos`} className="hover:text-primary-foreground dark:hover:text-card-foreground transition-colors">How to Transcribe Lectures</NextLink></li>
              <li><NextLink href={`${base}/blog/how-to-take-notes-with-adhd`} className="hover:text-primary-foreground dark:hover:text-card-foreground transition-colors">Note-taking for ADHD</NextLink></li>
              <li><NextLink href={`${base}/blog/best-chrome-extensions-live-captions`} className="hover:text-primary-foreground dark:hover:text-card-foreground transition-colors">Best Chrome Live Captions</NextLink></li>
              <li><Link href="/onboarding" className="hover:text-primary-foreground dark:hover:text-card-foreground transition-colors">{t('guide')}</Link></li>
              <li><Link href="/contact" className="hover:text-primary-foreground dark:hover:text-card-foreground transition-colors">{t('support')}</Link></li>
              <li><Link href="/privacy" className="hover:text-primary-foreground dark:hover:text-card-foreground transition-colors">{t('privacy')}</Link></li>
            </ul>
          </div>

          {/* Languages */}
          <div>
            <div className="text-primary-foreground dark:text-card-foreground font-semibold text-sm mb-4">{t('languages')}</div>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" locale="en" className="hover:text-primary-foreground dark:hover:text-card-foreground transition-colors">English</Link></li>
              <li><Link href="/" locale="fr" className="hover:text-primary-foreground dark:hover:text-card-foreground transition-colors">Français</Link></li>
              <li><Link href="/" locale="es" className="hover:text-primary-foreground dark:hover:text-card-foreground transition-colors">Español</Link></li>
              <li><Link href="/" locale="pt" className="hover:text-primary-foreground dark:hover:text-card-foreground transition-colors">Português</Link></li>
              <li><Link href="/" locale="de" className="hover:text-primary-foreground dark:hover:text-card-foreground transition-colors">Deutsch</Link></li>
              <li><Link href="/" locale="zh" className="hover:text-primary-foreground dark:hover:text-card-foreground transition-colors">中文</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 dark:border-card-foreground/10 pt-8 text-xs flex flex-col md:flex-row justify-between gap-4">
          <p>{t('copyright')}</p>
          <p>{s('footerPrivacy')}</p>
        </div>
      </div>
    </footer>
  )
}
```

This is the one component with explicit `dark:` overrides: in light mode the footer is `bg-primary` (near-black band on the light page — same effect as before). In dark mode it switches to `bg-card` (`#292524`) instead of staying `bg-primary` (`#1C1917`), because the page background in dark mode is `#0C0A09` — nearly identical to `#1C1917` — and the footer would otherwise visually disappear into the page. `bg-card` (`#292524`) is lighter than the dark-mode page background, preserving the "distinct darker/lighter band" effect the site had in light mode.

- [ ] **Step 2: Run build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/Footer.tsx
git commit -m "feat: migrate Footer to semantic tokens with dark-mode band fix"
```

---

### Task 6: Migrate CTASection.tsx, FAQSection.tsx, CopyButton.tsx

**Files:**
- Modify: `components/CTASection.tsx` (lines 6, 8, 10, 12, 19 per current grep)
- Modify: `components/FAQSection.tsx` (lines 16, 19, 24, 26, 27, 30, 36)
- Modify: `components/CopyButton.tsx` (line 16)

- [ ] **Step 1: Apply the Token Migration Map to `components/CTASection.tsx`**

Current old-token lines: `6:bg-terra-900` (this is a static bg, not a hover — check the surrounding code: it's the CTASection's own dark card background, so it maps to `bg-primary`, not `primary-hover`, since it's not inside a `hover:` prefix), `8:text-cream-100` → `text-primary-foreground`, `10:text-accent-500` → `text-accent`, `12:text-cream-200/60` → `text-primary-foreground/60`, `19:text-terra-800` → `text-foreground`, `19:hover:bg-cream-100` → `hover:bg-muted`.

Read the file, then replace each occurrence per that mapping (the surrounding JSX structure is unchanged — only the className token strings change).

- [ ] **Step 2: Apply the Token Migration Map to `components/FAQSection.tsx`**

Current old-token lines: `16:text-terra-800`, `19:text-accent-500`, `24:border-cream-200`, `26:border-cream-200`, `27:hover:text-accent-500`, `27:text-terra-800`, `30:text-terra-800/30`, `36:text-terra-800/60` — all map per the table (`terra-800*` → `foreground*`, `accent-500` → `accent`, `border-cream-200` → `border-border`).

- [ ] **Step 3: Apply the Token Migration Map to `components/CopyButton.tsx`**

Current old-token line: `16:bg-accent-500` → `bg-accent`, `16:hover:bg-accent-600` → `hover:bg-accent-hover`.

- [ ] **Step 4: Run build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 5: Verify no old tokens remain**

```bash
grep -c "cream-\|terra-\|accent-[0-9]" components/CTASection.tsx components/FAQSection.tsx components/CopyButton.tsx
```
Expected: `0` for all three.

- [ ] **Step 6: Commit**

```bash
git add components/CTASection.tsx components/FAQSection.tsx components/CopyButton.tsx
git commit -m "feat: migrate CTASection, FAQSection, CopyButton to semantic tokens"
```

---

### Task 7: Migrate PricingPacks.tsx, UninstallForm.tsx, RelatedPosts.tsx

**Files:**
- Modify: `components/PricingPacks.tsx` (lines 56, 60, 78, 79, 83, 87, 90, 93, 97, 101, 107, 111)
- Modify: `components/UninstallForm.tsx` (lines 66, 69, 83, 86, 89, 93, 102, 103, 117, 118, 122)
- Modify: `components/RelatedPosts.tsx` (lines 23, 25, 37, 39, 42, 45, 48)

- [ ] **Step 1: Apply the Token Migration Map to `components/PricingPacks.tsx`**

This file uses `text-cream-50*` (lines 60, 87, 90, 101, 107, 111) as light text on what's a dark-styled pricing card — map to `text-primary-foreground*` (preserving `/NN` opacity suffixes exactly as they are). It also uses the `accent-400` lighter tint (lines 56, 78, 93, 97) — map to `accent` + the same opacity modifier already present (e.g. `border-accent-400/25` → `border-accent/25`). Static `accent-600` (line 79, 83, 90 — wait, 79/83 are non-hover: `border-accent-600` and `bg-accent-600`) — check each: if the surrounding class is a `hover:` variant, route to `accent-hover`; if it's the pricing card's "recommended" highlighted-tier static styling (a permanent accent-colored border/bg, not a hover state), map to `accent` directly since that's the intended static emphasis color, not a hover-darken.

- [ ] **Step 2: Apply the Token Migration Map to `components/UninstallForm.tsx`**

Straightforward application of `terra-800*` → `foreground*`, `cream-100`/`cream-200` → `muted`/`border`, `accent-500*` → `accent*`, `accent-600` (line 122, static) → `accent`.

- [ ] **Step 3: Apply the Token Migration Map to `components/RelatedPosts.tsx`**

`terra-800*` → `foreground*`, `cream-100`/`cream-200` → `muted`/`border`, `accent-500*`/`accent-600` → `accent*` (all static uses here, no `hover:` prefix on the accent occurrences per the grep — confirm when editing; if any turn out to be `group-hover:text-accent-600` treat that as the hover case → `group-hover:text-accent-hover`).

- [ ] **Step 4: Run build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 5: Verify no old tokens remain**

```bash
grep -c "cream-\|terra-\|accent-[0-9]" components/PricingPacks.tsx components/UninstallForm.tsx components/RelatedPosts.tsx
```
Expected: `0` for all three.

- [ ] **Step 6: Commit**

```bash
git add components/PricingPacks.tsx components/UninstallForm.tsx components/RelatedPosts.tsx
git commit -m "feat: migrate PricingPacks, UninstallForm, RelatedPosts to semantic tokens"
```

---

### Task 8: Migrate the 8 blog components

**Files:**
- Modify: `components/blog/AppCard.tsx` (lines 21, 25, 27, 29, 33, 40, 47, 50, 53, 56, 63, 69)
- Modify: `components/blog/BlogPostCard.tsx` (lines 22, 25, 28, 33, 37, 42)
- Modify: `components/blog/BlogSectionRenderer.tsx` (lines 18, 28, 49, 50, 54, 55, 57, 58, 59, 66, 129, 153, 161)
- Modify: `components/blog/CategoryFilter.tsx` (lines 31, 32, 43, 44)
- Modify: `components/blog/ComparisonTable.tsx` (lines 12, 16, 18, 26, 28, 46, 50, 52, 60, 62)
- Modify: `components/blog/InlineMarkdown.tsx` (lines 36, 45)
- Modify: `components/blog/SummarySection.tsx` (lines 18, 19, 26, 36, 45, 49, 53)
- Modify: `components/blog/TldrSection.tsx` (lines 19, 20, 22, 28, 29, 39, 40, 52, 54, 55, 66, 67, 68, 69)

- [ ] **Step 1: Apply the Token Migration Map to each file above**

Every occurrence in all 8 files is one of: `terra-800*` → `foreground*`, `cream-50`/`cream-100`/`cream-200` → `background`/`muted`/`border` respectively, `accent-500*` → `accent*`, bare `accent-600` (BlogSectionRenderer:161, SummarySection:36, TldrSection:20) → `accent` unless it's specifically inside a `hover:`/`group-hover:` class (check each at edit time — none of the greps above show a `hover:` prefix on these particular lines, so default to the static `accent` mapping, not `accent-hover`).

Work through the 8 files in this order (smallest first, to build up pattern-matching speed before the two larger files): `InlineMarkdown.tsx`, `CategoryFilter.tsx`, `SummarySection.tsx`, `BlogPostCard.tsx`, `ComparisonTable.tsx`, `AppCard.tsx`, `TldrSection.tsx`, `BlogSectionRenderer.tsx`.

- [ ] **Step 2: Run build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Verify no old tokens remain**

```bash
grep -c "cream-\|terra-\|accent-[0-9]" components/blog/*.tsx
```
Expected: `0` for all 8 files.

- [ ] **Step 4: Commit**

```bash
git add components/blog/*.tsx
git commit -m "feat: migrate all blog components to semantic tokens"
```

---

### Task 9: Migrate the homepage + tighten its spacing

**Files:**
- Modify: `app/[locale]/page.tsx`

This is the largest single file (44 `terra-800`, 21 `cream-50`, 20 `cream-200`, 16 `accent-500`, 15 `accent-400`, 8 `cream-100`, 8 `accent-600`, 2 `terra-900`, 1 `cream-300`, 1 `accent-700` occurrences, plus 10 `py-24`).

- [ ] **Step 1: Get exact current line numbers before editing**

```bash
grep -noE "(cream|terra|accent)-[0-9]+[a-zA-Z0-9/.:_-]*|py-24" "app/[locale]/page.tsx"
```

- [ ] **Step 2: Apply the Token Migration Map**

Same rules as every prior task: `terra-800*` → `foreground*` (or `primary*` if it's a `bg-`/`border-` on a solid dark surface — check each), `terra-900` (hover) → `primary-hover`, `cream-50` → `background`, `cream-100` → `muted`, `cream-200`/`cream-300` → `border`, `accent-400` → `accent` (+ same opacity suffix if present), `accent-500` → `accent`, `accent-600`/`accent-700` → `accent-hover` if `hover:`-prefixed, else `accent`.

- [ ] **Step 3: Tighten vertical spacing**

Replace every `py-24` with `py-20` (10 occurrences). This is the only spacing change on this page — no other padding/margin/grid values change.

- [ ] **Step 4: Run build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 5: Verify no old tokens remain**

```bash
grep -c "cream-\|terra-\|accent-[0-9]\|py-24" "app/[locale]/page.tsx"
```
Expected: `0`.

- [ ] **Step 6: Commit**

```bash
git add "app/[locale]/page.tsx"
git commit -m "feat: migrate homepage to semantic tokens and tighten section spacing"
```

---

### Task 10: Migrate the 5 landing pages + tighten spacing

**Files:**
- Modify: `app/[locale]/transcribe-video-to-text/page.tsx` (23 `terra-800`, 4 `cream-100`, 2 `accent-500`, 1 `cream-50`, 1 `cream-200`, 6 `py-16`)
- Modify: `app/[locale]/transcribe-youtube-video/page.tsx` (18 `terra-800`, 6 `cream-200`, 5 `cream-100`, 1 `accent-500`, 5 `py-16`)
- Modify: `app/[locale]/live-captions-chrome/page.tsx` (13 `terra-800`, 5 `cream-200`, 5 `cream-100`, 1 `accent-500`, 5 `py-16`)
- Modify: `app/[locale]/for-adhd-students/page.tsx` (11 `terra-800`, 3 `cream-200`, 3 `cream-100`, 1 `terra-900`, 1 `accent-500`, 5 `py-16`)
- Modify: `app/[locale]/compare/otter-ai-alternative/page.tsx` (14 `terra-800`, 8 `accent-500`, 5 `cream-200`, 5 `cream-100`, 4 `py-16`)

- [ ] **Step 1: For each of the 5 files, get exact current line numbers**

```bash
for f in "app/[locale]/transcribe-video-to-text/page.tsx" "app/[locale]/transcribe-youtube-video/page.tsx" "app/[locale]/live-captions-chrome/page.tsx" "app/[locale]/for-adhd-students/page.tsx" "app/[locale]/compare/otter-ai-alternative/page.tsx"; do
  echo "=== $f ==="
  grep -noE "(cream|terra|accent)-[0-9]+[a-zA-Z0-9/.:_-]*|py-16" "$f"
done
```

- [ ] **Step 2: Apply the Token Migration Map to each of the 5 files**

Same rules as Task 9. `for-adhd-students/page.tsx`'s one `terra-900` occurrence is a hover state (`hover:bg-terra-900`, matching the button pattern seen elsewhere) → `hover:bg-primary-hover`.

- [ ] **Step 3: Tighten vertical spacing in each of the 5 files**

Replace every `py-16` with `py-14` (matches the ~15-20% tightening applied to the homepage's `py-24`→`py-20`, scaled proportionally for this smaller base value).

- [ ] **Step 4: Run build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 5: Verify no old tokens remain**

```bash
grep -c "cream-\|terra-\|accent-[0-9]\|py-16" "app/[locale]/transcribe-video-to-text/page.tsx" "app/[locale]/transcribe-youtube-video/page.tsx" "app/[locale]/live-captions-chrome/page.tsx" "app/[locale]/for-adhd-students/page.tsx" "app/[locale]/compare/otter-ai-alternative/page.tsx"
```
Expected: `0` for all 5.

- [ ] **Step 6: Commit**

```bash
git add "app/[locale]/transcribe-video-to-text/page.tsx" "app/[locale]/transcribe-youtube-video/page.tsx" "app/[locale]/live-captions-chrome/page.tsx" "app/[locale]/for-adhd-students/page.tsx" "app/[locale]/compare/otter-ai-alternative/page.tsx"
git commit -m "feat: migrate landing pages to semantic tokens and tighten section spacing"
```

---

### Task 11: Migrate the blog hub + blog post template + tighten spacing

**Files:**
- Modify: `app/[locale]/blog/page.tsx` (2 `terra-800`, 1 `accent-500`, 1 `py-16`)
- Modify: `app/[locale]/blog/[slug]/page.tsx` (9 `terra-800`, 4 `accent-500`, 2 `cream-200`, 1 `accent-600`, 1 `py-12`)

- [ ] **Step 1: Get exact current line numbers**

```bash
grep -noE "(cream|terra|accent)-[0-9]+[a-zA-Z0-9/.:_-]*|py-16|py-12" "app/[locale]/blog/page.tsx" "app/[locale]/blog/[slug]/page.tsx"
```

- [ ] **Step 2: Apply the Token Migration Map**

Same rules as prior tasks. The `accent-600` in `[slug]/page.tsx` — check if `hover:`-prefixed; map accordingly.

- [ ] **Step 3: Spacing**

`blog/page.tsx`: `py-16` → `py-14`. `blog/[slug]/page.tsx`: leave `py-12` unchanged — it's already at the tight end of the current scale, same reasoning as the utility pages in Task 12.

- [ ] **Step 4: Run build**

Run: `npm run build`
Expected: PASS — this is the highest-leverage build check in the whole plan, since these two templates generate 60+ pages (`BLOG_SLUGS × 6 locales`). Confirm the build output still reports the same page count as before this task.

- [ ] **Step 5: Verify no old tokens remain**

```bash
grep -c "cream-\|terra-\|accent-[0-9]" "app/[locale]/blog/page.tsx" "app/[locale]/blog/[slug]/page.tsx"
```
Expected: `0` for both.

- [ ] **Step 6: Commit**

```bash
git add "app/[locale]/blog/page.tsx" "app/[locale]/blog/[slug]/page.tsx"
git commit -m "feat: migrate blog hub and post template to semantic tokens"
```

---

### Task 12: Migrate the utility/legal pages + tighten spacing

**Files:**
- Modify: `app/[locale]/contact/page.tsx` (4 `cream-200`, 1 `cream-100`, 1 `py-16`, 1 `py-12`)
- Modify: `app/[locale]/privacy/page.tsx` (12 `terra-800`, 4 `accent-500`, 1 `cream-200`, 1 `py-16`)
- Modify: `app/[locale]/terms/page.tsx` (16 `terra-800`, 2 `accent-500`, 1 `cream-200`, 1 `py-16`)
- Modify: `app/[locale]/onboarding/page.tsx` (34 `terra-800`, 7 `cream-200`, 6 `accent-500`, 5 `cream-100`, 1 `cream-50`, 1 `accent-600`, 1 `py-20`)
- Modify: `app/[locale]/thank-you/page.tsx` (9 `terra-800`, 2 `cream-200`, 2 `accent-500`, 1 `cream-50`, 1 `cream-100`, 1 `py-20`)
- Modify: `app/[locale]/uninstall/page.tsx` (1 `cream-50`, 1 `py-20`)

- [ ] **Step 1: Get exact current line numbers for each file**

```bash
for f in "app/[locale]/contact/page.tsx" "app/[locale]/privacy/page.tsx" "app/[locale]/terms/page.tsx" "app/[locale]/onboarding/page.tsx" "app/[locale]/thank-you/page.tsx" "app/[locale]/uninstall/page.tsx"; do
  echo "=== $f ==="
  grep -noE "(cream|terra|accent)-[0-9]+[a-zA-Z0-9/.:_-]*|py-20|py-16|py-12" "$f"
done
```

- [ ] **Step 2: Apply the Token Migration Map to each of the 6 files**

Same rules as every prior task.

- [ ] **Step 3: Tighten spacing**

`contact/page.tsx`: `py-16` → `py-14`; leave its `py-12` unchanged. `privacy/page.tsx`, `terms/page.tsx`: `py-16` → `py-14`. `onboarding/page.tsx`, `thank-you/page.tsx`, `uninstall/page.tsx`: `py-20` → `py-16`.

- [ ] **Step 4: Run build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 5: Verify no old tokens remain**

```bash
grep -c "cream-\|terra-\|accent-[0-9]" "app/[locale]/contact/page.tsx" "app/[locale]/privacy/page.tsx" "app/[locale]/terms/page.tsx" "app/[locale]/onboarding/page.tsx" "app/[locale]/thank-you/page.tsx" "app/[locale]/uninstall/page.tsx"
```
Expected: `0` for all 6.

- [ ] **Step 6: Final repo-wide sweep — confirm zero old-token references anywhere**

```bash
grep -rlE "cream-[0-9]|terra-[0-9]|accent-[0-9]" --include="*.tsx" app components || echo "CLEAN — no old tokens remain"
```
Expected: `CLEAN — no old tokens remain`. If any file is listed, it was missed by an earlier task — go back and migrate it before proceeding.

- [ ] **Step 7: Commit**

```bash
git add "app/[locale]/contact/page.tsx" "app/[locale]/privacy/page.tsx" "app/[locale]/terms/page.tsx" "app/[locale]/onboarding/page.tsx" "app/[locale]/thank-you/page.tsx" "app/[locale]/uninstall/page.tsx"
git commit -m "feat: migrate utility and legal pages to semantic tokens"
```

---

### Task 13: Recolor the icon/favicon

**Files:**
- Modify: `app/icon.svg`

- [ ] **Step 1: Replace the full file**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- Background: near-black primary -->
  <rect width="64" height="64" rx="12" fill="#1C1917"/>
  <!-- "L" in off-white -->
  <text
    x="7"
    y="47"
    font-family="Georgia, 'Times New Roman', serif"
    font-size="40"
    font-weight="700"
    fill="#FAFAF9"
    letter-spacing="-1"
  >L</text>
  <!-- "S" in gold (lightened variant — legible against the near-black background,
       same reasoning as the dark-mode accent token) -->
  <text
    x="33"
    y="47"
    font-family="Georgia, 'Times New Roman', serif"
    font-size="40"
    font-weight="700"
    fill="#D4A017"
    letter-spacing="-1"
  >S</text>
</svg>
```

The mark keeps the exact same shape/positions as before (per the earlier "recolor to match, don't redesign" decision) — only the three fill colors change, and they use the dark-mode gold value (`#D4A017`) rather than the light-mode one (`#A16207`) specifically because the icon's background is near-black, the same contrast reasoning as the dark-mode tokens.

- [ ] **Step 2: Verify visually**

```bash
open app/icon.svg
```
Confirm it renders as a near-black rounded square with an off-white "L" and gold "S".

- [ ] **Step 3: Commit**

```bash
git add app/icon.svg
git commit -m "feat: recolor LS monogram favicon to match new brand palette"
```

---

### Task 14: Final verification pass

**Files:** none (verification only)

- [ ] **Step 1: Full production build**

```bash
npm run build
```
Expected: PASS. Confirm the reported static page count matches what it was before this plan started (12 static pages + 60+ blog pages × 6 locales — no page should have been added, removed, or failed to generate).

- [ ] **Step 2: Repo-wide old-token sweep (repeat of Task 12 Step 6, as a final gate)**

```bash
grep -rlE "cream-[0-9]|terra-[0-9]|accent-[0-9]" --include="*.tsx" app components || echo "CLEAN"
```
Expected: `CLEAN`.

- [ ] **Step 3: Dev server smoke test**

```bash
npm run dev
```
Manually visit and check both light and dark (toggle via the new Navbar button) for:
- `/` (homepage, `en`)
- `/transcribe-video-to-text` (main money page, `en`)
- `/blog/how-to-transcribe-lecture-videos` (a blog post, `en`)
- `/contact` (`en`)
- `/zh` (homepage) and `/zh/blog/how-to-transcribe-lecture-videos` — confirm Cormorant/Inter render for Latin text and Noto Serif/Sans SC render for the Chinese text, in both light and dark

Check specifically: no old cream/orange colors visible anywhere, dark mode toggle persists across a page navigation (next-themes uses `localStorage`), footer is visually distinct from the page background in dark mode (the Task 5 fix).

- [ ] **Step 4: Locale-parity re-check**

Re-run the script from Task 4 Step 3 — expected still `OK` for all 5 non-English locales (confirms no later task accidentally introduced a locale-specific string without translating it, though none of these tasks add new translatable text beyond the Task 4 key).

- [ ] **Step 5: Final commit (if any smoke-test fixes were needed)**

If Step 3 surfaced any missed old-token spot or visual issue, fix it, re-run Steps 1–3, then:

```bash
git add -A
git commit -m "fix: address issues found in brand repositioning smoke test"
```

If no issues were found, no commit is needed here — the plan is complete as of Task 13's commit.
