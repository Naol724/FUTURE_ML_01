import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1200px" },
    },
    extend: {
      colors: {
        // Deep-navy + electric-cyan identity, driven by CSS variables so
        // dark mode only has to swap the variables.
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: "hsl(var(--surface))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        border: "hsl(var(--border))",
        ring: "hsl(var(--ring))",
        navy: {
          DEFAULT: "hsl(var(--navy))",
          foreground: "hsl(var(--navy-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          soft: "hsl(var(--accent-soft))",
        },
        success: "hsl(var(--success))",
        danger: "hsl(var(--danger))",
        warning: "hsl(var(--warning))",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 1px 2px 0 hsl(222 47% 11% / 0.05), 0 4px 16px -4px hsl(222 47% 11% / 0.08)",
        "card-hover":
          "0 2px 4px 0 hsl(222 47% 11% / 0.06), 0 12px 32px -8px hsl(222 47% 11% / 0.14)",
        glow: "0 0 32px -8px hsl(var(--accent) / 0.5)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 0.4s ease both",
        "pulse-dot": "pulse-dot 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
