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
        yellow:  "#FFE500",
        blue:    "#0047FF",
        red:     "#FF2E00",
        green:   "#00E061",
        "off-white": "#FAFAFA",
        "off-black": "#0A0A0A",
        "mid-gray":  "#1A1A1A",
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body:    ["Inter", "sans-serif"],
        mono:    ["IBM Plex Mono", "monospace"],
      },
      fontSize: {
        "display-xl": ["clamp(3.5rem, 10vw, 9rem)", { lineHeight: "1", letterSpacing: "-0.03em" }],
        "display-lg": ["clamp(2.5rem, 7vw, 6rem)",  { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display-md": ["clamp(1.8rem, 4vw, 3.5rem)", { lineHeight: "1.1" }],
      },
      borderWidth: {
        "3": "3px",
        "5": "5px",
        "6": "6px",
      },
      boxShadow: {
        "brut-sm": "4px 4px 0px #0A0A0A",
        "brut-md": "6px 6px 0px #0A0A0A",
        "brut-lg": "8px 8px 0px #0A0A0A",
        "brut-xl": "12px 12px 0px #0A0A0A",
        "brut-2xl":"16px 16px 0px #0A0A0A",
        "brut-hover": "2px 2px 0px #0A0A0A",
        "brut-yellow-lg": "8px 8px 0px #FFE500",
        "brut-blue-lg":   "8px 8px 0px #0047FF",
      },
      animation: {
        "float-slow":   "float-slow 6s ease-in-out infinite",
        "float-medium": "float-medium 4.5s ease-in-out infinite",
        "marquee":      "marquee 25s linear infinite",
        "spin-slow":    "spin 12s linear infinite",
        "pulse-slow":   "pulse 4s ease-in-out infinite",
      },
      backgroundImage: {
        "grid-pattern": "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
      },
      backgroundSize: {
        "grid": "60px 60px",
      },
    },
  },
  plugins: [],
};

export default config;
