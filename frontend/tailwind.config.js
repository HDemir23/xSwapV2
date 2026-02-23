/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-primary": "#1A1415",
        "bg-secondary": "#2D2023",
        "bg-card": "#3D2C30",
        "bg-hover": "#4D3C40",
        "sakura-light": "#FFE4E8",
        "sakura-medium": "#FFB7C5",
        "sakura-dark": "#E8909C",
        "sakura-accent": "#FF69B4",
        "text-primary": "#FFF5F6",
        "text-secondary": "#D4A5A9",
        "text-muted": "#9D7F84",
        success: "#7CB342",
        warning: "#FFB347",
        error: "#FF6B6B",
        info: "#87CEEB",
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
    },
  },
  plugins: [],
};
