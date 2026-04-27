import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50:  '#FDFBF7',
          100: '#FAF6EF',
          200: '#F0EAE0',
          300: '#E5DDD0',
        },
        accent: {
          400: '#F0A050',
          500: '#E8913A',
          600: '#D97E2A',
          700: '#C26A1A',
        },
        terra: {
          800: '#2A1F1A',
          900: '#1F1712',
          950: '#15100C',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '10px',
        lg: '16px',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(26,23,20,0.04), 0 1px 2px rgba(26,23,20,0.06)',
        md: '0 4px 16px rgba(26,23,20,0.06), 0 1px 4px rgba(26,23,20,0.04)',
        lg: '0 8px 32px rgba(26,23,20,0.08), 0 2px 8px rgba(26,23,20,0.04)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}

export default config
