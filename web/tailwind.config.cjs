module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Primary: Digital Blue
        primary: {
          50: '#f0f6ff',
          200: '#b3d9ff',
          400: '#4da3ff',
          500: '#0074d9', // Main brand blue
          600: '#0052a3',
          700: '#003d7a',
        },
        // Secondary: Teal Green
        secondary: {
          50: '#f0fdf9',
          200: '#99ede5',
          400: '#33d1c1',
          500: '#00b8a6', // Teal main
          600: '#008b7d',
          700: '#006d65',
        },
        // Tertiary: Sunset Orange
        tertiary: {
          50: '#fff5f0',
          200: '#ffcab3',
          400: '#ff9966',
          500: '#ff6633', // Sunset orange main
          600: '#e64d1a',
          700: '#cc3d0d',
        },
        // Success: Emerald
        success: {
          50: '#f0fdf4',
          200: '#86efac',
          400: '#4ade80',
          500: '#22c55e', // Emerald main
          600: '#16a34a',
          700: '#15803d',
        },
        // Info: Sky Blue
        info: {
          50: '#f0f9ff',
          200: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9', // Sky blue main
          600: '#0284c7',
          700: '#0369a1',
        },
        // Warning: Amber
        warning: {
          50: '#fffbf0',
          200: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b', // Amber main
          600: '#d97706',
          700: '#b45309',
        },
        // Danger: Crimson Red
        danger: {
          50: '#fef2f2',
          200: '#fecaca',
          400: '#f87171',
          500: '#ef4444', // Crimson red main
          600: '#dc2626',
          700: '#b91c1c',
        },
        // Neutral/Grayscale (for text, dividers, etc.)
        neutral: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
      },
      borderRadius: {
        xs: '0.25rem',
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
        full: '9999px',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
}
