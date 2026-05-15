import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        surface: {
          base: "#0A0A0F",
          card: "rgba(255, 255, 255, 0.05)",
          "card-hover": "rgba(255, 255, 255, 0.08)",
          border: "rgba(255, 255, 255, 0.08)",
          "border-bright": "rgba(255, 255, 255, 0.12)",
        },
        accent: {
          teal: "#2DD4BF",
          gold: "#F59E0B",
          "gold-light": "#FCD34D",
        },
        text: {
          primary: "rgba(255, 255, 255, 0.95)",
          secondary: "rgba(255, 255, 255, 0.6)",
          tertiary: "rgba(255, 255, 255, 0.4)",
        },
      },
      backdropBlur: {
        glass: "20px",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0, 0, 0, 0.4)",
        "glass-sm": "0 4px 16px rgba(0, 0, 0, 0.3)",
        glow: "0 0 20px rgba(245, 158, 11, 0.15)",
      },
      keyframes: {
        "drift-1": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
        },
        "drift-2": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(-40px, 30px) scale(0.95)" },
          "66%": { transform: "translate(25px, -40px) scale(1.05)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "drift-1": "drift-1 20s ease-in-out infinite",
        "drift-2": "drift-2 25s ease-in-out infinite",
        "fade-up": "fade-up 0.6s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
