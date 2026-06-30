import type { Config } from "tailwindcss";

/**
 * Design tokens mapped 1:1 from README.md ("Design Tokens" section).
 * Treat these values as binding — they come from the hi-fi prototype
 * (REALS.dc.html) and should not be adjusted without checking the
 * prototype first.
 */
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        terracotta: {
          DEFAULT: "#C8553D", // primary / brand
          hover: "#A8432E",
          dark: "#9e3f2c",
        },
        bottle: {
          DEFAULT: "#3F5142", // secondary — trust strip, "uczciwa cena"
        },
        sage: {
          DEFAULT: "#5E7A60", // accent — commute tags
          deep: "#2E7D4F", // "below market" verdict
        },
        bg: {
          app: "#FBF6EE", // main app background (cream)
          canvas: "#EFE7DA", // body/canvas background outside shell
        },
        ink: {
          DEFAULT: "#33271D", // primary text — headings, prices
          secondary: "#5c4d3f", // labels, nav
          muted: "#7a6c5d",
          faint: "#a8957f",
          placeholder: "#b09a86",
        },
        line: {
          DEFAULT: "#ede1d2",
          soft: "#f3ece2",
          strong: "#e3d4c2",
        },
        chip: {
          warm: "#f3ece2",
          terracotta: "#f3ddd4",
          sage: "#e7ede4",
          gold: "#f5e7cc",
        },
        card: "#ffffff",
      },
      fontFamily: {
        display: ["var(--font-bricolage)", "sans-serif"], // headings, prices, big numbers
        sans: ["var(--font-hanken)", "sans-serif"], // default UI/body font
        mono: ["var(--font-space-mono)", "monospace"], // technical labels (e.g. "TRÓJMIASTO")
      },
      letterSpacing: {
        heading: "-0.6px",
      },
      borderRadius: {
        pill: "999px", // pills, chips, buttons
        card: "22px", // hero/offer cards (22-24px range)
        "card-lg": "24px",
        phone: "42px", // phone frame
        sm: "14px", // smaller cards (14-18px range)
        md: "18px",
      },
      boxShadow: {
        card: "0 14px 34px -22px rgba(80,50,40,.5)",
        hero: "0 40px 80px -34px rgba(80,50,40,.65)",
        phone: "0 40px 90px -40px rgba(40,30,22,.7)",
      },
      backgroundColor: {
        overlay: "rgba(40,30,22,.5)",
      },
      spacing: {
        "space-1": "6px",
        "space-2": "8px",
        "space-3": "10px",
        "space-4": "12px",
        "space-5": "14px",
        "space-6": "18px",
        "space-7": "22px",
        "space-8": "30px",
        "space-9": "38px",
      },
      fontSize: {
        "hero-h1": ["50px", { lineHeight: "1.05", fontWeight: "800" }],
        "section-h2": ["30px", { lineHeight: "1.1", fontWeight: "700" }],
        "trust-number": ["34px", { lineHeight: "1", fontWeight: "700" }],
        "card-price": ["20px", { lineHeight: "1.2", fontWeight: "700" }],
        "body-lead": ["17px", { lineHeight: "1.55", fontWeight: "400" }],
        "badge-mono": ["10px", { lineHeight: "1.2", fontWeight: "700" }],
      },
      keyframes: {
        "rl-fade": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "rl-slide": {
          "0%": { opacity: "0", transform: "translateX(40px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "rl-pop": {
          "0%": { opacity: "0", transform: "scale(.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "rl-typ": {
          "0%, 60%, 100%": { opacity: "0.3" },
          "30%": { opacity: "1" },
        },
      },
      animation: {
        "rl-fade": "rl-fade .4s cubic-bezier(.22,1,.36,1) both",
        "rl-slide": "rl-slide .4s cubic-bezier(.22,1,.36,1) both",
        "rl-pop": "rl-pop .3s cubic-bezier(.22,1,.36,1) both",
        "rl-typ": "rl-typ 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
