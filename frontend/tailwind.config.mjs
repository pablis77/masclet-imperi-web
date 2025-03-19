/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
  ],
  darkMode: 'class', // Activar modo oscuro basado en clase
  theme: {
    extend: {
      colors: {
        // Paleta de colores Masclet Imperi (estilo Lemon Squeezy)
        primary: '#88c425',     // Verde lima (color corporativo)
        secondary: '#262626',   // Negro suave
        tertiary: '#f7f7f7',    // Gris muy claro para fondos
        
        // Colores semánticos
        success: '#88c425',     // Verde lima (mismo que primary)
        warning: '#f59e0b',     // Ámbar suave
        danger: '#ef4444',      // Rojo suave
        info: '#3b82f6',        // Azul informativo
        
        // Colores específicos para la app
        alletar: '#88c425',     // Verde lima para amamantando
        
        // Colores de texto
        'text-primary': '#262626',    // Texto principal (casi negro)
        'text-secondary': '#6b7280',  // Texto secundario (gris)
        'text-muted': '#9ca3af',      // Texto atenuado

        // Colores para modo oscuro
        dark: {
          bg: '#1e293b',           // Fondo oscuro
          card: '#334155',         // Fondo de tarjetas en modo oscuro
          border: '#475569',       // Bordes en modo oscuro
          text: '#f1f5f9',         // Texto principal en modo oscuro
          'text-secondary': '#cbd5e1', // Texto secundario en modo oscuro
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      screens: {
        'sm': '320px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      borderRadius: {
        'sm': '0.25rem',
        DEFAULT: '0.375rem',
        'md': '0.5rem',
        'lg': '1rem',
        'xl': '1.5rem',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
}