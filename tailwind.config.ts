import type { Config } from 'tailwindcss';
import forms from '@tailwindcss/forms';

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        background: '#0b0b0b',
        surface: '#111111',
        'surface-elevated': '#1a1a1a',
        border: '#2a2a2a',
        primary: {
          DEFAULT: '#86efac',
          50: '#e6fbf2',
          500: '#86efac',
          600: '#4ade80',
          700: '#22c55e',
        },
        danger: {
          DEFAULT: '#f43f5e',
          500: '#f43f5e',
          600: '#e11d48',
        },
        accent: {
          DEFAULT: '#8b5cf6',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        text: {
          primary: '#e7e9ec',
          muted: '#8b91a0',
        },
      },
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'monospace',
        ],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.8125rem', { lineHeight: '1.125rem' }],
        base: ['0.875rem', { lineHeight: '1.25rem' }],
        lg: ['1rem', { lineHeight: '1.375rem' }],
        xl: ['1.125rem', { lineHeight: '1.5rem' }],
        '2xl': ['1.375rem', { lineHeight: '1.75rem' }],
        '3xl': ['1.75rem', { lineHeight: '2.125rem' }],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(255,255,255,0.04), 0 8px 24px rgba(0,0,0,0.3)',
        'glow-sm': '0 0 0 1px rgba(255,255,255,0.04), 0 2px 8px rgba(0,0,0,0.25)',
        'glow-primary':
          '0 0 0 1px rgba(0,217,126,0.35), 0 8px 24px rgba(0,217,126,0.15)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(2px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [forms({ strategy: 'class' })],
};

export default config;
