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
        fym: {
          background: "#1A1A1B", // Eerie Black
          surface: "#242426",    // Raised Grey
          accent: "#D4D4D4",     // Platinum
          muted: "#8E8E93",      // Taupe Grey
        },
      },
      fontFamily: {
        display: ['var(--font-serif)'],
        mono: ['var(--font-mono)'],
      },
    },
  },
  plugins: [],
};
export default config;