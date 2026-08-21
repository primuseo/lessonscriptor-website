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
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          hover: 'rgb(var(--color-primary-hover) / <alpha-value>)',
          foreground: 'rgb(var(--color-primary-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
          hover: 'rgb(var(--color-accent-hover) / <alpha-value>)',
          foreground: 'rgb(var(--color-accent-foreground) / <alpha-value>)',
        },
        background: 'rgb(var(--color-background) / <alpha-value>)',
        foreground: 'rgb(var(--color-foreground) / <alpha-value>)',
        card: {
          DEFAULT: 'rgb(var(--color-card) / <alpha-value>)',
          foreground: 'rgb(var(--color-card-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'rgb(var(--color-muted) / <alpha-value>)',
          foreground: 'rgb(var(--color-muted-foreground) / <alpha-value>)',
        },
        border: 'rgb(var(--color-border) / <alpha-value>)',
        destructive: 'rgb(var(--color-destructive) / <alpha-value>)',
        ring: 'rgb(var(--color-ring) / <alpha-value>)',
      },
      fontFamily: {
        serif: ['Cormorant', 'Noto Serif SC', 'Georgia', 'serif'],
        heading: ['Cormorant', 'Noto Serif SC', 'Georgia', 'serif'],
        sans: ['Inter', 'Noto Sans SC', 'system-ui', 'sans-serif'],
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
