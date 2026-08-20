# LessonScriptor Brand Repositioning — Design Spec

**Date**: 2026-08-21
**Repo**: `lessonscriptor-website`
**Status**: Draft for review

## Problem

The current site (cream/terra/orange, Playfair Display headings, warm-editorial
feel) no longer reflects the brand LessonScriptor wants to project. This is a
deliberate **brand repositioning**, not a response to a conversion problem or a
specific UX complaint — the current design isn't "broken," it's the wrong
identity going forward.

## Goals

- Reposition the visual identity toward a premium, minimal, editorial-calm tone
  ("focus" over "tool") across the whole site, all 6 locales, in one cutover.
- Add dark mode (not previously supported).
- Tighten vertical spacing/density slightly for a more contemporary feel.
- Recolor the existing "LS" monogram (`app/icon.svg`) to match; keep the mark itself.

## Non-Goals (YAGNI)

- **No layout/structural changes.** Section order, page composition, grids, and
  component structure stay exactly as they are — this is a skin + spacing pass,
  not a rebuild. (Explicitly ruled out in favor of "tighten spacing" only.)
- **No new automated visual-regression testing.** Verified manually per the plan
  below; flagged as a known gap, not solved here.
- **No logo/mark redesign.** Recolor only.
- **No new pages or content changes.** Existing copy stays; only presentation changes.

## Process notes (how these decisions were reached)

Colors, typography, and spacing direction were generated and compared using the
newly installed `ui-ux-pro-max` skill's local design database
(`search.py --design-system` / `--domain color` / `--domain typography`), then
narrowed via a live side-by-side comparison (static HTML mockups, since the
skill's browser-based visual companion failed to load across all tested browsers
on this machine — likely a corporate cookie/security policy blocking the
localhost session-cookie handshake, confirmed server-side via `curl` with a
cookie jar working correctly while every real browser hung on the redirect).
Static single-file HTML mockups opened directly (`open file.html`, no server)
worked as the fallback and were used for both the brand-direction pick (colors +
type direction) and the heading-font pick.

Two rounds of comparison were shown and picked:
1. Three full directions (Modern Clean SaaS / Energetic Student-Friendly /
   Premium & Minimal) → **Premium & Minimal** chosen.
2. Four heading-font variants on that direction (Playfair upright / Bodoni Moda /
   Cormorant / Source Serif 4) → **Cormorant** chosen.

## Design tokens

### Light mode

| Token | Value | Notes |
|---|---|---|
| `--color-primary` | `#1C1917` | near-black; buttons, headline color |
| `--color-primary-foreground` | `#FFFFFF` | |
| `--color-accent` | `#A16207` | gold; CTAs, highlights |
| `--color-accent-foreground` | `#FFFFFF` | |
| `--color-background` | `#FAFAF9` | |
| `--color-foreground` | `#0C0A09` | |
| `--color-card` | `#FFFFFF` | |
| `--color-card-foreground` | `#0C0A09` | |
| `--color-muted` | `#F5F5F4` | stone-neutral (corrected from the tool's raw `#E8ECF0`, a blue-gray off-family with the rest of the warm/stone palette) |
| `--color-muted-foreground` | `#57534E` | stone-600, same correction |
| `--color-border` | `#D6D3D1` | |
| `--color-destructive` | `#DC2626` | unchanged |
| `--color-destructive-foreground` | `#FFFFFF` | |
| `--color-ring` | `#1C1917` | |

### Dark mode

Per the design database's own rule (`color-dark-mode`: dark mode uses
desaturated/lighter tonal variants, not literal color inversion — contrast
tested separately):

| Token | Value | Notes |
|---|---|---|
| `--color-background` | `#0C0A09` | warm near-black, not pure `#000` |
| `--color-foreground` | `#F5F5F4` | off-white, not pure `#fff` |
| `--color-accent` | `#D4A017` | gold lightened for legibility on dark bg (light mode's `#A16207` fails contrast on near-black) |
| `--color-accent-foreground` | `#1C1917` | |
| `--color-card` | `#292524` | |
| `--color-card-foreground` | `#F5F5F4` | |
| `--color-muted` | `#44403C` | |
| `--color-muted-foreground` | `#A8A29E` | |
| `--color-border` | `#44403C` | |

**Contrast verified (WCAG relative-luminance formula) against `#FAFAF9` light /
`#0C0A09` dark backgrounds:**

| Pair | Ratio | AA (4.5:1 text / 3:1 large) |
|---|---|---|
| `#0C0A09` foreground on `#FAFAF9` bg (light) | 18.92:1 | pass |
| `#F5F5F4` foreground on `#0C0A09` bg (dark) | 18.11:1 | pass |
| `#57534E` muted-foreground on `#FAFAF9` (light) | 7.30:1 | pass |
| `#A8A29E` muted-foreground on `#0C0A09` (dark) | 7.83:1 | pass |
| `#A16207` accent on `#FAFAF9` (light) | 4.71:1 | pass (barely) |
| `#A16207` accent on `#0C0A09` (dark, if used unchanged) | **4.01:1** | **fails** — confirms the lighten-for-dark decision above |
| `#D4A017` accent on `#0C0A09` (dark, as specified) | 8.32:1 | pass |

The one borderline value is `#A16207` on the light background at 4.71:1 — passes
AA for normal text but with little margin; avoid using it for small/thin text
(e.g. don't set 12px accent labels in this color — reserve it for buttons,
larger headings, and icons).

### Typography

- Heading: `Cormorant` (weight 600 for most headings; 400 reserved for large
  display sizes where the thinner weight still reads clearly)
- Body: `Inter` (existing — unchanged)
- **CJK fallback** (new): append `'Noto Serif SC'` to the heading stack and
  `'Noto Sans SC'` to the body stack for the `zh` locale. Neither Cormorant nor
  Inter (nor the previous Playfair Display) cover CJK glyphs, so `zh` headings
  currently silently fall back to the browser default serif. Low-cost fix since
  every font declaration is being touched in this pass anyway.

### Spacing/density

Tighten large section vertical padding by roughly 20-25% sitewide (e.g.
`py-32`→`py-24`, `py-24`→`py-20`). No change to grid/column structure, component
composition, or mobile breakpoints. This is a density adjustment, not a layout
redesign — it stays within the design database's "Standard" density band
(16-64px spacing scale), just at the tighter end of it rather than the current
looser end.

## Implementation approach

**Semantic CSS-variable tokens** (over an in-place hex remap or a hybrid alias
approach): replace `cream-*`/`terra-*`/`accent-*` Tailwind tokens with semantic
names (`background`, `foreground`, `primary`, `accent`, `card`, `muted`,
`border`) backed by CSS custom properties in `globals.css`, redefined under a
`.dark` selector. This matches the token model the design database itself
outputs, and — since dark mode already requires touching every component
regardless of naming choice — costs no extra churn over the alternatives while
leaving token names that mean what they say, long-term.

### Files touched

- `tailwind.config.ts` — new semantic color tokens, `darkMode: 'class'`,
  `fontFamily.heading` / `fontFamily.body`
- `app/globals.css` — CSS variables (`:root` + `.dark` blocks), shared component
  classes (`.btn-primary`, `.btn-secondary`, `.card`, `.eyebrow`, `.badge`,
  `.accent`) rewritten against the new tokens
- `components/Navbar.tsx`, `Footer.tsx`, `CTASection.tsx`, `PricingPacks.tsx`,
  `FAQSection.tsx`, `UninstallForm.tsx`, `CopyButton.tsx`, `ExtensionIcons.tsx`,
  `RelatedPosts.tsx`, `components/blog/*` (7 files) — swap old token classNames
  for new ones; add `dark:` variants where a component has bespoke colors beyond
  the shared classes
- All `app/[locale]/*/page.tsx` (12 pages) — audit hero sections specifically for
  hardcoded hex/old-token classes bypassing the shared classes
- `app/icon.svg` — recolor monogram to the new primary/accent

### Dark mode mechanism

Add `next-themes` (handles SSR/hydration correctly in the App Router — not
worth hand-rolling). `ThemeProvider` wraps the root layout; a sun/moon toggle
goes in `Navbar.tsx`; Tailwind `dark:` variants key off `<html class="dark">`.
Defaults to `prefers-color-scheme`, toggle overrides and persists via
`localStorage`.

### i18n impact

Only one new translatable surface: the dark-mode toggle's accessible
label/tooltip. Add one new key (e.g. `nav.toggleDarkMode`) to `messages/en.json`
and translate into `fr/es/pt/de/zh`, then run the site's existing locale-parity
check script to confirm no locale is missing it. No routing, `generateMetadata`,
or `generateStaticParams` impact — this is presentational only.

## Verification plan

1. `npm run build` — no TypeScript errors; all pages × 6 locales still statically
   generate (60+ blog pages, 12 static pages)
2. `npm run dev` smoke test: homepage, one landing page, one blog post, contact,
   legal — in both light and dark, in `en` and `zh` (CJK fallback fonts matter
   most there)
3. Locale-parity script run after the new i18n key is added

(Contrast is already verified above at the token level — no separate manual
pass needed unless implementation introduces a color combination not listed.)

## Open risk

No automated visual-regression coverage exists in this repo. A future
regression in spacing/contrast on a page not covered by the manual smoke test
would only surface by inspection, not CI. Not solving this now — noted so it
isn't mistaken for an oversight.
