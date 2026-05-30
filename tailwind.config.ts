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
        // Warm earthy palette
        stone: {
          50: "#fafaf9",
          100: "#f5f5f4",
          200: "#e7e5e4",
          300: "#d6d3d1",
          400: "#a8a29e",
          500: "#78716c",
          600: "#57534e",
          700: "#44403c",
          800: "#292524",
          900: "#1c1917",
          950: "#0c0a09",
        },
        sand: {
          50: "#fdf8f0",
          100: "#faefd9",
          200: "#f4ddb0",
          300: "#edc57f",
          400: "#e4a84d",
          500: "#dc8f2a",
          600: "#c4741e",
          700: "#a35b1b",
          800: "#84491d",
          900: "#6c3c1a",
        },
        sage: {
          50: "#f4f7f4",
          100: "#e6ede5",
          200: "#cddbcc",
          300: "#a8c0a6",
          400: "#7da07a",
          500: "#5c8259",
          600: "#476947",
          700: "#395538",
          800: "#2f452e",
          900: "#273927",
        },
        clay: {
          50: "#fdf5f3",
          100: "#fce8e3",
          200: "#fad4cb",
          300: "#f5b3a4",
          400: "#ed856e",
          500: "#e2634a",
          600: "#cf4a30",
          700: "#ad3b25",
          800: "#8f3322",
          900: "#772f22",
        },
        cream: "#fdf6ec",
        parchment: "#f7edd8",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Georgia", "serif"],
        serif: ["Georgia", "Cambria", "serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
        "card-hover":
          "0 4px 12px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.06)",
        soft: "0 2px 8px rgba(120,100,80,0.08)",
      },
      backgroundImage: {
        "texture-paper":
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='4' height='4' fill='%23fdf6ec'/%3E%3Ccircle cx='1' cy='1' r='0.5' fill='%23e7e0d5' opacity='0.4'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
export default config;
