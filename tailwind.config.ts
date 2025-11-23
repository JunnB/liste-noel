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
        "noel-red": "#C9184A",
        "noel-green": "#2D5016",
        "noel-gold": "#F4E4C1",
        "noel-cream": "#FAFAF8",
        "noel-text": "#2C3E35",
        "noel-olive": "#6B8E23",
        "noel-pink": "#A23B72",
      },
      backgroundColor: {
        base: "#FAFAF8",
      },
    },
  },
  plugins: [],
};
export default config;
