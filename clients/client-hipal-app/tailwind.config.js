/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
    "./node_modules/shadcn-ui/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        Montserrat: ["Montserrat", "sans-serif"],
        playfair: ["var(--font-playfair)", "serif"],
      },
      colors: {
        primary: {
          DEFAULT: "var(--p)", 
          foreground: "hsl(var(--pf))",
        },
        "h-primary": {
          DEFAULT: "var(--h-p)",
          foreground: "var(--h-pf)",
          content: "var(--h-pc)",
        },
        "h-base": {
          100: "var(--h-b1)",
          200: "var(--h-b2)",
          300: "var(--h-b3)",
          content: "var(--h-bc)",
        },
        "h-secondary": {
          DEFAULT: "var(--h-s)",
          foreground: "var(--h-sf)",
          content: "var(--h-sc)",
        },
        "h-accent": {
          DEFAULT: "var(--h-a)",
          foreground: "var(--h-af)",
          content: "var(--h-ac)",
        },
        "h-neutral": {
          DEFAULT: "var(--h-n)",
          content: "var(--h-nc)",
        },
        "base-100": "hsl(var(--b1))",
        "primary-content": "var(--pc)",
        secondary: {
          DEFAULT: "var(--s)_",
          foreground: "hsl(var(--secondary-foreground))",
        },
        "secondary-content": "var(--sc)",
        accent: {
          DEFAULT: "var(--a)",
          foreground: "hsl(var(--accent-foreground))",
        },
        "accent-content": "var(--ac)",
        neutral: "var(--n)",
        "neutral-content": "var(--nc)",
        "base-200": "var(--b2)",
        "base-300": "var(--b3)",
        "base-content": "var(--bc)",
        info: "#E6E6E6",
        success: "#2FBD4E",
        "success-content": "#fff",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      animation: {
        "border-beam": "border-beam calc(var(--duration)*1s) infinite linear",
      },
      keyframes: {
        "border-beam": {
          "0%": {
            "offset-distance": "0%",
          },
          "100%": {
            "offset-distance": "100%",
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  darkMode: ["class", "class"],
  plugins: [require("@tailwindcss/typography"), require("tailwindcss-animate")],
};
