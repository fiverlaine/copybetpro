/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        'primary-light': '#818cf8',
        'primary-dark': '#4f46e5',
        'accent-cyan': '#06b6d4',
        'accent-purple': '#a855f7',
        'accent-pink': '#ec4899',
        'accent-orange': '#f97316',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
    }
  },
  plugins: []
};
