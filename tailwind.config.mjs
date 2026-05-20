/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Fiscal Precision Design System
        surface: {
          DEFAULT: '#f7f9fb',
          dim: '#d8dadc',
          bright: '#f7f9fb',
          container: {
            lowest: '#ffffff',
            low: '#f2f4f6',
            DEFAULT: '#eceef0',
            high: '#e6e8ea',
            highest: '#e0e3e5',
          },
        },
        'on-surface': {
          DEFAULT: '#191c1e',
          variant: '#45464d',
        },
        'inverse-surface': '#2d3133',
        'inverse-on-surface': '#eff1f3',
        outline: {
          DEFAULT: '#76777d',
          variant: '#c6c6cd',
        },
        primary: {
          DEFAULT: '#000000',
          container: '#131b2e',
          fixed: {
            DEFAULT: '#dae2fd',
            dim: '#bec6e0',
          },
        },
        'on-primary': {
          DEFAULT: '#ffffff',
          container: '#7c839b',
          fixed: {
            DEFAULT: '#131b2e',
            variant: '#3f465c',
          },
        },
        secondary: {
          DEFAULT: '#515f74',
          container: '#d5e3fd',
          fixed: {
            DEFAULT: '#d5e3fd',
            dim: '#b9c7e0',
          },
        },
        'on-secondary': {
          DEFAULT: '#ffffff',
          container: '#57657b',
          fixed: {
            DEFAULT: '#0d1c2f',
            variant: '#3a485c',
          },
        },
        tertiary: {
          DEFAULT: '#000000',
          container: '#271901',
          fixed: {
            DEFAULT: '#fcdeb5',
            dim: '#dec29a',
          },
        },
        'on-tertiary': {
          DEFAULT: '#ffffff',
          container: '#98805d',
          fixed: {
            DEFAULT: '#271901',
            variant: '#574425',
          },
        },
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
        },
        'on-error': {
          DEFAULT: '#ffffff',
          container: '#93000a',
        },
        // Functional category colors
        emergency: '#dc2626',
        investment: '#eab308',
        retirement: '#16a34a',
        contingency: '#2563eb',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'headline-lg': ['32px', { lineHeight: '40px', fontWeight: '700', letterSpacing: '-0.02em' }],
        'headline-md': ['24px', { lineHeight: '32px', fontWeight: '600', letterSpacing: '-0.01em' }],
        'data-display': ['20px', { lineHeight: '28px', fontWeight: '600', letterSpacing: '-0.01em' }],
        'body-md': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'table-data': ['13px', { lineHeight: '18px', fontWeight: '500' }],
        'label-caps': ['11px', { lineHeight: '16px', fontWeight: '700', letterSpacing: '0.05em' }],
        'mono-data': ['12px', { lineHeight: '16px', fontWeight: '400' }],
      },
      borderRadius: {
        sm: '0.125rem',
        DEFAULT: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
      maxWidth: {
        container: '1280px',
      },
      spacing: {
        gutter: '1.5rem',
        'margin-mobile': '1rem',
        'stack-sm': '0.5rem',
        'stack-md': '1rem',
        'stack-lg': '2rem',
      },
      boxShadow: {
        'card': '0px 1px 3px rgba(0,0,0,0.05)',
        'modal': '0px 10px 15px -3px rgba(0,0,0,0.1)',
      },
    },
  },
  plugins: [],
}
