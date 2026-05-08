import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050508",
        surface: "#0a0a12",
        "surface-2": "#0d0d18",
        navy: {
          DEFAULT: "#03588C",
          50: "#e6f3f9",
          100: "#b3d9ed",
          200: "#80bfe1",
          300: "#4da5d5",
          400: "#1a8bc9",
          500: "#03588C",
          600: "#024a77",
          700: "#023b61",
          800: "#012d4a",
          900: "#011e33",
        },
        gold: {
          DEFAULT: "#D9CA82",
          light: "#e8dba8",
          dark: "#c4b465",
          muted: "#8a7e4f",
        },
        primary: {
          DEFAULT: "#03588C",
          foreground: "#ffffff",
          muted: "rgba(3,88,140,0.15)",
        },
        secondary: {
          DEFAULT: "#D9CA82",
          foreground: "#050508",
        },
        success: "#22C55E",
        danger: "#EF4444",
        warning: "#F59E0B",
        muted: {
          DEFAULT: "#1a1a2e",
          foreground: "#6B7280",
        },
        border: "rgba(255,255,255,0.07)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-plus-jakarta)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-primary": "linear-gradient(135deg, #03588C, #024a77)",
        "gradient-hero":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(3,88,140,0.25), transparent)",
        "gradient-card":
          "linear-gradient(135deg, rgba(3,88,140,0.08), rgba(3,88,140,0.03))",
      },
      boxShadow: {
        "glow-xs": "0 0 15px rgba(3,88,140,0.2)",
        "glow-sm": "0 0 25px rgba(3,88,140,0.3)",
        "glow-md": "0 0 50px rgba(3,88,140,0.35)",
        "glow-lg": "0 0 90px rgba(3,88,140,0.4)",
        "glow-gold": "0 0 30px rgba(217,202,130,0.25)",
        card: "0 4px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out 1.5s infinite",
        "float-slow": "float 8s ease-in-out 0.5s infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4,0,0.6,1) infinite",
        shimmer: "shimmer 2s linear infinite",
        "border-glow": "border-glow 4s ease-in-out infinite",
        "gradient-x": "gradient-x 8s ease infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "border-glow": {
          "0%, 100%": {
            borderColor: "rgba(3,88,140,0.3)",
            boxShadow: "0 0 20px rgba(3,88,140,0.1)",
          },
          "50%": {
            borderColor: "rgba(3,88,140,0.7)",
            boxShadow: "0 0 40px rgba(3,88,140,0.25)",
          },
        },
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
    },
  },
  plugins: [animate],
};

export default config;
