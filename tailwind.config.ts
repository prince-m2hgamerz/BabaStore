import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
import tailwindAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "#171717",
        primary: {
          DEFAULT: "#171717",
          foreground: "#ffffff"
        },
        secondary: {
          DEFAULT: "#ffffff",
          foreground: "#171717"
        },
        muted: {
          DEFAULT: "#f5f5f5",
          foreground: "#888888"
        },
        accent: {
          DEFAULT: "#0070f3",
          foreground: "#ffffff"
        },
        destructive: {
          DEFAULT: "#ee0000",
          foreground: "#ffffff"
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#171717"
        },
        ink: "#171717",
        body: "#4d4d4d",
        mute: "#888888",
        hairline: "#ebebeb",
        "hairline-strong": "#a1a1a1",
        canvas: "#ffffff",
        "canvas-soft": "#fafafa",
        "canvas-soft-2": "#f5f5f5",
        link: "#0070f3",
        "link-deep": "#0761d1",
        "link-bg-soft": "#d3e5ff",
        success: "#0070f3",
        error: "#ee0000",
        "error-soft": "#f7d4d6",
        "error-deep": "#c50000",
        warning: "#f5a623",
        "warning-soft": "#ffefcf",
        "warning-deep": "#ab570a",
        violet: "#7928ca",
        "violet-soft": "#d8ccf1",
        "violet-deep": "#4c2889",
        cyan: "#50e3c2",
        "cyan-soft": "#aaffec",
        "cyan-deep": "#29bc9b",
        "highlight-pink": "#ff0080",
        "highlight-magenta": "#eb367f"
      },
      borderRadius: {
        none: "0px",
        xs: "4px",
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "pill-sm": "64px",
        pill: "100px",
        full: "9999px"
      },
      screens: {
        xs: "420px"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", ...defaultTheme.fontFamily.sans],
        mono: [
          "SFMono-Regular",
          "Roboto Mono",
          "JetBrains Mono",
          ...defaultTheme.fontFamily.mono
        ]
      },
      fontSize: {
        "display-xl": ["48px", { lineHeight: "48px", fontWeight: "600", letterSpacing: "-2.4px" }],
        "display-lg": ["32px", { lineHeight: "40px", fontWeight: "600", letterSpacing: "-1.28px" }],
        "display-md": ["24px", { lineHeight: "32px", fontWeight: "600", letterSpacing: "-0.96px" }],
        "display-sm": ["20px", { lineHeight: "28px", fontWeight: "600", letterSpacing: "-0.6px" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "20px", fontWeight: "400", letterSpacing: "-0.28px" }],
        "caption-mono": ["12px", { lineHeight: "16px", fontWeight: "400" }]
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(0, 0, 0, 0.08)",
        "level-1": "inset 0 0 0 1px rgba(0, 0, 0, 0.08)",
        "level-2":
          "0px 1px 1px rgba(0,0,0,0.03), 0px 2px 2px rgba(0,0,0,0.04), inset 0 0 0 1px rgba(0,0,0,0.08)",
        "level-3":
          "0px 2px 2px rgba(0,0,0,0.04), 0px 8px 8px -8px rgba(0,0,0,0.04), inset 0 0 0 1px rgba(0,0,0,0.08)",
        "level-4":
          "0px 2px 2px rgba(0,0,0,0.04), 0px 8px 16px -4px rgba(0,0,0,0.06), inset 0 0 0 1px rgba(0,0,0,0.08)",
        "level-5":
          "0px 1px 1px rgba(0,0,0,0.03), 0px 8px 16px -4px rgba(0,0,0,0.06), 0px 24px 32px -8px rgba(0,0,0,0.10), inset 0 0 0 1px rgba(0,0,0,0.08)",
        glass:
          "0px 1px 1px rgba(0, 0, 0, 0.03), 0px 2px 2px rgba(0, 0, 0, 0.04), inset 0 0 0 1px rgba(0, 0, 0, 0.08)",
        float:
          "0px 2px 2px rgba(0, 0, 0, 0.04), 0px 8px 16px -4px rgba(0, 0, 0, 0.06), inset 0 0 0 1px rgba(0, 0, 0, 0.08)"
      },
      backgroundImage: {
        "mesh-hero":
          "radial-gradient(circle at 16% 20%, rgba(0, 124, 240, 0.38), transparent 27%), radial-gradient(circle at 43% 10%, rgba(0, 223, 216, 0.28), transparent 25%), radial-gradient(circle at 68% 20%, rgba(121, 40, 202, 0.32), transparent 28%), radial-gradient(circle at 86% 34%, rgba(255, 0, 128, 0.24), transparent 24%), radial-gradient(circle at 60% 70%, rgba(249, 203, 40, 0.24), transparent 30%)"
      }
    }
  },
  plugins: [tailwindAnimate]
};

export default config;
