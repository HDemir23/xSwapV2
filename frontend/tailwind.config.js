/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Uniswap-style dark theme
        "bg-primary": "#0D0D0D",
        "bg-secondary": "#1B1A1A",
        "bg-card": "#1B1A1A",
        "bg-hover": "#2B2B2B",
        // Pink accent (Uniswap style)
        "pink-primary": "#FF007A",
        "pink-hover": "#FF3392",
        // Text colors
        "text-primary": "#FFFFFF",
        "text-secondary": "#9B9B9B",
        "text-muted": "#5E5E5E",
        // Status colors
        success: "#22C55E",
        warning: "#EAB308",
        error: "#EF4444",
        info: "#3B82F6",
        // Legacy aliases for backwards compatibility
        "sakura-light": "#FFE4E8",
        "sakura-medium": "#FF007A",
        "sakura-dark": "#E8909C",
        "sakura-accent": "#FF3392",
      },
      borderRadius: {
        sm: "12px",
        md: "16px",
        lg: "20px",
        xl: "24px",
      },
    },
  },
  plugins: [],
};
