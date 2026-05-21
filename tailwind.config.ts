import type { Config } from "tailwindcss";
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
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(0, 0, 0, 0.08)",
        glass:
          "0px 1px 1px rgba(0, 0, 0, 0.03), 0px 2px 2px rgba(0, 0, 0, 0.04), inset 0 0 0 1px rgba(0, 0, 0, 0.08)",
        float:
          "0px 2px 2px rgba(0, 0, 0, 0.04), 0px 8px 16px -4px rgba(0, 0, 0, 0.06), inset 0 0 0 1px rgba(0, 0, 0, 0.08)"
      },
      backgroundImage: {
        "store-radial":
          "radial-gradient(circle at 20% 8%, rgba(0, 124, 240, 0.18), transparent 28%), radial-gradient(circle at 58% 4%, rgba(121, 40, 202, 0.16), transparent 26%), radial-gradient(circle at 84% 10%, rgba(255, 77, 77, 0.16), transparent 25%), linear-gradient(180deg, #fafafa 0%, #ffffff 48%, #fafafa 100%)",
        "mesh-hero":
          "radial-gradient(circle at 16% 20%, rgba(0, 124, 240, 0.38), transparent 27%), radial-gradient(circle at 43% 10%, rgba(0, 223, 216, 0.28), transparent 25%), radial-gradient(circle at 68% 20%, rgba(121, 40, 202, 0.32), transparent 28%), radial-gradient(circle at 86% 34%, rgba(255, 0, 128, 0.24), transparent 24%), radial-gradient(circle at 60% 70%, rgba(249, 203, 40, 0.24), transparent 30%)"
      }
    }
  },
  plugins: [tailwindAnimate]
};

export default config;
