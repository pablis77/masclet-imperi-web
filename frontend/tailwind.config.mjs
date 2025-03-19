/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
  ],
  darkMode: 'class', // Activar modo oscuro basado en clase
  theme: {
    extend: {
      colors: {
        primary: '#88c425',
        'primary-light': '#a3d350',
        'primary-dark': '#6a9b1d',
        secondary: '#262626',
        'secondary-light': '#3d3d3d',
        'secondary-dark': '#1a1a1a',
        tertiary: '#f7f7f7',
        success: '#88c425',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6',
        alletar: '#88c425',
        'text-primary': '#262626',
        'text-secondary': '#6b7280',
        'text-muted': '#9ca3af',
        'dark-bg': '#1e293b',
        'dark-card': '#334155',
        'dark-border': '#475569',
        'dark-text': '#f1f5f9',
        'dark-text-secondary': '#cbd5e1',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      screens: {
        sm: '320px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.375rem',
        md: '0.5rem',
        lg: '1rem',
        xl: '1.5rem',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
}