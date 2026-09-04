import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#FF6A3D", dark: "#E85A2F" },
        cta: { DEFAULT: "#16A34A", dark: "#15803D" },
        page: "#F3F4F6",
        ink: "#1A1A1A",
        muted: "#6B7280",
        off: "#E11D48",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 18px 40px rgba(15,23,42,.08), 0 4px 12px rgba(15,23,42,.05)",
        clay: "0 22px 48px rgba(15,23,42,.1), 0 8px 18px rgba(15,23,42,.06), inset 0 1px 0 rgba(255,255,255,.65)",
      },
    },
  },
  plugins: [],
};

export default config;
