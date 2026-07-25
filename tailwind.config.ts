import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/data/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pb: {
          green: "#bcfd49", // Ana Renk: Fıstık Yeşili
          blue: "#0ea5e9", // Vurgu Rengi: Elektrik Mavisi
          dark: "#0f172a", // Koyu Arkaplan/Metin
          light: "#f8fafc" // Açık Arkaplan
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;
