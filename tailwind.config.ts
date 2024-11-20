import { nextui } from "@nextui-org/react";
import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        phone: "200px",
        desktop: "800px",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      keyframes: {
        growWidth: {
          "0%": { maxWidth: "0" },
          "100%": { maxWidth: "100vw" },
        },
        growHeight: {
          "0%": { maxHeight: "0" },
          "100%": { maxHeight: "100vh" },
        },
        shrinkWidth: {
          "0%": { maxWidth: "100vw" },
          "100%": { maxWidth: "0" },
        },
        shrinkHeight: {
          "0%": { maxHeight: "100vh" },
          "100%": { maxHeight: "0" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        growWidth: "growWidth 0.85s ease-in-out",
        growHeight: "growHeight 0.85s ease-in-out",
        shrinkWidth: "shrinkWidth 0.85s ease-in-out",
        shrinkHeight: "shrinkHeight 0.85s ease-in-out",
        fadeUp: "fadeUp 0.85s ease-in-out",
      },
    },
  },
  darkMode: "class",
  plugins: [nextui()],
} satisfies Config;
