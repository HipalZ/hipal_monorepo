/* eslint-disable no-undef */
/** @type {import('tailwindcss').Config} */
import flowbitePlugin from "flowbite/plugin";

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./public/**/*.html",
    "./node_modules/flowbite/**/*.js",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "custom-gradient":
          "linear-gradient(90deg, #1877F2 7.62%, #8C63FF 159.52%)",
      },
      fontFamily: {
        sans: ["var(--font-ubuntu)"],
        serif: ["Georgia", "serif"],
        fraunces: ["Fraunces", "Georgia", "serif"],
        inter: ["Inter", "system-ui", "sans-serif"],
        mono: ["Menlo", "monospace"],
        poppins: ["Poppins", "sans-serif"],
        roboto: ["Roboto", "sans-serif"],
        opensans: ["Open Sans", "sans-serif"],
        montserrat: ["Montserrat", "sans-serif"],
        playfair: ["Playfair Display", "serif"],
        lato: ["Lato", "sans-serif"],
        oswald: ["Oswald", "sans-serif"],
        merriweather: ["Merriweather", "serif"],
		cormorant: ["Cormorant Garamond", "serif"],
        cinzel: ["Cinzel", "serif"],
        parisienne: ["Parisienne", "cursive"],
        baskerville: ["Libre Baskerville", "serif"],
        garamond: ["EB Garamond", "serif"],
        greatvibes: ["Great Vibes", "cursive"],
      },
      colors: {
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        "base-100": "var(--b1)",
        "primary-content": "var(--pc)",
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        "secondary-content": "var(--sc)",
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
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
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        shine: "shine var(--duration) infinite linear",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      keyframes: {
        shine: {
          "0%": {
            "background-position": "0% 0%",
          },
          "50%": {
            "background-position": "100% 100%",
          },
          to: {
            "background-position": "0% 0%",
          },
        },
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
    },
  },

  plugins: [flowbitePlugin, require("tailwindcss-animate")],
};
