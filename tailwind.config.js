/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#F59E0B",
        "primary-light": "#FBBF24",
        "primary-dark": "#D97706",
        "accent-cyan": "#14B8A6",
        "accent-teal": "#2DD4BF",
        "accent-purple": "#8B5CF6",
        "accent-pink": "#EC4899",
        "accent-orange": "#F97316",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        info: "#3B82F6",
      },
    },
  },
  plugins: [],
};
